// Screenshot the report for visual QA. Usage: node shot.js [zh] [selector-index...]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const zh = process.argv.includes('zh');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, 'standalone.html'), { waitUntil: 'networkidle' });
  if (zh) { await page.click('.langbar button[data-l="zh"]'); await page.waitForTimeout(400); }
  await page.waitForTimeout(800);
  const suffix = zh ? '-zh' : '-en';
  await page.screenshot({ path: path.join(__dirname, 'shots', 'top' + suffix + '.png') });
  // capture specific anchors passed as args like "#ch05"
  for (const a of process.argv.filter(x => x.startsWith('#'))) {
    await page.evaluate(sel => document.querySelector(sel)?.scrollIntoView(), a);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(__dirname, 'shots', a.slice(1) + suffix + '.png') });
  }
  // expand first db row if table exists
  const row = await page.$('#db-table tr.row');
  if (row) {
    await row.click(); await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(__dirname, 'shots', 'db-open' + suffix + '.png') });
  }
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('page height:', height);
  await browser.close();
})();
