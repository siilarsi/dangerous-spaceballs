const { BeforeAll, Before, After, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const ctx = require('./context');

setDefaultTimeout(60 * 1000);

BeforeAll(async () => {
  ctx.browser = await chromium.launch({
    args: ['--no-sandbox', '--ignore-certificate-errors', '--allow-file-access-from-files']
  });
});

Before(async () => {
  ctx.context = await ctx.browser.newContext();
  ctx.page = await ctx.context.newPage();
});

After(async () => {
  await ctx.context?.close();
});

AfterAll(async () => {
  await ctx.browser?.close();
});
