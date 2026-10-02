import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { Particles } from "./book/Particles";

/* ------------------------------------------------------------------
   Pesan & Doa Ulang Tahun (Hangat, Tulus, No-Bucin, Non-AI style)
------------------------------------------------------------------ */
const NOTE = {
  title: "Barakallah Fii Umrik",
  body: `Selamat ulang tahun Pipi!

Semoga di usiamu yang baru ini, setiap langkahmu senantiasa dilimpahi keberkahan, kesehatan, dan kedamaian hati.

Semoga segalanya dimudahkan—baik urusan rezeki, cita-cita, maupun impian besar yang sedang kamu perjuangkan.

Terima kasih sudah menjadi sosok yang selalu membawa kebaikan untuk orang-orang di sekitarmu.

Sehat dan bahagia selalu ya!`,
};

/* ------------------------------------------------------------------
   Konfigurasi Dimensi Kertas 3D & Kanvas Tekstur
------------------------------------------------------------------ */
const CARD_W = 1.28;
const CARD_H = 1.71;
const HALF_H = CARD_H / 2;

const PAPER_W = 1024;
const PAPER_H = 1400;
const TEXT_SIDE = 120;
const TEXT_MAX_W = PAPER_W - TEXT_SIDE * 2;
const TEXT_TOP = 410;
const TEXT_BOTTOM = 1180;

const PAPER_FILL = "#f6f0e4";

const wrapLines = (ctx, text, maxWidth) => {
  const out = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const test = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        out.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) out.push(line);
  }
  return out;
};

const paperTexture = (() => {
  const canvas = document.createElement("canvas");
  canvas.width = PAPER_W;
  canvas.height = PAPER_H;
  const ctx = canvas.getContext("2d");

  // Base paper colour — slightly warm
  ctx.fillStyle = PAPER_FILL;
  ctx.fillRect(0, 0, PAPER_W, PAPER_H);

  // Subtle grain / serat kertas
  for (let i = 0; i < 12000; i++) {
    ctx.fillStyle = `rgba(${100 + Math.random() * 40},${80 + Math.random() * 30},${50 + Math.random() * 20},${Math.random() * 0.055})`;
    ctx.fillRect(Math.random() * PAPER_W, Math.random() * PAPER_H, 1 + Math.random(), 1 + Math.random());
  }

  // Vignette tepi — memberikan kesan kertas nyata
  const vign = ctx.createRadialGradient(
    PAPER_W / 2, PAPER_H / 2, PAPER_H * 0.25,
    PAPER_W / 2, PAPER_H / 2, PAPER_H * 0.78
  );
  vign.addColorStop(0, "rgba(180,140,90,0)");
  vign.addColorStop(1, "rgba(140,100,60,0.18)");
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, PAPER_W, PAPER_H);

  // Bingkai ornamen ganda
  ctx.strokeStyle = "rgba(200,155,100,0.5)";
  ctx.lineWidth = 6;
  ctx.strokeRect(44, 44, PAPER_W - 88, PAPER_H - 88);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(66, 66, PAPER_W - 132, PAPER_H - 132);

  // Lipatan tengah kertas (fold crease) — bayangan halus di tengah
  const crease = ctx.createLinearGradient(0, PAPER_H / 2 - 8, 0, PAPER_H / 2 + 8);
  crease.addColorStop(0, "rgba(160,120,80,0)");
  crease.addColorStop(0.5, "rgba(140,100,60,0.12)");
  crease.addColorStop(1, "rgba(160,120,80,0)");
  ctx.fillStyle = crease;
  ctx.fillRect(60, PAPER_H / 2 - 8, PAPER_W - 120, 16);

  // Wax seal
  ctx.fillStyle = "rgba(175,45,38,0.93)";
  ctx.beginPath();
  ctx.arc(PAPER_W / 2, 1268, 56, 0, Math.PI * 2);
  ctx.fill();
  // Sedikit highlight di wax
  const waxGlow = ctx.createRadialGradient(
    PAPER_W / 2 - 16, 1252, 4,
    PAPER_W / 2, 1268, 56
  );
  waxGlow.addColorStop(0, "rgba(255,200,180,0.28)");
  waxGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = waxGlow;
  ctx.beginPath();
  ctx.arc(PAPER_W / 2, 1268, 56, 0, Math.PI * 2);
  ctx.fill();
  // Simbol bintang
  ctx.fillStyle = "rgba(255,235,210,0.92)";
  ctx.font = "44px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("✦", PAPER_W / 2, 1270);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return { ctx, texture };
})();

