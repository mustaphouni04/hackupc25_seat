import React, { Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// 👇 CarModel component accepts a modelPath prop
function CarModel({ modelPath, position  }) {
  const gltf = useGLTF(modelPath);
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (!(child.material instanceof THREE.MeshStandardMaterial)) {
            child.material = new THREE.MeshStandardMaterial({
              color: child.material.color || "white",
              roughness: 0.4,
              metalness: 0.6,
            });
          }
        }
      });
    }
  }, [gltf]);

  return (
    <primitive
      ref={ref}
      object={gltf.scene}
      scale={1.0}
      position={position} // {[0, -0.75, 0]}
    />
  );
}

// 👇 ThreeDModel accepts props (modelPath, width, height)
export default function ThreeDModel({
  modelPath = "/models/car.glb",
  width = 550,
  height = 340,
  position = [0, -0.75, 0], 
}) {
  useEffect(() => {
    useGLTF.preload(modelPath);
  }, [modelPath]);

  return (
    <div
      className="rounded-xl overflow-hidden shadow-xl mx-auto"
      style={{ width, height }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [2, 2, 5], fov: 45 }} // [2, 2, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#f0f0f0"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          intensity={1.5}
          position={[5, 10, 5]} // {[5, 10, 5]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Environment preset="warehouse" background />
          <CarModel modelPath={modelPath} position={position}/>
        </Suspense>
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={1.2}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
