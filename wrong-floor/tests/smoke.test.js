"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const baseURL = process.env.GAME_URL || "http://127.0.0.1:4173/wrong-floor/";
async function clickAction(page, action) { await page.locator(`[data-action="${action}"]`).click(); }
async function goHome(page) { await page.locator('[data-action="show-home"]').click(); }
async function goChapter(page, number) { await goHome(page); await page.locator(`[data-action="go-chapter"][data-chapter="${number}"]`).click(); }
async function assertText(page, text) { await page.getByText(text, { exact: false }).first().waitFor(); }

async function examineAll(page, count) {
  const cards = page.locator('[data-action="examine"]');
  for (let i = 0; i < count; i += 1) await cards.nth(i).click();
}

async function solveChapter1(page) {
  await examineAll(page, 5);
  await page.locator('input[name="p01"][value="death"]').check();
  await clickAction(page, "solve-p01");
  await assertText(page, "死亡地点目前只有默认前提");
}

async function solveChapter2(page) {
  await examineAll(page, 4);
  for (const id of ["e_checkin", "e_stream", "e_location"]) await page.locator(`input[name="p02"][value="${id}"]`).check();
  await clickAction(page, "solve-p02");
  await assertText(page, "连续覆盖");
}

async function completeInterview(page, id, requiredTopic, kind, evidence) {
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  const topics = page.locator('input[name="interview-topic"]');
  await page.locator(`input[name="interview-topic"][value="${requiredTopic}"]`).check();
  for (let i = 0; i < await topics.count(); i += 1) {
    if (!(await topics.nth(i).isChecked())) { await topics.nth(i).check(); break; }
  }
  await page.locator('[data-action="submit-interview-topic"]').click();
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-kind"][value="${kind}"]`).check();
  await page.locator('[data-action="submit-interview-kind"]').click();
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-evidence"][value="${evidence}"]`).check();
  await page.locator('[data-action="submit-interview-evidence"]').click();
}

