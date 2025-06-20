# Development Workflow Optimization Notes

This document summarizes observations from a mock feature implementation walkthrough and suggests ways to speed up the workflow.

## Observed Steps and Timing
1. **Initial unit tests** – `npm run check`
   - Duration: <1s. Quick check of loop code.
2. **BDD test suite** – `npm test`
   - Duration: ~4m. Runs all 42 scenarios with Playwright.
   - Current run had 3 failing scenarios due to a timeout in `trader_inventory.feature`.

## Recommendations
- **Run unit tests automatically.** Because `npm run check` is very fast, running it via a file watcher or pre‑commit hook ensures issues are caught instantly without manual commands.
- **Parallelize BDD tests.** Setting `CUCUMBER_PARALLEL` to 4 or 8 can cut total time significantly since scenarios are independent.
- **Use tags to target scenarios.** When modifying a specific feature, run only relevant scenarios with `cucumber-js --tags`. Avoid running all 42 each time.
- **Reduce explicit waits.** Many steps include fixed delays (e.g. `And I wait for 2100 ms`). Replacing these with event‑based waits will shorten the suite.
- **Fix intermittent failures.** Failing scenarios (e.g. `trader_inventory.feature`) cause reruns and slow down development. Investigate timeouts around `spawnTraderShip` and ensure the page loads reliably.
- **Regularly profile test durations.** Use the existing duration reports in `scripts/generate-duration-report.js` to find slow steps and refactor them.

Implementing these practices should help reduce the turnaround time for new features and keep the test suite healthy.
