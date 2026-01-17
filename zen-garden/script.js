import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  particleCount: 2000,
  particleRadius: 0.08,
  gardenSize: 12,
  gardenDepth: 0.5,
  rakeRadius: 0.8,
  rakeForce: 15,
  gravity: -20,
  damping: 0.4,
  friction: 0.8,
  restitution: 0.1
};

// ============================================
// SCENE SETUP
// ============================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 20, 40);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 12, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 5;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI / 2.1;
controls.target.set(0, 0, 0);

// ============================================
// LIGHTING
// ============================================
const ambientLight = new THREE.AmbientLight(0xffeedd, 0.3);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
mainLight.position.set(8, 15, 5);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.left = -15;
mainLight.shadow.camera.right = 15;
mainLight.shadow.camera.top = 15;
mainLight.shadow.camera.bottom = -15;
mainLight.shadow.camera.near = 1;
mainLight.shadow.camera.far = 30;
mainLight.shadow.bias = -0.001;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
fillLight.position.set(-5, 8, -5);
scene.add(fillLight);

// ============================================
// PHYSICS WORLD
// ============================================
const world = new CANNON.World();
world.gravity.set(0, CONFIG.gravity, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.solver.iterations = 5;

// Physics materials
const sandMaterial = new CANNON.Material('sand');
const groundMaterial = new CANNON.Material('ground');
const rakeMaterial = new CANNON.Material('rake');

const sandGroundContact = new CANNON.ContactMaterial(sandMaterial, groundMaterial, {
  friction: CONFIG.friction,
  restitution: CONFIG.restitution
});
const sandSandContact = new CANNON.ContactMaterial(sandMaterial, sandMaterial, {
  friction: CONFIG.friction * 0.8,
  restitution: CONFIG.restitution * 0.5
});
const sandRakeContact = new CANNON.ContactMaterial(sandMaterial, rakeMaterial, {
  friction: 0.1,
  restitution: 0.0
});

world.addContactMaterial(sandGroundContact);
world.addContactMaterial(sandSandContact);
world.addContactMaterial(sandRakeContact);

// ============================================
// GARDEN BED (Visual + Physics)
// ============================================
// Visual garden bed
const bedGeometry = new THREE.BoxGeometry(CONFIG.gardenSize + 1, CONFIG.gardenDepth + 0.3, CONFIG.gardenSize + 1);
const bedMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x3d2817,
  roughness: 0.9,
  metalness: 0.0
});
const gardenBed = new THREE.Mesh(bedGeometry, bedMaterial);
gardenBed.position.y = -CONFIG.gardenDepth / 2 - 0.15;
gardenBed.receiveShadow = true;
scene.add(gardenBed);

// Physics ground plane
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ 
  mass: 0,
  material: groundMaterial
});
groundBody.addShape(groundShape);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
groundBody.position.y = -CONFIG.gardenDepth;
world.addBody(groundBody);

// Invisible walls to contain particles
const wallHeight = 2;
const wallPositions = [
  { pos: [CONFIG.gardenSize / 2, 0, 0], rot: [0, -Math.PI / 2, 0] },
  { pos: [-CONFIG.gardenSize / 2, 0, 0], rot: [0, Math.PI / 2, 0] },
  { pos: [0, 0, CONFIG.gardenSize / 2], rot: [0, Math.PI, 0] },
  { pos: [0, 0, -CONFIG.gardenSize / 2], rot: [0, 0, 0] }
];

wallPositions.forEach(({ pos, rot }) => {
  const wallBody = new CANNON.Body({ mass: 0, material: groundMaterial });
  wallBody.addShape(new CANNON.Plane());
  wallBody.position.set(...pos);
  wallBody.quaternion.setFromEuler(...rot);
  world.addBody(wallBody);
});

// ============================================
// SAND PARTICLES
// ============================================
const particles = [];
const particleBodies = [];

// Instanced mesh for efficient rendering
const particleGeometry = new THREE.SphereGeometry(CONFIG.particleRadius, 8, 6);
const particleMaterial = new THREE.MeshStandardMaterial({
  color: 0xd4b896,
  roughness: 0.9,
  metalness: 0.0
});
const instancedMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, CONFIG.particleCount);
instancedMesh.castShadow = true;
instancedMesh.receiveShadow = true;
scene.add(instancedMesh);

const dummy = new THREE.Object3D();
const colors = [];

function createParticles() {
  const halfSize = CONFIG.gardenSize / 2 - 0.5;
  
  for (let i = 0; i < CONFIG.particleCount; i++) {
    // Random position within garden bounds
    const x = (Math.random() - 0.5) * (CONFIG.gardenSize - 1);
    const z = (Math.random() - 0.5) * (CONFIG.gardenSize - 1);
    const y = Math.random() * 0.5;
    
    // Physics body
    const shape = new CANNON.Sphere(CONFIG.particleRadius);
    const body = new CANNON.Body({
      mass: 0.1,
      material: sandMaterial,
      linearDamping: CONFIG.damping,
      angularDamping: CONFIG.damping
    });
    body.addShape(shape);
    body.position.set(x, y, z);
    world.addBody(body);
    particleBodies.push(body);
    
    // Slight color variation
    const colorVariation = 0.9 + Math.random() * 0.2;
    const color = new THREE.Color(0xd4b896).multiplyScalar(colorVariation);
    colors.push(color.r, color.g, color.b);
  }
  
  // Set instance colors
  instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(colors), 3);
}

function updateParticleVisuals() {
  for (let i = 0; i < particleBodies.length; i++) {
    const body = particleBodies[i];
    dummy.position.copy(body.position);
    dummy.quaternion.copy(body.quaternion);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }
  instancedMesh.instanceMatrix.needsUpdate = true;
}

