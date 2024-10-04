import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader, Octree } from "three-stdlib";

export default function TestLevel({ worldOctree }: { worldOctree: Octree }) {
  const modelRef = useRef<THREE.Group>(null);

  // Load GLB model
  const gltf = useLoader(GLTFLoader, '/models/Uneven_Ground_Model.glb');

  useEffect(() => {
    if (modelRef.current) {
      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(modelRef.current);

      // Make all materials double-sided
      modelRef.current.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          if (Array.isArray(node.material)) {
            node.material.forEach((material) => {
              material.side = THREE.DoubleSide;
            });
          } else {
            node.material.side = THREE.DoubleSide;
          }
        }
      });


      // Optionally log or debug the loaded model
      console.log('Model loaded and added to Octree:', modelRef.current);
    }
  }, [worldOctree, gltf]);

  return (
    <group ref={modelRef} position={[0, -1, 0]} receiveShadow>
      <primitive object={gltf.scene} />
    </group>
  )
}