#!/usr/bin/env node
const { spawn } = require('child_process');

// If running in CI (like Azure) or SKIP_TESTS env var is set, skip tests
const isCI = !!process.env.CI || !!process.env.SKIP_TESTS;

if (isCI) {
  console.log('SKIP_TESTS is set or running in CI environment. Skipping frontend unit tests.');
  process.exit(0);
}

// Run ng test locally
const cmd = process.platform === 'win32' ? 'ng.cmd' : 'ng';
const args = ['test'];
const proc = spawn(cmd, args, { stdio: 'inherit' });

proc.on('close', (code) => {
  process.exit(code);
});
