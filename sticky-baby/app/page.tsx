"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { RollingBall } from "@/components/rolling-ball"
import { CollectibleObject } from "@/components/collectible-object"
import { Meadow } from "@/components/meadow"

type GameObject = {
  id: number
  position: [number, number, number]
  modelUrl: string
  scale: number
  name: string
  emoji: string
}

const OBJECT_TEMPLATES = [
  { modelUrl: "/models/cinnabon.glb", scale: 1.5, name: "Cinnabon", emoji: "🍩" },
  { modelUrl: "/models/popsicle.glb", scale: 1.2, name: "Popsicle", emoji: "🍦" },
  { modelUrl: "/models/candy-collectible.glb", scale: 1.3, name: "Candy", emoji: "🍬" },
  { modelUrl: "/models/cupcake.glb", scale: 1.4, name: "Cupcake", emoji: "🧁" },
  { modelUrl: "/models/chocolate.glb", scale: 1.3, name: "Chocolate", emoji: "🍫" },
  { modelUrl: "/models/croissant-new.glb", scale: 1.3, name: "Croissant", emoji: "🥐" },
]

// Generate 50 objects randomly distributed
const generateObjects = (): GameObject[] => {
  const objects: GameObject[] = []
  for (let i = 0; i < 50; i++) {
    const template = OBJECT_TEMPLATES[i % OBJECT_TEMPLATES.length]
    const angle = (i / 50) * Math.PI * 2
    const distance = 5 + Math.random() * 15
    const x = Math.cos(angle) * distance + (Math.random() - 0.5) * 3
    const z = Math.sin(angle) * distance + (Math.random() - 0.5) * 3

    objects.push({
      id: i + 1,
      position: [x, 0, z],
      ...template,
    })
  }
  return objects
}

const INITIAL_OBJECTS = generateObjects()

export default function KatamariGame() {
  const [objects, setObjects] = useState<GameObject[]>(INITIAL_OBJECTS)
  const [collectedObjects, setCollectedObjects] = useState<GameObject[]>([])

  // Display game rules on load
  useEffect(() => {
    console.log(`
🎮 KATAMARI COLLECTION GAME
- Roll the ball using WASD or Arrow Keys to catch all the objects
- Collect objects as you roll around the meadow
- Hit R to restart and play again
- Collect all objects to win!
    `)
  }, [])

  const handleRestart = () => {
    setObjects(generateObjects())
    setCollectedObjects([])
  }

  const totalObjects = 50

  const isComplete = collectedObjects.length === totalObjects

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-300 to-sky-100">
      <Canvas shadows camera={{ position: [5, 8, 5], fov: 60 }}>
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
            shadow-bias={-0.001}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="park" />
          <ContactShadows opacity={0.7} scale={20} blur={2} />

          {/* Game Objects */}
          <Meadow />

          <RollingBall
            objects={objects}
            setObjects={setObjects}
            collectedObjects={collectedObjects}
            setCollectedObjects={setCollectedObjects}
            onRestart={handleRestart}
            obstacles={[]}
          />

          {objects.map((obj) => (
            <CollectibleObject key={obj.id} object={obj} />
          ))}

          {/* Camera Controls */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={3}
            maxDistance={100}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlays - OUTSIDE Canvas */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-md shadow-lg px-8 py-4 rounded-2xl">
          <p className="text-2xl font-bold text-center">
            Collected: {collectedObjects.length} / {totalObjects}
          </p>
          {isComplete && (
            <p className="text-green-600 font-semibold text-lg text-center mt-2">You collected everything!</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full">
          <p className="text-sm font-medium text-center">
            Use WASD or Arrow Keys to roll the ball! Press R to restart.
          </p>
        </div>
      </div>
    </div>
  )
}
