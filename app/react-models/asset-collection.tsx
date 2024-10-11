import { useLoader } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import * as THREE from 'three';
import { GLTFLoader } from "three-stdlib";
import { Octree } from "three-stdlib";

export default function AssetCollection({ worldOctree }: { worldOctree: Octree }) {
  const modelRef = useRef<THREE.Group>(null);

  const gltf = useLoader(GLTFLoader, '/models/Assets/Constructions and objects.glb');

  useEffect(() => {
    if (modelRef.current) {
      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(modelRef.current);
      console.log('Model loaded and added to Octree:', modelRef.current);
    }
  }, [worldOctree, gltf]);

  return (
    <group ref={modelRef} position={[0, 0, 0]} receiveShadow castShadow>
      {gltf.scene.children.map((child, index) => {
        if (child instanceof THREE.Mesh) {
          return (
            <mesh
              key={`asset_${index}`}
              geometry={child.geometry}
              material={new THREE.MeshStandardMaterial({ color: 0xffffff })}
              position={child.position}
              rotation={child.rotation}
              scale={child.scale}
              castShadow
              receiveShadow
            />
          );
        }
        return null; // Return null for non-mesh children
      })}
    </group>
  );
}
