# Collaborative Moodboard App - Implementation Plan

## Product Overview

A collaborative whiteboard-style moodboard application where multiple users can upload, arrange, and share images on shared boards.

---

## User Experience

### Authentication
- **Account required**: To add or edit boards
- **No login required**: To view boards
- **Open registration**: Anyone can create an account
- **Simple auth**: Name, Email, Password stored in database (no email confirmation)

### Homepage
- Create new board button
- Gallery of existing boards
- Each board thumbnail shows a random image from that board

### Board Creation
- Prompt user to name the moodboard
- Board becomes accessible to all logged-in users for editing

### Board Interaction
- Upload multiple images at once
- Prompt for contributor name on each upload session
- Display contributor name below each image
- Drag-and-drop to rearrange images on the canvas
- Real-time or near-real-time collaboration

---

## Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Frontend | Vanilla HTML/CSS/JS |
| Backend | Supabase (hosted) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | Custom (database-based) |

### Project Structure
```
mood-board/
├── frontend/
│   ├── index.html          # Homepage with board gallery
│   ├── board.html          # Individual board view/edit
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── supabase.js     # Supabase client init
│       ├── auth.js         # Authentication logic
│       ├── boards.js       # Board CRUD operations
│       ├── images.js       # Image upload/management
│       └── drag.js         # Drag-and-drop functionality
├── supabase/
│   └── migrations/         # Database migrations
├── PLAN.md
└── README.md
```

---

## Supabase Configuration

### Naming Convention
All tables and buckets prefixed with `moodboard_`

### Database Tables

#### `moodboard_users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| email | text | UNIQUE, NOT NULL |
| password_hash | text | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

#### `moodboard_boards`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| created_by | uuid | REFERENCES moodboard_users(id) |
| created_at | timestamptz | DEFAULT now() |

#### `moodboard_images`
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| board_id | uuid | REFERENCES moodboard_boards(id) ON DELETE CASCADE |
| image_url | text | NOT NULL |
| contributor_name | text | NOT NULL |
| position_x | float | DEFAULT 0 |
| position_y | float | DEFAULT 0 |
| z_index | int | DEFAULT 0 |
| width | float | NULL |
| height | float | NULL |
| created_at | timestamptz | DEFAULT now() |

### Storage Buckets

#### `moodboard_images`
- Public bucket for image uploads
- File size limit: TBD
- Allowed MIME types: image/*

### Row Level Security (RLS) Policies

#### `moodboard_users`
- SELECT: Authenticated users can read their own row
- INSERT: Anyone (for registration)
- UPDATE: Users can update their own row

#### `moodboard_boards`
- SELECT: Anyone (public viewing)
- INSERT: Authenticated users only
- UPDATE: Authenticated users only
- DELETE: Board creator only

#### `moodboard_images`
- SELECT: Anyone (public viewing)
- INSERT: Authenticated users only
- UPDATE: Authenticated users only
- DELETE: Authenticated users only

### Storage Policies

#### `moodboard_images` bucket
- SELECT: Anyone (public access)
- INSERT: Authenticated users only

---

## Implementation Steps

### Phase 1: Supabase Setup
1. [ ] Read latest Supabase JS SDK documentation
2. [ ] Initialize Supabase CLI in project
3. [ ] Link to existing Supabase project
4. [ ] Create database migration for all tables
5. [ ] Apply migration
6. [ ] Create storage bucket
7. [ ] Set up RLS policies
8. [ ] Verify all resources provisioned successfully

### Phase 2: Frontend Foundation
1. [ ] Create frontend folder structure
2. [ ] Initialize Supabase client with publishable key
3. [ ] Build registration page
4. [ ] Build login page
5. [ ] Implement session management (localStorage)

### Phase 3: Board Management
1. [ ] Build homepage with board gallery
2. [ ] Implement "Create Board" flow
3. [ ] Fetch and display existing boards
4. [ ] Show random image as board thumbnail

### Phase 4: Board Canvas
1. [ ] Build board view page
2. [ ] Implement multi-image upload
3. [ ] Contributor name prompt on upload
4. [ ] Display images on canvas with contributor names
5. [ ] Implement drag-and-drop repositioning
6. [ ] Save position changes to database

### Phase 5: Polish
1. [ ] Error handling and validation
2. [ ] Loading states
3. [ ] Responsive design
4. [ ] Testing

---

## Development Environment

- **Frontend hosting**: `localhost:8080`
- **Supabase**: Hosted project (no local backend)
- **CLI**: Supabase CLI for migrations and bucket creation

---

## API Keys

Using the **new Supabase publishable key** (not legacy anon public key)

---

## Verification Checklist

After provisioning, confirm:
- [ ] `moodboard_users` table exists with correct schema
- [ ] `moodboard_boards` table exists with correct schema
- [ ] `moodboard_images` table exists with correct schema
- [ ] `moodboard_images` storage bucket exists and is public
- [ ] RLS policies are active and correct
- [ ] Storage policies allow public read, authenticated write
