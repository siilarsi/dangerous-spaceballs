(function(){
  const { menuMusic, playTracks, sfx } = window.audioElements;
  window.gamePaused = false;

  const storedHigh = storage.getHighscore();
  document.getElementById('highscore-value').textContent = storedHigh;
  window.totalCredits = storage.getCredits();
  document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
    el.textContent = window.totalCredits;
  });

  window.permanentUpgrades = storage.getPermanentUpgrades();
  window.sessionUpgrades = storage.getSessionUpgrades();

  updateInventoryPanel();

  function resetProgress(){
    storage.resetAll();
    window.totalCredits = 0;
    window.permanentUpgrades = [];
    window.sessionUpgrades = [];
    document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => { el.textContent = 0; });
    document.getElementById('highscore-value').textContent = 0;
    updateInventoryPanel();
    shop.renderShop();
  }

  const gameOverBox = document.getElementById('game-over');
  function showGameOver(msg){
    const finalScore = window.gameScene?.score || 0;
    const prev = storage.getHighscore();
    if(finalScore > prev){
      storage.setHighscore(finalScore);
    }
    gameOverBox.textContent = msg;
    gameOverBox.style.display = 'flex';
    gameOverBox.onclick = () => window.location.reload();
  }

  function startGame(levelDurationMs = 15000){
    const config = {
      type: Phaser.AUTO,
      parent: 'game',
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      scene: {
        create: window.gameCreate,
        update: window.gameUpdate
      }
    };

    const game = new Phaser.Game(config);
    document.getElementById('fuel-container').style.display = 'block';
    document.getElementById('ammo-container').style.display = 'block';
    document.getElementById('credits-container').style.display = 'block';
    document.getElementById('score-container').style.display = 'block';
    document.getElementById('legend').style.display = 'block';

    window.addEventListener('resize', function(){
      game.scale.resize(window.innerWidth, window.innerHeight);
    });
  }

  document.getElementById('shop-tab').addEventListener('click', () => {
    shop.renderShop();
    document.getElementById('shop-panel').style.display = 'block';
  });
  document.getElementById('reset-progress').addEventListener('click', resetProgress);
  document.getElementById('close-shop').addEventListener('click', () => {
    document.getElementById('shop-panel').style.display = 'none';
  });
  document.getElementById('shop-panel').addEventListener('click', e => { e.stopPropagation(); });

  document.getElementById('start-screen').addEventListener('click', function(e){
    if(e.target.id === 'shop-tab' || e.target.closest('#shop-panel')){ return; }
    document.getElementById('start-screen').style.display = 'none';
    const promo = document.getElementById('promo-animation');
    promo.style.display = 'flex';
    menuMusic.pause();
    menuMusic.currentTime = 0;
    setTimeout(function(){
      promo.style.display = 'none';
      document.getElementById('game').style.display = 'block';
      window.currentGameplayMusic = playTracks[Math.floor(Math.random()*playTracks.length)];
      window.currentGameplayMusic.currentTime = 0;
      window.currentGameplayMusic.play().catch(()=>{});
      startGame(window.levelDuration);
    }, 3000);
  });

  function handleVisibility(){
    if(document.hidden){
      menuMusic.pause();
      window.currentGameplayMusic?.pause();
      sfx.boost.pause();
      sfx.boost.currentTime = 0;
      if(window.gameScene){
        window.gameScene.scene.pause();
        window.gamePaused = true;
      }
    }else{
      if(window.gameScene){
        window.gameScene.scene.resume();
        window.gamePaused = false;
      }
      if(document.getElementById('start-screen').style.display !== 'none'){
        menuMusic.play().catch(()=>{});
      }else if(window.currentGameplayMusic){
        window.currentGameplayMusic.play().catch(()=>{});
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibility);

  window.resetProgress = resetProgress;
  window.startGame = startGame;
  window.showGameOver = showGameOver;
})();
