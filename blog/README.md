# Experiments with Supabase

A secure, cloud-based Content Management System for managing experiments with authentication and image uploads.

## Features

- 🔐 **Secure Authentication**: Sign in with Supabase authentication
- ✏️ **Edit Posts**: Modify existing posts anytime
- 📤 **Image Upload**: Upload images directly or use URLs (no http:// required)
- 🔗 **External Links & Content**: Link to external articles or write content directly
- 📅 **Automatic Sorting**: Newest posts appear at the top
- 🎨 **Clean Layout**: Single column with 180x120px thumbnails on the left
- 🔄 **Two-Page System**: Separate admin (index.html) and public blog (blog.html) pages
- ☁️ **Cloud Storage**: All data stored securely in Supabase

## Files

- `index.html` - Admin panel (requires authentication)
- `blog.html` - Public experiments view (no authentication required)
- `admin.js` - Admin functionality
- `blog.js` - Public experiments functionality
- `styles.css` - Admin styling
- `blog-styles.css` - Public blog styling
- `supabase-config.js` - Supabase configuration
- `setup-instructions.md` - Complete setup guide

## Setup

**IMPORTANT**: Before using this CMS, you must complete the Supabase setup. See `setup-instructions.md` for detailed steps:

1. Create a Supabase account and project
2. Add your credentials to `supabase-config.js`
3. Create the database table (SQL provided)
4. Set up storage bucket for images
5. Create your admin user account

## Usage

### Admin Panel (index.html)
1. Sign in with your Supabase credentials
2. Add new posts or edit existing ones
3. Upload images or provide URLs
4. Choose between external links or written content
5. Manage all posts (edit/delete)

### Public Experiments (blog.html)
- No authentication required
- Shows all published posts
- Visitors can click external links
- Read full content posts

## Local Development

To run locally, use a web server (required for ES modules):

```bash
# Python 3
python -m http.server 8000

# Node.js (with http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

Then visit:
- Admin: `http://localhost:8000/index.html`
- Blog: `http://localhost:8000/blog.html`

## Notes

- URLs automatically get `https://` prepended if no protocol is specified
- Images are stored in Supabase Storage
- Posts are stored in Supabase database
- Row Level Security ensures users can only edit their own posts
