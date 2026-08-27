// journal.jsonl -> data/companies.json, data/dives.json, data/synth.json, parts/95-data.html
const fs = require('fs'), path = require('path');
const JOURNAL = process.argv[2] || '/root/.claude/projects/-home-user-test-agent/3bdb7acb-db15-511d-8c13-596520eaa366/subagents/workflows/wf_6df26f07-518/journal.jsonl';
const DIR = __dirname;

const CATS = [
  { key:'cn-mega', en:'Mega-agency', zh:'传统大所', markers:[/New Oriental/i, /EIC Education/i, /JJL/i, /Bailitop/i] },
  { key:'cn-premium', en:'Premium boutique (CN)', zh:'高端申请机构', markers:[/GGU/i, /PalmDrive/i, /Valeon/i, /Stoooges/i] },
  { key:'cn-platform', en:'Platform / half-DIY', zh:'平台与半DIY', markers:[/myOffer/i, /51offer/i, /ApplySquare/i, /WordSunny/i] },
  { key:'cn-background', en:'Background & academic', zh:'背景提升与学术', markers:[/ViaX/i, /GEC Academy/i, /Easymay/i, /Classbro/i] },
  { key:'cn-community', en:'Community & media', zh:'社区与内容', markers:[/1Point3Acres/i, /ChaseDream/i, /Gter/i, /College Daily/i] },
  { key:'cn-ukhk', en:'UK/HK/SG specialist', zh:'英港新专门机构', markers:[/UKEC/i, /Golden Arrow/i, /Downton/i, /Index Education/i] },
  { key:'gl-platforms', en:'Global recruiter platform', zh:'国际招生平台', markers:[/IDP/i, /ApplyBoard/i, /Leverage/i, /Edvoy/i] },
  { key:'gl-pathway', en:'Pathway & B2B enrolment', zh:'预科与B2B', markers:[/Shorelight/i, /Navitas/i, /INTO University/i, /Study Group/i] },
  { key:'gl-premium', en:'Western premium', zh:'欧美高端咨询', markers:[/Crimson/i, /IvyWise/i, /InGenius/i, /Command Education/i] },
  { key:'gl-mba', en:'MBA & specialist', zh:'MBA与专项硕士', markers:[/mbaMission/i, /Stacy Blackman/i, /Fortuna/i, /Menlo/i] },
  { key:'gl-region', en:'Regional & infrastructure', zh:'区域与基础设施', markers:[/Across the Pond/i, /Intake Education/i, /Enroly/i, /Sannam/i, /Grok Global/i] },
  { key:'failed', en:'Failure case', zh:'失败案例', markers:[/Xiaozhan|小站/i, /Taisha.*collaps/i] },
];

const lines = fs.readFileSync(JOURNAL, 'utf8').trim().split('\n').map(l => JSON.parse(l));
const results = lines.filter(l => l.type === 'result').map(l => l.result);

function classifyBatch(companies) {
  const names = companies.map(c => c.name_en + ' ' + (c.name_zh || '')).join(' | ');
  let best = null, bestScore = 0;
  for (const cat of CATS) {
    const score = cat.markers.filter(m => m.test(names)).length;
    if (score > bestScore) { bestScore = score; best = cat.key; }
  }
  return best;
}

let all = [];
const dives = {}, synth = {};
function classifyOne(c) {
  const name = c.name_en + ' ' + (c.name_zh || '');
  for (const cat of CATS) if (cat.key !== 'failed' && cat.markers.some(m => m.test(name))) return cat.key;
  return 'failed';
}
for (const r of results) {
  if (!r) continue;
  if (r.companies) {
    const names = r.companies.map(c => c.name_en + ' ' + (c.name_zh || '')).join(' | ');
    const isFailedBatch = /xiaozhan|小站/i.test(names) && /taisha|太傻/i.test(names);
    const key = isFailedBatch ? 'failed' : classifyBatch(r.companies);
    if (!key) { console.error('UNCLASSIFIED BATCH:', r.companies.slice(0,3).map(c => c.name_en)); continue; }
    for (const c of r.companies) {
      if (!c || !c.name_en) continue;
      c.category_key = key === 'failed' ? classifyOne(c) : key;
      all.push(c);
    }
  } else if (r.title && r.summary_md) {
    const t = r.title.toLowerCase();
    const k = /crimson/.test(t) ? 'crimson' : /market|outbound|数据|中国/.test(t) ? 'market'
      : /acquisition|marketing|获客|customer/.test(t) ? 'marketing' : /die|fail|死|失败/.test(t) ? 'failures' : 'other-' + t.slice(0, 12);
    dives[k] = r;
  } else if (r.summary_md && r.insights) {
    const k = /roadmap|hire|kpi|положen|positioning & differentiation|акadem/i.test(r.summary_md) || /hiring|roadmap/i.test((r.insights[0] || {}).title_en || '') ? 'strategy' : null;
    // fall back: first synthesis = patterns, second = strategy
    if (!synth.patterns) synth.patterns = r; else synth.strategy = r;
  }
}

