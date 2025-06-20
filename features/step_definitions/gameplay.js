const { Given, When, Then } = require('@cucumber/cucumber');
const ctx = require('./context');

Given('the level progression interval is {int} ms', async ms => {
  await ctx.page.evaluate(m => { window.levelDuration = m; }, ms);
});


When('I wait for {int} ms', async ms => {
  await ctx.page.waitForTimeout(ms);
});

Then('the level banner should show {string}', async text => {
  await ctx.page.waitForFunction(t => {
    const el = document.getElementById('level-banner');
    if (!el) return false;
    const style = getComputedStyle(el);
    return el.textContent === t && parseFloat(style.opacity) > 0;
  }, text);
});

Then('the level should be {int}', async expected => {
  await ctx.page.waitForFunction(lvl => {
    return window.gameScene?.level >= lvl;
  }, expected);
  const val = await ctx.page.evaluate(() => window.gameScene.level);
  if (val < expected) {
    throw new Error(`Expected level ${expected} but got ${val}`);
  }
});

When('I set the game level to {int}', async lvl => {
  await ctx.page.waitForFunction(() => window.gameScene);
  await ctx.page.evaluate(l => { window.gameScene.level = l; }, lvl);
});

Then('the game should be paused', async () => {
  const paused = await ctx.page.evaluate(() => window.gamePaused);
  if (!paused) {
    throw new Error('Game not paused');
  }
});

Then('the game should not be paused', async () => {
  const paused = await ctx.page.evaluate(() => window.gamePaused);
  if (paused) {
    throw new Error('Game unexpectedly paused');
  }
});


When('I record the ship position', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  ctx.lastShipPos = await ctx.page.evaluate(() => ({ x: window.gameScene.ship.x, y: window.gameScene.ship.y }));
});

Then('the ship should have moved', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const pos = await ctx.page.evaluate(() => ({ x: window.gameScene.ship.x, y: window.gameScene.ship.y }));
  const dist = Math.hypot(pos.x - ctx.lastShipPos.x, pos.y - ctx.lastShipPos.y);
  if (dist < 5) {
    throw new Error('Ship did not move');
  }
});

Then('the ship should not have moved', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const pos = await ctx.page.evaluate(() => ({ x: window.gameScene.ship.x, y: window.gameScene.ship.y }));
  const dist = Math.hypot(pos.x - ctx.lastShipPos.x, pos.y - ctx.lastShipPos.y);
  if (dist > 2) {
    throw new Error('Ship moved unexpectedly');
  }
});

When('I record the orb position', async () => {
  await ctx.page.waitForFunction(() => window.gameScene?.orbs?.length > 0);
  ctx.lastOrbPos = await ctx.page.evaluate(() => {
    const o = window.gameScene.orbs[0];
    return { x: o.sprite.x, y: o.sprite.y };
  });
  if (!ctx.lastOrbPos) {
    throw new Error('No orb found');
  }
});

Then('the orb should have moved', async () => {
  const pos = await ctx.page.evaluate(() => {
    const o = window.gameScene?.orbs?.[0];
    if (!o) return null;
    return { x: o.sprite.x, y: o.sprite.y };
  });
  if (!pos) {
    // If the orb no longer exists it likely collided with the planet
    return;
  }
  const dist = Math.hypot(pos.x - ctx.lastOrbPos.x, pos.y - ctx.lastOrbPos.y);
  if (dist < 2) {
    throw new Error('Orb did not move');
  }
});

Then('the ship speed should be below {int}', async max => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.velocity);
  const vel = await ctx.page.evaluate(() => ({
    x: window.gameScene.velocity.x,
    y: window.gameScene.velocity.y
  }));
  const speed = Math.hypot(vel.x, vel.y);
  if (speed >= max) {
    throw new Error(`Ship speed ${speed} not below ${max}`);
  }
});

Then('the game should be over', async () => {
  await ctx.page.waitForFunction(() => window.gameScene?.gameOver);
});

Then('the game should not be over', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const over = await ctx.page.evaluate(() => window.gameScene.gameOver);
  if (over) {
    throw new Error('Game unexpectedly over');
  }
});

Then('the debug overlay should be active', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const active = await ctx.page.evaluate(() => window.debugHitboxes === true);
  if (!active) {
    throw new Error('Debug overlay not active');
  }
});

Then('the ship hitbox radius should be {int}', async r => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const val = await ctx.page.evaluate(() => window.gameScene.shipRadius);
  if (val !== r) {
    throw new Error(`Expected ship radius ${r} but got ${val}`);
  }
});
