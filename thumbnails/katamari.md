# Katamari-Style Collection Game - Product Specification

## 1. Product Overview

### 1.1 Concept
A browser-based 3D collection game inspired by Katamari Damacy, where players control a rolling baby that grows in size as it collects objects scattered throughout a candy store floor.

### 1.2 Game Rules (Display on Load)
When the game loads, the following rules should be displayed in the chat/console or as an initial message overlay:

**🎮 KATAMARI COLLECTION GAME**
- Roll the baby using WASD or Arrow Keys to catch all the objects
- Your baby grows bigger with each object collected
- Hit R to restart and play again
- Collect all objects to win!

### 1.3 Core Gameplay Loop
1. Player controls a rolling baby using keyboard inputs
2. Baby moves around a candy store environment
3. When baby gets close to collectible objects, they stick to the baby
4. baby grows larger with each collected object
5. Collected objects orbit around the baby surface
6. Game continues until all objects are collected

### 1.4 Target Platform
- Web browser (desktop)
- Built with React, Three.js, and React Three Fiber
- No installation required

---

## 2. Technical Architecture

### 2.1 Technology Stack
- **Framework**: React with TypeScript
- **3D Rendering**: Three.js via React Three Fiber
- **3D Utilities**: @react-three/drei for helpers (OrbitControls, Environment, ContactShadows, useGLTF)
- **Styling**: Tailwind CSS
- **Assets**: GLTF/GLB 3D models

### 2.2 Critical Implementation Rules

⚠️ **IMPORTANT: Initial Rules Display**
- On component mount (useEffect), display game rules in browser console
- Optional: Show rules as a temporary overlay that fades after 3-5 seconds
- Rules format:
  ```
  🎮 KATAMARI COLLECTION GAME
  - Roll the baby using WASD or Arrow Keys to catch all the objects
  - Your baby grows bigger with each object collected  
  - Hit R to restart and play again
  - Collect all objects to win!
  ```

⚠️ **IMPORTANT: Canvas Structure Requirements**
- All HTML elements (divs, h2, p, etc.) MUST be placed OUTSIDE the `<Canvas>` component
- Only Three.js 3D objects can exist inside `<Canvas>`
- UI overlays should be absolutely positioned siblings of the Canvas, not children
- Violating this will cause "X is not part of the THREE namespace" errors

**Correct Structure:**
```tsx
<div className="wrapper">
  <Canvas>{/* ONLY 3D objects */}</Canvas>
  <div className="ui-overlay">{/* HTML UI here */}</div>
</div>
```

**Incorrect Structure:**
```tsx
<Canvas>
  <div>{/* ❌ This will cause errors */}</div>
</Canvas>
```

⚠️ **IMPORTANT: Keyboard Input Setup**
- Keyboard event listeners MUST be attached to `window`, not specific elements
- Focus is not required when using window-level listeners
- Use `useEffect` hook to attach/cleanup listeners properly
- Store key states in a closure or ref to access in animation loop
- Always cleanup event listeners on component unmount

⚠️ **IMPORTANT: Movement Speed Tuning**
- Initial speed values should be conservative (0.05-0.1 range)
- Speed is applied every frame (60 FPS), so small values create smooth movement
- Test and adjust based on feel - what seems slow in code may feel fast in practice
- Recommended starting speed: 0.05 units per frame
- Add friction multiplier (0.8-0.9) for gradual deceleration

### 2.3 Core Components

#### 2.3.1 Rollingbaby Component
- Main player-controlled object
- Physics simulation for rolling motion
- Collision detection with collectibles
- Dynamic size scaling based on collected items
- Velocity-based movement system
- **CRITICAL Group Structure**:
  ```
  <group ref={groupRef}> ← Main baby group (moves with velocity)
    <mesh ref={babyRef}> ← baby visual (rotates)
    <group ref={collectedGroupRef}> ← Collected objects (rotates with baby)
      <CollectedObjectOnbaby /> ← Individual objects
    </group>
  </group>
  ```
- The collected objects group must be a **child** of the baby group, not a sibling
- Both babyRef and collectedGroupRef rotation must be synchronized in useFrame

#### 2.3.2 CollectibleObject Component
- Individual items placed in the world
- Floating/bobbing animation
- Rotation animation
- Collision state management
- Removal upon collection