/* dedup: same normalised name -> keep richer record; prefer non-'failed' category for the survivor's category unless only failed */
const ALIASES = [
  [/taisha|太傻/i, 'taisha'],
  [/compass education|指南者|theguider/i, 'compass'],
  [/youyue|优越|premium education/i, 'pec-youyue'],
  [/uvic|myoffer|学无国界/i, 'myoffer-uvic'],
  [/new channel|新航道/i, 'newchannel'],
  [/admitwrite/i, 'admitwrite'],
  [/zhishiq|芝士圈|byecity/i, 'zhishiq'],
  [/shunshun|顺顺/i, 'shunshun'],
  [/51offer/i, '51offer'],
  [/xiaozhan|小站/i, 'xiaozhan'],
  [/applyboard/i, 'applyboard'],
  [/^idp education(?!.*(china|noahs|noris|诺思))/i, 'idp'],
  [/leverage edu/i, 'leverage'],
  [/puxin|朴新/i, 'puxin'],
  [/liucheng|柳橙/i, 'liucheng'],
  [/crimson education/i, 'crimson'],
];
const STOP = /(education|edu|consulting|consultancy|international|group|overseas|study|abroad|liuxue|教育|留学|国际|集团)/g;
function enKey(c) {
  const stripParens = s => String(s || '').replace(/[（(][^）)]*[）)]/g, ' ').replace(/\[[^\]]*\]/g, ' ');
  const full = stripParens(c.name_en) + ' ' + stripParens(c.name_zh);
  const isMeta = /excl|除外|ecosystem|生态|archetype/i.test(full);
  if (!isMeta) for (const [re, k] of ALIASES) if (re.test(full)) return 'alias:' + k;
  return c.name_en.toLowerCase().replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(STOP, '').replace(/[^a-z0-9]/g, '').slice(0, 24);
}
function zhKey(c) {
  const z = (c.name_zh || '').replace(/[^一-鿿]/g, '').replace(/留学|教育|国际|集团|咨询/g, '');
  return z.length >= 2 ? z : null;
}
const byEn = new Map(), byZh = new Map();
let dupes = 0;
const merged = [];
for (const c of all) {
  const ek = enKey(c), zk = zhKey(c);
  let i = byEn.has(ek) ? byEn.get(ek) : (zk != null && byZh.has(zk) ? byZh.get(zk) : null);
  if (i != null) {
    dupes++;
    const prev = merged[i];
    const richer = JSON.stringify(c).length > JSON.stringify(prev).length ? c : prev;
    const other = richer === c ? prev : c;
    // merge: keep richer, but fill empty fields from the other; keep non-failed category
    for (const f of Object.keys(other)) if (!richer[f] && other[f]) richer[f] = other[f];
    if (richer.category_key === 'failed' && other.category_key && other.category_key !== 'failed') richer.category_key = other.category_key;
    merged[i] = richer;
    byEn.set(ek, i); if (zk != null) byZh.set(zk, i);
  } else {
    byEn.set(ek, merged.length); if (zk != null) byZh.set(zk, merged.length);
    merged.push(c);
  }
}

