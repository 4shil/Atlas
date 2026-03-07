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

let authTsx = fs.readFileSync('src/app/auth.tsx', 'utf8');

// The instruction: Replace heavy bg with borderWidth 1 and borderColor 'rgba(255,255,255,0.07)'
// Currently it has: className="bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-4 flex-row items-center mb-4"
// Let's replace it with: style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }} className="rounded-2xl px-4 py-4 flex-row items-center mb-4"

authTsx = authTsx.replace(/className="bg-white\/\[0\.07\] border border-white\/10 rounded-2xl/g, `style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }} className="rounded-2xl`);

fs.writeFileSync('src/app/auth.tsx', authTsx, 'utf8');

run('git add src/app/auth.tsx');
run('git commit --amend --no-edit');
run('git push -f');

