const path=require('path');
const os=require('os');
const assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');

const SAVE_KEY='siren-seventh-act-save-v9';
const shot=name=>path.join(os.tmpdir(),name);

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.title(),'塞壬号：第七幕没有掌声');
  assert.ok((await page.locator('.continue-note').innerText()).includes('初始安全 90%'),'normal mode advertises the larger action allowance');
  await page.locator('#nameInput').fill('v2.7普通模式侦探');await page.locator('#startForm').evaluate(form=>form.requestSubmit());
  let saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);assert.equal(saved.safety,90,'normal mode starts with 90 safety');assert.equal(saved.difficulty,'normal','normal mode is the default');
  await page.evaluate(key=>{const saved=JSON.parse(localStorage.getItem(key));saved.screen='hub';saved.resumeScreen='hub';localStorage.setItem(key,JSON.stringify(saved));},SAVE_KEY);await page.reload();
  const hub=await page.locator('body').innerText();assert.ok(hub.includes('36分钟 / −1')&&hub.includes('掩盖异动'),'hub explains the extended budget and progress events');await page.screenshot({path:shot('siren-v27-normal-budget.png'),fullPage:true});

  await page.evaluate(key=>{const saved=JSON.parse(localStorage.getItem(key));saved.difficulty='hard';saved.screen='crisis';saved.resumeScreen='hub';saved.elapsed=0;saved.safety=34;saved.clues=['drugWine','reverseFilm'];saved.actions=[];saved.flags=Object.assign(saved.flags||{},{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:2,pendingCrisis:'archive',crisisArchive:false});localStorage.setItem(key,JSON.stringify(saved));},SAVE_KEY);await page.reload();
  const crisisText=await page.locator('body').innerText();assert.ok(crisisText.includes('45分钟')&&crisisText.includes('任意两组'),'archive crisis explains the real deadline and pair parity');
  await page.locator('[data-crisis-choice="loseVideo"]').click();await page.locator('[data-location="quarters"]').click();await page.locator('[data-action="salvage"]').click();
  const salvageText=await page.locator('body').innerText();assert.ok(salvageText.includes('必须在 45 分钟内完成抢救')&&salvageText.includes('操作本身消耗 15 分钟'),'salvage screen shows a live deadline');
  await page.locator('[data-salvage="index"]').click();await page.locator('[data-salvage="rehearsal"]').click();await page.locator('#confirmSalvage').click();
  saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);assert.ok(['winePuncture','sedativeVial','deletionIndex','threatFilm'].every(id=>saved.clues.includes(id)),'index plus rehearsal cross-recovers the bottle proof route');assert.equal(saved.elapsed,15,'video salvage consumes fifteen minutes');

  await page.evaluate(key=>{const saved=JSON.parse(localStorage.getItem(key));saved.screen='connections';saved.resumeScreen='connections';saved.difficulty='extreme';saved.clues=['dryCorridor'];saved.connections=[];saved.connectionEvidence={};saved.flags=Object.assign(saved.flags||{},{degraded:{},connectionAttempts:{waterSource:3},connectionLocks:{waterSource:{relevantVersion:0}},clueVersion:1,activeConnection:'waterSource',connectionDraft:[]});localStorage.setItem(key,JSON.stringify(saved));},SAVE_KEY);await page.reload();
  let lockText=await page.locator('body').innerText();assert.ok(lockText.includes('整理当前案卷')&&lockText.includes('不会再次锁定'),'extreme lock always exposes the one-time review exit');await page.locator('#reviewConnection').click();saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);assert.equal(saved.flags.connectionReviewed.waterSource,true,'browser review permanently marks the chain');assert.equal(saved.elapsed,30,'review adds fifteen minutes after salvage');

  await page.evaluate(key=>{const saved=JSON.parse(localStorage.getItem(key));saved.screen='hub';saved.resumeScreen='hub';saved.difficulty='hard';saved.clues=['channels','overrideBurn'];saved.connections=[];saved.connectionEvidence={};saved.interviews={liangyin:{cornered:true}};saved.flags=Object.assign(saved.flags||{},{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:2,pendingCrisis:null,evacuation:false,activeConnection:null});localStorage.setItem(key,JSON.stringify(saved));},SAVE_KEY);await page.reload();await page.locator('.report-tool').click();
  const locked=await page.locator('body').innerText();assert.ok(locked.includes('剧场还不能开灯')&&locked.includes('嫌疑人的普通证词退路已封锁')&&!locked.includes('梁音'),'locked confrontation remains answer-neutral');await page.screenshot({path:shot('siren-v27-neutral-gate.png'),fullPage:true});

  const mobileSeed=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);const mobile=await browser.newPage({viewport:{width:375,height:812},deviceScaleFactor:1});const mobileErrors=[];mobile.on('pageerror',error=>mobileErrors.push(error.message));await mobile.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await mobile.evaluate(({key,seed})=>{const saved=seed;saved.screen='puzzle';saved.resumeScreen='puzzle';saved.difficulty='normal';saved.connections=['waterSource','victimAlive'];saved.connectionEvidence={waterSource:['waterTrace','tankSample','freshWaterProof'],victimAlive:['recoveredVoice','talkButton']};saved.clues=['drugWine','aconite','cutRope','brakeDamage','secondBrake','liveBullet','backupRope','mirrorWound','waterTrace','tankSample','freshWaterProof','recoveredVoice','talkButton','overrideBurn','motorLog','trackMisalign','lockManual'];saved.flags=Object.assign(saved.flags||{},{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:17,activePuzzle:'timeline',puzzleAnswers:['drug','poison','wire','brake','restore','bullet','fall','shot','lower','call','rotate','track','drown','return'],starredClues:[]});localStorage.setItem(key,JSON.stringify(saved));},{key:SAVE_KEY,seed:mobileSeed});await mobile.reload();
  assert.equal(await mobile.locator('.timeline-event').count(),14,'all fourteen timeline nodes render as reorderable rows');const before=await mobile.locator('.timeline-event b').allTextContents();await mobile.locator('[data-timeline-move="1"]').first().click();const after=await mobile.locator('.timeline-event b').allTextContents();assert.equal(after[1],before[0],'mobile timeline controls reorder nodes without remove-and-readd');
  await mobile.locator('#clueBtn').click();const layout=await mobile.evaluate(()=>({page:document.documentElement.scrollWidth<=window.innerWidth,tags:[...document.querySelectorAll('.note-stage')].every(el=>el.scrollWidth<=el.clientWidth+1),tabs:document.querySelector('.notebook-tabs').scrollWidth>=document.querySelector('.notebook-tabs').clientWidth}));assert.equal(layout.page,true,'casebook does not widen the mobile document');assert.equal(layout.tags,true,'casebook evidence labels wrap inside their cards');assert.equal(layout.tabs,true,'casebook tabs remain contained in their own scroller');await mobile.screenshot({path:shot('siren-v27-mobile-casebook.png'),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(mobileErrors,[]);await browser.close();console.log('v2.7 browser smoke: budget, salvage parity/deadline, extreme review, neutral gate, and mobile layout passed');
})().catch(error=>{console.error(error);process.exit(1);});
