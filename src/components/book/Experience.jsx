import { Float, OrbitControls } from "@react-three/drei";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Book } from "./Book";
import { Particles } from "./Particles";

function FallIn({ children }) {
  const group = useRef(null);

  useLayoutEffect(() => {
    const positionTween = gsap.fromTo(
      group.current.position,
      { y: 2.6 },
      { y: 0, duration: 1.1, ease: "bounce.out" },
    );
    const rotationTween = gsap.fromTo(
      group.current.rotation,
      { z: -0.12 },
      { z: 0, duration: 0.9, ease: "power2.out" },
    );

    return () => {
      positionTween.kill();
      rotationTween.kill();
    };
  }, []);

  return <group ref={group}>{children}</group>;
}

export const Experience = ({ page, setPage }) => {
  return (
    <>
      <FallIn>
        <Float
          rotation-x={-Math.PI / 4}
          floatIntensity={1}
          speed={2}
          rotationIntensity={0.15}
        >
          <Book page={page} setPage={setPage} />
        </Float>
      </FallIn>
      <Particles />
      <OrbitControls />
      {/* Replaces <Environment preset="studio"> — no runtime CDN fetch, so
          Suspense can never hang on a failed HDR download. */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[2, 5, 2]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
    </>
  );
};
