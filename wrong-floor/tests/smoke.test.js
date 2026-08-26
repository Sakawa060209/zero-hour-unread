"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const baseURL = process.env.GAME_URL || "http://127.0.0.1:4173/wrong-floor/";
async function clickAction(page, action) { await page.locator(`[data-action="${action}"]`).click(); }
async function goHome(page) { await page.locator('[data-action="show-home"]').click(); }
async function goChapter(page, number) { await goHome(page); await page.locator(`[data-action="go-chapter"][data-chapter="${number}"]`).click(); }
async function assertText(page, text) { await page.getByText(text, { exact: false }).first().waitFor(); }

async function examineAll(page, count) {
  for (let i = 0; i < count; i += 1) await page.locator('[data-action="examine"]').nth(i).click();
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

async function solveThroughChapter6(page, checkSpoilers = false) {
  await page.goto(baseURL);
  await clickAction(page, "new-game");

  if (checkSpoilers) {
    await clickAction(page, "show-timeline");
    const earlyTimeline = await page.locator("#app").innerText();
    assert.equal(earlyTimeline.includes("周岚进入"), false);
    assert.equal(earlyTimeline.includes("1402"), false);
    assert.equal(earlyTimeline.includes("19:16"), false);
    await goHome(page);
    const lockedOverview = await page.locator("#app").innerText();
    assert.equal(lockedOverview.includes("谁知道1402"), false);
    await page.locator('[data-action="go-chapter"][data-chapter="1"]').click();
  }

  await solveChapter1(page);
  await goChapter(page, 2);
  await solveChapter2(page);
  await goChapter(page, 3);
  await examineAll(page, 2);
  await page.locator('[data-measure="photo"]').fill("83");
  await page.locator('[data-measure="plan"]').fill("96");
  await clickAction(page, "lock-p03-measure");
  await page.locator('input[name="p03-explanation"][value="room"]').check();
  await clickAction(page, "lock-p03-explanation");
  await page.locator('input[name="p03-fixed"][value="window"]').check();
  await clickAction(page, "solve-p03");
  await assertText(page, "推理成立 · P03");

  await page.reload();
  await clickAction(page, "continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="4"]').click();
  await page.locator('[data-action="examine"]').click();
  await page.locator('[data-action="select-blueprint"][data-id="2012"]').click();
  await clickAction(page, "confirm-p04-first");
  await page.locator('[data-action="select-blueprint"][data-id="2019"]').click();
  await clickAction(page, "confirm-p04-second");
  for (const id of ["number", "door", "wall-kept", "pipe"]) await page.locator(`input[name="p04-change"][value="${id}"]`).check();
  await clickAction(page, "solve-p04");

  await clickAction(page, "show-map");
  await page.locator('[data-action="map-floor"][data-floor="14"]').click();
  await assertText(page, "房号已从旧图恢复");
  await goChapter(page, 5);
  for (const id of ["socket", "drag", "frame", "nail", "pipe", "impact"]) await page.locator(`[data-action="find-diff"][data-diff="${id}"]`).click();
  await clickAction(page, "save-p05-observations");
  await page.locator('input[name="p05-proof"][value="impact"]').check();
  await page.locator('input[name="p05-proof"][value="frame"]').check();
  await clickAction(page, "solve-p05");
  await assertText(page, "无关的材料");
  await page.locator('input[name="p05-proof"][value="frame"]').uncheck();
  await page.locator('input[name="p05-proof"][value="drag"]').check();
  await clickAction(page, "solve-p05");
  await assertText(page, "推论形成：1402 为第一现场");
  for (const floor of [11,12,14]) await page.locator(`[data-action="set-view-floor"][data-floor="${floor}"]`).click();
  await clickAction(page, "solve-p06");

  await goChapter(page, 6);
  const facts = { card:"card", sound:"sound", dna:"dna", cuff:"cuff", water:"water", injury:"injury", alibi:"alibi" };
  for (const [key, value] of Object.entries(facts)) await page.locator(`[data-fact="${key}"]`).selectOption(value);
  await clickAction(page, "solve-p07");
  await page.locator('input[name="p08"][value="pipe"]').check();
  await clickAction(page, "solve-p08");
}

async function completeInterview(page, id, requiredTopic, kind, evidence, revealText, correctRoute) {
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  const topics = page.locator('input[name="interview-topic"]');
  await page.locator(`input[name="interview-topic"][value="${requiredTopic}"]`).check();
  for (let i = 0; i < await topics.count(); i += 1) {
    if (!(await topics.nth(i).isChecked())) { await topics.nth(i).check(); break; }
  }
  await clickAction(page, "submit-interview-topic");
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-kind"][value="${kind}"]`).check();
  await clickAction(page, "submit-interview-kind");
  const lead = page.locator(`[data-action="investigate-lead"][data-person="${id}"]`);
  if (await lead.count()) {
    if (id === "guxue") {
      await page.locator(`[data-action="investigate-lead"][data-person="${id}"][data-route="parking-camera"]`).click();
      const interim = await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
      assert.equal(interim.evidence.includes("e_copy"), false, "a plausible but wrong external route must not auto-award the interview proof");
    }
    await page.locator(`[data-action="investigate-lead"][data-person="${id}"][data-route="${correctRoute}"]`).click();
  }
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-evidence"][value="${evidence}"]`).check();
  await clickAction(page, "submit-interview-evidence");
  await assertText(page, revealText);
  await clickAction(page, "record-interview");
}

async function solveP09(page) {
  await page.locator('input[name="p09"][value="e_cufflink"]').check();
  await page.locator('input[name="p09"][value="e_cuffphoto"]').check();
  await clickAction(page, "solve-p09");
}

async function fillMatrix(page) {
  const exclusions = { xuyoa:"alibi", guxue:"permission", liangwen:"permission", chengyi:"permission", shenman:"permission" };
  for (const [person,reason] of Object.entries(exclusions)) await page.locator(`[data-exclusion="${person}"]`).selectOption(reason);
  for (const condition of ["know","permission","blank","card"]) await page.locator(`input[name="zhou-condition"][value="${condition}"]`).check();
  await clickAction(page, "solve-p10");
  await assertText(page, "主案报告已开放");
}

async function solveOldCase(page) {
  const links = {
    developer:["file-a","lower"], supervisor:["file-b","approve"],
    design:["file-c","sign"], contractor:["file-d","execute"]
  };
  for (const [actor,[file,action]] of Object.entries(links)) {
    await page.locator(`[data-action="select-chain-file"][data-file="${file}"]`).click();
    await page.locator(`[data-action="assign-chain-file"][data-actor="${actor}"]`).click();
    await page.locator(`[data-action="choose-chain-action"][data-actor="${actor}"][data-value="${action}"]`).click();
  }
  await page.locator('input[name="p11-private"][value="e_casualty"]').check();
  await page.locator('input[name="p11-private"][value="e_hr"]').check();
  await clickAction(page, "solve-p11");
  await assertText(page, "周屿是旧案遇难者");
}

async function fillReport(page) {
  const report = { deathPlace:"1402", deathTime:"19:16", foundPlace:"1102", cardUser:"周岚", cufflink:"两周前遗留", sound:"14层管道结构传声", transferReason:"伪造1102内晚间死亡", culprit:"周岚" };
  for (const [key, value] of Object.entries(report)) await page.locator(`[data-report="${key}"]`).selectOption(value);
  await clickAction(page, "validate-report");
  const feedback = await page.locator("#feedback-report").innerText();
  assert.match(feedback, /报告通过一致性校验/, `report feedback: ${feedback}`);
}

async function confront(page, routes) {
  for (const route of routes) {
    for (const evidence of route) await page.locator(`input[name="confrontation-evidence"][value="${evidence}"]`).check();
    await clickAction(page, "validate-confrontation");
    if (route.includes("e_impact")) await assertText(page, "独立来源共同指向致命冲突现场");
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`page: ${error.message}`));

  await solveThroughChapter6(page, true);
  await clickAction(page, "show-notebook");
  await page.locator("#notebook-person").selectOption("zhou");
  const prematureZhouEvidence = await page.locator("#app").innerText();
  assert.equal(prematureZhouEvidence.includes("OPS-04"), false, "raw OPS-04 log must not be filed under Zhou before account mapping");

  await goChapter(page, 7);
  await completeInterview(page, "guxue", "案发后去向", "omission", "e_copy", "19:03 我在停车场", "parking-access");
  await completeInterview(page, "liangwen", "与死者通信", "omission", "e_message", "附件收到了", "attachment-checksum");
  await completeInterview(page, "shenman", "声音位置", "inference", "e_pipe", "管井旁听见");
  await completeInterview(page, "zhoulan", "物业旧图", "omission", "e_cardlog", "现行系统");
  await solveP09(page);

  await clickAction(page, "show-notebook");
  await page.locator('[data-action="notebook-tab"][data-tab="deductions"]').click();
  await assertText(page, "DEDUCTION");
  await assertText(page, "关联证据");
  await page.locator('[data-action="notebook-tab"][data-tab="evidence"]').click();
  await page.locator("#notebook-person").selectOption("all");
  await assertText(page, "独立来源");
  await page.locator('[data-action="pin-evidence"]').first().click();

  await goChapter(page, 8);
  await assertText(page, "00:48");
  await clickAction(page, "continue-interlude");
  await assertText(page, "证据不足");
  await examineAll(page, 3);
  await page.locator('[data-action="toggle-matrix-rationale"][data-person="guxue"]').click();
  await assertText(page, "权限审计明确排除她");
  await fillMatrix(page);
  await solveOldCase(page);

  await clickAction(page, "show-timeline");
  await assertText(page, "约20:46");

  await goChapter(page, 9);
  await fillReport(page);
  await confront(page, [
    ["e_impact", "e_watch"], ["e_floor", "e_cart"],
    ["e_cardlog", "e_accountmap", "e_shift"], ["e_permission"]
  ]);

  const cSave = await page.evaluate(() => ({ save: localStorage.getItem("wrong-floor-save-v1"), meta: localStorage.getItem("wrong-floor-meta-v1") }));
  const cContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  await cContext.addInitScript(values => {
    localStorage.setItem("wrong-floor-save-v1", values.save);
    localStorage.setItem("wrong-floor-meta-v1", values.meta);
  }, cSave);
  const cPage = await cContext.newPage();
  await cPage.goto(baseURL);
  await clickAction(cPage, "continue-game");
  await cPage.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  await confront(cPage, [["e_oldfile", "e_casualty", "e_hr"]]);
  await cPage.locator('[data-action="choose-disclosure"][data-choice="culprit-only"]').click();
  await assertText(cPage, "不存在的房间");
  const cSaved = await cPage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(cSaved.ending, "C");

  await confront(page, [["e_oldfile", "e_casualty", "e_hr"]]);
  await page.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(page, "正确的问题");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.version, 4);
  assert.equal(saved.ending, "D");
  assert.equal(saved.interviews.xuyoa, undefined);
  assert.deepEqual(errors, []);

  await page.setViewportSize({ width: 390, height: 844 });
  await clickAction(page, "review-case");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.equal(overflow <= 1, true, `mobile overflow: ${overflow}px`);
  await page.locator('[data-action="go-chapter"][data-chapter="5"]').click();
  await clickAction(page, "resume-p05-observation");
  const touchSize = await page.locator('[data-action="find-diff"]').first().evaluate(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }));
  assert.equal(touchSize.width >= 42 && touchSize.height >= 42, true, `P05 touch target: ${touchSize.width}x${touchSize.height}`);
  await goChapter(page, 8);
  const sticky = await page.locator(".matrix tbody tr td:first-child").first().evaluate(node => getComputedStyle(node).position);
  assert.equal(sticky, "sticky");

  const failureContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const failurePage = await failureContext.newPage();
  await failurePage.goto(baseURL);
  await clickAction(failurePage, "new-game");
  await solveChapter1(failurePage);
  await goChapter(failurePage, 2);
  await solveChapter2(failurePage);
  await goChapter(failurePage, 2);
  await failurePage.locator('[data-theory="culprit"]').selectOption("许遥");
  await failurePage.locator('[data-theory="place"]').selectOption("1102");
  await failurePage.locator('[data-theory="method"]').selectOption("远程装置");
  await clickAction(failurePage, "check-theory");
  await assertText(failurePage, "与证据矛盾");
  await clickAction(failurePage, "ending-b");
  await assertText(failurePage, "完美证据");
  await assertText(failurePage, "报告内部自洽度不足");

  const aContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const aPage = await aContext.newPage();
  await solveThroughChapter6(aPage);
  await goChapter(aPage, 7);
  await completeInterview(aPage, "guxue", "案发后去向", "omission", "e_copy", "19:03 我在停车场", "parking-access");
  await completeInterview(aPage, "liangwen", "与死者通信", "omission", "e_message", "附件收到了", "attachment-checksum");
  await solveP09(aPage);
  await goChapter(aPage, 8);
  await clickAction(aPage, "continue-interlude");
  await aPage.locator('[data-action="examine"][data-id="permission-audit"]').click();
  await aPage.locator('[data-action="examine"][data-id="water-reenactment"]').click();
  await fillMatrix(aPage);
  await goChapter(aPage, 9);
  await fillReport(aPage);
  await confront(aPage, [
    ["e_impact", "e_body"], ["e_floor", "e_cart"],
    ["e_cardlog", "e_accountmap", "e_shift"], ["e_permission"]
  ]);
  await aPage.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(aPage, "正确答案");
  const aSaved = await aPage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(aSaved.ending, "A");
  assert.equal(aSaved.solved.includes("p11"), false);

  await aContext.close(); await failureContext.close(); await cContext.close(); await context.close(); await browser.close();
  process.stdout.write("✓ v3.1 natural A/C/D endings, branched external investigation, exclusion table, responsibility puzzle, theory failure and mobile controls\n");
})().catch(error => { console.error(error); process.exit(1); });
