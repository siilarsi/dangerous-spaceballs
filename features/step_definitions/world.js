const { Given, When, Then } = require('@cucumber/cucumber');
const ctx = require('./context');

Then('the star background should cover the game area', async () => {
  const bg = await ctx.page.$eval('#game', el => getComputedStyle(el).backgroundImage);
  if (!bg.includes('stars.webp')) {
    throw new Error('Star background not visible');
  }
});

Then('the legend should be visible', async () => {
  await ctx.page.waitForSelector('#legend', { state: 'visible' });
  const display = await ctx.page.$eval('#legend', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Legend not visible');
  }
});

Then('the legend icons should match power-up graphics', async () => {
  const icons = await ctx.page.$$eval('#legend .legend-dot', els =>
    els.map(el => ({
      shape: el.dataset.shape,
      color: getComputedStyle(el).getPropertyValue('--color').trim()
    }))
  );
  const expected = [
    { shape: 'cross', color: '#ffff00' },
    { shape: 'triangle', color: '#ffa500' },
    { shape: 'circle', color: '#00ff00' }
  ];
  if (
    icons.length !== expected.length ||
    icons.some((ic, i) => ic.shape !== expected[i].shape || ic.color !== expected[i].color)
  ) {
    throw new Error('Legend icons do not match power-up graphics');
  }
});

Then('the legend should not be visible', async () => {
  const display = await ctx.page.$eval('#legend', el => getComputedStyle(el).display);
  if (display !== 'none') {
    throw new Error('Legend should be hidden');
  }
});

When('I spawn an ammo power-up on the ship', async () => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.powerUps);
  ctx.initialAmmo = await ctx.page.evaluate(() => window.gameScene.ammo);
  await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    const time = gs.time.now;
    const power = gs.add.container(gs.ship.x, gs.ship.y);
    const v = gs.add.rectangle(0, 0, 6, 18, 0xffff00);
    const h = gs.add.rectangle(0, 0, 18, 6, 0xffff00);
    power.add([v, h]);
    gs.tweens.add({ targets: power, scale: 1.1, yoyo: true, repeat: -1, duration: 800 });
    gs.powerUps.push({ sprite: power, type: 'ammo', spawnTime: time });
    gs.nextPowerUpSpawn = Infinity;
  });
  await ctx.page.waitForTimeout(200);
});

When('I spawn an ammo power-up offset by {int} {int} from the ship', async (dx, dy) => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.powerUps);
  await ctx.page.evaluate(({ dx, dy }) => {
    const gs = window.gameScene;
    const time = gs.time.now;
    const power = gs.add.container(gs.ship.x + dx, gs.ship.y + dy);
    const v = gs.add.rectangle(0, 0, 6, 18, 0xffff00);
    const h = gs.add.rectangle(0, 0, 18, 6, 0xffff00);
    power.add([v, h]);
    gs.tweens.add({ targets: power, scale: 1.1, yoyo: true, repeat: -1, duration: 800 });
    gs.powerUps.push({ sprite: power, type: 'ammo', spawnTime: time });
    gs.nextPowerUpSpawn = Infinity;
  }, { dx, dy });
  await ctx.page.waitForTimeout(200);
});

Then('the ammo should increase by {int}', async expected => {
  const ammo = await ctx.page.evaluate(() => window.gameScene.ammo);
  if (ammo !== ctx.initialAmmo + expected) {
    throw new Error(`Ammo did not increase by ${expected}`);
  }
});

Then('a power-up should be visible', async () => {
  const count = await ctx.page.evaluate(() => window.gameScene.powerUps.length);
  if (count === 0) {
    throw new Error('Power-up not visible');
  }
});

Then('no power-ups should be visible', async () => {
  const count = await ctx.page.evaluate(() => window.gameScene.powerUps.length);
  if (count !== 0) {
    throw new Error('Power-up still visible');
  }
});

When('I spawn a planet on the ship', async () => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.planets);
  await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    const pr = 100;
    const atmoKey = `bdd-atmo-${gs.planets.length}`;
    const atmoRadius = pr * 1.5;
    const size = atmoRadius * 2;
    const tex = gs.textures.createCanvas(atmoKey, size, size);
    const ctx2 = tex.getContext();
    const grad = ctx2.createRadialGradient(size / 2, size / 2, pr, size / 2, size / 2, atmoRadius);
    grad.addColorStop(0, 'rgba(102,102,255,0.6)');
    grad.addColorStop(1, 'rgba(102,102,255,0)');
    ctx2.fillStyle = grad;
    ctx2.beginPath();
    ctx2.arc(size / 2, size / 2, atmoRadius, 0, Math.PI * 2);
    ctx2.fill();
    tex.refresh();
    const atmo = gs.add.image(gs.ship.x, gs.ship.y, atmoKey);
    atmo.setDepth(-1);
    const p = gs.add.circle(gs.ship.x, gs.ship.y, pr, 0x6666ff);
    gs.planets.push({ sprite: p, radius: pr, atmosphere: atmo });
  });
});

