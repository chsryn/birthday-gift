import { useRef, useState } from "react";
import gsap from "gsap";

export default function useTypewriterTimeline() {
  const mainRef = useRef(null);
  const heading1ContainerRef = useRef(null);
  const heading1Ref = useRef(null);
  const heading2ContainerRef = useRef(null);
  const heading2Ref = useRef(null);
  const heading3ContainerRef = useRef(null);
  const heading3Ref = useRef(null);
  const heading4ContainerRef = useRef(null);
  const heading4Ref = useRef(null);
  const overlayRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const keypadRef = useRef(null);
  const leftContentRef = useRef(null);
  const mainRevealed = useRef(false);
  const timelineRef = useRef(null);
  const skipStartedRef = useRef(false);

  // The intro is over once either path below reveals the code panel. Kept here
  // rather than in the component because this hook is what owns both paths,
  // and "the skip button stayed on screen" came from the component only
  // knowing about the click, never about the intro playing to the end.
  const [introFinished, setIntroFinished] = useState(false);
  const finishIntro = () => setIntroFinished(true);

  const texts = [
    "Some might find their way here…",
    "But this wasn’t made for everyone.",
    "Only one person can open this gift…",
    "And she knows who she is......",
  ];

  const revealMainContent = () => {
    if (mainRevealed.current || !mainRef.current) return;
    mainRevealed.current = true;

    const containers = [
      heading1ContainerRef.current,
      heading2ContainerRef.current,
      heading3ContainerRef.current,
      heading4ContainerRef.current,
    ];
    const headings = [
      heading1Ref.current,
      heading2Ref.current,
      heading3Ref.current,
      heading4Ref.current,
    ];

    const allChars = texts.map((text, i) => {
      const h = headings[i];
      if (!h) return [];
      h.innerHTML = "";
      return text.split("").map((char) => {
        const span = document.createElement("span");
        span.textContent = char;
        if (char === " ") span.style.whiteSpace = "pre";
        span.style.opacity = 0;
        h.appendChild(span);
        return span;
      });
    });

    const tl = gsap.timeline();
    timelineRef.current = tl;
    tl.set(mainRef.current, { opacity: 1, y: 0 });

    tl.to(allChars[0], {
      opacity: 1,
      duration: 0.2,
      stagger: 0.15,
      ease: "power2.out",
    });

    for (let i = 0; i < texts.length - 1; i++) {
      tl.to(
        containers[i],
        { opacity: 0, duration: 2, ease: "power2.inOut" },
        "+=0.3",
      );
      tl.set(containers[i + 1], { opacity: 1 });
      tl.to(
        allChars[i + 1],
        {
          opacity: 1,
          duration: 0.2,
          stagger: 0.15,
          ease: "power2.out",
        },
        "-=0.2",
      );
    }

    tl.to({}, { duration: 2 });
    tl.to(heading4ContainerRef.current, {
      y: -60,
      opacity: 0,
      duration: 3.8,
      ease: "power2.out",
    });

    tl.call(() => setIntroFinished(true));

    // Panels appear
    tl.set(overlayRef.current, { opacity: 1, pointerEvents: "auto" });
    tl.set(leftPanelRef.current, { scaleY: 0, transformOrigin: "bottom" });
    tl.set(rightPanelRef.current, { scaleY: 0, transformOrigin: "top" });
    tl.to(leftPanelRef.current, {
      scaleY: 1,
      duration: 1.8,
      ease: "power3.inOut",
    });
    tl.to(
      rightPanelRef.current,
      { scaleY: 1, duration: 1.8, ease: "power3.inOut" },
      "<",
    );

    // Tiny pause after panels reach full height
    tl.to({}, { duration: 0.2 });

    // Bounce in both panel contents simultaneously
    tl.fromTo(
      leftContentRef.current,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      },
    );
    tl.fromTo(
      keypadRef.current,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.7)",
      },
      "<", // starts at the same time as the left content bounce
    );
  };

  // Transition quickly to the code screen while keeping the passcode required.
  const skipToCode = () => {
    if (!mainRef.current || skipStartedRef.current) return;
    skipStartedRef.current = true;
    mainRevealed.current = true;

    // Note: setIntroFinished(true) is NOT called here intentionally.
    // The skip button fades out via CSS transition in the component, and
    // onTransitionEnd calls finishIntro() to unmount it cleanly.
    const hadIntroTimeline = Boolean(timelineRef.current);
    timelineRef.current?.kill();
    timelineRef.current = null;

    const headingEls = [
      heading1Ref.current,
      heading2Ref.current,
      heading3Ref.current,
      heading4Ref.current,
    ].filter(Boolean);
    gsap.killTweensOf(headingEls);

    // Hide all heading containers so the half-typed text never flashes.
    const containers = [
      heading1ContainerRef.current,
      heading2ContainerRef.current,
      heading3ContainerRef.current,
      heading4ContainerRef.current,
    ].filter(Boolean);
    const animatedEls = [
      ...containers,
      mainRef.current,
      overlayRef.current,
      leftPanelRef.current,
      rightPanelRef.current,
      leftContentRef.current,
      keypadRef.current,
    ].filter(Boolean);
    gsap.killTweensOf([...headingEls, ...animatedEls]);

    if (!hadIntroTimeline) {
      gsap.set(mainRef.current, { opacity: 1, y: 0 });
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(leftPanelRef.current, {
        scaleY: 0,
        transformOrigin: "bottom",
      });
      gsap.set(rightPanelRef.current, {
        scaleY: 0,
        transformOrigin: "top",
      });
      gsap.set(leftContentRef.current, { opacity: 0, scale: 0 });
      gsap.set(keypadRef.current, { opacity: 0, scale: 0 });
    }

    gsap.set(overlayRef.current, { pointerEvents: "auto" });
    const skipTimeline = gsap.timeline({
      onComplete: () => {
        headingEls.forEach((heading) => {
          heading.innerHTML = "";
        });
      },
    });
    skipTimeline
      .to(
        containers,
        { opacity: 0, y: -20, duration: 0.25, ease: "power2.in" },
        0,
      )
      .to(mainRef.current, { opacity: 0, duration: 0.3 }, 0)
      .to(overlayRef.current, { opacity: 1, duration: 0.3 }, 0)
      .to(
        leftPanelRef.current,
        { scaleY: 1, duration: 0.5, ease: "power2.out" },
        0,
      )
      .to(
        rightPanelRef.current,
        { scaleY: 1, duration: 0.5, ease: "power2.out" },
        0,
      )
      .to(
        leftContentRef.current,
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" },
        0.15,
      )
      .to(
        keypadRef.current,
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" },
        0.15,
      );
  };

  return {
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
    revealMainContent,
    skipToCode,
    finishIntro,
    introFinished,
  };
}