#### 2.3.3 CollectedObjectOnbaby Component
- Representation of collected items attached to baby
- Orbital positioning around baby surface
- Scales with baby growth
- Inherits baby rotation

#### 2.3.4 toy store Component
- Ground plane with tile texture
- Decorative tile es (150+ instances)
- Receives shadows from objects

---

## 3. Game Mechanics

### 3.1 baby Physics

#### Movement System
- **Input**: WASD or Arrow keys
- **Restart**: R key to reset game
- **Speed**: 0.05 units per frame (IMPORTANT: Start conservative - test and adjust)
- **Speed Tuning Notes**:
  - Original spec used 0.15 which was reported as too fast
  - 0.05 provides good control and smooth feel
  - Movement is applied 60 times per second, so small values go far
  - Adjust in increments of 0.01-0.02 based on playtesting
- **Friction**: 0.85 multiplier when no input (gradual deceleration)
- **Rotation**: baby rotates based on movement direction
  - X rotation: `velocity.z * 2`
  - Z rotation: `-velocity.x * 2`

#### Keyboard Input Implementation
**Critical Setup Requirements:**
```typescript
useEffect(() => {
  const keys: { [key: string]: boolean } = {}

  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = true
    
    // Handle restart immediately on key down
    if (e.key.toLowerCase() === 'r') {
      handleRestart() // Call parent restart function
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = false
  }

  // MUST attach to window for reliable input
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)

  // Use interval OR check keys directly in useFrame
  const interval = setInterval(() => {
    const speed = 0.05
    if (keys["w"] || keys["arrowup"]) velocity.current.z = -speed
    else if (keys["s"] || keys["arrowdown"]) velocity.current.z = speed
    else velocity.current.z *= 0.85

    if (keys["a"] || keys["arrowleft"]) velocity.current.x = -speed
    else if (keys["d"] || keys["arrowright"]) velocity.current.x = speed
    else velocity.current.x *= 0.85
  }, 16) // ~60 FPS

  // MUST cleanup to prevent memory leaks
  return () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
    clearInterval(interval)
  }
}, [])
```

**Why This Approach:**
- Window listeners work regardless of focus
- Lowercase conversion handles capitalization differences
- Keys object acts as state store accessible in animation loop
- R key triggers immediate restart action
- Interval ensures consistent input processing
- Cleanup prevents multiple listeners accumulating

#### Size Scaling
- **Base size**: 1.0 unit radius
- **Growth formula**: `1 + (collectedCount * 0.3)`
- **Vertical position**: baby sits ON the ground plane
  - Ground plane Y position: -0.5
  - baby Y position formula: `babySize - 0.5`
  - This ensures the bottom of the baby touches the ground (radius extends from center)
  - Example: babySize = 1.0 → position.y = 0.5 (center is 0.5 above ground at -0.5)

### 3.2 Restart System

#### Restart Functionality
- **Key**: R key
- **Action**: Resets entire game state to initial conditions
- **Behavior**:
  1. Clear all collected objects
  2. Reset baby size to base (1.0)
  3. Reset baby position to origin [0, 0, 0]
  4. Reset baby velocity to {x: 0, z: 0}
  5. Restore all collectible objects to original positions
  6. Reset baby rotation to {x: 0, z: 0}

#### Implementation
```typescript
const handleRestart = () => {
  setCollectedObjects([])
  setObjects([
    // Reset to initial objects array
    { id: 1, position: [5, 0, 3], modelUrl: "...", scale: 1.5, name: "Cute Cat", emoji: "🐱" },
    { id: 2, position: [-4, 0, -2], modelUrl: "...", scale: 1.2, name: "Forest Mushroom", emoji: "🍄" },
    { id: 3, position: [2, 0, -5], modelUrl: "...", scale: 1.5, name: "Cute Dog", emoji: "🐶" },
  ])
  // baby state resets automatically based on collectedObjects.length
}
```

### 3.3 Collection System

#### Detection
- **Collection radius**: `babySize * 2`
- **Detection method**: Distance calculation between baby center and object position
- **Formula**: `sqrt(dx² + dz²) <= collectionRadius`

#### Collection Behavior
1. Object detected within radius
2. Object added to collected array
3. Object removed from world objects array
4. baby size increases
5. Object appears attached to baby surface

### 3.4 Collected Object Display

