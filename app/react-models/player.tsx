import { useFrame, useThree } from '@react-three/fiber';
import { useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Capsule, Octree } from 'three-stdlib';
import { useDirection, useDistance } from '../components/get-direction';

// Hand recognition packages
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@mediapipe/hands';
import '@tensorflow/tfjs-backend-webgl';

// Utility Variables
const STEPS_PER_FRAME = 5;

// Environmental Forces
const GRAVITY = 5;
const MAX_SLIDING_FORCE = 10; // Maximum sliding force for steep slopes
const MAX_SLIDING_SPEED = 5; // Limit the sliding speed to prevent uncontrollable flying
const MAX_SLOPE_ANGLE = 50;

// Base speed values
const GROUND_SPEED = 8;
const AIR_SPEED = 2;

class Player {
  camera: THREE.Camera;
  worldOctree: Octree;
  playerCollider: Capsule;
  playerVelocity: THREE.Vector3;
  playerDirection: THREE.Vector3;
  playerOnFloor: boolean;
  gravity: number;
  detector: handPoseDetection.HandDetector | null;
  // video: HTMLVideoElement;

  constructor(camera: THREE.Camera, worldOctree: Octree, playerCollider: Capsule) {
    this.camera = camera;
    this.worldOctree = worldOctree;
    this.playerCollider = playerCollider;
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.playerOnFloor = false;
    this.gravity = GRAVITY;
    this.detector = null;
  }

  updatePlayer(deltaTime: number) {
    let damping = Math.exp(-4 * deltaTime) - 1;

    // Apply gravity when not on the floor
    if (!this.playerOnFloor) {
      this.playerVelocity.y -= this.gravity * deltaTime;
      damping *= 0.1; // small air resistance to reduce rapid acceleration
    }

    // Apply damping to slow down the player over time (simulates ground friction)
    this.playerVelocity.addScaledVector(this.playerVelocity, damping);

    // Update player position based on velocity
    const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(deltaPosition);

    this.checkCollisions();

    // Sync camera position with player position
    this.camera.position.copy(this.playerCollider.end);
  }

  checkCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    this.playerOnFloor = false;

    if (result) {
      // Calculate the slope angle using the normal vector
      const slopeAngle = Math.acos(result.normal.dot(new THREE.Vector3(0, 1, 0))) * (180 / Math.PI);

      // If the slope angle is below or equal to the angle limit (50 degrees), consider the player on the floor
      if (slopeAngle <= MAX_SLOPE_ANGLE) {
        this.playerOnFloor = result.normal.y > 0;
      }

      // If the player is not on the floor apply sliding mechanics
      if (!this.playerOnFloor) {
        // Calculate sliding force proportional to the steepness of the slope
        const slidingForce =
          (MAX_SLIDING_FORCE * (slopeAngle - MAX_SLOPE_ANGLE)) / (90 - MAX_SLOPE_ANGLE);
        // Limit sliding force to a reasonable value
        const effectiveSlidingForce = Math.min(slidingForce, MAX_SLIDING_FORCE);

        // Apply the sliding force along the slope direction
        const slidingVector = result.normal.clone().multiplyScalar(-effectiveSlidingForce);
        this.playerVelocity.add(slidingVector);

        // Apply additional gravity force for sliding
        this.playerVelocity.y -= this.gravity * 0.1;

        // Limit the player's sliding speed to prevent flying off ledges
        if (this.playerVelocity.length() > MAX_SLIDING_SPEED) {
          this.playerVelocity.setLength(MAX_SLIDING_SPEED);
        }
      }

      // Adjust plater position to prevent clipping into objects
      if (result.depth >= 1e-10) {
        this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
      }
    }
  }

  handleMovement(
    deltaTime: number,
    direction: THREE.Vector3 | null,
    distance: number | null,
    setCameraRotation: (rotation: { x: number; y: number }) => void,
  ) {
    const speedMultiplier = distance !== null ? (distance - 0.05) / (0.15 - 0.05) : 1; // Normalize distance to a range of 0 to 1
    const targetSpeed =
      deltaTime * (this.playerOnFloor ? GROUND_SPEED : AIR_SPEED) * speedMultiplier;

    // Calculate directional velocities based on input
    const movementVector = new THREE.Vector3();

    if (distance) {
      movementVector.add(this.getForwardVector());
    }

    // Normalize the movement vector to ensure uniform speed and apply target speed
    if (movementVector.length() > 0) {
      movementVector.normalize().multiplyScalar(targetSpeed);
      this.playerVelocity.add(movementVector);
    }

    // // Handle jumping separately
    // if (this.playerOnFloor && keyStates['Space']) {
    //   this.playerVelocity.y = JUMP_FORCE; // Allow jumping only when on the floor
    // }

    // Use the direction from the hand to control the camera rotation
    if (direction) {
      const rotationY = Math.atan2(direction.x, direction.z);
      const rotationX = -Math.asin(direction.y);
      setCameraRotation({
        x: this.camera.rotation.x + rotationX,
        y: this.camera.rotation.y + rotationY,
      });
    }
  }

  getForwardVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    return this.playerDirection;
  }

  getSideVector() {
    this.camera.getWorldDirection(this.playerDirection);
    this.playerDirection.y = 0;
    this.playerDirection.normalize();
    this.playerDirection.cross(this.camera.up);
    return this.playerDirection;
  }
}

export default function PlayerComponent({
  worldOctree,
  playerCollider,
}: {
  worldOctree: Octree;
  playerCollider: React.RefObject<Capsule>;
}) {
  const { camera } = useThree();
  // const playerColliderRef = useRef(new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35));
  // const [keyStates, setKeyStates] = useState({});
  const player = useRef<Player>();
  const clock = useRef(new THREE.Clock());
  const { direction } = useDirection();
  const { distance } = useDistance();

  // Create spring values for camera rotation
  const springRotationX = useSpring(0, { stiffness: 10, damping: 40 });
  const springRotationY = useSpring(0, { stiffness: 10, damping: 40 });

  useEffect(() => {
    // Initialize the Player object
    if (playerCollider.current) {
      player.current = new Player(camera, worldOctree, playerCollider.current);
      camera.rotation.order = 'YXZ';

      // const onKeyDown = (event: KeyboardEvent) => setKeyStates((state) => ({ ...state, [event.code]: true }));
      // const onKeyUp = (event: KeyboardEvent) => setKeyStates((state) => ({ ...state, [event.code]: false }));
      // const onMouseDown = () => document.body.requestPointerLock();

      // document.addEventListener("keydown", onKeyDown);
      // document.addEventListener("keyup", onKeyUp);
      // document.addEventListener("mousedown", onMouseDown);

      // return () => {
      //   document.removeEventListener("keydown", onKeyDown);
      //   document.removeEventListener("keyup", onKeyUp);
      //   document.removeEventListener("mousedown", onMouseDown);
      // };
    }
  }, [camera, playerCollider, worldOctree]);

  useFrame(() => {
    const deltaTime = Math.min(0.05, clock.current.getDelta()) / STEPS_PER_FRAME;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      if (player.current) {
        // Update player and handle movement each substep
        player.current.updatePlayer(deltaTime);
        player.current.handleMovement(deltaTime, direction, distance, ({ x, y }) => {
          springRotationX.set(x);
          springRotationY.set(y);
        });
        // Here you could also call other update functions (e.g., updateSpheres, teleportPlayerIfOob, etc.)
      }
    }

    // Apply the spring rotation to the camera
    camera.rotation.x = springRotationX.get();
    camera.rotation.y = springRotationY.get();
  });

  return null;
}
