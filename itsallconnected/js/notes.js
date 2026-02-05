/**
 * Notes Module
 * Handles post-it notes on the conspiracy board
 */

console.log('=== notes.js loaded ===');

/**
 * Get all notes for a board
 * @param {string} boardId - Board UUID
 * @returns {Promise<Array>}
 */
async function getBoardNotes(boardId) {
    const { data, error } = await supabaseClient
        .from('all_connected_notes')
        .select('*')
        .eq('board_id', boardId);
    
    if (error) {
        console.error('Error fetching notes:', error);
        return [];
    }
    
    return data || [];
}

/**
 * Create a new note
 * @param {string} boardId - Board UUID
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Promise<{data: object, error: object}>}
 */
async function createNote(boardId, x = 100, y = 100) {
    const user = await getCurrentUser();
    if (!user) {
        return { data: null, error: { message: 'Must be logged in' } };
    }
    
    // Random slight rotation for natural look (-5 to 5 degrees)
    const rotation = (Math.random() - 0.5) * 10;
    
    const { data, error } = await supabaseClient
        .from('all_connected_notes')
        .insert({
            board_id: boardId,
            content: '',
            position_x: Math.round(x),
            position_y: Math.round(y),
            rotation: rotation,
            created_by: user.id
        })
        .select()
        .single();
    
    return { data, error };
}

/**
 * Update note content
 * @param {string} noteId - Note UUID
 * @param {string} content - New content
 * @returns {Promise<{error: object}>}
 */
async function updateNoteContent(noteId, content) {
    const { error } = await supabaseClient
        .from('all_connected_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', noteId);
    
    return { error };
}

/**
 * Update note position
 * @param {string} noteId - Note UUID
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Promise<{error: object}>}
 */
async function updateNotePosition(noteId, x, y) {
    const { error } = await supabaseClient
        .from('all_connected_notes')
        .update({ 
            position_x: Math.round(x), 
            position_y: Math.round(y),
            updated_at: new Date().toISOString() 
        })
        .eq('id', noteId);
    
    return { error };
}

/**
 * Delete a note
 * @param {string} noteId - Note UUID
 * @returns {Promise<{error: object}>}
 */
async function deleteNote(noteId) {
    const { error } = await supabaseClient
        .from('all_connected_notes')
        .delete()
        .eq('id', noteId);
    
    return { error };
}

/**
 * Render a note element on the board
 * @param {object} note - Note data from database
 * @param {boolean} isOwner - Whether the current user owns this board
 * @returns {HTMLElement}
 */
function renderNote(note, isOwner) {
    const noteEl = document.createElement('div');
    noteEl.className = 'board-note';
    noteEl.dataset.noteId = note.id;
    noteEl.style.left = `${note.position_x}px`;
    noteEl.style.top = `${note.position_y}px`;
    noteEl.style.transform = `rotate(${note.rotation}deg)`;
    
    // Textarea for content
    const textarea = document.createElement('textarea');
    textarea.className = 'board-note__content';
    textarea.value = note.content || '';
    textarea.placeholder = 'Write something...';
    textarea.readOnly = !isOwner;
    
    if (isOwner) {
        // Save on blur
        textarea.addEventListener('blur', async () => {
            if (textarea.value !== note.content) {
                await updateNoteContent(note.id, textarea.value);
                note.content = textarea.value;
            }
        });
        
        // Save on Ctrl+Enter
        textarea.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                textarea.blur();
            }
        });
    }
    
    noteEl.appendChild(textarea);
    
    // Delete button (only for owner)
    if (isOwner) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'board-note__delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Remove note';
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteNote(note.id);
            noteEl.remove();
        });
        noteEl.appendChild(deleteBtn);
    }
    
    // Make draggable if owner
    if (isOwner) {
        makeNoteDraggable(noteEl, note);
    }
    
    return noteEl;
}

/**
 * Make a note element draggable
 * @param {HTMLElement} noteEl - The note element
 * @param {object} note - Note data object
 */
function makeNoteDraggable(noteEl, note) {
    let isDragging = false;
    let startX, startY, origX, origY;
    
    noteEl.addEventListener('mousedown', (e) => {
        // Don't drag if clicking on textarea or delete button
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') {
            return;
        }
        
        // Don't start drag in connection mode
        if (typeof isConnecting !== 'undefined' && isConnecting) {
            return;
        }
        
        isDragging = true;
        noteEl.classList.add('dragging');
        
        const scale = typeof canvasScale !== 'undefined' ? canvasScale : 1;
        startX = e.clientX / scale;
        startY = e.clientY / scale;
        origX = parseFloat(noteEl.style.left) || 0;
        origY = parseFloat(noteEl.style.top) || 0;
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const scale = typeof canvasScale !== 'undefined' ? canvasScale : 1;
        const dx = e.clientX / scale - startX;
        const dy = e.clientY / scale - startY;
        
        const newX = origX + dx;
        const newY = origY + dy;
        
        noteEl.style.left = `${newX}px`;
        noteEl.style.top = `${newY}px`;
        
        // Update strings connected to this note
        if (typeof updateStringsForImage === 'function') {
            updateStringsForImage(note.id);
        }
    });
    
    document.addEventListener('mouseup', async () => {
        if (!isDragging) return;
        
        isDragging = false;
        noteEl.classList.remove('dragging');
        
        const newX = parseFloat(noteEl.style.left) || 0;
        const newY = parseFloat(noteEl.style.top) || 0;
        
        // Save position to database
        await updateNotePosition(note.id, newX, newY);
        note.position_x = newX;
        note.position_y = newY;
    });
}

/**
 * Render all notes for a board
 * @param {Array} notes - Array of note objects
 * @param {boolean} isOwner - Whether current user owns the board
 */
function renderNotes(notes, isOwner) {
    const board = document.getElementById('board');
    if (!board) return;
    
    notes.forEach(note => {
        const noteEl = renderNote(note, isOwner);
        board.appendChild(noteEl);
    });
    
    console.log(`Rendered ${notes.length} notes`);
}