#### Positioning
- **Distribution**: Evenly spaced around baby circumference
- **Angle calculation**: `(index / totalCollected) * 2π`
- **Radius from baby center**: `babySize * 1.2`
- **Position formula**:
  - X: `cos(angle) * radius`
  - Y: `sin(angle * 2) * radius * 0.5` (creates wave pattern)
  - Z: `sin(angle) * radius`
- **Scale**: 80% of original object scale
- **Rotation Inheritance**: CRITICAL - collected objects group must rotate with baby
  - The collected objects are in a separate group (`collectedGroupRef`)
  - This group MUST have its rotation synced with the baby rotation in useFrame
  - Apply same rotation values: `collectedGroupRef.current.rotation.x = rotation.current.x`
  - Apply same rotation values: `collectedGroupRef.current.rotation.z = rotation.current.z`
- **Position Inheritance**: The collected objects group is a child of the main baby group
  - This ensures objects move with the baby automatically
  - Structure: `<group (baby position)> → <mesh (baby visual)> + <group (collected objects)>`

---

## 4. Visual Design

### 4.1 Environment

#### toy store
- **Ground color**: #4ade80 (green)
- **Size**: 100x100 units
- **Material**: Standard with roughness 0.8, metalness 0.2
- **tile es**: 150 instances
  - Random positioning within 40x40 area
  - Scale variation: 0.3-0.7
  - Color variation: HSL hue 120-140, lightness 35-50%

#### Lighting
- **Ambient**: 0.6 intensity
- **Directional 1**: Position [10, 10, 5], intensity 1.5, casts shadows
- **Directional 2**: Position [-5, 5, -5], intensity 0.5
- **Environment**: "park" preset
- **Contact shadows**: Opacity 0.4, scale 20, blur 2

#### Sky
- **Background**: Gradient from sky-300 to sky-100 (light blue)

### 4.2 baby Appearance
- **Color**: #ff6b9d (pink)
- **Geometry**: Sphere with 32x32 segments
- **Material**: 
  - Roughness: 0.3
  - Metalness: 0.6
- **Shadows**: Casts shadows

### 4.3 Collectible Objects

#### Animation
- **Rotation**: 0.01 radians per frame on Y-axis
- **Float**: Sine wave oscillation
  - Amplitude: 0.1 units
  - Frequency: Based on Date.now() * 0.001 + objectId

#### Default Objects
1. **Cute Cat**
   - Scale: 1.5
   - Position: [5, 0, 3]
   - Emoji: 🐱

2. **Forest Mushroom**
   - Scale: 1.2
   - Position: [-4, 0, -2]
   - Emoji: 🍄

3. **Cute Dog**
   - Scale: 1.5
   - Position: [2, 0, -5]
   - Emoji: 🐶

---

## 5. User Interface

### 5.1 Score Display (Top Center)
- **Container**: White 90% opacity, backdrop blur, large shadow
- **Padding**: Vertical 16px, horizontal 32px
- **Border radius**: 16px (2xl)
- **Text**: 2xl bold
- **Format**: "Collected: X / Y"
- **Completion message**: "You collected everything!" in green-600, semibold, large

### 5.2 Controls Hint (Bottom Center)
- **Container**: White 90% opacity, backdrop blur, full rounded
- **Padding**: Vertical 12px, horizontal 24px
- **Text**: "Use WASD or Arrow Keys to roll the baby! Press R to restart."
- **Style**: Small, medium weight

---

## 6. Camera System

### 6.1 Default Camera
- **Position**: [5, 8, 5] (elevated, angled view)
- **Field of view**: 60 degrees
- **Shadow rendering**: Enabled

### 6.2 Orbit Controls
- **Pan**: Enabled
- **Zoom**: Enabled
- **Rotate**: Enabled
- **Min distance**: 3 units
- **Max distance**: 30 units
- **Max polar angle**: π/2 (prevents going below ground)

---

## 7. Performance Considerations

### 7.1 Optimization Techniques
- **Suspense boundaries**: Lazy loading of 3D models
- **Object cloning**: Reuses loaded GLTF scenes
- **Frame rate**: 60 FPS target with useFrame hook
- **Shadow map size**: 1024x1024 for directional light
- **tile instances**: Simple planes instead of complex geometry

