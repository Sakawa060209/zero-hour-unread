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
  state.solved.push("p09", "p10", "p11");
  assert.equal(Logic.chapterUnlocked(state, 9), false, "final report cannot bypass required interviews");
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

test("blank suspect matrix must be completed by the player", () => {
  assert.equal(Logic.validateMatrix({}).ok, false);
  assert.equal(Logic.validateMatrix(Logic.MATRIX_ANSWERS).ok, true);
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

test("best ending depends on key knowledge rather than clicking every interview", () => {
  const state = Logic.freshState();
  state.solved.push("p07", "p10", "p11", "p12");
  state.evidence.push("e_copy", "e_message", "e_pipe", "e_oldfile");
  Logic.CORE_INTERVIEWS.forEach(id => state.interviews[id] = 3);
  assert.equal(Logic.determineEnding(state, "full"), "D");
  assert.equal(state.interviews.xuyoa, undefined);
  state.interviews.shenman = 2;
  assert.equal(Logic.determineEnding(state, "full"), "A");
  assert.equal(Logic.determineEnding(state, "culprit-only"), "C");
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

if (process.exitCode) process.exit(process.exitCode);
