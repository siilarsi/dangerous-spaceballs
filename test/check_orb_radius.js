const fs = require('fs');
// After splitting main.js the update loop lives in game/loop.js
const content = fs.readFileSync('static/lib/game/loop.js', 'utf8');
const lines = content.split(/\r?\n/);
const forIdx = lines.findIndex(l => l.includes('for (let i = this.orbs.length - 1'));
if (forIdx === -1) {
  throw new Error('orbs loop not found');
}
const section = lines.slice(forIdx, forIdx + 5).join('\n');
const pattern = /for \(let i = this\.orbs\.length - 1; i >= 0; i--\)\s*{\s*const o = this\.orbs\[i\];\s*const radius = o\.radius;/s;
if (!pattern.test(section)) {
  throw new Error('radius declaration missing at start of orbs loop');
}
console.log('Test passed');
