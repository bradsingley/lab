// Initialize posts array from localStorage or empty array
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

// DOM elements
const postForm = document.getElementById('postForm');
const postTypeSelect = document.getElementById('postType');
const externalLinkGroup = document.getElementById('externalLinkGroup');
const contentGroup = document.getElementById('contentGroup');
const postsContainer = document.getElementById('postsContainer');

// Toggle between external link and content fields
postTypeSelect.addEventListener('change', function() {
    if (this.value === 'external') {
        externalLinkGroup.style.display = 'block';
        contentGroup.style.display = 'none';
        document.getElementById('externalLink').required = true;
        document.getElementById('content').required = false;
    } else {
        externalLinkGroup.style.display = 'none';
        contentGroup.style.display = 'block';
        document.getElementById('externalLink').required = false;
        document.getElementById('content').required = true;
    }
});

// Handle form submission
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const thumbnail = document.getElementById('thumbnail').value;
    const postType = document.getElementById('postType').value;
    const externalLink = document.getElementById('externalLink').value;
    const content = document.getElementById('content').value;
    
    const newPost = {
        id: Date.now(),
        title: title,
        date: date,
        thumbnail: thumbnail,
        type: postType,
        externalLink: postType === 'external' ? externalLink : null,
        content: postType === 'content' ? content : null
    };
    
    posts.push(newPost);
    savePosts();
    renderPosts();
    postForm.reset();
    
    // Reset form display
    externalLinkGroup.style.display = 'block';
    contentGroup.style.display = 'none';
    postTypeSelect.value = 'external';
});

// Save posts to localStorage
function savePosts() {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
}

// Render posts (newest first)
function renderPosts() {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="no-posts">No posts yet. Add your first post above!</div>';
        return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    postsContainer.innerHTML = sortedPosts.map(post => {
        const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const isClickable = post.type === 'external' ? 'clickable' : '';
        const linkIndicator = post.type === 'external' ? '<div class="post-link-indicator">🔗 Read more →</div>' : '';
        const contentDisplay = post.type === 'content' ? `<div class="post-content">${post.content}</div>` : '';
        
        return `
            <div class="post-item ${isClickable}" data-id="${post.id}" ${post.type === 'external' ? `onclick="window.open('${post.externalLink}', '_blank')"` : ''}>
                <img src="${post.thumbnail}" alt="${post.title}" class="post-thumbnail">
                <div class="post-info">
                    <div class="post-title">${post.title}</div>
                    <div class="post-date">${formattedDate}</div>
                    ${contentDisplay}
                    ${linkIndicator}
                </div>
                <button class="delete-btn" onclick="deletePost(event, ${post.id})">Delete</button>
            </div>
        `;
    }).join('');
}

// Delete a post
function deletePost(event, postId) {
    event.stopPropagation(); // Prevent triggering the external link
    
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
    }
}

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// Initial render
renderPosts();
