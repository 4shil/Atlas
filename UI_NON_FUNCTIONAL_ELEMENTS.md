# Atlas UI Non-Functional Elements Report

_Date: 2026-02-23_

This report lists UI controls/elements that appear interactive but are currently non-functional or miswired.

## 1) Map tab: Back button does nothing
- **Screen:** `src/app/(tabs)/map.tsx`
- **Evidence:** line 33 (handler only calls haptics), label on line 35 (`Go back`)
- **Issue:** No navigation action (`router.back`) is called.
- **User impact:** Users expect to return to previous screen but nothing happens.

## 2) Map tab: Filter button does nothing
- **Screen:** `src/app/(tabs)/map.tsx`
- **Evidence:** line 42 (handler only calls haptics), label on line 44 (`Filter map`)
- **Issue:** No filter state/modal is implemented.
- **User impact:** Button gives feedback but no feature behavior.

## 3) Map tab: Recenter button does nothing
- **Screen:** `src/app/(tabs)/map.tsx`
- **Evidence:** line 74 (handler only calls haptics), label on line 76 (`Recenter map`)
- **Issue:** No map reference or region update logic attached.
- **User impact:** Users cannot re-center the map to current location.

## 4) Map tab: “See all” looks actionable but is inert text
- **Screen:** `src/app/(tabs)/map.tsx`
- **Evidence:** line 87 (`See all` is rendered as `Text` only)
- **Issue:** No `TouchableOpacity`/navigation for this CTA-like label.
- **User impact:** Misleading UI affordance.

## 5) Archive tab: Menu button does nothing
- **Screen:** `src/app/(tabs)/archive.tsx`
- **Evidence:** line 30 (handler only calls haptics), icon on line 32 (`menu`)
- **Issue:** No drawer/menu action.
- **User impact:** Non-responsive top-nav control.

## 6) Archive tab: Settings button does nothing
- **Screen:** `src/app/(tabs)/archive.tsx`
- **Evidence:** line 40 (handler only calls haptics), icon on line 42 (`settings`)
- **Issue:** No navigation to settings.
- **User impact:** Users cannot reach settings from this shortcut.

## 7) Gallery tab: Notifications button does nothing
- **Screen:** `src/app/(tabs)/gallery.tsx`
- **Evidence:** line 69 (handler only calls haptics), icon on line 73 (`notifications-none`)
- **Issue:** No notifications screen/action.
- **User impact:** Dead action in primary header.

## 8) Settings: “Terms of Service” is not clickable
- **Screen:** `src/app/settings.tsx`
- **Evidence:** line 186 (plain `Text` only)
- **Issue:** Looks like link text but has no action.
- **User impact:** Cannot open legal terms.

## 9) Settings: “Privacy Policy” is not clickable
- **Screen:** `src/app/settings.tsx`
- **Evidence:** line 187 (plain `Text` only)
- **Issue:** Looks like link text but has no action.
- **User impact:** Cannot open policy.

## 10) Settings: “Delete Account” is wired to clear local app data only
- **Screen:** `src/app/settings.tsx`
- **Evidence:** line 172 (`onPress={handleClearData}`), line 173 label `Delete Account`
- **Issue:** This is a functional mismatch: destructive account action is not implemented; it calls local wipe flow used by `Clear App Data`.
- **User impact:** Misleading and potentially trust-damaging behavior.

## 11) Onboarding flow is effectively unreachable on app start
- **Files:**
  - `src/app/index.tsx` line 4: always redirects to `/(tabs)`
  - `src/store/useProfileStore.ts` lines 9, 23, 34-36: `hasOnboarded` state exists
- **Issue:** `hasOnboarded` is never used for startup routing.
- **User impact:** New users skip onboarding unless manually routed there.

## 12) Web: “Pick on map” flow cannot actually pick a location
- **Files:**
  - `src/app/add-goal.tsx` line 183 (`Pick on map` CTA)
  - `src/components/LocationPicker.web.tsx` line 41 (`Map is only available on mobile`), only close action
- **Issue:** Web fallback opens modal with no location input/selection capability.
- **User impact:** Location entry is blocked for web users.

---

## Quick Priority Order
1. Map tab dead controls (items 1–4)
2. Archive + Gallery header dead controls (items 5–7)
3. Settings legal/account mismatches (items 8–10)
4. Onboarding gate + web location picker parity (items 11–12)
