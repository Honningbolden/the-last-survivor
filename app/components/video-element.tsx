import { useEffect, useRef } from "react";

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/hands';
import * as THREE from 'three'
import { useDirection } from "./get-direction";

export default function VideoElement({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement> }) {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
  };
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const estimationConfig = { flipHorizontal: true };
  const { setDirection } = useDirection();
  const lastDirectionRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        if (videoRef.current) {
          console.log("Initializing video stream...");
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log("Video stream started.");

          console.log("Initializing hand pose detector...");
          detectorRef.current = await handPoseDetection.createDetector(model, detectorConfig);
          console.log("Hand pose detector initialized.");
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    initializeDetector();
  }, [videoRef]);

  useEffect(() => {
    const estimateHands = async () => {
      try {
        if (detectorRef.current && videoRef.current) {
          // console.log("Estimating hands...");
          const hands = await detectorRef.current.estimateHands(videoRef.current, estimationConfig);
          // console.log("Hands estimated:", hands);

          if (hands.length > 0) {
            const rightHand = hands.find(hand => hand.handedness === "Right");

            if (rightHand) {
              console.log("Right hand")
              const indexFingerDirection = findAngle({ hand: hands[0] }); // If right hand, find angle
              setDirection(indexFingerDirection); // Set the direction in the context
              lastDirectionRef.current = indexFingerDirection; // Update last known direction
              return;
            }

            if (lastDirectionRef.current) {
              setDirection(lastDirectionRef.current);
            }
          }
        }
      } catch (error) {
        console.error("Error during hand estimation:", error);
      }
    };


    const interval = setInterval(estimateHands, 100); // Estimate hands every 100ms

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [videoRef, estimationConfig]);

  return <video ref={videoRef} style={{ position: 'absolute', top: '10px', right: '10px', width: '200px', height: '150px', zIndex: 10 }} />
}

function findAngle({ hand }: { hand: handPoseDetection.Hand }) {
  const indexFingerTip = new THREE.Vector3(hand.keypoints3D[8].x, -hand.keypoints3D[8].y, hand.keypoints3D[8].z);
  const indexFingerKnuckle = new THREE.Vector3(hand.keypoints3D[5].x, -hand.keypoints3D[5].y, hand.keypoints3D[5].z);

  const direction = new THREE.Vector3().subVectors(indexFingerKnuckle, indexFingerTip).normalize();
  return direction;
}

function findDistance({ hand }: { hand: handPoseDetection.Hand }) {
  const indexFingerTip = new THREE.Vector3(hand.keypoints3D[8].x, -hand.keypoints3D[8].y, hand.keypoints3D[8].z);
  const thumbFingerTip = new THREE.Vector3(hand.keypoints3D[4].x, -hand.keypoints3D[4].y, hand.keypoints3D[4].z);

  const distance = thumbFingerTip.distanceTo(indexFingerTip);
  return distance;
}