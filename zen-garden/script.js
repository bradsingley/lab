import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  gridWidth: 1024,
  gridHeight: 16,
  gridDepth: 1024,
  chunkSize: 16,
  angleOfRepose: 1,
  stepsPerFrame: 1,
  rakeTeeth: 4,
  rakeTeethSpacing: 12,
  rakeTeethRadius: 4,
  rakeDepth: 2,
  gardenWorldSize: 12.8,
  get voxelSize() { return this.gardenWorldSize / this.gridWidth; },
  sandColor: 0xebe4d7,
  baseHeight: 6,
  rockColor: 0x3a3a3a,
  rocks: [
    { diameter: 250, heightRatio: 0.4 },  // Large rock
    { diameter: 100, heightRatio: 0.5 },  // Medium rock (near small)
    { diameter: 75, heightRatio: 0.55 }   // Small rock (near medium)
  ]
};

// ============================================
// HEIGHTMAP GRID (2D instead of 3D for memory efficiency)
// ============================================
class VoxelGrid {
  constructor(width, height, depth) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    // Use 2D heightmap instead of 3D array (saves ~15MB)
    this.heights = new Uint8Array(width * depth);
  }
  
  getHeight(x, z) {
    if (x < 0 || x >= this.width || z < 0 || z >= this.depth) return 0;
    return this.heights[x + z * this.width];
  }
  
  setHeight(x, z, h) {
    if (x < 0 || x >= this.width || z < 0 || z >= this.depth) return;
    this.heights[x + z * this.width] = Math.max(0, Math.min(this.height, h));
  }
  
  fillToHeight(h) {
    this.heights.fill(Math.max(0, Math.min(this.height, h)));
  }
}

// ============================================
// CHUNK MANAGER
// ============================================
class ChunkManager {
  constructor(grid, chunkSize) {
    this.grid = grid;
    this.chunkSize = chunkSize;
    this.chunksX = Math.ceil(grid.width / chunkSize);
    this.chunksZ = Math.ceil(grid.depth / chunkSize);
    this.dirtyChunks = new Set();
    this.activeChunks = new Set();
    this.markAllDirty();
  }
  
  getChunkKey(cx, cz) { return cx + ',' + cz; }
  
  markDirty(cx, cz) {
    if (cx >= 0 && cx < this.chunksX && cz >= 0 && cz < this.chunksZ) {
      this.dirtyChunks.add(this.getChunkKey(cx, cz));
    }
  }
  
  markActive(cx, cz) {
    if (cx >= 0 && cx < this.chunksX && cz >= 0 && cz < this.chunksZ) {
      this.activeChunks.add(this.getChunkKey(cx, cz));
    }
  }
  
  markAllDirty() {
    for (let cz = 0; cz < this.chunksZ; cz++) {
      for (let cx = 0; cx < this.chunksX; cx++) {
        this.markDirty(cx, cz);
      }
    }
  }
  
  markAllActive() {
    for (let cz = 0; cz < this.chunksZ; cz++) {
      for (let cx = 0; cx < this.chunksX; cx++) {
        this.markActive(cx, cz);
      }
    }
  }
  
  clearDirty() { this.dirtyChunks.clear(); }
  clearActive() { this.activeChunks.clear(); }
  
  markVoxelChanged(x, z) {
    const cx = Math.floor(x / this.chunkSize);
    const cz = Math.floor(z / this.chunkSize);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        this.markDirty(cx + dx, cz + dz);
        this.markActive(cx + dx, cz + dz);
      }
    }
  }
}

// ============================================
// SAND SIMULATOR (45 degree angle of repose)
// ============================================
class SandSimulator {
  constructor(grid, chunkManager) {
    this.grid = grid;
    this.cm = chunkManager;
  }
  
