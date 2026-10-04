"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const baseURL = process.env.GAME_URL || "http://127.0.0.1:4173/wrong-floor/";
const SAVE_KEY = "wrong-floor-save-v1";
const META_KEY = "wrong-floor-meta-v1";
const AUTO_REPORT_KEYS = ["deathPlace", "deathTime", "cardUser", "cufflink", "sound", "waterStart", "chainMethod"];
const FACT_MARKS = {
  card: ["person", "entry"], door: ["person", "direction", "carry"], sound: ["room", "fight"],
  dna: ["night", "alive"], cuff: ["night", "actor"], water: ["opened", "present"],
  injury: ["wall", "weapon"], alibi: ["innocent", "never"]
};
const RECONSTRUCTION_LINKS = {
  water: ["e_waterlab", "e_route"], card: ["e_cardlog", "e_cardauth"],
  transfer: ["e_cart", "e_route", "e_access", "e_doorcontact"], chain: ["e_lock", "e_chain_tests"],
  leave: ["e_hatch", "e_route", "e_doorcontact", "e_chain_tests"]
};

async function clickAction(page, action) { await page.locator(`[data-action="${action}"]`).first().click(); }
async function assertText(page, text) { await page.getByText(text, { exact: false }).first().waitFor(); }
async function savedState(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY); }
async function goHome(page) { await page.locator('#topbar [data-action="show-home"]').click(); }
async function goChapter(page, chapter) { await goHome(page); await page.locator(`[data-action="go-chapter"][data-chapter="${chapter}"]`).click(); }
async function activate(locator, touch = false) { if (touch) await locator.tap(); else await locator.click(); }

async function setRangeByTouch(page, selector, target, adjustSelector) {
  const slider = page.locator(selector);
  const bounds = await slider.boundingBox();
  const min = Number(await slider.getAttribute("min"));
  const max = Number(await slider.getAttribute("max"));
  const ratio = (target - min) / (max - min);
  await slider.tap({ position: { x: Math.max(1, Math.min(bounds.width - 1, bounds.width * ratio)), y: Math.max(1, bounds.height / 2) } });
  let value = Number(await slider.inputValue());
  let guard = 0;
  while (value !== target && guard < max - min + 3) {
    const delta = value < target ? "1" : "-1";
    await page.locator(`${adjustSelector}[data-delta="${delta}"]`).tap();
    value = Number(await slider.inputValue());
    guard += 1;
  }
  assert.equal(value, target, `touch range ${selector} should reach ${target}`);
}

async function setViewHeight(page, height, touch = false) {
  const slider = page.locator("[data-view-height]");
  if (touch) {
    const bounds = await slider.boundingBox();
    const ratio = (height - 11) / 4;
    await slider.tap({ position: { x: Math.max(1, Math.min(bounds.width - 1, bounds.width * ratio)), y: Math.max(1, bounds.height / 2) } });
  }
  await slider.evaluate((node, value) => {
    node.value = String(value);
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
  }, height);
  assert.equal(Number(await slider.inputValue()), height);
}

async function solveChapter1(page, touch = false) {
  const zone = id => page.locator(`.scene-board [data-action="examine"][data-id="${id}"]`);
  await activate(zone("access"), touch);
  await activate(zone("door"), touch);
  await activate(zone("body-injury"), touch);
  let state = await savedState(page);
  assert.equal(state.evidence.includes("e_body"), false, "injury alone must not synthesize the initial autopsy");
  await activate(zone("living-carpet"), touch);
  state = await savedState(page);
  assert.equal(state.evidence.includes("e_body"), true, "injury and clean carpet together should synthesize the initial autopsy");
  for (const id of ["shelf", "bath", "window-view"]) await activate(zone(id), touch);
  assert.equal(await page.locator(".scene-zone.is-examined").count(), 7, "all seven scene hotspots should be inspected");
  state = await savedState(page);
  assert.equal(state.evidence.includes("e_remote_sweep"), false, "supplemental sweep must remain optional");
  assert.equal(state.evidence.includes("e_access"), true);
  assert.equal(state.evidence.includes("e_doorcontact"), true);
  await page.locator('input[name="p01"][value="death"]').check();
  await clickAction(page, "solve-p01");
  await assertText(page, "死亡地点目前只有默认前提");
}

async function solveChapter2(page, touch = false) {
  for (const id of ["forum-video", "forum-travel", "forum-checkin", "old-photo"]) {
    await activate(page.locator(`[data-action="examine"][data-id="${id}"]`), touch);
  }
  for (const id of ["e_checkin", "e_stream", "e_location"]) await page.locator(`input[name="p02"][value="${id}"]`).check();
  await clickAction(page, "solve-p02");
  await assertText(page, "连续覆盖");
}

