const fs = require('fs');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const workflow = process.env.WORKFLOW_FILE || 'bdd.yml';
const runId = process.env.GITHUB_RUN_ID;
const runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);

function request(path) {
  const options = {
    hostname: 'api.github.com',
    path,
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'duration-script',
      'Accept': 'application/vnd.github+json'
    }
  };
  return new Promise((resolve, reject) => {
    https.get(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function fetchRuns() {
  const result = await request(`/repos/${repo}/actions/workflows/${workflow}/runs?per_page=20`);
  return result.workflow_runs || [];
}

async function fetchRunDuration(id) {
  const result = await request(`/repos/${repo}/actions/runs/${id}`);
  return result.run_duration_ms ? result.run_duration_ms / 1000 : null;
}

async function main() {
  const runs = await fetchRuns();
  const durations = [];
  for (const run of runs) {
    if (String(run.id) === runId) continue; // skip current run
    const duration = await fetchRunDuration(run.id);
    if (duration === null) continue;
    durations.push({ run_number: run.run_number, duration });
  }
  // include current run from file if available
  try {
    const current = parseFloat(fs.readFileSync('duration.txt', 'utf8'));
    if (!isNaN(current)) {
      durations.push({ run_number: runNumber, duration: current });
    }
  } catch (e) {
    // ignore
  }
  durations.sort((a, b) => a.run_number - b.run_number);
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>BDD Test Duration</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <h1>BDD Test Duration (seconds)</h1>
  <canvas id="chart" width="600" height="400"></canvas>
  <script>
    const data = ${JSON.stringify(durations)};
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.run_number),
        datasets: [{
          label: 'Duration (s)',
          data: data.map(d => d.duration),
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        }]
      },
      options: {
        scales: {
          x: { title: { display: true, text: 'Run number' } },
          y: { title: { display: true, text: 'Seconds' } }
        }
      }
    });
  </script>
</body>
</html>`;
  fs.writeFileSync('bdd-duration-report.html', html);
}

main().catch(err => { console.error(err); process.exit(1); });
