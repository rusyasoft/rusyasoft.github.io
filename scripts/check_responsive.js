#!/usr/bin/env node
'use strict';

/**
 * Responsive layout checks for the built site.
 *
 * Serves a built `_site` directory, drives headless Chrome over the DevTools
 * protocol, and asserts the invariants the P0 layout issues were filed against:
 *
 *   * no page-level horizontal scrolling at any tested viewport width
 *   * article body text stays at a readable size on phones
 *   * a wide ad creative cannot widen the document
 *
 * Usage:
 *   node scripts/check_responsive.js [--site _site] [--widths 320,390,1024]
 *
 * Requires Google Chrome. Skips with a non-fatal notice when Chrome is absent,
 * so `./init.sh` still works on machines without it.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const CHROME_CANDIDATES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

// Widths from the issue reports, covering small phones through desktop.
const DEFAULT_WIDTHS = [320, 360, 375, 390, 768, 1024, 1440];

// One representative page per layout: index, paginated index, the page layout,
// the listing pages, and articles with diagrams, long code blocks and wide tables.
const DEFAULT_PAGES = [
  '/',
  '/page2/',
  '/about/',
  '/categories/',
  '/archives/',
  '/tags/',
  '/software-engineering/architecture/ai/2026/07/11/architecture-as-part-of-implementation/',
  '/ai/software-engineering/architecture/2026/05/31/Managing-Agent-State-with-ACID-Principles/',
  '/ai/security/software-engineering/cli/2025/10/25/my-experience-with-caisp/',
  '/git/2019/02/25/git-usefull-commands/',
  '/k8s/2020/09/30/k8s-resources/',
  '/algorithms,%20leetcode/2019/06/05/algorithms-3sum-closest/',
];

// Phones must not drop below this. 14px body copy was the reported defect.
const MIN_MOBILE_FONT_PX = 16;
const MOBILE_MAX_WIDTH = 767;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.xml': 'application/xml; charset=utf-8',
};

function parseArgs(argv) {
  const args = { site: '_site', widths: DEFAULT_WIDTHS, pages: DEFAULT_PAGES };
  for (let i = 0; i < argv.length; i += 1) {
    const [flag, inlineValue] = argv[i].split('=');
    const value = inlineValue !== undefined ? inlineValue : argv[i + 1];
    if (inlineValue === undefined && value !== undefined) i += 1;
    if (flag === '--site') args.site = value;
    else if (flag === '--widths') args.widths = value.split(',').map((w) => parseInt(w.trim(), 10));
    else if (flag === '--pages') args.pages = value.split(',').map((p) => p.trim());
  }
  return args;
}

function startServer(siteDir) {
  const server = http.createServer((req, res) => {
    let filePath = path.join(siteDir, decodeURIComponent(req.url.split('?')[0]));
    try {
      if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch (err) {
      // Fall through to the 404 below.
    }
    fs.readFile(filePath, (err, body) => {
      if (err) {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      res.end(body);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function findChrome() {
  return CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate)) || null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function launchChrome(binary) {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-responsive-'));
  const proc = spawn(binary, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--remote-debugging-port=0',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'ignore'] });

  const portFile = path.join(userDataDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (fs.existsSync(portFile)) {
      const [port] = fs.readFileSync(portFile, 'utf8').split('\n');
      if (port && port.trim()) return { proc, port: port.trim(), userDataDir };
    }
    await sleep(100);
  }
  proc.kill();
  throw new Error('Chrome did not expose a DevTools port within 10s');
}

/** Minimal CDP client over the browser-level WebSocket, using flattened sessions. */
class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = [];
    socket.addEventListener('message', (event) => this.onMessage(JSON.parse(event.data)));
  }

  static async connect(wsUrl) {
    const socket = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', () => reject(new Error('CDP websocket failed')), { once: true });
    });
    return new Cdp(socket);
  }

  onMessage(message) {
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method) {
      this.eventWaiters = this.eventWaiters.filter((waiter) => {
        if (waiter.method !== message.method) return true;
        if (waiter.sessionId && waiter.sessionId !== message.sessionId) return true;
        waiter.resolve(message.params);
        return false;
      });
    }
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.socket.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  waitFor(method, sessionId, timeoutMs) {
    return new Promise((resolve) => {
      const waiter = { method, sessionId, resolve };
      this.eventWaiters.push(waiter);
      setTimeout(() => {
        this.eventWaiters = this.eventWaiters.filter((entry) => entry !== waiter);
        resolve(null);
      }, timeoutMs);
    });
  }

  close() {
    this.socket.close();
  }
}

/**
 * Runs in the page. Reports the document width against the viewport, plus every
 * element sticking out past it, so a failure names the culprit instead of only
 * the symptom.
 */
const MEASURE = `(() => {
  const innerWidth = window.innerWidth;
  const scrollWidth = document.documentElement.scrollWidth;
  const offenders = [];
  if (scrollWidth > innerWidth) {
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      const right = rect.right + window.scrollX;
      if (right <= innerWidth + 1) continue;
      if (el.closest('[data-overflow-ok]')) continue;
      const style = getComputedStyle(el);
      if (style.overflowX === 'auto' || style.overflowX === 'scroll') continue;
      const parent = el.parentElement;
      if (parent) {
        const parentStyle = getComputedStyle(parent);
        if (parentStyle.overflowX === 'auto' || parentStyle.overflowX === 'scroll' || parentStyle.overflow === 'hidden') continue;
      }
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString().slice(0, 60)) || '',
        right: Math.round(right),
        width: Math.round(rect.width),
      });
      if (offenders.length >= 6) break;
    }
  }
  const bodyText = document.querySelector('.post-body p, .post-body li, .post-body');
  const fontSize = bodyText ? parseFloat(getComputedStyle(bodyText).fontSize) : null;
  const lineHeight = bodyText ? parseFloat(getComputedStyle(bodyText).lineHeight) : null;
  const measure = bodyText ? Math.round(bodyText.getBoundingClientRect().width) : null;
  return JSON.stringify({ innerWidth, scrollWidth, offenders, fontSize, lineHeight, measure });
})()`;

