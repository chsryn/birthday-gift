import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import useTypewriterTimeline from "./hooks/useTypewriterTimeline";
import Background from "./components/Background";
import TypewriterSequence from "./components/TypewriterSequence";
import RotationHint from "./components/RotationHint";
import NotePopup from "./components/NotePopup";
import BookScreen from "./components/BookScreen";

export default function App() {
  const [isPhone, setIsPhone] = useState(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [backgroundGone, setBackgroundGone] = useState(false);

  // null = intro + music, "note" = 3D love letter, "book" = proposal book
  const [stage, setStage] = useState(null);

  const showHint = isPhone === true && !hintDismissed;
  const hintRef = useRef(null);
  const refs = useTypewriterTimeline();
  const { revealMainContent } = refs;

  // ---- Phone detection & hint (unchanged) ----
  useEffect(() => {
    const checkWidth = () => setIsPhone(window.innerWidth < 640);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    if (isPhone === false) revealMainContent();
  }, [isPhone, revealMainContent]);

  useEffect(() => {
    if (!showHint || !hintRef.current) return;
    const el = hintRef.current;
    gsap.set(el, { willChange: "transform, opacity" });
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { clearProps: "willChange" });
        setHintDismissed(true);
        revealMainContent();
      },
    });
    tl.fromTo(
      el,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 2.5, ease: "power2.out" },
    )
      .to(el, { opacity: 1, duration: 1.0 })
      .to(el, { opacity: 0, y: -5, duration: 2.0, ease: "power2.in" });
    return () => {
      tl.kill();
      gsap.set(el, { clearProps: "willChange" });
    };
  }, [showHint, revealMainContent]);

  const handleSuccess = () => setBackgroundGone(true);
  const handleIntroEnd = () => setStage("note");

  return (
    <div
      className="h-dvh relative overflow-hidden"
      style={{ backgroundColor: stage === null && !backgroundGone ? "#FFFDD0" : "#000000" }}
    >
      {!backgroundGone && <Background />}

      {stage === null && (
        <TypewriterSequence
          refs={refs}
          onSuccess={handleSuccess}
          onIntroEnd={handleIntroEnd}
        />
      )}

      {stage === "note" && (
        <NotePopup onClose={() => setStage("book")} />
      )}

      {stage === "book" && <BookScreen />}

      {isPhone === true && showHint && stage === null && (
        <RotationHint hintRef={hintRef} />
      )}
    </div>
  );
}