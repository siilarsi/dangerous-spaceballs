const { Then, When } = require('@cucumber/cucumber');
const ctx = require('./context');

Then('the inventory panel should be visible', async () => {
  const display = await ctx.page.$eval('#inventory-panel', el => getComputedStyle(el).display);
  if (display === 'none') {
    throw new Error('Inventory panel not visible');
  }
});

Then('the inventory stat {string} should be {string}', async (label, expected) => {
  const actual = await ctx.page.evaluate(lbl => {
    const items = Array.from(document.querySelectorAll('#inventory-panel li'));
    const el = items.find(i => i.textContent.trim().toLowerCase().startsWith(lbl.toLowerCase()));
    return el ? el.querySelector('span').textContent.trim() : null;
  }, label);
  if (actual !== expected) {
    throw new Error(`Expected ${label} ${expected} but got ${actual}`);
  }
});

Then('the inventory stat icon for {string} should be {string}', async (label, expected) => {
  const actual = await ctx.page.evaluate(lbl => {
    const items = Array.from(document.querySelectorAll('#inventory-panel li'));
    const el = items.find(i => i.textContent.trim().toLowerCase().startsWith(lbl.toLowerCase()));
    if (!el) return null;
    const style = getComputedStyle(el, '::before').content;
    return style.replace(/^"|"$/g, '');
  }, label);
  if (actual !== expected) {
    throw new Error(`Expected icon ${expected} but got ${actual}`);
  }
});

When('I hover over the upgrade {string}', async name => {
  await ctx.page.$$eval('#shop-panel .shop-item', (items, n) => {
    const el = items.find(i => i.querySelector('.name').textContent.trim() === n);
    if (el) el.dispatchEvent(new Event('mouseenter', { bubbles: true }));
  }, name);
});

When('I stop hovering', async () => {
  await ctx.page.$$eval('#shop-panel .shop-item', items => {
    items.forEach(el => el.dispatchEvent(new Event('mouseleave', { bubbles: true })));
  });
});

Then('the inventory stat {string} should preview {string}', async (label, expected) => {
  const actual = await ctx.page.evaluate(lbl => {
    const items = Array.from(document.querySelectorAll('#inventory-panel li'));
    const el = items.find(i => i.textContent.trim().toLowerCase().startsWith(lbl.toLowerCase()));
    return el ? el.querySelector('span').textContent.trim() : null;
  }, label);
  if (actual !== expected) {
    throw new Error(`Expected preview ${expected} but got ${actual}`);
  }
});

Then('the inventory stat {string} should be highlighted', async label => {
  const highlighted = await ctx.page.evaluate(lbl => {
    const items = Array.from(document.querySelectorAll('#inventory-panel li'));
    const el = items.find(i => i.textContent.trim().toLowerCase().startsWith(lbl.toLowerCase()));
    return el ? el.classList.contains('highlight') : false;
  }, label);
  if (!highlighted) {
    throw new Error('Stat not highlighted');
  }
});