  step() {
    const activeChunks = Array.from(this.cm.activeChunks);
    this.cm.clearActive();
    
    for (const key of activeChunks) {
      const [cx, cz] = key.split(',').map(Number);
      const startX = cx * this.cm.chunkSize;
      const startZ = cz * this.cm.chunkSize;
      const endX = Math.min(startX + this.cm.chunkSize, this.grid.width);
      const endZ = Math.min(startZ + this.cm.chunkSize, this.grid.depth);
      
      for (let z = startZ; z < endZ; z++) {
        for (let x = startX; x < endX; x++) {
          this.processColumn(x, z);
        }
      }
    }
  }
  
  processColumn(x, z) {
    const h = this.grid.getHeight(x, z);
    if (h === 0) return;
    
    const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dz] of neighbors) {
      const nx = x + dx, nz = z + dz;
      if (nx < 0 || nx >= this.grid.width || nz < 0 || nz >= this.grid.depth) continue;
      
      const nh = this.grid.getHeight(nx, nz);
      if (h - nh > CONFIG.angleOfRepose) {
        this.grid.setHeight(x, z, h - 1);
        this.grid.setHeight(nx, nz, nh + 1);
        this.cm.markVoxelChanged(x, z);
        this.cm.markVoxelChanged(nx, nz);
        return;
      }
    }
  }
}

// ============================================
// RAKE CONTROLLER
// ============================================
class RakeController {
  constructor(grid, chunkManager) {
    this.grid = grid;
    this.cm = chunkManager;
    this.lastPos = null;
    this.isActive = false;
  }
  
  worldToGrid(wx, wz) {
    const half = CONFIG.gardenWorldSize / 2;
    return {
      x: Math.floor(((wx + half) / CONFIG.gardenWorldSize) * CONFIG.gridWidth),
      z: Math.floor(((wz + half) / CONFIG.gardenWorldSize) * CONFIG.gridDepth)
    };
  }
  
  rake(wx, wz, dx, dz) {
    const { x: cx, z: cz } = this.worldToGrid(wx, wz);
    const len = Math.sqrt(dx * dx + dz * dz);
    let perpX = 0, perpZ = 1;
    if (len > 0.01) {
      perpX = -dz / len; perpZ = dx / len;
    }
    
    // 6 teeth aligned perpendicular to movement direction
    const spacing = CONFIG.rakeTeethSpacing;
    const numTeeth = CONFIG.rakeTeeth;
    const halfSpan = (numTeeth - 1) / 2;
    
    // First dig the grooves and track removed sand per tooth
    const teeth = [];
    for (let i = 0; i < numTeeth; i++) {
      const off = (i - halfSpan);
      const tx = Math.round(cx + perpX * off * spacing);
      const tz = Math.round(cz + perpZ * off * spacing);
      const removed = this.applyTooth(tx, tz);
      teeth.push({ off, removed, tx, tz });
    }
    
    // Create ridges between each pair of teeth
    for (let i = 0; i < numTeeth - 1; i++) {
      const midOff = (teeth[i].off + teeth[i + 1].off) / 2;
      const rx = Math.round(cx + perpX * midOff * spacing);
      const rz = Math.round(cz + perpZ * midOff * spacing);
      if (rx >= 0 && rx < this.grid.width && rz >= 0 && rz < this.grid.depth) {
        const sandToAdd = (teeth[i].removed + teeth[i + 1].removed) / 2;
        if (sandToAdd > 0) {
          const rh = this.grid.getHeight(rx, rz);
          const add = Math.ceil(sandToAdd / 4);
          this.grid.setHeight(rx, rz, Math.min(this.grid.height - 1, rh + add));
          this.cm.markVoxelChanged(rx, rz);
        }
      }
    }
  }
  
  applyTooth(cx, cz) {
    const r = CONFIG.rakeTeethRadius;
    let removed = 0;
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx, z = cz + dz;
        if (x < 0 || x >= this.grid.width || z < 0 || z >= this.grid.depth) continue;
        
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > r) continue;
        
        const h = this.grid.getHeight(x, z);
        const factor = 1 - dist / r;
        const dig = Math.floor(CONFIG.rakeDepth * factor);
        
