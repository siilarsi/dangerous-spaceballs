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

  const resetBtn = document.getElementById('reset-progress');
  const resetWarning = document.getElementById('reset-warning');
  let confirmReset = false;

  function resetProgress(){
    storage.resetAll();
    window.totalCredits = 0;
    window.permanentUpgrades = [];
    window.sessionUpgrades = [];
    document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => { el.textContent = 0; });
    document.getElementById('highscore-value').textContent = 0;
    updateInventoryPanel();
  }

  function handleResetClick(){
    if(!confirmReset){
      confirmReset = true;
      resetWarning.style.display = 'block';
      return;
    }
    resetWarning.style.display = 'none';
    confirmReset = false;
    resetProgress();
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

  resetBtn.addEventListener('click', handleResetClick);

  document.getElementById('start-screen').addEventListener('click', function(){
    resetBtn.style.display = 'none';
    resetWarning.style.display = 'none';
    confirmReset = false;
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
