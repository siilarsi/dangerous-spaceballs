const { When, Then } = require('@cucumber/cucumber');
const ctx = require('./context');

Then('menu music should be playing', async () => {
  await ctx.page.waitForFunction(() => window.audioElements?.menuMusic);
  const exists = await ctx.page.evaluate(() => !!window.audioElements.menuMusic);
  if (!exists) {
    throw new Error('Menu music not initialized');
  }
});

Then('gameplay music should be playing', async () => {
  await ctx.page.waitForFunction(() => window.currentGameplayMusic);
  const exists = await ctx.page.evaluate(() => !!window.currentGameplayMusic);
  if (!exists) {
    throw new Error('Gameplay music not initialized');
  }
});

When('I hide the page', async () => {
  await ctx.page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
});

Then('gameplay music should be paused', async () => {
  const paused = await ctx.page.evaluate(() => window.currentGameplayMusic?.paused);
  if (!paused) {
    throw new Error('Music was not paused');
  }
});
