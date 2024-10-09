"use client"

import { AccumulativeShadows, AdaptiveDpr, BakeShadows, Environment, Preload, RandomizedLight, SoftShadows, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from 'three';
import { Octree } from "three-stdlib";
import BlockoutMountains from "../react-models/blockout/blockout-mountains";
import BlockoutTerrain from "../react-models/blockout/blockout-terrain";
import PlayerComponent from "../react-models/player";

export default function ThreeCanvas() {
  const worldOctree = useRef<Octree>(new Octree());

  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'
        shadows
        dpr={window.devicePixelRatio}
        onCreated={({ gl, scene }) => {
          gl.setSize(window.innerWidth, window.innerHeight); // Set renderer size
          gl.shadowMap.enabled = true; // Enable shadow maps
          gl.shadowMap.type = THREE.VSMShadowMap; // Use VSM shadow maps
          gl.toneMapping = THREE.ACESFilmicToneMapping; // Apply ACES Filmic tone mapping

          // Adding fog to the scene
          scene.fog = new THREE.FogExp2(0x060812, 0.01); // Exponential fog for smoother results
        }}
        camera={{ fov: 50, near: 0.1, far: 150, position: [0, 2, 5] }}>

        <AdaptiveDpr pixelated />

        <Environment background near={100} far={10000} resolution={2048} frames={Infinity} environmentIntensity={0} backgroundIntensity={0.3}>
          <Stars radius={80} depth={100} count={8000} factor={4} saturation={0.5} fade speed={1} />
        </Environment>

        <AccumulativeShadows temporal frames={100} scale={5} position={[0, -0.5, 0]}>
          <RandomizedLight
            castShadow
            amount={12}
            frames={100}
            position={[5, 5, -10]}
            bias={0}
            radius={12}
            intensity={0.8}
            ambient={0.6}
          />
        </AccumulativeShadows>

        {/* Lighting */}
        <hemisphereLight
          castShadow
          color={0x397eed} // Light blue to simulate daylight
          groundColor={0xf5c04e} // Soft brown to simulate ground bounce light
          intensity={0.3}
        />
        {/* Directional Sunlight - Epic lighting coming from right angle */}
        <directionalLight
          castShadow
          position={[100, 50, -20]} // Adjust to have the light at an angle above the scene
          intensity={3}
          color={0xcf8744}
          shadow-mapSize={[2048, 2048]} // Increase shadow map resolution for better quality
          shadow-camera-left={-80} // Increase boundary to cover a larger area
          shadow-camera-right={180}
          shadow-camera-top={220}
          shadow-camera-bottom={-16}
          shadow-camera-near={0.5} // Set near clipping plane for shadows
          shadow-camera-far={200} // Set far clipping plane for shadows
        />
        {/* Secondary Light */}
        <directionalLight
          castShadow
          position={[-15, 100, -50]} // Adjust to have the light at an angle above the scene
          intensity={0.5}
          // color={0xcf8744}
          color={0xe09e34}
        />
        <SoftShadows
          size={15}
          samples={10}
          focus={5}
        />


        <Suspense fallback={null}>
          <BlockoutTerrain worldOctree={worldOctree.current} />
          <BlockoutMountains worldOctree={worldOctree.current} />
          <BakeShadows />
        </Suspense>
        <PlayerComponent worldOctree={worldOctree.current} />
        <Preload all />
      </Canvas>
    </div>
  )
}