        if (dig > 0 && h > 0) {
          const newH = Math.max(1, h - dig);
          removed += h - newH;
          this.grid.setHeight(x, z, newH);
          this.cm.markVoxelChanged(x, z);
        }
      }
    }
    return removed;
  }
  
  start(wx, wz) { this.isActive = true; this.lastPos = { x: wx, z: wz }; }
  
  update(wx, wz) {
    if (!this.isActive || !this.lastPos) return;
    const dx = wx - this.lastPos.x, dz = wz - this.lastPos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > 0.0005) {
      // Interpolate for smoother lines - very fine steps
      const stepSize = 0.001;
      const steps = Math.max(1, Math.ceil(dist / stepSize));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const ix = this.lastPos.x + dx * t;
        const iz = this.lastPos.z + dz * t;
        this.rake(ix, iz, dx, dz);
      }
      this.lastPos = { x: wx, z: wz };
    }
  }
  
  end() { this.isActive = false; this.lastPos = null; }
}

// ============================================
// VOXEL RENDERER
// ============================================
class VoxelRenderer {
  constructor(scene, grid, cm, container) {
    this.grid = grid;
    this.cm = cm;
    this.container = container || scene;
    this.maxVoxels = grid.width * grid.depth;
    
    const geo = new THREE.BoxGeometry(CONFIG.voxelSize, CONFIG.voxelSize, CONFIG.voxelSize);
    const mat = new THREE.MeshStandardMaterial({ 
      color: CONFIG.sandColor, 
      roughness: 0.85,
      metalness: 0.02,
      flatShading: false,
      envMapIntensity: 0.3
    });
    
    this.mesh = new THREE.InstancedMesh(geo, mat, this.maxVoxels);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.frustumCulled = false;
    
    // Enable per-instance color for subtle variation
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(this.maxVoxels * 3), 3
    );
    
    // Add to container (gardenContainer for rotation)
    this.container.add(this.mesh);
    
    this.dummy = new THREE.Object3D();
    this.baseColor = new THREE.Color(CONFIG.sandColor);
    this.tempColor = new THREE.Color();
    
    this.fullUpdate();
  }
  
  fullUpdate() {
    const half = CONFIG.gardenWorldSize / 2;
    let count = 0;
    
    for (let z = 0; z < this.grid.depth && count < this.maxVoxels; z++) {
      for (let x = 0; x < this.grid.width && count < this.maxVoxels; x++) {
        const h = this.grid.getHeight(x, z);
        if (h > 0) {
          const wx = (x / this.grid.width) * CONFIG.gardenWorldSize - half;
          const wy = 0.26 + (h - 0.5) * CONFIG.voxelSize; // Offset to sit on garden bottom
          const wz = (z / this.grid.depth) * CONFIG.gardenWorldSize - half;
          this.dummy.position.set(wx, wy, wz);
          this.dummy.updateMatrix();
          this.mesh.setMatrixAt(count, this.dummy.matrix);
          
          // Subtle color variation based on height - darker in grooves, lighter on ridges
          const heightNorm = h / this.grid.height;
          const variation = 0.92 + heightNorm * 0.16; // 0.92 to 1.08 range
          this.tempColor.copy(this.baseColor).multiplyScalar(variation);
          this.mesh.setColorAt(count, this.tempColor);
          
          count++;
        }
      }
    }
    
    this.mesh.count = count;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
  
  update() {
    if (this.cm.dirtyChunks.size > 0) {
      this.fullUpdate();
      this.cm.clearDirty();
    }
  }
}