const halfGeometry = (vFrom, vTo) => {
  const geometry = new THREE.PlaneGeometry(CARD_W, HALF_H);
  const uv = geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setY(i, vFrom + uv.getY(i) * (vTo - vFrom));
  }
  uv.needsUpdate = true;
  return geometry;
};

const BOTTOM_GEO = halfGeometry(0, 0.5);
const FLAP_GEO = halfGeometry(0.5, 1);

const fitBody = (ctx, maxWidth, top, bottom) => {
  let best = { size: 24, lines: [], lineHeight: 38 };
  for (let size = 38; size >= 20; size -= 2) {
    ctx.font = `400 ${size}px "Montserrat", system-ui, sans-serif`;
    const lines = wrapLines(ctx, NOTE.body, maxWidth);
    const lineHeight = size * 1.6;
    best = { size, lines, lineHeight };
    if (lines.length * lineHeight <= bottom - top) break;
  }
  return best;
};

/* ------------------------------------------------------------------
   Komponen 3D Card
------------------------------------------------------------------ */
function FoldNote({ progress }) {
  const { viewport } = useThree();
  const flapRef = useRef(null);
  const cardRef = useRef(null);
  const timeRef = useRef(0);

  // Skala adaptif
  const isLandscape = viewport.width > viewport.height;
  const baseFactor = isLandscape ? viewport.height / 1.85 : viewport.width / 1.35;
  const scale = Math.min(baseFactor, 0.95);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = progress.current.t;
    const time = timeRef.current;

    // Flip animasi lipatan
    if (flapRef.current) flapRef.current.rotation.x = (1 - t) * -Math.PI;
    if (cardRef.current) cardRef.current.position.y = (1 - t) * (HALF_H / 2);

    // Sway organik — kertas bergerak seperti ditiup angin pelan
    if (cardRef.current) {
      cardRef.current.rotation.z = Math.sin(time * 0.4)  * 0.018 + Math.sin(time * 0.23) * 0.01;
      cardRef.current.rotation.x = Math.sin(time * 0.31) * 0.012 + 0.02;
      cardRef.current.rotation.y = Math.sin(time * 0.27) * 0.015 - 0.02;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.12} floatIntensity={0.55}>
      <group ref={cardRef} scale={scale}>
        {/* ✅ Drop shadow — INSIDE cardRef agar ikut posisi & scale kartu */}
        <mesh position={[0.04, -CARD_H / 2 - 0.015, -0.07]}>
          <planeGeometry args={[CARD_W * 0.88, 0.09]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
        </mesh>

        {/* Bagian Bawah Kertas */}
        <mesh geometry={BOTTOM_GEO} position={[0, -HALF_H / 2, 0]}>
          <meshStandardMaterial map={paperTexture.texture} roughness={0.85} metalness={0.01} />
        </mesh>

        {/* Bagian Lipatan Atas */}
        <group ref={flapRef}>
          <mesh geometry={FLAP_GEO} position={[0, HALF_H / 2, 0]}>
            <meshStandardMaterial map={paperTexture.texture} roughness={0.85} metalness={0.01} />
          </mesh>
          {/* Sisi Belakang Lipatan */}
          <mesh geometry={FLAP_GEO} position={[0, HALF_H / 2, -0.004]}>
            <meshStandardMaterial
              color="#ede4d2"
              roughness={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------
   Main Component: NotePopup
------------------------------------------------------------------ */
export default function NotePopup({ onClose }) {
  const overlayRef = useRef(null);
  const progress = useRef({ t: 0 });
  const doneRef = useRef(false);
  const drawn = useRef(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  // Monitor perubahan orientasi layar (Landscape Detection)
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      const isSmallScreen = window.innerHeight < 600 || window.innerWidth < 900;
      setIsMobileLandscape(isLandscape && isSmallScreen);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  const close = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    gsap
      .timeline()
      .to(progress.current, {
        t: 0,
        duration: 0.45,
        ease: "power2.in",
      })
      .to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        "-=0.15"
      )
      .call(() => onClose && onClose());
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.to(
        overlayRef.current,
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        0
      );
      tl.to(
        progress.current,
        { t: 1, duration: 0.6, ease: "power2.out" },
        0
      );
    });
    return () => ctx.revert();
  }, []);

  // Render teks doa ke canvas texture
  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;

    const ready = document.fonts?.ready ?? Promise.resolve();
    ready.then(() => {
      const { ctx, texture } = paperTexture;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#2c221e";

      // Judul / Title
      ctx.font = '600 68px "Playfair Display", Georgia, serif';
      ctx.fillText(NOTE.title, PAPER_W / 2, 280);

      // Garis Pembatas
      ctx.strokeStyle = "rgba(212,165,116,0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(PAPER_W / 2 - 140, 330);
      ctx.lineTo(PAPER_W / 2 + 140, 330);
      ctx.stroke();

      // Isi Doa / Body
      const { size, lines, lineHeight } = fitBody(
        ctx,
        TEXT_MAX_W,
        TEXT_TOP,
        TEXT_BOTTOM
      );
      const block = lines.length * lineHeight;
      let y = TEXT_TOP + (TEXT_BOTTOM - TEXT_TOP - block) / 2 + size;
      for (const line of lines) {
        ctx.fillText(line, PAPER_W / 2, y);
        y += lineHeight;
      }

      texture.needsUpdate = true;
    });
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 outline-none overflow-hidden select-none"
      style={{ opacity: 0 }}
    >
      {/* Background Dimmed / Blur */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/background-image.jpg)",
          filter: "blur(12px) brightness(0.35)",
        }}
      />

      {/* 3D Canvas Area */}
      <div className="absolute inset-0 touch-none">
        <Canvas
          camera={{
            position: [0, 0, isMobileLandscape ? 2.6 : 3.1],
            fov: isMobileLandscape ? 38 : 45,
          }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[2, 4, 3]} intensity={0.7} />

          {/* Partikel kunang-kunang — muncul penuh saat surat terbuka */}
          <Particles />

          <FoldNote progress={progress} />

          {/* Kontrol Interaktif: Bebas digerakkan / di-rotasi oleh pengguna */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.8}
            dampingFactor={0.05}
            enableDamping={true}
            minPolarAngle={Math.PI / 3} // Batas atas rotasi vertikal
            maxPolarAngle={(2 * Math.PI) / 3} // Batas bawah rotasi vertikal
            minAzimuthAngle={-Math.PI / 4} // Batas kiri rotasi horizontal
            maxAzimuthAngle={Math.PI / 4} // Batas kanan rotasi horizontal
          />
        </Canvas>
      </div>

      {/* UI Overlay / Tombol Tutup */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-10">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="pointer-events-auto rounded-full bg-black/40 px-3.5 py-1.5 text-xs text-white/80 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
          >
            ✕ Tutup
          </button>
        </div>

        <p className="text-center text-xs tracking-widest text-white/60 uppercase">
          Geser untuk memutar surat • Tap tombol untuk menutup
        </p>
      </div>
    </div>
  );
}