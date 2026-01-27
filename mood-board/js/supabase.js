// ============================================
// AUTH HELPERS (work without Supabase for basic functions)
// ============================================

// Get current user
function getCurrentUser() {
    const stored = localStorage.getItem('moodboard_user');
    return stored ? JSON.parse(stored) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Sign out
function signOut() {
    localStorage.removeItem('moodboard_user');
    window.location.href = '/';
}

// ============================================
// Supabase Configuration & Initialization
// ============================================
const SUPABASE_URL = 'https://wocjfeyhzrofrqhoppbr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_JEgRKgVLXWvtioEqKyxhow_ngcsav1E';

let sbClient = null;

function initSupabase() {
    if (sbClient) return sbClient;
    
    const createClient = window.supabase?.createClient;
    if (!createClient) {
        console.error('Supabase SDK not loaded!');
        throw new Error('Supabase SDK not loaded. Check internet connection.');
    }
    
    sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Supabase initialized');
    return sbClient;
}

// ============================================
// AUTH HELPERS (require Supabase)
// ============================================

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function signUp(name, email, password) {
    const sb = initSupabase();
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await sb
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
    
    localStorage.setItem('moodboard_user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
    }));
    
    return data;
}

async function signIn(email, password) {
    const sb = initSupabase();
    const passwordHash = await hashPassword(password);
    
    const { data, error } = await sb
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
    
    localStorage.setItem('moodboard_user', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
    }));
    
    return data;
}

// ============================================
// BOARD HELPERS
// ============================================

async function getBoards() {
    const sb = initSupabase();
    
    const { data: boards, error } = await sb
        .from('moodboard_boards')
        .select('*, moodboard_images(image_url)')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return boards.map(board => ({
        ...board,
        thumbnail: board.moodboard_images.length > 0
            ? board.moodboard_images[Math.floor(Math.random() * board.moodboard_images.length)].image_url
            : null
    }));
}

async function getBoard(boardId) {
    const sb = initSupabase();
    
    const { data, error } = await sb
        .from('moodboard_boards')
        .select('*, moodboard_images(*)')
        .eq('id', boardId)
        .single();
    
    if (error) throw error;
    return data;
}

async function createBoard(name) {
    const sb = initSupabase();
    const user = getCurrentUser();
    
    const { data, error } = await sb
        .from('moodboard_boards')
        .insert({ name, created_by: user?.id || null })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

// ============================================
// IMAGE HELPERS
// ============================================

async function uploadImage(boardId, file, contributorName) {
    const sb = initSupabase();
    
    const ext = file.name.split('.').pop();
    const fileName = boardId + '/' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) + '.' + ext;
    
    const { error: uploadError } = await sb
        .storage
        .from('moodboard_images')
        .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = sb
        .storage
        .from('moodboard_images')
        .getPublicUrl(fileName);
    
    const { data, error } = await sb
        .from('moodboard_images')
        .insert({
            board_id: boardId,
            image_url: urlData.publicUrl,
            contributor_name: contributorName,
            position_x: Math.random() * 400 + 50,
            position_y: Math.random() * 400 + 50
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

async function updateImagePosition(imageId, x, y, zIndex) {
    const sb = initSupabase();
    const updates = { position_x: x, position_y: y };
    if (zIndex !== null && zIndex !== undefined) updates.z_index = zIndex;
    
    const { error } = await sb
        .from('moodboard_images')
        .update(updates)
        .eq('id', imageId);
    
    if (error) throw error;
}

async function updateImageSize(imageId, width, height) {
    const sb = initSupabase();
    
    const { error } = await sb
        .from('moodboard_images')
        .update({ width, height })
        .eq('id', imageId);
    
    if (error) throw error;
}

async function deleteImage(imageId) {
    const sb = initSupabase();
    
    const { error } = await sb
        .from('moodboard_images')
        .delete()
        .eq('id', imageId);
    
    if (error) throw error;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

function subscribeToBoardChanges(boardId, callback) {
    const sb = initSupabase();
    
    return sb
        .channel('board:' + boardId)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'moodboard_images',
            filter: 'board_id=eq.' + boardId
        }, callback)
        .subscribe();
}

console.log('supabase.js loaded successfully');
