const { Then } = require('@cucumber/cucumber');
const ctx = require('./context');

Then('the shop overlay should be visible', async () => {
  const open = await ctx.page.$eval('#shop-overlay', el => el.classList.contains('open'));
  if (!open) {
    throw new Error('Shop overlay not visible');
  }
});

Then('the shop overlay should not be visible', async () => {
  const open = await ctx.page.$eval('#shop-overlay', el => el.classList.contains('open'));
  if (open) {
    throw new Error('Shop overlay should be hidden');
  }
});

Then('the shop credits should be {int}', async expected => {
  const val = await ctx.page.$eval('#shop-overlay .total-credits', el => parseInt(el.textContent));
  if (val !== expected) {
    throw new Error(`Expected credits ${expected} but got ${val}`);
  }
});

Then('the shop stat {string} should be {string}', async (label, expected) => {
  const actual = await ctx.page.evaluate(lbl => {
    const items = Array.from(document.querySelectorAll('#shop-overlay .stats li'));
    const el = items.find(i => i.textContent.trim().toLowerCase().startsWith(lbl.toLowerCase()));
    return el ? el.querySelector('span').textContent.trim() : null;
  }, label);
  if (actual !== expected) {
    throw new Error(`Expected ${label} ${expected} but got ${actual}`);
  }
});
