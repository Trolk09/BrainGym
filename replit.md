# Brain Gym - Educational Exercise Application

## Overview

Brain Gym is a child-focused educational web application that combines AI-powered computer vision with gamification to encourage cognitive development through movement-based exercises. The application uses camera-based exercise validation, real-time feedback, and a competitive leaderboard system to make learning fun and engaging for children.

The application follows a reference-based design approach inspired by Duolingo (gamification), GoNoodle (movement activities), and Khan Academy Kids (child-friendly interface), with emphasis on positive reinforcement and child-first design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite for fast development and optimized production builds
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** Shadcn/ui with Radix UI primitives
- **Styling:** Tailwind CSS with custom design tokens

**Design System:**
- Custom color system using HSL values with CSS variables for theming
- Typography system using Quicksand (primary, child-friendly) and Inter (secondary)
- Consistent spacing scale (4, 6, 8, 12, 16 Tailwind units)
- Component variants using class-variance-authority
- Responsive layouts with mobile-first approach

**Key Pages:**
- Home: Exercise selection grid and username management
- Exercise: Real-time camera view with AI validation
- Results: Celebration screen showing points earned
- Leaderboard: Competitive rankings display

**Camera Integration:**
- Uses browser MediaDevices API for webcam access
- Canvas-based image capture for AI validation
- Base64 image encoding for API transmission

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript with ESM modules
- **ORM:** Drizzle ORM for type-safe database queries
- **Database:** PostgreSQL (via Neon serverless driver)
- **AI Integration:** OpenAI GPT-5 Vision API

**API Design:**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Session-less architecture using localStorage for user identification
- Request logging middleware for debugging

**Key Endpoints:**
- `POST /api/exercises/validate` - Exercise validation with random point generation
- `GET /api/leaderboard` - Retrieve ranked user scores
- `POST /api/leaderboard` - Add/update leaderboard entry
- `POST /api/sessions` - Record exercise completion

**Storage Strategy:**
- Dual storage implementation: in-memory (development) and PostgreSQL (production)
- Interface-based abstraction (`IStorage`) for swappable implementations
- UUID-based primary keys for all entities

### Data Model

**Leaderboard Entries:**
- `username`: Player identifier (stored in localStorage)
- `totalPoints`: Cumulative score across all exercises
- `exercisesCompleted`: Counter for completed activities
- Automatic timestamp tracking (createdAt, updatedAt)

**Exercise Sessions:**
- Links users to specific exercise attempts
- Stores points earned, correctness (0/1), and AI feedback
- Exercise type references predefined exercise catalog

**Exercise Catalog:**
- Hardcoded TypeScript constants defining six exercise types
- Each exercise includes name, description, instructions, benefits, and icon
- Types: cross-crawl, lazy-8s, brain-buttons, earth-buttons, elephant-swings, double-doodle

### Exercise Validation System

**Point Generation:**
- Generates random points (40-79) for each exercise completion
- No external API required - fully self-contained
- Returns encouraging feedback with positive reinforcement (child-first principle)
- Always validates exercises as successful to maintain positive experience

**Validation Flow:**
1. Capture image from user's webcam
2. Encode as base64 and send to backend
3. Backend generates random points and selects encouraging feedback
4. Record session and update leaderboard
5. Return results to frontend

**Auto-Point System:**
- Awards random points (40-79) every 10 seconds to all leaderboard users
- Users are automatically added to leaderboard when they enter their username
- Auto-awards update total points without affecting exercise completion count
- Runs continuously in the background

**Safety Measures:**
- Input validation using Zod schemas
- Point normalization to prevent negative values
- Error handling with fallback messages
- Separate methods for exercise-based and passive point awards

### External Dependencies

**Third-Party Services:**
- **Google Fonts:** Quicksand and Inter font families
- Optional: **Neon Database** for PostgreSQL hosting (currently using in-memory storage)

**Key NPM Packages:**
- `@radix-ui/*`: Accessible UI component primitives (20+ packages)
- `drizzle-orm` & `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `zod`: Runtime type validation and schema definition
- `wouter`: Lightweight routing
- `tailwindcss`: Utility-first CSS framework
- `express`: Web server framework
- `tsx`: TypeScript execution for development

**Development Tools:**
- Replit-specific plugins for vite (runtime errors, cartographer, dev banner)
- ESBuild for production bundling
- PostCSS with Autoprefixer for CSS processing

**Authentication:**
- No traditional authentication system
- Username stored in browser localStorage
- Trust-based system appropriate for child-focused educational tool

**Session Management:**
- Stateless backend design
- No server-side sessions or cookies
- Username passed with each API request