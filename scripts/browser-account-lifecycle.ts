import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { runtimeRoot } from '../src/storage/runtime-paths.js';
import { BrowserProtocol } from './browser-protocol.js';
import { cleanupBrowserResources, watchBrowser } from './browser-lifecycle.js';

// Manual account UI verification with an in-memory fake API; no daemon, real credentials, cron or agent executor.
// Reuse: node_modules/.bin/tsx scripts/browser-account-lifecycle.ts --serve-only
const isolatedHome = await mkdtemp(path.join(os.tmpdir(), 'pulse-account-home-'));
process.env['HOME'] = isolatedHome;
const artifacts = path.join(runtimeRoot(), 'browser-account-lifecycle');
await mkdir(artifacts, { recursive: true, mode: 0o700 });
const users = [
  { id: 1, username: 'owner', displayName: 'Alex Owner', role: 'owner', disabled: false },
  { id: 2, username: 'member', displayName: 'Morgan Member', role: 'member', disabled: false },
  { id: 3, username: 'viewer', displayName: 'Vera Viewer', role: 'viewer', disabled: false },
  { id: 4, username: 'disabled', displayName: 'Dana Disabled', role: 'member', disabled: true },
];
let ownPassword = 'owner-password';
const server = createServer(async (request, response) => {
  const urlPath = new URL(request.url ?? '/', 'http://localhost').pathname;
  function json(value: unknown, status = 200) {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(value));
  }
  if (urlPath === '/api/events') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream' });
    response.write(': connected\n\n');
    return;
  }
  if (!urlPath.startsWith('/api/')) {
    try {
      const filename = urlPath === '/' ? 'index.html' : urlPath.slice(1);
      if (filename.includes('..')) {
        response.writeHead(400);
        response.end();
        return;
      }
      const content = await readFile(path.join(process.cwd(), 'dist/web', filename));
      response.writeHead(200, {
        'Content-Type': filename.endsWith('.js')
          ? 'text/javascript'
          : filename.endsWith('.css')
            ? 'text/css'
            : 'text/html',
      });
      response.end(content);
    } catch {
      response.writeHead(404);
      response.end();
    }
    return;
  }
  let bodyText = '';
  for await (const chunk of request) bodyText += String(chunk);
  const body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  if (urlPath === '/api/session/password') {
    if (body['currentPassword'] !== ownPassword) {
      json({ error: 'Current password is incorrect.' }, 403);
      return;
    }
    ownPassword = String(body['newPassword']);
    json({ ok: true });
    return;
  }
  if (urlPath === '/api/session') {
    json({ user: users[0], authMode: 'password' });
    return;
  }
  if (urlPath === '/api/armies') {
    json([{ name: 'Fixture', battalions: [] }]);
    return;
  }
  if (urlPath === '/api/users' && request.method === 'GET') {
    json(users);
    return;
  }
  const match = urlPath.match(/^\/api\/users\/(\d+)(\/password)?$/);
  if (match) {
    const user = users.find((item) => item.id === Number(match[1]));
    if (!user) {
      json({ error: 'User not found' }, 404);
      return;
    }
    if (match[2]) {
      json({ ok: true });
      return;
    }
    if (
      user.role === 'owner' &&
      !user.disabled &&
      (body['disabled'] === true || (body['role'] && body['role'] !== 'owner')) &&
      users.filter((item) => item.role === 'owner' && !item.disabled).length === 1
    ) {
      json({ error: 'The last active owner cannot be demoted or disabled.' }, 409);
      return;
    }
    if (typeof body['role'] === 'string') user.role = body['role'];
    if (typeof body['disabled'] === 'boolean') user.disabled = body['disabled'];
    json(user);
    return;
  }
  json([]);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
