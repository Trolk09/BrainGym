# Brain Gym - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based with Gamification Focus

**Key References:** Duolingo (gamification & learning), GoNoodle (movement-based activities for kids), Khan Academy Kids (child-friendly educational interface)

**Design Principles:**
- Child-first interface: Large, clear elements with obvious interaction patterns
- Playful without chaos: Fun aesthetics that don't overwhelm or distract
- Immediate positive reinforcement: Visual celebration of achievements
- Clarity over complexity: Every screen has one primary purpose
- Safety and encouragement: No negative feedback, only constructive guidance

---

## Typography System

**Primary Font:** Quicksand (Google Fonts) - Rounded, friendly, highly legible for children
**Secondary Font:** Inter (Google Fonts) - Clean readability for secondary text

**Type Scale:**
- **Hero/Exercise Titles:** text-5xl to text-6xl, font-bold
- **Instructions/Primary Content:** text-2xl to text-3xl, font-semibold
- **Secondary Information:** text-lg to text-xl, font-medium
- **UI Labels/Buttons:** text-base to text-lg, font-semibold
- **Small Details:** text-sm, font-medium

**Readability:** All instructional text uses generous line-height (leading-relaxed) for easy scanning

---

## Layout & Spacing System

**Core Spacing Units:** Tailwind units of 4, 6, 8, 12, and 16 for consistency

**Container Strategy:**
- Full viewport layouts for immersive camera/exercise views
- Max-w-7xl containers for content-heavy screens (leaderboard, exercise selection)
- Comfortable padding: px-6 md:px-12 for mobile and desktop

**Grid Systems:**
- Exercise Selection: grid-cols-2 lg:grid-cols-3 gap-6
- Leaderboard: Single column for clarity
- Camera + Instructions: Split layout (60/40 camera/instructions on desktop, stacked on mobile)

**Vertical Rhythm:**
- Section spacing: space-y-8 to space-y-12
- Component spacing: space-y-4 to space-y-6
- Button groups: gap-4

---

## Core Layout Structures

### 1. Exercise Selection Screen
**Layout:** Grid-based card selection with clear visual hierarchy
- **Header Section:** App logo/title, total points display, leaderboard button (h-20, flex justify-between)
- **Exercise Grid:** 2x3 grid (mobile: 2 columns, desktop: 3 columns)
- **Card Structure:** Aspect-ratio square cards with large icons, exercise name, brief description
- **Touch Targets:** Minimum h-32 for all interactive cards

### 2. Active Exercise Screen
**Layout:** Split-screen immersive experience
- **Camera Feed:** Large viewport (w-full lg:w-3/5) with rounded-2xl overflow-hidden
- **Instruction Panel:** Sidebar (lg:w-2/5) with scrollable content
  - Exercise name and icon at top
  - Step-by-step instructions with large text
  - Real-time feedback indicator (h-24, prominent)
  - Points earned display
  - Exit button (top-right, absolute positioning)
- **Feedback Overlay:** Centered on camera feed when validating (absolute positioning, backdrop-blur)

### 3. Leaderboard Screen
**Layout:** Centered list with emphasis on top performers
- **Header:** "Top Brain Gym Champions" title with back button
- **Top 3 Podium:** Special treatment with larger cards (h-40 to h-48) and visual distinction
- **Remaining Entries:** Uniform list items (h-20) with rank, username, points
- **User Highlight:** Current user's entry always visible with visual indicator
- **Container:** max-w-2xl for optimal readability

### 4. Results/Celebration Screen
**Layout:** Centered celebration with clear next action
- **Success Animation Area:** h-64, flex items-center justify-center
- **Points Earned:** text-6xl, font-bold, centered
- **Encouraging Message:** text-2xl, centered
- **Action Buttons:** Stacked vertically (space-y-4), max-w-xs mx-auto

---

## Component Library

### Navigation & Headers
- **Top App Bar:** Fixed or sticky, h-20, flex justify-between items-center
- **Back Buttons:** Large touch target (h-12 w-12), icon-only or with label
- **Progress Indicators:** Linear progress bars (h-2) or circular counters

