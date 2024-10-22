"use client";
import ThreeCanvas from "./components/three-js-canvas";
import VideoElement from "./components/video-element";
import { useRef } from "react";
import { DirectionProvider } from "./components/get-direction";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <DirectionProvider>
      <>
        <ThreeCanvas />
        <VideoElement videoRef={videoRef} />
      </>
    </DirectionProvider>
  );
}