async function solveThroughChapter6(page, { checkSpoilers = false, touch = false } = {}) {
  await page.goto(baseURL);
  await clickAction(page, "new-game");
  if (checkSpoilers) {
    await clickAction(page, "show-timeline");
    const initialTimeline = await page.locator("#app").innerText();
    assert.equal(initialTimeline.includes("1402"), false);
    assert.equal(initialTimeline.includes("19:16"), false);
    await goChapter(page, 1);
  }
  await solveChapter1(page, touch);
  if (checkSpoilers) {
    await clickAction(page, "show-notebook");
    const notebookText = await page.locator("#app").innerText();
    assert.equal(notebookText.includes("1402 墙内结构件"), false);
    assert.equal(notebookText.includes("19:16—19:18"), false);
    assert.ok(notebookText.includes("不能单独证明通过者身份、方向或携带物"));
    await clickAction(page, "show-timeline");
    const timelineText = await page.locator("#app").innerText();
    assert.equal(timelineText.includes("19:16—19:18"), false);
    assert.ok(timelineText.includes("19:00—20:00"));
  }
  await goChapter(page, 2);
  await solveChapter2(page, touch);
  await goChapter(page, 3);
  for (const id of ["measure-photo", "measure-plan"]) await activate(page.locator(`[data-action="examine"][data-id="${id}"]`), touch);
  assert.equal(await page.locator(".target-notch").count(), 0, "P03 must not draw exact answer notches");
  if (touch) {
    await setRangeByTouch(page, '[data-measure="photo"]', 83, '[data-action="adjust-measure"][data-kind="photo"]');
    await setRangeByTouch(page, '[data-measure="plan"]', 96, '[data-action="adjust-measure"][data-kind="plan"]');
  } else {
    await page.locator('[data-measure="photo"]').fill("82");
    await page.locator('[data-measure="plan"]').fill("95");
  }
  await clickAction(page, "lock-p03-measure");
  await page.locator('input[name="p03-explanation"][value="furniture"]').check();
  await clickAction(page, "lock-p03-explanation");
  await page.reload();
  await clickAction(page, "continue-game");
  await assertText(page, "家具移动");
  await page.locator('input[name="p03-fixed"][value="window"]').check();
  await clickAction(page, "run-p03-fixed");
  await page.locator('input[name="p03-conclusion"][value="room"]').check();
  await clickAction(page, "solve-p03");
  await assertText(page, "推理成立 · P03");

  await goChapter(page, 4);
  await clickAction(page, "examine");
  await page.locator('[data-action="select-blueprint"][data-id="2012"]').click();
  await clickAction(page, "confirm-p04-first");
  await page.locator('[data-action="select-blueprint"][data-id="2019"]').click();
  await clickAction(page, "confirm-p04-second");
  await assertText(page, "图纸叠合模式");
  await page.locator('[data-action="set-blueprint-overlay"][data-mode="current"]').click();
  assert.equal(await page.locator(".blueprint-overlay.mode-current").count(), 1);
  await page.locator('[data-action="set-blueprint-overlay"][data-mode="blend"]').click();
  for (const id of ["number", "door", "wall-kept", "pipe"]) await page.locator(`input[name="p04-change"][value="${id}"]`).check();
  await clickAction(page, "solve-p04");
  let state = await savedState(page);
  assert.equal(state.factAnswers.p04OverlaySeen, true);
  assert.equal(state.factAnswers.p04OverlayMode, "blend");

  await clickAction(page, "show-map");
  await page.locator('[data-action="map-floor"][data-floor="14"]').click();
  await assertText(page, "房号已从旧图恢复");
  await goChapter(page, 5);
  const classifications = { socket: "fixed", drag: "night", frame: "fixed", nail: "history", pipe: "fixed", impact: "night" };
  for (const id of Object.keys(classifications)) await activate(page.locator(`[data-action="find-diff"][data-diff="${id}"]`), touch);
  assert.equal((await page.locator(".observation-list").innerText()).includes("属于固定装修差异"), false, "raw observations must not reveal classification");
  for (const [id, category] of Object.entries(classifications)) {
    await activate(page.locator(`[data-action="choose-difference-class"][data-diff="${id}"][data-class="${category}"]`), touch);
  }
  await clickAction(page, "save-p05-observations");
  for (const id of ["impact", "drag"]) await page.locator(`input[name="p05-proof"][value="${id}"]`).check();
  await clickAction(page, "solve-p05");
  await assertText(page, "推论形成：1402 为第一现场");
  if (checkSpoilers) {
    await clickAction(page, "show-timeline");
    assert.equal((await page.locator("#app").innerText()).includes("19:16—19:18"), false);
    await goChapter(page, 5);
  }
  await clickAction(page, "run-body-review");
  await assertText(page, "联合复核完成");
  for (const floor of [11, 13, 14]) await setViewHeight(page, floor, touch);
  assert.equal(await page.locator('[data-action="solve-p06"]').isEnabled(), true, "three compared heights should enable P06 submission");
  await page.locator('input[name="p06-height"][value="14"]').check();
  await clickAction(page, "solve-p06");

  await goChapter(page, 6);
  for (const [fact, tokens] of Object.entries(FACT_MARKS)) {
    for (const token of tokens) await activate(page.locator(`[data-action="toggle-fact-mark"][data-fact-card="${fact}"][data-token="${token}"]`), touch);
  }
  assert.equal(await page.locator(".strict-fact:not(.pending)").count(), 8, "all eight explanations should reduce to strict facts");
  assert.equal(await page.locator('[data-fact-cleanup="card"] [data-token="person"]').getAttribute("aria-pressed"), "true");
  await clickAction(page, "solve-p07");
  await page.locator('input[name="p08"][value="pipe"]').check();
  await clickAction(page, "solve-p08");
}

