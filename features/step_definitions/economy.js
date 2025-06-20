const { Given, When, Then } = require('@cucumber/cucumber');
const ctx = require('./context');

When('I open the shop tab', async () => {
  await ctx.page.click('#shop-tab');
});

Then('the shop should list upgrades', async () => {
  await ctx.page.waitForSelector('#shop-overlay .shop-item');
});

Then('each upgrade should appear as a card', async () => {
  await ctx.page.waitForSelector('#shop-overlay .shop-item');
  const ok = await ctx.page.$$eval('#shop-overlay .shop-item', items =>
    items.every(i =>
      i.querySelector('.icon') &&
      i.querySelector('.desc') &&
      i.querySelector('.price-badge') &&
      i.querySelector('.buy-btn')
    )
  );
  if (!ok) {
    throw new Error('Upgrade cards not rendered correctly');
  }
});

Given('I have {int} credits', async count => {
  await ctx.page.evaluate(c => {
    localStorage.setItem('credits', c);
    window.totalCredits = c;
    document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => { el.textContent = c; });
  }, count);
});

When('I simulate hitting {int} red orbs', async count => {
  await ctx.page.waitForFunction(() => window.gameScene && window.gameScene.handleOrbHit);
  await ctx.page.evaluate(c => {
    for (let i = 0; i < c; i++) {
      window.gameScene.handleOrbHit(0xff0000, 400, 300, window.gameScene.time.now);
    }
  }, count);
});

When('I buy the upgrade {string}', async name => {
  await ctx.page.evaluate(n => {
    const item = window.shop.items.find(i => i.name === n);
    if (item) window.shop.purchase(item);
  }, name);
});

When('I click buy on the upgrade {string}', async name => {
  await ctx.page.$$eval('#shop-overlay .shop-item', (items, n) => {
    const el = items.find(i => i.querySelector('.name').textContent.trim() === n);
    el.querySelector('.buy-btn').click();
  }, name);
});

Then('my ammo should be {int}', async expected => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const val = await ctx.page.evaluate(() => window.gameScene.ammo);
  if (val !== expected) {
    throw new Error(`Expected ammo ${expected} but got ${val}`);
  }
});

Then('the shield should be active', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const val = await ctx.page.evaluate(() => window.gameScene.shield);
  if (!val) {
    throw new Error('Shield not active');
  }
});

Then('the shield should not be active', async () => {
  await ctx.page.waitForFunction(() => window.gameScene);
  const val = await ctx.page.evaluate(() => window.gameScene.shield);
  if (val) {
    throw new Error('Shield should not be active');
  }
});

Then('the credits should be {int}', async expected => {
  const val = await ctx.page.evaluate(() => window.gameScene.credits);
  if (val !== expected) {
    throw new Error(`Expected credits ${expected} but got ${val}`);
  }
});

Then('the score should be {int}', async expected => {
  const val = await ctx.page.evaluate(() => window.gameScene.score);
  if (val !== expected) {
    throw new Error(`Expected score ${expected} but got ${val}`);
  }
});

Then('the streak should be {int}', async expected => {
  const val = await ctx.page.evaluate(() => window.gameScene.streak);
  if (val !== expected) {
    throw new Error(`Expected streak ${expected} but got ${val}`);
  }
});

Then('the streak text {string} should appear', async text => {
  await ctx.page.waitForFunction(t => {
    return window.gameScene.floatingTexts.some(ft => ft.sprite.text === t);
  }, text);
});

Then('the floating text {string} should appear', async text => {
  await ctx.page.waitForFunction(t => {
    return window.gameScene.floatingTexts.some(ft => ft.sprite.text === t);
  }, text);
});

Given('the high score is {int}', async val => {
  await ctx.page.evaluate(score => {
    localStorage.setItem('highscore', score);
    document.getElementById('highscore-value').textContent = score;
  }, val);
});

Then('the high score should be {int}', async expected => {
  const val = await ctx.page.$eval('#highscore-value', el => parseInt(el.textContent));
  if (val !== expected) {
    throw new Error(`Expected high score ${expected} but got ${val}`);
  }
});

When('I click the reset button', async () => {
  await ctx.page.click('#reset-progress');
});

Then('the displayed credits should be {int}', async expected => {
  const val = await ctx.page.$eval('#start-credits-value', el => parseInt(el.textContent));
  if (val !== expected) {
    throw new Error(`Expected credits ${expected} but got ${val}`);
  }
});

Then('no permanent upgrades should be stored', async () => {
  const count = await ctx.page.evaluate(() => {
    return JSON.parse(localStorage.getItem('permanentUpgrades') || '[]').length;
  });
  if (count !== 0) {
    throw new Error('Permanent upgrades not cleared');
  }
});
