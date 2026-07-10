"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clockMechanicsStructures } from "../content/site-data";

export type ClockMechanicsState = "morning" | "afternoon" | "night" | "dawn";

export type ClockMechanicsProps = {
  timeState: ClockMechanicsState;
  progressRef: RefObject<number>;
};

const particleCount = 86;
const dissolveCount = 360;
const reusableObject = new THREE.Object3D();

function usePrefersReducedMotion() {
  const reducedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedRef.current = media.matches;
      setReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return { reducedMotion, reducedRef };
}

function makeDnaCurve(phase: number) {
  const points = Array.from({ length: 160 }, (_, index) => {
    const ratio = index / 159;
    const theta = ratio * Math.PI * 8 + phase;
    const x = (ratio - 0.5) * 7.2;
    return new THREE.Vector3(
      x,
      -0.92 + Math.sin(theta) * 0.18,
      -1.18 + Math.cos(theta) * 0.18,
    );
  });

  return new THREE.CatmullRomCurve3(points);
}

function stateEmission(timeState: ClockMechanicsState) {
  if (timeState === "morning") return 1;
  if (timeState === "afternoon") return 0.28;
  return 0;
}

function seedDissolveBuffers(buffers: {
  positions: Float32Array;
  velocities: Float32Array;
}) {
  for (let index = 0; index < dissolveCount; index += 1) {
    const angle = index * 2.399963;
    const shell = 0.24 + ((index % 29) / 29) * 0.78;
    const vertical = ((index % 19) / 19 - 0.5) * 0.72;
    const baseIndex = index * 3;
    buffers.positions[baseIndex] = Math.cos(angle) * shell;
    buffers.positions[baseIndex + 1] = vertical;
    buffers.positions[baseIndex + 2] =
      Math.sin(angle) * shell * 0.78 + 0.35;

    buffers.velocities[baseIndex] =
      Math.cos(angle) * (0.12 + (index % 7) * 0.012);
    buffers.velocities[baseIndex + 1] = 0.06 + (index % 11) * 0.007;
    buffers.velocities[baseIndex + 2] = Math.sin(angle) * 0.1;
  }
}

function createDissolveBuffers() {
  const buffers = {
    positions: new Float32Array(dissolveCount * 3),
    velocities: new Float32Array(dissolveCount * 3),
  };
  seedDissolveBuffers(buffers);
  return buffers;
}

function segmentProgress(progress: number, start: number, end: number) {
  return THREE.MathUtils.smoothstep(
    THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1),
    0,
    1,
  );
}

function SceneCamera({
  progressRef,
  reducedMotionRef,
}: {
  progressRef: RefObject<number>;
  reducedMotionRef: RefObject<boolean>;
}) {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, -0.08, 0), []);
  const nextPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const progress = progressRef.current;
    const drift = reducedMotionRef.current ? 0 : Math.sin(progress * Math.PI * 2) * 0.18;
    nextPosition.set(
      THREE.MathUtils.lerp(0.2, -0.6, progress),
      THREE.MathUtils.lerp(0.65, 0.15, progress) + drift * 0.18,
      THREE.MathUtils.lerp(6.8, 5.25, Math.sin(progress * Math.PI)),
    );
    camera.position.lerp(nextPosition, Math.min(1, delta * 2.7));
    camera.lookAt(target);
  });

  return null;
}

function DnaTrack() {
  const curves = useMemo(() => [makeDnaCurve(0), makeDnaCurve(Math.PI)], []);
  const rungs = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => {
        const ratio = index / 33;
        const x = (ratio - 0.5) * 7.2;
        return { x, rotation: ratio * Math.PI * 8 };
      }),
    [],
  );

  return (
    <group>
      {curves.map((curve, index) => (
        <mesh key={index}>
          <tubeGeometry args={[curve, 120, 0.018, 8, false]} />
          <meshStandardMaterial
            color={index === 0 ? "#cfe3ff" : "#91a4c1"}
            emissive={index === 0 ? "#6fa7ff" : "#48627f"}
            emissiveIntensity={0.26}
            transparent
            opacity={0.58}
          />
        </mesh>
      ))}
      {rungs.map((rung) => (
        <mesh
          key={rung.x}
          position={[rung.x, -0.92, -1.18]}
          rotation={[rung.rotation, 0, Math.PI / 2]}
        >
          <boxGeometry args={[0.018, 0.4, 0.012]} />
          <meshStandardMaterial
            color="#d8e7ff"
            emissive="#8cc8ff"
            emissiveIntensity={0.16}
            transparent
            opacity={0.42}
          />
        </mesh>
      ))}
    </group>
  );
}

