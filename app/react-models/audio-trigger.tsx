import { Capsule } from "three-stdlib";
import * as THREE from 'three';
import { Sphere } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function TriggerZone({ position, radius, playerCollider, onTrigger }: {
  position: [number, number, number],
  radius: number,
  playerCollider: React.MutableRefObject<Capsule>,
  onTrigger: () => void,
}) {
  const modelRef = useRef<THREE.Mesh>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    console.log("Audio trigger mounted")
  },[])

  useFrame(() => {
    if (modelRef.current && playerCollider.current) {
      // Calculate the distance between the player collider's endpoint and the trigger zone
      const playerPosition = playerCollider.current.start.clone().add(playerCollider.current.end).multiplyScalar(0.5);
      const triggerPosition = new THREE.Vector3(...position);

      // Calculate distance between player and the trigger zone
      const distance = playerPosition.distanceTo(triggerPosition);

      // If the distance is less than or equal to the sum of the radius of the trigger and player collider, trigger the callback
      if (distance <= radius && !hasTriggered.current) {
        hasTriggered.current = true;
        onTrigger();
      }
    }
  })

  const material = new THREE.MeshBasicMaterial({ opacity: 0.2, transparent: true, color: 0x1246FC });

  return (
    <Sphere ref={modelRef} material={material} position={position} args={[radius, 8, 8]} />
  )
}