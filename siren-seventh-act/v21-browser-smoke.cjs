const path = require('path');
const os = require('os');
const assert = require('assert');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.title(),'塞壬号：第七幕没有掌声');
  assert.ok((await page.locator('body').innerText()).includes('开始新调查'));
  await page.locator('[data-difficulty="hard"]').click();
  await page.locator('#nameInput').fill('回归侦探');
  await page.locator('#startForm').evaluate(form => form.requestSubmit());
  assert.ok((await page.locator('body').innerText()).includes('风暴把“塞壬号”从陆地的无线电里抹去'));
  await page.screenshot({path:path.join(os.tmpdir(),'siren-v21-smoke.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  await Promise.race([browser.close(),new Promise(resolve => setTimeout(resolve,2000))]);
  console.log('v2.1 browser smoke: cover, difficulty, new game and prologue passed');
  process.exit(0);
})().catch(error => { console.error(error); process.exitCode = 1; });
