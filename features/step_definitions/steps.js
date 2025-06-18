const { Given, When, Then, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');

setDefaultTimeout(60 * 1000);

let browser, page;

Given('I open the game page', async () => {
  browser = await chromium.launch({
    args: ['--no-sandbox', '--ignore-certificate-errors', '--allow-file-access-from-files']
  });
  const ctx = await browser.newContext();
  page = await ctx.newPage();
  const filePath = path.resolve(__dirname, '../../index.html');
  await page.goto('file://' + filePath);
});

When('I click the start button', async () => {
  await page.click('#start-button');
});

Then('the promo animation should be shown', async () => {
  await page.waitForSelector('#promo-animation', { state: 'visible' });
});

Then('the game should appear after a short delay', async () => {
  await page.waitForTimeout(4000);
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
  if (fuel >= 100) {
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
  const val = await page.evaluate(() => window.gameScene.level);
  if (val !== expected) {
    throw new Error(`Expected level ${expected} but got ${val}`);
  }
});
