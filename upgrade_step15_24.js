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
  run('git add -A');
  run(`git commit -m "${msg}"`);
  run('git push');
}

// Step 15
let indexTsx = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');
if (!indexTsx.includes('runOnJS')) {
  indexTsx = indexTsx.replace('useAnimatedScrollHandler,', 'useAnimatedScrollHandler,\n    runOnJS,');
}
if (!indexTsx.includes('dismissSearch')) {
  indexTsx = indexTsx.replace('const scrollY = useSharedValue(0);', 
    `const dismissSearch = () => { setShowSearch(false); setSearchQuery(''); };\n    const scrollY = useSharedValue(0);`);
  indexTsx = indexTsx.replace('scrollY.value = event.contentOffset.y;', 
    `scrollY.value = event.contentOffset.y;\n            if (event.contentOffset.y > 50) {\n                runOnJS(dismissSearch)();\n            }`);
  fs.writeFileSync('src/app/(tabs)/index.tsx', indexTsx, 'utf8');
  commit('search bar dismisses when user scrolls down');
}

// Step 16
let goalRowTsx = fs.readFileSync('src/components/GoalRow.tsx', 'utf8');
if (!goalRowTsx.includes('Animated.spring(scaleAnim')) {
  goalRowTsx = goalRowTsx.replace(/onComplete\(\);/g, `onComplete();\n                                swipeableRef.current?.close();\n                                Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start(() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start());`);
  fs.writeFileSync('src/components/GoalRow.tsx', goalRowTsx, 'utf8');
  commit('goal row closes and springs after swipe complete');
}

// Step 17
if (!goalRowTsx.includes('prev.goal.id === next.goal.id')) {
  goalRowTsx = goalRowTsx.replace(/export const GoalRow = React.memo\(\s*function GoalRow\(props: GoalRowProps\) \{([\s\S]*?)\}\s*\);/, 
    `export const GoalRow = React.memo(\n    function GoalRow(props: GoalRowProps) {\n$1\n    },\n    (prev, next) =>\n        prev.goal.id === next.goal.id &&\n        prev.goal.completed === next.goal.completed &&\n        prev.goal.title === next.goal.title &&\n        prev.goal.timelineDate === next.goal.timelineDate &&\n        prev.goal.image === next.goal.image\n);`);
  fs.writeFileSync('src/components/GoalRow.tsx', goalRowTsx, 'utf8');
  commit('precise memo comparator for GoalRow');
}

// Step 18
run('find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/console.log/\\/\\/ console.log/g"');
commit('remove debug console logs');

// Step 19
let layoutTsx = fs.readFileSync('src/app/_layout.tsx', 'utf8');
if (!layoutTsx.includes('ErrorBoundary')) {
  layoutTsx = layoutTsx.replace(/import \{ Stack \} from 'expo-router';/, `import { Stack } from 'expo-router';\nimport { ErrorBoundary } from '../components/ErrorBoundary';`);
  layoutTsx = layoutTsx.replace(/return \(/, `return (\n        <ErrorBoundary>`);
  layoutTsx = layoutTsx.replace(/<\/PostHogProvider>\n    \);/, `</PostHogProvider>\n        </ErrorBoundary>\n    );`);
  fs.writeFileSync('src/app/_layout.tsx', layoutTsx, 'utf8');
  commit('wrap app in error boundary');
}

// Step 20
let statsTsx = fs.readFileSync('src/app/stats.tsx', 'utf8');
if (!statsTsx.includes('Add some goals to see your stats')) {
  statsTsx = statsTsx.replace(/const \{ goals \} = useGoalStore\(\);/, `const { goals } = useGoalStore();\n    if (goals.length === 0) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><Text style={{color: 'white'}}>Add some goals to see your stats</Text></View>;`);
  fs.writeFileSync('src/app/stats.tsx', statsTsx, 'utf8');
  commit('stats screen shows message when no goals exist');
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
  goalCardTsx = goalCardTsx.replace(/<TouchableOpacity\n                    activeOpacity=\{0.95\}\n                    style=\{cardShadow\}\n                    className="relative w-\[300px\] h-\[420px\] rounded-\[28px\] overflow-hidden"\n                    onPress=\{onPress\}/, 
    `<TouchableOpacity\n                    activeOpacity={0.95}\n                    style={cardShadow}\n                    className="relative w-[300px] h-[420px] rounded-[24px] overflow-hidden"\n                    onPress={onPress}\n                    accessible={true}\n                    accessibilityRole="button"\n                    accessibilityLabel={\`View goal: \${goal.title}\`}`);
  fs.writeFileSync('src/components/GoalCard.tsx', goalCardTsx, 'utf8');
  commit('accessibility labels on goal cards');
}

// Step 24
goalCardTsx = fs.readFileSync('src/components/GoalCard.tsx', 'utf8');
goalCardTsx = goalCardTsx.replace(/rounded-\[28px\]/g, 'rounded-[24px]');
fs.writeFileSync('src/components/GoalCard.tsx', goalCardTsx, 'utf8');

goalRowTsx = fs.readFileSync('src/components/GoalRow.tsx', 'utf8');
goalRowTsx = goalRowTsx.replace(/borderRadius: 18/g, 'borderRadius: 16');
fs.writeFileSync('src/components/GoalRow.tsx', goalRowTsx, 'utf8');

commit('consistent border radius across cards and rows');

