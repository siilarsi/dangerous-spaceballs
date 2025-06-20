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

When('I monitor the bad hit sound', async () => {
  await ctx.page.waitForFunction(() => window.sfx && window.sfx.bad);
  await ctx.page.evaluate(() => {
    const audio = window.sfx.bad;
    if (audio.__monitored) return;
    window.__badSoundPlayed = false;
    const orig = audio.play.bind(audio);
    audio.play = () => {
      window.__badSoundPlayed = true;
      return orig().catch(() => {});
    };
    audio.__monitored = true;
  });
});

Then('the bad hit sound should play', async () => {
  const played = await ctx.page.evaluate(() => window.__badSoundPlayed);
  if (!played) {
    throw new Error('Bad hit sound did not play');
  }
});
