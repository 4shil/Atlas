# Atlas — Production Roadmap

**Status:** MVP Complete → Production  
**Goal:** Ship a real app to App Store + Play Store  
**Stack:** Expo 53 · React Native 0.79 · Expo Router · Zustand · NativeWind · TypeScript

---

## Current State Summary

### What's Good

- Expo Router file-based routing — scalable, correct
- Zustand + AsyncStorage persist — solid state management
- Full design token system (colors, typography, spacing, motion, layout)
- ThemeProvider wired to SettingsStore — architecture correct
- Component structure clean (GoalCard, ScreenWrapper, ProfileHeader, SectionHeader)
- Platform-specific files (.native.tsx / .web.tsx)
- Haptics, animations (Reanimated), gesture handling
- Onboarding flow, profile, gallery, archive, map, settings — all screens exist

### What's Broken / Missing

- ThemeProvider correct but NativeWind `bg-black` hardcoded everywhere — dark/light mode visually broken
- Notification permission not checked before scheduling
- Gallery "Notifications" button → goes to Settings (mislabeled)
- Map "Currently In" shows goal[0] location, not user location
- Weather hardcoded static string
- Settings: unit system stored but never used anywhere
- No error boundaries — crash = white screen
- Zero tests
- No error monitoring (Sentry)
- No CI/CD
- `@shopify/react-native-skia v2.0.0-next.4` — pre-release, unstable
- `react-native-worklets-core` duplicated in deps + devDeps
- Local-only (AsyncStorage) — no backend, no sync, no auth

---

## Phases

---

### Phase 1 — Fix & Stabilize

**Goal:** Make the existing app solid before adding anything new  
**Duration:** ~1 week

#### 1.1 P0 Bug Fixes

- [ ] Add error boundary wrapping the root layout
- [ ] Fix dark mode — NativeWind needs `darkMode: 'class'` in tailwind config + pass `dark` class from ThemeProvider to root View
- [ ] Fix notification permission — check `Notifications.getPermissionsAsync()` before `scheduleGoalReminders`, prompt if not granted
- [ ] Fix Gallery header — rename "Notifications" button or create a notifications screen
- [ ] Fix dep duplication — move `react-native-worklets-core` out of devDeps
- [ ] Downgrade or pin Skia to stable (`@shopify/react-native-skia@^1.x`)

#### 1.2 P1 UX Fixes

- [ ] Map "Currently In" — use `expo-location` for real user location
- [ ] Map weather — integrate `wttr.in` (free, no API key) or remove
- [ ] Add goal — past date validation with user-visible error
- [ ] Add goal — image compression before save (quality 0.6, not 1.0)
- [ ] Settings — unit system: display distances in km or miles on Map/GoalDetail based on setting

#### 1.3 Code Quality

- [ ] Add Prettier config (`.prettierrc`)
- [ ] Strict TypeScript — set `strict: true` in tsconfig
- [ ] Remove all `as any` casts, fix types properly
- [ ] Clean up `handleNext = goNext` redundant alias in gallery.tsx
- [ ] Add input validation utility for title/text fields (trim + min length)

**Deliverable:** Stable, bug-free build with dark/light mode working

---

### Phase 2 — Infrastructure

**Goal:** Toolchain that supports a real team and real releases  
**Duration:** ~3 days

#### 2.1 Testing

- [ ] Install Jest + `@testing-library/react-native`
- [ ] Write tests for:
    - `useGoalStore` — addGoal, deleteGoal, toggleComplete, clearGoals
    - `useProfileStore` — updateProfile, setHasOnboarded
    - `useSettingsStore` — all setters
    - `dateUtils` — getDaysUntil edge cases
    - `GoalCard` render test
    - `AddGoal` form validation test

#### 2.2 Error Monitoring

- [ ] Install `@sentry/react-native` + `sentry-expo`
- [ ] Wrap root with Sentry
- [ ] Add `ErrorBoundary` component with fallback UI
- [ ] Configure source maps upload in EAS build

