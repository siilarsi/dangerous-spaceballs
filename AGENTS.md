- Before making any code changes, run `npm run check` to execute the unit tests.
- After making code changes, run `npm run check` again to ensure the unit tests pass.
- If you changed or added features, run the BDD tests (`npm test`) once after your modifications.
- If tests fail, update the code or tests so that they pass before committing.
- If any of the tests are failing, investigate why they fail and try to fix the underlying issue.
- Each new or modified feature must include a new BDD style test or an update to an existing one.
- BDD tests should be optimized for efficiency. Avoid unnecessarily long runtimes and regularly evaluate them for speed improvements.

## Project overview

- The game is a small Phaser application. `index.html` is the entry page and pulls in scripts from `static/lib`.
- Gameplay code lives in `static/lib/game/scene.js` and `static/lib/game/loop.js`. Supporting modules such as `audio.js`, `shop.js`, `stats.js`, `storage.js` and `boot.js` are also in `static/lib`.
- Styles reside under `static/css` with component specific styles in `static/css/components`.
- Unit tests are in the `test/` directory. BDD tests live in `features/` with step definitions in `features/step_definitions`. They use Playwright and Cucumber.
- After cloning, run `npm install` and `npx playwright install` to set up dependencies and browsers before running tests.
- `scripts/generate-duration-report.js` builds an HTML chart from recent BDD duration artifacts in CI.
- High scores, credits and upgrades are stored in browser storage via the helpers in `static/lib/storage.js`.
- Pushing to `main` deploys the root directory to GitHub Pages via `.github/workflows/deploy.yml`.
