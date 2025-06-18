# dangerous-spaceballs
A simple js game to test out phaser.

The Phaser runtime is bundled locally at `lib/phaser.min.js` and the HTML page
loads this file rather than using a CDN.

## Features

- Centered playfield framed by glowing edges.
- Ship & reticle interaction: the triangular ship rotates toward the mouse and a reticle follows your pointer.
- Orb spawning & growth: red and blue orbs appear and grow before becoming active.
- Orb drift & bounce once grown, making them move and ricochet off screen edges.
- Collision consequences: red orbs add score and streak, blue orbs subtract score, and crashing into any orb ends the game.
- Power-up pickups occasionally appear to refill ammo, fuel or time with a +15 indicator.

This project is automatically deployed to **GitHub Pages** whenever changes are merged to the `main` branch. The deployment workflow lives at `.github/workflows/deploy.yml` and publishes the root directory to the `gh-pages` branch using the `peaceiris/actions-gh-pages` GitHub Action.

## Setup

Run the following commands to install dependencies and Playwright's browser binaries:

```bash
npm install
npx playwright install
```

## Running tests

- **Unit tests**: `npm run check`
- **BDD tests**: `npm test`

