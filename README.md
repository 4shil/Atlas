# 🗺️ Atlas

<div align="center">

![Atlas Banner](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGJ6eHVkYm1ybjh1bDJ3aWJyejJucjFvaW50NmV3MG42Z3dwdHpuaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPsx2VAYAgEHC12/giphy.gif)

**Set goals. Pin them on the map. Actually follow through.**

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![NativeWind](https://img.shields.io/badge/NativeWind-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://nativewind.dev)

</div>

---

## What is Atlas?

Atlas is a personal goal tracker that goes beyond simple to-do lists. You attach your goals to real places on a map — a city you want to visit, a gym you want to join, a coffee shop where you want to write that book. It makes your goals feel *real* because they're tied to the world around you.

Think of it as your life roadmap — visual, location-aware, and actually satisfying to use.

---

## ✨ Features

- 🗺️ **Map View** — Pin your goals to locations anywhere in the world
- 🎯 **Goal Cards** — Rich cards with images, timelines, categories, and notes
- 📸 **Gallery** — See all your goals visually like a mood board
- 📦 **Archive** — Completed goals preserved, never deleted
- 🔔 **Notifications** — Gentle reminders so you don't forget what you're chasing
- 🎨 **Custom Theming** — Design tokens for colors, spacing, motion, and typography
- 💾 **Offline First** — Everything persisted locally via AsyncStorage
- 🌊 **Smooth Animations** — Powered by Reanimated + Skia

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Expo (SDK 53) + Expo Router |
| Language | TypeScript |
| Styling | NativeWind (Tailwind for RN) |
| State | Zustand + AsyncStorage persistence |
| Animations | React Native Reanimated + Skia |
| Maps | React Native Maps |
| Navigation | Expo Router (file-based) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or the [Expo Go](https://expo.dev/client) app

### Install

```bash
git clone https://github.com/4shil/Atlas.git
cd Atlas
npm install
```

### Run

```bash
# Start the dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run in browser
npm run web
```

---

## 📁 Project Structure

```
Atlas/
├── src/
│   ├── app/                  # Expo Router screens
│   │   ├── (tabs)/           # Bottom tab screens (Home, Map, Gallery, Archive)
│   │   ├── onboarding.tsx    # First-launch onboarding flow
│   │   ├── add-goal.tsx      # Goal creation screen
│   │   ├── goal-detail.tsx   # Goal detail & edit view
│   │   ├── inspiration.tsx   # Inspirational content feed
│   │   ├── profile.tsx       # User profile screen
│   │   └── settings.tsx      # App settings
│   ├── components/           # Reusable UI components
│   │   ├── GoalCard.tsx      # Main goal display card
│   │   ├── ProgressRing.tsx  # Animated circular progress
│   │   ├── SwipeableGoalRow  # Swipe-to-delete/complete row
│   │   ├── LocationPicker    # Native + web map picker
│   │   └── MapWrapper        # Platform-aware map wrapper
│   ├── store/                # Zustand state stores
│   │   ├── useGoalStore.ts   # All goal CRUD + selectors
│   │   ├── useProfileStore.ts
│   │   └── useSettingsStore.ts
│   ├── theme/                # Design system tokens
│   │   └── tokens/           # Colors, spacing, typography, motion
│   └── utils/                # Helpers & utilities
│       ├── dateUtils.ts
│       ├── constants.ts
│       └── notificationUtils # Platform-specific notifications
```

---

## 🗺️ App Flow

```
Launch
  └── Has onboarded?
        ├── Yes → Tabs (Home / Map / Gallery / Archive)
        └── No  → Onboarding → Tabs
```

---

## 🤝 Contributing

Got ideas? Open an issue or submit a PR — all contributions welcome.

1. Fork the repo
2. Create your branch (`git checkout -b feature/cool-thing`)
3. Commit your changes (`git commit -m 'Add cool thing'`)
4. Push and open a PR

---

## 📜 License

MIT — use it, build on it, make it yours.

---

<div align="center">
  Made with ☕ and too many late nights by <a href="https://github.com/4shil">4shil</a>
</div>
