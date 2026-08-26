"use strict";

const assert = require("node:assert/strict");
const Logic = require("../logic.js");

function test(name, fn) {
  try { fn(); process.stdout.write(`✓ ${name}\n`); }
  catch (error) { process.stderr.write(`✗ ${name}\n${error.stack}\n`); process.exitCode = 1; }
}

test("fresh state starts with only chapter one open", () => {
  const state = Logic.freshState();
  assert.equal(Logic.chapterUnlocked(state, 1), true);
  assert.equal(Logic.chapterUnlocked(state, 2), false);
  assert.equal(Logic.highestUnlockedChapter(state), 1);
});

test("chapter gates follow solved deductions rather than stored flags", () => {
  const state = Logic.freshState();
  state.solved.push("p01", "p02", "p03");
  assert.equal(Logic.highestUnlockedChapter(state), 4);
  assert.equal(Logic.chapterUnlocked(state, 5), false);
  state.solved.push("p09", "p10");
  state.interviews.guxue = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), false, "one key interview is insufficient");
  state.interviews.liangwen = 3;
  assert.equal(Logic.chapterUnlocked(state, 8), true, "two key interviews open the permission investigation");
  assert.equal(Logic.chapterUnlocked(state, 9), true, "P10 opens the main report without optional P11");
});

test("evidence validation rejects unrelated padding", () => {
  const route = [{ all: ["e_cufflink", "e_cuffphoto"], exact: true }];
  assert.equal(Logic.validateEvidenceSet(["e_cufflink", "e_cuffphoto"], ["e_cufflink", "e_cuffphoto"], route).ok, true);
  const padded = Logic.validateEvidenceSet(["e_cufflink", "e_cuffphoto", "e_stream"], ["e_cufflink", "e_cuffphoto"], route);
  assert.equal(padded.ok, false);
  assert.match(padded.reason, /无关/);
});

test("alibi coverage requires three independent overlapping sources", () => {
  assert.equal(Logic.validateAlibiCoverage(["e_checkin", "e_stream", "e_location"]).ok, true);
  assert.equal(Logic.validateAlibiCoverage(["e_checkin", "e_stream"]).ok, false);
  assert.match(Logic.validateAlibiCoverage(["e_checkin", "e_stream", "e_location", "e_cuffphoto"]).reason, /无关/);
});

test("matrix preserves unknowns and merges evidence-backed automatic cells", () => {
  assert.equal(Logic.validateMatrix({}).ok, false);
  assert.equal(Logic.validateMatrix(Logic.MATRIX_ANSWERS).ok, true);
  const playerCells = { ...Logic.MATRIX_ANSWERS };
  delete playerCells.xuyoa_blank;
  delete playerCells.zhoulan_know;
  delete playerCells.zhoulan_permission;
  assert.equal(Logic.validateMatrix(playerCells).ok, true);
  assert.equal(Logic.validateMatrix({ ...playerCells, chengyi_blank: "yes" }).wrongCount, 1);
});

test("old-case chain checks every responsible actor", () => {
  assert.equal(Logic.validateResponsibilityChain(Logic.CHAIN_ANSWERS).ok, true);
  assert.equal(Logic.validateResponsibilityChain({ ...Logic.CHAIN_ANSWERS, design: "approve" }).wrongCount, 1);
});

test("report rejects a correct culprit paired with a contradictory room", () => {
  assert.equal(Logic.validateReport(Logic.REPORT_ANSWERS).ok, true);
  const contradiction = { ...Logic.REPORT_ANSWERS, deathPlace: "1102" };
  assert.deepEqual(Logic.validateReport(contradiction).wrong, ["deathPlace"]);
});

test("A, C and D endings are all reachable through natural completion states", () => {
  const mainOnly = Logic.freshState();
  mainOnly.solved.push("p07", "p10", "p12");
  mainOnly.interviews.guxue = 3;
  mainOnly.interviews.liangwen = 3;
  assert.equal(Logic.determineEnding(mainOnly, "full"), "A");

  const state = Logic.freshState();
  state.solved.push("p07", "p10", "p11", "p12");
  state.evidence.push("e_oldfile", "e_casualty", "e_hr");
  assert.equal(Logic.determineEnding(state, "full"), "D");
  assert.equal(state.interviews.xuyoa, undefined);
  assert.equal(Logic.determineEnding(state, "culprit-only"), "C");
});

test("final confrontation accepts supported combinations and rejects padding", () => {
  assert.equal(Logic.validateConfrontationAnswer(1, ["e_impact", "e_body"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(1, ["e_impact", "e_watch"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(3, ["e_cardlog", "e_accountmap", "e_shift"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(4, ["e_permission"]).ok, true);
  assert.equal(Logic.validateConfrontationAnswer(4, ["e_cardlog", "e_cart"]).ok, true);
  assert.match(Logic.validateConfrontationAnswer(2, ["e_floor", "e_stream"]).reason, /无关/);
});

test("theory checker distinguishes conflicts, missing support and existing support", () => {
  const state = Logic.freshState();
  state.solved.push("p02");
  const result = Logic.evaluateTheory({ culprit: "许遥", place: "1102", method: "远程装置" }, state);
  assert.equal(result.conflicts.length, 2);
  assert.equal(result.missing.length, 1);
  assert.equal(result.canSubmitFailure, true);
  const unfinished = Logic.evaluateTheory({ culprit: "周岚", place: "其他地点", method: "未知" }, state);
  assert.equal(unfinished.conflicts.length, 0);
  assert.equal(unfinished.missing.length, 3);
  state.solved.push("p05", "p10");
  const supported = Logic.evaluateTheory({ culprit: "周岚", place: "其他地点", method: "密室后逃离" }, state);
  assert.equal(supported.support.length, 2);
});

test("normalization preserves meta records and repairs malformed collections", () => {
  const state = Logic.normalizeState({ chapter: 99, evidence: ["e_lock", "e_lock", 7], solved: null, meta: { endings: ["B", "B"], bestEvidence: "12" } });
  assert.equal(state.chapter, 9);
  assert.deepEqual(state.evidence, ["e_lock"]);
  assert.deepEqual(state.solved, []);
  assert.deepEqual(state.meta.endings, ["B"]);
  assert.equal(state.meta.bestEvidence, 12);
  assert.deepEqual(state.pinnedEvidence, []);
  assert.deepEqual(state.matrixAnswers, {});
});

test("v2 saves migrate scalar confrontation evidence into v3 arrays", () => {
  const state = Logic.normalizeState({ version: 2, confrontation: { q1: "e_impact", q2: ["e_floor", "e_floor"] } });
  assert.equal(state.version, 3);
  assert.deepEqual(state.confrontation.q1, ["e_impact"]);
  assert.deepEqual(state.confrontation.q2, ["e_floor"]);
  assert.equal(state.interludeSeen, false);
});

if (process.exitCode) process.exit(process.exitCode);
