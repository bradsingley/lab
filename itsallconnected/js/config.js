/**
 * Supabase Configuration
 * Initializes the Supabase client
 */

const SUPABASE_URL = 'https://whcfyfyqhlwqyoqdhuls.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_pOYW0_Fgidv3pWqxIed3Yw_eH3QB2XQ';

// Get createClient from global supabase object (CDN approach)
const { createClient } = supabase;

// Initialize the Supabase client
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Storage bucket name
const STORAGE_BUCKET = 'all-connected-images';

// Table names
const TABLES = {
    PROFILES: 'all_connected_profiles',
    BOARDS: 'all_connected_boards',
    IMAGES: 'all_connected_images'
};
