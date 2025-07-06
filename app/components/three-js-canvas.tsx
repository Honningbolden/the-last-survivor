'use client';

import {
  AccumulativeShadows,
  AdaptiveDpr,
  BakeShadows,
  ContactShadows,
  Environment,
  Preload,
  RandomizedLight,
  Stars,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Capsule, Octree } from 'three-stdlib';
import AssetCollection from '../react-models/asset-collection';
import TriggerZone from '../react-models/audio-trigger';
import BlockoutMountains from '../react-models/blockout/blockout-mountains';
import BlockoutTerrain from '../react-models/blockout/blockout-terrain';
import PlayerComponent from '../react-models/player';
import ScatteredRocks from '../react-models/scattered-rocks';
import LoadingScreen from './loading-screen';

export default function ThreeCanvas({ controlMode }: { controlMode: 'keyboard' | 'webcam' }) {
  const worldOctree = useRef<Octree>(new Octree());
  const playerCollider = useRef(
    new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35),
  );
  const audioBuffers = useRef<HTMLAudioElement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // track which audio is next

  // State to track whether the user has interacted with the page
  const [isInteractionAllowed, setIsInteractionAllowed] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);

  // Allow audio to play after user interaction
  useEffect(() => {
    const enableInteraction = () => {
      setIsInteractionAllowed(true);
      if (typeof window !== 'undefined') window.removeEventListener('click', enableInteraction);
    };

    if (!isInteractionAllowed && typeof window !== 'undefined') {
      window.addEventListener('click', enableInteraction);
    }

    if (!hasRendered) {
      setHasRendered(true);
    }
  }, [hasRendered, isInteractionAllowed]);

  // Preload all voiceover clips muted to unlock playback later
  useEffect(() => {
    audioBuffers.current = triggerZonesConfig.map((cfg) => {
      const clip = new Audio(cfg.audioFile);
      clip.preload = 'auto';
      clip.onended = () => setCurrentIndex((i) => i + 1);
      return clip;
    });
  }, []);

  return (
    <div className='flex justify-center items-center h-screen'>
      <Canvas
        className='h-2xl w-2xl'
        shadows
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]} // Cap DPR at 1.5
        onCreated={({ gl, scene }) => {
          if (typeof window !== 'undefined') {
            gl.setSize(window.innerWidth, window.innerHeight);
          }
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          scene.fog = new THREE.FogExp2(0x060812, 0.02);
        }}
        camera={{ fov: 50, near: 0.1, far: 500, position: [0, 2, 5] }}>
        <AdaptiveDpr pixelated />

        <Environment
          background
          near={100}
          far={10000}
          resolution={1024}
          frames={Infinity}
          environmentIntensity={0}
          backgroundIntensity={0.3}>
          <Stars radius={80} depth={100} count={8000} factor={4} saturation={0.5} fade speed={1} />
        </Environment>

        <AccumulativeShadows temporal frames={30} scale={5} position={[0, -0.5, 0]}>
          <RandomizedLight
            castShadow
            amount={8} // Reduce light samples
            frames={100}
            position={[5, 5, -10]}
            bias={0}
            radius={12}
            intensity={0.8}
            ambient={0.6}
          />
        </AccumulativeShadows>

        <ContactShadows
          position={[0, -0.5, 0]}
          width={10}
          height={10}
          resolution={256}
          blur={2}
          far={1}
          opacity={0.5}
        />

        {/* Lighting */}
        <hemisphereLight castShadow color={0x397eed} groundColor={0xf5c04e} intensity={0.3} />
        {/* Directional Sunlight - Epic lighting coming from right angle */}
        <directionalLight
          castShadow
          position={[100, 50, -20]}
          intensity={3}
          color={0xcf8744}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-80}
          shadow-camera-right={180}
          shadow-camera-top={220}
          shadow-camera-bottom={-16}
          shadow-camera-near={0.5}
          shadow-camera-far={200}
        />
        {/* Secondary Light */}
        <directionalLight castShadow position={[-15, 100, -50]} intensity={0.5} color={0xe09e34} />

        <Suspense fallback={null}>
          <Suspense fallback={<LoadingScreen />}>
            <BlockoutTerrain worldOctree={worldOctree.current} />
            <BlockoutMountains worldOctree={worldOctree.current} />
            <AssetCollection worldOctree={worldOctree.current} />
            <ScatteredRocks />
            {/* <TestRocks/> */}
            <BakeShadows />
            <PlayerComponent
              worldOctree={worldOctree.current}
              playerCollider={playerCollider}
              controlMode={controlMode}
            />
            {triggerZonesConfig.map((config, index) => {
              // only show current (blue) and next (red) spheres
              if (index < currentIndex || index > currentIndex + 1) return null;
              const isCurrent = index === currentIndex;
              const color = isCurrent ? '#0000ff' : '#ff0000';
              const opacity = 0.5;
              const enabled = isCurrent;
              return (
                <TriggerZone
                  key={`audio_trigger_${index}`}
                  position={config.position}
                  radius={config.radius}
                  playerCollider={playerCollider}
                  onTrigger={() => {
                    const clip = audioBuffers.current[index];
                    clip.muted = false;
                    clip.currentTime = 0;
                    clip.play();
                  }}
                  enabled={enabled}
                  color={color}
                  opacity={opacity}
                />
              );
            })}
          </Suspense>
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
}

const triggerZonesConfig: {
  position: [number, number, number];
  radius: number;
  audioFile: string;
}[] = [
  {
    position: [0, 1.3, 0.5],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Inside Infirmary (pt1)/ElevenLabs_2024-10-09T11_47_43_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-3, 3, -16],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Outside infirmary (pt2)/ElevenLabs_2024-10-09T11_50_51_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-10, 4, -30],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Toolbox (pt3)/ElevenLabs_2024-10-09T11_54_07_Jordan - Warm Narrator_pvc_s50_sb50_se0_b_m2.mp3',
  },
  {
    position: [-26, 5, -44],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Mining tracks (pt4)/ElevenLabs_2024-10-09T11_55_21_Jordan - Warm Narrator_pvc_s35_sb40_se0_b_m2.mp3',
  },
  {
    position: [-40, 8, -89],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Three Skeletons (pt5)/ElevenLabs_2024-10-09T11_56_32_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [-3, 8, -110],
    radius: 2,
    audioFile:
      '/Voiceover/Jordan/Industrial Parking (pt6)/ElevenLabs_2024-10-09T12_03_38_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [30, 5, -60],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Bloody skeleton (pt7)/ElevenLabs_2024-10-09T12_00_00_Jordan - Warm Narrator_pvc_s50_sb70_se10_b_m2.mp3',
  },
  {
    position: [70, 13.5, -85],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/City View (pt8)/ElevenLabs_2024-10-10T10_20_24_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
  {
    position: [77, 24, -130],
    radius: 1,
    audioFile:
      '/Voiceover/Jordan/Revelation (pt9)/ElevenLabs_2024-10-09T12_02_12_Jordan - Warm Narrator_pvc_s50_sb75_se0_b_m2.mp3',
  },
];
