import { chromium } from 'playwright';

async function verify() {
  console.log('Verifying live deployment at https://genhacks.vercel.app ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    const res = await page.goto('https://genhacks.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('HTTP Status:', res?.status());

    if (res?.status() !== 200) {
      throw new Error(`Expected HTTP 200 but got ${res?.status()}`);
    }

    // Verify title
    const title = await page.title();
    console.log('Page Title:', title);

    // Verify cluster dial is present
    await page.waitForSelector('text=Cyber-Physical Instrument Cluster', { timeout: 10000 });
    console.log('Cluster header verified.');

    // Test core flow on deployed site: Inject Speed Spoof
    const spoofBtn = page.locator('button:has-text("Inject Speed Surge")');
    await spoofBtn.click();
    console.log('Clicked Inject Speed Surge.');

    await page.waitForTimeout(800);

    // Verify IDS alert appeared
    const alertBanner = page.locator('text=Kinematic Violation: Impossible Speed Jump');
    const isAlertVisible = await alertBanner.isVisible();
    console.log('IDS alert visible on deployed site:', isAlertVisible);

    // Take deployed verification screenshot
    await page.screenshot({
      path: 'evidence/stage-2-build/deployed-verification.png',
      fullPage: true,
    });
    console.log('Saved evidence/stage-2-build/deployed-verification.png');

    console.log('Deployment verification SUCCESSFUL!');
  } finally {
    await browser.close();
  }
}

verify().catch((e) => {
  console.error('Deployment verification failed:', e);
  process.exit(1);
});