async function beginInterview(page, id, requiredTopic, kind) {
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-topic"][value="${requiredTopic}"]`).check();
  const topics = page.locator('input[name="interview-topic"]');
  for (let index = 0; index < await topics.count(); index += 1) {
    if (!(await topics.nth(index).isChecked())) { await topics.nth(index).check(); break; }
  }
  await clickAction(page, "submit-interview-topic");
  await page.locator(`[data-action="interview"][data-person="${id}"]`).click();
  await page.locator(`input[name="interview-kind"][value="${kind}"]`).check();
  await clickAction(page, "submit-interview-kind");
}

async function completeInterview(page, id, requiredTopic, kind, evidence, revealText, correctRoute) {
  await beginInterview(page, id, requiredTopic, kind);
  if (correctRoute) {
    if (id === "guxue") {
      await page.locator(`[data-action="investigate-lead"][data-person="${id}"][data-route="parking-camera"]`).click();
      assert.equal((await savedState(page)).evidence.includes("e_copy"), false, "wrong route must not award evidence");
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
  for (const id of ["e_cufflink", "e_cuffphoto"]) await page.locator(`input[name="p09"][value="${id}"]`).check();
  await clickAction(page, "solve-p09");
}

async function setMatrix(page) {
  const answers = { xuyoa: "alibi", guxue: "permission", liangwen: "permission", chengyi: "permission", shenman: "permission" };
  for (const [person, answer] of Object.entries(answers)) await page.locator(`[data-exclusion-input="${person}"]:visible`).selectOption(answer);
  for (const condition of ["know", "permission", "blank", "card"]) {
    const input = page.locator(`input[name="zhou-condition"][value="${condition}"]`);
    if (!(await input.isChecked())) await input.check();
  }
}

async function sortReconstruction(page, touch = false, exerciseDrag = false) {
  const wanted = ["water", "card", "transfer", "chain", "leave"];
  if (exerciseDrag) {
    const transfer=page.locator('[data-reconstruction-step="transfer"]');
    await transfer.scrollIntoViewIfNeeded();
    await page.locator('[data-reconstruction-step="water"]').dragTo(transfer, {
      sourcePosition:{ x:24, y:24 }, targetPosition:{ x:24, y:24 }
    });
    await assertText(page, "行为顺序已通过拖动更新");
  }
  for (let targetIndex = 0; targetIndex < wanted.length; targetIndex += 1) {
    let guard = 0;
    while (guard < 8) {
      const order = await page.locator("[data-reconstruction-step]").evaluateAll(nodes => nodes.map(node => node.dataset.reconstructionStep));
      const current = order.indexOf(wanted[targetIndex]);
      if (current <= targetIndex) break;
      const button = page.locator(`[data-reconstruction-step="${wanted[targetIndex]}"] [data-action="move-reconstruction"][data-delta="-1"]`);
      await activate(button, touch);
      await page.waitForFunction(step => {
        const card = document.querySelector(`[data-reconstruction-step="${step}"]`);
        return Boolean(card?.contains(document.activeElement));
      }, wanted[targetIndex]);
      guard += 1;
    }
  }
  assert.deepEqual(await page.locator("[data-reconstruction-step]").evaluateAll(nodes => nodes.map(node => node.dataset.reconstructionStep)), wanted);
}

async function selectAndAttach(page, evidence, steps, touch = false) {
  const card = page.locator(`[data-action="select-reconstruction-evidence"][data-reconstruction-evidence="${evidence}"]`);
  if (!String(await card.getAttribute("class")).includes("selected")) await activate(card, touch);
  const title = await card.locator("strong").innerText();
  for (const step of steps) {
    const chip = page.locator(`[data-reconstruction-step="${step}"] .attached-evidence-chip`).filter({ hasText: title });
    if (!(await chip.count())) await activate(page.locator(`[data-reconstruction-step="${step}"] [data-action="attach-reconstruction-evidence"]`), touch);
  }
}

async function solveReconstruction(page, { touch = false, exerciseDrag = false } = {}) {
  await clickAction(page, "validate-reconstruction");
  await assertText(page, "离开后无法再从室内挂上门链");
  await sortReconstruction(page, touch, exerciseDrag);
  if (exerciseDrag) {
    await page.locator('[data-reconstruction-evidence="e_waterlab"]').dragTo(page.locator('[data-reconstruction-step="water"]'));
    await assertText(page, "浴室渗漏复现实验");
  }
  await selectAndAttach(page, "e_waterlab", ["water"], touch);
  await selectAndAttach(page, "e_route", ["water", "transfer", "leave"], touch);
  await page.reload();
  await clickAction(page, "continue-game");
  await assertText(page, "P10-R · 犯罪时间轴");
  assert.equal(await page.locator('[data-reconstruction-step="water"] .attached-evidence-chip').count(), 2, "links should survive refresh");
  await page.locator('[data-reconstruction-step="water"] [data-action="show-notebook"]').click();
  await assertText(page, "返回第九章原位置");
  await clickAction(page, "return-from-notebook");
  await page.waitForFunction(() => document.activeElement?.matches('[data-reconstruction-step="water"] [data-action="attach-reconstruction-evidence"]'));
  await selectAndAttach(page, "e_cardlog", ["card"], touch);
  await selectAndAttach(page, "e_cardauth", ["card"], touch);
  await selectAndAttach(page, "e_cart", ["transfer"], touch);
  await selectAndAttach(page, "e_access", ["transfer"], touch);
  await selectAndAttach(page, "e_doorcontact", ["transfer", "leave"], touch);
  await selectAndAttach(page, "e_lock", ["chain", "water"], touch);
  await selectAndAttach(page, "e_chain_tests", ["chain", "leave"], touch);
  await selectAndAttach(page, "e_hatch", ["leave"], touch);
  await clickAction(page, "validate-reconstruction");
  await assertText(page, "只能回答其他问题的材料");
  await page.locator('[data-action="detach-reconstruction-evidence"][data-step="water"][data-evidence="e_lock"]').click();
  await clickAction(page, "validate-reconstruction");
  await assertText(page, "完整复原现在由你构建的时间轴生成");
  const state = await savedState(page);
  assert.equal(state.solved.includes("p10r"), true);
  assert.equal(state.evidence.includes("e_chaintrial"), true);
  assert.deepEqual([...state.reconstructionEvidence.leave].sort(), [...RECONSTRUCTION_LINKS.leave].sort());
}

async function prepareThroughChapter9(page, { touch = false, checkSpoilers = false, exerciseDrag = false } = {}) {
  await solveThroughChapter6(page, { touch, checkSpoilers });
  await goChapter(page, 7);
  await completeInterview(page, "guxue", "案发后去向", "omission", "e_copy", "19:03 我在停车场", "parking-access");
  await completeInterview(page, "liangwen", "与死者通信", "omission", "e_message", "附件收到了", "attachment-checksum");
  await beginInterview(page, "zhoulan", "物业旧图", "omission");
  await solveP09(page);
  await goChapter(page, 8);
  await clickAction(page, "continue-interlude");
  await page.locator('[data-action="examine"][data-id="permission-audit"]').click();
  await setMatrix(page);
  await clickAction(page, "solve-p10");
  await assertText(page, "处于“证据不足”");
  const hintButton = page.locator('[data-action="reveal-matrix-hint"][data-person="guxue"]:visible');
  await hintButton.click();
  const firstHint = await page.locator('.candidate-rationale, .matrix-rationale').filter({ hasText: "顾雪" }).filter({ hasText: "分层提示 1/3" }).first().innerText();
  assert.ok(firstHint.includes("缺口类别"));
  assert.equal(firstHint.includes("复制日志补全"), false, "first hint must not reveal complete rationale");
  await page.locator('[data-action="examine"][data-id="operation-audit"]').click();
  await page.locator('[data-action="examine"][data-id="conflict-review"]').click();
  assert.equal((await savedState(page)).evidence.includes("e_struggle"), true);
  await page.locator('[data-action="interview"][data-person="zhoulan"]').click();
  await page.locator('input[name="interview-evidence"][value="e_cardauth"]').check();
  await clickAction(page, "submit-interview-evidence");
  await assertText(page, "A047 也是我本人取出的");
  await clickAction(page, "record-interview");
  await goChapter(page, 8);
  await setMatrix(page);
  await clickAction(page, "solve-p10");
  await assertText(page, "现场复原已开放");
  await goHome(page);
  assert.equal(await page.locator('[data-action="go-chapter"][data-chapter="9"]').isEnabled(), true);
  assert.equal(await page.locator('[data-action="go-chapter"][data-chapter="10"]').isDisabled(), true);
  await page.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  await page.locator('[data-action="examine"][data-id="water-reenactment"]').click();
  await page.locator('[data-action="examine"][data-id="chain-reconstruction"]').click();
  await solveReconstruction(page, { touch, exerciseDrag });
  await assertText(page, "终章已开放");
}

async function solveOldCase(page) {
  await page.locator('[data-action="examine"][data-id="old-case-file"]').click();
  const links = { developer: ["file-a", "lower"], supervisor: ["file-b", "approve"], design: ["file-c", "sign"], contractor: ["file-d", "execute"] };
  for (const [actor, [file, action]] of Object.entries(links)) {
    await page.locator(`[data-action="select-chain-file"][data-file="${file}"]`).click();
    await page.locator(`[data-action="assign-chain-file"][data-actor="${actor}"]`).click();
    await page.locator(`[data-action="choose-chain-action"][data-actor="${actor}"][data-value="${action}"]`).click();
  }
  for (const id of ["e_casualty", "e_hr"]) await page.locator(`input[name="p11-private"][value="${id}"]`).check();
  await clickAction(page, "solve-p11");
  await assertText(page, "周屿是旧案遇难者");
}

async function fillReport(page, { exerciseDraft = false } = {}) {
  assert.equal(await page.locator("[data-report]").count(), 10);
  assert.equal(await page.locator("[data-report]:disabled").count(), 7);
  const manual = { transferReason: "伪造1102内晚间死亡", stager: "周岚", fatalActor: "周岚" };
  for (const [key, value] of Object.entries(manual)) await page.locator(`[data-report="${key}"]`).selectOption(value);
  for (let index = 0; index < AUTO_REPORT_KEYS.length - 1; index += 1) {
    await page.locator(`[data-action="toggle-report-adoption"][data-report-key="${AUTO_REPORT_KEYS[index]}"]`).click();
  }
  if (exerciseDraft) {
    await page.locator('#topbar [data-action="show-notebook"]').click();
    await assertText(page, "返回当前举证");
    await clickAction(page, "return-from-notebook");
    assert.equal(await page.locator('[data-report="stager"]').inputValue(), "周岚");
    await page.reload();
    await clickAction(page, "continue-game");
    await assertText(page, "P12 · 完整案件重构");
    assert.equal(await page.locator('[data-action="toggle-report-adoption"][aria-pressed="true"]').count(), 6);
  }
  await clickAction(page, "validate-report");
  await assertText(page, "既成事实确认");
  const lastKey = AUTO_REPORT_KEYS[AUTO_REPORT_KEYS.length - 1];
  await page.locator(`[data-action="toggle-report-adoption"][data-report-key="${lastKey}"]`).click();
  await clickAction(page, "validate-report");
  await assertText(page, "当前报告快照已通过");
  const state = await savedState(page);
  assert.deepEqual([...state.reportAdopted].sort(), [...AUTO_REPORT_KEYS].sort());
  assert.equal(state.verifiedReport.answers.stager, "周岚");
  assert.equal(state.verifiedReport.answers.fatalActor, "周岚");
  assert.equal(state.verifiedReport.revision, state.reportRevision);
}

async function submitProof(page, evidence) {
  for (const id of evidence) await page.locator(`input[name="confrontation-evidence"][value="${id}"]`).check();
  await clickAction(page, "validate-confrontation");
}

async function finishProofs(page, { oldCase = false, mobileChecks = false } = {}) {
  assert.ok((await page.locator("#current-confrontation .puzzle-tag").innerText()).includes(oldCase ? "1/3" : "1/2"));
  const summary = page.locator('[data-proof-id="e_body_review"] [data-action="toggle-proof-summary"]');
  await summary.click();
  assert.equal(await summary.getAttribute("aria-expanded"), "true");
  if (mobileChecks) {
    const metrics = await page.locator(".confrontation-toolbar").evaluate(node => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, viewport: document.documentElement.clientWidth };
    });
    assert.ok(metrics.left >= -1 && metrics.right <= metrics.viewport + 1);
    for (const id of ["e_impact", "e_body_review"]) await page.locator(`label:has(input[name="confrontation-evidence"][value="${id}"])`).tap();
    await page.locator('[data-action="toggle-selected-proofs"]').tap();
    assert.equal(await page.locator("[data-proof-id]").count(), 2);
    await page.locator('input[name="confrontation-evidence"][value="e_impact"]').uncheck();
    await page.waitForFunction(() => document.querySelectorAll("[data-proof-id]").length === 1);
    await page.locator('input[name="confrontation-evidence"][value="e_body_review"]').uncheck();
    await page.waitForFunction(() => document.querySelector(".proof-empty"));
    await assertText(page, "尚无已选材料");
    await page.locator('.proof-empty [data-action="toggle-selected-proofs"]').tap();
  }
  await submitProof(page, ["e_impact", "e_body_review", "e_watch"]);
  await assertText(page, "相关补强");
  for (const id of ["e_body_review", "e_struggle"]) await page.locator(`input[name="confrontation-evidence"][value="${id}"]`).check();
  await clickAction(page, "validate-confrontation");
  await assertText(page, "已支持");
  await assertText(page, "尚缺");
  await clickAction(page, "validate-confrontation");
  assert.equal(await page.locator('#feedback-confrontation [data-action="show-notebook"]').count(), 1, "repeated failures must not duplicate notebook buttons");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_struggle"]').isChecked(), true);
  await page.locator('#feedback-confrontation [data-action="show-notebook"]').click();
  await assertText(page, "返回当前举证");
  await clickAction(page, "return-from-notebook");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_struggle"]').isChecked(), true);
  await page.locator('input[name="confrontation-evidence"][value="e_route"]').check();
  await clickAction(page, "validate-confrontation");
  if (oldCase) await submitProof(page, ["e_oldfile", "e_casualty", "e_hr"]);
  await assertText(page, "等待公开决定");
}

