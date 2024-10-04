import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { Octree } from 'three-stdlib';

export default function Ground({ worldOctree }: {worldOctree: Octree}) {
  const groundMesh = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (groundMesh.current) {
      // Add the ground mesh to the Octree for collision detection
      worldOctree.fromGraphNode(groundMesh.current);
    }
  }, [worldOctree]);

  return (
    <mesh
      ref={groundMesh}
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]} // Flat horizontal plane
      position={[0, -1, 0]} // Position the ground
    >
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color={0x808080} />
    </mesh>
  )
}