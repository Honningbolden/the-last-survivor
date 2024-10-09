import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader, Octree } from "three-stdlib";

export default function BlockoutTerrain({ worldOctree }: { worldOctree: Octree }) {
  const modelRef = useRef<THREE.Group>(null);

  // Load GLB model
  const gltf = useLoader(GLTFLoader, '/models/blockout/blockout_terrain.glb');

  useEffect(() => {
    if (modelRef.current && gltf.scene) {
      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(modelRef.current);

      // Traverse through the model and apply a material to each mesh
      gltf.scene.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.material = new THREE.MeshStandardMaterial({
            color: 0xaa5533, // Example color for mountains
            roughness: 0.9,
            metalness: 0.1,
          });
        }
      });
    }
  }, [worldOctree, gltf]);

  return (
    <group ref={modelRef} position={[0, 0, 0]} receiveShadow>
      <primitive object={gltf.scene} />
    </group>
  )
}