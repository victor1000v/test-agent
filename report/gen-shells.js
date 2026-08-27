// Generate chapter shell part-files. Bodies get filled later at <!-- CHxx-BODY --> markers.
const fs = require('fs'), path = require('path');
const P = path.join(__dirname, 'parts');
const chapters = [
  ['12','06','III','第三部','The Mega-Agencies','传统大所',
   'New Oriental, EIC, JJL, Aoji, Shinyway: the billion-RMB machines that industrialised study abroad. They are slower and more distrusted than ever — and still take the largest share of the market. Understanding why is the first lesson in this business.',
   '新东方前途、启德、金吉列、澳际、新通：把留学做成流水线的十亿级机器。它们比以往任何时候都更迟缓、更不被信任——却仍占据最大的市场份额。理解「为什么」，是这门生意的第一课。'],
  ['14','07','III','第三部','Premium Masters Boutiques','高端硕博申请机构',
   'GGU, PalmDrive, Compass, Valeon and their cohort are AcademiaOne’s true reference class: premium prices, mentor networks, outcome-led brands. This chapter reads their playbooks line by line — pricing, people, promises, and cracks.',
   '世毕盟、棕榈大道、指南者、再来人及其同类，才是 AcademiaOne 真正的参照系：高客单价、导师网络、以结果立品牌。本章逐行拆解它们的打法——定价、团队、承诺，以及裂缝。'],
  ['16','08','III','The Platform Graveyard','平台模式的沉浮','',''],
  ['18','09','III','Background & Adjacent Services','背景提升与周边服务','',''],
  ['20','10','III','Communities & Content','社区与内容生态','',''],
  ['22','11','III','The UK–HK–SG Battleground','英港新主战场','',''],
  ['24','12','IV','Global Platforms & Recruiters','国际平台与招生巨头','',''],
  ['26','13','IV','Pathways & the B2B Machine','预科与B2B体系','',''],
  ['28','14','IV','Western Premium & MBA Consulting','欧美高端申请咨询','',''],
  ['30','15','V','The Crimson Playbook','Crimson 扩张手册','',''],
  ['32','16','V','Marketing & CAC in China','获客与营销经济学','',''],
  ['34','17','V','The Money Map','资本地图','',''],
  ['36','18','V','Why They Die','死亡样本：失败模式','',''],
  ['38','19','V','Patterns & Insights','规律与洞察','',''],
  ['40','20','V','The AcademiaOne Strategy','AcademiaOne 战略','',''],
  ['42','21','V','Roadmap, KPIs & Risks','路线图、指标与风险','',''],
  ['44','22','V','Sources & Appendix','来源与附录','',''],
];
// NOTE: rows 0-1 carry [file,no,part,partZh,titleEn,titleZh,dekEn,dekZh]; rest carry [file,no,part,titleEn,titleZh,'',''] with deks filled later
const deks = {
  '08': ['Between 2014 and 2019, venture capital poured into “free” study-abroad platforms that would disrupt the agencies. Almost every one of them stalled, shrank or died. Their post-mortems are the cheapest tuition AcademiaOne will ever pay.',
         '2014–2019 年，风险资本涌入号称要颠覆传统中介的「免费留学平台」。它们几乎全部停滞、萎缩或死亡。这些尸检报告，是 AcademiaOne 能上到的最便宜的一课。'],
  '09': ['Research programmes, publication mills, internship placement, coursework tutoring: the services bolted onto the application itself. A revenue expansion map — and an ethical minefield with real regulatory tail-risk.',
         '科研项目、论文产出、实习内推、课业辅导：围绕申请本身长出的服务群。这既是一张收入扩张地图，也是一片有真实监管尾部风险的道德雷区。'],
  '10': ['Gter, 1Point3Acres, ChaseDream and the RED ecosystem are where applicants actually form their opinions. Whoever owns trusted attention upstream of the decision owns the funnel.',
         '寄托、一亩三分地、ChaseDream 和小红书生态，才是申请人真正形成判断的地方。谁在决策上游握有可信的注意力，谁就握有整条漏斗。'],
  '11': ['UK, Hong Kong and Singapore are AcademiaOne’s home turf — and the fastest-heating segment of the whole market. This chapter maps the specialists already dug in on that ground.',
         '英国、香港、新加坡是 AcademiaOne 的主场——也是整个市场升温最快的板块。本章绘制已在这块阵地上扎根的专门机构。'],
  '12': ['IDP, ApplyBoard, Leverage and the commission-funded recruiting layer: enormous volume, thin margins, and total exposure to visa politics. What the 2024–26 policy shocks did to them is a warning about business-model dependency.',
         'IDP、ApplyBoard、Leverage 与整个佣金驱动的招生层：体量巨大、利润微薄、完全暴露在签证政治之下。2024–26 年政策冲击对它们的打击，是关于商业模式依赖性的一记警钟。'],
  '13': ['Shorelight, INTO, Navitas, Study Group: the B2B machine universities use to buy enrolment. It is consolidating under PE ownership and shedding staff — and it shapes which universities need agents at all.',
         'Shorelight、INTO、Navitas、Study Group：大学用来「购买生源」的 B2B 机器。它们正在 PE 手中整合、裁员——也决定着哪些大学根本还需要中介。'],
  '14': ['IvyWise, InGenius, Command, and the MBA specialists: the most mature per-hour consulting market in admissions. Their pricing discipline and consultant economics are directly transplantable to a Masters boutique.',
         'IvyWise、InGenius、Command 与 MBA 专业咨询：申请行业最成熟的「按小时计价」市场。它们的定价纪律与顾问经济学，可以直接移植到硕士精品咨询。'],
  '15': ['From two Auckland students to a ~$1B, 21-market company in a decade — without losing premium pricing. Crimson is the single most instructive scaling case in this industry. Here is the machine, part by part.',
         '十年时间，从奥克兰的两个学生做到估值约十亿美元、覆盖 21 个市场——而且没有丢掉高客单价。Crimson 是这个行业最值得研读的规模化案例。本章逐个零件拆解这台机器。'],
  '16': ['Where Chinese Masters applicants actually come from in 2026: RED, Zhihu, private-domain WeChat funnels, referrals — and what a signed client costs at each door. The chapter AcademiaOne’s budget should be built on.',
         '2026 年，中国硕士申请客户到底从哪里来：小红书、知乎、企业微信私域、转介绍——以及每扇门后签下一个客户的真实成本。AcademiaOne 的预算应该建立在这一章之上。'],
  '17': ['Roughly $2 billion of disclosed venture and PE money has flowed through this database of companies. Mapping who raised what against what happened next yields an uncomfortable, liberating conclusion.',
         '这份数据库里的公司，累计流过约 20 亿美元的已披露风险与私募资本。把「谁融了多少钱」和「后来发生了什么」放在一张图上，结论令人不适，却也令人解脱。'],
  '18': ['Taisha died with an A-share listing. ShunShun died of its own partner model. The platforms died of free. A ranked autopsy of the ten deadliest failure patterns — each one a design constraint for AcademiaOne.',
         '太傻带着A股壳死了，顺顺死于自己的合伙人制，平台们死于「免费」。本章按致死率排序解剖十大失败模式——每一条都是 AcademiaOne 的设计约束。'],
  '19': ['Fourteen patterns that hold across a hundred-plus companies, two languages and four geographies. This is the chapter to reread before every major decision.',
         '十四条在一百多家公司、两种语言、四大地域中反复成立的规律。每次重大决策之前，值得重读的就是这一章。'],
  '20': ['Positioning, pricing ladder, brand architecture, first ten hires, budget allocation: the evidence of the previous nineteen chapters converted into one operating plan.',
         '定位、价格阶梯、品牌架构、前十名员工、预算分配：把前十九章的证据，换算成一份可执行的经营方案。'],
  '21': ['Twelve months, thirty-six months, twelve KPIs, ten risks. What to build, in what order, and how to know it is working.',
         '十二个月、三十六个月、十二个关键指标、十大风险。先建什么、后建什么、如何判断它在起效。'],
  '22': ['Where the data came from, how to keep it alive, and the full source trail behind every chapter.',
         '数据从哪里来、如何持续更新，以及每一章背后的完整来源链。'],
};
const partNames = {III:['III · China','第三部 · 中国市场'], IV:['IV · The World','第四部 · 国际市场'], V:['V · How to Win','第五部 · 制胜之道']};
let made = 0;
for (const row of chapters) {
  let file, no, part, tEn, tZh, dEn, dZh;
  if (row.length === 8) { [file, no, part, , tEn, tZh, dEn, dZh] = row; }
  else { [file, no, part, tEn, tZh] = row; [dEn, dZh] = deks[no] || ['','']; }
  const pn = partNames[part] || [part, part];
  const html = `<!-- ============ CH${no} ${tEn.toUpperCase()} ============ -->
<section class="ch" id="ch${no}">
  <div class="ch-head rv">
    <div class="ch-no"><span class="en">Chapter <b>${no}</b> · Part ${part}</span><span class="zh">${pn[1].split(' · ')[0]} · 第 <b>${no}</b> 章</span></div>
    <h2><span class="en">${tEn}</span><span class="zh">${tZh}</span></h2>
    <div class="dek">
      <span class="en">${dEn}</span>
      <span class="zh">${dZh}</span>
    </div>
    <hr class="gold-rule">
  </div>
  <!-- CH${no}-BODY -->
</section>
`;
  const slug = tEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
  fs.writeFileSync(path.join(P, `${file}-ch${no}-${slug}.html`), html);
  made++;
}
console.log('generated', made, 'shells');
