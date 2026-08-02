const path=require('path');
const os=require('os');
const assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.title(),'塞壬号：第七幕没有掌声');
  await page.locator('[data-difficulty="hard"]').click();await page.locator('#nameInput').fill('回归侦探');await page.locator('#startForm').evaluate(form=>form.requestSubmit());
  assert.ok((await page.locator('body').innerText()).includes('风暴把“塞壬号”从陆地的无线电里抹去'));
  await page.evaluate(()=>{
    const key='siren-seventh-act-save-v5',saved=JSON.parse(localStorage.getItem(key));saved.screen='cover';saved.resumeScreen='prologue';localStorage.setItem(key,JSON.stringify(saved));
    localStorage.setItem('siren-seventh-act-meta',JSON.stringify({endings:['M'],endingDates:{M:new Date().toISOString()},previews:['O'],previewDates:{O:new Date().toISOString()},firstEnding:'M',bestSafety:22,bestAnySafety:22,bestCompleteSafety:0,bestExtremeCompleteSafety:0,extremeComplete:false,secrets:[]}));
  });
  await page.reload();assert.ok((await page.locator('#startForm button').innerText()).includes('覆盖存档并开始'));
  page.once('dialog',dialog=>dialog.dismiss());await page.locator('#startForm').evaluate(form=>form.requestSubmit());assert.ok(await page.locator('#startForm').isVisible(),'dismissed overwrite confirmation preserves the save');
  assert.ok((await page.locator('#galleryBtn').innerText()).includes('1 名观众'));await page.locator('#galleryBtn').click();
  const body=await page.locator('body').innerText();assert.ok(body.includes('没有抵达的报告')&&body.includes('没有依据的指控')&&body.includes('已预演'),'gallery separates official and preview seats');
  assert.ok(body.includes('完整破案最佳安全')&&body.includes('任意结局最佳安全'),'gallery splits safety records by outcome quality');
  await page.screenshot({path:path.join(os.tmpdir(),'siren-v23-smoke.png'),fullPage:true});
  await page.evaluate(()=>{const key='siren-seventh-act-save-v5',saved=JSON.parse(localStorage.getItem(key));saved.screen='hub';saved.resumeScreen='hub';saved.clues=['waterTrace','tankSample','freshWaterProof'];saved.connections=['waterSource'];saved.connectionEvidence={waterSource:['waterTrace','tankSample','freshWaterProof']};saved.flags=Object.assign(saved.flags||{},{degraded:{},connectionAttempts:{},connectionLocks:{},clueVersion:3});localStorage.setItem(key,JSON.stringify(saved));});
  await page.reload();await page.locator('.report-tool').click();assert.ok((await page.locator('body').innerText()).includes('没有观众的最后一幕'));
  await page.locator('[data-confront-opening="han"]').click();await page.locator('[data-confront-connection="waterSource"]').click();await page.locator('[data-confront-secret="withhold"]').click();await page.locator('[data-confront-premise="lower"]').click();
  assert.ok((await page.locator('body').innerText()).includes('提交完整案件报告'),'final confrontation reaches formal report');assert.deepEqual(errors,[]);
  await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,2000))]);console.log('v2.3 browser smoke: gallery split and final confrontation passed');process.exit(0);
})().catch(error=>{console.error(error);process.exitCode=1;});
