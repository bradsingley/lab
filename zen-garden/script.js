// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8a89e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 0);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -15;
directionalLight.shadow.camera.right = 15;
directionalLight.shadow.camera.top = 15;
directionalLight.shadow.camera.bottom = -15;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Sand plane with texture
const sandGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// Create initial sand texture
function createSandTexture() {
  ctx.fillStyle = '#d4a574';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add some sand noise
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = Math.random() * 20 - 10;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
}

createSandTexture();
const sandTexture = new THREE.CanvasTexture(canvas);
sandTexture.magFilter = THREE.LinearFilter;
sandTexture.minFilter = THREE.LinearFilter;

const sandMaterial = new THREE.MeshStandardMaterial({
  map: sandTexture,
  roughness: 0.8,
  metalness: 0.0
});

const sandPlane = new THREE.Mesh(sandGeometry, sandMaterial);
sandPlane.rotation.x = -Math.PI / 2;
sandPlane.castShadow = true;
sandPlane.receiveShadow = true;
scene.add(sandPlane);

// Rake (simple cylinder geometry for now)
const rakeGroup = new THREE.Group();
const rakeHeadGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32);
const rakeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const rakeHead = new THREE.Mesh(rakeHeadGeometry, rakeMaterial);
rakeHead.position.y = 0.5;
rakeHead.castShadow = true;
rakeGroup.add(rakeHead);

const rakeHandleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
const rakeHandle = new THREE.Mesh(rakeHandleGeometry, rakeMaterial);
rakeHandle.position.y = 1.5;
rakeHandle.castShadow = true;
rakeGroup.add(rakeHandle);

scene.add(rakeGroup);

// Mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isMouseDown = false;

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(sandPlane);
  
  if (intersects.length > 0) {
    const point = intersects[0].point;
    rakeGroup.position.x = point.x;
    rakeGroup.position.z = point.z;
    
    if (isMouseDown) {
      drawRakeMarks(point.x, point.z);
    }
  }
});

window.addEventListener('mousedown', () => {
  isMouseDown = true;
});

window.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// Draw rake marks on sand texture with zig-zag pattern
function drawRakeMarks(x, z) {
  const uv_x = (x / 10 + 0.5) * canvas.width;
  const uv_z = (z / 10 + 0.5) * canvas.height;
  
  ctx.strokeStyle = '#b89968';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Draw zig-zag pattern with 4 peaks and valleys
  const peakHeight = 8;
  const peakWidth = 4;
  
  for (let line = 0; line < 4; line++) {
    const offsetX = (line - 1.5) * 8;
    ctx.beginPath();
    ctx.moveTo(uv_x + offsetX - peakWidth * 2, uv_z);
    
    // Create zig-zag with 4 peaks and valleys
    for (let i = 0; i < 5; i++) {
      const isUp = i % 2 === 0;
      const yOffset = isUp ? peakHeight : -peakHeight;
      ctx.lineTo(uv_x + offsetX + (i * peakWidth * 2), uv_z + yOffset);
    }
    
    ctx.stroke();
  }
  
  sandTexture.needsUpdate = true;
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
