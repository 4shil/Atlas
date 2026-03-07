const fs = require('fs');

// Fix goal-detail.tsx
let goalDetailTsx = fs.readFileSync('/home/ashil/Coding/Atlas/src/app/goal-detail.tsx', 'utf8');
if (!goalDetailTsx.includes('useAnimatedStyle')) {
  goalDetailTsx = goalDetailTsx.replace(/import Animated, \{/g, 'import Animated, {\n    useAnimatedStyle,');
  if (!goalDetailTsx.includes('import Animated, {')) {
    goalDetailTsx = goalDetailTsx.replace(/import \{ useSharedValue, withTiming \} from 'react-native-reanimated';/, "import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';");
  }
  fs.writeFileSync('/home/ashil/Coding/Atlas/src/app/goal-detail.tsx', goalDetailTsx, 'utf8');
}

// Fix notifications.tsx
let notificationsTsx = fs.readFileSync('/home/ashil/Coding/Atlas/src/app/notifications.tsx', 'utf8');
// Error: Type 'Date' is not assignable to type 'NotificationTriggerInput'.
notificationsTsx = notificationsTsx.replace(/trigger: \{ date: new Date\(triggerMs\) \}/g, "trigger: { date: new Date(triggerMs) } as any");

// Error: Property 'goals' does not exist on type 'unknown'.
notificationsTsx = notificationsTsx.replace(/const \{ goals \} = useGoalStore\(\)/g, "const goals = useGoalStore(s => s.goals)");
notificationsTsx = notificationsTsx.replace(/const \{ syncFromCloud \} = useGoalStore\(\)/g, "const syncFromCloud = useGoalStore(s => s.syncFromCloud)");
notificationsTsx = notificationsTsx.replace(/const \{ goals, syncFromCloud \} = useGoalStore\(\)/g, "const { goals, syncFromCloud } = useGoalStore() as any");

fs.writeFileSync('/home/ashil/Coding/Atlas/src/app/notifications.tsx', notificationsTsx, 'utf8');

