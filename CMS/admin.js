import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('postForm');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');
const postTypeSelect = document.getElementById('postType');
const externalLinkGroup = document.getElementById('externalLinkGroup');
const contentGroup = document.getElementById('contentGroup');
const postsContainer = document.getElementById('postsContainer');
const thumbnailUpload = document.getElementById('thumbnailUpload');
const thumbnailUrl = document.getElementById('thumbnailUrl');
const thumbnailPreview = document.getElementById('thumbnailPreview');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const editingPostId = document.getElementById('editingPostId');

let currentUser = null;

// Normalize URL - add https:// if no protocol
function normalizeUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
    }
    return url;
}

// Check authentication status
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        currentUser = user;
        showAdminSection();
    } else {
        showLoginSection();
    }
}

// Show/hide sections
function showLoginSection() {
    loginSection.style.display = 'flex';
    adminSection.style.display = 'none';
}

function showAdminSection() {
    loginSection.style.display = 'none';
    adminSection.style.display = 'block';
    renderPosts();
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        authMessage.textContent = error.message;
        authMessage.className = 'auth-message error';
    } else {
        currentUser = data.user;
        authMessage.textContent = 'Successfully signed in!';
        authMessage.className = 'auth-message success';
        setTimeout(() => showAdminSection(), 500);
    }
});

// Handle logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    showLoginSection();
});

// Toggle between external link and content fields
postTypeSelect.addEventListener('change', function() {
    if (this.value === 'external') {
        externalLinkGroup.style.display = 'block';
        contentGroup.style.display = 'none';
    } else {
        externalLinkGroup.style.display = 'none';
        contentGroup.style.display = 'block';
    }
});

// Handle thumbnail upload and preview
thumbnailUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        thumbnailPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
});

// Handle thumbnail URL input
thumbnailUrl.addEventListener('input', (e) => {
    const url = normalizeUrl(e.target.value);
    if (url) {
        thumbnailPreview.innerHTML = `<img src="${url}" alt="Preview">`;
    } else {
        thumbnailPreview.innerHTML = '';
    }
});

// Upload image to Supabase Storage
async function uploadImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;

    const { data, error } = await supabase.storage
        .from('lab-thumbnails')
        .upload(filePath, file);

    if (error) {
        console.error('Error uploading image:', error);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('lab-thumbnails')
        .getPublicUrl(filePath);

    return publicUrl;
}

// Handle form submission (add or edit post)
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const postType = document.getElementById('postType').value;
    const externalLink = document.getElementById('externalLink').value;
    const content = document.getElementById('content').value;
    const postId = editingPostId.value;

    // Handle thumbnail
    let thumbnailUrlValue;
    if (thumbnailUpload.files[0]) {
        thumbnailUrlValue = await uploadImage(thumbnailUpload.files[0]);
    } else {
        thumbnailUrlValue = normalizeUrl(thumbnailUrl.value);
    }

    if (!thumbnailUrlValue) {
        alert('Please provide a thumbnail image');
        return;
    }

    const postData = {
        title,
        date,
        thumbnail: thumbnailUrlValue,
        type: postType,
        external_link: postType === 'external' ? normalizeUrl(externalLink) : null,
        content: postType === 'content' ? content : null,
        user_id: currentUser.id
    };

    let error;
    if (postId) {
        // Update existing post
        ({ error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', postId));
    } else {
        // Insert new post
        ({ error } = await supabase
            .from('posts')
            .insert([postData]));
    }

    if (error) {
        console.error('Error saving post:', error);
        alert('Error saving post: ' + error.message);
    } else {
        resetForm();
        renderPosts();
    }
});

// Cancel editing
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Reset form
function resetForm() {
    postForm.reset();
    editingPostId.value = '';
    thumbnailPreview.innerHTML = '';
    formTitle.textContent = 'Add New Post';
    submitBtn.textContent = 'Add Post';
    cancelBtn.style.display = 'none';
    externalLinkGroup.style.display = 'block';
    contentGroup.style.display = 'none';
    document.getElementById('date').valueAsDate = new Date();
}

// Edit post
window.editPost = async (postId) => {
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return;
    }

    // Populate form
    editingPostId.value = post.id;
    document.getElementById('title').value = post.title;
    document.getElementById('date').value = post.date;
    document.getElementById('postType').value = post.type;
    
    // Handle thumbnail
    thumbnailUrl.value = post.thumbnail;
    thumbnailPreview.innerHTML = `<img src="${post.thumbnail}" alt="Preview">`;

    if (post.type === 'external') {
        externalLinkGroup.style.display = 'block';
        contentGroup.style.display = 'none';
        document.getElementById('externalLink').value = post.external_link || '';
    } else {
        externalLinkGroup.style.display = 'none';
        contentGroup.style.display = 'block';
        document.getElementById('content').value = post.content || '';
    }

    // Update UI
    formTitle.textContent = 'Edit Post';
    submitBtn.textContent = 'Update Post';
    cancelBtn.style.display = 'block';

    // Scroll to form
    postForm.scrollIntoView({ behavior: 'smooth' });
};

// Delete post
window.deletePost = async (event, postId) => {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
    } else {
        renderPosts();
    }
};

// Render posts
async function renderPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = '<div class="no-posts">Error loading posts</div>';
        return;
    }

    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No posts yet. Add your first post above!</div>';
        return;
    }

    postsContainer.innerHTML = posts.map(post => {
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const isClickable = post.type === 'external' ? 'clickable' : '';
        const linkIndicator = post.type === 'external' ? '<div class="post-link-indicator">🔗 Read more →</div>' : '';
        const contentDisplay = post.type === 'content' ? `<div class="post-content">${post.content}</div>` : '';
        
        return `
            <div class="post-item ${isClickable}" ${post.type === 'external' ? `onclick="window.open('${post.external_link}', '_blank')"` : ''}>
                <img src="${post.thumbnail}" alt="${post.title}" class="post-thumbnail">
                <div class="post-info">
                    <div class="post-title">${post.title}</div>
                    <div class="post-date">${formattedDate}</div>
                    ${contentDisplay}
                    ${linkIndicator}
                </div>
                <div class="post-actions">
                    <button class="edit-btn" onclick="event.stopPropagation(); editPost('${post.id}')">Edit</button>
                    <button class="delete-btn" onclick="deletePost(event, '${post.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Initialize
checkAuth();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        currentUser = session.user;
        showAdminSection();
    } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        showLoginSection();
    }
});
