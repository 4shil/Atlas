# Atlas — Complete Production To-Do List

> **Project:** Atlas — Cinematic Bucket List & Life Timeline App  
> **Platform:** Expo React Native (iOS + Android)  
> **Version:** 1.0  
> **Generated:** February 9, 2026

---

## 🚧 Rebuild Plan (v2 — Feb 15, 2026)

This replaces ad-hoc implementation with a strict PRD + Design System driven rebuild.

### Phase A — Foundation Reset (In Progress)
- [x] Rebuild roadmap and governance checkpoints
- [x] Harden goal persistence with date-safe serialization
- [x] Remove remaining hardcoded UI values from core navigation + goal flows
- [x] Normalize all screen primitives to semantic tokens only
- [ ] Add lightweight seed fixtures for deterministic UI development

### Phase B — App Shell + Navigation
- [x] Tab shell visual refresh (tokenized cinematic bar)
- [x] Root navigation transitions mapped to motion tokens
- [x] Header/FAB consistency across all screens
- [ ] Route-level loading and empty-state conventions

### Phase C — Goal Lifecycle (MVP)
- [ ] Rebuild create/edit/detail screens around a single form model
- [ ] Add explicit goal status flow (`wishlist` / `planned` / `completed`)
- [ ] Validation + error handling for required fields
- [ ] Reflection notes + completion transition behavior

### Phase D — Experiences Surfaces
- [ ] Gallery: immersive vertical carousel + parallax rhythm
- [ ] Map: pin system with tokenized status states + interaction polish
- [ ] Timeline: year-grouped story flow + visual continuity
- [ ] Archive: completed vault with date grouping

### Phase E — Quality, Accessibility, Performance
- [ ] Reduced motion plumbing to all animated surfaces
- [ ] WCAG contrast + touch target audit (44px+)
- [ ] Render performance pass for carousel, maps, and lists
- [ ] Stabilization tests and release checklist

### Phase F — Post-MVP Extension Hooks
- [ ] Cloud sync boundaries and migration readiness
- [ ] Share/export hooks
- [ ] AI/analytics extension points

---

## 📋 Document Analysis Summary

### PRD Key Insights
| Aspect | Detail |
|--------|--------|
| **Vision** | "Turn life into a gallery you can scroll" |
| **Core Concept** | Cinematic bucket list with geographic + chronological visualization |
| **Target Audience** | Age 16-35, travelers, creatives, aesthetic-driven users |
| **Primary Platform** | Expo React Native |
| **Architecture** | Offline-first, local storage, optional cloud sync |

### Design System Key Insights
| Aspect | Detail |
|--------|--------|
| **Philosophy** | Cinematic Minimalism + Adaptive Tokens |
| **Architecture** | Raw Tokens → Semantic Tokens → Components → Screens |
| **Grid System** | 8-point spacing grid |
| **Motion Style** | Spring animations, parallax, cinematic transitions |
| **Accessibility** | WCAG AA, reduced motion, 44px touch targets |

---

## 🏗️ Phase 1: Core Foundation

### 1.1 Project Setup
- [ ] Initialize Expo React Native project
- [ ] Configure TypeScript
- [ ] Install core dependencies:
  - [ ] `react-native-reanimated`
  - [ ] `react-native-gesture-handler`
  - [ ] `reanimated-carousel`
  - [ ] `react-native-maps`
  - [ ] `expo-image`
  - [ ] `expo-blur`
  - [ ] `react-navigation`
  - [ ] `zustand`
- [ ] Configure navigation structure
- [ ] Setup AsyncStorage for local persistence

### 1.2 Design System Implementation

#### 1.2.1 Token System
- [ ] Create `/src/theme/tokens/` directory structure
- [ ] **Color Tokens**
  - [ ] Raw color tokens (`color.black`, `color.white`, `color.gray.*`, etc.)
  - [ ] Semantic color tokens (`color.background.primary`, `color.text.primary`, etc.)
  - [ ] Status colors (`completed`, `planned`, `wishlist`)
- [ ] **Typography Tokens**
  - [ ] Font family definitions (editorial grotesk style)
  - [ ] Type scale (Hero: 72, Display: 48, Heading: 32/24, Body: 16/14, Caption: 12)
  - [ ] Semantic typography (`text.hero`, `text.sectionTitle`, `text.body`, etc.)
- [ ] **Spacing Tokens**
  - [ ] 8-point grid system (`space.1` through `space.6`)
  - [ ] Semantic spacing (component padding, screen margins, card gaps)
- [ ] **Radius Tokens**
  - [ ] Small: 8, Medium: 16, Large: 24, Hero: 32
- [ ] **Elevation Tokens**
  - [ ] `elevation.none`, `elevation.card`, `elevation.overlay`, `elevation.modal`