function ProteinStructure({
  path,
  opacityRef,
}: {
  path: string;
  opacityRef: RefObject<number>;
}) {
  const { scene } = useLoader(GLTFLoader, path, (loader) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath("/vendor/draco/");
    draco.setDecoderConfig({ type: "js" });
    loader.setDRACOLoader(draco);
  });
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();
    });
    return clone;
  }, [scene]);

  useFrame(() => {
    const opacity = opacityRef.current;
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        material.transparent = opacity < 0.999;
        material.opacity = opacity;
        material.depthWrite = opacity > 0.96;
      });
    });
  });

  return <primitive object={model} />;
}

function ClockBmalComplex({
  progressRef,
}: {
  progressRef: RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const opacityRef = useRef(1);
  const elapsedRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const docked = segmentProgress(progressRef.current, 0.55, 0.82);
    const scale = THREE.MathUtils.lerp(0.96, 0.74, docked);
    const y = THREE.MathUtils.lerp(-0.2, -0.16, docked);
    const z = THREE.MathUtils.lerp(0.34, 0.2, docked);
    targetPosition.set(0, y, z);
    targetScale.set(scale, scale, scale);
    groupRef.current.position.lerp(targetPosition, Math.min(1, delta * 3));
    groupRef.current.scale.lerp(
      targetScale,
      Math.min(1, delta * 3),
    );
    groupRef.current.rotation.y =
      Math.sin(elapsedRef.current * 0.32) * 0.07 - docked * 0.16;
    groupRef.current.rotation.z = Math.sin(elapsedRef.current * 0.2) * 0.04;
    opacityRef.current = 1 - segmentProgress(progressRef.current, 0.88, 1) * 0.22;
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0.34]}>
      <ProteinStructure
        path={clockMechanicsStructures[0].glbPath}
        opacityRef={opacityRef}
      />
    </group>
  );
}

function PerCryComplex({
  progressRef,
}: {
  progressRef: RefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetVector = useMemo(() => new THREE.Vector3(), []);
  const opacityRef = useRef(0);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const arrive = segmentProgress(progressRef.current, 0.28, 0.55);
    const dock = segmentProgress(progressRef.current, 0.55, 0.82);
    const dissolve = segmentProgress(progressRef.current, 0.82, 1);
    const x = THREE.MathUtils.lerp(-4.4, -0.85, arrive);
    const y = THREE.MathUtils.lerp(0.95, 0.36, arrive);
    const z = THREE.MathUtils.lerp(0.82, 0.58, arrive);
    targetVector.set(
      THREE.MathUtils.lerp(x, 0.25, dock),
      THREE.MathUtils.lerp(y, 0.08, dock),
      THREE.MathUtils.lerp(z, 0.42, dock),
    );
    group.position.lerp(targetVector, Math.min(1, delta * 4));
    group.scale.setScalar(THREE.MathUtils.lerp(0.001, 0.92, arrive) * (1 - dissolve));
    group.rotation.set(0.08 + dock * 0.24, -0.4 + dock * 0.52, dock * 0.16);
    opacityRef.current = arrive * (1 - dissolve);
  });

  return (
    <group ref={groupRef} position={[-4.4, 0.95, 0.82]} scale={0.001}>
      <ProteinStructure
        path={clockMechanicsStructures[1].glbPath}
        opacityRef={opacityRef}
      />
    </group>
  );
}

