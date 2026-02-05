/**
 * Connections Module
 * Handles the red string connections between images on the conspiracy board
 */

console.log('=== connections.js loaded ===');

// Connection state
let isConnecting = false;
let connectionStart = null;
let tempLine = null;

// Max connections per image
const MAX_CONNECTIONS_PER_IMAGE = 10;

// Connection distribution weights (some images become "hubs")
const HUB_PROBABILITY = 0.25; // 25% chance to be a hub
const HUB_MIN_CONNECTIONS = 6;
const NON_HUB_MAX_CONNECTIONS = 3;

/**
 * Get all connections for a board
 * @param {string} boardId - Board UUID
 * @returns {Promise<Array>}
 */
async function getBoardConnections(boardId) {
    const { data, error } = await supabaseClient
        .from('all_connected_connections')
        .select('id, from_image_id, to_image_id')
        .eq('board_id', boardId);
    
    if (error) {
        console.error('Error fetching connections:', error);
        return [];
    }
    
    return data || [];
}

/**
 * Auto-connect images on a board (each image connects to others, max 10 per image)
 * @param {string} boardId - Board UUID
 * @param {Array} existingConnections - Already existing connections
 */
async function autoConnectImages(boardId, existingConnections) {
    const images = document.querySelectorAll('.board-image');
    if (images.length < 2) return;
    
    const imageIds = Array.from(images).map(img => img.dataset.imageId);
    
    // Build a map of existing connections per image
    const connectionCount = {};
    const existingPairs = new Set();
    
    imageIds.forEach(id => connectionCount[id] = 0);
    
    existingConnections.forEach(conn => {
        connectionCount[conn.from_image_id] = (connectionCount[conn.from_image_id] || 0) + 1;
        connectionCount[conn.to_image_id] = (connectionCount[conn.to_image_id] || 0) + 1;
        // Store both directions
        existingPairs.add(`${conn.from_image_id}-${conn.to_image_id}`);
        existingPairs.add(`${conn.to_image_id}-${conn.from_image_id}`);
    });
    
    // Randomly designate some images as "hubs" (dramatically more connections)
    const isHub = {};
    const imageMaxConnections = {};
    
    imageIds.forEach(id => {
        isHub[id] = Math.random() < HUB_PROBABILITY;
        imageMaxConnections[id] = isHub[id] 
            ? HUB_MIN_CONNECTIONS + Math.floor(Math.random() * (MAX_CONNECTIONS_PER_IMAGE - HUB_MIN_CONNECTIONS + 1))
            : Math.floor(Math.random() * (NON_HUB_MAX_CONNECTIONS + 1)); // 0 to 3 for non-hubs
    });
    
    // Ensure at least one hub if we have enough images
    if (imageIds.length >= 3 && !Object.values(isHub).some(v => v)) {
        const randomIndex = Math.floor(Math.random() * imageIds.length);
        const hubId = imageIds[randomIndex];
        isHub[hubId] = true;
        imageMaxConnections[hubId] = HUB_MIN_CONNECTIONS + Math.floor(Math.random() * (MAX_CONNECTIONS_PER_IMAGE - HUB_MIN_CONNECTIONS + 1));
    }
    
    console.log('Hub images:', imageIds.filter(id => isHub[id]).length);
    
    // Shuffle image pairs for randomness
    const pairs = [];
    for (let i = 0; i < imageIds.length; i++) {
        for (let j = i + 1; j < imageIds.length; j++) {
            pairs.push([imageIds[i], imageIds[j]]);
        }
    }
    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    
    // Create new connections with randomized distribution
    const newConnections = [];
    
    for (const [fromId, toId] of pairs) {
        // Skip if already connected
        if (existingPairs.has(`${fromId}-${toId}`)) continue;
        
        // Skip if either image already has their max connections
        if (connectionCount[fromId] >= imageMaxConnections[fromId]) continue;
        if (connectionCount[toId] >= imageMaxConnections[toId]) continue;
        
        // Create connection
        newConnections.push({ from: fromId, to: toId });
        connectionCount[fromId]++;
        connectionCount[toId]++;
        existingPairs.add(`${fromId}-${toId}`);
        existingPairs.add(`${toId}-${fromId}`);
    }
    
    // Save new connections to database and render them
    for (const conn of newConnections) {
        const { data, error } = await createConnection(boardId, conn.from, conn.to);
        if (!error && data) {
            const fromEl = document.querySelector(`.board-image[data-image-id="${conn.from}"]`);
            const toEl = document.querySelector(`.board-image[data-image-id="${conn.to}"]`);
            if (fromEl && toEl) {
                createStringLine(data.id, fromEl, toEl);
            }
        }
    }
    
    console.log(`Auto-connected ${newConnections.length} new connections`);
}

