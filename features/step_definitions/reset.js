const { Then } = require('@cucumber/cucumber');
const ctx = require('./context');

Then('the reset button should be visible', async () => {
  const display = await ctx.page.$eval('#reset-progress', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Reset button not visible');
  }
});

Then('the reset button should not be visible', async () => {
  const display = await ctx.page.$eval('#reset-progress', el => getComputedStyle(el).display);
  if (display !== 'none') {
    throw new Error('Reset button should be hidden');
  }
});

Then('the reset warning should be visible', async () => {
  const display = await ctx.page.$eval('#reset-warning', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Reset warning not visible');
  }
});

Then('the reset warning should not be visible', async () => {
  const display = await ctx.page.$eval('#reset-warning', el => getComputedStyle(el).display);
  if (display !== 'none') {
    throw new Error('Reset warning should be hidden');
  }
});
