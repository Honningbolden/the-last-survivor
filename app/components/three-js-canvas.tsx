"use client"

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from 'three';

import { Octree } from "three-stdlib";
import PlayerComponent from "../react-models/player";
import BlockoutTerrain from "../react-models/blockout/blockout-terrain";
import { Environment } from "@react-three/drei";
import { Stars } from "@react-three/drei";
import { AccumulativeShadows, RandomizedLight } from "@react-three/drei";

export default function ThreeCanvas() {
  const worldOctree = useRef<Octree>(new Octree());

  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'
        shadows
        dpr={window.devicePixelRatio}
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight); // Set renderer size
          gl.shadowMap.enabled = true; // Enable shadow maps
          gl.shadowMap.type = THREE.VSMShadowMap; // Use VSM shadow maps
          gl.toneMapping = THREE.ACESFilmicToneMapping; // Apply ACES Filmic tone mapping
        }}
        camera={{ fov: 60, near: 0.1, far: 1000, position: [0, 2, 5] }}>

        <Stars radius={40} depth={200} count={8000} factor={6} saturation={.5} fade speed={1} />

        {/* Lighting */}
        <hemisphereLight
          color={new THREE.Color(0x88ccff)} // Light blue to simulate daylight
          groundColor={new THREE.Color(0x444422)} // Soft brown to simulate ground bounce light
          intensity={0.4}
        />
        <directionalLight
          castShadow
          position={[50, 10, 0]}
          intensity={2}
          color={0xfff2e6}
          shadow-mapSize={[4096, 4096]}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <AccumulativeShadows
          temporal // Enables temporal accumulative effect for softer shadows
          frames={100} // Number of frames to accumulate, higher gives softer shadows
          alphaTest={0.85}
          scale={10}
          position={[0, -0.5, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={5}
            intensity={1}
            ambient={1}
            position={[5, 5, -10]}
            bias={0}
            mapSize={1024}
            size={50}
            near={0.1}
            far={100}
          />
        </AccumulativeShadows>

        <BlockoutTerrain worldOctree={worldOctree.current} />
        <PlayerComponent worldOctree={worldOctree.current} />
      </Canvas>
    </div>
  )
}