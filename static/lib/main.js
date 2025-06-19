        const { menuMusic, playTracks, sfx } = window.audioElements;

        const gameOverBox = document.getElementById('game-over');
        function showGameOver(msg) {
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
            document.getElementById('score-container').style.display = 'block';

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
                this.fuel = 150;
                this.ammo = 50;
                this.fireRate = 100;
                this.lastFired = 0;
                this.bullets = [];
                this.gameOver = false;

                // Timer and power-ups
                this.timeRemaining = 60;
                this.powerUps = [];
                this.floatingTexts = [];
                this.nextPowerUpSpawn = 5000;
                this.powerUpSpawnRate = 8000; // milliseconds
                this.powerUpFadeDuration = 6000;
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

                this.spawnOrb = (color, t) => {
                    const x = Phaser.Math.Between(0, this.scale.width);
                    const y = Phaser.Math.Between(0, this.scale.height);
                    const radius = 15;
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
                };

                document.getElementById('ammo-count').textContent = this.ammo;
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
                    const bullet = this.add.rectangle(this.ship.x, this.ship.y, 4, 2, 0xff0000);
                    const speed = 600;
                    this.bullets.push({ sprite: bullet, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
                    this.lastFired = time;
                    this.ammo -= 1;
                    sfx.laser.currentTime = 0;
                    sfx.laser.play().catch(() => {});
                }

                if (this.isBoosting && this.fuel > 0) {
                    const accel = 400;
                    this.velocity.x += Math.cos(noseAngle) * accel * deltaSeconds;
                    this.velocity.y += Math.sin(noseAngle) * accel * deltaSeconds;
                    this.fuel -= 15 * deltaSeconds;
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
                    const pu = this.add.circle(x, y, 8, color);
                    pu.setAlpha(1);
                    this.powerUps.push({ sprite: pu, type: type, spawnTime: time });
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
                    // Check ship collision
                    const shipR = 20;
                    const dx = this.ship.x - o.sprite.x;
                    const dy = this.ship.y - o.sprite.y;
                    if (dx * dx + dy * dy <= (shipR + radius * o.sprite.scaleX) * (shipR + radius * o.sprite.scaleX)) {
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
                        if (p.type === 'fuel') this.fuel = Math.min(100, this.fuel + 15);
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
                this.velocity.scale(0.998);

                const width = this.scale.width;
                const height = this.scale.height;
                if (this.ship.x < 0) this.ship.x = width;
                if (this.ship.x > width) this.ship.x = 0;
                if (this.ship.y < 0) this.ship.y = height;
                if (this.ship.y > height) this.ship.y = 0;

                document.getElementById('fuel-bar').style.width = this.fuel + '%';
                document.getElementById('ammo-count').textContent = this.ammo;
                document.getElementById('score').textContent = this.score;
                document.getElementById('streak').textContent = this.streak;
                document.getElementById('time-remaining').textContent = Math.ceil(this.timeRemaining);
            }
        }

        document.getElementById('start-screen').addEventListener('click', function() {
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