#### 2.3 CI/CD

- [ ] EAS Build setup (`eas.json` — development / preview / production profiles)
- [ ] EAS Update for OTA patches
- [ ] GitHub Actions workflow:
    - On PR: lint + type-check + tests
    - On merge to main: EAS preview build
    - On tag: EAS production build

#### 2.4 Analytics

- [ ] Install PostHog (`posthog-react-native`) — privacy-first, open source
- [ ] Track events: goal_created, goal_completed, goal_deleted, screen_view
- [ ] No PII in events

**Deliverable:** Automated pipeline, crash reporting, test coverage >60%

---

### Phase 3 — Backend & Auth

**Goal:** Goals saved to cloud, accessible on any device  
**Duration:** ~2 weeks

#### 3.1 Backend Choice: Supabase

Reasons: PostgreSQL, built-in auth, storage for images, real-time, generous free tier, works great with React Native

#### 3.2 Auth

- [ ] Supabase email + Google OAuth
- [ ] Auth screens: Sign In, Sign Up, Forgot Password
- [ ] Update `_layout.tsx` — auth gate before onboarding check
- [ ] Session persistence via Supabase client

#### 3.3 Data Migration

- [ ] Add `userId` field to Goal schema
- [ ] Goals table in Supabase (mirrors Goal interface + userId)
- [ ] Migrate `useGoalStore` — AsyncStorage becomes cache, Supabase is source of truth
- [ ] On first cloud login, offer to upload local goals

#### 3.4 Image Storage

- [ ] Goal images → Supabase Storage bucket
- [ ] Upload on goal creation, store URL not device URI
- [ ] Compress images before upload (quality: 0.7, max 1200px width)
- [ ] Profile avatar → Supabase Storage

#### 3.5 Offline Support

- [ ] Keep AsyncStorage as offline cache
- [ ] Sync on app foreground / network reconnect
- [ ] Optimistic updates — UI updates instantly, syncs in background
- [ ] Conflict resolution: last-write-wins with `updatedAt` timestamp

**Deliverable:** Cloud sync, multi-device, data never lost

---

### Phase 4 — Missing Features

**Goal:** Complete the features that exist but don't work  
**Duration:** ~2 weeks

#### 4.1 Notifications Center

- [ ] Create `/notifications` screen
- [ ] Wire Gallery header button to it (currently goes to Settings)
- [ ] List scheduled reminders (goal title, date, countdown)
- [ ] Allow per-goal notification toggle
- [ ] Push notification handler (tap → open GoalDetail)

#### 4.2 Light Theme (Design tokens already defined!)

- [ ] Add `dark` class support to NativeWind (`darkMode: 'class'` in tailwind.config.js)
- [ ] Replace all hardcoded `bg-black`, `text-white`, `border-white/10` with semantic classes:
    - `bg-background` → `bg-black` dark / `bg-white` light
    - `text-primary` → `text-white` dark / `text-black` light
    - etc.
- [ ] Update ScreenWrapper to pass theme class to root
- [ ] Test every screen in light mode

#### 4.3 Unit System

- [ ] Show distances in km or miles on Map and GoalDetail based on `useSettingsStore.unitSystem`
- [ ] Format dates based on locale

#### 4.4 Map Improvements

- [ ] Real user location via `expo-location` (show "You are here" pin)
- [ ] Live weather via `wttr.in?format=j1` API (free, no key needed)
- [ ] Goal clustering for dense maps
- [ ] Filter pills actually filter map pins (currently only filters list)

#### 4.5 Social Sharing

- [ ] Share goal as image card (use `react-native-view-shot` to capture GoalCard)
- [ ] Share to Instagram Stories, WhatsApp, etc.
- [ ] Public profile URL (after backend): `atlas.app/u/username`

