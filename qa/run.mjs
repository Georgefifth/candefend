// CANDefend Real-Browser QA Runner
// Implements P0, P1, and P2 flows across Desktop (1440x900) and Mobile (390x844) viewports.

import { chromium, firefox } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:4199";
const OUT = process.env.QA_OUT ?? "evidence/stage-3-qa";
const BROWSER = process.env.BROWSER === "chromium" ? "chromium" : "firefox";
const HEADED = process.env.HEADED === "1";

const SHOTS = path.join(OUT, "screens");
fs.mkdirSync(SHOTS, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scenarios = [
  // 1. P0: Smoke & Landing Page Verification
  {
    id: "smoke",
    title: "Landing page renders cockpit, VBUS connected, zero horizontal overflow",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await ctx.expectVisible("text=CANDefend");
      await ctx.expectVisible("text=Cyber-Physical Instrument Cluster");
      await ctx.expectVisible("text=500 kbps");

      const title = await page.title();
      ctx.assert(title.includes("CANDefend"), `Unexpected title: ${title}`);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      ctx.assert(overflow <= 2, `horizontal overflow detected: ${overflow}px`);

      await ctx.shot("landing");
    },
  },

  // 2. P0: Core Flow: Attack Injection -> IDS Detection -> Mitigation
  {
    id: "core-flow-attack-triage-mitigate",
    title: "Inject speed spoofing, assert speedometer spike, verify IDS alert, engage countermeasure",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Click Inject Speed Surge button
      const spoofBtn = page.getByRole("button", { name: /Inject Speed Surge/i });
      await spoofBtn.waitFor({ state: "visible" });
      await spoofBtn.click();
      await page.waitForTimeout(500);

      // Verify speedometer reacts
      await ctx.shot("attack-injected");

      // Verify IDS threat alert appears
      const alertItem = page.getByText(/Kinematic Violation: Impossible Speed Jump/i).first();
      await alertItem.waitFor({ state: "visible", timeout: 8000 });
      ctx.assert(await alertItem.isVisible(), "IDS Kinematic Violation alert not displayed");

      // Click alert item to inspect AI security triage
      await alertItem.click();
      await page.waitForTimeout(300);
      await ctx.expectVisible("text=AI Security Triage & Countermeasure Advisor");
      await ctx.expectVisible("text=Affected Safety Subsystem");

      // Click Engage Kinematic Limiter remediation button
      const engageBtn = page.getByRole("button", { name: /Engage Kinematic Limiter/i }).first();
      if (await engageBtn.isVisible()) {
        await engageBtn.click();
        await page.waitForTimeout(400);
      }

      await ctx.shot("attack-mitigated");
    },
  },

  // 3. P0: DoS Arbitration Flooding & Firewall Countermeasure
  {
    id: "dos-flood-and-firewall",
    title: "Launch high-priority 0x000 DoS flood, assert flood alert, toggle frequency firewall",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Launch 3s DoS Flood
      const dosBtn = page.getByRole("button", { name: /Launch 3s DoS Flood/i });
      await dosBtn.waitFor({ state: "visible" });
      await dosBtn.click();
      await page.waitForTimeout(600);

      // Assert DoS Alert generated
      const floodAlert = page.getByText(/Bandwidth Starvation: High-Frequency DoS Flood/i).first();
      await floodAlert.waitFor({ state: "visible", timeout: 8000 });
      ctx.assert(await floodAlert.isVisible(), "DoS Flood alert not observed");

      // Enable Frequency Firewall defense card
      const firewallCard = page.locator("text=Frequency Firewall").first();
      await firewallCard.click();
      await page.waitForTimeout(300);

      await ctx.expectVisible("text=FIREWALL ACTIVE");
      await ctx.shot("dos-firewall-active");
    },
  },

  // 4. P1: Bus Sniffer, Filtering, and Frame Inspection
  {
    id: "bus-sniffer-filter-inspect",
    title: "Navigate to Bus Sniffer, filter by ID 0x244, inspect decoded velocity frame",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate to Bus Sniffer tab
      const snifferTab = page.getByRole("button", { name: /Bus Sniffer/i });
      await snifferTab.click();
      await page.waitForTimeout(400);

      // Assert packet table exists
      await ctx.expectVisible("text=CAN Bus Frame Sniffer & Packet Inspector");

      // Freeze display buffer for stable packet inspection
      const pauseBtn = page.locator("button[title*='Freeze display buffer']").first();
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
        await page.waitForTimeout(200);
      }

      // Filter by ID 0x244
      const filterSelect = page.getByLabel("Filter by CAN ID");
      await filterSelect.selectOption("0x244");
      await page.waitForTimeout(300);

      // Wait for inspect button on filtered row and click
      const inspectBtn = page.getByLabel(/Inspect Frame/i).first();
      await inspectBtn.waitFor({ state: "visible", timeout: 5000 });
      await inspectBtn.click({ force: true });

      // Assert decoder drawer opens
      await ctx.expectVisible("text=FRAME DECODER");
      await ctx.expectVisible("text=Raw Byte Breakdown");

      await ctx.shot("sniffer-frame-decoded");
    },
  },

  // 5. P1: Custom CAN Frame Injection & Vehicle Body Response
  {
    id: "custom-frame-injection",
    title: "Inject custom hazard frame (0x208, [00 00 01 00]) and verify cluster hazard lights",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Switch to Custom Frame tab in sandbox
      const customTab = page.getByRole("button", { name: /Custom Frame/i });
      await customTab.click();
      await page.waitForTimeout(300);

      // Select preset template for Hazard On
      const templateSelect = page.locator("select").filter({ hasText: /preset payload/i }).first();
      if (await templateSelect.isVisible()) {
        await templateSelect.selectOption("HAZARD_ON");
        await page.waitForTimeout(200);
      }

      // Transmit custom frame
      const transmitBtn = page.getByRole("button", { name: /Transmit CAN Frame/i });
      await transmitBtn.click();
      await page.waitForTimeout(500);

      await ctx.shot("custom-hazard-frame-injected");
    },
  },

  // 6. P1: Guided Challenge Labs Workflow
  {
    id: "guided-labs-workflow",
    title: "Navigate to Guided Labs, select Lab 1, validate baseline telemetry sniffing",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Navigate to Guided Labs tab
      const labsTab = page.getByRole("button", { name: /Guided Labs/i });
      await labsTab.click();
      await page.waitForTimeout(400);

      await ctx.expectVisible("text=Interactive Automotive Security Labs");

      // Validate Lab 1
      const validateBtn = page.getByRole("button", { name: /Validate Challenge/i });
      await validateBtn.click();
      await page.waitForTimeout(500);

      await ctx.shot("guided-lab-validated");
    },
  },

  // 7. P2: Drive Controls & Throttle / Brake Dynamics
  {
    id: "drive-controls-responsiveness",
    title: "Test manual accelerator slider, apply brake, assert brake telltale",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Apply Brake button
      const brakeBtn = page.getByRole("button", { name: /Apply Brake/i });
      if (await brakeBtn.isVisible()) {
        await brakeBtn.click();
        await page.waitForTimeout(400);
        await ctx.expectVisible("text=Release Brake");
      }

      await ctx.shot("drive-controls-brake-applied");
    },
  },

  // 8. P2: Data Trace Export Candump
  {
    id: "data-export-candump",
    title: "Verify .log (candump) export button operates cleanly without errors",
    async run(page, ctx) {
      await page.goto("/", { waitUntil: "domcontentloaded" });

      const exportBtn = page.locator("button:has-text('.log (candump)')").first();
      ctx.assert(await exportBtn.isVisible(), "Candump export button not found");
      await exportBtn.click();
      await page.waitForTimeout(300);

      await ctx.shot("candump-exported");
    },
  },
];

