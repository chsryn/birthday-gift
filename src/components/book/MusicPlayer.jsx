import { useState, useEffect, useRef } from "react";
import { getAudio } from "../../audio";

// Drop another file into public/audios and add one line here to grow the playlist.
// TRACKS[0] must stay the same file the intro plays (see INTRO_AUDIO in
// TypewriterSequence) or the book stage will restart the song instead of
// adopting it.
const TRACKS = [
  { src: "/audios/midnight-rain-x-daylight.mp3" },
  { src: "/audios/your-background-music.mp3" },
];

const formatTime = (time) =>
  `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;

// className lets BookScreen fade the whole player out for screenshot mode.
// It stays mounted on purpose: the <audio> element is shared and app-wide, so
// unmounting would be pointless anyway, and keeping it mounted preserves the
// track index and seek position exactly.
export const MusicPlayer = ({ className = "" }) => {
  // Seeded from the shared element instead of corrected in an effect: this
  // component mounts long after the intro started the song, so the element is
  // usually already mid-playback and its play/pause events already fired.
  // Later track changes arrive through the listeners below.
  const [track, setTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => {
    const a = getAudio(TRACKS[0].src);
    return !a.paused && !a.ended;
  });
  const [currentTime, setCurrentTime] = useState(() =>
    getAudio(TRACKS[0].src).currentTime || 0,
  );
  const [duration, setDuration] = useState(() => {
    const d = getAudio(TRACKS[0].src).duration;
    return Number.isFinite(d) ? d : 0;
  });
  const [volume, setVolume] = useState(0.8);
  const [isHovered, setIsHovered] = useState(false);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  // The effect below swaps the shared <audio> to a new track, and a swapped
  // element always comes back paused. This ref carries "should it be playing?"
  // across the swap so auto-advance and next/prev keep the music going.
  const resumeRef = useRef(false);

  useEffect(() => {
    // Shared element, not a new one: the intro already started this song, so
    // building a private <audio> here would play the same file over itself.
    // getAudio() is a no-op when the src is unchanged, which is the common
    // case — the intro's song is already TRACKS[0] and keeps its position.
    const audio = getAudio(TRACKS[track].src);
    audio.preload = "metadata";
    audio.loop = TRACKS.length === 1;
    audio.volume = volume;
    audioRef.current = audio;

    const onLoaded = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      resumeRef.current = true;
      setTrack((t) => (t + 1) % TRACKS.length);
    };
    // Source of truth for the button icon: the element, not manual bookkeeping.
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    if (resumeRef.current) {
      resumeRef.current = false;
      audio.play().catch(() => setIsPlaying(false));
    }

    // No audio.pause() here: swapping tracks re-points src, which stops the old
    // track on its own, and pausing on unmount would cut the intro's song.
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
    // NOTE: the element is shared and must not be torn down here — pausing it
    // would silence the intro's song when this component unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  };

  const skip = (delta) => {
    resumeRef.current = isPlaying;
    setTrack((t) => (t + delta + TRACKS.length) % TRACKS.length);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (!audio || !rect.width) return;
    const newTime = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    ) * duration;
    if (Number.isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const panelOpen = isPlaying || isHovered;

  return (
    <div
      className={`fixed top-5 right-5 z-20 flex flex-col items-end gap-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => skip(-1)}
          disabled={TRACKS.length < 2}
          aria-label="Previous track"
          className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7v14zM4 5v14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="bg-white/10 backdrop-blur-md p-4 rounded-full hover:bg-white/20 transition-all duration-300"
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 9v6m4-6v6"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 010-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => skip(1)}
          disabled={TRACKS.length < 2}
          aria-label="Next track"
          className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7V5zM20 5v14"
            />
          </svg>
        </button>
      </div>

      {/* Panel – only visible when playing or hovering */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          panelOpen ? "w-[200px] opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl">
          <button
            type="button"
            ref={progressBarRef}
            onClick={handleSeek}
            aria-label="Seek"
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative block"
          >
            <span
              className="absolute top-0 left-0 h-full bg-white/60 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </button>

          <div className="flex justify-between w-full text-white/80 text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white/80 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="w-full accent-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};