"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const baseURL = process.env.GAME_URL || "http://127.0.0.1:4173/wrong-floor/";

async function clickAction(page, action, extra = "") {
  await page.locator(`[data-action="${action}"]${extra}`).click();
}

async function goChapter(page, number) {
  await clickAction(page, "show-home");
  await page.locator(`[data-action="go-chapter"][data-chapter="${number}"]`).click();
}

async function solveChapter1(page) {
  await page.locator('[data-action="examine"]').click({ count: 1 }).catch(() => {});
  const examine = page.locator('[data-action="examine"]');
  for (let i = 0; i < 5; i += 1) await examine.nth(i).click();
  await page.locator('input[name="p01"][value="premise"]').check();
  await clickAction(page, "solve-p01");
  await assertText(page, "第二章已开放");
}

async function solveTimeline(page) {
  const expected = ["19:38", "19:42", "19:57", "20:00", "21:49", "22:24"];
  for (let destination = 0; destination < expected.length; destination += 1) {
    for (;;) {
      const items = await page.locator(".timeline-item").allTextContents();
      const current = items.findIndex(text => text.includes(expected[destination]));
      if (current === destination) break;
      await page.locator(".timeline-item").nth(current).locator("button").first().click();
    }
  }
  await clickAction(page, "solve-p02");
  await assertText(page, "不在场证明完全成立");
}

async function assertText(page, text) {
  await page.getByText(text, { exact: false }).first().waitFor();
}

async function reachChapter2Solved(page) {
  await page.goto(baseURL);
  assert.equal(await page.locator("#topbar").isVisible(), false, "case tools must stay hidden on title screen");
  await clickAction(page, "new-game");
  const examine = page.locator('[data-action="examine"]');
  for (let i = 0; i < 5; i += 1) await examine.nth(i).click();
  await page.locator('input[name="p01"][value="premise"]').check();
  await clickAction(page, "solve-p01");
  await goChapter(page, 2);
  const sourceCards = page.locator('[data-action="examine"]');
  for (let i = 0; i < 4; i += 1) await sourceCards.nth(i).click();
  await solveTimeline(page);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`page: ${error.message}`));

  await page.goto(baseURL);
  await clickAction(page, "new-game");

  let examine = page.locator('[data-action="examine"]');
  for (let i = 0; i < 5; i += 1) await examine.nth(i).click();
  await page.locator('input[name="p01"][value="premise"]').check();
  await clickAction(page, "solve-p01");

  await goChapter(page, 2);
  examine = page.locator('[data-action="examine"]');
  for (let i = 0; i < 4; i += 1) await examine.nth(i).click();
  await solveTimeline(page);

  await goChapter(page, 3);
  examine = page.locator('[data-action="examine"]');
  await examine.nth(0).click();
  await examine.nth(1).click();
  await page.locator("#dimension-number").fill("13");
  await page.locator("#dimension-meaning").selectOption("room");
  await clickAction(page, "solve-p03");

  await page.reload();
  await clickAction(page, "continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="4"]').waitFor();
  await page.locator('[data-action="go-chapter"][data-chapter="4"]').click();
  await page.locator('[data-action="examine"]').click();
  await page.locator('[data-action="toggle-blueprint"][data-id="2012"]').click();
  await page.locator('[data-action="toggle-blueprint"][data-id="2019"]').click();
  await clickAction(page, "solve-p04");

  await goChapter(page, 5);
  for (const id of ["socket", "scratch", "frame", "nail", "pipe", "impact"]) {
    await page.locator(`[data-action="find-diff"][data-diff="${id}"]`).click();
  }
  await clickAction(page, "solve-p05");
  await page.locator('input[name="p06"][value="14"]').check();
  await clickAction(page, "solve-p06");

  await goChapter(page, 6);
  await page.locator('[data-fact="card"]').selectOption("card");
  await page.locator('[data-fact="sound"]').selectOption("sound");
  await page.locator('[data-fact="dna"]').selectOption("dna");
  await clickAction(page, "solve-p07");
  await page.locator('input[name="p08"][value="pipe"]').check();
  await clickAction(page, "solve-p08");

  await goChapter(page, 7);
  for (const id of ["xuyoa", "guxue", "liangwen", "chengyi", "shenman", "zhoulan"]) {
    for (let round = 0; round < 3; round += 1) await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  }
  await page.locator('input[name="p09"][value="e_cufflink"]').check();
  await page.locator('input[name="p09"][value="e_cuffphoto"]').check();
  await clickAction(page, "solve-p09");

  await goChapter(page, 8);
  examine = page.locator('[data-action="examine"]');
  await examine.nth(0).click();
  await examine.nth(1).click();
  await page.locator('input[name="p10"][value="周岚"]').check();
  await clickAction(page, "solve-p10");
  await page.locator('input[name="p11"][value="chain"]').check();
  await clickAction(page, "solve-p11");

  await goChapter(page, 9);
  const report = {
    deathPlace: "1402", deathTime: "19:16", foundPlace: "1102", cardUser: "周岚",
    cufflink: "两周前遗留", sound: "14层管道结构传声", transferReason: "争取处理旧案资料的时间", culprit: "周岚"
  };
  for (const [key, value] of Object.entries(report)) await page.locator(`[data-report="${key}"]`).selectOption(value);
  await clickAction(page, "validate-report");
  const confrontation = { q1: "e_shelf", q2: "d_mirror", q3: "e_cardlog", q4: "e_permission", q5: "e_oldfile" };
  for (const [key, value] of Object.entries(confrontation)) await page.locator(`[data-confrontation="${key}"]`).selectOption(value);
  await clickAction(page, "validate-confrontation");
  await page.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(page, "正确的问题");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.ending, "D");
  assert.equal(saved.meta.endings.includes("D"), true);
  assert.equal(saved.evidence.length >= 20, true);
  assert.deepEqual(errors, []);

  await page.setViewportSize({ width: 390, height: 844 });
  await clickAction(page, "review-case");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.equal(overflow <= 1, true, `mobile overflow: ${overflow}px`);

  const failureContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const failurePage = await failureContext.newPage();
  await reachChapter2Solved(failurePage);
  await goChapter(failurePage, 2);
  await clickAction(failurePage, "accuse-xu");
  await clickAction(failurePage, "ending-b");
  await assertText(failurePage, "完美证据");
  const failureSave = await failurePage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(failureSave.ending, "B");

  await failureContext.close();
  await context.close();
  await browser.close();
  process.stdout.write("✓ natural best-ending flow, reload, mobile layout and failure ending\n");
})().catch(error => { console.error(error); process.exit(1); });
