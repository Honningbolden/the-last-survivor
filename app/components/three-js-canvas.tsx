"use client"

import { AccumulativeShadows, AdaptiveDpr, BakeShadows, Environment, Preload, RandomizedLight, SoftShadows, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { Capsule, Octree } from "three-stdlib";
import AssetCollection from "../react-models/asset-collection";
import TriggerZone from "../react-models/audio-trigger";
import BlockoutMountains from "../react-models/blockout/blockout-mountains";
import BlockoutTerrain from "../react-models/blockout/blockout-terrain";
import PlayerComponent from "../react-models/player";
import ScatteredRocks from "../react-models/scattered-rocks";

export default function ThreeCanvas() {
  const worldOctree = useRef<Octree>(new Octree());
  const playerCollider = useRef(new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35));

  // State to track whether the user has interacted with the page
  const [isInteractionAllowed, setIsInteractionAllowed] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  // Allow audio to play after user interaction
  useEffect(() => {
    const enableInteraction = () => {
      setIsInteractionAllowed(true);
      if (typeof window !== "undefined") window.removeEventListener("click", enableInteraction);
    };

    if (!isInteractionAllowed && typeof window !== "undefined") {
      window.addEventListener("click", enableInteraction);
    }

    if (!hasRendered) {
      setHasRendered(true);
    }
  }, [hasRendered, isInteractionAllowed]);


  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas className='h-2xl w-2xl'
        shadows
        dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        onCreated={({ gl, scene }) => {
          if (typeof window !== "undefined") {
            gl.setSize(window.innerWidth, window.innerHeight); // Set renderer size
          }
          gl.shadowMap.enabled = true; // Enable shadow maps
          gl.shadowMap.type = THREE.VSMShadowMap; // Use VSM shadow maps
          gl.toneMapping = THREE.ACESFilmicToneMapping; // Apply ACES Filmic tone mapping

          // Adding fog to the scene
          scene.fog = new THREE.FogExp2(0x060812, 0.02); // Exponential fog for smoother results
        }}
        camera={{ fov: 50, near: 0.1, far: 500, position: [0, 2, 5] }}>

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
          <AssetCollection worldOctree={worldOctree.current} />
          <ScatteredRocks />
          {/* <TestRocks/> */}
          <BakeShadows />
          <PlayerComponent worldOctree={worldOctree.current} playerCollider={playerCollider} />
          {triggerZonesConfig.map((config, index) => (
            <TriggerZone
              key={`audio_trigger_${index}`}
              position={config.position}
              radius={config.radius}
              playerCollider={playerCollider}
              onTrigger={() => {
                // Play the corresponding audio file
                const audio = new Audio(config.audioFile);
                audio.play();
              }}
            />
          ))}
        </Suspense>


        <Preload all />
      </Canvas>
    </div>
  )
}

const triggerZonesConfig: { position: [number, number, number]; radius: number; audioFile: string; }[] = [
  {
    position: [-1, 1.3, 0.5],
    radius: 1,
    audioFile: '/Voiceover/Jordan/Inside Infirmary (pt1)/ElevenLabs_2024-10-09T11_47_43_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-3, 2, -16],
    radius: 8,
    audioFile: '/Voiceover/Jordan/Outside infirmary (pt2)/ElevenLabs_2024-10-09T11_50_51_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-10, 4, -30],
    radius: 6,
    audioFile: '/Voiceover/Jordan/Toolbox (pt3)/ElevenLabs_2024-10-09T11_54_07_Jordan - Warm Narrator_pvc_s50_sb50_se0_b_m2.mp3',
  },
  {
    position: [-26, 4.6, -44],
    radius: 10,
    audioFile: '/Voiceover/Jordan/Mining tracks (pt4)/ElevenLabs_2024-10-09T11_55_21_Jordan - Warm Narrator_pvc_s35_sb40_se0_b_m2.mp3',
  },
  {
    position: [-40, 9, -89],
    radius: 16,
    audioFile: '/Voiceover/Jordan/Three Skeletons (pt5)/ElevenLabs_2024-10-09T11_56_32_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-19, 108, -9],
    radius: 12,
    audioFile: '/Voiceover/Jordan/Industrial Parking (pt6)/ElevenLabs_2024-10-09T12_03_38_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [40, 8, -55],
    radius: 32,
    audioFile: '/Voiceover/Jordan/Bloody skeleton (pt7)/ElevenLabs_2024-10-09T12_00_00_Jordan - Warm Narrator_pvc_s50_sb70_se10_b_m2.mp3',
  },
  {
    position: [60, 18, -95],
    radius: 32,
    audioFile: '/Voiceover/Jordan/City View (pt8)/ElevenLabs_2024-10-10T10_20_24_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [77, 23, -130],
    radius: 32,
    audioFile: '/Voiceover/Jordan/Revelation (pt9)/ElevenLabs_2024-10-09T12_02_12_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
];