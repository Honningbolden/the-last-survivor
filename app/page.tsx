'use client';
import ThreeCanvas from './components/three-js-canvas';
import VideoElement from './components/video-element';
import { useRef } from 'react';
import { DirectionProvider, DistanceProvider } from './components/get-direction';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <DirectionProvider>
      <DistanceProvider>
        <>
          <ThreeCanvas />
          <VideoElement videoRef={videoRef} />
        </>
      </DistanceProvider>
    </DirectionProvider>
  );
}
