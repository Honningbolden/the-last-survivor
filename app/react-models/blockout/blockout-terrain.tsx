import { useLoader } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { GLTFLoader, Octree } from "three-stdlib";

export default function BlockoutTerrain({ worldOctree }: { worldOctree: Octree }) {
  const modelRef = useRef<THREE.Group | null>(null);

  // Load GLB model
  const gltf = useLoader(GLTFLoader, '/models/blockout/blockout_terrain.glb');

  useEffect(() => {
    if (gltf && gltf.scene) {
      // Set model reference to the loaded glTF scene
      modelRef.current = gltf.scene;

      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(gltf.scene);

      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = (mesh.material as THREE.Material).clone();

          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map(() => new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.5,
              roughness: 0.5,
            }));
          } else {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              metalness: 0.5,
              roughness: 0.5,
            });
          }

          // Set shadow properties
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      // Optionally log or debug the loaded model
      console.log('Model loaded and added to Octree:', gltf.scene);
    }
  }, [worldOctree, gltf]);


  return (
    <group ref={modelRef} position={[0, 0, 0]} receiveShadow castShadow>
      <primitive object={gltf.scene} />
    </group>
  )
}