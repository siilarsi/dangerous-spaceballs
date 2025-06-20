        const { menuMusic, playTracks, sfx } = window.audioElements;
        window.gamePaused = false;

        const storedHigh = parseInt(localStorage.getItem('highscore') || '0');
        document.getElementById('highscore-value').textContent = storedHigh;
        window.totalCredits = parseInt(localStorage.getItem('credits') || '0');
        document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
            el.textContent = window.totalCredits;
        });

        window.permanentUpgrades = JSON.parse(localStorage.getItem('permanentUpgrades') || '[]');
        window.sessionUpgrades = JSON.parse(sessionStorage.getItem('sessionUpgrades') || '[]');

        window.baseStats = {
            maxFuel: 200,
            ammo: 50,
            boostThrust: 200,
            shieldDuration: 0
        };

        function updateInventoryPanel() {
            let fuel = window.baseStats.maxFuel;
            let ammo = window.baseStats.ammo;
            let thrust = window.baseStats.boostThrust;
            let shield = window.baseStats.shieldDuration;
            const active = new Set([...window.permanentUpgrades, ...window.sessionUpgrades]);
            if (active.has('extra_fuel')) fuel += 50;
            if (active.has('max_ammo')) ammo = 100;
            document.getElementById('inv-fuel').textContent = fuel;
            document.getElementById('inv-ammo').textContent = ammo;
            document.getElementById('inv-thrust').textContent = thrust;
            document.getElementById('inv-shield').textContent = shield;
        }

        updateInventoryPanel();

        const shopItems = [
            {
                id: 'max_ammo',
                name: 'Increase Max Ammo',
                desc: 'Raise your ammo cap to 100.',
                icon: '🔫',
                cost: 5,
                permanent: true
            },
            {
                id: 'extra_fuel',
                name: 'Extra Starting Fuel',
                desc: 'Begin with additional fuel reserves.',
                icon: '⛽',
                cost: 3
            },
            {
                id: 'fast_reload',
                name: 'Faster Reload',
                desc: 'Reduce time between shots.',
                icon: '⚡',
                cost: 4
            },
            {
                id: 'shield',
                name: 'Temporary Shield',
                desc: 'Absorb the next hit you take.',
                icon: '🛡️',
                cost: 2,
                stock: 1
            }
        ];

        function renderShop() {
            const container = document.getElementById('shop-items');
            container.innerHTML = '';
            shopItems.forEach(item => {
                const div = document.createElement('div');
                div.className = 'shop-item';

                const icon = document.createElement('div');
                icon.className = 'icon';
                icon.textContent = item.icon;

                const info = document.createElement('div');
                info.className = 'info';
                const title = document.createElement('div');
                title.className = 'name';
                title.textContent = item.name;
                const desc = document.createElement('div');
                desc.className = 'desc';
                desc.textContent = item.desc;
                info.appendChild(title);
                info.appendChild(desc);

                const price = document.createElement('div');
                price.className = 'price-badge';
                price.textContent = item.cost;

                const btn = document.createElement('button');
                btn.className = 'buy-btn';
                btn.textContent = 'Buy';
                btn.onclick = () => purchase(item);

                div.appendChild(icon);
                div.appendChild(info);
                div.appendChild(price);
                div.appendChild(btn);
                container.appendChild(div);
            });
        }

        function purchase(item) {
            if (window.totalCredits >= item.cost && (!item.stock || item.stock > 0)) {
                window.totalCredits -= item.cost;
                localStorage.setItem('credits', window.totalCredits);
                document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
                    el.textContent = window.totalCredits;
                });
                if (item.permanent) {
                    if (!window.permanentUpgrades.includes(item.id)) {
                        window.permanentUpgrades.push(item.id);
                        localStorage.setItem('permanentUpgrades', JSON.stringify(window.permanentUpgrades));
                    }
                } else {
                    window.sessionUpgrades.push(item.id);
                    sessionStorage.setItem('sessionUpgrades', JSON.stringify(window.sessionUpgrades));
                }
                if (item.stock) item.stock -= 1;
                renderShop();
                updateInventoryPanel();
            }
        }

        function resetProgress() {
            localStorage.removeItem('highscore');
            localStorage.removeItem('credits');
            localStorage.removeItem('permanentUpgrades');
            sessionStorage.removeItem('sessionUpgrades');
            window.totalCredits = 0;
            window.permanentUpgrades = [];
            window.sessionUpgrades = [];
            document.querySelectorAll('.total-credits, #start-credits-value').forEach(el => {
                el.textContent = 0;
            });
            document.getElementById('highscore-value').textContent = 0;
            updateInventoryPanel();
            renderShop();
        }

        const gameOverBox = document.getElementById('game-over');
        function showGameOver(msg) {
            const finalScore = window.gameScene?.score || 0;
            const prev = parseInt(localStorage.getItem('highscore') || '0');
            if (finalScore > prev) {
                localStorage.setItem('highscore', finalScore);
            }
            gameOverBox.textContent = msg;
            gameOverBox.style.display = 'flex';
            gameOverBox.onclick = () => window.location.reload();
        }


        function startGame(levelDurationMs = 15000) {
            const config = {
                type: Phaser.AUTO,
                parent: 'game',
                width: window.innerWidth,
                height: window.innerHeight,
                transparent: true,
                scene: {
                    create: create,
                    update: update
                }
            };

            const game = new Phaser.Game(config);
            document.getElementById('fuel-container').style.display = 'block';
            document.getElementById('ammo-container').style.display = 'block';
            document.getElementById('credits-container').style.display = 'block';
            document.getElementById('score-container').style.display = 'block';
            document.getElementById('legend').style.display = 'block';

            window.addEventListener('resize', function () {
                game.scale.resize(window.innerWidth, window.innerHeight);
            });

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

                // Orb management
                this.orbs = [];
                this.nextOrbSpawn = 0;
                this.orbSpawnRate = 3000; // milliseconds
                this.orbGrowthDuration = 500;
                this.orbSpeedMultiplier = 1;

                this.level = 1;
                this.levelDuration = levelDurationMs;
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

            function update(time, delta) {
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
                    document.body.classList.remove('urgent');
                    sfx.timeout.currentTime = 0;
                    sfx.timeout.play().catch(() => {});
                    window.currentGameplayMusic?.pause();
                    sfx.boost.pause();
                    sfx.boost.currentTime = 0;
                    showGameOver('Game Over! Your time ran out.');
                    this.gameOver = true;
                    return;
                }
                if (this.timeRemaining <= 10 && !this.urgentStarted) {
                    document.body.classList.add('urgent');
                    this.urgentStarted = true;
                    this.urgentInterval = setInterval(playTick, 2000);
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
                            document.body.classList.remove('urgent');
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
                            document.body.classList.remove('urgent');
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
                if (this.ship.x < 0) this.ship.x = width;
                if (this.ship.x > width) this.ship.x = 0;
                if (this.ship.y < 0) this.ship.y = height;
                if (this.ship.y > height) this.ship.y = 0;

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
        }

        document.getElementById('shop-tab').addEventListener('click', () => {
            renderShop();
            document.getElementById('shop-panel').style.display = 'block';
        });
        document.getElementById('reset-progress').addEventListener('click', resetProgress);
        document.getElementById('close-shop').addEventListener('click', () => {
            document.getElementById('shop-panel').style.display = 'none';
        });
        document.getElementById('shop-panel').addEventListener('click', e => {
            e.stopPropagation();
        });

        document.getElementById('start-screen').addEventListener('click', function(e) {
            if (e.target.id === 'shop-tab' || e.target.closest('#shop-panel')) {
                return;
            }
            document.getElementById('start-screen').style.display = 'none';
            const promo = document.getElementById('promo-animation');
            promo.style.display = 'flex';
            menuMusic.pause();
            menuMusic.currentTime = 0;
            setTimeout(function() {
                promo.style.display = 'none';
                document.getElementById('game').style.display = 'block';
                window.currentGameplayMusic = playTracks[Math.floor(Math.random() * playTracks.length)];
                window.currentGameplayMusic.currentTime = 0;
                window.currentGameplayMusic.play().catch(() => {});
                startGame(window.levelDuration);
            }, 3000);
        });

        function handleVisibility() {
            if (document.hidden) {
                menuMusic.pause();
                window.currentGameplayMusic?.pause();
                sfx.boost.pause();
                sfx.boost.currentTime = 0;
                if (window.gameScene) {
                    window.gameScene.scene.pause();
                    window.gamePaused = true;
                }
            } else {
                if (window.gameScene) {
                    window.gameScene.scene.resume();
                    window.gamePaused = false;
                }
                if (document.getElementById('start-screen').style.display !== 'none') {
                    menuMusic.play().catch(() => {});
                } else if (window.currentGameplayMusic) {
                    window.currentGameplayMusic.play().catch(() => {});
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibility);
