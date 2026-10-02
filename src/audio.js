/* One <audio> element for the whole app, owned by nothing.
   It has to outlive the intro: TypewriterSequence unmounts when the note
   opens, and MusicPlayer only mounts later in the book. A component-owned
   element would die at the first unmount, and two separate elements would
   play the same file over each other. Callers share this one instead. */
let element = null;
let loadedSrc = null;

export const DEFAULT_VOLUME = 0.8;

/* Returns the shared element, pointing it at src. If src is already loaded
   the element is left untouched — no reload, no lost playback position.
   That is what lets the book stage adopt the song the intro started. */
export const getAudio = (src) => {
  if (!element) element = new Audio();
  if (src && src !== loadedSrc) {
    element.src = src;
    loadedSrc = src;
  }
  return element;
};

/* Browsers only allow unmuted playback from a user gesture, so callers must
   start muted and drop the mute once frames actually start arriving. */
export const playFromStart = (audio) => {
  audio.pause();
  audio.currentTime = 0;
  audio.muted = true;
  const onPlaying = () => {
    audio.muted = false;
    audio.removeEventListener("playing", onPlaying);
  };
  audio.addEventListener("playing", onPlaying);
  return audio.play().catch(console.warn);
};