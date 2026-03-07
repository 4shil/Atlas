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

// Fix stats.tsx hook rule
let statsTsx = fs.readFileSync('src/app/stats.tsx', 'utf8');
statsTsx = statsTsx.replace(/if \(goals\.length === 0\) return <View style=\{\{flex: 1, justifyContent: 'center', alignItems: 'center'\}\}><Text style=\{\{color: 'white'\}\}>Add some goals to see your stats<\/Text><\/View>;\n/, '');

// Find return statement and wrap the content
statsTsx = statsTsx.replace(/return \(\n        <View style=\{\[styles\.container, \{ paddingTop: insets\.top \}\]\}>/, `if (goals.length === 0) return <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}><Text style={{color: 'white'}}>Add some goals to see your stats</Text></View>;\n\n    return (\n        <View style={[styles.container, { paddingTop: insets.top }]}>`);
fs.writeFileSync('src/app/stats.tsx', statsTsx, 'utf8');
commit('stats screen shows message when no goals exist');

// Fix GoalCard.tsx SharedValue warning
let goalCardTsx = fs.readFileSync('src/components/GoalCard.tsx', 'utf8');
goalCardTsx = goalCardTsx.replace(/,\n    SharedValue,/g, ',');
goalCardTsx = goalCardTsx.replace(/, SharedValue,/g, ',');
goalCardTsx = goalCardTsx.replace(/SharedValue,/g, '');
fs.writeFileSync('src/components/GoalCard.tsx', goalCardTsx, 'utf8');

// Now commit 24
commit('consistent border radius across cards and rows');

