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
function CarModel({ modelPath, position }) {
	const gltf = useGLTF(modelPath);
	const ref = useRef();
  
	useEffect(() => {
	  if (ref.current) {
		ref.current.traverse((child) => {
		  if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;
  
			// Improve material properties for better light response
			if (!(child.material instanceof THREE.MeshStandardMaterial)) {
			  child.material = new THREE.MeshStandardMaterial({
				color: child.material.color || "#cccccc", // Lighter default color
				roughness: 0.3, // Lower roughness for more shine
				metalness: 0.7, // Higher metalness for car parts
				envMapIntensity: 1.5 // Enhance environment reflections
			  });
			} else {
			  // Enhance existing standard materials
			  child.material.roughness = Math.min(child.material.roughness, 0.5);
			  child.material.metalness = Math.max(child.material.metalness, 0.5);
			  child.material.envMapIntensity = 1.5;
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
		position={position}
	  />
	);
  }

export default function ThreeDModel({
  modelPath = "/models/car.glb",
  width = 550,
  height = 340,
  position = [0, -0.75, 0],
  camera = { position: [2, 2, 5], fov: 45 }
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
        camera={camera}
        style={{ width: "100%", height: "100%" }}
      >
        <color attach="background" args={["#f8f8f8"]} /> {/* Lighter background */}
        
        {/* Enhanced lighting setup */}
        <ambientLight intensity={1.2} /> {/* Increased from 0.7 */}
        
        {/* Main directional light (simulates sun) */}
        <directionalLight
          castShadow
          intensity={2.0} /* Increased from 1.5 */
          position={[5, 10, 5]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />
        
        {/* Secondary directional light from opposite angle */}
        <directionalLight 
          intensity={50.0}
          position={[0, 20, 0]} 
          color="#e1e1ff" /* Slight blue tint */
        />
        
        {/* Hemisphere light for more natural environmental lighting */}
        <hemisphereLight 
          intensity={0.8} 
          color="#ffffff" 
          groundColor="#bbbbff"
        />
        
        {/* Fill light from below */}
        <pointLight 
          position={[0, -3, 0]} 
          intensity={0.5} 
          color="#ffffff" 
        />
        
        <Suspense fallback={
          <Html center>
            <div className="bg-white p-2 rounded shadow text-blue-600 font-medium">
              Loading 3D model...
            </div>
          </Html>
        }>
          <Environment preset="warehouse" background intensity={0.7} />
          <CarModel modelPath={modelPath} position={position}/>
        </Suspense>
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.5} /* Increased from 0.4 */
          scale={10}
          blur={2}
          far={1.2}
        />
        <OrbitControls 
          enableZoom={true} 
          enablePan={true}
          enableRotate={true}
          makeDefault
        />
      </Canvas>
    </div>
  );
}