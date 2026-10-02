import { useState, useRef, useEffect, useMemo } from "react";
import gsap from "gsap";
import Keypad, { PASSCODE } from "./Keypad";

// Stickers
import amazedSparkle from "../assets/stickers/amazed-sparkle.gif";
import thinking from "../assets/stickers/thinking.gif";
import sad from "../assets/stickers/sad.gif";
import cry from "../assets/stickers/cry.gif";
import mayaowl from "../assets/stickers/myaowl.gif";
import { getAudio, playFromStart } from "../audio";

const INTRO_AUDIO = "/audios/midnight-rain-x-daylight.mp3";
const INTRO_BEAT_MS = 4000;

function HeadingContainer({
  containerRef,
  hRef,
  text,
  style,
  visible = false,
}) {
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center px-4"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <h1
        ref={hRef}
        className="w-full max-w-3xl mx-auto text-center font-bold leading-tight"
        style={style}
      >
        {text}
      </h1>
    </div>
  );
}

const generateBlobs = (count) =>
  Array.from({ length: count }, (_, i) => ({
    size: 80 + Math.random() * 200,
    top: Math.random() * 100,
    left: Math.random() * 100,
    borderRadius: `
      ${30 + Math.random() * 40}% ${50 + Math.random() * 30}%
      ${40 + Math.random() * 40}% ${50 + Math.random() * 30}% /
      ${40 + Math.random() * 20}% ${30 + Math.random() * 40}%
      ${50 + Math.random() * 30}% ${40 + Math.random() * 40}%
    `,
    id: i,
  }));

