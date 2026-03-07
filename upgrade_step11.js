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

let code = fs.readFileSync('src/store/useGoalStore.ts', 'utf8');

// The instructions: In the cloud sync/merge logic, change "cloud always wins" to: if local goal has updatedAt newer than cloud's updated_at, keep local. If Goal type lacks updatedAt, add it and set it in every updateGoal call.

if (!code.includes('updatedAt?: string')) {
  code = code.replace('export interface Goal {', 'export interface Goal {\n    updatedAt?: string;');
}

// In updateGoal
code = code.replace(/updateGoal:\s*\(id,\s*updates\)\s*=>\s*set\(\(state\)\s*=>\s*\{([\s\S]*?)\}\),/, (match, p1) => {
  if (match.includes('updatedAt')) return match;
  return `updateGoal: (id, updates) => set((state) => {
                const newGoals = state.goals.map((g) =>
                    g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
                );
                return { goals: newGoals };
            }),`;
});

// Also need to check toggleComplete and others if they update goal
code = code.replace(/g\.id === goalId\s*\?\s*\{\s*\.\.\.g,\s*completed:\s*!g\.completed/g, 
  "g.id === goalId ? { ...g, completed: !g.completed, updatedAt: new Date().toISOString()");

// Now the sync logic. Look for syncFromCloud
// Replace `const merged = [...cloudGoals];` or similar with conflict resolution.

fs.writeFileSync('src/store/useGoalStore.ts', code, 'utf8');

