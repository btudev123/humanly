"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial, GradientTexture, PerspectiveCamera, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 150 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#7c35e3"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FluidShape({ position, color, size = 1, speed = 1, distort = 0.5, geometry = "sphere" }: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.2;
      mesh.current.rotation.y = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <mesh ref={mesh}>
        {geometry === "sphere" ? (
          <sphereGeometry args={[size, 128, 128]} />
        ) : geometry === "torus" ? (
          <torusKnotGeometry args={[size * 0.6, size * 0.2, 128, 32]} />
        ) : (
          <boxGeometry args={[size, size, size]} />
        )}
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          roughness={0.05}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

// Interactive background group that responds to scroll/mouse is handled in Page
export function HeroCanvas() {
  return (
    <div className="absolute inset-0 -z-10 bg-[#fafafa]">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={35} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={3} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#fda544" />
        <pointLight position={[5, 15, 5]} intensity={2} color="#7c35e3" />
        
        <FluidShape position={[-5, 2, -4]} color="#7c35e3" size={3} speed={0.6} distort={0.5} geometry="torus" />
        <FluidShape position={[6, -3, -5]} color="#fda544" size={2.5} speed={1} distort={0.4} />
        <FluidShape position={[-2, -6, -8]} color="#f982db" size={2} speed={1.2} distort={0.3} geometry="torus" />
        <FluidShape position={[4, 5, -6]} color="#3f1b73" size={1.5} speed={0.8} distort={0.6} />
        
        <Particles count={300} />
        
        <fog attach="fog" args={["#fafafa", 15, 30]} />
      </Canvas>
    </div>
  );
}
