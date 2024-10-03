// export default function Ground() {
//   return (
//     <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
//       <planeGeometry args={[100, 100]} />
//       <shadowMaterial transparent opacity={0.5} />
//       <meshStandardMaterial color={0xffffff}/>
//     </mesh>
//   )
// }

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Octree } from 'three-stdlib';

export default function Ground({ worldOctree }) {
  const groundMesh = useRef<THREE.Mesh>();

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