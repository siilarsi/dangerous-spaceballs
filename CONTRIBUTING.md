# Contributing

## Setup

Run the following commands to install dependencies and Playwright's browser binaries:

```bash
npm install
npx playwright install
```

## Running tests

- **Unit tests**: `npm run check`
- **BDD tests**: `npm test`

BDD tests run in parallel by default. Set the environment variable
`CUCUMBER_PARALLEL` to control how many worker processes are used:

```bash
# run with four workers
CUCUMBER_PARALLEL=4 npm test
```

## BDD duration report

When the `BDD Tests` workflow runs on pushes to `main`, it records how long the
tests took in a `bdd-duration` artifact. It also uploads a `bdd-duration-report`
artifact containing `bdd-duration-report.html`. Download this file from the
workflow run summary to view a chart of recent BDD test durations.
