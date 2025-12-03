"use client"

import { useRef } from "react"
import type { Mesh } from "three"

type ObstacleProps = {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}

export function Obstacle({ position, size, color = "#8B4513" }: ObstacleProps) {
  const meshRef = useRef<Mesh>(null!)

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
    </mesh>
  )
}