### 7.2 Loading Strategy
- Models loaded asynchronously with useGLTF
- Suspense fallback for graceful loading states
- Model URLs from CDN for fast delivery

---

## 8. Data Structure

### 8.1 Object Schema
```typescript
{
  id: number,                           // Unique identifier
  position: [number, number, number],   // [x, y, z] coordinates
  modelUrl: string,                     // GLTF/GLB file URL
  scale: number,                        // Size multiplier
  name: string,                         // Display name
  emoji: string                         // Icon for UI
}
```

### 8.2 State Management
- **objects**: Array of collectible objects remaining in world
- **collectedObjects**: Array of objects attached to baby
- **velocity**: Current baby movement vector {x, z}
- **rotation**: Current baby rotation {x, z}
- **babySize**: Current baby radius

### 8.3 Initial State Setup
```typescript
const INITIAL_OBJECTS = [
  {
    id: 1,
    position: [5, 0, 3] as [number, number, number],
    modelUrl: "https://...",
    scale: 1.5,
    name: "Cute Cat",
    emoji: "🐱",
  },
  {
    id: 2,
    position: [-4, 0, -2] as [number, number, number],
    modelUrl: "https://...",
    scale: 1.2,
    name: "Forest Mushroom",
    emoji: "🍄",
  },
  {
    id: 3,
    position: [2, 0, -5] as [number, number, number],
    modelUrl: "https://...",
    scale: 1.5,
    name: "Cute Dog",
    emoji: "🐶",
  },
]

// In component:
const [objects, setObjects] = useState(INITIAL_OBJECTS)
const [collectedObjects, setCollectedObjects] = useState([])

// Restart function
const handleRestart = () => {
  setObjects(INITIAL_OBJECTS)
  setCollectedObjects([])
}
```

---

## 9. Extensibility

### 9.1 Easy Modifications
- **Add objects**: Push new entries to initial objects array
- **Change environment**: Modify toy store component colors/size
- **Adjust physics**: Modify speed, friction, growth rate constants
- **New baby colors**: Change baby material color property
- **Collection radius**: Adjust multiplier in detection formula

### 9.2 Potential Features
- Multiple levels with different environments
- Power-ups (speed boost, magnet effect, shrink/grow)
- Obstacles that must be avoided
- Time-based challenges
- Score multipliers based on collection speed
- Sound effects and background music
- Mobile touch controls
- Object size requirements (can only collect objects smaller than baby)
- Different baby types with unique properties

---

## 10. Asset Requirements

### 10.1 3D Models
- **Format**: GLTF (.glb preferred for single-file)
- **Optimization**: Low poly count for browser performance
- **Style**: Cute, stylized aesthetic
- **Pivot**: Centered for proper rotation

### 10.2 Hosting
- CDN delivery for fast loading
- CORS-enabled for cross-origin access
- Reliable availability

---

## 12. Common Implementation Issues & Solutions

### 12.1 "Not Part of THREE Namespace" Error

**Problem**: Error message like "H2 is not part of the THREE namespace"

**Cause**: HTML elements placed inside `<Canvas>` component

**Solution**:
```tsx
// ❌ WRONG - HTML inside Canvas
<Canvas>
  <Rollingbaby />
  <div>Score</div> {/* This causes error */}
</Canvas>

// ✅ CORRECT - HTML as sibling to Canvas
<div className="wrapper">
  <Canvas>
    <Rollingbaby />
  </Canvas>
  <div className="absolute">Score</div>
</div>
```

### 12.2 Keyboard Controls Not Working

**Problem**: WASD/Arrow keys don't move the baby, or R key doesn't restart

**Common Causes & Solutions**:

1. **Event listeners not on window**
   - ❌ `document.addEventListener` - may not capture
   - ✅ `window.addEventListener` - always works

2. **Missing useEffect cleanup**
   ```typescript
   // Must return cleanup function
   return () => {
     window.removeEventListener("keydown", handleKeyDown)
     window.removeEventListener("keyup", handleKeyUp)
   }
   ```

3. **Keys object not accessible in animation loop**
   - Store keys in closure or useRef
   - Don't use state for real-time input (too slow)

4. **Case sensitivity issues**
   - Convert keys to lowercase: `e.key.toLowerCase()`
   - Check for both 'w' and 'arrowup' formats

