import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const ENDPOINT = '/__garagedocs/open-in-vscode';
const MAX_BODY_BYTES = 16 * 1024;

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

async function openInVsCode(filePath, workspaceRoot) {
  const args = ['--reuse-window', workspaceRoot, '--goto', `${filePath}:1:1`];

  if (process.platform === 'win32') {
    const candidates = [
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft VS Code', 'Code.exe'),
      process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft VS Code', 'Code.exe'),
    ].filter(Boolean);
    let executable;

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
        executable = candidate;
        break;
      } catch {
        // Try the next standard installation path.
      }
    }

    if (!executable) throw new Error('Visual Studio Code was not found in a standard installation location.');

    await execFileAsync(executable, args, {
      cwd: workspaceRoot,
      env: process.env,
      windowsHide: true,
    });
    return;
  }

  await execFileAsync('code', args, {
    cwd: workspaceRoot,
    env: process.env,
  });
}

/** Open a known GarageDocs content file in the VS Code window that started Astro. */
export function vscodeEditPagePlugin(base = '/') {
  return {
    name: 'garagedocs-vscode-edit-page',
    apply: 'serve',
    configureServer(server) {
      const workspaceRoot = path.resolve(server.config.root);
      const contentRoot = path.join(workspaceRoot, 'src', 'content');
      const normalizedBase = base === '/' ? '' : base.replace(/\/$/, '');
      const endpointWithBase = `${normalizedBase}${ENDPOINT}`;

      server.middlewares.use(async (req, res, next) => {
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
        if (pathname !== ENDPOINT && pathname !== endpointWithBase) return next();

        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed.' });
          return;
        }

        try {
          const body = await readJsonBody(req);
          if (typeof body.sourcePath !== 'string') {
            sendJson(res, 400, { error: 'A source path is required.' });
            return;
          }

          const sourcePath = path.resolve(workspaceRoot, body.sourcePath);
          const extension = path.extname(sourcePath).toLowerCase();
          if (!isInside(contentRoot, sourcePath) || (extension !== '.md' && extension !== '.mdx')) {
            sendJson(res, 400, { error: 'Only GarageDocs Markdown content files can be opened.' });
            return;
          }

          const stats = await fs.stat(sourcePath);
          if (!stats.isFile()) {
            sendJson(res, 404, { error: 'The source file was not found.' });
            return;
          }

          await openInVsCode(sourcePath, workspaceRoot);
          sendJson(res, 200, { opened: true });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to open the source file.';
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
