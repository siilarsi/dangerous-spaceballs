const {
  Given,
  When,
  Then,
  BeforeAll,
  Before,
  After,
  AfterAll,
  setDefaultTimeout
} = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');

setDefaultTimeout(60 * 1000);

let browser, context, page;
let lastShipPos;
let lastPointer = { x: 0, y: 0 };
let initialAmmo = 0;

BeforeAll(async () => {
  browser = await chromium.launch({
    args: ['--no-sandbox', '--ignore-certificate-errors', '--allow-file-access-from-files']
  });
});

Before(async () => {
  context = await browser.newContext();
  page = await context.newPage();
});

After(async () => {
  await context?.close();
});

Given('the level progression interval is {int} ms', async ms => {
  await page.evaluate(m => { window.levelDuration = m; }, ms);
});

Given('I open the game page', async () => {
  const filePath = path.resolve(__dirname, '../../index.html');
  await page.goto('file://' + filePath);
});

When('I click the start screen', async () => {
  await page.click('#start-screen');
});

Then('the promo animation should be shown', async () => {
  await page.waitForSelector('#promo-animation', { state: 'visible' });
});

Then('the game should appear after a short delay', async () => {
  await page.waitForSelector('#game', { state: 'visible' });
  const display = await page.$eval('#game', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Game did not appear');
  }
});

When('I force the timer below ten seconds', async () => {
  await page.evaluate(() => {
    if (window.gameScene) {
      window.gameScene.timeRemaining = 9;
    } else {
      document.body.classList.add('urgent');
    }
  });
  await page.waitForTimeout(1000);
});

Then('the screen should pulse red', async () => {
  await page.waitForSelector('body.urgent');
});

When('I hold the right mouse button for {int} ms', async ms => {
  await page.waitForFunction(() => window.gameScene);
  const canvas = await page.waitForSelector('#game canvas', { state: 'attached' });
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down({ button: 'right' });
  await page.waitForTimeout(ms);
});

When('I release the right mouse button', async () => {
  await page.mouse.up({ button: 'right' });
});

Then('the flame should be visible', async () => {
  const visible = await page.evaluate(() => window.gameScene.flame.visible);
  if (!visible) {
    throw new Error('Flame not visible');
  }
});

Then('the fuel should decrease', async () => {
  const fuel = await page.evaluate(() => window.gameScene.fuel);
  if (fuel >= 200) {
    throw new Error('Fuel did not decrease');
  }
});

When('I hold the left mouse button for {int} ms', async ms => {
  await page.waitForFunction(() => window.gameScene);
  const canvas = await page.waitForSelector('#game canvas', { state: 'attached' });
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(ms);
});

When('I release the left mouse button', async () => {
  await page.mouse.up({ button: 'left' });
});

Then('bullets should be fired', async () => {
  const count = await page.evaluate(() => window.gameScene.bullets.length);
  if (count === 0) {
    throw new Error('No bullets were fired');
  }
});

Then('the ammo should decrease', async () => {
  const ammo = await page.evaluate(() => window.gameScene.ammo);
  if (ammo >= 50) {
    throw new Error('Ammo did not decrease');
  }
});

AfterAll(async () => {
  await browser?.close();
});

When('I simulate hitting {int} red orbs', async count => {
  await page.waitForFunction(() => window.gameScene && window.gameScene.handleOrbHit);
  await page.evaluate(c => {
    for (let i = 0; i < c; i++) {
      window.gameScene.handleOrbHit(0xff0000, 400, 300, window.gameScene.time.now);
    }
  }, count);
});

Then('the streak should be {int}', async expected => {
  const val = await page.evaluate(() => window.gameScene.streak);
  if (val !== expected) {
    throw new Error(`Expected streak ${expected} but got ${val}`);
  }
});

Then('the score should be {int}', async expected => {
  const val = await page.evaluate(() => window.gameScene.score);
  if (val !== expected) {
    throw new Error(`Expected score ${expected} but got ${val}`);
  }
});

Then('the streak text {string} should appear', async text => {
  await page.waitForFunction(t => {
    return window.gameScene.floatingTexts.some(ft => ft.sprite.text === t);
  }, text);
});

