'use client';
import ThreeCanvas from './components/three-js-canvas';
import VideoElement from './components/video-element';
import { useRef, useState } from 'react';
import { DirectionProvider, DistanceProvider } from './components/get-direction';
import SplashScreen from './components/splash-screen';

export default function Home() {
  const [started, setStarted] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!started) {
    return (
      <SplashScreen
        onStart={(webcam) => {
          setUseWebcam(webcam);
          setStarted(true);
        }}
      />
    );
  }

  return (
    <DirectionProvider>
      <DistanceProvider>
        <ThreeCanvas controlMode={useWebcam ? 'webcam' : 'keyboard'} />
        {useWebcam && <VideoElement videoRef={videoRef} />}
      </DistanceProvider>
    </DirectionProvider>
  );
}
