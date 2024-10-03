"use client"

import { Canvas, useThree } from "@react-three/fiber"
import * as THREE from 'three';
import { useEffect, useRef, useState } from "react";

import { Capsule, Octree } from "three-stdlib";
import PlayerComponent from "../models/player";
import Ground from "../models/ground";

export default function ThreeCanvas() {
  const worldOctree = useRef(new Octree());

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
        <Ground worldOctree={worldOctree.current}/>
        <PlayerComponent worldOctree={worldOctree.current}/>
      </Canvas>
    </div>
  )
}