# Atlas — Product Requirements Document (PRD)

Version: 1.0  
Status: Draft  
Platform: Expo React Native (iOS + Android)

---

## 1. Product Overview

Atlas is a cinematic bucket list and life timeline application that transforms personal goals into a visual gallery mapped across space and time.

Instead of managing tasks, users curate a collection of future dreams and completed memories. Each goal is represented as an editorial card tied to a real-world location and timeline placement.

Atlas combines:

- immersive gallery UI
- geographic visualization
- chronological storytelling
- reflective memory archiving

The app is designed to inspire experience, not productivity.

---

## 2. Vision Statement

> Turn life into a gallery you can scroll.

Atlas should feel like watching a documentary of your own life — past, present, and future.

---

## 3. Problem Statement

Existing bucket list or goal apps:

- treat life experiences as tasks
- lack emotional engagement
- focus on productivity metrics
- offer flat list interfaces
- fail to visualize progress meaningfully

Users want:

- inspiration
- reflection
- storytelling
- geographic visualization
- emotional connection to goals

---

## 4. Goals & Objectives

### Primary Goals

- Inspire users to pursue experiences
- Create emotional attachment to goals
- Visualize life journey over time
- Encourage reflection and memory preservation

### Secondary Goals

- Long-term retention
- habitual engagement
- memory revisits
- shareable storytelling
- travel and lifestyle discovery

---

## 5. Target Audience

Age: 16–35

Psychographics:

- travelers
- creatives
- journaling enthusiasts
- introspective users
- aesthetic-driven app users
- experience-oriented lifestyle

User mindset:

People who romanticize life and value personal growth through experience.

---

## 6. Core User Stories

- As a user, I want to record dreams so I don’t forget what I want from life
- As a user, I want to visualize my future on a world map
- As a user, I want to reflect on completed experiences
- As a user, I want to see my life evolve over time
- As a user, I want my goals to feel meaningful, not transactional
- As a user, I want private control over my memories

---

## 7. Feature Scope

### 7.1 MVP Features

- Goal creation & editing
- Image attachment
- Location selection via map
- Timeline date assignment
- Cinematic gallery slideshow
- Interactive map visualization
- Timeline scrolling
- Completion tracking
- Memory archive
- Offline local storage

### 7.2 Post-MVP Features

- Cloud sync
- AI goal suggestions
- travel analytics
- replay life journey animation
- memory sharing
- reminder system
- yearly recap visualization
- heatmap of visited locations

---

## 8. Functional Requirements

### 8.1 Goal Management

Users must be able to:

- create goal
- edit goal
- delete goal
- attach image
- add description
- assign category
- assign location
- assign timeline date
- mark complete
- add reflection notes

---

### 8.2 Gallery Mode

- fullscreen card carousel
- vertical swipe navigation
- parallax depth motion
- immersive image display
- oversized typography
- minimal UI chrome

---

### 8.3 Map Mode

- interactive world map
- pins for goals
- color-coded goal states
- camera fly animations
- pin clustering
- category filtering

Pin states:

- planned
- completed
- wishlist

---

### 8.4 Timeline Mode

- chronological scroll
- year grouping
- scroll-to-map synchronization
- animated journey playback

---

### 8.5 Archive Mode

- completed goal vault
- memory grid layout
- reflection editing
- date grouping

---

## 9. Non-Functional Requirements

- 60 FPS animations
- <200ms navigation transitions
- offline-first architecture
- local data persistence
- minimal memory footprint
- smooth gesture response
- scalable data structure
- accessibility compliance

---

## 10. UX Principles

- Content over interface
- motion replaces clutter
- quiet visual pacing
- emotional engagement
- gesture-first navigation
- minimal distractions

The app should feel calm, cinematic, and intentional.

---

## 11. Visual Design System

### Color Palette

Primary: #000000  
Secondary: #111111  
Accent: #FFFFFF  
Text Secondary: #888888

Imagery provides emotional color.

---

### Typography

Editorial grotesk style:

- oversized hero text
- minimalist hierarchy
- typography-driven layout

---

### Motion Language

- spring animations
- parallax layering
- cinematic transitions
- opacity fades
- smooth camera movement

---

## 12. Data Model

Goal {
id: string
title: string
description: string
image: uri
category: string
createdAt: date
timelineDate: date
completed: boolean
completedAt: date | null
notes: string
location: {
latitude: number
longitude: number
city: string
country: string
placeId: string
}
}

---

## 13. Technical Architecture

Platform: Expo React Native

Core Libraries:

- react-native-reanimated
- react-native-gesture-handler
- reanimated-carousel
- react-native-maps
- expo-image
- expo-blur
- react-navigation
- Zustand

Storage:

- AsyncStorage (local)
- optional Supabase cloud sync

---

## 14. Folder Structure


/src
/app
/screens
/components
/features
/hooks
/utils
/theme
/assets

Feature-driven modular architecture.

---

## 15. Performance Strategy

- memoized components
- lazy image loading
- map pin clustering
- throttled animations
- native thread animation execution
- minimized React re-renders

---

## 16. Privacy & Security

- local-first storage
- user-owned data
- optional encrypted backup
- no tracking by default
- privacy-first architecture

---

## 17. Success Metrics

- goals created per user
- completion rate
- 7-day retention
- archive revisit frequency
- timeline engagement duration
- emotional engagement indicators

---

## 18. Risks

- animation performance overhead
- map API cost scaling
- scope creep
- storage growth
- UI complexity

Mitigation: strict MVP scope and performance monitoring.

---

## 19. Release Roadmap

Phase 1 — Core Foundation  
goal CRUD, gallery UI, offline storage

Phase 2 — Map Integration  
map pins, timeline sync

Phase 3 — Memory Layer  
archive, stats, polish

Phase 4 — Expansion  
cloud sync, AI features, sharing

---

## 20. Definition of Done

The app must feel:

- cinematic
- calm
- premium
- reflective
- intentional
- emotionally meaningful

Atlas is complete when it feels like a memory, not a tool.
