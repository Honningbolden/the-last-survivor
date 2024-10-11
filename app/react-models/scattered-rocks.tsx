import { useEffect, useMemo, useRef } from "react"
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import * as THREE from 'three';
import { Instance, Instances } from "@react-three/drei";

export default function ScatteredRocks({ instanceCount = 1000 }) {
  const gltf = useLoader(GLTFLoader, '/models/Assets/Low Poly Rock Instances.glb');

  // Extract the nodes from the GLTF
  const { nodes } = gltf;

  // Prepare positions, rotations, and scales from the nodes
  const instanceProps = useMemo(() => {
    const props = [];
    if (!nodes) return props;

    // Traverse through nodes to extract transform properties
    Object.keys(nodes).forEach((key) => {
      const node = nodes[key];
      if (node instanceof THREE.Mesh) {
        props.push({
          position: node.position.clone(), // Using the position from the node
          rotation: node.rotation.clone(), // Using the rotation from the node
          scale: node.scale.clone(), // Using the scale from the node
        });
      }
    });

    return props;
  }, [nodes]);

  // Create geometry and material for a simple white cube
  const geometry = useMemo(() => new THREE.SphereGeometry(0.3, 4, 4), []);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: "#888888", roughness: 0.9, metalness: 0.2, flatShading: true }), []);

  return (
    <Instances
      geometry={geometry}
      material={material}
      limit={instanceProps.length}
      range={instanceProps.length}
      frustumCulled={false}
    >
      {instanceProps.map((props, i) => (
        <Instance receiveShadow castShadow
          key={`instance_${i}`}
          position={props.position}
          rotation={props.rotation}
          scale={Math.min(0.5, Math.random()/Math.sqrt(2))}
        />
      ))}
    </Instances>
  );
}
