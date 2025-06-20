(function(){
  const items = [
    { id: 'extra_fuel', name: 'Extra Fuel', cost: 5, desc: '+5 Fuel Capacity' },
    { id: 'max_ammo', name: 'Max Ammo', cost: 5, desc: '+5 Ammo Limit' },
    { id: 'fast_reload', name: 'Fast Reload', cost: 5, desc: 'Reload 2% faster' },
    { id: 'shield', name: 'Shield', cost: 5, desc: 'Start with a shield' }
  ];

  let currentInventory = null;

  function purchase(item){
    if(item && currentInventory && currentInventory[item.id] !== undefined){
      if(currentInventory[item.id] <= 0) return false;
    }
    if(window.runCredits < item.cost) return false;
    window.runCredits -= item.cost;
    document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
      el.textContent = window.runCredits;
    });
    window.permanentUpgrades.push(item.id);
    storage.setPermanentUpgrades(window.permanentUpgrades);
    if(currentInventory && currentInventory[item.id] !== undefined){
      currentInventory[item.id] -= 1;
    }
    updateInventoryPanel();
    updateShopStatsPanel();
    buildList();
    return true;
  }

  function buildList(inventory){
    if(inventory !== undefined) currentInventory = inventory;
    const container = document.getElementById('shop-items');
    if(!container) return;
    container.innerHTML = '';
    const list = currentInventory ? items.filter(it => currentInventory[it.id] !== undefined) : items;
    for(const item of list){
      const li = document.createElement('li');
      li.className = 'shop-item';
      const icon = document.createElement('span');
      icon.className = 'icon';
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = item.name;
      const desc = document.createElement('span');
      desc.className = 'desc';
      desc.textContent = item.desc;
      const price = document.createElement('span');
      price.className = 'price-badge';
      price.textContent = item.cost;
      const btn = document.createElement('button');
      btn.className = 'buy-btn';
      btn.textContent = 'Buy';
      btn.addEventListener('click', () => purchase(item));
      const stock = currentInventory ? currentInventory[item.id] : Infinity;
      if(stock <= 0){
        li.classList.add('sold-out');
        btn.disabled = true;
        btn.textContent = 'Sold Out';
      }
      li.appendChild(icon);
      li.appendChild(name);
      li.appendChild(desc);
      li.appendChild(price);
      li.appendChild(btn);
      li.addEventListener('mouseenter', () => previewUpgrade(item));
      li.addEventListener('mouseleave', clearPreview);
      container.appendChild(li);
    }
  }

  window.shop = { items, purchase, render: buildList };
})();
