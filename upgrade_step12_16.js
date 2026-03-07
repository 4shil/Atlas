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

// Step 12
let indexTsx = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');
if (!indexTsx.includes('hapticImpact();\n    }, []);')) {
  indexTsx = indexTsx.replace('setRefreshing(false);\n    }, []);', 'setRefreshing(false);\n        hapticImpact();\n    }, []);');
  fs.writeFileSync('src/app/(tabs)/index.tsx', indexTsx, 'utf8');
  commit('haptic feedback when refresh completes');
} else {
  console.log('Step 12 already applied.');
}

// Step 13
let detailTsxPath = 'src/app/goal-detail.tsx';
if (fs.existsSync(detailTsxPath)) {
  let detailTsx = fs.readFileSync(detailTsxPath, 'utf8');
  if (detailTsx.includes('heroOpacity')) {
    // Modify to start at 0 and animate to 1
    detailTsx = detailTsx.replace('const heroOpacity = useSharedValue(1);', 'const heroOpacity = useSharedValue(0);');
    if (!detailTsx.includes('withTiming(1, { duration: 350 })')) {
      detailTsx = detailTsx.replace(/useEffect\(\(\) => \{/g, "useEffect(() => {\n        heroOpacity.value = withTiming(1, { duration: 350 });");
    }
    fs.writeFileSync(detailTsxPath, detailTsx, 'utf8');
    commit('smooth hero entrance in goal detail');
  } else {
    console.log('Step 13 not found heroOpacity');
  }
}

// Step 14
let addGoalTsxPath = 'src/app/add-goal.tsx';
if (fs.existsSync(addGoalTsxPath)) {
  let addGoalTsx = fs.readFileSync(addGoalTsxPath, 'utf8');
  if (!addGoalTsx.includes('KeyboardAvoidingView behavior')) {
    addGoalTsx = addGoalTsx.replace(/<ScreenWrapper([^>]*)>/, `<ScreenWrapper$1>\n            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">`);
    addGoalTsx = addGoalTsx.replace(/<\/ScreenWrapper>/, `</KeyboardAvoidingView>\n        </ScreenWrapper>`);
    addGoalTsx = addGoalTsx.replace(/import \{([\s\S]*?)\} from 'react-native';/, "import { KeyboardAvoidingView, Platform, $1 } from 'react-native';");
  }
  if (!addGoalTsx.includes('keyboardShouldPersistTaps="handled"')) {
    addGoalTsx = addGoalTsx.replace(/<ScrollView/g, '<ScrollView keyboardShouldPersistTaps="handled"');
  }
  fs.writeFileSync(addGoalTsxPath, addGoalTsx, 'utf8');
  commit('fix keyboard overlapping inputs on add goal');
}

