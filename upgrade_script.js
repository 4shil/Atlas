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

// Step 4
replaceInFile('src/components/EmptyState.tsx', 'No dreams yet', 'Nothing here yet');
replaceInFile('src/components/EmptyState.tsx', 'Add your first adventure!', 'Nothing completed');
// Check index.tsx for any exclamation motivational text.
let indexTsx = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');
indexTsx = indexTsx.replace(/All adventures completed! 🎉\\nAdd a new one./g, 'Nothing here yet');
fs.writeFileSync('src/app/(tabs)/index.tsx', indexTsx, 'utf8');
commit('honest empty states without filler copy');

// Step 5
replaceInFile('src/app/(tabs)/index.tsx', 
  '<Text className="text-xs font-semibold dark:text-white/40 text-gray-500 uppercase tracking-widest">\\n                                    Your Adventures\\n                                </Text>',
  '<Text className="text-sm font-semibold dark:text-white/40 text-gray-500">\\n                                    Recent\\n                                </Text>');
replaceInFile('src/app/(tabs)/index.tsx', 'Your Adventures', 'Recent');
replaceInFile('src/app/(tabs)/index.tsx', 'text-xs font-semibold dark:text-white/40 text-gray-500 uppercase tracking-widest', 'text-sm font-semibold dark:text-white/40 text-gray-500');
commit('cleaner dashboard section labels');

// Step 6
indexTsx = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');
// remove the badge
indexTsx = indexTsx.replace(/\{goal\.completed && \([\s\S]*?✓ DONE\s*<\/Text>\s*<\/View>\s*\)\}/g, '');
fs.writeFileSync('src/app/(tabs)/index.tsx', indexTsx, 'utf8');
commit('remove loud completion badge from gallery strip');

// Step 7
indexTsx = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');
indexTsx = indexTsx.replace(/🕐 \{overdueGoals\.length\} overdue dream[\s\S]*?want to reschedule\?/g, 
  "{overdueGoals.length} {overdueGoals.length === 1 ? 'goal' : 'goals'} past due");
indexTsx = indexTsx.replace(/>\s*Reschedule\s*<\/Text>/g, '>View</Text>');
fs.writeFileSync('src/app/(tabs)/index.tsx', indexTsx, 'utf8');
commit('calmer overdue banner language');

