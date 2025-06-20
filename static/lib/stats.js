(function(){
  const baseStats = {
    maxFuel: 200,
    ammo: 50,
    boostThrust: 200,
    shieldDuration: 0
  };

  function getCurrentStats(){
    let fuel = baseStats.maxFuel;
    let ammo = baseStats.ammo;
    let thrust = baseStats.boostThrust;
    let shield = baseStats.shieldDuration;
    const active = [...(window.permanentUpgrades || []), ...(window.sessionUpgrades || [])];
    for (const id of active) {
      if (id === 'extra_fuel') fuel += 50;
      else if (id === 'max_ammo') ammo += 50;
      else if (id === 'shield') shield = 1;
    }
    return {fuel, ammo, thrust, shield};
  }

  function updateInventoryPanel(stats = getCurrentStats()){
    document.getElementById('inv-fuel').textContent = stats.fuel;
    document.getElementById('inv-ammo').textContent = stats.ammo;
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
      preview.fuel += 50;
    }else if(item.id === 'max_ammo'){
      statKey = 'ammo';
      preview.ammo += 50;
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

  window.baseStats = baseStats;
  window.getCurrentStats = getCurrentStats;
  window.updateInventoryPanel = updateInventoryPanel;
  window.clearPreview = clearPreview;
  window.previewUpgrade = previewUpgrade;
})();
