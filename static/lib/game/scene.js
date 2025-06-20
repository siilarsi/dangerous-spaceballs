(function(){
  function create() {
    window.gameScene = this;
    // Create a simple triangular ship using a polygon
    const shipPoints = [0, -20, 15, 20, -15, 20];
    this.ship = this.add.polygon(400, 300, shipPoints, 0xffffff);
    this.ship.setOrigin(0.5, 0.5);

    this.velocity = new Phaser.Math.Vector2(0, 0);
    this.isBoosting = false;
    this.isFiring = false;
    this.maxFuel = window.baseStats.maxFuel;
    this.fuel = this.maxFuel;
    this.ammo = window.baseStats.ammo;
    this.boostThrust = window.baseStats.boostThrust;
    this.credits = 0;
    this.fireRate = 100;
    this.lastFired = 0;
    this.bullets = [];
    this.gameOver = false;

    const active = new Set([...window.permanentUpgrades, ...window.sessionUpgrades]);
    this.shield = active.has('shield');
    if (active.has('extra_fuel')) {
        this.maxFuel += 50;
        this.fuel = this.maxFuel;
    }
    if (active.has('fast_reload')) {
        this.fireRate = 50;
    }
    if (active.has('max_ammo')) {
        this.ammo = 100;
    }

    // Timer and power-ups
    this.timeRemaining = 60;
    this.powerUps = [];
    this.floatingTexts = [];
    this.nextPowerUpSpawn = 5000;
    this.powerUpSpawnRate = 8000; // milliseconds
    this.powerUpFadeDuration = 12000;
    this.urgentStarted = false;
    this.urgentInterval = null;
    this.urgencyOverlay = document.getElementById('urgency-overlay');

    // Orb management
    this.orbs = [];
    this.nextOrbSpawn = 0;
    this.orbSpawnRate = 3000; // milliseconds
    this.orbGrowthDuration = 500;
    this.orbSpeedMultiplier = 1;

    this.level = 1;
    const duration = window.levelDuration || 15000;
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

    // Planet obstacles
    this.planets = [];
    this.gravityStrength = 3000;
    const pr = 100;
    const positions = [
        { x: pr, y: pr },
        { x: this.scale.width - pr, y: pr },
        { x: this.scale.width / 2, y: this.scale.height - pr }
    ];
    for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const atmoKey = `atmo-${i}`;
        const atmoRadius = pr * 1.5;
        const size = atmoRadius * 2;
        const tex = this.textures.createCanvas(atmoKey, size, size);
        const ctx = tex.getContext();
        const grad = ctx.createRadialGradient(size / 2, size / 2, pr, size / 2, size / 2, atmoRadius);
        grad.addColorStop(0, 'rgba(102,102,255,0.6)');
        grad.addColorStop(1, 'rgba(102,102,255,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, atmoRadius, 0, Math.PI * 2);
        ctx.fill();
        tex.refresh();
        const atmosphere = this.add.image(pos.x, pos.y, atmoKey);
        atmosphere.setDepth(-1);
        const planet = this.add.circle(pos.x, pos.y, pr, 0x6666ff);
        this.planets.push({ sprite: planet, radius: pr, atmosphere });
    }

    this.spawnOrb = (color, t) => {
        const x = Phaser.Math.Between(0, this.scale.width);
        const y = Phaser.Math.Between(0, this.scale.height);
        const radius = 20;
        const orb = this.add.circle(x, y, radius, color);
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
            window.totalCredits += 1;
            localStorage.setItem('credits', window.totalCredits);
            document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
                el.textContent = window.totalCredits;
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
            sfx.laser.currentTime = 0;
            sfx.laser.play().catch(() => {});
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

    this.input.on('pointermove', pointer => {
        this.reticle.x = pointer.x;
        this.reticle.y = pointer.y;
    });

}
  window.gameCreate = create;
})();