**Deliverable:** All features complete and working, light + dark theme

---

### Phase 5 — Polish & Ship

**Goal:** App Store + Play Store submission  
**Duration:** ~1 week

#### 5.1 App Assets

- [ ] App icon (1024x1024 + all sizes via EAS)
- [ ] Splash screen (branded, smooth fade to app)
- [ ] App Store screenshots (6.7" iPhone + iPad + Android)
- [ ] App Store description + keywords

#### 5.2 Performance

- [ ] Lazy load tab screens (already done via Expo Router but verify)
- [ ] Memoize GoalCard with `React.memo`
- [ ] `useMemo` for filtered goal lists in Archive
- [ ] Image lazy loading with blur placeholder in GoalCard
- [ ] Profile `topCategories` computed value memoized

#### 5.3 Accessibility

- [ ] All touchables have `accessibilityLabel`
- [ ] Minimum touch target 44x44pt (audit all icon buttons)
- [ ] Color contrast audit (WCAG AA minimum)
- [ ] Screen reader order correct on all screens

#### 5.4 App Store Submission

- [ ] Privacy policy page live (atlas.example.com/privacy → real URL)
- [ ] Terms of service page live
- [ ] App Review notes prepared
- [ ] iOS: `NSLocationWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription`, `NSCameraUsageDescription` in Info.plist
- [ ] Android: permissions in AndroidManifest.xml
- [ ] EAS production build → TestFlight (iOS) + Internal Testing (Android)
- [ ] Final QA pass on real devices

**Deliverable:** App live on App Store and Play Store

---

## Task Tracker

| Phase | Task                          | Status                                        |
| ----- | ----------------------------- | --------------------------------------------- |
| 1     | Error boundary                | ✅ Done                                       |
| 1     | Dark mode NativeWind fix      | ✅ Done                                       |
| 1     | Notification permission guard | ✅ Done (inside scheduleGoalReminders)        |
| 1     | Gallery notification btn fix  | ✅ Done → /notifications screen created       |
| 1     | Dep duplication fix           | ⬜ Todo                                       |
| 1     | Skia pin to stable            | ⬜ Todo                                       |
| 1     | Map real user location        | ✅ Done                                       |
| 1     | Map live weather              | ✅ Done (wttr.in)                             |
| 1     | Past date validation          | ✅ Done                                       |
| 1     | Image compression             | ✅ Done (quality 0.6)                         |
| 1     | Unit system in UI             | ✅ Done (Phase 4)                             |
| 1     | Prettier + strict TS          | ✅ Done                                       |
| 2     | Jest + RTL setup              | ✅ Done                                       |
| 2     | Store unit tests              | ✅ Done (useGoalStore + dateUtils)            |
| 2     | Sentry integration            | ✅ Done (needs EAS account)                   |
| 2     | EAS setup                     | ✅ Done (eas.json)                            |
| 2     | GitHub Actions CI             | ✅ Done                                       |
| 2     | PostHog analytics             | ⬜ Todo (needs account)                       |
| 3     | Supabase project setup        | ✅ Done (client + types + .env.example)       |
| 3     | Auth screens                  | ✅ Done (sign in / sign up / forgot password) |
| 3     | Goals → Supabase              | ✅ Done                                       |
| 3     | Image → Supabase Storage      | ✅ Done                                       |
| 3     | Offline sync                  | ✅ Done (AsyncStorage)                        |
| 4     | Notifications screen          | ⬜ Todo                                       |
| 4     | Light theme                   | ✅ Done                                       |
| 4     | Unit system UI                | ✅ Done                                       |
| 4     | Map improvements              | ⬜ Todo                                       |
| 4     | Social sharing                | ⬜ Todo                                       |
| 5     | App assets                    | ⬜ Todo                                       |
| 5     | Performance audit             | ⬜ Todo                                       |
| 5     | Accessibility audit           | ⬜ Todo                                       |
| 5     | App Store submission          | ⬜ Todo                                       |

---

## File Reference

```
~/Coding/Atlas/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── archive.tsx       ✅ Working
│   │   │   ├── gallery.tsx       ⚠️ Notification btn mislabeled
│   │   │   ├── map.tsx           ⚠️ Fake location, fake weather
│   │   │   └── _layout.tsx
│   │   ├── _layout.tsx           ⚠️ No error boundary
│   │   ├── add-goal.tsx          ⚠️ No permission check, no date validation
│   │   ├── goal-detail.tsx       ✅ Working well
│   │   ├── index.tsx             ✅ Onboarding gate correct
│   │   ├── onboarding.tsx        ✅ Working
│   │   ├── profile.tsx           ✅ Working
│   │   └── settings.tsx          ⚠️ Dark mode dead, unit system unused
│   ├── components/               ✅ Clean
│   ├── store/
│   │   ├── useGoalStore.ts       ✅ Solid — needs userId for backend
│   │   ├── useProfileStore.ts    ✅ Working
│   │   └── useSettingsStore.ts   ⚠️ Settings saved but not all used
│   ├── theme/
│   │   ├── ThemeProvider.tsx     ✅ Correct architecture — NativeWind not consuming it
│   │   └── tokens/               ✅ Full design system defined
│   └── utils/                    ✅ Clean utilities
├── ATLAS_ROADMAP.md              ← This file
└── package.json                  ⚠️ Skia pre-release, worklets duplicate
```

---

## Notes

- Backend: Supabase preferred (auth + DB + storage in one, free tier generous)
- Analytics: PostHog (open source, privacy-first, self-hostable)
- Error monitoring: Sentry (industry standard, Expo integration easy)
- Builds: EAS (Expo's official build service, handles iOS certs automatically)
- The design system is the biggest hidden asset — tokens are professional quality. Once NativeWind consumes them, light/dark/high-contrast all come for free.

---

## Completed in Sprint (March 2026)

- [x] Expandable map panel with drag handle and swipe gesture (Reanimated + GestureDetector)
- [x] Full-screen map mode with floating collapse button overlay
- [x] Map location search bar with fly-to animation (Nominatim/OSM)
- [x] Nearby attractions fetch from Overpass API — no API key required
- [x] Attraction pins with category icons (cafe, park, landmark, museum, hotel)
- [x] Attraction detail bottom sheet on pin tap with show-on-map action
- [x] Compass/recenter button and map style toggle (Standard / Satellite)
- [x] Light mode: darkMode class NativeWind config + expanded settings store
- [x] Light mode: semantic theme classes on home, gallery, archive screens
- [x] Light mode: semantic theme classes on map screen bottom sheet
- [x] Light mode: semantic theme classes on profile screen
- [x] Light mode: semantic classes on settings, add-goal, notifications screens
- [x] Theme toggle: Dark / Light / System in settings (3-way segmented control)
- [x] Settings: map default style preference persisted to store
- [x] Settings: default goal category picker + show completed goals on map toggle
- [x] Settings: notification sound toggle
- [x] Settings: about section (version, GitHub, privacy policy, terms links)
- [x] Settings: export goals as JSON via expo-sharing + expo-file-system
- [x] Settings: clear all data with two-step confirmation dialog
- [x] add-goal: crash bug fixes, null safety, correct goal ID for image uploads
- [x] TypeScript: npx tsc --noEmit passes clean (0 errors)
- [x] ESLint: npx eslint src/ --ext .ts,.tsx --fix passes (0 errors, 58 warnings)

### Final Test Pass (Commit 23)

- `npx tsc --noEmit` → Exit 0 ✅
- `npx eslint src/ --ext .ts,.tsx` → 0 errors, 58 warnings (style-only) ✅
- All key imports verified (expo-image, expo-sharing, expo-file-system, react-native-reanimated, gesture-handler)
- New files: `src/hooks/useNearbyAttractions.ts`, `src/components/MapWrapper.d.ts` updated
- Store: `useSettingsStore` expanded with themeMode, mapStylePref, defaultCategory, showCompletedOnMap, notificationSound

---

## v2 Features (Added March 2026)

**Status:** v2 Complete ✅

### Feature 1 — Global Search

- [x] Full-text search across goal title, description, notes, location
- [x] Category chips + completed/pending toggle filters
- [x] Highlight matched text in results
- [x] Search history (last 10) stored in AsyncStorage with clear button
- [x] Empty state illustrations
- [x] Search icon in gallery header

### Feature 2 — Goal Statistics Dashboard

- [x] Stats screen: total, completed, pending, completion rate
- [x] Monthly creation/completion bar chart (6-month view)
- [x] Category distribution breakdown with percentage bars
- [x] Streak tracker: current streak + longest streak ever
- [x] Goals this month + avg days to complete
- [x] World progress: unique countries, cities, % of 195 countries
- [x] Motivational milestone messages
- [x] Accessible from profile header (bar-chart icon)

### Feature 3 — Goal Share Card

- [x] Share button in goal-detail header → opens share modal
- [x] react-native-view-shot captures ShareCard as PNG
- [x] expo-sharing to WhatsApp, Instagram, etc.
- [x] "Copy Link" option for atlas://goal/{id} deep link
- [x] ShareCard component: branded dark card with goal image, title, location, status, watermark

### Feature 4 — Onboarding Redesign

- [x] 3 animated slides (Track Dreams / Pin on Map / Never Give Up)
- [x] Animated progress dots (expand + color on active)
- [x] Skip button
- [x] Feature highlights per slide with icon rows
- [x] Profile setup step: name input + avatar picker
- [x] Smooth transition to main app; pre-fills useProfileStore

### Feature 5 — Goal Detail Enhancements

- [x] Progress Photos section: add multiple photos over time
- [x] Horizontal scrollable photo strip with tap-to-fullscreen
- [x] Related Goals suggestions (same category or country)
- [x] Horizontal scroll "Similar Goals" with navigation

### Feature 6 — Notifications Redesign

- [x] Goals grouped by: Overdue / Today / This Week / Earlier
- [x] Per-notification unread dot indicator
- [x] Mark all read button
- [x] Smart notification scheduling: daily (1d), every 2d (≤7d), weekly (≤30d), special for overdue
- [x] Reschedule logic runs on app foreground (AppState listener)
- [x] Permission prompt banner
- [x] Unread count badge in header

### Feature 7 — Archive Timeline

- [x] Goals grouped by Year → Month with collapsible sections
- [x] Timeline line + dot visual on left side
- [x] Count badge per month section
- [x] Tap 🎉 on any goal → confetti celebration replay
- [x] "Completed X days ago" relative timestamps
- [x] "You've completed N goals this year" banner at top

### Feature 8 — Performance & UX Polish

- [x] GoalCardSkeleton with Reanimated shimmer (3 skeletons on initial load)
- [x] GoalCard upgraded to expo-image with blurhash placeholder + fade-in transition
- [x] Pull-to-refresh wired in gallery screen
- [x] GoalCard accessibility: accessibilityLabel, accessibilityRole on images
- [x] Search screen: full accessibilityLabel + accessibilityRole on all interactive elements
- [x] Stats, archive, notifications: accessibilityLabel on all buttons
- [x] TypeScript: progressPhotos field added to Goal type
- [x] ESLint clean pass (react/no-unescaped-entities fixes)
- [x] Roadmap updated with v2 features

### Next Steps (v3 Ideas)

- Cloud sync for progress photos (Supabase Storage)
- Social features: follow friends, shared goal boards
- AI goal suggestions based on location/history
- Widget support (Expo Widgets)
- Apple Watch / WearOS companion
- Goal templates marketplace
