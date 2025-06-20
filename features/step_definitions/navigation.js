const { Given, When, Then } = require('@cucumber/cucumber');
const path = require('path');
const ctx = require('./context');

Given('I open the game page', async () => {
  const filePath = path.resolve(__dirname, '../../index.html');
  await ctx.page.goto('file://' + filePath);
});

Given('I open the game page with debug enabled', async () => {
  const filePath = path.resolve(__dirname, '../../index.html');
  await ctx.page.goto('file://' + filePath + '?debug=1');
});

When('I click the start screen', async () => {
  await ctx.page.click('#start-screen');
});

Then('the promo animation should be shown', async () => {
  await ctx.page.waitForSelector('#promo-animation', { state: 'visible' });
});

Then('the game should appear after a short delay', async () => {
  await ctx.page.waitForSelector('#game', { state: 'visible' });
  const display = await ctx.page.$eval('#game', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Game did not appear');
  }
});

When('I reload the page', async () => {
  await ctx.page.reload({ waitUntil: 'load' });
});

Then('the game should not be visible', async () => {
  const display = await ctx.page.$eval('#game', el => getComputedStyle(el).display);
  if (display !== 'none') {
    throw new Error('Game should not be visible');
  }
});