function TranscriptParticles({
  timeState,
  reducedMotionRef,
}: {
  timeState: ClockMechanicsState;
  reducedMotionRef: RefObject<boolean>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const elapsedRef = useRef(0);
  const particlesRef = useRef(
    Array.from({ length: particleCount }, (_, index) => ({
      age: (index / particleCount) % 1,
      seed: index * 12.9898,
      x: -2.2 + (index / particleCount) * 4.4,
      z: -0.12 + Math.sin(index * 0.71) * 0.18,
      speed: 0.12 + (index % 7) * 0.018,
    })),
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    elapsedRef.current += delta;
    const emission = stateEmission(timeState);
    const reduced = reducedMotionRef.current;

    particlesRef.current.forEach((particle, index) => {
      if (emission > 0 && !reduced) {
        particle.age += delta * particle.speed * (0.7 + emission);
        if (particle.age > 1) particle.age = 0;
      } else {
        particle.age = Math.min(1, particle.age + delta * 0.45);
      }

      const life = 1 - particle.age;
      const visibleScale = emission === 0 ? Math.max(0, life - 0.7) : life;
      const wobble = Math.sin(elapsedRef.current * 0.7 + particle.seed) * 0.06;
      reusableObject.position.set(
        particle.x + wobble,
        -0.36 + particle.age * 1.85,
        particle.z + particle.age * 0.5,
      );
      reusableObject.scale.setScalar(Math.max(0.001, visibleScale * 0.055));
      reusableObject.updateMatrix();
      mesh.setMatrixAt(index, reusableObject.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#f6fbff" transparent opacity={0.72} />
    </instancedMesh>
  );
}

function DawnDissolve({
  timeState,
  reducedMotionRef,
}: {
  timeState: ClockMechanicsState;
  reducedMotionRef: RefObject<boolean>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const previousState = useRef<ClockMechanicsState>(timeState);
  const elapsedRef = useRef(0);
  const buffersRef = useRef<{
    positions: Float32Array;
    velocities: Float32Array;
  } | null>(null);

  const resetParticles = () => {
    if (!buffersRef.current) {
      buffersRef.current = createDissolveBuffers();
    }
    const buffers = buffersRef.current;
    seedDissolveBuffers(buffers);
  };

  useEffect(() => {
    if (!buffersRef.current) {
      buffersRef.current = createDissolveBuffers();
    }

    geometryRef.current?.setAttribute(
      "position",
      new THREE.BufferAttribute(buffersRef.current.positions, 3),
    );
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    const buffers = buffersRef.current;
    if (!points || !buffers) return;

    elapsedRef.current += delta;
    if (previousState.current !== timeState) {
      if (timeState === "dawn") resetParticles();
      previousState.current = timeState;
    }

    points.visible = timeState === "dawn";
    if (timeState !== "dawn") return;

    const step = reducedMotionRef.current ? delta * 0.1 : delta;
    for (let index = 0; index < dissolveCount; index += 1) {
      const baseIndex = index * 3;
      const seed = index * 0.37;
      buffers.positions[baseIndex] +=
        buffers.velocities[baseIndex] * step +
        Math.sin(elapsedRef.current + seed) * 0.0018;
      buffers.positions[baseIndex + 1] +=
        buffers.velocities[baseIndex + 1] * step +
        Math.cos(elapsedRef.current * 0.8 + seed) * 0.0012;
      buffers.positions[baseIndex + 2] +=
        buffers.velocities[baseIndex + 2] * step;
    }

    const attribute = points.geometry.getAttribute("position");
    attribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={timeState === "dawn"}>
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial
        color="#d8e7ff"
        size={0.045}
        transparent
        opacity={0.72}
        depthWrite={false}
      />
    </points>
  );
}

function MolecularScene({
  timeState,
  progressRef,
  reducedMotionRef,
}: ClockMechanicsProps & {
  reducedMotionRef: RefObject<boolean>;
}) {
  return (
    <>
      <color attach="background" args={["#050913"]} />
      <fog attach="fog" args={["#050913", 6, 12]} />
      <ambientLight intensity={timeState === "night" ? 0.28 : 0.48} />
      <directionalLight position={[3, 4, 4]} intensity={1.25} color="#fff1cc" />
      <pointLight position={[-3, -1, 2]} intensity={2.2} color="#54d6c2" />
      <pointLight
        position={[2.5, 1.8, 2.6]}
        intensity={timeState === "night" ? 0.9 : 1.6}
        color="#f7b267"
      />

      <SceneCamera progressRef={progressRef} reducedMotionRef={reducedMotionRef} />

      <ClockMechanicsRig timeState={timeState}>
        <DnaTrack />
        <ClockBmalComplex progressRef={progressRef} />
        <TranscriptParticles
          timeState={timeState}
          reducedMotionRef={reducedMotionRef}
        />
        <PerCryComplex progressRef={progressRef} />

        <DawnDissolve timeState={timeState} reducedMotionRef={reducedMotionRef} />
      </ClockMechanicsRig>
    </>
  );
}

function ClockMechanicsRig({
  children,
  timeState,
}: {
  children: ReactNode;
  timeState: ClockMechanicsState;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const targetY = timeState === "night" ? -0.16 : 0.08;
    const targetPositionY = timeState === "dawn" ? -0.04 : 0;
    group.rotation.y = THREE.MathUtils.lerp(
      group.rotation.y,
      targetY,
      Math.min(1, delta * 2.6),
    );
    group.position.y = THREE.MathUtils.lerp(
      group.position.y,
      targetPositionY,
      Math.min(1, delta * 2.6),
    );
  });

  return <group ref={groupRef}>{children}</group>;
}

export function ClockMechanics({
  timeState,
  progressRef,
}: ClockMechanicsProps) {
  const { reducedMotion, reducedRef: reducedMotionRef } = usePrefersReducedMotion();
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => {
      setIsCompact(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      className="clock-mechanics-canvas"
      camera={{ position: [0.2, 0.65, 6.8], fov: 46 }}
      dpr={[1, isCompact || reducedMotion ? 1 : 1.6]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
    >
      <Suspense fallback={null}>
        <MolecularScene
          timeState={timeState}
          progressRef={progressRef}
          reducedMotionRef={reducedMotionRef}
        />
      </Suspense>
    </Canvas>
  );
}