5. **Restart function not accessible**
   - Pass handleRestart as prop to Rollingbaby component
   - Or handle R key in parent component with state setters

### 12.3 baby Moving Too Fast

**Problem**: baby is difficult to control, moves too quickly

**Solution**: Reduce speed constant
- Start at 0.05, not 0.15
- Test in small increments (0.01-0.02)
- Remember: applied 60 times per second
- Also adjust friction if baby takes too long to stop

**Recommended Values**:
- **Slow/Easy**: speed = 0.05, friction = 0.85
- **Medium**: speed = 0.08, friction = 0.88
- **Fast/Hard**: speed = 0.12, friction = 0.90

### 12.4 Models Not Loading

**Problem**: Objects don't appear or console shows CORS errors

**Solutions**:
- Ensure CDN has CORS headers enabled
- Use `.glb` format (single file, better compatibility)
- Wrap components in `<Suspense>` boundaries
- Check browser console for actual error messages
- Verify model URLs are accessible

### 12.6 Collected Objects Not Sticking to baby

**Problem**: Objects are collected but don't appear on the baby, or appear but don't move with it

**Common Causes & Solutions**:

1. **Incorrect group hierarchy**
   ```typescript
   // ❌ WRONG - collected group as sibling
   <>
     <group ref={groupRef}>
       <mesh ref={babyRef}>...</mesh>
     </group>
     <group ref={collectedGroupRef}>...</group>
   </>
   
   // ✅ CORRECT - collected group as child
   <group ref={groupRef}>
     <mesh ref={babyRef}>...</mesh>
     <group ref={collectedGroupRef}>
       {collectedObjects.map(...)}
     </group>
   </group>
   ```

2. **Missing rotation synchronization**
   ```typescript
   // In useFrame, MUST sync rotations:
   babyRef.current.rotation.x = rotation.current.x
   babyRef.current.rotation.z = rotation.current.z
   
   // ALSO sync collected group rotation:
   if (collectedGroupRef.current) {
     collectedGroupRef.current.rotation.x = rotation.current.x
     collectedGroupRef.current.rotation.z = rotation.current.z
   }
   ```

3. **Objects positioned too far from baby**
   - Check radius calculation: should be `babySize * 1.2`
   - Verify position formula uses correct trigonometry
   - Test with smaller radius (like `babySize * 0.8`) to see if objects appear

4. **Y-position adjustment needed**
   - The main group's Y position changes as baby grows: `groupRef.current.position.y = babySize - 0.5`
   - Collected objects inherit this, so they should automatically move up with the baby
   - Don't set Y position on the collected group itself

### 12.7 Performance Issues

**Problem**: Low frame rate, stuttering

**Solutions**:
- Reduce tile  count (150 → 50-100)
- Lower shadow map resolution (1024 → 512)
- Simplify sphere geometry (32 → 16 segments)
- Use instanced meshes for repeated elements
- Limit max collected objects visible on baby

---

## 13. Browser Compatibility

### 13.1 Requirements
- WebGL 2.0 support
- Modern JavaScript (ES6+)
- Recommended: Chrome, Firefox, Safari, Edge (latest versions)

### 13.2 Known Limitations
- No mobile controls implementation
- Desktop keyboard required
- Performance varies with GPU capability

# Collision & Attachment Mechanics Specification

## Purpose
This document provides detailed specifications for how collectible GLB objects detect collision with the baby and attach to its surface in the Katamari-style collection game.

---

## 1. Collision Detection System

### 1.1 Detection Method
**Type**: Proximity-based spherical collision detection

**When to Check**: Every frame in the `useFrame` hook of the main game component or Rollingbaby component

**Detection Logic**:
```typescript
// For each collectible object in the world
objects.forEach(obj => {
  // Calculate 2D distance (ignore Y-axis for ground-level objects)
  const dx = babyPosition.x - obj.position[0]
  const dz = babyPosition.z - obj.position[2]
  const distance = Math.sqrt(dx * dx + dz * dz)
  
  // Define collection radius as twice the baby size
  const collectionRadius = babySize * 2
  
  // If object is within collection radius, trigger attachment
  if (distance <= collectionRadius) {
    collectObject(obj)
  }
})
```

### 1.2 Collection Radius
- **Formula**: `babySize * 2`
- **Rationale**: 
  - Provides generous collection area for satisfying gameplay
  - Scales with baby growth (larger baby = easier to collect)
  - Factor of 2 feels natural and forgiving to players
