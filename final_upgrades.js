const fs = require('fs');
const { execSync } = require('child_process');

process.chdir('/home/ashil/Coding/Atlas');

function run(cmd) {
  console.log(`Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(e);
  }
}

function commit(msg) {
  try {
    execSync('git add -A', { stdio: 'ignore' });
    execSync(`git commit -m "${msg}"`, { stdio: 'ignore' });
    execSync('git push', { stdio: 'ignore' });
    console.log(`Committed: ${msg}`);
  } catch(e) {
    console.log(`Failed to commit: ${msg} (maybe no changes)`);
  }
}

// Step 16
let goalRowTsx = fs.readFileSync('src/components/GoalRow.tsx', 'utf8');
if (!goalRowTsx.includes('spring(scaleAnim, { toValue: 0.98')) {
  goalRowTsx = goalRowTsx.replace(/onComplete\(\);/g, `onComplete();\n                                Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start(() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start());`);
  fs.writeFileSync('src/components/GoalRow.tsx', goalRowTsx, 'utf8');
  commit('goal row closes and springs after swipe complete');
}

// Step 17
goalRowTsx = fs.readFileSync('src/components/GoalRow.tsx', 'utf8');
if (!goalRowTsx.includes('next.goal.timelineDate')) {
  goalRowTsx = goalRowTsx.replace(/prev\.goal\.id === next\.goal\.id &&\s*prev\.goal\.completed === next\.goal\.completed &&\s*prev\.goal\.completedAt === next\.goal\.completedAt &&\s*prev\.goal\.title === next\.goal\.title/g, 
    "prev.goal.id === next.goal.id && prev.goal.completed === next.goal.completed && prev.goal.title === next.goal.title && prev.goal.timelineDate === next.goal.timelineDate && prev.goal.image === next.goal.image");
  fs.writeFileSync('src/components/GoalRow.tsx', goalRowTsx, 'utf8');
  commit('precise memo comparator for GoalRow');
}

// Step 19
let layoutTsx = fs.readFileSync('src/app/_layout.tsx', 'utf8');
if (!layoutTsx.includes('ErrorBoundary')) {
  layoutTsx = layoutTsx.replace(/import \{ Stack \} from 'expo-router';/, `import { Stack } from 'expo-router';\nimport { ErrorBoundary } from '../components/ErrorBoundary';`);
  layoutTsx = layoutTsx.replace(/return \(/, `return (\n        <ErrorBoundary>`);
  layoutTsx = layoutTsx.replace(/<\/PostHogProvider>\n    \);/, `</PostHogProvider>\n        </ErrorBoundary>\n    );`);
  fs.writeFileSync('src/app/_layout.tsx', layoutTsx, 'utf8');
  commit('wrap app in error boundary');
}

// Step 21
let settingsTsxPath = 'src/app/settings.tsx';
if (fs.existsSync(settingsTsxPath)) {
  let settingsTsx = fs.readFileSync(settingsTsxPath, 'utf8');
  if (!settingsTsx.includes('Linking.openURL')) {
    settingsTsx = settingsTsx.replace(/import \{([\s\S]*?)\} from 'react-native';/, "import { Linking, $1 } from 'react-native';");
    settingsTsx = settingsTsx.replace(/<Text className="text-white text-base">Terms of Service<\/Text>/, 
      `<TouchableOpacity onPress={() => Linking.openURL('https://atlas.com/terms')}><Text className="text-white text-base">Terms of Service</Text></TouchableOpacity>`);
    settingsTsx = settingsTsx.replace(/<Text className="text-white text-base">Privacy Policy<\/Text>/, 
      `<TouchableOpacity onPress={() => Linking.openURL('https://atlas.com/privacy')}><Text className="text-white text-base">Privacy Policy</Text></TouchableOpacity>`);
    fs.writeFileSync(settingsTsxPath, settingsTsx, 'utf8');
    commit('make terms and privacy links tappable');
  }
}

// Step 22
let addGoalTsx2 = fs.readFileSync('src/app/add-goal.tsx', 'utf8');
if (!addGoalTsx2.includes('Haptics.NotificationFeedbackType.Success')) {
  addGoalTsx2 = addGoalTsx2.replace(/router\.back\(\);/, `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);\n            router.back();`);
  fs.writeFileSync('src/app/add-goal.tsx', addGoalTsx2, 'utf8');
  commit('success haptic when new goal is saved');
}

// Step 23
let goalCardTsx = fs.readFileSync('src/components/GoalCard.tsx', 'utf8');
if (!goalCardTsx.includes('accessibilityLabel={`View goal: ${goal.title}`}')) {
  goalCardTsx = goalCardTsx.replace(/<TouchableOpacity\n                    activeOpacity=\{0.95\}\n                    style=\{cardShadow\}\n                    className="relative w-\[300px\] h-\[420px\] rounded-\[24px\] overflow-hidden"\n                    onPress=\{onPress\}\n                    disabled=\{!isInteractive\}\n                    onPressIn=\{/, 
    `<TouchableOpacity\n                    activeOpacity={0.95}\n                    style={cardShadow}\n                    className="relative w-[300px] h-[420px] rounded-[24px] overflow-hidden"\n                    onPress={onPress}\n                    disabled={!isInteractive}\n                    accessible={true}\n                    accessibilityRole="button"\n                    accessibilityLabel={\`View goal: \${goal.title}\`}\n                    onPressIn={`);
  fs.writeFileSync('src/components/GoalCard.tsx', goalCardTsx, 'utf8');
  commit('accessibility labels on goal cards');
}

