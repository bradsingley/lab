"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"

type GameObject = {
  id: number
  position: [number, number, number]
  modelUrl: string
  scale: number
  name: string
  emoji: string
}

type CollectibleObjectProps = {
  object: GameObject
}

export function CollectibleObject({ object }: CollectibleObjectProps) {
  const groupRef = useRef<Group>(null!)
  const { scene } = useGLTF(object.modelUrl)

  useFrame((state) => {
    if (!groupRef.current) return

    // Rotation animation
    groupRef.current.rotation.y += 0.01

    // Float animation
    const time = state.clock.getElapsedTime() + object.id
    groupRef.current.position.y = Math.sin(time) * 0.1
  })

  return (
    <group ref={groupRef} position={object.position}>
      <primitive object={scene.clone()} scale={object.scale} />
    </group>
  )
}
