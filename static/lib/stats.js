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

  function updateInventoryPanel(stats = getCurrentStats()){
    document.getElementById('inv-fuel').textContent = stats.fuel;
    document.getElementById('inv-ammo').textContent = stats.ammo;
    document.getElementById('inv-reload').textContent = stats.reload;
    document.getElementById('inv-thrust').textContent = stats.thrust;
    document.getElementById('inv-shield').textContent = stats.shield;
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
