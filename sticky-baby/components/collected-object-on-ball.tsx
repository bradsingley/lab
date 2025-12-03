"use client"

import { useGLTF } from "@react-three/drei"

type GameObject = {
  id: number
  position: [number, number, number]
  modelUrl: string
  scale: number
  name: string
  emoji: string
}

type CollectedObjectOnBallProps = {
  object: GameObject
  index: number
  totalCollected: number
  ballSize: number
}

export function CollectedObjectOnBall({ object, index, totalCollected, ballSize }: CollectedObjectOnBallProps) {
  const { scene } = useGLTF(object.modelUrl)

  // Use spherical coordinates for better distribution
  const phi = Math.acos(-1 + (2 * index) / totalCollected)
  const theta = Math.sqrt(totalCollected * Math.PI) * phi

  // The baby model is roughly 0.5 units in radius, so multiply by ballSize to match
  const radius = ballSize * 0.25

  const x = radius * Math.cos(theta) * Math.sin(phi)
  const y = radius * Math.sin(theta) * Math.sin(phi) - radius * 0.15
  const z = radius * Math.cos(phi)

  const objectScale = object.scale * 0.3 * (ballSize / 3)

  return <primitive object={scene.clone()} scale={objectScale} position={[x, y, z]} />
}