- [ ] **Motion Tokens**
  - [ ] Duration tokens (fast: 150ms, medium: 300ms, slow: 600ms, cinematic: 1200ms)
  - [ ] Easing tokens (standard ease, soft spring, heavy spring, cinematic glide)

#### 1.2.2 Theme Provider
- [ ] Create ThemeProvider component
- [ ] Implement Dark theme (default cinematic)
- [ ] Implement Light theme (editorial variant)
- [ ] Implement High contrast accessibility theme
- [ ] Create `useTheme` hook

### 1.3 Data Layer

#### 1.3.1 Data Model
- [ ] Define Goal interface:
  ```typescript
  interface Goal {
    id: string
    title: string
    description: string
    image: string // URI
    category: string
    createdAt: Date
    timelineDate: Date
    completed: boolean
    completedAt: Date | null
    notes: string
    location: {
      latitude: number
      longitude: number
      city: string
      country: string
      placeId: string
    }
  }
  ```

#### 1.3.2 State Management (Zustand)
- [ ] Create goals store
- [ ] Implement CRUD operations:
  - [ ] `createGoal()`
  - [ ] `updateGoal()`
  - [ ] `deleteGoal()`
  - [ ] `markComplete()`
- [ ] Implement selectors:
  - [ ] `getGoalsByCategory()`
  - [ ] `getGoalsByTimeline()`
  - [ ] `getCompletedGoals()`
  - [ ] `getGoalsByLocation()`

#### 1.3.3 Persistence Layer
- [ ] AsyncStorage integration
- [ ] Auto-persist middleware for Zustand
- [ ] Data migration utilities

### 1.4 Core Components

#### 1.4.1 Base Components
- [ ] **GoalCard** — Editorial card with image, title, location badge
- [ ] **ImageHero** — Full-bleed image with overlay support
- [ ] **BlurOverlay** — Frosted glass effect component
- [ ] **FloatingActionButton** — Primary action trigger
- [ ] **ModalSheet** — Bottom sheet with spring animation
- [ ] **HeaderOverlay** — Transparent header with blur

#### 1.4.2 Goal Management UI
- [ ] Goal creation form
- [ ] Goal editing form
- [ ] Image picker integration
- [ ] Category selector
- [ ] Date/timeline picker
- [ ] Location search input

---

## 🎨 Phase 2: Gallery & Visualization

### 2.1 Gallery Mode (Core Experience)
- [ ] **Carousel Implementation**
  - [ ] Fullscreen card carousel using `reanimated-carousel`
  - [ ] Vertical swipe navigation
  - [ ] Parallax depth motion effect
  - [ ] Immersive image display (edge-to-edge)
- [ ] **Card Design**
  - [ ] Oversized typography overlay
  - [ ] Location badge
  - [ ] Subtle gradient for text legibility
  - [ ] Minimal UI chrome
- [ ] **Transitions**
  - [ ] Spring-based entrance animations
  - [ ] Opacity fades between cards
  - [ ] 60 FPS performance target

### 2.2 Map Mode
- [ ] **Map Integration**
  - [ ] React Native Maps setup
  - [ ] Custom map styling (dark cinematic theme)
  - [ ] Interactive world map view
- [ ] **Pin System**
  - [ ] Custom `MapPin` component
  - [ ] Color-coded goal states:
    - [ ] Planned (accent color)
    - [ ] Completed (green)
    - [ ] Wishlist (purple)
  - [ ] Pin clustering for dense areas
- [ ] **Interactions**
  - [ ] Camera fly animations to pins
  - [ ] Pin tap → Goal detail preview
  - [ ] Category filtering overlay
- [ ] **Location Selection**
  - [ ] Search autocomplete
  - [ ] Tap-to-place pin
  - [ ] Reverse geocoding for city/country

### 2.3 Timeline Mode
- [ ] **TimelineItem** component
- [ ] Chronological vertical scroll
- [ ] Year grouping with sticky headers
- [ ] Scroll-to-map synchronization
- [ ] Visual connection lines between items
- [ ] Animated journey playback feature

---

## 📦 Phase 3: Memory & Archive Layer

### 3.1 Archive Mode
- [ ] **ArchiveGridItem** component
- [ ] Completed goal vault screen
- [ ] Memory grid layout (masonry or uniform)
- [ ] Date grouping (by year/month)
- [ ] Reflection note editing
- [ ] Search within archive

### 3.2 Completion Flow
- [ ] Mark goal as complete interaction
- [ ] Completion celebration animation
- [ ] Prompt for reflection notes
- [ ] Before/after photo comparison (optional)
- [ ] Automatic archive placement

### 3.3 Statistics & Insights
- [ ] Goals created count
- [ ] Completion rate percentage
- [ ] Countries/cities visited
- [ ] Timeline distribution chart
- [ ] Category breakdown

---

## ✨ Phase 4: Polish & Performance

