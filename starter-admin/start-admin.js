#!/usr/bin/env node

// This script starts both the backend (Spring Boot/Kotlin) and frontend (React) for the starter-admin project.
// It uses the concurrently library for simplicity and readable output.

const concurrently = require('concurrently');
const { execSync } = require('child_process');

function killProcessOnPort(port, label) {
  try {
    // Try fuser first (Linux)
    execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
    console.log(`Killed process on port ${port} (${label}) using fuser.`);
  } catch (e1) {
    try {
      // Try lsof as fallback
      const output = execSync(`lsof -ti tcp:${port}`).toString().trim();
      if (output) {
        execSync(`kill -9 ${output}`);
        console.log(`Killed process on port ${port} (${label}) using lsof.`);
      }
    } catch (e2) {
      // No process to kill
    }
  }
}

// Kill backend (8080) and frontend (5173) if running
killProcessOnPort(8080, 'backend');
killProcessOnPort(5173, 'frontend');

concurrently([
  {
    command: 'cd backend && ./gradlew bootRun',
    name: 'backend',
    prefixColor: 'blue',
    cwd: __dirname
  },
  {
    command: 'cd frontend && npm start',
    name: 'frontend',
    prefixColor: 'green',
    cwd: __dirname
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 0
});
