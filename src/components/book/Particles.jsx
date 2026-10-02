import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Generated once at module scope: Math.random() is not allowed during render,
// and the particle count never changes at runtime.
const COUNT = 2000;
const particlesPosition = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT; i++) {
  particlesPosition[i * 3] = (Math.random() - 0.5) * 10;
  particlesPosition[i * 3 + 1] = (Math.random() - 0.5) * 10;
  particlesPosition[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

export function Particles() {
  const points = useRef();

  const firefliesTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(255, 252, 187, 1)");
    gradient.addColorStop(0.4, "rgba(255, 252, 187, 0.5)");
    gradient.addColorStop(1, "rgba(255, 252, 187, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // More organic movement with varying speeds
      points.current.geometry.attributes.position.array[i3] +=
        Math.sin(time * 0.5 + i * 0.3) * 0.002;
      points.current.geometry.attributes.position.array[i3 + 1] +=
        Math.cos(time * 0.4 + i * 0.2) * 0.002;
      points.current.geometry.attributes.position.array[i3 + 2] +=
        Math.sin(time * 0.3 + i * 0.1) * 0.002;

      // Keep fireflies within bounds
      const x = points.current.geometry.attributes.position.array[i3];
      const y = points.current.geometry.attributes.position.array[i3 + 1];
      const z = points.current.geometry.attributes.position.array[i3 + 2];

      if (Math.abs(x) > 5) points.current.geometry.attributes.position.array[i3] *= -0.95;
      if (Math.abs(y) > 5) points.current.geometry.attributes.position.array[i3 + 1] *= -0.95;
      if (Math.abs(z) > 5) points.current.geometry.attributes.position.array[i3 + 2] *= -0.95;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        map={firefliesTexture}
        transparent={true}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
        color="#fffcbb"
      />
    </points>
  );
}