### 4.1 Animation Refinement
- [ ] All transitions use motion tokens
- [ ] Reduced motion mode support
- [ ] Parallax layering consistency
- [ ] Gesture response < 16ms
- [ ] Navigation transitions < 200ms

### 4.2 Performance Optimization
- [ ] Memoized components (`React.memo`)
- [ ] Lazy image loading with `expo-image`
- [ ] Map pin clustering optimization
- [ ] Throttled scroll animations
- [ ] Native thread animation execution (Reanimated worklets)
- [ ] Minimized React re-renders (profiler audit)

### 4.3 Accessibility Compliance
- [ ] WCAG AA contrast ratios verified
- [ ] Scalable typography (system font scaling)
- [ ] Reduced motion option in settings
- [ ] Gesture alternatives (buttons for swipes)
- [ ] Color-blind safe status indicators
- [ ] Minimum 44px touch targets
- [ ] Screen reader labels

### 4.4 Error Handling & Edge Cases
- [ ] Empty states for all screens
- [ ] Error boundaries
- [ ] Offline mode indicators
- [ ] Loading skeletons
- [ ] Form validation feedback

---

## 🚀 Phase 5: Post-MVP Features (Future)

### 5.1 Cloud Sync
- [ ] Supabase integration
- [ ] User authentication
- [ ] Data synchronization
- [ ] Conflict resolution
- [ ] Encrypted backup option

### 5.2 AI Features
- [ ] Goal suggestions based on interests
- [ ] Smart categorization
- [ ] Location recommendations
- [ ] Experience completeness scoring

### 5.3 Social & Sharing
- [ ] Memory sharing (export as image/video)
- [ ] Shareable goal cards
- [ ] Public profile option

### 5.4 Advanced Visualizations
- [ ] Yearly recap video generation
- [ ] Heatmap of visited locations
- [ ] Replay life journey animation
- [ ] Travel analytics dashboard

### 5.5 Engagement Features
- [ ] Reminder system for upcoming goals
- [ ] Anniversary notifications
- [ ] Seasonal goal prompts

---

## 📁 Project Structure Reference

```
/src
  /app          → App entry, providers, navigation
  /screens      → Screen-level components
  /components   → Reusable UI components
  /features     → Feature modules (goals, map, timeline, archive)
  /hooks        → Custom React hooks
  /utils        → Utility functions
  /theme        → Design tokens, theme provider
  /assets       → Images, fonts, static resources
```

---

## 🎯 Success Criteria

### Technical Metrics
| Metric | Target |
|--------|--------|
| Animation FPS | 60 FPS constant |
| Navigation transitions | < 200ms |
| First meaningful paint | < 2 seconds |
| Memory footprint | Minimal, no leaks |
| Offline capability | Full CRUD offline |

### UX Metrics
| Metric | Target |
|--------|--------|
| Goals created per user | Track baseline |
| 7-day retention | Measure & improve |
| Archive revisit frequency | Encourage reflection |
| Timeline engagement duration | > 30 seconds |

### Emotional Quality
The app must feel:
- ✅ Cinematic
- ✅ Calm
- ✅ Premium
- ✅ Reflective
- ✅ Intentional
- ✅ Emotionally meaningful

> *"Atlas is complete when it feels like a memory, not a tool."*

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Animation performance overhead | Native thread execution, throttling |
| Map API cost scaling | Pin clustering, lazy loading |
| Scope creep | Strict MVP feature boundary |
| Storage growth | Data cleanup utilities, image compression |
| UI complexity | Component-based design system |

---

## 📅 Development Phases Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Core Foundation                                       │
│  ├── Project Setup                                              │
│  ├── Design System                                              │
│  ├── Data Layer                                                 │
│  └── Core Components                                            │
├─────────────────────────────────────────────────────────────────┤
│  Phase 2: Gallery & Visualization                               │
│  ├── Gallery Mode (Carousel)                                    │
│  ├── Map Mode                                                   │
│  └── Timeline Mode                                              │
├─────────────────────────────────────────────────────────────────┤
│  Phase 3: Memory & Archive Layer                                │
│  ├── Archive Mode                                               │
│  ├── Completion Flow                                            │
│  └── Statistics & Insights                                      │
├─────────────────────────────────────────────────────────────────┤
│  Phase 4: Polish & Performance                                  │
│  ├── Animation Refinement                                       │
│  ├── Performance Optimization                                   │
│  ├── Accessibility Compliance                                   │
│  └── Error Handling                                             │
├─────────────────────────────────────────────────────────────────┤
│  Phase 5: Post-MVP (Future)                                     │
│  ├── Cloud Sync                                                 │
│  ├── AI Features                                                │
│  ├── Social & Sharing                                           │
│  └── Advanced Visualizations                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

*Last updated: February 9, 2026*
