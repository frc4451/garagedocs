import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ANSI_ESCAPE = /\u001b\[[0-9;]*m/g;
const FALLBACK_URL = 'http://127.0.0.1:5173/';
const requestedBrowser = (process.argv[2] || 'firefox').toLowerCase();
let browserOpened = false;
let serverOutput = '';

if (requestedBrowser !== 'firefox' && requestedBrowser !== 'chrome') {
  throw new Error(`Unsupported development browser: ${requestedBrowser}`);
}

function findWindowsBrowser(browser) {
  const candidates = browser === 'chrome'
    ? [
        process.env.GARAGEDOCS_CHROME_PATH,
        process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
        process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
        process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      ]
    : [
        process.env.GARAGEDOCS_FIREFOX_PATH,
        process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Mozilla Firefox', 'firefox.exe'),
        process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Mozilla Firefox', 'firefox.exe'),
        process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Mozilla Firefox', 'firefox.exe'),
      ];

  return candidates.find((candidate) => candidate && existsSync(candidate));
}

function openInDevelopmentBrowser(url) {
  let command;
  let args;

  if (process.platform === 'win32') {
    command = findWindowsBrowser(requestedBrowser);
    if (!command) {
      const variable = requestedBrowser === 'chrome' ? 'GARAGEDOCS_CHROME_PATH' : 'GARAGEDOCS_FIREFOX_PATH';
      console.error(`${requestedBrowser} was not found. Set ${variable} to the browser executable and restart the task.`);
      return;
    }
    args = requestedBrowser === 'chrome' ? [url] : ['-new-tab', url];
  } else if (process.platform === 'darwin') {
    command = 'open';
    args = ['-a', requestedBrowser === 'chrome' ? 'Google Chrome' : 'Firefox', url];
  } else {
    command = requestedBrowser === 'chrome' ? 'google-chrome' : 'firefox';
    args = requestedBrowser === 'chrome' ? [url] : ['--new-tab', url];
  }

  const browser = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  browser.on('error', (error) => {
    console.error(`GarageDocs started, but ${requestedBrowser} could not be opened: ${error.message}`);
  });
  browser.unref();
}

function inspectServerOutput(chunk) {
  if (browserOpened) return;

  serverOutput = `${serverOutput}${chunk.toString().replace(ANSI_ESCAPE, '')}`.slice(-4096);
  const match = serverOutput.match(/Local\s+(https?:\/\/\S+)/i);
  if (!match) return;

  browserOpened = true;
  openInDevelopmentBrowser(match[1] || FALLBACK_URL);
}

const npmCommand = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
const npmArgs = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run dev'] : ['run', 'dev'];
const server = spawn(npmCommand, npmArgs, {
  cwd: process.cwd(),
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
  windowsHide: true,
});

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  inspectServerOutput(chunk);
});

server.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  inspectServerOutput(chunk);
});

server.on('error', (error) => {
  console.error(`Unable to start GarageDocs: ${error.message}`);
  process.exitCode = 1;
});

server.on('close', async (code, signal) => {
  // Astro refuses to start a second server for this project. Reopen the one it reports.
  if (/Another astro dev server is already running\.|Dev server already running at/i.test(serverOutput)) {
    const match = serverOutput.match(/(?:URL:\s+|Dev server already running at\s+)(https?:\/\/[^\s"\\]+)/i);
    if (match) {
      try {
        const url = new URL(match[1]);
        if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) {
          throw new Error('The existing server URL is not local.');
        }
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        await response.body?.cancel();
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log(`Reusing GarageDocs at ${url.href}`);
        if (!browserOpened) {
          browserOpened = true;
          openInDevelopmentBrowser(url.href);
        }
        process.exitCode = 0;
        return;
      } catch (error) {
        console.error(`The existing GarageDocs server is not ready: ${error.message}`);
        console.error('Run npx astro dev stop, then run this task again.');
        process.exitCode = 1;
        return;
      }
    }
  }
  if (signal) console.log(`GarageDocs stopped by ${signal}.`);
  process.exitCode = code ?? 0;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}
