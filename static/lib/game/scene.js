(function(){
  function create() {
    window.gameScene = this;
    // Create a slightly smaller ship using a polygon with an outline
    const shipPoints = [0, -20, 16, 16, 0, 8, -16, 16];
    this.ship = this.add.polygon(400, 300, shipPoints, 0x00ffff);
    this.ship.setStrokeStyle(2, 0xffffff);
    this.ship.setOrigin(0.5, 0.5);
    this.shipRadius = 16;

    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.isBoosting = false;
    this.isFiring = false;
    const stats = window.getCurrentStats();
    this.maxFuel = stats.fuel;
    this.fuel = stats.fuel;
    this.ammo = stats.ammo;
    this.boostThrust = stats.thrust;
    this.credits = 0;
    this.fireRate = stats.reload;
    this.lastFired = 0;
    this.bullets = [];
    this.gameOver = false;

    this.shield = stats.shield > 0;

    // Timer and power-ups
    this.timeRemaining = 60;
    this.powerUps = [];
    this.floatingTexts = [];
    this.nextPowerUpSpawn = 5000;
    this.powerUpSpawnRate = 8000; // milliseconds
    this.powerUpFadeDuration = 9500;
    this.urgentStarted = false;
    this.urgentInterval = null;
    this.urgencyOverlay = document.getElementById('urgency-overlay');

    // Orb management
    this.orbs = [];
    this.nextOrbSpawn = Infinity;
    this.orbSpawnRate = 3000; // milliseconds (unused)
    this.orbGrowthDuration = 500;
    this.orbSpeedMultiplier = 1;

    this.level = 1;
    const duration = window.levelDuration || 30000;
    this.levelDuration = duration;
    this.startTime = null;
    this.nextLevelTime = null;
    this.levelBanner = document.getElementById('level-banner');
    this.showLevelBanner = level => {
        this.levelBanner.textContent = `Level ${level}`;
        this.levelBanner.style.opacity = '1';
        setTimeout(() => {
            this.levelBanner.style.opacity = '0';
        }, 2000);
    };
    this.showLevelBanner(1);

    // Planet obstacle
    this.planets = [];
    this.gravityStrength = 3000;
    const pr = 120;
    const atmoRadius = pr * 1.5;
    const margin = atmoRadius + 20;
    let pos;
    do {
        pos = {
            x: Phaser.Math.Between(margin, this.scale.width - margin),
            y: Phaser.Math.Between(margin, this.scale.height - margin)
        };
    } while (
        Phaser.Math.Distance.Between(pos.x, pos.y, this.ship.x, this.ship.y) < 400 ||
        Math.abs(pos.y - this.ship.y) < 150
    );
    const atmoKey = 'atmo-0';
    const size = atmoRadius * 2;
    const tex = this.textures.createCanvas(atmoKey, size, size);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(size / 2, size / 2, pr, size / 2, size / 2, atmoRadius);
    grad.addColorStop(0, 'rgba(68,136,255,0.6)');
    grad.addColorStop(1, 'rgba(68,136,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, atmoRadius, 0, Math.PI * 2);
    ctx.fill();
    tex.refresh();
    const atmosphere = this.add.image(pos.x, pos.y, atmoKey);
    atmosphere.setDepth(-1);
    const planet = this.add.circle(pos.x, pos.y, pr, 0x4488ff);
    this.planets.push({ sprite: planet, radius: pr, atmosphere });

    // Power-up orbit parameters
    this.powerUpOrbitCenter = planet;
    this.powerUpOrbitRadius = pr + 60;
    this.powerUpAngularSpeed = 0.25; // radians per second
    this.powerUpOrbitDir = Math.random() < 0.5 ? 1 : -1;

    this.spawnOrb = (color, t) => {
        const x = Phaser.Math.Between(0, this.scale.width);
        const y = Phaser.Math.Between(0, this.scale.height);
        const radius = 16;
        const orb = this.add.circle(x, y, radius, color);
        orb.setStrokeStyle(2, 0xffffff);
        this.tweens.add({ targets: orb, scale: 1.2, yoyo: true, repeat: -1, duration: 800, delay: this.orbGrowthDuration });
        orb.setScale(0);
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const speed = 50 * this.orbSpeedMultiplier;
        this.orbs.push({
            sprite: orb,
            radius: radius,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            spawnTime: t,
            growing: true
        });
    };

    // Start with a single red orb on screen
    this.spawnOrb(0xff0000, 0);

    // Flame effect for boosting
    this.flame = this.add.triangle(0, 0, 0, 0, 5, 15, -5, 15, 0xffa500);
    this.flame.setOrigin(0.5, 0.5);
    this.flame.visible = false;

    // Handle orb collisions and scoring
    this.handleOrbHit = (color, x, y, time) => {
        if (color === 0xff0000) {
            this.streak += 1;
            this.score += 10 * this.streak;
            this.credits += 1;
            window.runCredits += 1;
            document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
                el.textContent = window.runCredits;
            });
            if (this.streak % 5 === 0) {
                const txt = this.add.text(x, y, `Streak ${this.streak}!`, { font: '20px Arial', color: '#ff00ff' });
                txt.setOrigin(0.5);
                this.floatingTexts.push({ sprite: txt, spawnTime: time });
            }
            sfx.good.currentTime = 0;
            sfx.good.play().catch(() => {});
        } else {
            this.score -= 5;
            this.streak = 0;
            sfx.bad.currentTime = 0;
            sfx.bad.play().catch(() => {});
        }
        sfx.explosion.currentTime = 0;
        sfx.explosion.play().catch(() => {});
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('credits').textContent = this.credits;
    };

    document.getElementById('ammo-count').textContent = this.ammo;
    document.getElementById('credits').textContent = this.credits;
    this.score = 0;
    this.streak = 0;
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
    document.getElementById('time-remaining').textContent = Math.ceil(this.timeRemaining);

    this.input.mouse.disableContextMenu();

    this.input.on('pointerdown', pointer => {
        if (pointer.button === 0 && this.ammo > 0) {
            this.isFiring = true;
        }
        if (pointer.button === 2 && this.fuel > 0) {
            this.isBoosting = true;
            sfx.boost.currentTime = 0;
            sfx.boost.play().catch(() => {});
        }
    });

    this.input.on('pointerup', pointer => {
        if (pointer.button === 0) {
            this.isFiring = false;
        }
        if (pointer.button === 2) {
            this.isBoosting = false;
            sfx.boost.pause();
            sfx.boost.currentTime = 0;
        }
    });

    // Reticle that follows the pointer
    this.reticle = this.add.graphics({ x: 400, y: 300 });
    this.reticle.lineStyle(1, 0xff0000);
    this.reticle.strokeCircle(0, 0, 10);
    this.reticle.lineBetween(-12, 0, 12, 0);
    this.reticle.lineBetween(0, -12, 0, 12);
    this.reticleCooldown = this.add.graphics({ x: 400, y: 300 });
    this.reticleCooldown.visible = false;
    this.reticleCooldownProgress = 1;

    this.input.on('pointermove', pointer => {
        this.reticle.x = pointer.x;
        this.reticle.y = pointer.y;
        this.reticleCooldown.x = pointer.x;
        this.reticleCooldown.y = pointer.y;
    });

    // Trader ship controls
    this.traderShip = null;
    this.traderSpawnInterval = window.traderInterval || 20000;
    this.nextTraderSpawn = this.traderSpawnInterval;
    function randomInventory(){
        const ids = window.shop.items.map(i => i.id);
        Phaser.Utils.Array.Shuffle(ids);
        const count = Phaser.Math.Between(2, ids.length);
        const inv = {};
        for(let i=0;i<count;i++){
            inv[ids[i]] = Phaser.Math.Between(1,3);
        }
        return inv;
    }

    this.spawnTraderShip = (x, y, dir = 1, inv = null) => {
        if (this.traderShip) this.traderShip.destroy();
        const container = this.add.container(x, y);
        const color = Phaser.Display.Color.RandomRGB().color;
        const body = this.add.rectangle(0, 0, 80, 30, color);
        body.setStrokeStyle(2, 0xffffff);
        const cockpit = this.add.triangle(40 * dir, 0, 0, -15, 30 * dir, 0, 0, 15, 0xcccccc);
        const wing1 = this.add.triangle(0, 0, -20 * dir, -15, -40 * dir, -5, -40 * dir, -25, color);
        const wing2 = this.add.triangle(0, 0, -20 * dir, 15, -40 * dir, 25, -40 * dir, 5, color);
        const flame = this.add.triangle(-50 * dir, 0, -10 * dir, -5, -20 * dir, 0, -10 * dir, 5, 0xffa500);
        container.add([body, cockpit, wing1, wing2, flame]);
        this.tweens.add({ targets: flame, scaleX: 1.5, yoyo: true, repeat: -1, duration: 300 });
        container.dir = dir;
        container.baseSpeed = 40;
        container.speed = container.baseSpeed;
        container.inventory = inv || randomInventory();
        this.traderShip = container;
    };
    window.spawnTraderShip = (x, y, dir, inv) => this.spawnTraderShip(x, y, dir, inv);

    // Docking helpers
    this.dockingStart = null;
    this.dockRing = this.add.graphics();
    this.dockRing.visible = false;
    this.dockBanner = document.getElementById('dock-banner');
    this.undockBtn = document.getElementById('undock-btn');
    this.shopOverlay = document.getElementById('shop-overlay');
    this.isDocked = false;

    this.abortDocking = () => {
        this.dockRing.clear();
        this.dockRing.visible = false;
        this.dockingStart = null;
    };

    this.startDocking = t => {
        this.dockingStart = t;
        this.dockRing.visible = true;
        this.dockRing.clear();
    };

    this.completeDocking = () => {
        this.abortDocking();
        this.isDocked = true;
        this.dockBanner.style.display = 'block';
        if(this.shopOverlay){
            this.shopOverlay.classList.add('open');
            updateShopStatsPanel();
            window.shop.render(this.traderShip.inventory);
        }
        window.pauseGame();
    };

    this.undock = () => {
        if (!this.isDocked) return;
        this.isDocked = false;
        this.dockBanner.style.display = 'none';
        if(this.shopOverlay){
            this.shopOverlay.classList.remove('open');
        }
        if(this.traderShip){
            this.traderShip.inventory = null;
        }
        window.shop.render(null);
        window.resumeGame();
    };

    this.undockBtn.addEventListener('click', this.undock);

}
  window.gameCreate = create;
})();