- **Example**: 
  - baby size 1.0 → collection radius 2.0 units
  - baby size 2.5 → collection radius 5.0 units

### 1.3 Collection Trigger
When an object enters the collection radius:
1. **Immediate removal** from world objects array
2. **Immediate addition** to collected objects array
3. **baby size increase** calculation triggered
4. **Object attachment** rendering begins

---

## 2. Object Attachment System

### 2.1 State Transition
**From**: Free-floating collectible in world space  
**To**: Attached object orbiting on baby surface

**State Management**:
```typescript
const collectObject = (obj: CollectibleObject) => {
  // Remove from world
  setObjects(prev => prev.filter(o => o.id !== obj.id))
  
  // Add to collected (with original properties preserved)
  setCollectedObjects(prev => [...prev, obj])
}
```

### 2.2 Attachment Properties Preserved
When an object is collected, the following properties must be carried over:
- `id` - Unique identifier
- `modelUrl` - GLB file path
- `scale` - Original size multiplier
- `name` - Display name
- `emoji` - UI icon

These properties are used to render the object on the baby surface.

---

## 3. Visual Attachment Implementation

### 3.1 Rendering Location
Collected objects are rendered in a **separate group** that is a **child** of the main baby group:

```typescript
<group ref={groupRef}> {/* Main baby group - handles position */}
  <mesh ref={babyRef}> {/* baby visual - handles rotation */}
    <sphereGeometry args={[babySize, 32, 32]} />
    <meshStandardMaterial color="#ff6b9d" />
  </mesh>
  
  <group ref={collectedGroupRef}> {/* Collected objects group */}
    {collectedObjects.map((obj, index) => (
      <CollectedObjectOnbaby
        key={obj.id}
        object={obj}
        index={index}
        totalCollected={collectedObjects.length}
        babySize={babySize}
      />
    ))}
  </group>
</group>
```

### 3.2 Position Calculation on baby Surface
Each collected object is positioned on the baby's surface using orbital mathematics:

```typescript
// Calculate evenly-spaced angle around baby
const angle = (index / totalCollected) * Math.PI * 2

// Calculate radius from baby center (slightly beyond surface)
const radius = babySize * 1.2

// Position in 3D space around baby
const x = Math.cos(angle) * radius
const y = Math.sin(angle * 2) * radius * 0.5  // Wave pattern for visual interest
const z = Math.sin(angle) * radius
```

**Key Points**:
- **Radius multiplier (1.2)**: Objects sit just outside baby surface, not embedded
- **Angle distribution**: Evenly spaces objects around circumference
- **Y-axis wave**: Creates dynamic vertical positioning for visual appeal
- **Scales with baby**: As baby grows, attached objects move outward proportionally

### 3.3 Scale Adjustment
Attached objects are rendered at **80% of their original scale**:

```typescript
<primitive
  object={scene.clone()}
  scale={object.scale * 0.8}
  position={[x, y, z]}
/>
```

**Rationale**: Prevents objects from appearing too large relative to the baby as it grows.

### 3.4 Rotation Synchronization
**CRITICAL**: Collected objects must rotate with the baby to create the appearance of being "stuck" to it.

```typescript
// In useFrame hook:
babyRef.current.rotation.x = rotation.current.x
babyRef.current.rotation.z = rotation.current.z

// MUST also apply to collected objects group
if (collectedGroupRef.current) {
  collectedGroupRef.current.rotation.x = rotation.current.x
  collectedGroupRef.current.rotation.z = rotation.current.z
}
```

**Why This Works**:
- Main `groupRef` handles baby translation (movement in world space)
- `babyRef` handles baby visual rotation
- `collectedGroupRef` inherits position from parent but has its own rotation
- Synchronizing rotations makes objects appear "glued" to baby surface

---

## 4. baby Growth Mechanics

### 4.1 Size Increase Formula
When an object is collected:

```typescript
const babySize = 1 + (collectedObjects.length * 0.3)
```

**Breakdown**:
- **Base size**: 1.0 unit radius
- **Growth per object**: 0.3 units
- **Examples**:
  - 0 collected → size 1.0
  - 1 collected → size 1.3
  - 3 collected → size 1.9
  - 10 collected → size 4.0

