# Atlas

A goal tracking mobile app built with Expo and React Native. Set goals, attach them to real locations on a map, track progress, and archive completed ones.

![demo](https://media.giphy.com/media/3oKIPsx2VAYAgEHC12/giphy.gif)

---

## What it does

Atlas lets you set personal goals and pin them to places on a map — a city you want to visit, a gym you want to join, anywhere that makes the goal feel real. Goals live as rich cards with images, timelines, categories, and notes. Completed goals go to an archive, not the trash.

---

## Stack

- Expo SDK 53 + Expo Router (file-based navigation)
- React Native 0.79 + TypeScript
- NativeWind (Tailwind for React Native)
- Zustand + AsyncStorage (offline-first state)
- React Native Reanimated + Skia (animations)
- React Native Maps (location pinning)
- Expo Notifications

---

## Getting started

```bash
git clone https://github.com/4shil/Atlas.git
cd Atlas
npm install
npm start
```

Scan the QR with [Expo Go](https://expo.dev/client) or run on a simulator:

```bash
npm run ios
npm run android
```

---

## Project structure

```
src/
  app/                  # Expo Router screens
    (tabs)/             # Home, Map, Gallery, Archive tabs
    onboarding.tsx
    add-goal.tsx
    goal-detail.tsx
    inspiration.tsx
    profile.tsx
    settings.tsx
  components/
    GoalCard.tsx
    ProgressRing.tsx
    SwipeableGoalRow.tsx
    LocationPicker.*     # Platform-split (native/web)
    MapWrapper.*         # Platform-split (native/web)
  store/
    useGoalStore.ts      # Goal CRUD + selectors
    useProfileStore.ts
    useSettingsStore.ts
  theme/
    tokens/              # Colors, spacing, typography, motion
  utils/
    dateUtils.ts
    notificationUtils.*  # Platform-split notifications
    constants.ts
```

---

## App flow

```
Launch
  Has onboarded?
    Yes -> (tabs)
    No  -> Onboarding -> (tabs)
```

---

## Contributing

Fork, branch, PR. Keep commits clean.

---

## License

MIT
