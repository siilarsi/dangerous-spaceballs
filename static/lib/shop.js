(function(){
  const items = [
    { id: 'max_ammo', name: 'Increase Max Ammo', desc: 'Raise your ammo cap to 100.', icon: '🔫', cost: 5, permanent: true },
    { id: 'extra_fuel', name: 'Extra Starting Fuel', desc: 'Begin with additional fuel reserves.', icon: '⛽', cost: 3 },
    { id: 'fast_reload', name: 'Faster Reload', desc: 'Reduce time between shots.', icon: '⚡', cost: 4 },
    { id: 'shield', name: 'Temporary Shield', desc: 'Absorb the next hit you take.', icon: '🛡️', cost: 2, stock: 1 }
  ];

  // Expose items for tests and other modules
  window.shopItems = items;

  function renderShop(){
    const container = document.getElementById('shop-items');
    container.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shop-item';

      const icon = document.createElement('div');
      icon.className = 'icon';
      icon.textContent = item.icon;

      const info = document.createElement('div');
      info.className = 'info';
      const title = document.createElement('div');
      title.className = 'name';
      title.textContent = item.name;
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = item.desc;
      info.appendChild(title);
      info.appendChild(desc);

      const price = document.createElement('div');
      price.className = 'price-badge';
      price.textContent = item.cost;

      const btn = document.createElement('button');
      btn.className = 'buy-btn';
      btn.textContent = 'Buy';
      btn.onclick = () => purchase(item);

      div.onmouseenter = () => previewUpgrade(item);
      div.onmouseleave = () => clearPreview();
      btn.onfocus = () => previewUpgrade(item);
      btn.onblur = () => clearPreview();

      div.appendChild(icon);
      div.appendChild(info);
      div.appendChild(price);
      div.appendChild(btn);
      container.appendChild(div);
    });
  }

  function purchase(item){
    if(window.totalCredits >= item.cost && (!item.stock || item.stock > 0)){
      window.totalCredits -= item.cost;
      storage.setCredits(window.totalCredits);
      document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => { el.textContent = window.totalCredits; });
      if(item.permanent){
        if(!window.permanentUpgrades.includes(item.id)){
          window.permanentUpgrades.push(item.id);
          storage.setPermanentUpgrades(window.permanentUpgrades);
        }
      }else{
        window.sessionUpgrades.push(item.id);
        storage.setSessionUpgrades(window.sessionUpgrades);
      }
      if(item.stock) item.stock -= 1;
      renderShop();
      updateInventoryPanel();
      clearPreview();
    }
  }

  window.shop = { items, renderShop, purchase };
  // Provide globals for tests
  window.purchase = purchase;
})();