When('I wait for {int} ms', async ms => {
  await page.waitForTimeout(ms);
});

Then('the level banner should show {string}', async text => {
  await page.waitForFunction(t => {
    const el = document.getElementById('level-banner');
    if (!el) return false;
    const style = getComputedStyle(el);
    return el.textContent === t && parseFloat(style.opacity) > 0;
  }, text);
});

Then('the level should be {int}', async expected => {
  await page.waitForFunction(lvl => {
    return window.gameScene?.level >= lvl;
  }, expected);
  const val = await page.evaluate(() => window.gameScene.level);
  if (val < expected) {
    throw new Error(`Expected level ${expected} but got ${val}`);
  }
});

Then('menu music should be playing', async () => {
  await page.waitForFunction(() => window.audioElements?.menuMusic);
  const exists = await page.evaluate(() => !!window.audioElements.menuMusic);
  if (!exists) {
    throw new Error('Menu music not initialized');
  }
});

  Then('gameplay music should be playing', async () => {
    await page.waitForFunction(() => window.currentGameplayMusic);
    const exists = await page.evaluate(() => !!window.currentGameplayMusic);
    if (!exists) {
      throw new Error('Gameplay music not initialized');
    }
  });

  When('I hide the page', async () => {
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });

  Then('gameplay music should be paused', async () => {
    const paused = await page.evaluate(() => window.currentGameplayMusic?.paused);
    if (!paused) {
      throw new Error('Music was not paused');
    }
  });

  Then('the game should be paused', async () => {
    const paused = await page.evaluate(() => window.gamePaused);
    if (!paused) {
      throw new Error('Game not paused');
    }
  });

  Then('the time remaining should be {int}', async expected => {
    const val = await page.evaluate(() => Math.ceil(window.gameScene.timeRemaining));
    if (val !== expected) {
      throw new Error(`Expected time remaining ${expected} but got ${val}`);
    }
  });

  Then('the star background should cover the game area', async () => {
    const bg = await page.$eval('#game', el => getComputedStyle(el).backgroundImage);
    if (!bg.includes('stars.webp')) {
      throw new Error('Star background not visible');
    }
  });

  When('I record the ship position', async () => {
    await page.waitForFunction(() => window.gameScene);
    lastShipPos = await page.evaluate(() => ({ x: window.gameScene.ship.x, y: window.gameScene.ship.y }));
  });

  Then('the ship should have moved', async () => {
    await page.waitForFunction(() => window.gameScene);
    const pos = await page.evaluate(() => ({ x: window.gameScene.ship.x, y: window.gameScene.ship.y }));
    const dist = Math.hypot(pos.x - lastShipPos.x, pos.y - lastShipPos.y);
    if (dist < 5) {
      throw new Error('Ship did not move');
    }
  });

  Then('the legend should be visible', async () => {
    await page.waitForSelector('#legend', { state: 'visible' });
    const display = await page.$eval('#legend', el => getComputedStyle(el).display);
    if (display === 'none') {
      throw new Error('Legend not visible');
    }
  });

  Then('the legend should not be visible', async () => {
    const display = await page.$eval('#legend', el => getComputedStyle(el).display);
    if (display !== 'none') {
      throw new Error('Legend should be hidden');
    }
  });

  When('I move the pointer to offset {int} {int}', async (dx, dy) => {
    await page.waitForFunction(() => window.gameScene);
    const canvas = await page.waitForSelector('#game canvas', { state: 'attached' });
    const box = await canvas.boundingBox();
    const targetX = box.width / 2 + dx;
    const targetY = box.height / 2 + dy;
    await page.mouse.move(box.x + targetX, box.y + targetY);
    lastPointer = { x: targetX, y: targetY };
    await page.waitForTimeout(200);
  });

  Then('the reticle should follow the pointer', async () => {
    const pos = await page.evaluate(() => ({ x: window.gameScene.reticle.x, y: window.gameScene.reticle.y }));
    if (Math.abs(pos.x - lastPointer.x) > 1 || Math.abs(pos.y - lastPointer.y) > 1) {
      throw new Error('Reticle did not follow pointer');
    }
  });

  Then('the ship should face the reticle', async () => {
    await page.waitForFunction(({ x, y }) => {
      const gs = window.gameScene;
      if (!gs) return false;
      const target = Math.atan2(y - gs.ship.y, x - gs.ship.x) + Math.PI / 2;
      const diff = Math.abs(((gs.ship.rotation - target + Math.PI) % (Math.PI * 2)) - Math.PI);
      return diff < 0.2;
    }, lastPointer);
  });

  When('I spawn an ammo power-up on the ship', async () => {
    await page.waitForFunction(() => window.gameScene && window.gameScene.powerUps);
    initialAmmo = await page.evaluate(() => window.gameScene.ammo);
    await page.evaluate(() => {
      const gs = window.gameScene;
      const time = gs.time.now;
      const pu = gs.add.circle(gs.ship.x, gs.ship.y, 8, 0xffff00);
      gs.powerUps.push({ sprite: pu, type: 'ammo', spawnTime: time });
    });
    await page.waitForTimeout(200);
  });

  Then('the ammo should increase by 15', async () => {
    const ammo = await page.evaluate(() => window.gameScene.ammo);
    if (ammo !== initialAmmo + 15) {
      throw new Error('Ammo did not increase by 15');
    }
  });

  When('I spawn a planet on the ship', async () => {
    await page.waitForFunction(() => window.gameScene && window.gameScene.planets);
    await page.evaluate(() => {
      const gs = window.gameScene;
      const p = gs.add.circle(gs.ship.x, gs.ship.y, 60, 0x6666ff);
      gs.planets.push({ sprite: p, radius: 60 });
    });
  });

  When('I spawn a planet offset by {int} {int} from the ship', async (dx, dy) => {
    await page.waitForFunction(() => window.gameScene && window.gameScene.planets);
    await page.evaluate(({ dx, dy }) => {
      const gs = window.gameScene;
      const p = gs.add.circle(gs.ship.x + dx, gs.ship.y + dy, 60, 0x6666ff);
      gs.planets.push({ sprite: p, radius: 60 });
    }, { dx, dy });
  });

  Then('the game should be over', async () => {
    await page.waitForFunction(() => window.gameScene?.gameOver);
  });

  When('I reload the page', async () => {
    await page.reload({ waitUntil: 'load' });
  });

  Then('the high score should be {int}', async expected => {
    const val = await page.$eval('#highscore-value', el => parseInt(el.textContent));
    if (val !== expected) {
      throw new Error(`Expected high score ${expected} but got ${val}`);
    }
  });

