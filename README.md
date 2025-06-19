# dangerous-spaceballs
A simple js game to test out phaser.

The Phaser runtime is bundled locally at `lib/phaser.min.js` and the HTML page
loads this file rather than using a CDN.

## Features

- Centered playfield framed by glowing edges.
- Orb spawning & growth: red and blue orbs appear and grow before becoming active.
- Orb drift & bounce once grown, making them move and ricochet off screen edges.
- Collision consequences: red orbs add score and streak, blue orbs subtract score, and crashing into any orb ends the game.
- Destroying a red orb awards 1 credit to spend in the shop.
- Quick Reset button in the shop footer clears saved progress.

This project is automatically deployed to **GitHub Pages** whenever changes are merged to the `main` branch. The deployment workflow lives at `.github/workflows/deploy.yml` and publishes the root directory to the `gh-pages` branch using the `peaceiris/actions-gh-pages` GitHub Action.