/**
 * Create a new connection between two images
 * @param {string} boardId - Board UUID
 * @param {string} fromImageId - Starting image UUID
 * @param {string} toImageId - Ending image UUID
 * @returns {Promise<{data: object, error: object}>}
 */
async function createConnection(boardId, fromImageId, toImageId) {
    const user = await getCurrentUser();
    if (!user) {
        return { data: null, error: { message: 'Must be logged in' } };
    }
    
    // Don't allow connecting to self
    if (fromImageId === toImageId) {
        return { data: null, error: { message: 'Cannot connect image to itself' } };
    }
    
    const { data, error } = await supabaseClient
        .from('all_connected_connections')
        .insert({
            board_id: boardId,
            from_image_id: fromImageId,
            to_image_id: toImageId,
            created_by: user.id
        })
        .select()
        .single();
    
    return { data, error };
}

/**
 * Delete a connection
 * @param {string} connectionId - Connection UUID
 * @returns {Promise<{error: object}>}
 */
async function deleteConnection(connectionId) {
    const { error } = await supabaseClient
        .from('all_connected_connections')
        .delete()
        .eq('id', connectionId);
    
    return { error };
}

/**
 * Get the center point of an image element (for string attachment)
 * @param {HTMLElement} imgEl - The image container element
 * @returns {{x: number, y: number}}
 */
function getImageCenter(imgEl) {
    const left = parseFloat(imgEl.style.left) || 0;
    const top = parseFloat(imgEl.style.top) || 0;
    const width = imgEl.offsetWidth || 300;
    const height = imgEl.offsetHeight || 300;
    
    return {
        x: left + width / 2,
        y: top + 10 // Connect near the pushpin at the top
    };
}

/**
 * Create an SVG line element for a connection
 * @param {string} connectionId - Connection UUID
 * @param {HTMLElement} fromEl - Starting image element
 * @param {HTMLElement} toEl - Ending image element
 * @returns {SVGLineElement}
 */
function createStringLine(connectionId, fromEl, toEl) {
    const svg = document.getElementById('connectionsSvg');
    if (!svg) return null;
    
    const from = getImageCenter(fromEl);
    const to = getImageCenter(toEl);
    
    // Create a group to hold both the hit area and visible line
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('data-connection-id', connectionId);
    group.setAttribute('data-from-image', fromEl.dataset.imageId);
    group.setAttribute('data-to-image', toEl.dataset.imageId);
    
    // Invisible wider line for easier clicking (hit area)
    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    hitArea.setAttribute('x1', from.x);
    hitArea.setAttribute('y1', from.y);
    hitArea.setAttribute('x2', to.x);
    hitArea.setAttribute('y2', to.y);
    hitArea.setAttribute('class', 'connection-hitarea');
    hitArea.setAttribute('stroke', 'transparent');
    hitArea.setAttribute('stroke-width', '20');
    hitArea.setAttribute('stroke-linecap', 'round');
    hitArea.style.cursor = 'pointer';
    hitArea.style.pointerEvents = 'stroke';
    
    // Visible line
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'connection-string');
    line.style.pointerEvents = 'none'; // Let click go through to hit area
    
    group.appendChild(hitArea);
    group.appendChild(line);
    
    // Click to delete (no confirmation needed)
    hitArea.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteConnection(connectionId);
        group.remove();
    });
    
    // Hover effects
    hitArea.addEventListener('mouseenter', () => {
        line.classList.add('connection-string--hover');
    });
    hitArea.addEventListener('mouseleave', () => {
        line.classList.remove('connection-string--hover');
    });
    
    svg.appendChild(group);
    return group;
}

/**
 * Update all string lines connected to an image (after it moves)
 * @param {string} imageId - Image UUID that moved
 */
function updateStringsForImage(imageId) {
    const svg = document.getElementById('connectionsSvg');
    if (!svg) return;
    
    // Query groups that have connections to this image
    const groups = svg.querySelectorAll(`g[data-from-image="${imageId}"], g[data-to-image="${imageId}"]`);
    
    groups.forEach(group => {
        const fromId = group.getAttribute('data-from-image');
        const toId = group.getAttribute('data-to-image');
        
        const fromEl = document.querySelector(`.board-image[data-image-id="${fromId}"]`);
        const toEl = document.querySelector(`.board-image[data-image-id="${toId}"]`);
        
        if (fromEl && toEl) {
            const from = getImageCenter(fromEl);
            const to = getImageCenter(toEl);
            
            // Update both lines in the group (hit area and visible line)
            const lines = group.querySelectorAll('line');
            lines.forEach(line => {
                line.setAttribute('x1', from.x);
                line.setAttribute('y1', from.y);
                line.setAttribute('x2', to.x);
                line.setAttribute('y2', to.y);
            });
        }
    });
}

