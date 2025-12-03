"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF, Center } from "@react-three/drei"
import type { Group } from "three"
import { Box3, Vector3, Quaternion } from "three"
import { CollectedObjectOnBall } from "./collected-object-on-ball"

type GameObject = {
  id: number
  position: [number, number, number]
  modelUrl: string
  scale: number
  name: string
  emoji: string
}

type Obstacle = {
  position: [number, number, number]
  size: [number, number, number]
}

type RollingBallProps = {
  objects: GameObject[]
  setObjects: (objects: GameObject[]) => void
  collectedObjects: GameObject[]
  setCollectedObjects: (objects: GameObject[]) => void
  onRestart: () => void
  obstacles: Obstacle[]
}

export function RollingBall({
  objects,
  setObjects,
  collectedObjects,
  setCollectedObjects,
  onRestart,
  obstacles,
}: RollingBallProps) {
  const groupRef = useRef<Group>(null!)
  const ballRef = useRef<Group>(null!)
  const collectedGroupRef = useRef<Group>(null!)

  const velocity = useRef({ x: 0, z: 0 })
  const rotationQuat = useRef(new Quaternion())

  const { camera } = useThree()

  const { scene } = useGLTF("/models/candy-v10.glb")

  const [modelHeight, setModelHeight] = useState(1)
  const [boundingBox, setBoundingBox] = useState({ width: 1, height: 1, depth: 1 })

  useEffect(() => {
    const clonedScene = scene.clone()
    const box = new Box3().setFromObject(clonedScene)
    const size = new Vector3()
    box.getSize(size)
    setModelHeight(size.y)
    setBoundingBox({ width: size.x, height: size.y, depth: size.z })

    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.roughness = 1.0
          child.material.metalness = 0.0
          child.material.needsUpdate = true
        }
      }
    })

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.roughness = 1.0
          child.material.metalness = 0.0
        }
      }
    })
  }, [scene])

  const baseScale = 3 // starting scale
  const growthPerItem = 0.15 // how much to grow per collected item
  const ballSize = baseScale + collectedObjects.length * growthPerItem

  useEffect(() => {
    const keys: { [key: string]: boolean } = {}

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true

      if (e.key.toLowerCase() === "r") {
        onRestart()
        velocity.current = { x: 0, z: 0 }
        rotationQuat.current = new Quaternion()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    const interval = setInterval(() => {
      const speed = 0.15

      const cameraDirection = new Vector3()
      camera.getWorldDirection(cameraDirection)

      const forward = new Vector3(cameraDirection.x, 0, cameraDirection.z).normalize()
      const right = new Vector3(-forward.z, 0, forward.x)

      let moveX = 0
      let moveZ = 0

      if (keys["w"] || keys["arrowup"]) {
        moveX += forward.x * speed
        moveZ += forward.z * speed
      }
      if (keys["s"] || keys["arrowdown"]) {
        moveX -= forward.x * speed
        moveZ -= forward.z * speed
      }
      if (keys["a"] || keys["arrowleft"]) {
        moveX -= right.x * speed
        moveZ -= right.z * speed
      }
      if (keys["d"] || keys["arrowright"]) {
        moveX += right.x * speed
        moveZ += right.z * speed
      }

      if (moveX !== 0 || moveZ !== 0) {
        velocity.current.x = moveX
        velocity.current.z = moveZ
      } else {
        velocity.current.x *= 0.85
        velocity.current.z *= 0.85
      }
    }, 16)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      clearInterval(interval)
    }
  }, [onRestart, camera])

  const checkObstacleCollision = (newX: number, newZ: number): boolean => {
    const scale = ballSize
    const halfWidth = (boundingBox.width * scale) / 2
    const halfDepth = (boundingBox.depth * scale) / 2

    for (const obstacle of obstacles) {
      const [obsX, , obsZ] = obstacle.position
      const [obsWidth, , obsDepth] = obstacle.size

      const babyMinX = newX - halfWidth
      const babyMaxX = newX + halfWidth
      const babyMinZ = newZ - halfDepth
      const babyMaxZ = newZ + halfDepth

      const obsMinX = obsX - obsWidth / 2
      const obsMaxX = obsX + obsWidth / 2
      const obsMinZ = obsZ - obsDepth / 2
      const obsMaxZ = obsZ + obsDepth / 2

      const collisionX = babyMaxX > obsMinX && babyMinX < obsMaxX
      const collisionZ = babyMaxZ > obsMinZ && babyMinZ < obsMaxZ

      if (collisionX && collisionZ) {
        return true
      }
    }
    return false
  }

  useFrame(() => {
    if (!groupRef.current || !ballRef.current) return

    const newX = groupRef.current.position.x + velocity.current.x
    const newZ = groupRef.current.position.z + velocity.current.z

    if (!checkObstacleCollision(newX, groupRef.current.position.z)) {
      groupRef.current.position.x = newX
    } else {
      velocity.current.x = 0
    }

    if (!checkObstacleCollision(groupRef.current.position.x, newZ)) {
      groupRef.current.position.z = newZ
    } else {
      velocity.current.z = 0
    }

    groupRef.current.position.y = (modelHeight * ballSize) / 2.5

    const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.z ** 2)
    if (speed > 0.001) {
      const rotationAxis = new Vector3(velocity.current.z, 0, -velocity.current.x).normalize()
      const rotationAngle = speed * 2

      const deltaQuat = new Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
      rotationQuat.current.premultiply(deltaQuat)
    }

    ballRef.current.quaternion.copy(rotationQuat.current)

    if (collectedGroupRef.current) {
      collectedGroupRef.current.quaternion.copy(rotationQuat.current)
    }

    const scale = ballSize
    const halfWidth = (boundingBox.width * scale) / 2
    const halfDepth = (boundingBox.depth * scale) / 2

    const babyX = groupRef.current.position.x
    const babyZ = groupRef.current.position.z

    objects.forEach((obj) => {
      const objX = obj.position[0]
      const objZ = obj.position[2]

      const withinX = Math.abs(babyX - objX) <= halfWidth
      const withinZ = Math.abs(babyZ - objZ) <= halfDepth

      if (withinX && withinZ) {
        setObjects(objects.filter((o) => o.id !== obj.id))
        setCollectedObjects([...collectedObjects, obj])
      }
    })
  })

  return (
    <group ref={groupRef}>
      <group ref={ballRef} scale={ballSize} castShadow>
        <Center>
          <primitive object={scene.clone()} />
        </Center>
      </group>

      <pointLight position={[0, 0, 0]} intensity={2} distance={ballSize * 8} color="#FDB813" castShadow />

      <group ref={collectedGroupRef}>
        {collectedObjects.map((obj, index) => (
          <CollectedObjectOnBall
            key={obj.id}
            object={obj}
            index={index}
            totalCollected={collectedObjects.length}
            ballSize={ballSize}
          />
        ))}
      </group>
    </group>
  )
}
