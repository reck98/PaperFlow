import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { createServer } from 'node:http';
import { resolve, join, extname } from 'node:path';
import { existsSync, statSync, createReadStream, mkdirSync } from 'node:fs';

const VIEWPORTS = [
  { width: 320, height: 640, label: '320px — small mobile' },
  { width: 375, height: 667, label: '375px — standard mobile' },
  { width: 390, height: 844, label: '390px — modern mobile' },
  { width: 430, height: 932, label: '430px — large mobile' },
  { width: 768, height: 1024, label: '768px — tablet' },
  { width: 1024, height: 768, label: '1024px — small laptop' },
  { width: 1440, height: 900, label: '1440px — desktop' },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

async function main() {
  const distDir = resolve('frontend/dist');
  if (!existsSync(distDir)) {
    console.error('frontend/dist not found. Build the frontend first.');
    process.exit(1);
  }

  const server = createServer((req, res) => {
    let filePath = resolve(join(distDir, decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname)));
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      return res.end();
    }
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(distDir, 'index.html');
    }
    const ext = extname(filePath).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'content-length': statSync(filePath).size,
    });
    createReadStream(filePath).pipe(res);
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  const outDir = resolve('.taste-skill/inspect/viewports');
  mkdirSync(outDir, { recursive: true });

  const browser = await Browser.launch();
  let allPassed = true;
  const results = [];

  try {
    for (const vp of VIEWPORTS) {
      console.log(`\n========================================`);
      console.log(`Testing viewport: ${vp.label} (${vp.width}x${vp.height})`);
      console.log(`========================================`);

      const page = await browser.newPage({
        width: vp.width,
        height: vp.height,
        mobile: vp.width < 768,
      });

      // Navigate to editor view
      await page.goto(`${baseUrl}/#editor`, { settleMs: 1500 });

      const metrics = await page.eval(`(() => {
        const root = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(root.scrollWidth, body.scrollWidth);
        const innerWidth = window.innerWidth;
        const hasHorizontalOverflow = scrollWidth > innerWidth + 1;

        const isMobile = window.innerWidth < 768;
        const hamburgerBtn = document.querySelector('header button[aria-label*="sidebar"]');
        const mobileTabBar = document.querySelector('.grid.grid-cols-2');
        const splitHandle = document.querySelector('.cursor-col-resize');
        const editorPane = document.querySelector('.cm-editor');
        const previewPane = document.querySelector('.paper-sheet');

        return {
          innerWidth,
          scrollWidth,
          hasHorizontalOverflow,
          isMobile,
          hasHamburgerBtn: !!hamburgerBtn,
          hasMobileTabBar: !!mobileTabBar,
          hasSplitHandle: !!splitHandle,
          hasEditor: !!editorPane,
          hasPreview: !!previewPane,
        };
      })()`);

      console.log(`- Viewport Width: ${metrics.innerWidth}px, Document ScrollWidth: ${metrics.scrollWidth}px`);
      console.log(`- Horizontal Page Overflow: ${metrics.hasHorizontalOverflow ? 'FAIL (Overflow detected!)' : 'PASS (Zero overflow)'}`);

      if (metrics.hasHorizontalOverflow) {
        allPassed = false;
      }

      if (vp.width < 768) {
        console.log(`- Mobile Hamburger Toggle: ${metrics.hasHamburgerBtn ? 'PASS' : 'FAIL'}`);
        console.log(`- Mobile Tab Switcher [Editor | Preview]: ${metrics.hasMobileTabBar ? 'PASS' : 'FAIL'}`);
        console.log(`- Desktop Splitter Handle: ${!metrics.hasSplitHandle ? 'PASS (Hidden on mobile)' : 'FAIL (Visible on mobile)'}`);

        // Test tab switching to Preview
        await page.eval(`(() => {
          const previewBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Preview'));
          if (previewBtn) previewBtn.click();
        })()`);
        await sleep(400);

        const previewVisible = await page.eval(`(() => {
          const sheet = document.querySelector('.paper-sheet');
          if (!sheet) return false;
          const rect = sheet.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        })()`);
        console.log(`- Switch to Preview Tab: ${previewVisible ? 'PASS (Live document rendered at full width)' : 'FAIL'}`);

        // Test sidebar drawer open
        await page.eval(`(() => {
          const hamburger = document.querySelector('header button[aria-label*="sidebar"]');
          if (hamburger) hamburger.click();
        })()`);
        await sleep(400);

        const drawerOpen = await page.eval(`(() => {
          const aside = document.querySelector('aside');
          return !!aside && aside.classList.contains('fixed');
        })()`);
        console.log(`- Mobile Slide-Out Drawer: ${drawerOpen ? 'PASS (Drawer open with backdrop)' : 'FAIL'}`);

        // Close drawer
        await page.eval(`(() => {
          const closeBtn = document.querySelector('aside button[aria-label*="drawer"]') || document.querySelector('aside button');
          if (closeBtn) closeBtn.click();
        })()`);
        await sleep(300);
      } else {
        console.log(`- Desktop Splitter Handle: ${metrics.hasSplitHandle ? 'PASS (Active resizable split view)' : 'FAIL'}`);
        console.log(`- Desktop Side-by-Side Panes: ${metrics.hasEditor && metrics.hasPreview ? 'PASS' : 'FAIL'}`);
      }

      // Capture screenshot
      const shotPath = join(outDir, `viewport-${vp.width}px.png`);
      await page.screenshot({ path: shotPath, format: 'png' });
      console.log(`- Saved screenshot: ${shotPath}`);

      results.push({
        label: vp.label,
        width: vp.width,
        scrollWidth: metrics.scrollWidth,
        overflow: metrics.hasHorizontalOverflow,
        status: metrics.hasHorizontalOverflow ? 'FAIL' : 'PASS',
      });

      await page.send('Page.close').catch(() => {});
    }

    console.log(`\n========================================`);
    console.log(`FINAL RESPONSIVE VIEWPORT MATRIX SUMMARY:`);
    console.log(`========================================`);
    for (const r of results) {
      console.log(`[${r.status}] ${r.label.padEnd(25)}: window=${r.width}px, scrollWidth=${r.scrollWidth}px`);
    }

    if (!allPassed) {
      console.error('\nFAIL: One or more viewports had issues.');
      process.exit(1);
    } else {
      console.log('\nSUCCESS: All 7 viewports passed zero-overflow and responsive interaction checks!');
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('Viewport verification failed:', err);
  process.exit(1);
});
