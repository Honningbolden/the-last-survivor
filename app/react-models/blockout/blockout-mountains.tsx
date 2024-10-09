import { useLoader } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from 'three';
import { GLTFLoader } from "three-stdlib";
import { Octree } from "three-stdlib";

export default function BlockoutMountains({ worldOctree }: { worldOctree: Octree }) {
  const modelRef = useRef<THREE.Group>(null);

  // Load GLB model
  const gltf = useLoader(GLTFLoader, '/models/blockout/blockout_mountains.glb');

  useEffect(() => {
    if (modelRef.current) {
      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(modelRef.current);

      // Optionally log or debug the loaded model
      console.log('Model loaded and added to Octree:', modelRef.current);
    }
  }, [worldOctree, gltf]);

  return (
    <group ref={modelRef} position={[0, 0, 0]} receiveShadow castShadow>
      <primitive object={gltf.scene} />
    </group>
  )
}