assert(address && typeof address !== 'string');
const url = `http://127.0.0.1:${address.port}`;
if (process.argv.includes('--serve-only')) {
  process.stdout.write(`Fake UI: ${url}/#/users\nIsolated HOME: ${isolatedHome}\n`);
  await new Promise(() => {});
}
const executable = process.env['PULSE_BROWSER_EXECUTABLE'] ?? '/usr/bin/chromium';
const browser = spawn(
  executable,
  [
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${path.join(artifacts, 'profile')}`,
    '--remote-debugging-pipe',
    'about:blank',
  ],
  {
    env: {
      PATH: process.env['PATH'],
      HOME: isolatedHome,
      XDG_CONFIG_HOME: path.join(artifacts, 'config'),
      XDG_CACHE_HOME: path.join(artifacts, 'cache'),
      XDG_RUNTIME_DIR: artifacts,
    },
    stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'],
  },
);
const diagnostics: string[] = [];
browser.stderr?.on('data', (chunk: Buffer) => diagnostics.push(chunk.toString()));
const protocol = new BrowserProtocol(browser.stdio[3] as Writable, browser.stdio[4] as Readable);
const stopBrowser = watchBrowser(browser, (error) => {
  diagnostics.push(`${error.stack ?? error.message}\n`);
  protocol.close(error);
});
process.stderr.write(`Browser smoke artifacts: ${artifacts}\n`);
try {
  const version = await protocol.send('Browser.getVersion');
  const target = await protocol.send('Target.createTarget', { url: 'about:blank' });
  const attached = await protocol.send('Target.attachToTarget', { targetId: target['targetId'], flatten: true });
  assert.equal(typeof attached['sessionId'], 'string');
  const sessionId = attached['sessionId'] as string;
  const evaluate = async (expression: string) => {
    const result = await protocol.send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
    assert(!result['exceptionDetails'], JSON.stringify(result));
    return (result['result'] as { value?: unknown }).value;
  };
  await protocol.send('Page.enable', {}, sessionId);
  await protocol.send(
    'Emulation.setDeviceMetricsOverride',
    { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );
  await protocol.send('Page.navigate', { url: url + '/#/users' }, sessionId);
  async function waitFor(expression: string) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
    throw new Error('Timed out: ' + expression);
  }
  const textIncludes = (text: string) =>
    `document.querySelector('main')?.textContent.includes(${JSON.stringify(text)})`;
  async function click(expression: string) {
    const coordinates = await evaluate(
      `(()=>{const e=${expression};e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,
    );
    await protocol.send(
      'Input.dispatchMouseEvent',
      { type: 'mousePressed', ...(coordinates as object), button: 'left', clickCount: 1 },
      sessionId,
    );
    await protocol.send(
      'Input.dispatchMouseEvent',
      { type: 'mouseReleased', ...(coordinates as object), button: 'left', clickCount: 1 },
      sessionId,
    );
  }
  async function fill(expression: string, value: string) {
    await click(expression);
    await evaluate(`(()=>{const e=${expression};e.select()})()`);
    await protocol.send('Input.insertText', { text: value }, sessionId);
  }
  const button = (text: string) =>
    `[...document.querySelectorAll('main button')].find(e=>e.textContent===${JSON.stringify(text)})`;
  const rowButton = (username: string, text: string) =>
    `[...document.querySelectorAll('tbody tr')].find(e=>e.querySelector('small')?.textContent===${JSON.stringify(username)}).querySelectorAll('button')[${text === 'Reset password' ? 0 : 1}]`;
  const evidence: Record<string, unknown> = {
    version,
    executable,
    url,
    isolatedHome,
    artifacts,
    sandboxDisabled: false,
    role: 'Engineer',
    executor: 'Codex workspace-write',
  };
  async function shot(name: string, width = 1280, height = 800) {
    await protocol.send(
      'Emulation.setDeviceMetricsOverride',
      { width, height, deviceScaleFactor: 1, mobile: width < 700 },
      sessionId,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    const result = await protocol.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    await writeFile(path.join(artifacts, name + '.png'), Buffer.from(result['data'] as string, 'base64'));
  }
  await waitFor(textIncludes('Morgan Member'));
  await waitFor("document.querySelector('#army-switcher')?.textContent==='Fixture'");
  await shot('users-desktop-before');
  await click(`document.querySelector('[aria-label="Role for Morgan Member"]')`);
  await protocol.send(
    'Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    sessionId,
  );
  await protocol.send(
    'Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    sessionId,
  );
  await protocol.send(
    'Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
    sessionId,
  );
  await protocol.send(
    'Input.dispatchKeyEvent',
    { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
    sessionId,
  );
  await waitFor(textIncludes('Role changed to viewer.'));
  await click(rowButton('member', 'Disable'));
  assert.equal(await evaluate('document.activeElement.textContent'), 'Cancel');
  await protocol.send(
    'Input.dispatchKeyEvent',
    { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 },
    sessionId,
  );
  await waitFor(`!${textIncludes('Disable member?')}`);
  await waitFor("document.activeElement.textContent==='Disable'");
  await click(rowButton('member', 'Disable'));
  await click("document.querySelector('button.danger')");
  await waitFor(textIncludes('Disabled. member was signed out.'));
  await click(rowButton('member', 'Enable'));
  await waitFor(textIncludes('Enabled.'));
  await click(rowButton('member', 'Reset password'));
  assert.equal(await evaluate('document.activeElement.type'), 'password');
  await shot('users-reset-inline');
  await fill("document.querySelector('input[type=password]')", 'member-reset');
  await click(button('Set password'));
  await waitFor(textIncludes('Password reset. member was signed out.'));
  await click(rowButton('owner', 'Disable'));
  await click("document.querySelector('button.danger')");
  await waitFor(textIncludes('The last active owner cannot be demoted or disabled.'));
  await shot('users-desktop-after');
  await shot('users-mobile', 390, 844);
  await evaluate(
    "[...document.querySelectorAll('tbody tr')].find(e=>e.querySelector('small')?.textContent==='disabled').scrollIntoView({block:'center'})",
  );
  await shot('users-mobile-disabled', 390, 844);
  await protocol.send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-color-scheme', value: 'dark' }] },
    sessionId,
  );
  await evaluate("document.querySelector('main').scrollTop=0");
  await shot('users-desktop-dark');
  await protocol.send('Emulation.setEmulatedMedia', { features: [] }, sessionId);
  await click(button('Cancel'));
  await evaluate("window.location.hash='#/account'");
  await waitFor("document.querySelectorAll('main input').length===3");
  for (const [index, value] of ['wrong-password', 'new-password', 'new-password'].entries())
    await fill(`document.querySelectorAll('main input')[${index}]`, value);
  await click(button('Change password'));
  await waitFor(textIncludes('Current password is incorrect.'));
  await shot('account-mobile-error', 390, 844);
  await fill("document.querySelectorAll('main input')[0]", 'owner-password');
  await click(button('Change password'));
  await waitFor(textIncludes('Password changed. Your other sessions were signed out.'));
  assert.equal(await evaluate("[...document.querySelectorAll('main input')].every(e=>e.value==='')"), true);
  await shot('account-mobile-success', 390, 844);
  await shot('account-desktop-success');
  evidence['interactions'] = [
    'list seeded owner/member/viewer/disabled',
    'member role to viewer',
    'disable focused Cancel, Escape cancelled',
    'disable then enable member',
    'reset member password',
    'last-owner disable 409 inline',
    'wrong current password 403 inline',
    'own password success, fields cleared',
  ];
  await writeFile(path.join(artifacts, 'evidence.json'), JSON.stringify(evidence, null, 2));
  process.stdout.write(JSON.stringify(evidence, null, 2) + '\n');
} catch (error) {
  const failure = error instanceof Error ? error : new Error(String(error));
  diagnostics.push(`${failure.stack ?? failure.message}\n`);
  process.stderr.write(`Browser smoke failed: ${failure.message}\n`);
  process.exitCode = 1;
} finally {
  protocol.close();
  await cleanupBrowserResources([
    stopBrowser,
    () => new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
    () => writeFile(path.join(artifacts, 'browser.stderr.log'), diagnostics.join('')),
  ]);
}