function resetParticles() {
  for (let i = 0; i < particleBodies.length; i++) {
    const body = particleBodies[i];
    const x = (Math.random() - 0.5) * (CONFIG.gardenSize - 1);
    const z = (Math.random() - 0.5) * (CONFIG.gardenSize - 1);
    const y = Math.random() * 0.5 + 0.5;
    
    body.position.set(x, y, z);
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }
}

// ============================================
// ZEN ROCKS
// ============================================
const rocks = [];
const rockBodies = [];

function createRocks() {
  const rockPositions = [
    { x: -3, z: -2, scale: 1.2 },
    { x: 2.5, z: 3, scale: 0.8 },
    { x: 4, z: -3.5, scale: 1.0 },
    { x: -2, z: 4, scale: 0.6 }
  ];
  
  rockPositions.forEach(({ x, z, scale }) => {
    // Visual rock
    const rockGeometry = new THREE.DodecahedronGeometry(0.5 * scale, 1);
    const vertices = rockGeometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      vertices.setXYZ(
        i,
        vertices.getX(i) + (Math.random() - 0.5) * 0.15 * scale,
        vertices.getY(i) + (Math.random() - 0.5) * 0.15 * scale,
        vertices.getZ(i) + (Math.random() - 0.5) * 0.15 * scale
      );
    }
    rockGeometry.computeVertexNormals();
    
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.85,
      metalness: 0.1
    });
    
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, 0.3 * scale, z);
    rock.rotation.set(Math.random() * 0.3, Math.random() * Math.PI * 2, Math.random() * 0.3);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    rocks.push(rock);
    
    // Physics body for rock (static)
    const rockShape = new CANNON.Sphere(0.5 * scale);
    const rockBody = new CANNON.Body({ 
      mass: 0,
      material: groundMaterial
    });
    rockBody.addShape(rockShape);
    rockBody.position.set(x, 0.3 * scale, z);
    world.addBody(rockBody);
    rockBodies.push(rockBody);
  });
}

// ============================================
// RAKE INTERACTION
// ============================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const rakePosition = new THREE.Vector3();
const prevRakePosition = new THREE.Vector3();
let isRaking = false;

// Rake indicator
const rakeGeometry = new THREE.RingGeometry(CONFIG.rakeRadius - 0.1, CONFIG.rakeRadius, 32);
const rakeMaterialVisual = new THREE.MeshBasicMaterial({ 
  color: 0xffffff, 
  opacity: 0.3, 
  transparent: true,
  side: THREE.DoubleSide
});
const rakeIndicator = new THREE.Mesh(rakeGeometry, rakeMaterialVisual);
rakeIndicator.rotation.x = -Math.PI / 2;
rakeIndicator.visible = false;
scene.add(rakeIndicator);

// Ground plane for raycasting
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function updateRakePosition(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, intersectPoint);
  
  if (intersectPoint) {
    prevRakePosition.copy(rakePosition);
    rakePosition.copy(intersectPoint);
    rakePosition.y = 0;
    
    rakeIndicator.position.copy(rakePosition);
    rakeIndicator.position.y = 0.01;
    rakeIndicator.visible = true;
    
    if (isRaking) {
      applyRakeForce();
    }
  }
}

function applyRakeForce() {
  const rakeVelocity = new THREE.Vector3().subVectors(rakePosition, prevRakePosition);
  
  for (let i = 0; i < particleBodies.length; i++) {
    const body = particleBodies[i];
    const dx = body.position.x - rakePosition.x;
    const dz = body.position.z - rakePosition.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    if (distance < CONFIG.rakeRadius && distance > 0.1) {
      // Push particles away from rake center and in rake movement direction
      const pushStrength = (1 - distance / CONFIG.rakeRadius) * CONFIG.rakeForce;
      
      // Combine outward push with movement direction
      const outwardX = dx / distance;
      const outwardZ = dz / distance;
      
      body.velocity.x += (outwardX * 0.3 + rakeVelocity.x * 2) * pushStrength;
      body.velocity.z += (outwardZ * 0.3 + rakeVelocity.z * 2) * pushStrength;
      body.velocity.y += pushStrength * 0.5;
    }
  }
}

// Event listeners
renderer.domElement.addEventListener('mousemove', updateRakePosition);
renderer.domElement.addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    isRaking = true;
    controls.enabled = false;
  }
});
renderer.domElement.addEventListener('mouseup', () => {
  isRaking = false;
  controls.enabled = true;
});
renderer.domElement.addEventListener('mouseleave', () => {
  rakeIndicator.visible = false;
  isRaking = false;
  controls.enabled = true;
});

// Touch support
renderer.domElement.addEventListener('touchstart', (e) => {
  isRaking = true;
  controls.enabled = false;
  const touch = e.touches[0];
  updateRakePosition({ clientX: touch.clientX, clientY: touch.clientY });
});
renderer.domElement.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  updateRakePosition({ clientX: touch.clientX, clientY: touch.clientY });
});
renderer.domElement.addEventListener('touchend', () => {
  isRaking = false;
  controls.enabled = true;
  rakeIndicator.visible = false;
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', resetParticles);

// ============================================
// WINDOW RESIZE
// ============================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================
// ANIMATION LOOP
// ============================================
const clock = new THREE.Clock();
let lastTime = 0;

function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  const deltaTime = Math.min(time - lastTime, 0.05);
  lastTime = time;
  
  // Step physics
  world.step(1/60, deltaTime, 3);
  
  // Update visuals
  updateParticleVisuals();
  controls.update();
  
  renderer.render(scene, camera);
}

// ============================================
// INITIALIZE
// ============================================
createParticles();
createRocks();

// Hide loading after particles settle
setTimeout(() => {
  document.getElementById('loading').classList.add('hidden');
}, 1500);

animate();
