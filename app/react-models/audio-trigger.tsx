import { Capsule } from 'three-stdlib';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';
import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

export default function TriggerZone({
  position,
  radius,
  playerCollider,
  onTrigger,
  enabled = false,
  color = '#ffffff',
  opacity = 0.1,
}: {
  position: [number, number, number];
  radius: number;
  playerCollider: React.MutableRefObject<Capsule>;
  onTrigger: () => void;
  enabled?: boolean;
  color?: string;
  opacity?: number;
}) {
  const modelRef = useRef<THREE.Mesh>(null);
  const hasTriggered = useRef(false);

  // If player spawns inside an enabled zone, fire immediately
  useEffect(() => {
    if (enabled && !hasTriggered.current && playerCollider.current) {
      const playerPos = playerCollider.current.start.clone().add(playerCollider.current.end).multiplyScalar(0.5);
      const triggerPos = new THREE.Vector3(...position);
      if (playerPos.distanceTo(triggerPos) <= radius) {
        hasTriggered.current = true;
        onTrigger();
      }
    }
  }, [enabled, position, radius, onTrigger, playerCollider]);

  useFrame(() => {
    if (!enabled || hasTriggered.current) return;
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
  });

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), transparent: true, opacity }), [color, opacity]);

  return <Sphere ref={modelRef} material={material} position={position} args={[radius, 16, 16]} />;
}
