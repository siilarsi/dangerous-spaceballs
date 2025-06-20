(function(){
  function update(time, delta){
    if (this.startTime === null) {
        this.startTime = time;
        this.nextLevelTime = time + this.levelDuration;
    }
    if (this.gameOver) {
        return;
    }
    // Smoothly rotate the ship to face the pointer
    const targetAngle = Phaser.Math.Angle.Between(
        this.ship.x,
        this.ship.y,
        this.reticle.x,
        this.reticle.y
    );
    this.ship.rotation = Phaser.Math.Angle.RotateTo(
        this.ship.rotation,
        targetAngle + Math.PI / 2,
        0.05
    );

    const deltaSeconds = delta / 1000;
    const noseAngle = this.ship.rotation - Math.PI / 2;

    // Countdown timer
    this.timeRemaining -= deltaSeconds;
    if (this.timeRemaining <= 0) {
        clearInterval(this.urgentInterval);
        if (this.urgencyOverlay) this.urgencyOverlay.style.opacity = '0';
        sfx.timeout.currentTime = 0;
        sfx.timeout.play().catch(() => {});
        window.currentGameplayMusic?.pause();
        sfx.boost.pause();
        sfx.boost.currentTime = 0;
        showGameOver('Game Over! Your time ran out.');
        this.gameOver = true;
        return;
    }
    if (this.timeRemaining <= 10) {
        if (!this.urgentStarted) {
            this.urgentStarted = true;
            this.urgentInterval = setInterval(playTick, 2000);
        }
        const intensity = 1 - Math.max(0, this.timeRemaining) / 10;
        if (this.urgencyOverlay) {
            this.urgencyOverlay.style.opacity = (intensity * 0.7).toFixed(2);
        }
    } else if (this.urgentStarted) {
        this.urgentStarted = false;
        clearInterval(this.urgentInterval);
        if (this.urgencyOverlay) this.urgencyOverlay.style.opacity = '0';
    }

    if (this.isFiring && this.ammo > 0 && time > this.lastFired + this.fireRate) {
        const angle = Phaser.Math.Angle.Between(this.ship.x, this.ship.y, this.reticle.x, this.reticle.y);
        const bullet = this.add.rectangle(this.ship.x, this.ship.y, 8, 4, 0xff0000);
        bullet.setStrokeStyle(1, 0xffffff);
        bullet.setBlendMode(Phaser.BlendModes.ADD);
        const speed = 600;
        this.bullets.push({ sprite: bullet, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
        this.lastFired = time;
        this.ammo -= 1;
        sfx.laser.currentTime = 0;
        sfx.laser.play().catch(() => {});
    }

    if (this.isBoosting && this.fuel > 0) {
        const accel = this.boostThrust;
        this.velocity.x += Math.cos(noseAngle) * accel * deltaSeconds;
        this.velocity.y += Math.sin(noseAngle) * accel * deltaSeconds;
        this.fuel -= 12 * deltaSeconds;
        if (this.fuel < 0) {
            this.fuel = 0;
            this.isBoosting = false;
        }
    }
    if (!this.isBoosting || this.fuel <= 0) {
        sfx.boost.pause();
        sfx.boost.currentTime = 0;
    }

    this.flame.visible = this.isBoosting && this.fuel > 0;
    if (this.flame.visible) {
        this.flame.rotation = this.ship.rotation;
        this.flame.x = this.ship.x - Math.cos(noseAngle) * 20;
        this.flame.y = this.ship.y - Math.sin(noseAngle) * 20;
    }

    for (let p of this.planets) {
        const dx = p.sprite.x - this.ship.x;
        const dy = p.sprite.y - this.ship.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 1) {
            const acc = this.gravityStrength / distSq;
            this.velocity.x += dx * acc * deltaSeconds;
            this.velocity.y += dy * acc * deltaSeconds;
        }
    }

    for (let o of this.orbs) {
        for (let p of this.planets) {
            const dx = p.sprite.x - o.sprite.x;
            const dy = p.sprite.y - o.sprite.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 1) {
                const acc = this.gravityStrength / distSq;
                o.vx += dx * acc * deltaSeconds;
                o.vy += dy * acc * deltaSeconds;
            }
        }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.sprite.x += b.vx * deltaSeconds;
        b.sprite.y += b.vy * deltaSeconds;
        // Check collision with orbs
        for (let j = this.orbs.length - 1; j >= 0; j--) {
            const o = this.orbs[j];
            const r = o.radius * o.sprite.scaleX;
            const dx = b.sprite.x - o.sprite.x;
            const dy = b.sprite.y - o.sprite.y;
            if (dx * dx + dy * dy <= r * r) {
                this.handleOrbHit(o.sprite.fillColor, o.sprite.x, o.sprite.y, time);
                o.sprite.destroy();
                this.orbs.splice(j, 1);
                b.sprite.destroy();
                this.bullets.splice(i, 1);
                break;
            }
        }
        for (let p of this.planets) {
            const dxp = b.sprite.x - p.sprite.x;
            const dyp = b.sprite.y - p.sprite.y;
            if (dxp * dxp + dyp * dyp <= p.radius * p.radius) {
                b.sprite.destroy();
                this.bullets.splice(i, 1);
                break;
            }
        }
        if (b.sprite.x < 0 || b.sprite.x > this.scale.width || b.sprite.y < 0 || b.sprite.y > this.scale.height) {
            b.sprite.destroy();
            this.bullets.splice(i, 1);
        }
    }

    if (time > this.nextPowerUpSpawn) {
        const x = Phaser.Math.Between(20, this.scale.width - 20);
        const y = Phaser.Math.Between(20, this.scale.height - 20);
        const type = Phaser.Math.RND.pick(['ammo', 'fuel', 'time']);
        let color = 0xffff00;
        if (type === 'fuel') color = 0xffa500;
        if (type === 'time') color = 0x00ff00;
        const chest = this.add.container(x, y);
        const base = this.add.rectangle(0, 4, 24, 13, 0x8b4513);
        const lid = this.add.rectangle(0, -5, 24, 7, color);
        chest.add([base, lid]);
        chest.setAlpha(1);
        this.powerUps.push({ sprite: chest, type: type, spawnTime: time });
        this.nextPowerUpSpawn = time + this.powerUpSpawnRate;
    }

    if (time > this.nextLevelTime) {
        this.level += 1;
        this.nextLevelTime += this.levelDuration;
        this.orbSpeedMultiplier *= 1.2;
        for (const o of this.orbs) {
            o.vx *= 1.2;
            o.vy *= 1.2;
        }
        this.spawnOrb(0x0000ff, time);
        this.showLevelBanner(this.level);
    }

    if (time > this.nextOrbSpawn) {
        const color = Math.random() < 0.5 ? 0xff0000 : 0x0000ff;
        this.spawnOrb(color, time);
        this.nextOrbSpawn = time + this.orbSpawnRate;
    }

    for (let i = this.orbs.length - 1; i >= 0; i--) {
        const o = this.orbs[i];
        const radius = o.radius;
        if (o.growing) {
            const progress = Math.min(1, (time - o.spawnTime) / this.orbGrowthDuration);
            o.sprite.setScale(progress);
            if (progress >= 1) {
                o.growing = false;
            }
        } else {
            o.sprite.x += o.vx * deltaSeconds;
            o.sprite.y += o.vy * deltaSeconds;

            if (o.sprite.x - radius <= 0 && o.vx < 0) {
                o.vx *= -1;
                o.sprite.x = radius;
            } else if (o.sprite.x + radius >= this.scale.width && o.vx > 0) {
                o.vx *= -1;
                o.sprite.x = this.scale.width - radius;
            }
            if (o.sprite.y - radius <= 0 && o.vy < 0) {
                o.vy *= -1;
                o.sprite.y = radius;
            } else if (o.sprite.y + radius >= this.scale.height && o.vy > 0) {
                o.vy *= -1;
                o.sprite.y = this.scale.height - radius;
            }
        }
        for (let p of this.planets) {
            const dxp = o.sprite.x - p.sprite.x;
            const dyp = o.sprite.y - p.sprite.y;
            if (dxp * dxp + dyp * dyp <= (radius * o.sprite.scaleX + p.radius) * (radius * o.sprite.scaleX + p.radius)) {
                sfx.bad.currentTime = 0;
                sfx.bad.play().catch(() => {});
                o.sprite.destroy();
                this.orbs.splice(i, 1);
                break;
            }
        }
        // Check ship collision
        const shipR = 20;
        const dx = this.ship.x - o.sprite.x;
        const dy = this.ship.y - o.sprite.y;
        if (dx * dx + dy * dy <= (shipR + radius * o.sprite.scaleX) * (shipR + radius * o.sprite.scaleX)) {
            if (this.shield) {
                this.shield = false;
                window.sessionUpgrades = window.sessionUpgrades.filter(u => u !== 'shield');
                sessionStorage.setItem('sessionUpgrades', JSON.stringify(window.sessionUpgrades));
                o.sprite.destroy();
                this.orbs.splice(i, 1);
            } else {
                clearInterval(this.urgentInterval);
                if (this.urgencyOverlay) this.urgencyOverlay.style.opacity = '0';
                sfx.crash.currentTime = 0;
                sfx.crash.play().catch(() => {});
                sfx.explosion.currentTime = 0;
                sfx.explosion.play().catch(() => {});
                window.currentGameplayMusic?.pause();
                sfx.boost.pause();
                sfx.boost.currentTime = 0;
                showGameOver('Game Over! You died.');
                this.gameOver = true;
                return;
            }
        }
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const p = this.powerUps[i];
        const progress = (time - p.spawnTime) / this.powerUpFadeDuration;
        p.sprite.setAlpha(1 - progress);
        if (progress >= 1) {
            p.sprite.destroy();
            this.powerUps.splice(i, 1);
            continue;
        }
        const dxP = this.ship.x - p.sprite.x;
        const dyP = this.ship.y - p.sprite.y;
        if (dxP * dxP + dyP * dyP <= 28 * 28) {
            if (p.type === 'ammo') this.ammo += 15;
            if (p.type === 'fuel') this.fuel = Math.min(this.maxFuel, this.fuel + 25);
            if (p.type === 'time') this.timeRemaining += 15;
            const txt = this.add.text(p.sprite.x, p.sprite.y, '+15', { font: '16px Arial', color: '#ffffff' });
            txt.setOrigin(0.5);
            this.floatingTexts.push({ sprite: txt, spawnTime: time });
            sfx.pickup.currentTime = 0;
            sfx.pickup.play().catch(() => {});
            p.sprite.destroy();
            this.powerUps.splice(i, 1);
        }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        const prog = (time - ft.spawnTime) / 1000;
        ft.sprite.y -= deltaSeconds * 20;
        ft.sprite.setAlpha(1 - prog);
        if (prog >= 1) {
            ft.sprite.destroy();
            this.floatingTexts.splice(i, 1);
        }
    }

    this.ship.x += this.velocity.x * deltaSeconds;
    this.ship.y += this.velocity.y * deltaSeconds;

    for (let p of this.planets) {
        const dxp = this.ship.x - p.sprite.x;
        const dyp = this.ship.y - p.sprite.y;
        const shipR = 20;
        if (dxp * dxp + dyp * dyp <= (shipR + p.radius) * (shipR + p.radius)) {
            if (this.shield) {
                this.shield = false;
                window.sessionUpgrades = window.sessionUpgrades.filter(u => u !== 'shield');
                sessionStorage.setItem('sessionUpgrades', JSON.stringify(window.sessionUpgrades));
            } else {
                clearInterval(this.urgentInterval);
                if (this.urgencyOverlay) this.urgencyOverlay.style.opacity = '0';
                sfx.crash.currentTime = 0;
                sfx.crash.play().catch(() => {});
                window.currentGameplayMusic?.pause();
                sfx.boost.pause();
                sfx.boost.currentTime = 0;
                showGameOver('Game Over! You crashed into a planet.');
                this.gameOver = true;
                return;
            }
        }
    }

    const width = this.scale.width;
    const height = this.scale.height;
    const shipR = 20;
    if (this.ship.x - shipR < 0 && this.velocity.x < 0) {
        this.velocity.x *= -1;
        this.ship.x = shipR;
    } else if (this.ship.x + shipR > width && this.velocity.x > 0) {
        this.velocity.x *= -1;
        this.ship.x = width - shipR;
    }
    if (this.ship.y - shipR < 0 && this.velocity.y < 0) {
        this.velocity.y *= -1;
        this.ship.y = shipR;
    } else if (this.ship.y + shipR > height && this.velocity.y > 0) {
        this.velocity.y *= -1;
        this.ship.y = height - shipR;
    }

    const fuelPct = Math.max(0, Math.min(100, this.fuel / this.maxFuel * 100));
    const fb = document.getElementById('fuel-bar');
    fb.style.width = fuelPct + '%';
    fb.textContent = Math.round(fuelPct) + '%';
    document.getElementById('ammo-count').textContent = this.ammo;
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
    document.getElementById('credits').textContent = this.credits;
    document.getElementById('time-remaining').textContent = Math.ceil(this.timeRemaining);
}
  window.gameUpdate = update;
})();
