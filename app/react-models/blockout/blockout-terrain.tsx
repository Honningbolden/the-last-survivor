import { useLoader } from "@react-three/fiber";
import { useRef, useEffect, memo } from "react";
import * as THREE from 'three';
import { GLTFLoader } from "three-stdlib";
import { Octree } from "three-stdlib";
import { SimplexNoise } from "three-stdlib";

const noise = new SimplexNoise();

const BlockoutTerrain = memo(({ worldOctree }: { worldOctree: Octree }) => {
  const modelRef = useRef<THREE.Group>(null);

  // Load GLB model and extract nodes
  const { nodes } = useLoader(GLTFLoader, '/models/blockout/blockout_terrain.glb');

  useEffect(() => {
    if (modelRef.current) {
      // Add the level geometry to the Octree for collision detection
      worldOctree.fromGraphNode(modelRef.current);
      console.log('Model loaded and added to Octree:', modelRef.current);
    }
  }, [worldOctree, nodes]);

  return (
    <group ref={modelRef} position={[0, 0, 0]} receiveShadow castShadow>
      {/* Apply material to individual nodes */}
      {Object.keys(nodes).map((key, index) => {
        const node = nodes[key];
        if (node instanceof THREE.Mesh) {
          return (
            <mesh
              key={index}
              geometry={node.geometry}
              position={node.position}
              rotation={node.rotation}
              scale={node.scale}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#888888" roughness={0.9} metalness={0.2} flatShading />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
})

BlockoutTerrain.displayName = 'BlockoutTerrain';

export default BlockoutTerrain;