export default function TypewriterSequence({ refs, onSuccess, onIntroEnd }) {
  const {
    mainRef,
    heading1ContainerRef,
    heading1Ref,
    heading2ContainerRef,
    heading2Ref,
    heading3ContainerRef,
    heading3Ref,
    heading4ContainerRef,
    heading4Ref,
    overlayRef,
    leftPanelRef,
    rightPanelRef,
    keypadRef,
    leftContentRef,
  } = refs;

  const headingStyle = {
    fontFamily: "'Playfair Display', serif",
    color: "#FF0000",
    fontSize: "clamp(1.2rem, 5vw, 5rem)",
    lineHeight: 1.25,
    fontFeatureSettings: '"liga" 0',
    fontVariantLigatures: "none",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  };

  // ---------- State ----------
  const [wrongPassword, setWrongPassword] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [keypadKey, setKeypadKey] = useState(0);

  const [isSuccess, setIsSuccess] = useState(false);
  const [blobsDone, setBlobsDone] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [isSkippingIntro, setIsSkippingIntro] = useState(false);

  const failOverlayRef = useRef(null);
  const entranceCompleteRef = useRef(false);
  const blobContainerRef = useRef(null);
  const blobRefs = useRef([]);
  const blobs = useMemo(() => generateBlobs(20), []);

  const redPanelContent = useMemo(() => {
    if (failCount === 0)
      return {
        sticker: amazedSparkle,
        text: "masukin kodenya yaa!",
      };
    if (failCount === 1)
      return {
        sticker: thinking,
        text: "Kok salah masukin kodenya.\npadahal itu ulang tahunmu loh!",
      };
    if (failCount === 2)
      return {
        sticker: sad,
        text: "Coba lagi ituin kodenya deh\nsekali.",
      };
    return {
      sticker: cry,
      text: "Kamu siapa haa! bukan miss pipi ya?",
    };
  }, [failCount]);

  // --- Fail overlay entrance ---
  useEffect(() => {
    if (wrongPassword && failOverlayRef.current) {
      entranceCompleteRef.current = false;
      gsap.fromTo(
        failOverlayRef.current,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            entranceCompleteRef.current = true;
            setFailCount((prev) => prev + 1);
          },
        },
      );
    }
  }, [wrongPassword]);

  // --- Blob spread ---
  useEffect(() => {
    if (isSuccess && blobContainerRef.current) {
      const els = blobRefs.current.filter(Boolean);
      gsap.set(els, { scale: 0, opacity: 1 });
      gsap.to(els, {
        scale: 5,
        duration: 2.8,
        stagger: { each: 0.12, from: "random" },
        ease: "power3.inOut",
        onComplete: () => setBlobsDone(true),
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (!blobsDone) return;
    if (onSuccess) onSuccess();
  }, [blobsDone, onSuccess]);

  // --- Play pressed ---
  useEffect(() => {
    if (!musicStarted) return;

    playFromStart(getAudio(INTRO_AUDIO));

    const beat = setTimeout(() => {
      if (onIntroEnd) onIntroEnd();
    }, INTRO_BEAT_MS);

    return () => clearTimeout(beat);
  }, [musicStarted, onIntroEnd]);

  // --- Password submit ---
  const handlePasswordSubmit = (password) => {
    if (password === PASSCODE) {
      setIsSkippingIntro(true);
      setIsSuccess(true);
    } else {
      setWrongPassword(true);
    }
  };

  // --- Try again ---
  const handleTryAgain = () => {
    if (!failOverlayRef.current || !entranceCompleteRef.current) return;
    gsap.to(failOverlayRef.current, {
      scaleY: 0,
      transformOrigin: "bottom",
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        setWrongPassword(false);
        setKeypadKey((prev) => prev + 1);
        entranceCompleteRef.current = false;
      },
    });
  };

  return (
    <>
      {/* ---- Typewriter ---- */}
      <div
        ref={mainRef}
        className="h-dvh relative opacity-0 z-10 overflow-hidden"
      >
        <HeadingContainer
          containerRef={heading1ContainerRef}
          hRef={heading1Ref}
          text="Some might find their way here…"
          style={headingStyle}
          visible
        />
        <HeadingContainer
          containerRef={heading2ContainerRef}
          hRef={heading2Ref}
          text="But this wasn’t made for everyone."
          style={headingStyle}
        />
        <HeadingContainer
          containerRef={heading3ContainerRef}
          hRef={heading3Ref}
          text="Only one person can open this gift…"
          style={headingStyle}
        />
        <HeadingContainer
          containerRef={heading4ContainerRef}
          hRef={heading4Ref}
          text="And she knows who she is......"
          style={headingStyle}
        />
      </div>

      {/* ---- Panels ---- */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 opacity-0 pointer-events-none"
      >
        {/* Left panel – Kiri (Red Panel) */}
        <div
          ref={leftPanelRef}
          className="absolute left-0 top-0 h-full w-1/2 flex items-center justify-center overflow-y-auto min-h-0 py-4 px-2"
          style={{ backgroundColor: "#FF0000" }}
        >
          <div
            ref={leftContentRef}
            className="flex flex-col items-center justify-center gap-2 sm:gap-4 opacity-0 scale-0 px-2 my-auto w-full max-w-sm"
          >
            {/* Stiker menyesuaikan ukuran di mobile landscape (landscape:w-28, landscape:h-28) */}
            <img
              src={redPanelContent.sticker}
              alt=""
              className="w-32 h-32 sm:w-64 sm:h-64 landscape:w-24 landscape:h-24 landscape:sm:w-44 landscape:sm:h-44 max-h-[35vh] object-contain drop-shadow-lg transition-all"
            />
            <p
              className="text-white text-center font-medium leading-tight whitespace-pre-line"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(0.75rem, 2vw, 1.2rem)",
                letterSpacing: "0.02em",
              }}
            >
              {redPanelContent.text}
            </p>
          </div>
        </div>

        {/* Right panel – Kanan (Keypad) */}
        <div
          ref={rightPanelRef}
          className="absolute right-0 top-0 h-full w-1/2 flex items-center justify-center p-2 sm:p-4 overflow-y-auto min-h-0 py-4"
          style={{ backgroundColor: "#FFFDD0" }}
        >
          <div
            ref={keypadRef}
            className="opacity-0 scale-0 my-auto w-full flex justify-center"
          >
            <Keypad key={keypadKey} onSubmit={handlePasswordSubmit} />
          </div>
        </div>
      </div>

      {/* ---- Skip intro ---- */}
      {!refs.introFinished && (
        <button
          type="button"
          onClick={() => {
            setIsSkippingIntro(true);
            refs.skipToCode();
          }}
          onTransitionEnd={(e) => {
            if (isSkippingIntro && e.propertyName === "opacity") {
              refs.finishIntro();
            }
          }}
          className={`fixed bottom-4 right-4 z-[100] flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium pointer-events-auto cursor-pointer transition-opacity duration-[120ms] ease-out ${isSkippingIntro ? "opacity-0 pointer-events-none" : "opacity-60 hover:opacity-100"
            }`}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: "#FF0000",
            background: "rgba(255,253,208,0.3)",
            border: "1px solid rgba(255,0,0,0.25)",
            backdropFilter: "blur(6px)",
            letterSpacing: "0.04em",
          }}
        >
          Lewati Intro
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* ---- Fail overlay ---- */}
      {wrongPassword && (
        <div
          ref={failOverlayRef}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 sm:gap-6 px-4 py-4 overflow-y-auto"
          style={{
            backgroundColor: "#FFFDD0",
            fontFamily: "'Montserrat', sans-serif",
            transformOrigin: "bottom",
          }}
        >
          <img
            src={mayaowl}
            alt="Maya owl"
            className="w-32 h-32 sm:w-64 sm:h-64 landscape:w-28 landscape:h-28 max-h-[35vh] object-contain"
          />
          <p
            className="text-center text-red-600 font-semibold leading-snug"
            style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.5rem)" }}
          >
            Kamu salah masukin kodenya!
          </p>
          <button
            onClick={handleTryAgain}
            className="px-6 py-2 sm:px-8 sm:py-3 rounded-full font-semibold text-white shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "#FF0000",
              fontSize: "clamp(0.85rem, 2vw, 1.2rem)",
            }}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* ---- Blobs (virus) ---- */}
      {isSuccess && (
        <div
          ref={blobContainerRef}
          className="absolute inset-0 z-50 overflow-hidden"
          style={{ backgroundColor: "transparent" }}
        >
          {blobs.map((blob) => (
            <div
              key={blob.id}
              ref={(el) => (blobRefs.current[blob.id] = el)}
              className="absolute"
              style={{
                width: `${blob.size}px`,
                height: `${blob.size}px`,
                top: `${blob.top}%`,
                left: `${blob.left}%`,
                backgroundColor: "#000000",
                borderRadius: blob.borderRadius,
                transformOrigin: "center center",
                transform: "scale(0)",
                willChange: "transform",
              }}
            />
          ))}
        </div>
      )}

      {/* ---- Play button ---- */}
      {blobsDone && !musicStarted && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center">
          {/* Floating music notes */}
          <span
            className="absolute animate-float-note-1 select-none pointer-events-none"
            style={{ top: "28%", left: "18%", fontSize: "clamp(1.2rem,3vw,2rem)", opacity: 0.25 }}
          >♪</span>
          <span
            className="absolute animate-float-note-2 select-none pointer-events-none"
            style={{ top: "22%", right: "20%", fontSize: "clamp(1rem,2.5vw,1.6rem)", opacity: 0.2 }}
          >♫</span>
          <span
            className="absolute animate-float-note-3 select-none pointer-events-none"
            style={{ bottom: "30%", left: "22%", fontSize: "clamp(0.9rem,2vw,1.4rem)", opacity: 0.18 }}
          >♩</span>
          <span
            className="absolute animate-float-note-1 select-none pointer-events-none"
            style={{ bottom: "26%", right: "18%", fontSize: "clamp(1rem,2.5vw,1.6rem)", opacity: 0.22, animationDelay: "1.2s" }}
          >♬</span>

          <button
            onClick={() => setMusicStarted(true)}
            aria-label="Play music"
            className="animate-play-entrance group relative flex flex-col items-center gap-5"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {/* Play circle with pulse rings */}
            <div className="relative flex items-center justify-center">
              {/* Pulse rings */}
              <span
                className="animate-pulse-ring absolute rounded-full"
                style={{
                  width: "clamp(5rem,14vw,7rem)",
                  height: "clamp(5rem,14vw,7rem)",
                  border: "1.5px solid rgba(255,255,255,0.4)",
                }}
              />
              <span
                className="animate-pulse-ring-delay absolute rounded-full"
                style={{
                  width: "clamp(5rem,14vw,7rem)",
                  height: "clamp(5rem,14vw,7rem)",
                  border: "1.5px solid rgba(255,255,255,0.25)",
                }}
              />

              {/* Main circle button */}
              <span
                className="relative flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                style={{
                  width: "clamp(4.5rem,13vw,6.5rem)",
                  height: "clamp(4.5rem,13vw,6.5rem)",
                  background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), rgba(255,255,255,0.05))",
                  border: "1px solid rgba(255,255,255,0.3)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                {/* Play icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  style={{ width: "clamp(1.3rem,3.5vw,2rem)", marginLeft: "0.15em" }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>

            {/* Shimmer label */}
            <span
              className="animate-shimmer uppercase text-[11px] sm:text-xs font-semibold"
              style={{ letterSpacing: "0.4em" }}
            >
              Tap to Play
            </span>
          </button>
        </div>
      )}
    </>
  );
}
