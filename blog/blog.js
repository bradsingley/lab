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
        
        // If it's an external link, make it clickable
        if (post.type === 'external') {
            return `
                <a href="${post.external_link}" target="_blank" class="post-item">
                    <div class="post-content-wrapper">
                        <h2 class="post-title">${post.title}</h2>
                        <div class="post-date">${formattedDate}</div>
                    </div>
                </a>
            `;
        } else {
            // For content posts, link to a detail page or show inline
            return `
                <div class="post-item" onclick="alert('${post.content.replace(/'/g, "\\'")}')">
                    <div class="post-content-wrapper">
                        <h2 class="post-title">${post.title}</h2>
                        <div class="post-date">${formattedDate}</div>
                    </div>
                </div>
            `;
        }
    }).join('');
}

// Initialize
renderPosts();