/** Forces a 970px ad creative into the ad slot to prove the container contains it. */
const INJECT_WIDE_AD = `(() => {
  const slot = document.querySelector('.post-ad-unit');
  if (!slot) return 'no-ad-slot';
  const frame = document.createElement('iframe');
  frame.width = '970';
  frame.height = '250';
  frame.style.border = '0';
  frame.setAttribute('src', 'about:blank');
  slot.appendChild(frame);
  return 'injected';
})()`;

async function measurePage(cdp, sessionId, url, width, { injectWideAd = false } = {}) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width <= MOBILE_MAX_WIDTH,
  }, sessionId);

  const loaded = cdp.waitFor('Page.loadEventFired', sessionId, 15000);
  await cdp.send('Page.navigate', { url }, sessionId);
  await loaded;
  await sleep(150);

  if (injectWideAd) {
    const injection = await cdp.send('Runtime.evaluate', { expression: INJECT_WIDE_AD, returnByValue: true }, sessionId);
    if (injection.result.value === 'no-ad-slot') return null;
    await sleep(100);
  }

  const result = await cdp.send('Runtime.evaluate', { expression: MEASURE, returnByValue: true }, sessionId);
  return JSON.parse(result.result.value);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const siteDir = path.resolve(ROOT, args.site);

  if (!fs.existsSync(siteDir)) {
    console.error(`ERROR: built site not found at ${siteDir}. Run the Jekyll build first.`);
    return 1;
  }

  const chrome = findChrome();
  if (!chrome) {
    console.log('SKIP: responsive checks need Google Chrome or Chromium, which is not installed here.');
    return 0;
  }

  const { server, port } = await startServer(siteDir);
  const base = `http://127.0.0.1:${port}`;
  const { proc, port: devtoolsPort, userDataDir } = await launchChrome(chrome);

  const failures = [];
  let cdp;
  try {
    const version = await (await fetch(`http://127.0.0.1:${devtoolsPort}/json/version`)).json();
    cdp = await Cdp.connect(version.webSocketDebuggerUrl);

    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);

    for (const page of args.pages) {
      const url = `${base}${page}`;
      for (const width of args.widths) {
        const measurement = await measurePage(cdp, sessionId, url, width);
        if (!measurement) continue;

        if (measurement.scrollWidth > measurement.innerWidth) {
          const culprits = measurement.offenders
            .map((o) => `${o.tag}.${o.cls || '(no class)'} right=${o.right}px width=${o.width}px`)
            .join('; ') || 'no single element identified';
          failures.push(
            `${page} @ ${width}px: scrollWidth ${measurement.scrollWidth} > innerWidth ${measurement.innerWidth} -- ${culprits}`,
          );
        }

        const isArticle = page.split('/').filter(Boolean).length > 1;
        if (isArticle && width <= MOBILE_MAX_WIDTH && measurement.fontSize !== null
            && measurement.fontSize < MIN_MOBILE_FONT_PX) {
          failures.push(
            `${page} @ ${width}px: article text is ${measurement.fontSize}px, below the ${MIN_MOBILE_FONT_PX}px minimum`,
          );
        }
      }
      console.log(`  checked ${page} at ${args.widths.length} widths`);
    }

    // Ads only ship in production builds, so this pass is a no-op unless the site
    // was built with _config.ads-preview.yml. When the slot is present, a creative
    // far wider than a phone must still not widen the document.
    const adPage = args.pages.find((p) => p.split('/').filter(Boolean).length > 1);
    if (adPage) {
      for (const width of [360, 390]) {
        const measurement = await measurePage(cdp, sessionId, `${base}${adPage}`, width, { injectWideAd: true });
        if (!measurement) {
          console.log(`  no ad slot in this build, skipped the 970px creative containment check`);
          break;
        }
        if (measurement.scrollWidth > measurement.innerWidth) {
          failures.push(
            `${adPage} @ ${width}px with a 970px ad creative: scrollWidth ${measurement.scrollWidth} > innerWidth ${measurement.innerWidth}`,
          );
        } else {
          console.log(`  contained a 970px ad creative at ${width}px`);
        }
      }
    }
  } finally {
    if (cdp) cdp.close();
    server.close();
    // Chrome keeps writing to its profile for a moment after SIGTERM, so wait for
    // the process to go before removing it. Cleanup must never mask a real result.
    const exited = new Promise((resolve) => proc.once('exit', resolve));
    proc.kill();
    await Promise.race([exited, sleep(3000)]);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (err) {
      console.log(`  note: left a temporary Chrome profile behind at ${userDataDir}`);
    }
  }

  if (failures.length) {
    console.error('ERROR: responsive layout checks failed');
    for (const failure of failures) console.error(`  - ${failure}`);
    return 1;
  }
  console.log('OK: responsive layout checks passed');
  return 0;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(`ERROR: ${err.stack || err.message}`);
  process.exit(1);
});
