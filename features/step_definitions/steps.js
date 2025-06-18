const { Given, When, Then, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const path = require('path');

setDefaultTimeout(60 * 1000);

let browser, page;

Given('I open the game page', async () => {
  browser = await chromium.launch();
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
  await page.waitForTimeout(3500);
  const display = await page.$eval('#game', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Game did not appear');
  }
});

AfterAll(async () => {
  await browser?.close();
});