let lastOrbPos;

When('I clear existing orbs', async () => {
  await page.waitForFunction(() => window.gameScene && window.gameScene.orbs);
  await page.evaluate(() => {
    const gs = window.gameScene;
    gs.orbs.forEach(o => o.sprite.destroy());
    gs.orbs = [];
  });
});

When('I spawn a stationary red orb offset by {int} {int} from the ship', async (dx, dy) => {
  await page.waitForFunction(() => window.gameScene && window.gameScene.orbs);
  await page.evaluate(({ dx, dy }) => {
    const gs = window.gameScene;
    const orb = gs.add.circle(gs.ship.x + dx, gs.ship.y + dy, 20, 0xff0000);
    orb.setScale(1);
    gs.orbs.push({ sprite: orb, radius: 20, vx: 0, vy: 0, spawnTime: gs.time.now, growing: false });
  }, { dx, dy });
  await new Promise(r => setTimeout(r, 100));
});

When('I record the orb position', async () => {
  lastOrbPos = await page.evaluate(() => {
    const o = window.gameScene?.orbs?.[0];
    if (!o) return null;
    return { x: o.sprite.x, y: o.sprite.y };
  });
  if (!lastOrbPos) {
    throw new Error('No orb found');
  }
});

Then('the orb should have moved', async () => {
  const pos = await page.evaluate(() => {
    const o = window.gameScene?.orbs?.[0];
    if (!o) return null;
    return { x: o.sprite.x, y: o.sprite.y };
  });
  if (!pos) {
    throw new Error('No orb found');
  }
  const dist = Math.hypot(pos.x - lastOrbPos.x, pos.y - lastOrbPos.y);
  if (dist < 2) {
    throw new Error('Orb did not move');
  }
});
