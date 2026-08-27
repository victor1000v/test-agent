const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION|Failed to load resource/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, 'standalone.html'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => ({
    slides: document.querySelectorAll('.slide').length,
    svgs: document.querySelectorAll('svg').length,
    emptyFigs: [...document.querySelectorAll('[id^="fig-"]')].filter(d => !d.innerHTML.trim()).map(d => d.id),
    counter: document.getElementById('counter').textContent,
  }));
  console.log(JSON.stringify(info));
  await page.screenshot({ path: 'shots/s01.png' });
  for (const [n, name] of [[6,'s06-position'],[7,'s07-price'],[10,'s10-milestone'],[12,'s12-arch'],[15,'s15-pod'],[17,'s17-budget'],[18,'s18-hires']]) {
    await page.evaluate(i => deckGo(i - 1), n);
    await page.waitForTimeout(550);
    await page.screenshot({ path: 'shots/' + name + '.png' });
  }
  // Chinese pass
  await page.click('#langbar button[data-l="zh"]');
  await page.waitForTimeout(500);
  for (const [n, name] of [[3,'zh-s03'],[8,'zh-s08'],[13,'zh-s13'],[24,'zh-s24']]) {
    await page.evaluate(i => deckGo(i - 1), n);
    await page.waitForTimeout(550);
    await page.screenshot({ path: 'shots/' + name + '.png' });
  }
  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
