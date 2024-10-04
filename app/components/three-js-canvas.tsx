"use client"

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from 'three';

import { Octree } from "three-stdlib";
import PlayerComponent from "../react-models/player";
import TestLevel from "../react-models/test-level";

export default function ThreeCanvas() {
  const worldOctree = useRef<Octree>(new Octree());

  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'
        shadows
        dpr={window.devicePixelRatio}
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight); // Set renderer size
          gl.setClearColor(new THREE.Color(0x88ccee)); // Background color
          gl.shadowMap.enabled = true; // Enable shadow maps
          gl.shadowMap.type = THREE.VSMShadowMap; // Use VSM shadow maps
          gl.toneMapping = THREE.ACESFilmicToneMapping; // Apply ACES Filmic tone mapping
        }}
        camera={{ fov: 70, near: 0.1, far: 1000, position: [0, 2, 5] }}>
        <ambientLight intensity={1} />
        <directionalLight castShadow position={[10, 10, 5]} intensity={1.5} />
        <TestLevel worldOctree={worldOctree.current} />
        <PlayerComponent worldOctree={worldOctree.current} />
      </Canvas>
    </div>
  )
}