async function testLegacyMigrations(browser) {
  const reconstructionContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const reconstructionPage = await reconstructionContext.newPage();
  await reconstructionPage.goto(baseURL);
  await reconstructionPage.evaluate(key => {
    localStorage.setItem(key, JSON.stringify({
      version: 6, started: true, chapter: 8, screen: "home", interludeSeen: true,
      solved: ["p01", "p02", "p03", "p04", "p05", "p05r", "p06", "p07", "p08", "p09", "p10", "p10r"],
      evidence: ["e_body_review", "e_cardauth", "e_route", "e_struggle", "e_waterlab", "e_hatch", "e_chaintrial", "e_doorcontact"],
      interviews: { guxue: 3, liangwen: 3 }, reconstructionOrder: ["leave", "chain", "card", "water", "transfer"]
    }));
  }, SAVE_KEY);
  await reconstructionPage.reload();
  await clickAction(reconstructionPage, "continue-game");
  await reconstructionPage.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  await assertText(reconstructionPage, "旧版复原结论已保留");
  const legacyPreview = await reconstructionPage.locator(".reconstruction-preview").innerText();
  assert.ok(legacyPreview.indexOf("离开") < legacyPreview.indexOf("放水"));
  assert.equal(await reconstructionPage.locator('[data-action="move-reconstruction"]:not([disabled])').count() > 0, true);
  let state = await savedState(reconstructionPage);
  assert.equal(state.version, 9);
  assert.equal(state.legacyReconstruction, true);
  assert.equal(state.solved.includes("p10r"), false);

  const inProgressContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const inProgressPage = await inProgressContext.newPage();
  const report = {
    deathPlace: "1402", deathTime: "19:16—19:18", cardUser: "周岚", cufflink: "两周前遗留",
    sound: "14层管道结构传声", transferReason: "伪造1102内晚间死亡", waterStart: "约20:46",
    chainMethod: "室内挂链后经浴室检修通道离开", stager: "周岚", fatalActor: "周岚"
  };
  await inProgressPage.goto(baseURL);
  await inProgressPage.evaluate(({ key, report }) => {
    const evidence = ["e_impact", "e_body_review", "e_cardlog", "e_cardauth", "e_route", "e_cufflink", "e_cuffphoto", "e_pipe", "e_floor", "e_waterlab", "e_lock", "e_hatch", "e_chaintrial", "e_doorcontact", "e_cart", "e_struggle", "e_access", "e_chain_tests", "e_watch"];
    localStorage.setItem(key, JSON.stringify({
      version: 8, started: true, chapter: 9, screen: "chapter-9", interludeSeen: true,
      solved: ["p01", "p02", "p03", "p04", "p05", "p05r", "p06", "p07", "p08", "p09", "p10", "p10r", "report", "p12"],
      evidence, interviews: { guxue: 3, liangwen: 3 }, report, reportRevision: 0,
      verifiedReport: { answers: report, revision: 0, ruleVersion: 8 },
      confrontation: { q1: ["e_impact", "e_body_review"], q2: ["e_floor", "e_cart"], q3: ["e_cardlog", "e_cardauth", "e_route"], q4: ["e_body_review", "e_route", "e_struggle"], q5: ["e_lock", "e_hatch", "e_chaintrial"] }
    }));
  }, { key: SAVE_KEY, report });
  await inProgressPage.reload();
  await clickAction(inProgressPage, "continue-game");
  await assertText(inProgressPage, "旧版举证已封存");
  state = await savedState(inProgressPage);
  assert.equal(state.chapter, 10);
  assert.equal(state.screen, "chapter-10");
  assert.equal(state.solved.includes("p12"), false);
  assert.equal(Object.keys(state.confrontation).length, 0);
  assert.equal(Object.keys(state.legacyProofRecords).length, 5);
  assert.deepEqual([...state.reportAdopted].sort(), [...AUTO_REPORT_KEYS].sort());

  const closedContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const closedPage = await closedContext.newPage();
  await closedPage.goto(baseURL);
  await closedPage.evaluate(({ key, report }) => {
    localStorage.setItem(key, JSON.stringify({
      version: 8, started: true, chapter: 9, screen: "chapter-9", ending: "D", solved: ["p12", "report"], report,
      confrontation: { q1: ["e_impact", "e_body_review"], q2: ["e_floor", "e_cart"], q3: ["e_cardlog", "e_cardauth", "e_route"], q4: ["e_body_review", "e_route", "e_struggle"], q5: ["e_lock", "e_hatch", "e_chaintrial"], q6: ["e_oldfile", "e_casualty", "e_hr"] },
      caseArchive: { saveVersion: 8, report, confrontation: { q1: ["e_impact", "e_body_review"] }, ending: "D" }
    }));
  }, { key: SAVE_KEY, report });
  await closedPage.reload();
  await clickAction(closedPage, "continue-game");
  await assertText(closedPage, "旧版报告与证明已按原规则封存");
  assert.equal(await closedPage.locator("[data-report]:disabled").count(), 10);
  state = await savedState(closedPage);
  assert.equal(state.chapter, 10);
  assert.equal(state.legacyCaseRecord.saveVersion, 8);
  await reconstructionContext.close();
  await inProgressContext.close();
  await closedContext.close();
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_BROWSER) launchOptions.executablePath = process.env.PLAYWRIGHT_BROWSER;
  const browser = await chromium.launch(launchOptions);
  const mainContext = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  const page = await mainContext.newPage();
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`page: ${error.message}`));

  await prepareThroughChapter9(page, { checkSpoilers: true, exerciseDrag: true });
  const lightTheme = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).backgroundColor,
    body: getComputedStyle(document.body).backgroundColor,
    scheme: getComputedStyle(document.documentElement).colorScheme,
    theme: document.querySelector('meta[name="theme-color"]')?.content
  }));
  assert.equal(lightTheme.html, "rgb(255, 255, 255)");
  assert.equal(lightTheme.body, "rgb(255, 255, 255)");
  assert.match(lightTheme.scheme, /light/);
  assert.equal(lightTheme.theme, "#ffffff");
  await clickAction(page, "show-map");
  await assertText(page, "服务梯 / 受监测通道");
  await assertText(page, "浴室检修口支路");
  await goChapter(page, 10);
  await solveOldCase(page);
  await fillReport(page, { exerciseDraft: true });
  await finishProofs(page, { oldCase: true });
  const pending = await page.evaluate(({ saveKey, metaKey }) => ({
    save: localStorage.getItem(saveKey),
    meta: localStorage.getItem(metaKey)
  }), { saveKey: SAVE_KEY, metaKey: META_KEY });
  await page.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(page, "正确的问题");
  let state = await savedState(page);
  assert.equal(state.version, 9);
  assert.equal(state.ending, "D");
  assert.equal(Object.keys(state.confrontation).length, 3);
  assert.deepEqual(errors, []);

  const cContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const cPage = await cContext.newPage();
  await cPage.goto(baseURL);
  await cPage.evaluate(({ save, meta, saveKey, metaKey }) => { localStorage.setItem(saveKey, save); localStorage.setItem(metaKey, meta); }, { ...pending, saveKey: SAVE_KEY, metaKey: META_KEY });
  await cPage.reload();
  await clickAction(cPage, "continue-game");
  await assertText(cPage, "等待公开决定");
  await cPage.locator('[data-report="stager"]').selectOption("许遥");
  await clickAction(cPage, "continue-disclosure");
  await assertText(cPage, "最终举证已保留 · 报告修改后待复核");
  state = await savedState(cPage);
  assert.equal(state.solved.includes("report"), false);
  assert.equal(state.solved.includes("p12"), true);
  assert.equal(Object.keys(state.confrontation).length, 3);
  await clickAction(cPage, "validate-report");
  await assertText(cPage, "现场置换者");
  await cPage.reload();
  await clickAction(cPage, "continue-game");
  assert.equal(await cPage.locator('[data-report="stager"]').inputValue(), "许遥");
  await cPage.locator('[data-report="stager"]').selectOption("周岚");
  await clickAction(cPage, "validate-report");
  await assertText(cPage, "当前报告快照已通过复核");
  await clickAction(cPage, "continue-disclosure");
  await cPage.locator('[data-action="choose-disclosure"][data-choice="culprit-only"]').click();
  await assertText(cPage, "不存在的房间");
  assert.equal((await savedState(cPage)).ending, "C");

  const bContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const bPage = await bContext.newPage();
  await bPage.goto(baseURL);
  await clickAction(bPage, "new-game");
  await solveChapter1(bPage);
  await goChapter(bPage, 2);
  await solveChapter2(bPage);
  await goChapter(bPage, 2);
  await bPage.locator('[data-theory="culprit"]').selectOption("许遥");
  await bPage.locator('[data-theory="place"]').selectOption("1102");
  await bPage.locator('[data-theory="method"]').selectOption("远程装置");
  await clickAction(bPage, "check-theory");
  await assertText(bPage, "与证据矛盾");
  await assertText(bPage, "排除性调查");
  await clickAction(bPage, "ending-b");
  await assertText(bPage, "完美证据");

  const mobileContext = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  mobilePage.on("pageerror", error => mobileErrors.push(error.message));
  await prepareThroughChapter9(mobilePage, { touch: true });
  let overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `chapter 9 mobile overflow: ${overflow}px`);
  await goChapter(mobilePage, 8);
  assert.equal(await mobilePage.locator(".mobile-exclusion-cards").evaluate(node => getComputedStyle(node).display), "grid");
  assert.equal(await mobilePage.locator(".desktop-exclusion").evaluate(node => getComputedStyle(node).display), "none");
  await goChapter(mobilePage, 10);
  await fillReport(mobilePage);
  await finishProofs(mobilePage, { mobileChecks: true });
  assert.equal(await mobilePage.locator('[data-action="choose-disclosure"][data-choice="culprit-only"]').count(), 0);
  await mobilePage.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(mobilePage, "正确答案");
  state = await savedState(mobilePage);
  assert.equal(state.ending, "A");
  assert.equal(state.solved.includes("p11"), false);
  assert.deepEqual(mobileErrors, []);
  for (const viewport of [{ width: 320, height: 740 }, { width: 360, height: 780 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await mobilePage.setViewportSize(viewport);
    overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `responsive overflow ${viewport.width}x${viewport.height}: ${overflow}px`);
  }

  await testLegacyMigrations(browser);
  const storageContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await storageContext.addInitScript(() => { Storage.prototype.setItem = function () { throw new DOMException("quota", "QuotaExceededError"); }; });
  const storagePage = await storageContext.newPage();
  const storageErrors = [];
  storagePage.on("pageerror", error => storageErrors.push(error.message));
  await storagePage.goto(baseURL);
  await clickAction(storagePage, "new-game");
  await assertText(storagePage, "本机存储写入失败");
  await assertText(storagePage, "P01");
  assert.deepEqual(storageErrors, []);

  await storageContext.close();
  await mobileContext.close();
  await bContext.close();
  await cContext.close();
  await mainContext.close();
  await browser.close();
  process.stdout.write("✓ v3.6 immersive interactions, split chapters, reconstruction builder, report adoption, endings and migrations\n");
})().catch(error => { console.error(error); process.exit(1); });