### 4.2 Position Adjustment for Growth
As the baby grows, its Y-position must adjust to keep it sitting on the ground:

```typescript
// Ground plane is at Y = -0.5
// baby center must be at Y = babySize - 0.5
groupRef.current.position.y = babySize - 0.5
```

**Explanation**:
- baby radius extends from center in all directions
- If center is at `babySize - 0.5`, the bottom of the sphere touches Y = -0.5 (ground)
- This keeps baby "rolling" on ground as it grows

---

## 5. Physics Integration

### 5.1 Collection Radius Growth
Because collection radius is tied to baby size (`babySize * 2`), the collection area automatically expands as the baby grows:

- **Start of game**: Small baby (1.0) → collection radius 2.0 units
- **Mid-game**: Medium baby (2.2) → collection radius 4.4 units
- **Late game**: Large baby (4.0) → collection radius 8.0 units

This creates a **positive feedback loop** where collecting objects makes it easier to collect more objects.

### 5.2 Movement Interaction
The attachment system does not affect baby physics:
- baby velocity remains unchanged when objects are collected
- baby rotation continues normally
- Collected objects add no mass or drag (arcade-style physics)

---

## 6. Visual Feedback

### 6.1 Instant Attachment
When collision is detected:
1. Object **immediately disappears** from world position
2. Object **immediately appears** on baby surface
3. **No animation transition** - instant "snap" to baby

**Rationale**: Matches the fast-paced, satisfying feel of Katamari Damacy

### 6.2 Score Update
UI updates simultaneously with attachment:
```typescript
// UI automatically reflects state
<div>Collected: {collectedObjects.length} / {totalObjects}</div>
```

---

## 7. Edge Cases & Error Handling

### 7.1 Multiple Objects in Range
If multiple objects are within collection radius simultaneously:
- All objects are collected in a single frame
- State updates batch naturally with React's state management
- Objects appear on baby in order they were in the array

### 7.2 Rapid baby Growth
If many objects collected quickly:
- baby size increases correctly with each collection
- Collection radius expands accordingly
- No maximum size limit (scales indefinitely)

### 7.3 Object Already Collected
Objects are removed from `objects` array immediately upon collection, so they cannot be collected twice. The detection loop only checks objects still in the world.

---

## 8. Performance Considerations

### 8.1 Collision Check Frequency
Collision detection runs **every frame** (60 FPS):
- Distance calculation is lightweight (simple math)
- Number of checks decreases as objects are collected
- Worst case: ~10-20 objects × 60 FPS = 600-1200 checks/second (negligible)

### 8.2 Rendering Efficiency
Collected objects use:
- **Cloned scenes** from loaded GLTF (memory efficient)
- **Simple transforms** (position, rotation, scale)
- **No physics calculations** (static relative to baby)

---

## 9. Testing Checklist

To verify collision and attachment work correctly:

- [ ] baby can collect objects when moving toward them
- [ ] Objects disappear from world immediately upon collection
- [ ] Objects appear on baby surface after collection
- [ ] Collected objects rotate with the baby
- [ ] Collected objects move with the baby through world space
- [ ] baby grows larger with each collected object
- [ ] Collection radius increases with baby size
- [ ] Score counter updates correctly
- [ ] Multiple objects can be collected rapidly
- [ ] All objects can be collected (win condition)
- [ ] Restart resets collections and restores objects to world

---

## 10. Common Issues & Solutions

### Issue: Objects collected but don't appear on baby
**Cause**: Collected objects group not a child of baby group  
**Solution**: Ensure `collectedGroupRef` is nested inside `groupRef`

### Issue: Objects appear but don't rotate with baby
**Cause**: Rotation not synchronized to collected group  
**Solution**: Apply baby rotation to `collectedGroupRef.current.rotation`

### Issue: Objects collected from too far away / too close
**Cause**: Collection radius multiplier incorrect  
**Solution**: Adjust multiplier (recommended: 2.0, range: 1.5-3.0)

### Issue: Objects embedded in baby or floating too far
**Cause**: Radius calculation in positioning  
**Solution**: Adjust `babySize * 1.2` multiplier (range: 1.0-1.5)

### Issue: baby sinks into ground as it grows
**Cause**: Y-position not updated with size  
**Solution**: Set `groupRef.current.position.y = babySize - 0.5`