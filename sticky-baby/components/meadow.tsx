"use client"

export function Meadow() {
  const tileSize = 5
  const gridSize = 20
  const tileOverlap = 0.01
  const tiles = []

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      const isWhite = (x + z) % 2 === 0
      const color = isWhite ? "#fffef0" : "#e8d86e"
      const posX = (x - gridSize / 2 + 0.5) * tileSize
      const posZ = (z - gridSize / 2 + 0.5) * tileSize

      tiles.push(
        <mesh key={`tile-${x}-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[posX, 0, posZ]} receiveShadow>
          <planeGeometry args={[tileSize + tileOverlap, tileSize + tileOverlap]} />
          <meshStandardMaterial
            color={color}
            roughness={0.3}
            metalness={0.1}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>,
      )
    }
  }

  return <>{tiles}</>
}
