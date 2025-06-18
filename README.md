# dangerous-spaceballs
A simple js game to test out phaser.

## Features

- Intro sequence with an animated promo that transitions directly into the game.
- Centered playfield framed by glowing edges.
- Ship & reticle interaction: the triangular ship rotates toward the mouse and a reticle follows your pointer.
- Thruster boost triggered by right-click, complete with flame effect and fuel meter.
- Laser firing with left-click; hold to shoot repeatedly until ammo runs out.
- Orb spawning & growth: red and blue orbs appear and grow before becoming active.
- Orb drift & bounce once grown, making them move and ricochet off screen edges.
- Collision consequences: red orbs add score and streak, blue orbs subtract score, and crashing into any orb ends the game.
- Power-up pickups occasionally appear to refill ammo, fuel or time with a +15 indicator.

This project is automatically deployed to **GitHub Pages** whenever changes are merged to the `main` branch. The deployment workflow lives at `.github/workflows/deploy.yml` and publishes the root directory to the `gh-pages` branch using the `peaceiris/actions-gh-pages` GitHub Action.
