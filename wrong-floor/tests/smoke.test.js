"use strict";

const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const baseURL = process.env.GAME_URL || "http://127.0.0.1:4173/wrong-floor/";
async function clickAction(page, action) { await page.locator(`[data-action="${action}"]`).click(); }
async function goHome(page) { await page.locator('[data-action="show-home"]').click(); }
async function goChapter(page, number) { await goHome(page); await page.locator(`[data-action="go-chapter"][data-chapter="${number}"]`).click(); }
async function assertText(page, text) { await page.getByText(text, { exact: false }).first().waitFor(); }

async function setRangeByTouch(page, kind, target) {
  const slider=page.locator(`[data-measure="${kind}"]`);
  const bounds=await slider.boundingBox();
  const max=Number(await slider.getAttribute("max"));
  await slider.tap({ position:{ x:Math.max(1,Math.min(bounds.width-1,bounds.width*target/max)), y:Math.max(1,bounds.height/2) } });
  let value=Number(await slider.inputValue());
  const direction=value < target ? "1" : "-1";
  while(value !== target) {
    await page.locator(`[data-action="adjust-measure"][data-kind="${kind}"][data-delta="${direction}"]`).tap();
    value=Number(await slider.inputValue());
  }
}

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

async function solveThroughChapter6(page, checkSpoilers = false, touchMeasurement = false) {
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
  if (checkSpoilers) {
    await clickAction(page, "show-notebook");
    const chapterOneNotebook=await page.locator("#app").innerText();
    assert.equal(chapterOneNotebook.includes("1402 墙内结构件"),false,"chapter-one autopsy must not reveal the hidden scene");
    assert.equal(chapterOneNotebook.includes("19:16—19:18"),false,"chapter-one autopsy must not reveal the precise death interval");
    await clickAction(page,"show-timeline");
    const chapterOneTimeline=await page.locator("#app").innerText();
    assert.equal(chapterOneTimeline.includes("19:16—19:18"),false,"timeline must stay broad before the joint review");
    assert.ok(chapterOneTimeline.includes("19:00—20:00"),"initial autopsy should expose only the broad interval");
  }
  await goChapter(page, 2);
  await solveChapter2(page);
  await goChapter(page, 3);
  await examineAll(page, 2);
  if (touchMeasurement) {
    await setRangeByTouch(page,"photo",83);
    await setRangeByTouch(page,"plan",96);
  } else {
    await page.locator('[data-measure="photo"]').fill("82");
    await page.locator('[data-action="adjust-measure"][data-kind="photo"][data-delta="1"]').click();
    await page.locator('[data-measure="plan"]').fill("95");
    await page.locator('[data-action="adjust-measure"][data-kind="plan"][data-delta="1"]').click();
  }
  await clickAction(page, "lock-p03-measure");
  await page.locator('input[name="p03-explanation"][value="furniture"]').check();
  await clickAction(page, "lock-p03-explanation");
  await page.reload();
  await clickAction(page, "continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="3"]').click();
  await assertText(page, "家具移动");
  await page.locator('input[name="p03-fixed"][value="window"]').check();
  await clickAction(page, "run-p03-fixed");
  await assertText(page, "固定结构复核结果");
  await page.locator('input[name="p03-conclusion"][value="room"]').check();
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
  for (const id of ["socket", "drag", "frame", "nail", "pipe", "impact"]) {
    const hotspot=page.locator(`[data-action="find-diff"][data-diff="${id}"]`);
    if (touchMeasurement) await hotspot.tap(); else await hotspot.click();
  }
  await clickAction(page, "save-p05-observations");
  await page.locator('input[name="p05-proof"][value="impact"]').check();
  await page.locator('input[name="p05-proof"][value="frame"]').check();
  await clickAction(page, "solve-p05");
  await assertText(page, "无关的材料");
  await page.locator('input[name="p05-proof"][value="frame"]').uncheck();
  await page.locator('input[name="p05-proof"][value="drag"]').check();
  await clickAction(page, "solve-p05");
  await assertText(page, "推论形成：1402 为第一现场");
  if (checkSpoilers) {
    await clickAction(page,"show-timeline");
    const beforeReview=await page.locator("#app").innerText();
    assert.equal(beforeReview.includes("19:16—19:18"),false,"scene discovery alone must not create the precise death interval");
    await goChapter(page,5);
  }
  await clickAction(page,"run-body-review");
  await assertText(page,"联合复核完成");
  const reviewed=await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(reviewed.evidence.includes("e_body_review"),true);
  assert.equal(reviewed.solved.includes("p05r"),true);
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

async function setMatrix(page) {
  const exclusions = { xuyoa:"alibi", guxue:"permission", liangwen:"permission", chengyi:"permission", shenman:"permission" };
  for (const [person,reason] of Object.entries(exclusions)) await page.locator(`[data-exclusion-input="${person}"]:visible`).selectOption(reason);
  for (const condition of ["know","permission","blank","card"]) await page.locator(`input[name="zhou-condition"][value="${condition}"]`).check();
}

async function fillMatrix(page) {
  await setMatrix(page);
  await clickAction(page, "solve-p10");
  const saved=await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.solved.includes("p10"),true,"P10 should solve only after all four evidence-backed conditions exist");
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

async function solveReconstruction(page, touch = false) {
  await clickAction(page,"validate-reconstruction");
  await assertText(page,"离开后无法再从室内挂上门链");
  const wanted=["water","card","transfer","chain","leave"];
  for (let targetIndex=0; targetIndex<wanted.length; targetIndex+=1) {
    while (true) {
      const order=await page.locator("[data-reconstruction-step]").evaluateAll(nodes=>nodes.map(node=>node.dataset.reconstructionStep));
      const current=order.indexOf(wanted[targetIndex]);
      if (current <= targetIndex) break;
      const control=page.locator(`[data-reconstruction-step="${wanted[targetIndex]}"] [data-action="move-reconstruction"][data-delta="-1"]`);
      if (touch) await control.tap(); else await control.click();
      const movedFocus=await page.locator(`[data-reconstruction-step="${wanted[targetIndex]}"]`).evaluate(node=>node.contains(document.activeElement));
      assert.equal(movedFocus,true,"sorting redraw must return focus to the moved step");
    }
  }
  await assertText(page,"已移至第");
  const returnButton=page.locator('[data-reconstruction-step="water"] [data-action="show-notebook"]');
  await returnButton.click();
  await assertText(page,"返回第八章原位置");
  await clickAction(page,"return-from-notebook");
  await page.waitForFunction(() => document.activeElement?.matches('[data-reconstruction-step="water"] [data-action="show-notebook"]'));
  assert.equal(await returnButton.evaluate(node=>document.activeElement===node),true,"notebook return should restore the reconstruction control");

  const sources={water:"e_waterlab",card:"e_cardlog",transfer:"e_cart",chain:"e_lock",leave:"e_hatch"};
  for (const [step,evidence] of Object.entries(sources)) await page.locator(`[data-reconstruction-source="${step}"]`).selectOption(evidence);
  const support={water:"water-route",card:"card-identity",transfer:"transfer-route",chain:"chain-constraints",leave:"exit-route"};
  for (const [step,value] of Object.entries(support)) {
    if (step !== "transfer") await page.locator(`[data-reconstruction-support="${step}"]`).selectOption(value);
  }
  await page.locator('[data-reconstruction-step="transfer"] [data-action="show-notebook"]').click();
  await assertText(page,"搬运车轮迹");
  await page.waitForFunction(() => document.activeElement?.matches('[data-notebook-evidence="e_cart"]'));
  assert.equal(await page.locator('[data-notebook-evidence="e_cart"]').evaluate(node=>document.activeElement===node),true,"a reconstruction lookup should focus its selected primary source");
  await clickAction(page,"return-from-notebook");
  assert.equal(await page.locator('[data-reconstruction-source="transfer"]').inputValue(),"e_cart");
  await clickAction(page,"validate-reconstruction");
  await assertText(page,"不能单独支持 21:41");
  await page.locator('[data-reconstruction-support="transfer"]').selectOption("transfer-route");
  await page.reload();
  await clickAction(page,"continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="8"]').click();
  assert.equal(await page.locator('[data-reconstruction-source="card"]').inputValue(),"e_cardlog","reconstruction source draft must survive refresh");
  assert.equal(await page.locator('[data-reconstruction-support="transfer"]').inputValue(),"transfer-route","reconstruction support draft must survive refresh");
  await clickAction(page,"validate-reconstruction");
  const reconstructionFeedback=await page.locator("#feedback-reconstruction").innerText();
  assert.match(reconstructionFeedback,/顺序、主要依据与时间／路径补充/,`reconstruction feedback: ${reconstructionFeedback}`);
  const saved=await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.solved.includes("p10r"),true);
  assert.equal(saved.evidence.includes("e_chaintrial"),true);
  assert.equal(saved.reconstructionSupport.leave,"exit-route");
}

async function fillReport(page) {
  const report = { deathPlace:"1402", deathTime:"19:16—19:18", foundPlace:"1102", cardUser:"周岚", cufflink:"两周前遗留", sound:"14层管道结构传声", transferReason:"伪造1102内晚间死亡", waterStart:"约20:46", chainMethod:"室内挂链后经浴室检修通道离开", culprit:"周岚" };
  for (const [key, value] of Object.entries(report)) await page.locator(`[data-report="${key}"]`).selectOption(value);
  await clickAction(page, "validate-report");
  const feedback = await page.locator("#feedback-report").innerText();
  assert.match(feedback, /通过一致性校验/, `report feedback: ${feedback}`);
}

async function confront(page, routes) {
  for (const route of routes) {
    for (const evidence of route) await page.locator(`input[name="confrontation-evidence"][value="${evidence}"]`).check();
    await clickAction(page, "validate-confrontation");
    if (route.includes("e_watch")) await assertText(page, "相关补强");
  }
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_BROWSER) launchOptions.executablePath = process.env.PLAYWRIGHT_BROWSER;
  const browser = await chromium.launch(launchOptions);
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
  const firstRelated=page.locator('[data-action="open-related-evidence"]').first();
  const relatedTitle=await firstRelated.innerText();
  await firstRelated.click();
  await assertText(page,relatedTitle);
  await assertText(page,"返回原推论");
  await clickAction(page,"return-to-deduction");
  await page.locator('[data-action="notebook-tab"][data-tab="evidence"]').click();
  await page.locator("#notebook-person").selectOption("all");
  await assertText(page, "独立来源");
  await page.locator('[data-action="pin-evidence"]').first().click();

  await goChapter(page, 8);
  await assertText(page, "00:48");
  await clickAction(page, "continue-interlude");
  await assertText(page, "证据不足");
  await page.locator('[data-action="examine"][data-id="permission-audit"]').click();
  assert.equal(await page.locator('[data-status="zhoulan-card"]').first().getAttribute("class").then(value=>value.includes("unknown")),true,"permission alone must not prove A047 behavior");
  await setMatrix(page);
  await clickAction(page,"solve-p10");
  await assertText(page,"处于“证据不足”");
  await page.locator('[data-action="examine"][data-id="operation-audit"]').click();
  await page.locator('[data-action="toggle-matrix-rationale"][data-person="guxue"]:visible').click();
  await assertText(page, "不能据此声称她从未接触 A047");
  await fillMatrix(page);
  await page.locator('[data-action="examine"][data-id="water-reenactment"]').click();
  await page.locator('[data-action="examine"][data-id="chain-reconstruction"]').click();
  await solveReconstruction(page);
  await assertText(page,"新版完成");
  await page.locator('[data-action="examine"][data-id="old-case-file"]').click();
  await solveOldCase(page);

  await clickAction(page, "show-timeline");
  await assertText(page, "约20:46");
  assert.equal(await page.getByText("18:51",{exact:false}).count(),0,"timeline must not contain the unsupported 18:51 assertion");
  const timelineText=await page.locator(".dynamic-timeline").innerText();
  assert.ok(timelineText.indexOf("约20:46") < timelineText.indexOf("21:41"),"estimated water start must appear before the door opening");
  await assertText(page,"实验估算");
  await assertText(page,"证据推论");

  await goChapter(page, 9);
  await page.locator('[data-report="deathPlace"]').selectOption("1402");
  await page.locator('[data-report="cardUser"]').selectOption("周岚");
  await page.locator('#topbar [data-action="show-notebook"]').click();
  await assertText(page,"返回当前举证");
  await clickAction(page,"return-from-notebook");
  assert.equal(await page.locator('[data-report="deathPlace"]').inputValue(),"1402");
  assert.equal(await page.locator('[data-report="cardUser"]').inputValue(),"周岚");
  await page.reload();
  await clickAction(page,"continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  assert.equal(await page.locator('[data-report="deathPlace"]').inputValue(),"1402","report draft must survive notebook navigation and reload");
  assert.equal(await page.locator('[data-report="cardUser"]').inputValue(),"周岚");
  await fillReport(page);
  await page.locator('input[name="confrontation-evidence"][value="e_body_review"]').locator("xpath=../..").locator('[data-action="toggle-proof-summary"]').click();
  await assertText(page,"伤口形态与墙内结构件吻合");
  await confront(page, [["e_impact", "e_body_review", "e_watch"], ["e_floor", "e_cart"]]);
  await page.locator('input[name="confrontation-evidence"][value="e_cardlog"]').check();
  await page.locator('input[name="confrontation-evidence"][value="e_cardauth"]').check();
  await page.locator('[data-proof-id="e_cardlog"] [data-action="toggle-proof-summary"]').click();
  await clickAction(page,"validate-confrontation");
  await assertText(page,"身份归属");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardlog"]').isChecked(),true,"failed proof must preserve selections");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardauth"]').isChecked(),true);
  await page.locator('#feedback-confrontation [data-action="show-notebook"]').click();
  await assertText(page,"返回当前举证");
  await clickAction(page,"return-from-notebook");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardlog"]').isChecked(),true,"draft must survive notebook navigation");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardauth"]').isChecked(),true);
  assert.equal(await page.locator('[data-proof-id="e_cardlog"] [data-action="toggle-proof-summary"]').getAttribute("aria-expanded"),"true");
  await page.reload();
  await clickAction(page,"continue-game");
  await page.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardlog"]').isChecked(),true,"draft must survive reload");
  assert.equal(await page.locator('input[name="confrontation-evidence"][value="e_cardauth"]').isChecked(),true);
  assert.equal(await page.locator('[data-proof-id="e_cardlog"] [data-action="toggle-proof-summary"]').getAttribute("aria-expanded"),"true","summary disclosure state must survive reload");
  await confront(page, [
    ["e_cardlog", "e_cardauth", "e_route"], ["e_permission", "e_cart", "e_route"],
    ["e_lock", "e_hatch", "e_chaintrial"]
  ]);

  const cSave = await page.evaluate(() => ({ save: localStorage.getItem("wrong-floor-save-v1"), meta: localStorage.getItem("wrong-floor-meta-v1") }));
  const cContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const cPage = await cContext.newPage();
  await cPage.goto(baseURL);
  await cPage.evaluate(values => {
    localStorage.setItem("wrong-floor-save-v1", values.save);
    localStorage.setItem("wrong-floor-meta-v1", values.meta);
  }, cSave);
  await cPage.reload();
  await clickAction(cPage, "continue-game");
  await cPage.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  await confront(cPage, [["e_oldfile", "e_casualty", "e_hr"]]);
  await cPage.locator('[data-action="close-modal"]').click();
  await assertText(cPage,"等待公开决定");
  assert.equal(await cPage.locator('[data-action="continue-disclosure"]').count(),1,"closing the decision modal must leave a resumable action");
  await cPage.reload();
  await clickAction(cPage,"continue-game");
  await cPage.locator('[data-action="go-chapter"][data-chapter="9"]').click();
  await assertText(cPage,"等待公开决定");
  await clickAction(cPage,"continue-disclosure");
  await cPage.locator('[data-action="choose-disclosure"][data-choice="culprit-only"]').click();
  await assertText(cPage, "不存在的房间");
  const cSaved = await cPage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(cSaved.ending, "C");

  await confront(page, [["e_oldfile", "e_casualty", "e_hr"]]);
  await page.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(page, "正确的问题");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(saved.version, 7);
  assert.equal(saved.ending, "D");
  assert.equal(saved.interviews.xuyoa, undefined);
  assert.deepEqual(errors, []);

  await page.setViewportSize({ width: 390, height: 844 });
  await clickAction(page, "review-case");
  let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.equal(overflow <= 1, true, `mobile overflow: ${overflow}px`);
  await page.locator('[data-action="go-chapter"][data-chapter="5"]').click();
  await clickAction(page, "resume-p05-observation");
  const touchSize = await page.locator('[data-action="find-diff"]').first().evaluate(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height }));
  assert.equal(touchSize.width >= 42 && touchSize.height >= 42, true, `P05 touch target: ${touchSize.width}x${touchSize.height}`);
  await goChapter(page, 8);
  assert.equal(await page.locator(".mobile-exclusion-cards").evaluate(node=>getComputedStyle(node).display),"grid");
  assert.equal(await page.locator(".desktop-exclusion").evaluate(node=>getComputedStyle(node).display),"none");
  for (const viewport of [{width:320,height:740},{width:360,height:780},{width:390,height:844},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.equal(overflow <= 1,true,`responsive overflow ${viewport.width}x${viewport.height}: ${overflow}px`);
  }

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
  await assertText(failurePage, "排除性调查");
  await clickAction(failurePage, "ending-b");
  await assertText(failurePage, "完美证据");
  await assertText(failurePage, "报告内部自洽度不足");

  const aContext = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch:true, isMobile:true });
  const aPage = await aContext.newPage();
  await solveThroughChapter6(aPage,false,true);
  await goChapter(aPage, 7);
  await completeInterview(aPage, "guxue", "案发后去向", "omission", "e_copy", "19:03 我在停车场", "parking-access");
  await completeInterview(aPage, "liangwen", "与死者通信", "omission", "e_message", "附件收到了", "attachment-checksum");
  await solveP09(aPage);
  await goChapter(aPage, 8);
  await clickAction(aPage, "continue-interlude");
  await aPage.locator('[data-action="examine"][data-id="permission-audit"]').click();
  await aPage.locator('[data-action="examine"][data-id="operation-audit"]').tap();
  await aPage.locator('[data-action="examine"][data-id="water-reenactment"]').click();
  await aPage.locator('[data-action="examine"][data-id="chain-reconstruction"]').tap();
  await fillMatrix(aPage);
  await solveReconstruction(aPage,true);
  await goChapter(aPage, 9);
  await fillReport(aPage);
  const summaryButton=aPage.locator('[data-proof-id="e_body_review"] [data-action="toggle-proof-summary"]');
  await summaryButton.scrollIntoViewIfNeeded();
  const beforeSummaryScroll=await aPage.evaluate(()=>window.scrollY);
  await summaryButton.focus();
  await summaryButton.press("Enter");
  const afterSummaryScroll=await aPage.evaluate(()=>window.scrollY);
  assert.equal(await summaryButton.getAttribute("aria-expanded"),"true","expanded mobile evidence must expose screen-reader state");
  assert.equal(await summaryButton.evaluate(node=>document.activeElement===node),true,"summary toggle must retain keyboard focus");
  assert.ok(Math.abs(afterSummaryScroll-beforeSummaryScroll)<8,"expanding a mobile evidence card must preserve scroll position");
  await aPage.locator('label:has(input[name="confrontation-evidence"][value="e_impact"])').tap();
  await aPage.locator('label:has(input[name="confrontation-evidence"][value="e_body_review"])').tap();
  await assertText(aPage,"已选 2/3");
  await aPage.locator('[data-action="toggle-selected-proofs"]').tap();
  assert.equal(await aPage.locator('[data-proof-id]').count(),2,"selected-only mode should shorten mobile proof review");
  await aPage.locator('[data-action="toggle-selected-proofs"]').tap();
  await aPage.locator('[data-action="validate-confrontation"]').tap();
  await confront(aPage, [
    ["e_floor", "e_cart"],
    ["e_cardlog", "e_cardauth", "e_route"], ["e_permission", "e_cart", "e_route"],
    ["e_lock", "e_hatch", "e_chaintrial"]
  ]);
  await aPage.locator('[data-action="choose-disclosure"][data-choice="full"]').click();
  await assertText(aPage, "正确答案");
  const aSaved = await aPage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(aSaved.ending, "A");
  assert.equal(aSaved.solved.includes("p11"), false);

  const legacyContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const legacyPage=await legacyContext.newPage();
  await legacyPage.goto(baseURL);
  await legacyPage.evaluate(() => {
    localStorage.setItem("wrong-floor-save-v1",JSON.stringify({
      version:6,started:true,chapter:8,screen:"home",interludeSeen:true,
      solved:["p01","p02","p03","p04","p05","p06","p07","p08","p09","p10","p10r"],
      evidence:["e_chaintrial"],interviews:{guxue:3,liangwen:3},
      reconstructionOrder:["leave","chain","card","water","transfer"]
    }));
  });
  await legacyPage.reload();
  await clickAction(legacyPage,"continue-game");
  await legacyPage.locator('[data-action="go-chapter"][data-chapter="8"]').click();
  await assertText(legacyPage,"旧版复原记录已保留");
  const legacyPreview=await legacyPage.locator(".reconstruction-preview").innerText();
  assert.ok(legacyPreview.indexOf("离开") < legacyPreview.indexOf("放水"),"legacy UI should preserve its saved order rather than pretending the new task was completed");
  assert.equal(await legacyPage.locator('[data-action="move-reconstruction"]:not([disabled])').count()>0,true,"legacy reconstruction should remain voluntarily playable");
  const legacySaved=await legacyPage.evaluate(() => JSON.parse(localStorage.getItem("wrong-floor-save-v1")));
  assert.equal(legacySaved.legacyReconstruction,true);
  assert.equal(legacySaved.solved.includes("p10r"),false);

  const storageContext=await browser.newContext({viewport:{width:390,height:844}});
  await storageContext.addInitScript(() => { Storage.prototype.setItem=function(){ throw new DOMException("quota","QuotaExceededError"); }; });
  const storagePage=await storageContext.newPage();
  const storageErrors=[];
  storagePage.on("pageerror",error=>storageErrors.push(error.message));
  await storagePage.goto(baseURL);
  await clickAction(storagePage,"new-game");
  await assertText(storagePage,"本机存储写入失败");
  await assertText(storagePage,"P01");
  assert.deepEqual(storageErrors,[]);

  await storageContext.close(); await legacyContext.close(); await aContext.close(); await failureContext.close(); await cContext.close(); await context.close(); await browser.close();
  process.stdout.write("✓ v3.4 staged disclosure, constrained reconstruction, proof strengthening, migration and 320px focus flow\n");
})().catch(error => { console.error(error); process.exit(1); });
