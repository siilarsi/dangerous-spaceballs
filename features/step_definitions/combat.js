const { When, Then } = require('@cucumber/cucumber');
const ctx = require('./context');

When('I hold the right mouse button for {int} ms', async ms => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const canvas = await ctx.page.waitForSelector('#game canvas', { state: 'attached' });
  const box = await canvas.boundingBox();
  await ctx.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await ctx.page.mouse.down({ button: 'right' });
  await ctx.page.waitForTimeout(ms);
});

When('I release the right mouse button', async () => {
  await ctx.page.mouse.up({ button: 'right' });
});

Then('the flame should be visible', async () => {
  const visible = await ctx.page.evaluate(() => window.gameScene.flame.visible);
  if (!visible) {
    throw new Error('Flame not visible');
  }
});

Then('the fuel should decrease', async () => {
  const fuel = await ctx.page.evaluate(() => window.gameScene.fuel);
  if (fuel >= 200) {
    throw new Error('Fuel did not decrease');
  }
});

When('I hold the left mouse button for {int} ms', async ms => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const canvas = await ctx.page.waitForSelector('#game canvas', { state: 'attached' });
  const box = await canvas.boundingBox();
  await ctx.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await ctx.page.mouse.down({ button: 'left' });
  await ctx.page.waitForTimeout(ms);
});

When('I release the left mouse button', async () => {
  await ctx.page.mouse.up({ button: 'left' });
});

Then('bullets should be fired', async () => {
  const count = await ctx.page.evaluate(() => window.gameScene.bullets.length);
  if (count === 0) {
    throw new Error('No bullets were fired');
  }
});

Then('the ammo should decrease', async () => {
  const ammo = await ctx.page.evaluate(() => window.gameScene.ammo);
  if (ammo >= 50) {
    throw new Error('Ammo did not decrease');
  }
});

When('I move the pointer to offset {int} {int}', async (dx, dy) => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const canvas = await ctx.page.waitForSelector('#game canvas', { state: 'attached' });
  const box = await canvas.boundingBox();
  const targetX = box.width / 2 + dx;
  const targetY = box.height / 2 + dy;
  await ctx.page.mouse.move(box.x + targetX, box.y + targetY);
  ctx.lastPointer = { x: targetX, y: targetY };
  await ctx.page.waitForTimeout(200);
});

Then('the reticle should follow the pointer', async () => {
  const pos = await ctx.page.evaluate(() => ({ x: window.gameScene.reticle.x, y: window.gameScene.reticle.y }));
  if (Math.abs(pos.x - ctx.lastPointer.x) > 1 || Math.abs(pos.y - ctx.lastPointer.y) > 1) {
    throw new Error('Reticle did not follow pointer');
  }
});

Then('the ship should face the reticle', async () => {
  await ctx.page.waitForFunction(({ x, y }) => {
    const gs = window.gameScene;
    if (!gs) return false;
    const target = Math.atan2(y - gs.ship.y, x - gs.ship.x) + Math.PI / 2;
    const diff = Math.abs(((gs.ship.rotation - target + Math.PI) % (Math.PI * 2)) - Math.PI);
    return diff < 0.2;
  }, ctx.lastPointer);
});

When('I set the ship boost thrust to {int}', async thrust => {
  await ctx.page.waitForFunction(() => window.gameScene);
  await ctx.page.evaluate(t => { window.gameScene.boostThrust = t; }, thrust);
});

Then('the flame scale should be {float}', async expected => {
  const scale = await ctx.page.evaluate(() => window.gameScene.flame.scaleY);
  if (Math.abs(scale - expected) > 0.1) {
    throw new Error(`Flame scale ${scale} not close to ${expected}`);
  }
});

Then('the cooldown indicator should be visible', async () => {
  const display = await ctx.page.$eval('#reload-indicator', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Cooldown indicator not visible');
  }
});