/* derived fields */
function parseFounded(s) { const m = String(s || '').match(/(19|20)\d{2}/); return m ? +m[0] : null; }
function parseTeam(s) {
  if (!s) return null;
  const str = String(s).replace(/,/g, '');
  let m = str.match(/(\d+)\s*[-–~到至]\s*(\d+)/);
  if (m) { const a = +m[1], b = +m[2]; if (b < 200000) return Math.round((a + b) / 2); }
  m = str.match(/[~约]?\s*(\d+)\s*\+?/);
  if (m) return +m[1];
  return null;
}
function parseFund(s, ownership) {
  let str = String(s || '');
  if (!str || /no disclosed|none|bootstrapped|未披露|无/i.test(str) && !/[$¥€£]|RMB|USD/i.test(str)) return null;
  if (/^(no |none|n\/a|not |self|state|parent|internally|未|无)/i.test(str.trim())) return null;
  // keep currency attached across hyphenated ranges: "RMB 100-200M" -> "RMB 200M"
  str = str.replace(/(US?\$|C\$|A\$|NZ\$|S\$|HK\$|RMB|[£€¥$])\s?([\d.]+)\s*[-–~]\s?([\d.]+)/g, '$1$3');
  // find amounts like $114M, US$40M, RMB 3亿, ¥300M, £20M, 亿元
  let best = null;
  const re = /(US?\$|C\$|A\$|NZ\$|S\$|\$|£|€|¥|RMB\s?|HK\$)?\s?([\d.]+)\s*(billion|bn|B\b|million|mn|M\b|亿|万)/gi;
  let m;
  while ((m = re.exec(str)) !== null) {
    const ctx = str.slice(Math.max(0, m.index - 80), m.index + m[0].length + 30);
    // skip figures that are not capital raised (revenue, market caps, goodwill, tuition...)
    if (/revenue|market cap|goodwill|tuition|收入|市值|营收|商誉|GMV|sales|est\. ~?US?\$|failed|终止|acquired|acquisition|bought|收购|paid|buyout|taken private|earn-out|valuation|估值|valuing|worth/i.test(ctx)) continue;
    let v = parseFloat(m[2]);
    const unit = (m[3] || '').toLowerCase();
    if (/^b|billion|bn/.test(unit)) v *= 1000;
    else if (unit === '亿') v *= 100000000 / 1e6; // 亿 -> millions of currency
    else if (unit === '万') v *= 10000 / 1e6;
    const cur = (m[1] || '$').trim();
    if (cur === '¥' || /rmb/i.test(cur)) v = v / 7.2;
    else if (cur === '£') v = v * 1.28;
    else if (cur === '€') v = v * 1.09;
    else if (cur === 'HK$') v = v / 7.8;
    else if (cur === 'C$') v = v * 0.73;
    else if (cur === 'A$') v = v * 0.66;
    else if (cur === 'NZ$') v = v * 0.6;
    else if (cur === 'S$') v = v * 0.75;
    if (/total|累计|raised|共/.test(ctx) || best == null) {
      best = Math.max(best || 0, v);
    }
  }
  return best != null ? Math.round(best * 10) / 10 : null;
}

for (const c of merged) {
  c._founded = parseFounded(c.founded);
  c._team = parseTeam(c.team_size);
  c._fund = parseFund(c.funding, c.ownership);
  c._cn = c.category_key.startsWith('cn-') || /china|中国/i.test(c.country || '');
}
/* category order */
const order = Object.fromEntries(CATS.map((c, i) => [c.key, i]));
merged.sort((a, b) => (order[a.category_key] - order[b.category_key]) || a.name_en.localeCompare(b.name_en));

const failures = merged.filter(c => /defunct|collapse|troubl|crisis|pivot|declin|acquir/i.test(c.status || '')).length;
const srcSet = new Set();
merged.forEach(c => String(c.sources || '').split(/[,;、]/).forEach(s => { s = s.trim().toLowerCase(); if (s.length > 3) srcSet.add(s.replace(/^https?:\/\//, '').split('/')[0]); }));

const data = {
  meta: { sources: Math.round(srcSet.size / 10) * 10, failures, generated: '2026-08-27' },
  cats: CATS.map(({ key, en, zh }) => ({ key, en, zh })),
  companies: merged,
};

fs.mkdirSync(path.join(DIR, 'data'), { recursive: true });
fs.writeFileSync(path.join(DIR, 'data', 'companies.json'), JSON.stringify(merged, null, 1));
fs.writeFileSync(path.join(DIR, 'data', 'dives.json'), JSON.stringify(dives, null, 1));
fs.writeFileSync(path.join(DIR, 'data', 'synth.json'), JSON.stringify(synth, null, 1));

const json = JSON.stringify(data).replace(/<\//g, '<\\/');
fs.writeFileSync(path.join(DIR, 'parts', '95-data.html'), '<script>\n/* ===== DATA (generated by pipeline.js) ===== */\nvar DATA = ' + json + ';\n</script>\n');

console.log('companies:', merged.length, '| dupes merged:', dupes, '| dives:', Object.keys(dives).join(','), '| synth:', Object.keys(synth).join(','));
console.log('by cat:', CATS.map(c => c.key + '=' + merged.filter(x => x.category_key === c.key).length).join(' '));
console.log('with team est:', merged.filter(c => c._team).length, '| with funding: ', merged.filter(c => c._fund != null).length, '| failures:', failures, '| src domains:', srcSet.size);
