const { BeforeAll, Before, After, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const ctx = require('./context');

setDefaultTimeout(60 * 1000);

BeforeAll(async () => {
  ctx.browser = await chromium.launch({
    args: ['--no-sandbox', '--ignore-certificate-errors', '--allow-file-access-from-files']
  });
  ctx.context = await ctx.browser.newContext();
});

Before(async () => {
  ctx.page = await ctx.context.newPage();
});

After(async () => {
  try {
    if (ctx.page) {
      await ctx.page.close();
    }
  } catch {
    // ignore if already closed
  }
});

AfterAll(async () => {
  try {
    if (ctx.browser) {
      await ctx.browser.close();
    }
  } catch {
    // ignore if already closed
  }
});
