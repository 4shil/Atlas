# Atlas UI/UX Audit (Functional + Implementation Mistakes)

_Date: 2026-02-23_

Scope reviewed:
- All screens in `src/app/**`
- Core interactive components in `src/components/**`
- Relevant stores/utils tied to UI behavior

No TypeScript/Problems panel errors were reported by editor diagnostics, but multiple product-level and implementation-level mistakes were found.

---

## A) Critical Functional Mistakes

### A1. Onboarding state exists but is not used in entry routing
- **Files:**
  - `src/app/index.tsx` line 4 (`<Redirect href="/(tabs)" />`)
  - `src/store/useProfileStore.ts` lines 9, 23, 34-36 (`hasOnboarded` + setter)
- **Why it’s a mistake:** App has onboarding state but startup ignores it.
- **Impact:** First-time UX is broken; onboarding screen is bypassed.
- **Fix direction:** Gate root route by `hasOnboarded` and redirect to `/onboarding` when false.

### A2. Reminder scheduling uses wrong goal ID source on create
- **File:** `src/app/add-goal.tsx` lines 74-76
- **Current:** `goalId: Date.now().toString()`
- **Why it’s a mistake:** Actual stored goal ID comes from `useGoalStore` (`uuid.v4()` in store), so notification payload ID may not match any persisted goal.
- **Impact:** Future cancellation/lookup by goal ID becomes inconsistent.
- **Fix direction:** Return created ID from store `addGoal`, or generate ID before insert and reuse it for both store + reminder scheduling.

### A3. “Delete Account” action is mislabeled and not implemented
- **File:** `src/app/settings.tsx` lines 172-173
- **Current:** `Delete Account` calls `handleClearData` (local reset only).
- **Why it’s a mistake:** Label implies backend account deletion; behavior only wipes local state.
- **Impact:** Trust and compliance risk due to misleading destructive action semantics.
- **Fix direction:** Either implement true account deletion flow or rename/remove this action.

---

## B) Non-Functional / Dead Interactive Elements

### B1. Dead controls in map screen
- **File:** `src/app/(tabs)/map.tsx`
- Line 33: back button only haptics
- Line 42: filter button only haptics
- Line 74: recenter button only haptics
- Line 87: “See all” is static text but styled as CTA

### B2. Dead controls in archive screen
- **File:** `src/app/(tabs)/archive.tsx`
- Line 30: menu button only haptics
- Line 40: settings button only haptics

### B3. Dead control in gallery screen
- **File:** `src/app/(tabs)/gallery.tsx`
- Line 69: notifications button only haptics

### B4. Non-clickable legal link labels in settings
- **File:** `src/app/settings.tsx`
- Lines 186-187: `Terms of Service` and `Privacy Policy` rendered as plain text, no links/actions.

### B5. Web location picker parity gap
- **Files:**
  - `src/app/add-goal.tsx` line 183
  - `src/components/LocationPicker.web.tsx` line 41
- **Issue:** Web flow opens modal but cannot select any location.

---

## C) UX Consistency Mistakes

### C1. Multiple icon buttons imply features that do not exist
- Examples: menu, filter, notifications, recenter.
- **Impact:** Repeated false affordances reduce confidence and perceived quality.

### C2. Action semantics mismatch in settings
- `Clear App Data` and `Delete Account` currently do the same thing.
- **Impact:** Confusing and potentially risky user expectation mismatch.

### C3. Cross-platform mismatch not communicated at source
- Add-goal still suggests map selection (`Pick on map`) even on web where map picking is unavailable.
- **Impact:** Dead-end task path on web.

---

## D) Code Quality / Maintainability Mistakes (affecting UI stability)

### D1. Suspicious/unused import alias in web location picker
- **File:** `src/components/LocationPicker.web.tsx` line 8
- `import React_useState from 'react';` is unused and misleading.

### D2. Unused state variables in web location picker
- **File:** `src/components/LocationPicker.web.tsx` lines 28-29
- `city`/`country` state declared but never used for rendering or submit.

### D3. Unused variables in goal detail
- **File:** `src/app/goal-detail.tsx`
- line 39: `const now = new Date();` unused
- line 23 + line 73: `celebOpacity` is updated but never applied to style.

### D4. Unused import in settings
- **File:** `src/app/settings.tsx` line 2
- `Animated` imported but not used.

### D5. Type-safety bypasses (`as any`) in navigation/icons
- Not immediately breaking, but present in several screens and can hide route/icon typing mistakes.
- Example: `src/app/profile.tsx` line 95 (`router.push('/settings' as any)`).

---

## E) Severity Summary
- **Critical:** A1, A2, A3
- **High:** B1, B2, B3, B4
- **Medium:** B5, C1, C2, C3
- **Low/Code hygiene:** D1–D5

---

## F) Recommended Fix Sequence
1. Fix routing gate for onboarding (`A1`).
2. Fix reminder ID wiring (`A2`).
3. Resolve `Delete Account` semantics (`A3`).
4. Remove or wire dead header/map controls (`B1-B3`).
5. Implement legal links and web location fallback behavior (`B4-B5`).
6. Clean hygiene issues (`D1-D5`) to prevent future regressions.

---

## G) Notes on Validation Method
- Static code audit was performed screen-by-screen and component-by-component.
- Editor diagnostics returned no direct TypeScript errors.
- Findings focus on behavior mismatches, dead actions, and implementation pitfalls visible in current code.