/**
 * Render all connections for a board
 * @param {Array} connections - Array of connection objects
 */
function renderConnections(connections) {
    const svg = document.getElementById('connectionsSvg');
    if (!svg) {
        console.error('SVG element not found');
        return;
    }
    
    console.log('Rendering connections:', connections.length);
    
    // Clear existing connections
    svg.innerHTML = '';
    
    connections.forEach(conn => {
        const fromEl = document.querySelector(`.board-image[data-image-id="${conn.from_image_id}"]`);
        const toEl = document.querySelector(`.board-image[data-image-id="${conn.to_image_id}"]`);
        
        console.log('Connection:', conn.id, 'from:', conn.from_image_id, 'to:', conn.to_image_id);
        console.log('Found elements:', !!fromEl, !!toEl);
        
        if (fromEl && toEl) {
            createStringLine(conn.id, fromEl, toEl);
        }
    });
}

/**
 * Setup connection mode toggle
 * @param {string} boardId - Board UUID
 */
function setupConnectionMode(boardId) {
    const connectBtn = document.getElementById('connectModeBtn');
    const board = document.getElementById('board');
    const svg = document.getElementById('connectionsSvg');
    
    console.log('Setting up connection mode. Button:', !!connectBtn, 'Board:', !!board, 'SVG:', !!svg);
    
    if (!connectBtn || !board || !svg) return;
    
    connectBtn.addEventListener('click', () => {
        isConnecting = !isConnecting;
        connectBtn.classList.toggle('active', isConnecting);
        board.classList.toggle('connecting-mode', isConnecting);
        
        console.log('Connection mode:', isConnecting ? 'ON' : 'OFF');
        
        if (!isConnecting) {
            // Cancel any in-progress connection
            connectionStart = null;
            if (tempLine) {
                tempLine.remove();
                tempLine = null;
            }
        }
    });
    
    // Add click handlers to all images for connections
    function handleImageClick(e) {
        console.log('Image clicked, isConnecting:', isConnecting);
        if (!isConnecting) return;
        
        const imageEl = e.currentTarget;
        e.preventDefault();
        e.stopPropagation();
        
        const imageId = imageEl.dataset.imageId;
        console.log('Image ID:', imageId);
        
        if (!connectionStart) {
            // First click - start connection
            connectionStart = imageEl;
            imageEl.classList.add('connection-source');
            console.log('Connection started from:', imageId);
            
            // Create temp line
            const center = getImageCenter(imageEl);
            tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tempLine.setAttribute('x1', center.x);
            tempLine.setAttribute('y1', center.y);
            tempLine.setAttribute('x2', center.x);
            tempLine.setAttribute('y2', center.y);
            tempLine.setAttribute('class', 'connection-string connection-string--temp');
            svg.appendChild(tempLine);
            
        } else if (imageEl !== connectionStart) {
            // Second click - complete connection
            console.log('Completing connection to:', imageId);
            createConnection(
                boardId, 
                connectionStart.dataset.imageId, 
                imageEl.dataset.imageId
            ).then(({ data, error }) => {
                console.log('Create connection result:', data, error);
                
                if (!error && data) {
                    createStringLine(data.id, connectionStart, imageEl);
                    console.log('String line created!');
                } else if (error) {
                    console.error('Error creating connection:', error);
                }
                
                // Reset state
                connectionStart.classList.remove('connection-source');
                connectionStart = null;
                if (tempLine) {
                    tempLine.remove();
                    tempLine = null;
                }
            });
        }
    }
    
    // Attach click handlers to all existing images
    document.querySelectorAll('.board-image').forEach(img => {
        img.addEventListener('click', handleImageClick);
    });
    
    // Watch for new images being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('board-image')) {
                    node.addEventListener('click', handleImageClick);
                }
            });
        });
    });
    observer.observe(board, { childList: true });
    
    // Update temp line as mouse moves
    board.addEventListener('mousemove', (e) => {
        if (!isConnecting || !tempLine || !connectionStart) return;
        
        const rect = board.getBoundingClientRect();
        const scale = canvasScale || 1;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        
        tempLine.setAttribute('x2', x);
        tempLine.setAttribute('y2', y);
    });
    
    // Cancel on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isConnecting) {
            connectionStart?.classList.remove('connection-source');
            connectionStart = null;
            if (tempLine) {
                tempLine.remove();
                tempLine = null;
            }
        }
    });
}
