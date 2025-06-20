(function(){
  const menuMusic = new Audio('static/sounds/music_menu.ogg');
  menuMusic.loop = true;
  menuMusic.volume = 0.6;

  const playTracks = [
    new Audio('static/sounds/music_play1.ogg'),
    new Audio('static/sounds/music_play2.ogg'),
    new Audio('static/sounds/music_play3.ogg')
  ];
  playTracks.forEach(t => { t.loop = true; t.volume = 0.6; });

  const sfx = {
    laser: new Audio('static/sounds/laser_shoot.ogg'),
    boost: new Audio('static/sounds/boost_loop.ogg'),
    good: new Audio('static/sounds/hit_good.ogg'),
    bad: new Audio('static/sounds/hit_bad.ogg'),
    pickup: new Audio('static/sounds/pickup.ogg'),
    crash: new Audio('static/sounds/crash.ogg'),
    explosion: new Audio('static/sounds/explosion.ogg'),
    destroyPickup: new Audio('static/sounds/destroy_pickup.ogg')
  };
  Object.values(sfx).forEach(a => { a.volume = 0.8; });
  sfx.boost.loop = true;

  window.audioElements = { menuMusic, playTracks, sfx };
  window.sfx = sfx;

  menuMusic.play().catch(() => {});
})();
