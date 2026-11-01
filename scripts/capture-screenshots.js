import { chromium } from 'playwright';
import { spawn } from 'child_process';

async function run() {
  console.log('Starting preview server on port 4199...');
  const server = spawn('npx', ['vite', 'preview', '--port', '4199', '--strictPort'], {
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (d) => console.log('server:', d.toString().trim()));
  server.stderr.on('data', (d) => console.error('server err:', d.toString().trim()));

  // Wait for server to spin up
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Desktop 1440x900
    console.log('Capturing Desktop 1440px screenshot...');
    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await desktopPage.goto('http://localhost:4199', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(800);
    await desktopPage.screenshot({
      path: 'evidence/stage-2-build/frontend/desktop-1440px-baseline.png',
      fullPage: true,
    });
    console.log('Saved evidence/stage-2-build/frontend/desktop-1440px-baseline.png');

    // 2. Test Core Flow: Inject Speed Spoof Attack
    console.log('Injecting Speed Spoof Attack (140 mph)...');
    const spoofBtn = desktopPage.locator('button:has-text("Inject Speed Surge")');
    if (await spoofBtn.isVisible()) {
      await spoofBtn.click();
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: 'evidence/stage-2-build/frontend/desktop-1440px-attack-injected.png',
        fullPage: true,
      });
      console.log('Saved evidence/stage-2-build/frontend/desktop-1440px-attack-injected.png');
    }

    // 3. Desktop Bus Monitor Tab
    const monitorTab = desktopPage.locator('button:has-text("Bus Sniffer")');
    if (await monitorTab.isVisible()) {
      await monitorTab.click();
      await desktopPage.waitForTimeout(500);
      await desktopPage.screenshot({
        path: 'evidence/stage-2-build/frontend/desktop-1440px-bus-monitor.png',
        fullPage: true,
      });
      console.log('Saved evidence/stage-2-build/frontend/desktop-1440px-bus-monitor.png');
    }

    // 4. Mobile 390x844
    console.log('Capturing Mobile 390px screenshot...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    await mobilePage.goto('http://localhost:4199', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({
      path: 'evidence/stage-2-build/frontend/mobile-390px-cockpit.png',
      fullPage: true,
    });
    console.log('Saved evidence/stage-2-build/frontend/mobile-390px-cockpit.png');

    // Mobile IDS tab
    const idsTab = mobilePage.locator('button:has-text("IDS Agent")');
    if (await idsTab.isVisible()) {
      await idsTab.click();
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({
        path: 'evidence/stage-2-build/frontend/mobile-390px-ids-agent.png',
        fullPage: true,
      });
      console.log('Saved evidence/stage-2-build/frontend/mobile-390px-ids-agent.png');
    }

    console.log('All frontend screenshots captured successfully!');
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('Error during screenshot capture:', e);
  process.exit(1);
});
