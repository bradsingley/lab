// Supabase Configuration
const SUPABASE_URL = 'https://wocjfeyhzrofrqhoppbr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JEgRKgVLXWvtioEqKyxhow_ngcsav1E';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// AUTH HELPERS (Database-based simple auth)
// ============================================

// Hash password using Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Sign up a new user
async function signUp(name, email, password) {
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await supabase
        .from('moodboard_users')
        .insert({ name, email, password_hash: passwordHash })
        .select()
        .single();
    
    if (error) {
        if (error.code === '23505') {
            throw new Error('Email already registered');
        }
        throw error;
    }
    
    // Store session
    localStorage.setItem('moodboard_user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
    }));
    
    return data;
}

// Sign in existing user
async function signIn(email, password) {
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await supabase
        .from('moodboard_users')
        .select('id, name, email, password_hash')
        .eq('email', email)
        .single();
    
    if (error || !data) {
        throw new Error('Invalid email or password');
    }
    
    if (data.password_hash !== passwordHash) {
        throw new Error('Invalid email or password');
    }
    
    // Store session
    localStorage.setItem('moodboard_user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
    }));
    
    return data;
}

// Sign out
function signOut() {
    localStorage.removeItem('moodboard_user');
    window.location.href = '/';
}

// Get current user
function getCurrentUser() {
    const stored = localStorage.getItem('moodboard_user');
    return stored ? JSON.parse(stored) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ============================================
// BOARD HELPERS
// ============================================

// Get all boards with a random thumbnail image
async function getBoards() {
    const { data: boards, error } = await supabase
        .from('moodboard_boards')
        .select('*, moodboard_images(image_url)')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add random thumbnail to each board
    return boards.map(board => ({
        ...board,
        thumbnail: board.moodboard_images.length > 0
            ? board.moodboard_images[Math.floor(Math.random() * board.moodboard_images.length)].image_url
            : null
    }));
}

// Get a single board with all its images
async function getBoard(boardId) {
    const { data, error } = await supabase
        .from('moodboard_boards')
        .select('*, moodboard_images(*)')
        .eq('id', boardId)
        .single();
    
    if (error) throw error;
    return data;
}

// Create a new board
async function createBoard(name) {
    const user = getCurrentUser();
    if (!user) throw new Error('Must be logged in to create a board');
    
    const { data, error } = await supabase
        .from('moodboard_boards')
        .insert({ name, created_by: user.id })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// IMAGE HELPERS
// ============================================

// Upload image to storage and add to board
async function uploadImage(boardId, file, contributorName) {
    // Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${boardId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('moodboard_images')
        .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase
        .storage
        .from('moodboard_images')
        .getPublicUrl(fileName);
    
    // Add to database
    const { data, error } = await supabase
        .from('moodboard_images')
        .insert({
            board_id: boardId,
            image_url: publicUrl,
            contributor_name: contributorName,
            position_x: Math.random() * 400 + 50,
            position_y: Math.random() * 400 + 50
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// Update image position
async function updateImagePosition(imageId, x, y, zIndex = null) {
    const updates = { position_x: x, position_y: y };
    if (zIndex !== null) updates.z_index = zIndex;
    
    const { error } = await supabase
        .from('moodboard_images')
        .update(updates)
        .eq('id', imageId);
    
    if (error) throw error;
}

// Update image size
async function updateImageSize(imageId, width, height) {
    const { error } = await supabase
        .from('moodboard_images')
        .update({ width, height })
        .eq('id', imageId);
    
    if (error) throw error;
}

// Delete image
async function deleteImage(imageId) {
    const { error } = await supabase
        .from('moodboard_images')
        .delete()
        .eq('id', imageId);
    
    if (error) throw error;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

// Subscribe to board changes
function subscribeToBoardChanges(boardId, callback) {
    return supabase
        .channel(`board:${boardId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'moodboard_images',
            filter: `board_id=eq.${boardId}`
        }, callback)
        .subscribe();
}