### Exercise Cards
- **Structure:** Rounded-2xl, p-6, flex flex-col items-center
- **Icon Container:** h-24 w-24, rounded-full, flex items-center justify-center
- **Title:** text-xl font-bold, mt-4
- **Description:** text-sm, text-center, mt-2, line-clamp-2

### Camera Interface
- **Video Element:** Aspect-video, rounded-2xl, object-cover
- **Overlay Elements:** Absolute positioning with backdrop-blur-sm
- **Corner Controls:** Positioned with top-4 right-4 / bottom-4 left-4

### Feedback Indicators
- **Success State:** Large checkmark icon (h-16 w-16), "Great job!" text
- **Guidance State:** Directional arrows or helper text, animated
- **Loading State:** Spinner (h-8 w-8) with "Checking..." text

### Buttons
- **Primary Actions:** Rounded-full, px-8 py-4, text-lg font-semibold, shadow-lg
- **Secondary Actions:** Rounded-full, px-6 py-3, text-base font-medium
- **Icon Buttons:** h-12 w-12, rounded-full, flex items-center justify-center

### Points & Scores
- **Point Badges:** Inline-flex items-center, rounded-full, px-4 py-2, text-lg font-bold
- **Leaderboard Entries:** flex justify-between items-center, p-4, rounded-lg
- **Rank Indicators:** h-10 w-10, rounded-full, flex items-center justify-center, text-lg font-bold

### Instructional Elements
- **Step Lists:** Numbered or bulleted, space-y-4, text-lg
- **Highlight Boxes:** Rounded-xl, p-4, border-l-4
- **Tip Cards:** Rounded-lg, p-3, flex items-start gap-3

---

## Interaction Patterns

**Touch Optimization:**
- All interactive elements minimum 48x48px (h-12 w-12 in Tailwind)
- Generous spacing between tappable elements (gap-4 minimum)
- No hover states needed - focus on active/pressed states

**Feedback Timing:**
- Instant visual response to taps (<100ms)
- Success celebrations: 2-3 second duration
- Loading states visible after 300ms delay

**Navigation:**
- Always provide clear "back" or "exit" options
- Confirm before leaving active exercise
- Breadcrumb or visual indication of current location

---

## Icons & Visual Assets

**Icon Library:** Heroicons (outline style for most UI, solid style for filled states)

**Required Icons:**
- Navigation: arrow-left, x-mark, bars-3
- Exercises: Custom illustrations/animations (placeholder comments for each exercise)
- Feedback: check-circle, trophy, star, fire
- UI: camera, users, chart-bar, question-mark-circle

**Exercise Illustrations:** Each exercise needs a playful, animated character demonstrating the movement (use placeholder comments: `<!-- CUSTOM ILLUSTRATION: Child doing Cross Crawl exercise -->`)

---

## Accessibility & Child-Friendly Features

- High contrast between text and backgrounds throughout
- Large, legible typography (minimum 16px base, 18px for instructions)
- Clear visual hierarchies with size and weight variations
- No time pressure - children work at their own pace
- Positive reinforcement only - no red "error" states, use gentle guidance
- Consistent placement of primary actions (bottom-right or center-bottom)

---

## Animations & Motion

**Use Sparingly - Only When Meaningful:**
- **Success Celebrations:** Confetti or sparkle effects (1-2 seconds)
- **Point Gains:** Number count-up animation (500ms)
- **Exercise Detection:** Gentle pulse on feedback indicator
- **Transitions:** Smooth page transitions (300ms ease-in-out)

**Avoid:** Constant movement, distracting loops, or gratuitous effects that detract from core experience

---

## Images

**Hero/Welcome Screen (Optional Start Screen):**
- Large hero image showing diverse children happily doing brain gym exercises
- Placement: Full-width hero section (h-96) with overlay for "Start Your Brain Gym Journey" title
- Button over image: Blurred background (backdrop-blur-md), no hover states

**Exercise Card Thumbnails:**
- Each exercise card shows a simple, colorful illustration of the movement
- Size: h-32 within card, centered
- Style: Friendly, cartoon-style illustrations with diverse representation

**Celebration/Achievement Images:**
- Trophy or medal illustrations for milestone achievements
- Placement: Center of results screen (h-40)