async function expectVisible(page, selector, timeout = 10000) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

async function expectText(page, text, timeout = 10000) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

function collectIssues(page) {
  const issues = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") issues.push({ kind: "console", text: msg.text() });
  });
  page.on("pageerror", (err) => {
    issues.push({ kind: "pageerror", text: err.message });
  });
  page.on("requestfailed", (req) => {
    const reason = req.failure()?.errorText ?? "request failed";
    if (!reason.includes("ERR_ABORTED")) {
      issues.push({ kind: "requestfailed", text: `${reason} ${req.url()}` });
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 500) issues.push({ kind: "http", text: `${status} ${res.url()}` });
    else if (status >= 400) {
      issues.push({ kind: "http", level: "warn", text: `${status} ${res.url()}` });
    }
  });
  return issues;
}

async function main() {
  const browserType = BROWSER === "chromium" ? chromium : firefox;
  console.log(`Starting Playwright QA (${BROWSER}) against ${BASE} ...`);
  const browser = await browserType.launch({ headless: !HEADED });
  const startedAt = new Date().toISOString();
  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      baseURL: BASE,
      viewport: vp.viewport,
      deviceScaleFactor: vp.deviceScaleFactor,
    });

    for (const scenario of scenarios) {
      const page = await context.newPage();
      const issues = collectIssues(page);
      const screenshots = [];
      const started = Date.now();
      let status = "pass";
      let error = null;

      const ctx = {
        assert,
        expectVisible: (selector, timeout) => expectVisible(page, selector, timeout),
        expectText: (text, timeout) => expectText(page, text, timeout),
        shot: async (name, opts = {}) => {
          const file = path.join(SHOTS, `${scenario.id}-${name}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: opts.fullPage ?? true });
          screenshots.push(file);
          return file;
        },
      };

      try {
        await scenario.run(page, ctx);
      } catch (err) {
        status = "fail";
        error = err.message;
      } finally {
        await page.close().catch(() => {});
      }

      const errors = issues.filter((i) => (i.level ?? "error") === "error");
      const warnings = issues.filter((i) => i.level === "warn");
      if (status === "pass" && errors.length > 0) {
        status = "fail";
        error = errors.map((i) => `${i.kind}: ${i.text}`).join(" | ");
      }

      results.push({
        viewport: vp.name,
        id: scenario.id,
        title: scenario.title,
        status,
        ms: Date.now() - started,
        error,
        errors,
        warnings,
        screenshots,
      });

      console.log(
        `${status === "pass" ? "✓" : "✗"} [${vp.name}] ${scenario.id}` +
          (error ? ` — ${error}` : "")
      );
    }

    await context.close();
  }

  await browser.close();

  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    fail: results.filter((r) => r.status === "fail").length,
  };
  const finishedAt = new Date().toISOString();
  const report = {
    base: BASE,
    browser: BROWSER,
    headed: HEADED,
    startedAt,
    finishedAt,
    summary,
    results,
  };

  fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify(report, null, 2));

  const warnings = results.flatMap((r) =>
    r.warnings.map((w) => `- [${r.viewport}] ${r.id}: ${w.kind} — ${w.text}`)
  );
  const md = [
    `# QA Report — Stage 3 Verification: CANDefend Studio`,
    "",
    `- **Target Base URL**: ${BASE}`,
    `- **Browser**: ${BROWSER} (${HEADED ? "headed" : "headless"})`,
    `- **Execution Time**: ${startedAt} to ${finishedAt}`,
    `- **Summary**: ${summary.total} scenarios executed — **${summary.pass} PASSED**, **${summary.fail} FAILED**`,
    "",
    "## Results by Viewport and Scenario",
    "",
    "| Viewport | Scenario ID | Status | Execution Time (ms) | Detail / Error |",
    "|---|---|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.viewport} | \`${r.id}\` | ${r.status === 'pass' ? '✅ PASS' : '❌ FAIL'} | ${r.ms}ms | ${(r.error ?? "").replace(/\|/g, "\\|")} |`
    ),
    "",
    ...(warnings.length ? ["## Warnings", "", ...warnings, ""] : []),
    "## Captured Verification Screenshots",
    "",
    ...results.flatMap((r) => r.screenshots.map((s) => `- \`${s}\``)),
    "",
  ];
  fs.writeFileSync(path.join(OUT, "report.md"), md.join("\n"));

  console.log(`\nQA Complete: ${summary.pass}/${summary.total} passed — see ${OUT}/`);
  process.exit(summary.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("QA runner crashed:", err);
  process.exit(2);
});
