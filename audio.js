(function(){
  const menuMusic = new Audio('sounds/music_menu.ogg');
  menuMusic.loop = true;
  menuMusic.volume = 0.6;

  const playTracks = [
    new Audio('sounds/music_play1.ogg'),
    new Audio('sounds/music_play2.ogg'),
    new Audio('sounds/music_play3.ogg')
  ];
  playTracks.forEach(t => { t.loop = true; t.volume = 0.6; });

  const sfx = {
    laser: new Audio('sounds/laser_shoot.ogg'),
    boost: new Audio('sounds/boost_loop.ogg'),
    good: new Audio('sounds/hit_good.ogg'),
    bad: new Audio('sounds/hit_bad.ogg'),
    pickup: new Audio('sounds/pickup.ogg'),
    tick: new Audio('sounds/tick.ogg'),
    timeout: new Audio('sounds/timeout.ogg'),
    crash: new Audio('sounds/crash.ogg'),
    explosion: new Audio('sounds/explosion.ogg'),
    destroyPickup: new Audio('sounds/destroy_pickup.ogg')
  };
  Object.values(sfx).forEach(a => { a.volume = 0.8; });
  sfx.boost.loop = true;

  function playTick() {
    sfx.tick.currentTime = 0;
    sfx.tick.play().catch(() => {});
  }

  window.audioElements = { menuMusic, playTracks, sfx };
  window.playTick = playTick;

  menuMusic.play().catch(() => {});
})();