When('I spawn a planet offset by {int} {int} from the ship', async (dx, dy) => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.planets);
  await ctx.page.evaluate(({ dx, dy }) => {
    const gs = window.gameScene;
    const pr = 100;
    const atmoKey = `bdd-atmo-${gs.planets.length}`;
    const atmoRadius = pr * 1.5;
    const size = atmoRadius * 2;
    const tex = gs.textures.createCanvas(atmoKey, size, size);
    const ctx2 = tex.getContext();
    const grad = ctx2.createRadialGradient(size / 2, size / 2, pr, size / 2, size / 2, atmoRadius);
    grad.addColorStop(0, 'rgba(102,102,255,0.6)');
    grad.addColorStop(1, 'rgba(102,102,255,0)');
    ctx2.fillStyle = grad;
    ctx2.beginPath();
    ctx2.arc(size / 2, size / 2, atmoRadius, 0, Math.PI * 2);
    ctx2.fill();
    tex.refresh();
    const atmo = gs.add.image(gs.ship.x + dx, gs.ship.y + dy, atmoKey);
    atmo.setDepth(-1);
    const p = gs.add.circle(gs.ship.x + dx, gs.ship.y + dy, pr, 0x6666ff);
    gs.planets.push({ sprite: p, radius: pr, atmosphere: atmo });
  }, { dx, dy });
});

Then('the planet radius should be {int}', async expected => {
  const radius = await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    const p = gs?.planets?.[gs.planets.length - 1];
    return p?.radius;
  });
  if (radius !== expected) {
    throw new Error(`Expected planet radius ${expected} but got ${radius}`);
  }
});

Then('planet atmospheres should be visible', async () => {
  const visible = await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    if (!gs || !gs.planets) return false;
    return gs.planets.every(p => {
      return p.atmosphere && p.atmosphere.alpha > 0 && p.atmosphere.visible;
    });
  });
  if (!visible) {
    throw new Error('Atmospheres not visible');
  }
});

When('I clear existing orbs', async () => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.orbs);
  await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    gs.orbs.forEach(o => o.sprite.destroy());
    gs.orbs = [];
  });
});

When('I spawn a stationary red orb offset by {int} {int} from the ship', async (dx, dy) => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.orbs);
  await ctx.page.evaluate(({ dx, dy }) => {
    const gs = window.gameScene;
    const orb = gs.add.circle(gs.ship.x + dx, gs.ship.y + dy, 20, 0xff0000);
    orb.setScale(1);
    gs.orbs.push({ sprite: orb, radius: 20, vx: 0, vy: 0, spawnTime: gs.time.now, growing: false });
  }, { dx, dy });
  await new Promise(r => setTimeout(r, 300));
});

Then('no orbs should be visible', async () => {
  const count = await ctx.page.evaluate(() => window.gameScene.orbs.length);
  if (count !== 0) {
    throw new Error('Orb still visible');
  }
});

When('I place the ship at {int} {int} with velocity {int} {int}', async (x, y, vx, vy) => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.ship);
  await ctx.page.evaluate(({ x, y, vx, vy }) => {
    const gs = window.gameScene;
    gs.ship.x = x;
    gs.ship.y = y;
    gs.velocity.x = vx;
    gs.velocity.y = vy;
  }, { x, y, vx, vy });
});

Then('the ship x velocity should be positive', async () => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.velocity);
  const vx = await ctx.page.evaluate(() => window.gameScene.velocity.x);
  if (vx <= 0) {
    throw new Error('Ship x velocity not positive');
  }
});

Then('the ship should be within the screen bounds', async () => {
  const pos = await ctx.page.evaluate(() => ({
    x: window.gameScene.ship.x,
    y: window.gameScene.ship.y,
    w: window.gameScene.scale.width,
    h: window.gameScene.scale.height
  }));
  if (pos.x < 0 || pos.x > pos.w || pos.y < 0 || pos.y > pos.h) {
    throw new Error('Ship out of bounds');
  }
});

Given('the trader spawn interval is {int} ms', async ms => {
  await ctx.page.evaluate(m => { window.traderInterval = m; }, ms);
});

When('I spawn the trader ship on the ship', async () => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.spawnTraderShip);
  await ctx.page.evaluate(() => {
    const gs = window.gameScene;
    gs.spawnTraderShip(gs.ship.x, gs.ship.y);
  });
  await ctx.page.waitForTimeout(50);
});

When('I record the trader ship position', async () => {
  await ctx.page.waitForFunction(() => window.gameScene?.traderShip);
  ctx.lastTraderPos = await ctx.page.evaluate(() => ({ x: window.gameScene.traderShip.x, y: window.gameScene.traderShip.y }));
});

Then('a trader ship should be visible', async () => {
  const visible = await ctx.page.evaluate(() => !!window.gameScene.traderShip);
  if (!visible) {
    throw new Error('Trader ship not visible');
  }
});

Then('the trader ship should have moved', async () => {
  await ctx.page.waitForFunction(() => window.gameScene?.traderShip);
  const pos = await ctx.page.evaluate(() => ({ x: window.gameScene.traderShip.x, y: window.gameScene.traderShip.y }));
  const dist = Math.hypot(pos.x - ctx.lastTraderPos.x, pos.y - ctx.lastTraderPos.y);
  if (dist < 2) {
    throw new Error('Trader ship did not move');
  }
});

Then('the docking banner should be visible', async () => {
  const display = await ctx.page.$eval('#dock-banner', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Dock banner not visible');
  }
});

Then('the docking banner should not be visible', async () => {
  const display = await ctx.page.$eval('#dock-banner', el => getComputedStyle(el).display);
  if (display !== 'none') {
    throw new Error('Dock banner should be hidden');
  }
});

When('I click the undock button', async () => {
  await ctx.page.click('#undock-btn');
});
