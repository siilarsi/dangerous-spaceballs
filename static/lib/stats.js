(function(){
  const baseStats = {
    maxFuel: 50,
    ammo: 25,
    boostThrust: 100,
    reloadTime: 3500,
    shieldDuration: 0
  };

  function getCurrentStats(){
    let fuel = baseStats.maxFuel;
    let ammo = baseStats.ammo;
    let thrust = baseStats.boostThrust;
    let reload = baseStats.reloadTime;
    let shield = baseStats.shieldDuration;
    const active = [...(window.permanentUpgrades || []), ...(window.sessionUpgrades || [])];
    for (const id of active) {
      if (id === 'extra_fuel') fuel += 25;
      else if (id === 'max_ammo') ammo += 25;
      else if (id === 'boost_thrust') thrust += 25;
      else if (id === 'fast_reload') reload = Math.max(200, reload - 200);
      else if (id === 'shield') shield = 1;
    }
    return {fuel, ammo, thrust, reload, shield};
  }

  function getCreditInvestments(){
    const map = {};
    if(window.shop?.items){
      for(const it of window.shop.items){
        map[it.id] = it.cost;
      }
    }
    const active = [...(window.permanentUpgrades || []), ...(window.sessionUpgrades || [])];
    const invest = { fuel: 0, ammo: 0, reload: 0, thrust: 0, shield: 0 };
    for(const id of active){
      if(id === 'extra_fuel') invest.fuel += map[id] || 0;
      else if(id === 'max_ammo') invest.ammo += map[id] || 0;
      else if(id === 'boost_thrust') invest.thrust += map[id] || 0;
      else if(id === 'fast_reload') invest.reload += map[id] || 0;
      else if(id === 'shield') invest.shield += map[id] || 0;
    }
    return invest;
  }

  function updateInventoryPanel(stats = getCurrentStats(), invest = getCreditInvestments()){
    document.getElementById('inv-fuel').textContent = stats.fuel;
    document.getElementById('inv-fuel-invested').textContent = invest.fuel;
    document.getElementById('inv-ammo').textContent = stats.ammo;
    document.getElementById('inv-ammo-invested').textContent = invest.ammo;
    document.getElementById('inv-reload').textContent = stats.reload;
    document.getElementById('inv-reload-invested').textContent = invest.reload;
    document.getElementById('inv-thrust').textContent = stats.thrust;
    document.getElementById('inv-thrust-invested').textContent = invest.thrust;
    document.getElementById('inv-shield').textContent = stats.shield;
    document.getElementById('inv-shield-invested').textContent = invest.shield;
  }

  function clearPreview(){
    document.querySelectorAll('#inventory-panel li').forEach(li => li.classList.remove('highlight'));
    updateInventoryPanel();
  }

  function previewUpgrade(item){
    clearPreview();
    const current = getCurrentStats();
    const preview = { ...current };
    let statKey;
    if(item.id === 'extra_fuel'){
      statKey = 'fuel';
      preview.fuel += 25;
    }else if(item.id === 'max_ammo'){
      statKey = 'ammo';
      preview.ammo += 25;
    }else if(item.id === 'boost_thrust'){
      statKey = 'thrust';
      preview.thrust += 25;
    }else if(item.id === 'fast_reload'){
      statKey = 'reload';
      preview.reload = Math.max(200, preview.reload - 200);
    }else if(item.id === 'shield'){
      statKey = 'shield';
      preview.shield = 1;
    }else{
      return;
    }
    updateInventoryPanel(preview);
    const li = document.querySelector(`#inventory-panel li.${statKey}`);
    if(li){
      li.classList.add('highlight');
      const span = li.querySelector('span');
      span.textContent = `${current[statKey]} → ${preview[statKey]}`;
    }
  }

  function updateShopStatsPanel(stats = getCurrentStats()){
    const map = {
      fuel: 'shop-fuel',
      ammo: 'shop-ammo',
      thrust: 'shop-thrust',
      reload: 'shop-reload'
    };
    for(const key in map){
      const el = document.getElementById(map[key]);
      if(el) el.textContent = stats[key];
    }
  }

  window.baseStats = baseStats;
  window.getCurrentStats = getCurrentStats;
  window.updateInventoryPanel = updateInventoryPanel;
  window.updateShopStatsPanel = updateShopStatsPanel;
  window.clearPreview = clearPreview;
  window.previewUpgrade = previewUpgrade;
})();
