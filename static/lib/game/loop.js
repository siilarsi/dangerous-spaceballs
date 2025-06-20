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
    const powerScale = Math.max(0.5, 1 - (this.level - 1) * 0.05);

    const cos = Math.cos(this.ship.rotation);
    const sin = Math.sin(this.ship.rotation);
    const shipHitX = this.ship.x + this.shipBodyOffset.x * cos - this.shipBodyOffset.y * sin;
    const shipHitY = this.ship.y + this.shipBodyOffset.x * sin + this.shipBodyOffset.y * cos;
    Matter.Body.setPosition(this.shipBody, { x: shipHitX, y: shipHitY });
    Matter.Body.setAngle(this.shipBody, this.ship.rotation);


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
        const scale = this.boostThrust / window.baseStats.boostThrust;
        this.flame.scaleX = scale;
        this.flame.scaleY = scale;
        this.flame.x = this.ship.x - Math.cos(noseAngle) * 20;
        this.flame.y = this.ship.y - Math.sin(noseAngle) * 20;
    }

    for (let p of this.planets) {
        const dx = p.sprite.x - this.ship.x;
        const dy = p.sprite.y - this.ship.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 1) {
            const acc = this.gravityStrength / Math.pow(distSq, this.gravityFalloff);
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
                const acc = this.gravityStrength / Math.pow(distSq, this.gravityFalloff);
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
        const center = this.powerUpOrbitCenter || this.planets[0]?.sprite;
        const radius = this.powerUpOrbitRadius || 180;
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;
        const type = Phaser.Math.RND.pick(['ammo', 'fuel']);
        let color = 0xffff00;
        if (type === 'fuel') color = 0xffa500;
        const power = this.add.container(x, y);
        if (type === 'ammo') {
            const v = this.add.rectangle(0, 0, 6, 18, color);
            const h = this.add.rectangle(0, 0, 18, 6, color);
            power.add([v, h]);
        }
        if (type === 'fuel') {
            const tri = this.add.triangle(0, 0, -7, 7, 7, 7, 0, -7, color);
            power.add(tri);
        }
        this.tweens.add({ targets: power, scale: 1.1, yoyo: true, repeat: -1, duration: 800 });
        power.setAlpha(1);
        this.powerUps.push({ sprite: power, type: type, spawnTime: time, angle, orbiting: true });
        this.nextPowerUpSpawn = time + this.powerUpSpawnRate;
    }

    if (time > this.nextLevelTime) {
        this.level += 1;
        this.nextLevelTime += this.levelDuration;
        this.orbSpeedMultiplier *= 1.2;
        this.powerUpSpawnRate *= 1.05;
        for (const o of this.orbs) {
            o.vx *= 1.2;
            o.vy *= 1.2;
        }
        const color = Math.random() < 0.5 ? 0xff0000 : 0x0000ff;
        this.spawnOrb(color, time);
        this.showLevelBanner(this.level);
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
        // Check ship collision using Matter SAT
        const orbBody = Matter.Bodies.circle(o.sprite.x, o.sprite.y, radius * o.sprite.scaleX);
        const collision = Matter.SAT.collides(this.shipBody, orbBody);
        if (collision.collided) {
            if (this.shield) {
                this.shield = false;
                window.sessionUpgrades = window.sessionUpgrades.filter(u => u !== 'shield');
                sessionStorage.setItem('sessionUpgrades', JSON.stringify(window.sessionUpgrades));
                o.sprite.destroy();
                this.orbs.splice(i, 1);
            } else {
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
        if (p.orbiting !== false) {
            const center = this.powerUpOrbitCenter || this.planets[0]?.sprite;
            const radius = this.powerUpOrbitRadius || 180;
            p.angle += this.powerUpAngularSpeed * deltaSeconds * this.powerUpOrbitDir;
            p.sprite.x = center.x + Math.cos(p.angle) * radius;
            p.sprite.y = center.y + Math.sin(p.angle) * radius;
        }

        const progress = (time - p.spawnTime) / this.powerUpFadeDuration;
        p.sprite.setAlpha(1 - progress);
        if (progress >= 1) {
            p.sprite.destroy();
            this.powerUps.splice(i, 1);
            continue;
        }
        const dxP = shipHitX - p.sprite.x;
        const dyP = shipHitY - p.sprite.y;
        if (dxP * dxP + dyP * dyP <= 28 * 28) {
            let label;
            if (p.type === 'ammo') {
                const amt = Math.round(15 * powerScale);
                this.ammo += amt;
                label = `+${amt} Ammo`;
            }
            if (p.type === 'fuel') {
                const amt = Math.round(25 * powerScale);
                this.fuel = Math.min(this.maxFuel, this.fuel + amt);
                label = `+${amt} Fuel`;
            }
            const txt = this.add.text(p.sprite.x, p.sprite.y, label, { font: '16px Arial', color: '#ffffff' });
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

    if (!this.traderShip && time > this.nextTraderSpawn) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        const y = Phaser.Math.Between(60, this.scale.height - 60);
        const x = dir === 1 ? -60 : this.scale.width + 60;
        this.spawnTraderShip(x, y, dir);
    }
    if (this.traderShip) {
        if (this.dockingStart || this.isDocked) {
            this.traderShip.speed = 0;
        } else {
            this.traderShip.speed = this.traderShip.baseSpeed;
        }
        this.traderShip.x += this.traderShip.speed * deltaSeconds * this.traderShip.dir;
        const dx = this.ship.x - this.traderShip.x;
        const dy = this.ship.y - this.traderShip.y;
        const distSq = dx * dx + dy * dy;
        const dockRange = 40 * 40;
        if (!this.isDocked && distSq <= dockRange) {
            if (!this.dockingStart) {
                this.startDocking(time);
            } else {
                const prog = (time - this.dockingStart) / 2000;
                this.dockRing.clear();
                this.dockRing.lineStyle(2, 0x00ff00);
                this.dockRing.beginPath();
                this.dockRing.arc(this.ship.x, this.ship.y, 30, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2, false);
                this.dockRing.strokePath();
                if (prog >= 1) {
                    this.completeDocking();
                }
            }
        } else if (this.dockingStart) {
            this.abortDocking();
        }
        if (!this.isDocked && !this.dockingStart && distSq < 30 * 30) {
            const angle = Math.atan2(dy, dx);
            const force = 300;
            this.velocity.x += Math.cos(angle) * force;
            this.velocity.y += Math.sin(angle) * force;
        }
        if (
            this.traderShip.x < -80 ||
            this.traderShip.x > this.scale.width + 80
        ) {
            this.traderShip.destroy();
            this.traderShip = null;
            this.nextTraderSpawn = time + this.traderSpawnInterval;
            window.shop.render(null);
        }
    }

    this.ship.x += this.velocity.x * deltaSeconds;
    this.ship.y += this.velocity.y * deltaSeconds;

    for (let p of this.planets) {
        const planetBody = Matter.Bodies.circle(p.sprite.x, p.sprite.y, p.radius);
        const collision = Matter.SAT.collides(this.shipBody, planetBody);
        if (collision.collided) {
            if (this.shield) {
                this.shield = false;
                window.sessionUpgrades = window.sessionUpgrades.filter(u => u !== 'shield');
                sessionStorage.setItem('sessionUpgrades', JSON.stringify(window.sessionUpgrades));
            } else {
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
    const shipR = this.shipRadius;
    if (shipHitX - shipR < 0 && this.velocity.x < 0) {
        this.velocity.x *= -1;
        this.ship.x = shipR - this.shipBodyOffset.x;
    } else if (shipHitX + shipR > width && this.velocity.x > 0) {
        this.velocity.x *= -1;
        this.ship.x = width - shipR - this.shipBodyOffset.x;
    }
    if (shipHitY - shipR < 0 && this.velocity.y < 0) {
        this.velocity.y *= -1;
        this.ship.y = shipR - this.shipBodyOffset.y;
    } else if (shipHitY + shipR > height && this.velocity.y > 0) {
        this.velocity.y *= -1;
        this.ship.y = height - shipR - this.shipBodyOffset.y;
    }

    const fuelPct = Math.max(0, Math.min(100, this.fuel / this.maxFuel * 100));
    const fb = document.getElementById('fuel-bar');
    fb.style.width = fuelPct + '%';
    fb.textContent = Math.round(fuelPct) + '%';
    document.getElementById('ammo-count').textContent = this.ammo;
    document.getElementById('score').textContent = this.score;
    document.getElementById('streak').textContent = this.streak;
    document.getElementById('credits').textContent = this.credits;
    const cd = document.getElementById('reload-indicator');
    const fill = cd.querySelector('.fill');
    const prog = Math.min(1, (time - this.lastFired) / this.fireRate);
    if (prog < 1) {
        cd.style.display = 'block';
        fill.style.width = (prog * 100) + '%';
    } else {
        cd.style.display = 'none';
    }
    this.reticleCooldownProgress = prog;
    this.reticleCooldown.clear();
    if (prog < 1) {
        this.reticleCooldown.fillStyle(0xffff00, 0.6);
        this.reticleCooldown.slice(0, 0, 12, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2, false);
        this.reticleCooldown.fillPath();
        this.reticleCooldown.visible = true;
    } else {
        this.reticleCooldown.visible = false;
    }

    if (this.debugGraphics) {
        this.debugGraphics.clear();
        if (window.debugHitboxes && window.debugHitboxes.active) {
            window.debugHitboxes.ship = { x: shipHitX, y: shipHitY, r: this.shipRadius };
            this.debugGraphics.lineStyle(1, 0xff00ff, 0.6);
            this.debugGraphics.strokeCircle(shipHitX, shipHitY, this.shipRadius);
            for (const p of this.planets) {
                this.debugGraphics.strokeCircle(p.sprite.x, p.sprite.y, p.radius);
            }
            for (const o of this.orbs) {
                this.debugGraphics.strokeCircle(o.sprite.x, o.sprite.y, o.radius * o.sprite.scaleX);
            }
        }
    }
}
  window.gameUpdate = update;
})();