async function reachChapter2Solved(page) {
  await page.goto(baseURL);
  await clickAction(page, "new-game");
  await solveChapter1(page);
  await goChapter(page, 2);
  await solveChapter2(page);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`page: ${error.message}`));

  await page.goto(baseURL);
  assert.equal(await page.locator("#topbar").isVisible(), false);
  await clickAction(page, "new-game");

  await clickAction(page, "show-timeline");
  const earlyTimeline = await page.locator("#app").innerText();
  assert.equal(earlyTimeline.includes("周岚进入"), false);
  assert.equal(earlyTimeline.includes("1402"), false);
  assert.equal(earlyTimeline.includes("19:16"), false);
  await goHome(page);
  const lockedOverview = await page.locator("#app").innerText();
  assert.equal(lockedOverview.includes("谁知道1402"), false);
  await page.locator('[data-action="go-chapter"][data-chapter="1"]').click();

  await solveChapter1(page);
  await goChapter(page, 2);
  await solveChapter2(page);

  await goChapter(page, 3);
  await examineAll(page, 2);
  await page.locator("#tile-ratio").fill("1.38");
  await page.locator("#plan-distance").fill("96");
  await page.locator("#fixed-check").selectOption("window");
  await page.locator('input[name="p03"][value="room"]').check();
  await clickAction(page, "solve-p03");

  await page.reload();
  await clickAction(page, "continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="4"]').click();
  await page.locator('[data-action="examine"]').click();
  await page.locator('[data-action="toggle-blueprint"][data-id="2012"]').click();
  await page.locator('[data-action="toggle-blueprint"][data-id="2019"]').click();
  for (const id of ["number", "door", "wall-kept", "pipe"]) await page.locator(`input[name="p04-change"][value="${id}"]`).check();
  await clickAction(page, "solve-p04");

  await clickAction(page, "show-map");
  await page.locator('[data-action="map-floor"][data-floor="14"]').click();
  await assertText(page, "房号已从旧图恢复");
  await goChapter(page, 5);
  for (const id of ["socket", "drag", "frame", "nail", "pipe", "impact"]) await page.locator(`[data-action="find-diff"][data-diff="${id}"]`).click();
  await page.locator('input[name="p05-proof"][value="impact"]').check();
  await page.locator('input[name="p05-proof"][value="drag"]').check();
  await clickAction(page, "solve-p05");
  await page.locator('[data-action="set-view-floor"][data-floor="14"]').click();
  await clickAction(page, "solve-p06");

  await goChapter(page, 6);
  const facts = { card:"card", sound:"sound", dna:"dna", cuff:"cuff", water:"water", injury:"injury", alibi:"alibi" };
  for (const [key,value] of Object.entries(facts)) await page.locator(`[data-fact="${key}"]`).selectOption(value);
  await clickAction(page, "solve-p07");
  await page.locator('input[name="p08"][value="pipe"]').check();
  await clickAction(page, "solve-p08");

  await goChapter(page, 7);
  await completeInterview(page, "guxue", "案发后去向", "omission", "e_copy");
  await completeInterview(page, "liangwen", "与死者通信", "omission", "e_message");
  await completeInterview(page, "shenman", "声音位置", "inference", "e_pipe");
  await completeInterview(page, "zhoulan", "物业旧图", "omission", "e_cardlog");
  await page.locator('input[name="p09"][value="e_cufflink"]').check();
  await page.locator('input[name="p09"][value="e_cuffphoto"]').check();
  await clickAction(page, "solve-p09");

  await clickAction(page, "show-notebook");
  await page.locator('[data-action="notebook-tab"][data-tab="deductions"]').click();
  await assertText(page, "已形成推论").catch(() => assertText(page, "DEDUCTION"));
  await page.locator('[data-action="notebook-tab"][data-tab="evidence"]').click();
  await page.locator("#notebook-person").selectOption("zhou");
  await page.locator('[data-action="pin-evidence"]').first().click();

  await goChapter(page, 8);
  await examineAll(page, 2);
  const matrix = {
    xuyoa_know:"no",xuyoa_permission:"no",xuyoa_blank:"no",xuyoa_card:"no",
    guxue_know:"no",guxue_permission:"no",guxue_blank:"maybe",guxue_card:"no",
    liangwen_know:"maybe",liangwen_permission:"no",liangwen_blank:"yes",liangwen_card:"no",
    chengyi_know:"no",chengyi_permission:"no",chengyi_blank:"yes",chengyi_card:"no",
    shenman_know:"no",shenman_permission:"no",shenman_blank:"yes",shenman_card:"no",
    zhoulan_know:"yes",zhoulan_permission:"yes",zhoulan_blank:"yes",zhoulan_card:"yes"
  };
  const clicks = { yes:1, no:2, maybe:3 };
  for (const [key,value] of Object.entries(matrix)) for (let i=0;i<clicks[value];i+=1) await page.locator(`[data-action="cycle-matrix"][data-key="${key}"]`).click();
  await clickAction(page, "solve-p10");
  const chain = { developer:"lower", supervisor:"approve", design:"sign", contractor:"execute" };
  for (const [key,value] of Object.entries(chain)) await page.locator(`[data-chain="${key}"]`).selectOption(value);
  await clickAction(page, "solve-p11");

  await goChapter(page, 9);
  const report = { deathPlace:"1402", deathTime:"19:16", foundPlace:"1102", cardUser:"周岚", cufflink:"两周前遗留", sound:"14层管道结构传声", transferReason:"争取处理旧案资料的时间", culprit:"周岚" };
  for (const [key,value] of Object.entries(report)) await page.locator(`[data-report="${key}"]`).selectOption(value);
  await clickAction(page, "validate-report");
  for (const evidence of ["e_impact", "e_floor", "e_cardlog", "e_permission", "e_oldfile"]) {
    await page.locator(`input[name="confrontation-evidence"][value="${evidence}"]`).check();
    await clickAction(page, "validate-confrontation");
  }
  await page.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(page, "正确的问题");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.version, 2);
  assert.equal(saved.ending, "D");
  assert.equal(saved.interviews.xuyoa, undefined);
  assert.deepEqual(errors, []);

  await page.setViewportSize({ width: 390, height: 844 });
  await clickAction(page, "review-case");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.equal(overflow <= 1, true, `mobile overflow: ${overflow}px`);

  const failureContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const failurePage = await failureContext.newPage();
  await reachChapter2Solved(failurePage);
  await goChapter(failurePage, 2);
  await failurePage.locator('[data-theory="culprit"]').selectOption("许遥");
  await failurePage.locator('[data-theory="place"]').selectOption("1102");
  await failurePage.locator('[data-theory="method"]').selectOption("未知");
  await clickAction(failurePage, "check-theory");
  await clickAction(failurePage, "ending-b");
  await assertText(failurePage, "完美证据");

  await failureContext.close(); await context.close(); await browser.close();
  process.stdout.write("✓ v2 natural best ending, dynamic spoilers, interactive tools, reload, mobile and theory failure\n");
})().catch(error => { console.error(error); process.exit(1); });
