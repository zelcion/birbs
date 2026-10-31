import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { runtimeRoot } from '../src/storage/runtime-paths.js';
import { BrowserProtocol } from './browser-protocol.js';
import { cleanupBrowserResources, watchBrowser } from './browser-lifecycle.js';

// Manual capability check only: no daemon, credentials, cron or agent executor.
const isolatedHome = await mkdtemp(path.join(os.tmpdir(), 'pulse-browser-home-'));
process.env['HOME'] = isolatedHome;
const artifacts = path.join(runtimeRoot(), 'browser-smoke');
await mkdir(artifacts, { recursive: true, mode: 0o700 });
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pulse browser smoke</title><style>
body{margin:0;background:#f1f5f9;color:#172033;font:18px system-ui;line-height:1.5}
main{max-width:36rem;margin:8vh auto;padding:2rem}h1{font-size:2rem;line-height:1.2}
button{background:#1e40af;color:white;border:0;border-radius:.5rem;padding:.75rem 1rem;font:inherit}
button:focus-visible{outline:3px solid #a16207;outline-offset:4px}
</style><main><h1>Browser capability check</h1><p>Isolated local fixture. No running army is connected.</p>
<button type="button" onclick="document.querySelector('[role=status]').textContent='Interaction verified'">Verify interaction</button>
<p role="status" aria-live="polite">Waiting for interaction</p></main></html>`;
const server = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(fixture);
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
assert(address && typeof address !== 'string');
const url = `http://127.0.0.1:${address.port}`;
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
  await protocol.send('Page.navigate', { url }, sessionId);
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await evaluate("document.readyState === 'complete' && document.title === 'Pulse browser smoke'")) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.equal(await evaluate('document.title'), 'Pulse browser smoke');
  assert.equal(await evaluate("document.querySelector('[role=status]').textContent"), 'Waiting for interaction');
  const buttonBounds = await evaluate(
    "JSON.stringify((()=>{const r=document.querySelector('button').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})())",
  );
  assert.equal(typeof buttonBounds, 'string');
  const coordinates = JSON.parse(buttonBounds as string) as { x: number; y: number };
  await protocol.send(
    'Input.dispatchMouseEvent',
    { type: 'mousePressed', ...coordinates, button: 'left', clickCount: 1 },
    sessionId,
  );
  await protocol.send(
    'Input.dispatchMouseEvent',
    { type: 'mouseReleased', ...coordinates, button: 'left', clickCount: 1 },
    sessionId,
  );
  assert.equal(await evaluate("document.querySelector('[role=status]').textContent"), 'Interaction verified');
  for (const [name, width, height] of [
    ['desktop', 1280, 800],
    ['mobile', 390, 844],
  ] as const) {
    await protocol.send(
      'Emulation.setDeviceMetricsOverride',
      { width, height, deviceScaleFactor: 1, mobile: name === 'mobile' },
      sessionId,
    );
    const screenshot = await protocol.send('Page.captureScreenshot', { format: 'png' }, sessionId);
    assert.equal(typeof screenshot['data'], 'string');
    await writeFile(path.join(artifacts, `${name}.png`), Buffer.from(screenshot['data'] as string, 'base64'));
  }
  const evidence = {
    executable,
    version,
    url,
    isolatedHome,
    artifacts,
    title: 'Pulse browser smoke',
    before: 'Waiting for interaction',
    after: 'Interaction verified',
    interaction: 'CDP mouse press/release',
    sandboxDisabled: false,
  };
  await writeFile(path.join(artifacts, 'evidence.json'), JSON.stringify(evidence, null, 2));
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
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
