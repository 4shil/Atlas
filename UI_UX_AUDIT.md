# UI/UX Audit & Bug Report

After reviewing the current React Native (Expo) implementation across the 8 generated screens, I have identified several UI/UX bugs, missing native paradigms, and potential scaling issues.

## 1. Accessibility (a11y) Omissions ♿️
- **Missing Screen Reader Support**: None of the `TouchableOpacity` elements (buttons, navigation cards) have explicit `accessibilityRole="button"`, `accessibilityLabel`, or `accessibilityHint`. This makes the app practically unusable for standard iOS VoiceOver or Android TalkBack users.
- **Contrast Ratios**: In dark mode views (e.g., `dark-inspiration.tsx`), some text utilities (like `text-gray-500` on black backgrounds) will likely fail WCAG AA contrast ratio standards.

## 2. Layout & Responsiveness Constraints 📱
- **Hardcoded Dimensions**: The UI frequently uses hardcoded web-based widths and heights (e.g., `w-[280px] h-[420px]` in the gallery cards, or `w-[260px] h-[380px]`). On narrower devices like an iPhone SE, this will cause horizontal clipping and layout breaks. Percentage-based widths (e.g., `w-[75%]`) or `WindowWidth` calculations are required for true mobile responsiveness.
- **Bottom Safe Area Clipping**: While `SafeAreaView` from `react-native-safe-area-context` is applied at the root of the screens, the internal vertically-scrolling `ScrollView` components lack a `contentContainerStyle` padding. This means the last elements in a list might be obscured by the bottom "Home Indicator" bar on notched iPhones.
- **Horizontal Scroll Padding**: Horizontal `ScrollView` components use `px-2 -mx-2` for padding. Native systems (especially Android) tend to clip overflowing children. Using `contentContainerStyle={{ paddingHorizontal: 16 }}` is the standard, bug-free native approach.

## 3. Visual Fidelity & Rendering Bugs 🎨
- **Simulated Glassmorphism**: The original Stitch HTML utilized `backdrop-filter: blur()`. The current implementation approximates this using semi-transparent backgrounds (e.g., `bg-white/40` or `bg-black/40`). To achieve the true high-fidelity glassmorphism native to iOS, the project should leverage `<BlurView>` from `expo-blur`.
- **Image Scaling Distortion**: `Image` components are missing the `resizeMode="cover"` property. If container dimensions stretch on larger devices, the images might warp.
- **Placeholder API Data**: The adventure maps (`map.tsx` and `dark-map.tsx`) rely on a Google Maps static image containing `YOUR_API_KEY_HERE`. It will fail to load or show an API error graphic until a valid key is provided.

## 4. Interaction Design (Micro-Interactions) 👆
- **Uncontrolled Active Opacity**: While NativeWind's `active:scale-95` is cleverly utilized to replicate hover/press effects, React Native's `TouchableOpacity` has a default global `activeOpacity` (usually 0.2), which can make buttons look completely transparent on tap. Setting a controlled `activeOpacity={0.7}` feels much more premium.
- **Missing Haptics**: A high-fidelity application derived from modern UI specs should include tactile physical feedback. Importing `expo-haptics` and mapping light vibrations to button presses and tab changes would drastically improve the UX.
