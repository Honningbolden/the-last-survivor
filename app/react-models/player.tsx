import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Capsule, Octree } from "three-stdlib";

// Utility Variables
const STEPS_PER_FRAME = 5;

// Environmental Forces
const GRAVITY = 5;
const MAX_SLIDING_FORCE = 10; // Maximum sliding force for steep slopes
const MAX_SLIDING_SPEED = 5; // Limit the sliding speed to prevent uncontrollable flying
const MAX_SLOPE_ANGLE = 50;

// Base speed values
const JUMP_FORCE = 2;
const GROUND_SPEED = 4;
const AIR_SPEED = 2;

class Player {
  camera: THREE.Camera;
  worldOctree: Octree;
  playerCollider: Capsule;
  playerVelocity: THREE.Vector3;
  playerDirection: THREE.Vector3;
  playerOnFloor: boolean;
  gravity: number;

  constructor(camera: THREE.Camera, worldOctree: Octree, playerCollider: Capsule) {
    this.camera = camera;
    this.worldOctree = worldOctree;
    this.playerCollider = playerCollider;
    this.playerVelocity = new THREE.Vector3();
    this.playerDirection = new THREE.Vector3();
    this.playerOnFloor = false;
    this.gravity = GRAVITY;
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
        const slidingForce = MAX_SLIDING_FORCE * (slopeAngle - MAX_SLOPE_ANGLE) / (90 - MAX_SLOPE_ANGLE);
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

  handleMovement(deltaTime: number, keyStates: { [key: string]: boolean }) {
    const targetSpeed = deltaTime * (this.playerOnFloor ? GROUND_SPEED : AIR_SPEED);

    // Calculate directional velocities based on input
    const movementVector = new THREE.Vector3();

    if (keyStates['KeyW']) {
      movementVector.add(this.getForwardVector());
    }
    if (keyStates['KeyS']) {
      movementVector.add(this.getForwardVector().multiplyScalar(-1));
    }
    if (keyStates['KeyA']) {
      movementVector.add(this.getSideVector().multiplyScalar(-1));
    }
    if (keyStates['KeyD']) {
      movementVector.add(this.getSideVector());
    }

    // Normalize the movement vector to ensure uniform speed and apply target speed
    if (movementVector.length() > 0) {
      movementVector.normalize().multiplyScalar(targetSpeed);
      this.playerVelocity.add(movementVector);
    }

    // Handle jumping separately
    if (this.playerOnFloor && keyStates['Space']) {
      this.playerVelocity.y = JUMP_FORCE; // Allow jumping only when on the floor
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

export default function PlayerComponent({ worldOctree, playerCollider }: { worldOctree: Octree, playerCollider: React.RefObject<Capsule> }) {
  const { camera } = useThree();
  // const playerColliderRef = useRef(new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35));
  const [keyStates, setKeyStates] = useState({});
  const player = useRef<Player>();
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    // Initialize the Player object
    if (playerCollider.current) {
      player.current = new Player(camera, worldOctree, playerCollider.current);
      camera.rotation.order = 'YXZ';

      const onKeyDown = (event: KeyboardEvent) => setKeyStates((state) => ({ ...state, [event.code]: true }));
      const onKeyUp = (event: KeyboardEvent) => setKeyStates((state) => ({ ...state, [event.code]: false }));
      const onMouseDown = () => document.body.requestPointerLock();
      const onMouseMove = (event: MouseEvent) => {
        if (document.pointerLockElement === document.body) {
          camera.rotation.y -= event.movementX / 250;
          camera.rotation.x -= event.movementY / 250;
        }
      };

      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);

      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("mousedown", onMouseDown);
        document.removeEventListener("mousemove", onMouseMove);
      };
    }
  }, [camera, playerCollider, worldOctree]);

  useFrame(() => {
    const deltaTime = Math.min(0.05, clock.current.getDelta()) / STEPS_PER_FRAME;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      if (player.current) {
        // Update player and handle movement each substep
        player.current.updatePlayer(deltaTime);
        player.current.handleMovement(deltaTime, keyStates);
        // Here you could also call other update functions (e.g., updateSpheres, teleportPlayerIfOob, etc.)
      }
    }
  });

  return null;
}