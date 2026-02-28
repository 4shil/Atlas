# Atlas

A mobile bucket list app for tracking life goals tied to real places. Built with Expo and React Native.

---

## Overview

Atlas lets users create, organise, and track bucket list goals — each anchored to a location on an interactive map. Goals have target dates, categories, images, and reminder notifications. The app features a gallery view, archive, and live weather at the user's current location.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo 53 (SDK 53), React Native 0.79 |
| Navigation | Expo Router v5 (file-based) |
| Styling | NativeWind v4 (Tailwind CSS for RN) |
| State | Zustand + AsyncStorage persist |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Maps | react-native-maps |
| Graphics | @shopify/react-native-skia |
| Animations | react-native-reanimated v3 |
| Notifications | expo-notifications |
| Location | expo-location |
| Language | TypeScript (strict mode) |
| Tests | Jest + jest-expo + @testing-library/react-native |
| CI | GitHub Actions |
| Builds | EAS Build |

---

## Project Structure

```
src/
├── app/                    # Expo Router screens (file = route)
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── index.tsx       # Home / dashboard
│   │   ├── gallery.tsx     # All goals grid view
│   │   ├── map.tsx         # Interactive world map
│   │   └── archive.tsx     # Completed goals
│   ├── _layout.tsx         # Root layout + error boundary
│   ├── index.tsx           # Entry — auth/onboarding gate
│   ├── auth.tsx            # Sign in / Sign up / Forgot password
│   ├── onboarding.tsx      # First-run setup
│   ├── add-goal.tsx        # Create new goal
│   ├── goal-detail.tsx     # View / edit single goal
│   └── notifications.tsx   # Upcoming goal reminders
│
├── components/             # Shared UI components
│   ├── ErrorBoundary.tsx   # App-level crash fallback
│   ├── ScreenWrapper.tsx   # Theme-aware safe area wrapper
│   ├── MapWrapper.tsx      # Map abstraction (native/web)
│   ├── GoalCard.tsx        # Goal tile used in gallery
│   ├── ProfileHeader.tsx   # Top bar with avatar
│   └── ...
│
├── store/                  # Zustand state stores
│   ├── useAuthStore.ts     # Supabase auth session
│   ├── useGoalStore.ts     # Goals CRUD + selectors
│   ├── useProfileStore.ts  # User profile
│   └── useSettingsStore.ts # Dark mode, units, notifications
│
├── lib/
│   ├── supabase.ts         # Supabase client (singleton)
│   └── database.types.ts   # Generated DB types
│
├── theme/
│   ├── ThemeProvider.tsx   # Dark/light context
│   └── tokens/             # Semantic color tokens
│
└── utils/
    ├── dateUtils.ts         # getDaysUntil, formatDate
    ├── notificationUtils.ts # Schedule / cancel reminders
    └── Icons.ts             # Category to MaterialIcon map

supabase/
└── schema.sql              # Full DB schema + RLS policies

__tests__/
├── store/useGoalStore.test.ts
└── utils/dateUtils.test.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/4shil/Atlas.git
cd Atlas
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

1. Go to your Supabase project — SQL Editor
2. Paste the contents of `supabase/schema.sql`
3. Click Run

This creates:
- `profiles` table (auto-populated on signup via trigger)
- `goals` table with full location fields
- Row Level Security policies (users only see their own data)
- `goal-images` storage bucket (5MB limit, public read)

### Run Locally

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

---

## Features

| Feature | Status |
|---|---|
| Email auth (sign up / sign in / forgot password) | Done |
| Onboarding flow | Done |
| Create goal with title, date, category, location, image | Done |
| Interactive world map with goal pins | Done |
| Gallery view with filter | Done |
| Archive (completed goals) | Done |
| Push notification reminders (7d + 1d before) | Done |
| Live weather at current location | Done |
| Dark / light mode | Done |
| Goal detail + edit | Done |
| Notifications screen (overdue / upcoming / scheduled) | Done |
| Cloud sync via Supabase | In progress |
| Image upload to Supabase Storage | In progress |
| Offline-first sync | Planned |
| Social / share goals | Planned |

---

## Architecture

### Auth Flow

```
app launch
    |
    v
index.tsx
    +-- no session  --> /auth (sign in / sign up)
    +-- no onboard  --> /onboarding
    +-- ready       --> /(tabs)
```

### State Management

Each store is independent, persisted to AsyncStorage, and will sync to Supabase when credentials are present:

```
useAuthStore     -- session, user, sign in/out
useGoalStore     -- goals[], addGoal, updateGoal, deleteGoal, toggleComplete
useProfileStore  -- name, bio, avatar, hasOnboarded
useSettingsStore -- darkMode, units, notificationsEnabled
```

### Data Flow (Goals)

```
User action
    |
    v
useGoalStore (Zustand)
    +-- AsyncStorage (local persist -- always works offline)
    +-- Supabase goals table (cloud sync -- when authenticated)
```

### Row Level Security

All tables have RLS enabled. Every query is automatically scoped to the authenticated user — no user can read or modify another user's data, enforced at the database level.

---

## Database Schema

### profiles

| Column | Type | Notes |
|---|---|---|
| id | uuid | FK to auth.users |
| name | text | |
| bio | text | |
| avatar_url | text | Supabase Storage URL |
| has_onboarded | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | auto-updated via trigger |

### goals

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| title | text | |
| description | text | |
| image_url | text | Supabase Storage URL |
| category | text | Travel, Adventure, etc. |
| timeline_date | timestamptz | target date |
| completed | boolean | |
| completed_at | timestamptz | set when toggled complete |
| notes | text | |
| location_* | various | lat, lng, city, country, place_id |
| created_at / updated_at | timestamptz | |

---

## Testing

```bash
npm test                 # run all tests
npm run test:watch       # watch mode
npm run test:coverage    # coverage report
```

Tests live in `__tests__/`. Current coverage:
- `useGoalStore` — full CRUD, toggle, selectors
- `dateUtils` — getDaysUntil boundary cases

---

## Building for Production

### EAS Build

```bash
# Development build (with dev client)
eas build --profile development --platform ios

# Preview APK (Android internal testing)
eas build --profile preview --platform android

# Production
eas build --profile production --platform all
```

### EAS Submit

```bash
eas submit --platform ios
eas submit --platform android
```

---

## CI/CD

GitHub Actions runs on every push to `main` and every PR:

- TypeScript type check (`tsc --noEmit`)
- Full test suite with coverage report
- Fails fast on type errors or broken tests

---

## License

MIT
