import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const postsContainer = document.getElementById('postsContainer');

// Render posts
async function renderPosts() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = '<div class="error">Error loading posts</div>';
        return;
    }

    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No posts yet.</div>';
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
            </div>
        `;
    }).join('');
}

// Initialize
renderPosts();
