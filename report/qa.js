// Automated QA: counts, charts, both languages, console errors
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CONNECTION|Failed to load resource/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });
  await page.goto('file://' + path.join(__dirname, 'standalone.html'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  const report = await page.evaluate(() => {
    const out = {};
    out.companies = DATA.companies.length;
    out.dbRows = document.querySelectorAll('#db-table tbody tr.row').length;
    out.dbCount = document.getElementById('db-count')?.textContent;
    out.svgs = document.querySelectorAll('.figure svg').length;
    out.figures = document.querySelectorAll('.figure').length;
    out.chapters = document.querySelectorAll('section.ch').length;
    out.navLinks = document.querySelectorAll('.rail nav a').length;
    // dead anchors
    out.deadAnchors = [...document.querySelectorAll('.rail a')].filter(a => !document.querySelector(a.getAttribute('href'))).map(a => a.getAttribute('href'));
    // charts hosts empty?
    out.emptyFigs = [...document.querySelectorAll('[id^="fig-"]')].filter(d => !d.innerHTML.trim()).map(d => d.id);
    // fund outliers
    out.topFunds = DATA.companies.filter(c => c._fund).sort((a,b) => b._fund - a._fund).slice(0, 6).map(c => c.name_en.slice(0, 24) + '=' + c._fund);
    out.badTeams = DATA.companies.filter(c => c._team && c._team > 20000).map(c => c.name_en + '=' + c._team);
    out.badFounded = DATA.companies.filter(c => c._founded && (c._founded < 1960 || c._founded > 2026)).map(c => c.name_en);
    // missing bilingual fields
    out.noZhPos = DATA.companies.filter(c => !c.positioning_zh).length;
    out.noLessons = DATA.companies.filter(c => !c.lessons_en).length;
    return out;
  });
  console.log(JSON.stringify(report, null, 1));

  // Chinese mode render of the db + a chart
  await page.click('.langbar button[data-l="zh"]');
  await page.waitForTimeout(600);
  const zh = await page.evaluate(() => ({
    dbCount: document.getElementById('db-count')?.textContent,
    firstChip: document.querySelector('#db-cats button')?.textContent.trim().slice(0, 10),
  }));
  console.log('zh-mode:', JSON.stringify(zh));

  // fully-revealed chart screenshot (disable animation wait by scrolling and waiting)
  await page.evaluate(() => document.querySelector('#fig-ch17-money')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(__dirname, 'shots', 'qa-ch17-zh.png') });
  await page.evaluate(() => document.querySelector('#fig-ch07-price')?.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(__dirname, 'shots', 'qa-ch07-zh.png') });

  // open a db row in zh
  await page.evaluate(() => document.querySelector('#ch05-db')?.scrollIntoView());
  await page.waitForTimeout(500);
  const row = await page.$('#db-table tr.row');
  if (row) { await row.click(); await page.waitForTimeout(400); }
  await page.screenshot({ path: path.join(__dirname, 'shots', 'qa-db-zh.png') });

  console.log('errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})();
