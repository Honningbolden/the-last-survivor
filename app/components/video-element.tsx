import { useEffect, useRef } from 'react';

import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import '@mediapipe/hands';
import * as THREE from 'three';
import { useDirection, useDistance } from './get-direction';

export default function VideoElement({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
}) {
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig = {
    runtime: 'mediapipe',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
  };
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const estimationConfig = { flipHorizontal: true };
  const { setDirection } = useDirection();
  const { setDistance } = useDistance();
  const lastDirectionRef = useRef<THREE.Vector3 | null>(null);
  const lastDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        if (videoRef.current) {
          console.log('Initializing video stream...');
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('Video stream started.');

          console.log('Initializing hand pose detector...');
          detectorRef.current = await handPoseDetection.createDetector(model, detectorConfig);
          console.log('Hand pose detector initialized.');
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    initializeDetector();
  }, [videoRef, detectorConfig, model]);

  useEffect(() => {
    const estimateHands = async () => {
      try {
        if (detectorRef.current && videoRef.current) {
          // console.log("Estimating hands...");
          const hands = await detectorRef.current.estimateHands(videoRef.current, estimationConfig);
          // console.log("Hands estimated:", hands);

          if (hands.length > 0) {
            const rightHand = hands.find((hand) => hand.handedness === 'Right');
            const leftHand = hands.find((hand) => hand.handedness === 'Left');

            if (leftHand) {
              console.log('Left hand');
              const indexThumbDistance = findDistance({ hand: leftHand });
              setDistance(indexThumbDistance);
              lastDistanceRef.current = indexThumbDistance;
              console.log(indexThumbDistance);
            } else if (lastDistanceRef.current) {
              setDistance(lastDistanceRef.current);
            }

            if (rightHand) {
              console.log('Right hand');
              const indexFingerDirection = findAngle({ hand: rightHand }); // If right hand, find angle
              setDirection(indexFingerDirection); // Set the direction in the context
              lastDirectionRef.current = indexFingerDirection; // Update last known direction
            } else if (lastDirectionRef.current) {
              setDirection(lastDirectionRef.current);
            }
          }
        }
      } catch (error) {
        console.error('Error during hand estimation:', error);
      }
    };

    const interval = setInterval(estimateHands, 100); // Estimate hands every 100ms

    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [videoRef, estimationConfig, setDirection, setDistance]);

  return (
    <video
      ref={videoRef}
      style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        width: '400px',
        height: '300px',
        opacity: 0.5,
        zIndex: 10,
        transform: 'scaleX(-1)',
      }}
    />
  );
}

function findAngle({ hand }: { hand: handPoseDetection.Hand }) {
  if (!hand.keypoints3D || hand.keypoints3D.length < 9) {
    console.warn('findAngle: keypoints3D missing, returning zero vector');
    return new THREE.Vector3(0, 0, 0);
  }
  const indexFingerTip = new THREE.Vector3(
    hand.keypoints3D[8].x,
    -hand.keypoints3D[8].y,
    hand.keypoints3D[8].z,
  );
  const indexFingerKnuckle = new THREE.Vector3(
    hand.keypoints3D[5].x,
    -hand.keypoints3D[5].y,
    hand.keypoints3D[5].z,
  );

  const direction = new THREE.Vector3().subVectors(indexFingerKnuckle, indexFingerTip).normalize();
  return direction;
}

function findDistance({ hand }: { hand: handPoseDetection.Hand }) {
  if (!hand.keypoints3D || hand.keypoints3D.length < 9) {
    console.warn('findAngle: keypoints3D missing, returning zero vector');
    return 0;
  }
  const indexFingerTip = new THREE.Vector3(
    hand.keypoints3D[8].x,
    -hand.keypoints3D[8].y,
    hand.keypoints3D[8].z,
  );
  const thumbFingerTip = new THREE.Vector3(
    hand.keypoints3D[4].x,
    -hand.keypoints3D[4].y,
    hand.keypoints3D[4].z,
  );

  const distance = thumbFingerTip.distanceTo(indexFingerTip);
  return distance;
}
