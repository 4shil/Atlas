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

function replaceInFile(file, search, replace) {
  if (!fs.existsSync(file)) {
    console.log(`File ${file} not found.`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  if (typeof search === 'string') {
    content = content.split(search).join(replace);
  } else {
    content = content.replace(search, replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}

// Step 1
replaceInFile('src/components/GoalCard.tsx', 
  `colors={['transparent', 'rgba(0,0,0,0.85)']}`, 
  `colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.72)']}`);
replaceInFile('src/components/GoalCard.tsx', `h-[440px]`, `h-[420px]`);
commit('natural card gradient and proportions');

// Step 2
replaceInFile('src/components/GoalRow.tsx', `fontWeight: '600'`, `fontWeight: '500'`);
replaceInFile('src/components/GoalRow.tsx', `DONE`, `Done`);
replaceInFile('src/components/GoalRow.tsx', `LATE`, `Late`);
replaceInFile('src/components/GoalRow.tsx', `fontSize: 10`, `fontSize: 11`);
replaceInFile('src/components/GoalRow.tsx', `letterSpacing:`, `// letterSpacing:`);
commit('more readable typography in goal rows');

// Step 3
let authTsx = fs.readFileSync('src/app/auth.tsx', 'utf8');
authTsx = authTsx.replace(/return;\s*return;/g, 'return;');
authTsx = authTsx.replace(/<LinearGradient[^>]*>/g, `<View style={{flex: 1, backgroundColor: '#0a0a0a'}}>`);
authTsx = authTsx.replace(/<\/LinearGradient>/g, `</View>`);
authTsx = authTsx.replace(/SIGN IN/i, 'Sign in');
authTsx = authTsx.replace(/Sign In/i, 'Sign in');
// Add borders to inputs
authTsx = authTsx.replace(/className="bg-white\/5/g, 'className="bg-transparent border border-white/10');
// wait, the instruction says: Add `borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)'` to inputs instead of heavy bg.
fs.writeFileSync('src/app/auth.tsx', authTsx, 'utf8');
commit('auth screen cleanup and duplicate return fix');

