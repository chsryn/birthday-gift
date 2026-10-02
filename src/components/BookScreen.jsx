import { Suspense, useState, useEffect, useRef } from "react";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { pages } from "./book/pages";

import { Experience } from "./book/Experience";
import { MusicPlayer } from "./book/MusicPlayer";

export default function BookScreen() {
  const [page, setPageRaw] = useState(0);
  const [isCleanView, setIsCleanView] = useState(false);
  const debounceRef = useRef(null);

  // Debounce page changes: jika user spam klik, hanya proses
  // perubahan terakhir setelah 80ms idle — mencegah antrian
  // transisi yang bertumpuk dan membuat kertas hang.
  const setPage = (next) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setPageRaw(next), 80);
  };

  // NOTE: Clean View only hides the UI — music continues uninterrupted.

  // Page-flip click sound
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    new Audio("/audios/page-flip-01a.mp3").play().catch(() => { });
  }, [page]);

  return (
    <>
      <MusicPlayer
        className={`transition-opacity duration-300 ${isCleanView ? "opacity-0 pointer-events-none" : "opacity-100"
          } scale-75 origin-top-right landscape:scale-75`}
      />

      <main
        className="pointer-events-none select-none z-10 fixed inset-0 flex justify-end flex-col"
        style={{
          opacity: isCleanView ? 0 : 1,
          transition: "opacity 300ms ease",
        }}
      >
        <div className="w-full overflow-x-auto no-scrollbar pointer-events-auto flex justify-center">
          <div className="flex items-center gap-2 sm:gap-3 max-w-full p-3 sm:p-5">
            {[...pages].map((_, index) => (
              <button
                key={index}
                type="button"
                className={`border-transparent hover:border-white transition-all duration-300 px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs sm:text-lg uppercase shrink-0 border ${index === page
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
                  }`}
                onClick={() => setPage(index)}
              >
                {index === 0 ? "Cover" : `Page ${index}`}
              </button>
            ))}
            <button
              type="button"
              className={`border-transparent hover:border-white transition-all duration-300 px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs sm:text-lg uppercase shrink-0 border ${page === pages.length
                ? "bg-white/90 text-black"
                : "bg-black/30 text-white"
                }`}
              onClick={() => setPage(pages.length)}
            >
              Back Cover
            </button>
          </div>
        </div>
      </main>

      {/* Background Image Overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/background-image.jpg)",
          filter: "blur(10px) brightness(0.4)",
        }}
      />

      {/* Clean View Toggle Button */}
      <button
        type="button"
        className="fixed top-5 left-5 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all duration-300 cursor-pointer"
        onClick={() => setIsCleanView((v) => !v)}
        aria-label={
          isCleanView ? "Show interface" : "Hide interface for screenshots"
        }
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <span
          className="flex items-center justify-center w-full h-full rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          {isCleanView ? (
            <LuEyeOff className="w-5 h-5 text-white" />
          ) : (
            <LuEye className="w-5 h-5 text-white" />
          )}
        </span>
      </button>

      <Loader containerStyles={{ background: "#000" }} />

      <Canvas
        shadows
        camera={{ position: [-0.5, 1, 4], fov: 45 }}
        style={{ pointerEvents: "auto" }}
      >
        <Suspense fallback={null}>
          <Experience page={page} setPage={setPage} />
        </Suspense>
      </Canvas>
    </>
  );
}
