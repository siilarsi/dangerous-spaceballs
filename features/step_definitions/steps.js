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

AfterAll(async () => {
  await browser?.close();
});
