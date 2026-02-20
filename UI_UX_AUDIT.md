# Atlas UI/UX Audit

Date: 2026-02-20
Scope: Current implementation in `src/app` and `src/components`

## Summary
Atlas already has a strong visual direction (dark editorial style, glass overlays, cinematic cards), but the UI still has consistency and usability gaps that reduce polish.

## High Priority Issues

1. **Hard-coded styling bypasses theme tokens**
   - **Where:** `src/components/LocationPicker.tsx`, `src/app/(tabs)/map.tsx` (map style)
   - **Problem:** Direct colors (`#000`, `rgba(...)`) and spacing values are used outside the design system.
   - **Impact:** Theme inconsistency and harder maintenance.
   - **Fix:** Move these values into semantic tokens or a map-specific token set.

2. **Inconsistent icon system**
   - **Where:** Header actions and several buttons use plain text symbols (`✕`, `←`, `+`) while tabs use `Ionicons`.
   - **Problem:** Mixed icon language and uneven visual weight.
   - **Impact:** UI looks less cohesive and less modern.
   - **Fix:** Standardize all action icons with one icon library and consistent sizes.

3. **Locale formatting is hardcoded to en-US in multiple screens**
   - **Where:** `timeline.tsx`, `archive.tsx`, `TimelineItem.tsx`, `goal/[id].tsx`
   - **Problem:** Date formatting is fixed to `'en-US'` in places.
   - **Impact:** Poor international UX and inconsistent formatting behavior.
   - **Fix:** Use device locale by default and centralize date formatting helper.

4. **FAB behavior is globally fixed and not context-aware**
   - **Where:** `src/components/FloatingActionButton.tsx`
   - **Problem:** Position logic assumes tab-bar context.
   - **Impact:** Reuse outside tab screens can produce awkward placement.
   - **Fix:** Add optional `bottomOffset` prop and default strategy; keep tab-aware behavior in tab screens.

## Medium Priority Issues

5. **Modal/picker visuals do not fully match app surfaces**
   - **Where:** `LocationPicker.tsx`
   - **Problem:** Bottom sheet typography, radius, spacing use custom values, not theme primitives.
   - **Impact:** Experience feels like a separate mini-app.
   - **Fix:** Refactor to theme typography/spacing/radius/elevation tokens.

6. **Animation language is not fully unified**
   - **Where:** Mixed usage across components (`FadeIn`, `SlideInUp`, instant transitions)
   - **Problem:** Some interactions are smooth, others are abrupt.
   - **Impact:** Reduced perceived quality.
   - **Fix:** Define a small motion policy (enter, press, list stagger, modal) and apply consistently.

7. **Some style objects are created on every render**
   - **Where:** Components using `StyleSheet.create` directly in render without memoization.
   - **Problem:** Avoidable recalculation overhead.
   - **Impact:** Minor performance cost on low-end devices.
   - **Fix:** Use `useMemo` for style blocks when they depend on dynamic theme values.

8. **Header overlay may over-obscure hero content on media-heavy screens**
   - **Where:** `HeaderOverlay.tsx` usage on full-bleed screens.
   - **Problem:** Persistent blur container can compete with cinematic imagery.
   - **Impact:** Reduced visual drama in gallery/detail hero sections.
   - **Fix:** Allow per-screen intensity or transparent mode with adaptive scrim.

## Low Priority Issues

9. **Small copy inconsistencies across empty states**
   - **Where:** `index.tsx`, `timeline.tsx`, `archive.tsx`, `map.tsx`
   - **Problem:** Tone and action language vary by screen.
   - **Impact:** Slightly fragmented product voice.
   - **Fix:** Create a copy guide for empty states and CTAs.

10. **Touch feedback is not uniform on all pressables**
    - **Where:** Various `Pressable` components across app.
    - **Problem:** Some controls animate on press, others do not.
    - **Impact:** Interaction quality feels inconsistent.
    - **Fix:** Introduce shared `PressableScale` wrapper for consistent feedback.

## Recommended Next Sprint (Execution Order)

1. Theme-token refactor for `LocationPicker` and reusable modal surfaces.
2. Icon standardization pass (replace text glyphs with consistent icon set).
3. Centralized date formatting + locale-aware utility.
4. Motion system unification (shared wrappers for press/enter/list stagger).
5. Context-aware FAB API (`bottomOffset`, `anchor`, `safeAreaAware`).

## Notes
- Recent pass improved tab bar and FAB placement and added more interaction animation.
- The app is visually strong; most remaining issues are consistency and systemization work.
