"use client"

import { useRef } from "react"
import type { Mesh } from "three"

export function Kitchen() {
  const kitchenRef = useRef<Mesh>(null)

  return (
    <group ref={kitchenRef} position={[0, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[100, 0.1, 100]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 15, -50]} receiveShadow>
        <boxGeometry args={[100, 30, 1]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
      </mesh>

      {/* Side Wall - Left */}
      <mesh position={[-50, 15, 0]} receiveShadow>
        <boxGeometry args={[1, 30, 100]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.9} />
      </mesh>

      {/* Lower Cabinets - Left Side */}
      <mesh position={[-30, 3, -48]} castShadow receiveShadow>
        <boxGeometry args={[25, 6, 4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Lower Cabinets - Right Side */}
      <mesh position={[20, 3, -48]} castShadow receiveShadow>
        <boxGeometry args={[35, 6, 4]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Countertop - Left */}
      <mesh position={[-30, 6.3, -46.5]} castShadow receiveShadow>
        <boxGeometry args={[26, 0.6, 5]} />
        <meshStandardMaterial color="#2f4f4f" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Countertop - Right */}
      <mesh position={[20, 6.3, -46.5]} castShadow receiveShadow>
        <boxGeometry args={[36, 0.6, 5]} />
        <meshStandardMaterial color="#2f4f4f" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Stove */}
      <mesh position={[-5, 7, -46.5]} castShadow>
        <boxGeometry args={[10, 1.2, 4.5]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Stove Burners */}
      <mesh position={[-7, 7.8, -47.5]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-3, 7.8, -47.5]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-7, 7.8, -45.5]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[-3, 7.8, -45.5]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Upper Cabinets - Left */}
      <mesh position={[-30, 18, -48.5]} castShadow receiveShadow>
        <boxGeometry args={[25, 9, 3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Upper Cabinets - Right */}
      <mesh position={[20, 18, -48.5]} castShadow receiveShadow>
        <boxGeometry args={[35, 9, 3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Refrigerator */}
      <mesh position={[-47, 9, -45]} castShadow receiveShadow>
        <boxGeometry args={[5, 18, 5]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Fridge Handle */}
      <mesh position={[-44, 12, -42]} castShadow>
        <boxGeometry args={[0.3, 2.5, 0.5]} />
        <meshStandardMaterial color="#888888" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Sink */}
      <mesh position={[32, 6, -46.5]} castShadow>
        <boxGeometry args={[6, 1.5, 4]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Faucet Base */}
      <mesh position={[32, 7, -48.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Faucet Spout */}
      <mesh position={[32, 8.5, -47]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 2, 16]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Kitchen Island */}
      <mesh position={[0, 3, 10]} castShadow receiveShadow>
        <boxGeometry args={[30, 6, 15]} />
        <meshStandardMaterial color="#a0522d" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Island Countertop */}
      <mesh position={[0, 6.3, 10]} castShadow receiveShadow>
        <boxGeometry args={[31, 0.6, 16]} />
        <meshStandardMaterial color="#2f4f4f" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Kitchen Lights */}
      <pointLight position={[0, 25, -20]} intensity={15} distance={60} castShadow />
      <pointLight position={[0, 25, 10]} intensity={12} distance={50} />
      <pointLight position={[-30, 25, 0]} intensity={10} distance={50} />
      <pointLight position={[30, 25, 0]} intensity={10} distance={50} />
    </group>
  )
}
