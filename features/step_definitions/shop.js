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

Then('the upgrade {string} should show Sold Out', async name => {
  const state = await ctx.page.$$eval('#shop-overlay .shop-item', (items, n) => {
    const el = items.find(i => i.querySelector('.name').textContent.trim() === n);
    return el ? el.classList.contains('sold-out') && el.querySelector('.buy-btn').textContent.includes('Sold') : false;
  }, name);
  if(!state){
    throw new Error('Sold out state not shown');
  }
});

Then('the upgrade {string} should not show Sold Out', async name => {
  const state = await ctx.page.$$eval('#shop-overlay .shop-item', (items, n) => {
    const el = items.find(i => i.querySelector('.name').textContent.trim() === n);
    return el ? el.classList.contains('sold-out') : false;
  }, name);
  if(state){
    throw new Error('Unexpected sold out state');
  }
});

Then('the shop should list at most {int} upgrades', async max => {
  const count = await ctx.page.$$eval('#shop-overlay .shop-item', items => items.length);
  if(count > max){
    throw new Error(`Expected at most ${max} items but got ${count}`);
  }
});

Then('the shop overlay width should be at least {int} px', async min => {
  const width = await ctx.page.$eval('#shop-overlay', el => parseInt(getComputedStyle(el).width));
  if (width < min) {
    throw new Error(`Expected width at least ${min} but got ${width}`);
  }
});
