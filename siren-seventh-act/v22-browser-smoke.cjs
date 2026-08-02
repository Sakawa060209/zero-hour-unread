const path=require('path');
const os=require('os');
const assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.title(),'塞壬号：第七幕没有掌声');
  await page.locator('[data-difficulty="hard"]').click();await page.locator('#nameInput').fill('回归侦探');await page.locator('#startForm').evaluate(form=>form.requestSubmit());
  assert.ok((await page.locator('body').innerText()).includes('风暴把“塞壬号”从陆地的无线电里抹去'));
  await page.evaluate(()=>{const key='siren-seventh-act-save-v4',saved=JSON.parse(localStorage.getItem(key));saved.screen='cover';saved.resumeScreen='prologue';localStorage.setItem(key,JSON.stringify(saved));localStorage.setItem('siren-seventh-act-meta',JSON.stringify({endings:['M'],endingDates:{M:new Date().toISOString()},firstEnding:'M',bestSafety:22,extremeComplete:false,secrets:[]}));});
  await page.reload();assert.ok((await page.locator('#startForm button').innerText()).includes('覆盖存档并开始'));
  page.once('dialog',dialog=>dialog.dismiss());await page.locator('#startForm').evaluate(form=>form.requestSubmit());assert.ok(await page.locator('#startForm').isVisible(),'dismissed overwrite confirmation preserves the save');
  assert.ok((await page.locator('#galleryBtn').innerText()).includes('1 名观众'));await page.locator('#galleryBtn').click();assert.ok((await page.locator('body').innerText()).includes('没有抵达的报告'));
  await page.screenshot({path:path.join(os.tmpdir(),'siren-v22-smoke.png'),fullPage:true});assert.deepEqual(errors,[]);
  await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,2000))]);console.log('v2.2 browser smoke: overwrite guard and persistent gallery passed');process.exit(0);
})().catch(error=>{console.error(error);process.exitCode=1;});