// ============================================
// MAIN APPLICATION
// ============================================
class ZenGardenApp {
  constructor() {
    this.initScene();
    this.initGrid();
    this.initVoxelRenderer();
    this.initControls();
    this.initUI();
    this.animate();
  }
  
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a3a4a);
    this.scene.fog = new THREE.Fog(0x2a3a4a, 25, 60);
    
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(18, 14, 18);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.target.set(0, 0, 0);
    this.orbit.minDistance = 10;
    this.orbit.maxDistance = 50;
    this.orbit.maxPolarAngle = Math.PI / 2.1;
    
    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffeedd, 0.5));
    const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sun.position.set(10, 6, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -25;
    sun.shadow.camera.right = sun.shadow.camera.top = 25;
    sun.shadow.bias = -0.0001;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
    this.scene.add(new THREE.DirectionalLight(0xaaccff, 0.3).translateX(-5).translateY(4));
    
    // Garden container (rotated 45 degrees for isometric look)
    this.gardenContainer = new THREE.Group();
    this.gardenContainer.rotation.y = Math.PI / 4;
    this.scene.add(this.gardenContainer);
    
    // Garden bed frame - raised above grass to prevent z-fighting
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(CONFIG.gardenWorldSize + 0.5, 0.5, CONFIG.gardenWorldSize + 0.5),
      new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 })
    );
    frame.position.y = 0;
    frame.receiveShadow = true;
    frame.castShadow = true;
    this.gardenContainer.add(frame);
    
    const bottom = new THREE.Mesh(
      new THREE.PlaneGeometry(CONFIG.gardenWorldSize, CONFIG.gardenWorldSize),
      new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 1 })
    );
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = 0.26;
    bottom.receiveShadow = true;
    this.gardenContainer.add(bottom);
    
    this.createRocks();
    this.createBackgroundElements();
    
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  createRocks() {
    this.rocks = [];
    this.rockPositions = [];
    
    const half = CONFIG.gardenWorldSize / 2;
    const margin = 1.5;
    
    // Place large rock randomly
    const largeX = (Math.random() - 0.5) * (CONFIG.gardenWorldSize - margin * 2);
    const largeZ = (Math.random() - 0.5) * (CONFIG.gardenWorldSize - margin * 2);
    
    // Place two smaller rocks near each other, away from large rock
    // but 50-200 grid units apart from each other
    let clusterX, clusterZ;
    do {
      clusterX = (Math.random() - 0.5) * (CONFIG.gardenWorldSize - margin * 2);
      clusterZ = (Math.random() - 0.5) * (CONFIG.gardenWorldSize - margin * 2);
    } while (Math.sqrt((clusterX - largeX) ** 2 + (clusterZ - largeZ) ** 2) < 3);
    
    // Calculate offset for second small rock: 50-200 grid units = 0.625-2.5 world units
    const minDist = (50 / CONFIG.gridWidth) * CONFIG.gardenWorldSize;
    const maxDist = (200 / CONFIG.gridWidth) * CONFIG.gardenWorldSize;
    const angle = Math.random() * Math.PI * 2;
    const dist = minDist + Math.random() * (maxDist - minDist);
    
    const positions = [
      { x: largeX, z: largeZ },
      { x: clusterX, z: clusterZ },
      { x: clusterX + Math.cos(angle) * dist, z: clusterZ + Math.sin(angle) * dist }
    ];
    
    CONFIG.rocks.forEach((rockConfig, i) => {
      const worldRadius = (rockConfig.diameter / CONFIG.gridWidth) * CONFIG.gardenWorldSize / 2;
      const height = worldRadius * rockConfig.heightRatio * 2;
      
      const rock = this.createIrregularRock(worldRadius, height);
      rock.position.set(positions[i].x, 0.26 + height * 0.3, positions[i].z); // Offset to match sand level
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.gardenContainer.add(rock);
      this.rocks.push(rock);
      
      // Store position and radius for sand displacement
      this.rockPositions.push({
        x: positions[i].x,
        z: positions[i].z,
        radius: worldRadius * 1.1,
        gridRadius: Math.ceil(rockConfig.diameter / 2 * 1.1)
      });
    });
  }
  
  createIrregularRock(radius, height) {
    // Create irregular rock using displaced icosahedron
    const geo = new THREE.IcosahedronGeometry(radius, 3);
    const posAttr = geo.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Create noise-based displacement for irregular shape
    const seed = Math.random() * 1000;
    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      
      // Flatten to ellipsoid shape (wider than tall)
      vertex.y *= height / radius * 0.5;
      
      // Add irregular bumps using pseudo-noise
      const angle1 = Math.atan2(vertex.z, vertex.x);
      const angle2 = Math.atan2(vertex.y, Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z));
      const noise = 
        Math.sin(angle1 * 3 + seed) * 0.15 +
        Math.sin(angle2 * 5 + seed * 2) * 0.1 +
        Math.sin(angle1 * 7 + angle2 * 4 + seed * 3) * 0.08;
      
      const len = vertex.length();
      vertex.normalize().multiplyScalar(len * (1 + noise));
      
      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geo.computeVertexNormals();
    
    const mat = new THREE.MeshStandardMaterial({
      color: CONFIG.rockColor,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });
    
    return new THREE.Mesh(geo, mat);
  }
  
  createBackgroundElements() {
    // Ground/grass platform extending around the garden - below the zen garden
    const grassGeo = new THREE.BoxGeometry(40, 0.5, 40);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a7c3f, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = -0.5;
    grass.receiveShadow = true;
    this.scene.add(grass);
    
    // Torii gate
    this.createToriiGate(3, 0, -10);
    
    // Path from gate to zen garden
    this.createPathToGarden();
    
    // Koi pond
    this.createKoiPond(10, -6);
    
    // Japanese maple trees - natural autumn colors
    this.createMapleTree(-9, -3, 0xa85d3a);
    this.createMapleTree(-10, 5, 0xb86b42);
    this.createMapleTree(10, 8, 0x9e5535);
    this.createMapleTree(12, -2, 0xc47a4a);
    
    // Bushes/shrubs
    this.createBush(-7, -6, 0.8);
    this.createBush(-6, -7, 0.6);
    this.createBush(8, 6, 0.7);
    this.createBush(9, 5, 0.5);
    this.createBush(-8, 7, 0.9);
    this.createBush(6, -8, 0.6);
    this.createBush(7, -9, 0.8);
    
    // Stepping stones path
    this.createSteppingStones();
    
    // Bridge over pond
    this.createBridge(12, -4);
    
    // Clouds
    this.createCloud(-12, 16, 8);
    this.createCloud(8, 18, 12);
    this.createCloud(14, 15, 6);
  }
  
  createPathToGarden() {
    // Gravel/stone path from torii gate to zen garden
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x888880, roughness: 0.95 });
    
    // Main path segments
    const pathPoints = [
      { x: 3, z: -9, w: 1.8, d: 2 },
      { x: 2.5, z: -7, w: 1.6, d: 2 },
      { x: 1.5, z: -5, w: 1.5, d: 2.5 },
      { x: 0, z: -3, w: 1.4, d: 3 },
      { x: -1, z: -0.5, w: 1.3, d: 3 }
    ];
    
    pathPoints.forEach(pt => {
      const pathGeo = new THREE.PlaneGeometry(pt.w, pt.d);
      const pathSegment = new THREE.Mesh(pathGeo, pathMat);
      pathSegment.rotation.x = -Math.PI / 2;
      pathSegment.position.set(pt.x, 0.02, pt.z);
      pathSegment.receiveShadow = true;
      this.scene.add(pathSegment);
    });
    
    // Add some decorative stones along the path
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9, flatShading: true });
    const stonePositions = [
      [3.8, -8], [2.2, -8.5], [3.5, -6], [1.8, -6.5],
      [2.8, -4], [0.5, -4.5], [1.5, -2], [-0.8, -2.5]
    ];
    stonePositions.forEach(([x, z]) => {
      const stoneGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 4);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.08, z);
      stone.scale.y = 0.4;
      stone.receiveShadow = true;
      this.scene.add(stone);
    });
  }
  
  createToriiGate(x, y, z) {
    const gateMat = new THREE.MeshStandardMaterial({ color: 0xcc3311, roughness: 0.7 });
    const gate = new THREE.Group();
    
    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.15, 0.18, 3, 8);
    const leftPillar = new THREE.Mesh(pillarGeo, gateMat);
    leftPillar.position.set(-1.2, 1.5, 0);
    gate.add(leftPillar);
    
    const rightPillar = new THREE.Mesh(pillarGeo, gateMat);
    rightPillar.position.set(1.2, 1.5, 0);
    gate.add(rightPillar);
    
    // Top beam
    const topBeamGeo = new THREE.BoxGeometry(3.2, 0.25, 0.35);
    const topBeam = new THREE.Mesh(topBeamGeo, gateMat);
    topBeam.position.set(0, 3.2, 0);
    gate.add(topBeam);
    
    // Second beam
    const midBeamGeo = new THREE.BoxGeometry(2.6, 0.15, 0.25);
    const midBeam = new THREE.Mesh(midBeamGeo, gateMat);
    midBeam.position.set(0, 2.7, 0);
    gate.add(midBeam);
    
    gate.position.set(x, y, z);
    gate.rotation.y = Math.PI / 6;
    gate.traverse(child => { if (child.isMesh) { child.castShadow = true; } });
    this.scene.add(gate);
  }
  
  createKoiPond(x, z) {
    // Pond shape
    const pondShape = new THREE.Shape();
    pondShape.ellipse(0, 0, 3, 2, 0, Math.PI * 2);
    const pondGeo = new THREE.ShapeGeometry(pondShape, 32);
    const pondMat = new THREE.MeshStandardMaterial({ 
      color: 0x3498db, 
      roughness: 0.1, 
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.position.set(x, 0.02, z);
    pond.receiveShadow = true;
    this.scene.add(pond);
    
    // Koi fish
    const koiColors = [0xff6633, 0xffcc00, 0xffffff];
    for (let i = 0; i < 4; i++) {
      const koiGeo = new THREE.CapsuleGeometry(0.08, 0.25, 4, 8);
      const koiMat = new THREE.MeshStandardMaterial({ color: koiColors[i % 3] });
      const koi = new THREE.Mesh(koiGeo, koiMat);
      const angle = (i / 4) * Math.PI * 2;
      koi.position.set(x + Math.cos(angle) * 1.5, 0.1, z + Math.sin(angle) * 1);
      koi.rotation.y = angle + Math.PI / 2;
      koi.rotation.x = Math.PI / 2;
      this.scene.add(koi);
    }
  }
  
  createMapleTree(x, z, color) {
    const tree = new THREE.Group();
    
    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.15, 0.25, 2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1;
    tree.add(trunk);
    
    // Foliage layers
    const foliageMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true });
    for (let i = 0; i < 3; i++) {
      const foliageGeo = new THREE.IcosahedronGeometry(1.2 - i * 0.25, 1);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = 2.5 + i * 0.6;
      foliage.scale.y = 0.6;
      tree.add(foliage);
    }
    
    tree.position.set(x, 0, z);
    tree.traverse(child => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    this.scene.add(tree);
  }
  
  createBush(x, z, scale) {
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x3d7a3d, roughness: 0.85, flatShading: true });
    const bushGeo = new THREE.IcosahedronGeometry(scale, 1);
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(x, scale * 0.5, z);
    bush.scale.y = 0.7;
    bush.castShadow = true;
    bush.receiveShadow = true;
    this.scene.add(bush);
  }
  
  createSteppingStones() {
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9, flatShading: true });
    const stonePositions = [
      [-8, -4], [-7.5, -3], [-7, -2], [-6.5, -1], [-6, 0]
    ];
    stonePositions.forEach(([x, z]) => {
      const stoneGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.15, 7);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(x, 0.08, z);
      stone.rotation.y = Math.random() * Math.PI;
      stone.receiveShadow = true;
      stone.castShadow = true;
      this.scene.add(stone);
    });
  }
  
  createBridge(x, z) {
    const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const bridge = new THREE.Group();
    
    // Curved deck
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(0, 0.5, 0),
      new THREE.Vector3(1.5, 0, 0)
    );
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.4, 8, false);
    const deck = new THREE.Mesh(tubeGeo, bridgeMat);
    deck.scale.set(1, 0.3, 1);
    bridge.add(deck);
    
    // Rails
    const railGeo = new THREE.BoxGeometry(3.2, 0.08, 0.08);
    const leftRail = new THREE.Mesh(railGeo, bridgeMat);
    leftRail.position.set(0, 0.4, 0.35);
    bridge.add(leftRail);
    const rightRail = new THREE.Mesh(railGeo, bridgeMat);
    rightRail.position.set(0, 0.4, -0.35);
    bridge.add(rightRail);
    
    bridge.position.set(x, 0.2, z);
    bridge.rotation.y = Math.PI / 3;
    bridge.traverse(child => { if (child.isMesh) { child.castShadow = true; } });
    this.scene.add(bridge);
  }
  
  createCloud(x, y, z) {
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 1, flatShading: true });
    const cloud = new THREE.Group();
    
    for (let i = 0; i < 4; i++) {
      const puffGeo = new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 8, 6);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set((i - 1.5) * 0.6, Math.random() * 0.2, Math.random() * 0.3);
      puff.scale.y = 0.6;
      cloud.add(puff);
    }
    
    cloud.position.set(x, y, z);
    this.scene.add(cloud);
  }
  
  initGrid() {
    this.grid = new VoxelGrid(CONFIG.gridWidth, CONFIG.gridHeight, CONFIG.gridDepth);
    this.grid.fillToHeight(CONFIG.baseHeight);
    this.cm = new ChunkManager(this.grid, CONFIG.chunkSize);
    this.sim = new SandSimulator(this.grid, this.cm);
    this.rake = new RakeController(this.grid, this.cm);
  }
  
  initVoxelRenderer() {
    this.voxelRenderer = new VoxelRenderer(this.scene, this.grid, this.cm, this.gardenContainer);
    setTimeout(() => document.getElementById('loading').classList.add('hidden'), 500);
  }
  
  initControls() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    const indicator = new THREE.Mesh(
      new THREE.RingGeometry(0.3, 0.4, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true, side: THREE.DoubleSide })
    );
    indicator.rotation.x = -Math.PI / 2;
    indicator.visible = false;
    this.scene.add(indicator);
    this.indicator = indicator;
    
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', (e) => this.onMove(e.clientX, e.clientY));
    canvas.addEventListener('mousedown', (e) => { if (e.button === 0) this.onDown(e.clientX, e.clientY); });
    canvas.addEventListener('mouseup', () => this.onUp());
    canvas.addEventListener('mouseleave', () => { this.indicator.visible = false; this.onUp(); });
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.onDown(e.touches[0].clientX, e.touches[0].clientY); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.onMove(e.touches[0].clientX, e.touches[0].clientY); });
    canvas.addEventListener('touchend', () => this.onUp());
  }
  
  getWorldPos(cx, cy) {
    this.mouse.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const pt = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.groundPlane, pt);
    return pt;
  }
  
  onMove(cx, cy) {
    const pos = this.getWorldPos(cx, cy);
    if (pos) {
      this.indicator.position.set(pos.x, 0.1, pos.z);
      this.indicator.visible = true;
      if (this.rake.isActive) this.rake.update(pos.x, pos.z);
    }
  }
  
  onDown(cx, cy) {
    const pos = this.getWorldPos(cx, cy);
    if (pos) {
      this.rake.start(pos.x, pos.z);
      this.orbit.enabled = false;
    }
  }
  
  onUp() {
    this.rake.end();
    this.orbit.enabled = true;
  }
  
  initUI() {
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.grid.fillToHeight(CONFIG.baseHeight);
      this.cm.markAllDirty();
      this.cm.markAllActive();
    });
    document.getElementById('flattenBtn').addEventListener('click', () => {
      this.grid.fillToHeight(CONFIG.baseHeight);
      this.cm.markAllDirty();
      this.cm.markAllActive();
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    for (let i = 0; i < CONFIG.stepsPerFrame; i++) this.sim.step();
    this.voxelRenderer.update();
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================
// INITIALIZE
// ============================================
window.gardenApp = new ZenGardenApp();
