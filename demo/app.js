'use strict';
/* 大戶 Junior 互動 Demo — 狀態、資料、渲染、互動
   兩支手機共用同一份 state；所有操作 → 改 state → render() 重繪 */

// ================= 資料 =================
const LESSONS = [
  {id:'budget', t:'什麼是預算？', body:'預算就是先決定錢要怎麼用，再開始花。零用錢一入帳，先想好這週要存多少、能花多少，就不會到週末才發現錢不夠。', q:'零用錢一入帳，最好先做什麼？', a:['先存一部分，再決定能花多少','先把想買的東西買下來'], c:0, ok:'沒錯！先存再花，是理財的第一步。', no:'先花再存，常常會發現沒錢可存喔。'},
  {id:'needwant', t:'需要 vs 想要', body:'需要是生活必須的，例如車資、文具；想要是有了會開心、但沒有也沒關係的，例如飲料、漫畫。兩種都可以花，重點是知道自己在花哪一種。', q:'一杯手搖飲比較接近？', a:['需要','想要'], c:1, ok:'答對了！偶爾買沒關係，知道它是「想要」就好。', no:'再想想：不喝手搖飲，生活會過不下去嗎？'},
  {id:'deposit', t:'定存與利息', body:'定存是跟銀行約好，把一筆錢放一段時間不動用，到期時銀行會多給你一點利息。放得越久，利息通常越多。', q:'定存還沒到期就想拿出來，會怎樣？', a:['跟活存一樣，隨時拿沒影響','通常會少拿一些利息'], c:1, ok:'正確！所以定存要放「暫時用不到的錢」。', no:'提前解約通常會少拿利息，要先想清楚喔。'},
  {id:'compound', t:'複利：讓錢自己長大', body:'利息加回本金，下一次一起生利息，就是複利。時間拉得越長，滾出來的錢越多，所以越早開始存越有利。', q:'複利效果最需要什麼？', a:['時間','運氣'], c:0, ok:'沒錯！時間是複利最好的朋友。', no:'複利靠的不是運氣，而是長時間累積。'},
  {id:'risk', t:'風險與分散', body:'投資有機會賺，也可能賠。把錢分散放在不同地方，某一個跌了，其他的還能撐住，就是「雞蛋不要放在同一個籃子」。', q:'為什麼要分散投資？', a:['降低單一投資賠錢的影響','這樣就保證一定賺錢'], c:0, ok:'正確！分散能降低風險，但沒有保證賺錢這回事。', no:'投資沒有保證賺錢，分散是為了降低風險。'},
  {id:'etf', t:'ETF 與定期定額', body:'ETF 像一個裝了很多家公司股票的籃子，買一份就同時擁有很多公司的一小部分。定期定額是每個月固定買一點，不用猜什麼時候最便宜。', q:'定期定額的好處是？', a:['不用猜買點，長期慢慢累積','每次都能買在最低點'], c:0, ok:'答對了！穩穩地買、長期持有。', no:'沒有人能每次都買在最低點，定期定額是為了不用猜。'},
  {id:'scam', t:'防詐：保證獲利都是騙人的', body:'有人說「幫忙收錢就能賺錢」或「保證穩賺不賠」，幾乎都是詐騙。把帳戶借給別人用，自己可能變成詐騙共犯，帳戶也會被凍結。', q:'網友說借你的帳戶收款可以賺 500 元，你該？', a:['拒絕，並告訴爸媽','答應，反正只是收錢'], c:0, ok:'做得好！這就是人頭帳戶詐騙。', no:'這是人頭帳戶詐騙，答應的話你會變成共犯！'}
];
const FEATURES = [
  {id:'transfer', t:'轉帳給朋友', d:'聚餐分帳、團購付款，可以直接轉帳給同學。', online:true, lesson:'scam'},
  {id:'deposit', t:'定存', d:'把錢放 3 個月不動，時間到了會多一點利息。', online:true, lesson:'deposit'},
  {id:'fx', t:'外幣存款', d:'存一點日圓或美元，認識匯率怎麼變化。', online:false, lesson:'risk'},
  {id:'fund', t:'基金定期定額', d:'每月小額投資，和爸媽一起慢慢累積。', online:false, lesson:'etf'},
  {id:'stock', t:'小額存股', d:'用很少的錢，成為公司的小股東。', online:false, lesson:'compound'}
];
const CH = [
  {id:'allow', n:'01', t:'零用錢自動入帳', dual:true, kid:'home', par:'allowance', tip:'在右邊媽媽的手機選好金額與頻率，按「立即撥款」，左邊小安的餘額會即時入帳並跳出通知。'},
  {id:'home', n:'02', t:'孩子的首頁', dual:false, kid:'home', tip:'餘額、本週還能花多少、存錢目標進度一眼看懂。往下滑可以看到灰色的「需要爸媽解鎖」功能。'},
  {id:'pay', n:'03', t:'付款前想一想', dual:false, kid:'pay', tip:'小安出示付款條碼，用下方「模擬店家掃碼」選一家店。付款前會先提醒「目標會晚幾天達成」；付款後自動記帳，小安只要點「需要」或「想要」，買了什麼可記可不記。試試「遊戲點數儲值」，它被爸媽封鎖了。'},
  {id:'ledger', n:'04', t:'帳本與每週回顧', dual:false, kid:'ledger', tip:'消費自動分類，看「需要／想要」的比例。在每週回顧選出最值得的一筆，右邊可以看到它同步給了媽媽。'},
  {id:'goal', n:'05', t:'存錢目標與獎勵', dual:true, kid:'goal', par:'rewards', tip:'按「存入 NT$100」三次達成目標，媽媽設定的加碼會自動入帳。也可以在右邊切換獎勵規則、送出鼓勵。'},
  {id:'ai', n:'06', t:'AI 理財小幫手', dual:false, kid:'ai', tip:'點選下方的問題，小幫手會用孩子聽得懂的話回答。試試最後一題，看它如何識破人頭帳戶詐騙。'},
  {id:'school', n:'07', t:'理財學堂', dual:false, kid:'school', tip:'學堂隨時都能看。點進任一課完成小測驗，下方也有合作夥伴的投資競賽、營隊推薦。'},
  {id:'unlock', n:'08', t:'解鎖理財功能', dual:true, kid:'home', par:'overview', tip:'在小安的首頁點灰色的「定存」，按「請爸媽解鎖」，再到右邊按「同意」。換成「外幣存款」試試，會走預約分行的流程。'},
  {id:'safe', n:'09', t:'防詐安全守護', dual:true, kid:'home', par:'safety', tip:'右邊可以調整單日上限與封鎖類別。按「模擬：陌生人轉入」，看銀行如何同時提醒孩子與父母。'},
  {id:'grow', n:'10', t:'成長路線與成年禮', dual:false, kid:'growth', tip:'孩子的成長分成四階段：零用錢管理、理財學堂、解鎖理財功能，最後是 18 歲成年禮。按「快轉到 18 歲」看結業證書與一鍵轉為正式大戶。'}
];
// 付款時由「店家」送出金額，孩子不用先選商品
const MERCHANTS = [
  {id:'tea', name:'手搖飲店', amt:65, cat:'飲食'},
  {id:'stat', name:'文具店', amt:45, cat:'文具'},
  {id:'bus', name:'公車', amt:15, cat:'交通'},
  {id:'game', name:'遊戲點數儲值', amt:300, cat:'遊戲儲值', block:'game'}
];
const NOTE_CHIPS = ['飲料', '午餐', '文具', '零食'];
const AIQA = [
  {q:'為什麼要存錢？', a:'存錢就是幫「未來的自己」準備。想買比較貴的東西、或遇到突發狀況時，存下來的錢就派上用場。你的球鞋基金就是很好的開始！', warn:false},
  {q:'什麼是定存？', a:'定存是跟銀行約好，把一筆錢放一段時間不動，到期時銀行會多給你利息。想試試的話，可以先看學堂的「定存與利息」，再請爸媽解鎖喔。', warn:false},
  {q:'什麼是 ETF？', a:'ETF 像一個裝了很多家公司股票的籃子。買一份，就一次擁有很多公司的一小部分，風險比只買一家公司分散。學堂裡有一課專門介紹它。', warn:false},
  {q:'網友說借我的帳戶收款可以賺 500 元，可以嗎？', a:'千萬不要！這是典型的「人頭帳戶」詐騙。把帳戶借給別人收錢，你可能會被當成詐騙共犯，帳戶也會被凍結。請拒絕對方，並馬上告訴爸媽。', warn:true}
];
const CHEERS = ['這週很會存喔！', '快達成了，加油！', '帳記得很清楚，讚！'];
const BOOKING = '12/13（六）10:00・[分行名稱]';
const SAVE_PER_WEEK = 100;
const BLOCK_NAMES = {game:'遊戲儲值', crypto:'加密貨幣交易', overseas:'境外網購'};

// ================= 狀態 =================
function initState() {
  return {
    ch:'allow', kidView:'home', parView:'allowance',
    balance:480, weekSpent:110, todaySpent:95, allowance:300, freq:'每週', auto:true,
    goal:{name:'球鞋基金', saved:1500, target:1800}, goalsDone:0, celebrate:null,
    tx:[
      {id:1, name:'學校餐廳', amt:80, cat:'飲食', tag:'need', note:'午餐'},
      {id:2, name:'公車', amt:15, cat:'交通', tag:'need', note:''},
      {id:3, name:'手搖飲店', amt:60, cat:'飲食', tag:'want', note:'珍珠奶茶'},
      {id:4, name:'文具店', amt:35, cat:'文具', tag:'need', note:'自動鉛筆'},
      {id:5, name:'書店', amt:120, cat:'娛樂', tag:'want', note:''}
    ],
    pay:{step:'code', m:null, txId:null, note:'', reason:''},
    reviewPick:null,
    rules:{goal:true, noOver:false, lesson:false}, lessonBonusGiven:false,
    cheer:'', lessonsDone:[], lessonOpen:null, quizPick:null,
    msgs:[{from:'ai', text:'嗨小安，我是你的理財小幫手！關於錢的任何問題，都可以問我。'}],
    feat:{transfer:'locked', deposit:'locked', fx:'locked', fund:'locked', stock:'locked'},
    featNote:{}, sheet:null, unlockShow:null,
    dayLimit:1500, blocked:{game:true, crypto:true, overseas:false}, scam:false, kidScam:false,
    grad:null, feed:[], kidToast:'', parToast:''
  };
}
let state = initState();
let timers = {};

function set(patch) { Object.assign(state, patch); render(); }
function toast(who, msg) {
  const key = who === 'kid' ? 'kidToast' : 'parToast';
  state[key] = msg; render();
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => { state[key] = ''; render(); }, 3400);
}
function addFeed(t) { state.feed = [{t, id:Date.now() + Math.random()}].concat(state.feed).slice(0, 5); }

// ================= 小工具 =================
const fmt = n => Number(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chOf = id => CH.find(c => c.id === id);
const featOf = id => FEATURES.find(f => f.id === id);
const lessonOf = id => LESSONS.find(l => l.id === id);

const I = {
  back:'<path d="M15 5l-7 7 7 7"/>', next:'<path d="M9 5l7 7-7 7"/>',
  scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>',
  heart:'<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  unlock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.8-1.3"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  shieldAlert:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8v5M12 16v.5"/>',
  cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
  gift:'<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
  home:'<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chart:'<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  chat:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  card:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  phone:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  eyeOff:'<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.4 3M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6c1.4 0 2.7-.4 3.9-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  ff:'<path d="M4 6l8 6-8 6zM12 6l8 6-8 6z"/>'
};
const ic = (n, st = '', cls = 'ico') => `<svg class="${cls}" style="${st}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const tagHtml = t => t.tag === 'need' ? '<span class="tag need">需要</span>'
  : t.tag === 'want' ? '<span class="tag want">想要</span>' : '<span class="tag none">未標記</span>';
const QR = `<svg width="160" height="160" viewBox="0 0 17 17" aria-hidden="true" shape-rendering="crispEdges"><rect width="17" height="17" fill="#fff"/><g fill="#13213F"><rect x="1" y="1" width="5" height="5"/><rect x="11" y="1" width="5" height="5"/><rect x="1" y="11" width="5" height="5"/><rect x="7" y="1" width="1" height="2"/><rect x="9" y="2" width="1" height="3"/><rect x="7" y="4" width="2" height="1"/><rect x="7" y="7" width="3" height="1"/><rect x="11" y="7" width="1" height="3"/><rect x="13" y="8" width="3" height="1"/><rect x="1" y="7" width="2" height="1"/><rect x="4" y="8" width="2" height="2"/><rect x="8" y="9" width="2" height="2"/><rect x="7" y="12" width="1" height="4"/><rect x="9" y="13" width="2" height="1"/><rect x="12" y="11" width="2" height="2"/><rect x="14" y="13" width="2" height="3"/><rect x="11" y="14" width="2" height="2"/></g><g fill="#fff"><rect x="2" y="2" width="3" height="3"/><rect x="12" y="2" width="3" height="3"/><rect x="2" y="12" width="3" height="3"/></g><g fill="#13213F"><rect x="3" y="3" width="1" height="1"/><rect x="13" y="3" width="1" height="1"/><rect x="3" y="13" width="1" height="1"/></g></svg>`;

// ================= 衍生數值 =================
function derive() {
  const s = state;
  const weekLeft = Math.max(0, s.allowance - s.weekSpent);
  const g = s.goal;
  const goalPct = Math.min(100, Math.round(g.saved / g.target * 100));
  let need = 0, want = 0; const cat = {};
  s.tx.forEach(t => {
    if (t.tag === 'need') need += t.amt; else if (t.tag === 'want') want += t.amt;
    cat[t.cat] = (cat[t.cat] || 0) + t.amt;
  });
  const total = s.tx.reduce((a, t) => a + t.amt, 0);
  const tagged = need + want;
  const needPct = tagged ? Math.round(need / tagged * 100) : 0;
  const wantPct = tagged ? 100 - needPct : 0;
  const catMax = Math.max(1, ...Object.values(cat));
  const cats = Object.keys(cat).map(k => ({name:k, amt:cat[k], pct:Math.round(cat[k] / catMax * 100)})).sort((a, b) => b.amt - a.amt);
  const openN = FEATURES.filter(f => s.feat[f.id] === 'open').length;
  const budget = s.freq === '每週' ? s.allowance * 4 : s.allowance;
  const rules = [
    {id:'goal', t:'達成存錢目標，加碼 NT$200', d:'目標達成時自動入帳'},
    {id:'noOver', t:'本月沒超支，下月 +NT$50', d:`本月已花 NT$${fmt(total)}／預算 NT$${fmt(budget)}・${total <= budget ? '目前未超支' : '已超支'}`},
    {id:'lesson', t:'完成 3 堂學堂課程，加碼 NT$50', d:`學堂完成時自動入帳・目前 ${s.lessonsDone.length} 堂`}
  ];
  return {weekLeft, goalPct, needPct, wantPct, total, cats, openN, rules,
    rev:s.tx.slice().reverse(),
    etaWeeks:Math.ceil((g.target - g.saved) / SAVE_PER_WEEK)};
}

// ================= 左側與標題 =================
function viewSide() {
  const c = chOf(state.ch);
  return `<aside class="side">
    <div class="col" style="gap:6px">
      <div class="brand"><div class="logo">Jr</div><div class="brand-name">大戶 Junior</div></div>
      <div class="slogan">孩子的第一個帳戶，父母的第一個理財教具</div>
    </div>
    <nav class="chaps" aria-label="示範章節">
      ${CH.map(x => `<button class="chap ${x.id === state.ch ? 'on' : ''}" data-act="goCh" data-arg="${x.id}"><span class="num">${x.n}</span><span>${x.t}</span><span class="badge ${x.dual ? 'duo' : ''}">${x.dual ? '親子互動' : '孩子'}</span></button>`).join('')}
    </nav>
    <div class="tipbox"><div class="t">試試看</div><div class="b">${c.tip}</div></div>
    <div class="side-foot">
      <button class="btn sec" data-act="reset">重新開始示範</button>
      <div class="xs" style="line-height:1.5">提案概念展示，非永豐銀行正式產品；畫面中的人物、金額與合作活動皆為示範。鍵盤 ← → 可切換章節。</div>
    </div>
  </aside>`;
}

function viewMain(d) {
  const c = chOf(state.ch);
  const idx = CH.indexOf(c);
  return `<main class="main">
    <div class="mhead">
      <button class="navbtn" data-act="prevCh" ${idx === 0 ? 'disabled' : ''}>${ic('back')}上一章</button>
      <div class="mtitle"><span class="t">${c.n}　${c.t}</span><span class="mode ${c.dual ? 'duo' : 'solo'}">${c.dual ? '親子互動・雙手機' : '孩子端・單手機'}</span></div>
      <button class="navbtn" data-act="nextCh" ${idx === CH.length - 1 ? 'disabled' : ''}>下一章${ic('next')}</button>
    </div>
    <div class="stagerow">
      <div class="phonecol"><div class="lbl-phone">小安的手機・大戶 Junior App</div>${viewKid(d)}</div>
      ${c.dual
        ? `<div class="phonecol fade"><div class="lbl-phone">媽媽的手機・DAWHO App › Junior</div>${viewParent(d)}</div>`
        : viewSync()}
    </div>
  </main>`;
}

function viewSync() {
  return `<div class="sync fade">
    <div class="hd">${ic('phone', 'color:#1E40AF')}媽媽的 DAWHO App 同步收到</div>
    ${state.feed.length
      ? state.feed.map(f => `<div class="it">${esc(f.t)}</div>`).join('')
      : '<div class="empty">小安在這一章的操作，會即時同步到媽媽的 App。</div>'}
    <div class="xs" style="line-height:1.6;margin-top:4px">安全警示永遠通知父母；日常消費父母看得到店家、金額與需要／想要，孩子寫的備註只有自己看得到。</div>
  </div>`;
}

// ================= 孩子端 =================
function viewKid(d) {
  const s = state;
  const titles = {home:'嗨，小安', pay:'付款', ledger:'我的帳本', goal:'存錢目標', school:'理財學堂', ai:'理財小幫手', growth:'我的成長路線'};
  const showBack = s.kidView === 'pay' || s.kidView === 'growth';
  const tab = (v, icon, t) => `<button class="tab ${s.kidView === v ? 'on' : ''}" data-act="kv" data-arg="${v}">${ic(icon)}${t}</button>`;
  const bodyKey = 'kid-' + s.kidView + '-' + (s.kidView === 'pay' ? s.pay.step : '') + (s.lessonOpen || '');
  const views = {home:kidHome, pay:kidPay, ledger:kidLedger, goal:kidGoal, school:kidSchool, ai:kidAi, growth:kidGrowth};
  return `<div class="ph"><div class="scr">
    <div class="top">
      <div class="row" style="gap:10px;min-width:0">
        ${showBack ? `<button class="iconbtn" aria-label="回首頁" data-act="kv" data-arg="home">${ic('back')}</button>` : ''}
        <div class="col"><span class="app-n">大戶 Junior</span><span class="ttl">${titles[s.kidView]}</span></div>
      </div>
      <div class="avatar">安</div>
    </div>
    <div class="body" data-sk="${bodyKey}">${views[s.kidView](d)}</div>
    <div class="tabs">
      ${tab('home', 'home', '首頁')}${tab('ledger', 'chart', '帳本')}${tab('goal', 'target', '目標')}${tab('school', 'book', '學堂')}${tab('ai', 'chat', '小幫手')}
    </div>
    ${kidOverlays(d)}
    ${s.kidToast ? `<div class="toast">${ic('bell', 'color:#FBBF24')}<span>${esc(s.kidToast)}</span></div>` : ''}
  </div></div>`;
}

function kidHome(d) {
  const s = state;
  const statusText = {locked:'需要爸媽解鎖', pending:'等待爸媽回覆', branch:'爸媽已同意・待臨櫃', booked:'已預約分行', open:'已開通'};
  const tileCls = {locked:'locked', pending:'pending', branch:'pending', booked:'pending', open:'open'};
  return `
    <div class="bal">
      <span class="lbl">帳戶餘額</span>
      <span class="big">NT$ ${fmt(s.balance)}</span>
      <div class="row sb"><span class="lbl">本週還能花</span><span style="font-size:13px;font-weight:700">NT$ ${fmt(d.weekLeft)} / ${s.allowance}</span></div>
      <div class="track"><div class="fill y" style="width:${Math.min(100, Math.round(d.weekLeft / s.allowance * 100))}%"></div></div>
    </div>
    <button class="btn pri" style="min-height:52px;font-size:16px" data-act="kv" data-arg="pay">${ic('scan')}付款</button>
    ${s.cheer ? `<div class="card warmc fade" style="flex-direction:row;align-items:center">${ic('heart', 'color:#7A3D00')}<div class="col"><span class="xs" style="color:#7A3D00;font-weight:700">來自媽媽的鼓勵</span><span style="font-size:14px">${esc(s.cheer)}</span></div></div>` : ''}
    <button class="card" data-act="kv" data-arg="goal">
      <div class="row sb" style="width:100%"><span class="h3">${s.goal.name}</span><span class="sm">${fmt(s.goal.saved)} / ${fmt(s.goal.target)}</span></div>
      <div class="track"><div class="fill g" style="width:${d.goalPct}%"></div></div>
      ${s.rules.goal ? '<span class="xs" style="color:#0A5C47;font-weight:700">達成後媽媽加碼 NT$200</span>' : ''}
    </button>
    <div class="card" style="gap:0">
      <div class="row sb" style="margin-bottom:4px"><span class="h3">最近消費</span><span class="xs">自動記帳</span></div>
      ${d.rev.slice(0, 3).map(t => `<div class="lr"><span>${esc(t.name)}</span><span class="row">${tagHtml(t)}<b>-${t.amt}</b></span></div>`).join('')}
    </div>
    <div class="col" style="gap:8px">
      <div class="row sb"><span class="h3">我的功能</span><span class="xs">灰色功能需要爸媽解鎖</span></div>
      <div class="grid2">
        <div class="tile open"><span class="n">零用錢帳戶</span><span class="xs">已開通</span></div>
        <button class="tile open" data-act="kv" data-arg="goal"><span class="n">存錢目標</span><span class="xs">已開通</span></button>
        ${FEATURES.map(f => {
          const st = s.feat[f.id];
          return `<button class="tile ${tileCls[st]}" data-act="openSheet" data-arg="${f.id}">
            <span class="row sb" style="width:100%"><span class="n">${f.t}</span>${st === 'locked' ? ic('lock', 'width:16px;height:16px') : st === 'open' ? ic('check', 'width:16px;height:16px;color:#0A5C47') : ''}</span>
            <span class="xs" style="color:inherit">${statusText[st]}</span></button>`;
        }).join('')}
      </div>
    </div>
    <button class="card darkc" style="flex-direction:row;align-items:center" data-act="kv" data-arg="growth">${ic('cap', 'color:#FBBF24')}<div class="col" style="flex:1"><span style="font-size:14px;font-weight:700">我的成長路線</span><span style="font-size:12px;color:#D3DBEA">距離 18 歲成年禮還有約 6 年</span></div></button>`;
}

function kidPay(d) {
  const s = state, p = s.pay, m = p.m;
  if (p.step === 'code') return `
    <div class="card center" style="padding:20px 16px;gap:10px">
      <span class="sm">請讓店員掃描，或將手機靠近感應</span>
      ${QR}
      <span class="xs">可用餘額 NT$ ${fmt(s.balance)}・今日已花 NT$ ${fmt(s.todaySpent)}／上限 NT$ ${fmt(s.dayLimit)}</span>
    </div>
    <div class="demo-box">
      <span class="hd">示範用：模擬店家掃碼後送出的金額</span>
      ${MERCHANTS.map(x => `<button class="item" data-act="scan" data-arg="${x.id}"><span class="col"><span style="font-size:14px;font-weight:700">${x.name}</span><span class="xs">${x.cat}</span></span><span style="font-size:15px;font-weight:800">NT$ ${x.amt}</span></button>`).join('')}
    </div>`;
  if (p.step === 'confirm') {
    const delay = Math.max(1, Math.ceil(m.amt / (SAVE_PER_WEEK / 7)));
    return `
    <div class="card center fade" style="padding:22px 16px">
      <span class="sm">${m.name} 請求付款</span>
      <span class="big">NT$ ${m.amt}</span>
      <span class="xs">${m.cat}</span>
    </div>
    <div class="alert fade">
      <div class="row">${ic('target')}<span style="font-size:14px;font-weight:700">付款前想一想</span></div>
      <span style="font-size:14px;line-height:1.6">付了這筆，你的「${s.goal.name}」會<b>晚 ${delay} 天</b>達成。</span>
      <span class="xs" style="color:#4A2500">付款後本週還能花 NT$ ${fmt(Math.max(0, d.weekLeft - m.amt))}</span>
    </div>
    <button class="btn pri" data-act="confirmPay">確認付款</button>
    <button class="btn sec" data-act="cancelPay">再想想，先不買</button>`;
  }
  if (p.step === 'blocked') return `
    <div class="card center fade" style="padding:24px 16px">
      ${ic('shield', 'width:40px;height:40px;color:#4B5670')}
      <span class="h3" style="font-size:17px">這筆付款無法完成</span>
      <span class="sm" style="line-height:1.6">${p.reason}</span>
    </div>
    <button class="btn sec" data-act="kv" data-arg="home">知道了</button>`;
  if (p.step === 'tag') return `
    <div class="card center fade" style="padding:18px 16px;gap:4px">
      ${ic('check', 'width:36px;height:36px;color:#0A5C47')}
      <span class="h3" style="font-size:18px">付款成功 NT$ ${m.amt}</span>
      <span class="sm">${m.name}・${m.cat}・已自動記帳</span>
    </div>
    <div class="card">
      <span class="h3">這筆是「需要」還是「想要」？</span>
      <span class="xs" style="line-height:1.5">需要：生活必須的；想要：有了會開心，但沒有也沒關係</span>
      <div class="grid2" style="margin-top:4px">
        <button class="btn sec huge" data-act="tag" data-arg="need">需要</button>
        <button class="btn warm huge" data-act="tag" data-arg="want">想要</button>
      </div>
    </div>
    <div class="card">
      <div class="row sb"><span style="font-size:13px;font-weight:700">買了什麼？（選填）</span><span class="privacy">${ic('eyeOff')}只有你看得到</span></div>
      <input id="note-input" class="note-input" type="text" maxlength="20" placeholder="可以不寫，直接按上面的按鈕" value="${esc(p.note)}" aria-label="買了什麼（選填）">
      <div class="chips">${NOTE_CHIPS.map(c => `<button class="chip s ${p.note === c ? 'on' : ''}" data-act="noteChip" data-arg="${c}">${c}</button>`).join('')}</div>
    </div>`;
  if (p.step === 'done') {
    const tx = s.tx.find(t => t.id === p.txId);
    return `
    <div class="card fade">
      <span class="h3">記好了！</span>
      <div class="row">${tagHtml(tx)}<span style="font-size:14px">${esc(tx.name)} NT$ ${tx.amt}${tx.note ? `・${esc(tx.note)}` : ''}</span></div>
      <span style="font-size:14px;line-height:1.6">這個月「想要」占了 ${d.wantPct}%。${d.wantPct >= 40 ? '下次付款前，記得想想你的目標喔！' : '控制得很好，繼續保持！'}</span>
      <div class="row" style="margin-top:4px"><span class="xs" style="width:30px">需要</span><div class="track"><div class="fill" style="width:${d.needPct}%"></div></div></div>
      <div class="row"><span class="xs" style="width:30px">想要</span><div class="track"><div class="fill o" style="width:${d.wantPct}%"></div></div></div>
    </div>
    <button class="btn pri" data-act="kv" data-arg="home">回首頁</button>
    <button class="btn sec" data-act="kv" data-arg="ledger">看我的帳本</button>`;
  }
  return '';
}

function kidLedger(d) {
  const s = state;
  const pick = s.reviewPick ? s.tx.find(t => t.id === s.reviewPick) : null;
  const label = t => t.note ? `${t.name}・${t.note}` : t.name;
  return `
    <div class="card">
      <span class="sm">本月共花費</span>
      <span class="big">NT$ ${fmt(d.total)}</span>
      <div class="col" style="gap:8px;margin-top:4px">
        ${d.cats.map(c => `<div class="col" style="gap:4px"><div class="row sb"><span style="font-size:13px">${c.name}</span><b style="font-size:13px">NT$ ${fmt(c.amt)}</b></div><div class="track"><div class="fill" style="width:${c.pct}%"></div></div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <span class="h3">需要 vs 想要</span>
      <div style="display:flex;height:14px;border-radius:99px;overflow:hidden;background:#E4E9F2"><div style="background:#2563EB;width:${d.needPct}%"></div><div style="background:#F59E0B;width:${d.wantPct}%"></div></div>
      <div class="row sb"><span class="tag need">需要 ${d.needPct}%</span><span class="tag want">想要 ${d.wantPct}%</span></div>
      <span style="font-size:13px;line-height:1.6">${d.wantPct >= 40 ? `這個月有 ${d.wantPct}% 花在「想要」，試著把一部分存進目標吧！` : `這個月「想要」只占 ${d.wantPct}%，控制得很好！`}</span>
    </div>
    <div class="card soft">
      <div class="row sb"><span class="h3">每週 30 秒回顧</span><span class="xs">週日</span></div>
      <span style="font-size:14px">這週最值得的一筆花費是？</span>
      ${pick
        ? `<div class="fb ok fade">你選了「${esc(label(pick))}」，已分享給媽媽。</div>`
        : `<div class="col" style="gap:6px">${d.rev.slice(0, 4).map(t => `<button class="opt" data-act="review" data-arg="${t.id}">${esc(label(t))}・NT$ ${t.amt}</button>`).join('')}</div>`}
    </div>
    <div class="card" style="gap:0">
      <div class="row sb" style="margin-bottom:4px"><span class="h3">消費明細</span><span class="privacy">${ic('eyeOff')}備註只有你看得到</span></div>
      ${d.rev.map(t => `<div class="lr"><span class="col"><span>${esc(t.name)}</span><span class="xs">${t.cat}${t.note ? '・' + esc(t.note) : ''}</span></span><span class="row">${tagHtml(t)}<b>-${t.amt}</b></span></div>`).join('')}
    </div>`;
}

function kidGoal(d) {
  const s = state, g = s.goal;
  const on = d.rules.filter(r => s.rules[r.id]);
  return `
    <div class="card" style="padding:20px 16px;gap:10px">
      <div class="row" style="gap:12px"><div style="width:52px;height:52px;border-radius:16px;background:#E3F6EF;color:#0A5C47;display:flex;align-items:center;justify-content:center">${ic('target', 'width:28px;height:28px')}</div><div class="col"><span style="font-size:19px;font-weight:800">${g.name}</span><span class="sm">目標 NT$ ${fmt(g.target)}</span></div></div>
      <div class="row sb"><span style="font-size:26px;font-weight:800">NT$ ${fmt(g.saved)}</span><span style="font-size:15px;font-weight:700;color:#0A5C47">${d.goalPct}%</span></div>
      <div class="track" style="height:12px"><div class="fill g" style="width:${d.goalPct}%"></div></div>
      <span class="sm">${g.saved >= g.target ? '已達成！' : `照每週存 NT$100 的速度，約 ${d.etaWeeks} 週後達成`}</span>
    </div>
    ${on.length ? `<div class="card warmc"><div class="row">${ic('gift', 'color:#7A3D00')}<span class="h3">媽媽設定的獎勵</span></div>${on.map(r => `<span style="font-size:13px;line-height:1.6">・${r.t}</span>`).join('')}</div>` : ''}
    <button class="btn pri" data-act="depositGoal">存入 NT$100</button>
    <span class="xs" style="text-align:center">從零用錢帳戶轉入，目前餘額 NT$ ${fmt(s.balance)}</span>`;
}

function kidSchool() {
  const s = state;
  const l = s.lessonOpen ? lessonOf(s.lessonOpen) : null;
  if (!l) {
    const n = s.lessonsDone.length;
    return `
    <div class="card">
      <div class="row sb"><span class="h3">我的學習進度</span><span class="sm">${n} / ${LESSONS.length} 課</span></div>
      <div class="track"><div class="fill g" style="width:${Math.round(n / LESSONS.length * 100)}%"></div></div>
    </div>
    <div class="col" style="gap:6px">
      ${LESSONS.map((x, i) => `<button class="item" data-act="openLesson" data-arg="${x.id}"><span class="col"><span class="xs">第 ${i + 1} 課・約 3 分鐘</span><span style="font-size:14px;font-weight:700">${x.t}</span></span>${s.lessonsDone.includes(x.id) ? '<span class="tag ok">已完成</span>' : ''}</button>`).join('')}
    </div>
    <div class="row sb"><span class="h3">活動推薦</span><span class="xs">合作夥伴</span></div>
    <button class="ad" style="background:#13213F;color:#fff" data-act="joinComp">
      <span style="font-size:11px;font-weight:700;color:#FBBF24">[合作單位]・寒假限定</span>
      <span style="font-size:16px;font-weight:800">青少年模擬投資競賽</span>
      <span style="font-size:12px;color:#D3DBEA">用虛擬資金練習投資，賠了也不怕。報名需爸媽同意。</span>
    </button>
    <button class="ad" style="background:#E6EEFF;color:#13213F" data-act="joinCamp">
      <span style="font-size:11px;font-weight:700;color:#1E40AF">[合作單位]・週末</span>
      <span style="font-size:16px;font-weight:800">親子理財營</span>
      <span style="font-size:12px;color:#2C3854">和爸媽一起玩理財桌遊、認識防詐。</span>
    </button>`;
  }
  const answered = s.quizPick !== null;
  const right = answered && s.quizPick === l.c;
  const linked = FEATURES.find(f => f.lesson === l.id && s.feat[f.id] === 'locked');
  return `
    <button class="btn ghost" data-act="closeLesson">${ic('back')}所有課程</button>
    <div class="card fade">
      <span class="xs">第 ${LESSONS.indexOf(l) + 1} 課・約 3 分鐘</span>
      <span style="font-size:19px;font-weight:800">${l.t}</span>
      <span style="font-size:14px;line-height:1.75">${l.body}</span>
    </div>
    <div class="card">
      <span class="h3">小測驗</span>
      <span style="font-size:14px;line-height:1.6">${l.q}</span>
      ${l.a.map((a, i) => `<button class="opt ${!answered ? '' : i === l.c ? 'right' : i === s.quizPick ? 'wrong' : ''}" data-act="answer" data-arg="${i}">${a}</button>`).join('')}
      ${answered ? `<div class="fb ${right ? 'ok' : 'no'} fade">${right ? l.ok : l.no}</div>` : ''}
    </div>
    ${right && linked ? `<div class="card soft"><span class="sm">學完這課，就可以試試相關功能</span><button class="btn pri" data-act="requestFeat" data-arg="${linked.id}">請爸媽解鎖「${linked.t}」</button></div>` : ''}`;
}

function kidAi() {
  const s = state;
  return `
    <div class="col" style="gap:8px">
      ${s.msgs.map(m => `<div class="bub ${m.from} fade">${m.text}</div>`).join('')}
    </div>
    <span class="xs" style="font-weight:700;margin-top:4px">試著問問看</span>
    <div class="col" style="gap:6px">
      ${AIQA.map((q, i) => `<button class="opt" style="font-size:13px" data-act="ask" data-arg="${i}">${q.q}</button>`).join('')}
    </div>`;
}

function kidGrowth(d) {
  const s = state, n = s.lessonsDone.length;
  return `
    <div class="grid3">
      <div class="card stat"><b>${s.goalsDone}</b><span class="xs">完成目標</span></div>
      <div class="card stat"><b>${n}</b><span class="xs">學完課程</span></div>
      <div class="card stat"><b>${d.openN}</b><span class="xs">解鎖功能</span></div>
    </div>
    <div class="card" style="gap:0">
      <div class="stage"><div class="dot done">1</div><div class="col" style="gap:2px"><span class="h3">零用錢管理</span><span class="sm">記帳、需要／想要、存錢目標</span><span class="xs" style="color:#0A5C47;font-weight:700">進行中</span></div></div>
      <div class="stage"><div class="dot now">2</div><div class="col" style="gap:2px"><span class="h3">理財學堂</span><span class="sm">隨時都能看，已完成 ${n} / ${LESSONS.length} 課</span></div></div>
      <div class="stage"><div class="dot ${d.openN > 0 ? 'now' : 'next'}">3</div><div class="col" style="gap:2px"><span class="h3">解鎖理財功能</span><span class="sm">轉帳、定存、外幣、基金、存股</span><span class="xs">由爸媽決定，已解鎖 ${d.openN} / 5</span></div></div>
      <div class="stage"><div class="dot next">4</div><div class="col" style="gap:2px"><span class="h3">18 歲成年禮</span><span class="sm">還有約 6 年</span></div></div>
    </div>
    <div class="card darkc" style="gap:10px">
      <div class="row">${ic('cap', 'color:#FBBF24')}<span style="font-size:16px;font-weight:800">18 歲成年禮</span></div>
      <span style="font-size:13px;line-height:1.7;color:#E3E8F2">・一鍵轉為正式「大戶 DAWHO」帳戶，同時開立證券帳戶<br>・存錢紀錄與學堂成果，換成一張理財結業證書<br>・用學到的知識，完成人生第一次真實投資</span>
      <button class="btn warm" data-act="startGrad">${ic('ff')}快轉到 18 歲（示範）</button>
    </div>`;
}

function kidOverlays(d) {
  const s = state;
  let html = '';
  if (s.sheet) {
    const f = featOf(s.sheet), st = s.feat[f.id], lt = lessonOf(f.lesson);
    const learned = s.lessonsDone.includes(f.lesson);
    html += `<div class="overlay"><div class="sheet">
      <div class="row sb"><div class="row">${ic(st === 'open' ? 'check' : 'lock')}<span style="font-size:19px;font-weight:800">${f.t}</span></div><button class="iconbtn" aria-label="關閉" data-act="closeSheet">${ic('close')}</button></div>
      <span style="font-size:14px;line-height:1.6">${f.d}</span>
      ${learned ? `<span class="tag ok" style="align-self:flex-start">已學過「${lt.t}」</span>` : ''}
      ${s.featNote[f.id] ? `<div class="fb no">媽媽：${s.featNote[f.id]}</div>` : ''}
      ${st === 'locked' ? `<button class="btn pri" data-act="requestFeat" data-arg="${f.id}">請爸媽解鎖</button><button class="btn sec" data-act="openLesson" data-arg="${f.lesson}">先了解一下</button>` : ''}
      ${st === 'pending' ? '<div class="fb no">已送出申請，等待爸媽回覆中</div>' : ''}
      ${st === 'branch' ? '<div class="fb ok">爸媽同意了！這項功能需要和爸媽一起到分行完成手續。</div>' : ''}
      ${st === 'booked' ? `<div class="fb ok">已預約 ${BOOKING}，完成手續後就能使用。</div>` : ''}
      ${st === 'open' ? '<div class="fb ok">已開通，可以開始使用了！（示範到此）</div>' : ''}
    </div></div>`;
  }
  if (s.celebrate) html += `<div class="overlay mid"><div class="pop">
    <div class="ring g">${ic('check', 'width:40px;height:40px')}</div>
    <span style="font-size:22px;font-weight:800">目標達成！</span>
    <span style="font-size:14px;line-height:1.6">「${s.celebrate.name}」存滿 NT$ ${fmt(s.celebrate.target)}</span>
    ${s.celebrate.bonus ? '<span class="tag want" style="font-size:13px;padding:6px 12px">媽媽加碼 NT$200 已入帳</span>' : ''}
    <button class="btn pri" data-act="nextGoal">設定下一個目標</button>
  </div></div>`;
  if (s.unlockShow) html += `<div class="overlay mid"><div class="pop">
    <div class="ring y">${ic('unlock', 'width:38px;height:38px')}</div>
    <span style="font-size:22px;font-weight:800">「${featOf(s.unlockShow).t}」解鎖了！</span>
    <div class="fb ok" style="width:100%">媽媽：慢慢來，有問題隨時問我喔！</div>
    <button class="btn pri" data-act="closeUnlock">開始使用</button>
  </div></div>`;
  if (s.kidScam) html += `<div class="overlay mid"><div class="pop left">
    <div class="row">${ic('shieldAlert', 'width:28px;height:28px;color:#7A3D00')}<span style="font-size:18px;font-weight:800">小幫手提醒你</span></div>
    <span style="font-size:14px;line-height:1.7">有陌生人轉了 <b>NT$5,000</b> 給你。如果有人要你把這筆錢轉出去或領出來，這很可能是詐騙。帳戶已暫時保護，也已經通知媽媽了。</span>
    <button class="btn pri" data-act="ackKidScam">我知道了，去找媽媽</button>
  </div></div>`;
  if (s.grad === 'cert') html += `<div class="overlay mid"><div class="pop" style="padding:18px 16px 16px">
    <div class="cert">
      ${ic('award', 'width:30px;height:30px;color:#B7791F')}
      <span class="k">大戶 JUNIOR</span>
      <span class="tt">理財結業證書</span>
      <span class="nm">小安</span>
      <span class="xs" style="margin-top:2px">從 12 歲開始，一路學會管理自己的錢</span>
      <div class="grid2">
        <div class="c"><b>${s.goalsDone}</b><span class="xs">完成存錢目標</span></div>
        <div class="c"><b>${s.lessonsDone.length}/${LESSONS.length}</b><span class="xs">學堂課程</span></div>
        <div class="c"><b>${d.openN}</b><span class="xs">解鎖理財功能</span></div>
        <div class="c"><b>${s.tx.length}</b><span class="xs">記帳筆數</span></div>
      </div>
    </div>
    <span class="xs">示範：數字取自本次 Demo 中的操作紀錄</span>
    <button class="btn pri" data-act="convertGrad">一鍵轉為正式大戶帳戶</button>
  </div></div>`;
  if (s.grad === 'done') html += `<div class="overlay mid"><div class="pop">
    <div class="ring g">${ic('cap', 'width:38px;height:38px')}</div>
    <span style="font-size:22px;font-weight:800">歡迎成為大戶！</span>
    <div class="col" style="width:100%">
      <div class="chk">${ic('check')}大戶 DAWHO 數位帳戶・已開立</div>
      <div class="chk">${ic('check')}大戶投 證券帳戶・已開立</div>
      <div class="chk">${ic('check')}存錢紀錄與學堂成果・已帶入</div>
    </div>
    <div class="fb ok" style="width:100%">下一步：用學到的知識，完成人生第一次真實投資。</div>
    <button class="btn pri" data-act="closeGrad">完成</button>
  </div></div>`;
  return html;
}

// ================= 父母端 =================
function viewParent(d) {
  const s = state;
  const titles = {overview:'小安的帳戶', allowance:'零用錢設定', rewards:'獎勵與鼓勵', safety:'安全設定'};
  const tab = (v, icon, t) => `<button class="tab ${s.parView === v ? 'on' : ''}" data-act="pv" data-arg="${v}">${ic(icon)}${t}</button>`;
  const views = {overview:parOverview, allowance:parAllowance, rewards:parRewards, safety:parSafety};
  return `<div class="ph"><div class="scr">
    <div class="top">
      <div class="col"><span class="app-n p">DAWHO › JUNIOR</span><span class="ttl">${titles[s.parView]}</span></div>
      <div class="avatar p">媽</div>
    </div>
    <div class="body" data-sk="par-${s.parView}">${views[s.parView](d)}</div>
    <div class="tabs">${tab('overview', 'home', '總覽')}${tab('allowance', 'card', '零用錢')}${tab('rewards', 'gift', '獎勵')}${tab('safety', 'shield', '安全')}</div>
    ${s.parToast ? `<div class="toast">${ic('bell', 'color:#FBBF24')}<span>${esc(s.parToast)}</span></div>` : ''}
  </div></div>`;
}

const cheerCard = () => `<div class="card"><span class="h3">給小安一點鼓勵</span><div class="chips">${CHEERS.map((c, i) => `<button class="chip" data-act="cheer" data-arg="${i}">${c}</button>`).join('')}</div></div>`;
const scamAlert = () => `<div class="alert fade">
  <div class="row">${ic('shieldAlert', 'color:#7A3D00')}<span class="h3">永豐防詐守護・異常警示</span></div>
  <span style="font-size:13px;line-height:1.6">小安的帳戶收到陌生帳戶轉入 NT$5,000。系統已暫停轉出，並同步提醒小安。</span>
  <button class="btn dark" data-act="ackScam">已確認，聯繫客服處理</button></div>`;

function parOverview(d) {
  const s = state;
  const reqs = FEATURES.filter(f => ['pending', 'branch', 'booked'].includes(s.feat[f.id]));
  const pick = s.reviewPick ? s.tx.find(t => t.id === s.reviewPick) : null;
  return `
    ${s.scam ? scamAlert() : ''}
    ${reqs.map(f => {
      const st = s.feat[f.id], lt = lessonOf(f.lesson);
      return `<div class="req">
        <span class="xs" style="color:#1E40AF;font-weight:700">${st === 'pending' ? '新的解鎖申請' : '處理中'}</span>
        <span style="font-size:16px;font-weight:800">小安想解鎖「${f.t}」</span>
        ${s.lessonsDone.includes(f.lesson) ? `<span class="tag ok" style="align-self:flex-start">已學過「${lt.t}」</span>` : ''}
        ${st === 'pending' ? `<span class="xs">${f.online ? '同意後立即線上開通' : '同意後需預約分行，親子一起完成手續'}</span>
          <div class="grid2"><button class="btn pri" data-act="approve" data-arg="${f.id}">同意</button><button class="btn sec" data-act="decline" data-arg="${f.id}">先不要</button></div>` : ''}
        ${st === 'branch' ? `<span style="font-size:13px;line-height:1.6">此功能需臨櫃辦理。可直接預約分行時段，到場免排隊。</span><button class="btn pri" data-act="book" data-arg="${f.id}">一鍵預約分行</button>` : ''}
        ${st === 'booked' ? `<span style="font-size:13px;line-height:1.6">已預約 ${BOOKING}</span><button class="btn sec" data-act="finish" data-arg="${f.id}">模擬：臨櫃完成開通</button>` : ''}
      </div>`;
    }).join('')}
    <div class="card">
      <div class="row sb"><span class="sm">小安的帳戶餘額</span><span class="sm">本月花費</span></div>
      <div class="row sb"><span style="font-size:24px;font-weight:800">NT$ ${fmt(s.balance)}</span><span style="font-size:18px;font-weight:700">NT$ ${fmt(d.total)}</span></div>
      <div class="row sb" style="margin-top:4px"><span class="sm">${s.goal.name}</span><span class="sm">${d.goalPct}%</span></div>
      <div class="track"><div class="fill g" style="width:${d.goalPct}%"></div></div>
    </div>
    ${pick ? `<div class="card soft fade"><span class="xs" style="font-weight:700;color:#1E40AF">小安的每週回顧</span><span style="font-size:14px">這週最值得的一筆：「${esc(pick.name)}」NT$ ${pick.amt}</span></div>` : ''}
    ${cheerCard()}
    <div class="card" style="gap:0">
      <div class="row sb" style="margin-bottom:4px"><span class="h3">最近消費</span><span class="xs">含孩子的標記</span></div>
      ${d.rev.slice(0, 4).map(t => `<div class="lr"><span>${esc(t.name)}</span><span class="row">${tagHtml(t)}<b>-${t.amt}</b></span></div>`).join('')}
      <span class="xs" style="margin-top:6px">孩子寫的備註不會顯示在這裡</span>
    </div>`;
}

function parAllowance() {
  const s = state;
  const chip = (on, t, act, arg) => `<button class="chip ${on ? 'on' : ''}" data-act="${act}" data-arg="${arg}">${t}</button>`;
  return `
    <div class="card">
      <span class="h3">零用錢金額</span>
      <div class="chips">${[200, 300, 500].map(a => chip(s.allowance === a, 'NT$' + a, 'setAllowance', a)).join('')}</div>
      <span class="h3" style="margin-top:6px">撥款頻率</span>
      <div class="chips">${['每週', '每月'].map(f => chip(s.freq === f, f, 'setFreq', f)).join('')}</div>
      <div class="row sb" style="margin-top:6px"><span class="col"><span class="h3">自動撥款</span><span class="xs">${s.auto ? (s.freq === '每週' ? '每週日 20:00 自動轉入' : '每月 1 日自動轉入') : '已關閉，需手動撥款'}</span></span>
      <button class="sw ${s.auto ? 'on' : ''}" aria-pressed="${s.auto}" aria-label="自動撥款" data-act="toggleAuto"><span class="knob"></span></button></div>
    </div>
    <div class="card soft">
      <span class="sm">從媽媽的大戶帳戶轉出</span>
      <span style="font-size:15px;font-weight:700">${s.freq} NT$ ${s.allowance} → 小安的 Junior 帳戶</span>
    </div>
    <button class="btn pri" data-act="payAllowance">立即撥款（示範）</button>`;
}

function parRewards(d) {
  const s = state;
  return `
    <div class="card">
      <div class="row sb"><span class="h3">小安的${s.goal.name}</span><span class="sm">${d.goalPct}%</span></div>
      <div class="track"><div class="fill g" style="width:${d.goalPct}%"></div></div>
      <span class="sm">NT$ ${fmt(s.goal.saved)} / ${fmt(s.goal.target)}</span>
    </div>
    <div class="card" style="gap:0">
      <span class="h3" style="margin-bottom:2px">獎勵規則</span>
      <span class="xs" style="margin-bottom:6px">由您決定，銀行只負責記錄與提醒</span>
      ${d.rules.map(r => `<div class="lr"><span class="col" style="gap:2px"><span style="font-size:14px;font-weight:600">${r.t}</span><span class="xs">${r.d}</span></span>
        <button class="sw ${s.rules[r.id] ? 'on' : ''}" aria-pressed="${s.rules[r.id]}" aria-label="${r.t}" data-act="toggleRule" data-arg="${r.id}"><span class="knob"></span></button></div>`).join('')}
    </div>
    ${cheerCard()}
    ${s.feed.slice(0, 3).map(f => `<div class="xs fade" style="padding:0 4px">・${esc(f.t)}</div>`).join('')}`;
}

function parSafety() {
  const s = state;
  return `
    <div class="card">
      <span class="h3">單日消費上限</span>
      <div class="chips">${[500, 1000, 1500].map(a => `<button class="chip ${s.dayLimit === a ? 'on' : ''}" data-act="setLimit" data-arg="${a}">NT$${fmt(a)}</button>`).join('')}</div>
      <span class="xs">今日已花 NT$ ${fmt(s.todaySpent)}</span>
    </div>
    <div class="card" style="gap:0">
      <span class="h3" style="margin-bottom:4px">封鎖消費類別</span>
      ${Object.keys(BLOCK_NAMES).map(k => `<div class="lr"><span>${BLOCK_NAMES[k]}</span><button class="sw ${s.blocked[k] ? 'on' : ''}" aria-pressed="${s.blocked[k]}" aria-label="封鎖${BLOCK_NAMES[k]}" data-act="toggleBlock" data-arg="${k}"><span class="knob"></span></button></div>`).join('')}
    </div>
    <div class="card" style="gap:0">
      <div class="row" style="margin-bottom:2px">${ic('shield', 'color:#0A5C47')}<span class="h3">永豐防詐守護</span></div>
      <span class="xs" style="margin-bottom:4px">銀行預設開啟，保護未成年帳戶，無法關閉</span>
      ${['陌生帳戶大額轉入', '短時間大量轉出', '新增陌生收款人'].map(t => `<div class="lr"><span>${t}</span><span class="sw fixed" role="img" aria-label="已開啟"><span class="knob"></span></span></div>`).join('')}
    </div>
    ${s.scam ? scamAlert() : `<button class="btn dark" data-act="simScam">模擬：陌生人轉入 NT$5,000</button>`}`;
}

// ================= 動作 =================
function goCh(id) {
  const c = chOf(id);
  set({ch:id, kidView:c.kid, parView:c.par || state.parView, sheet:null,
    pay:{step:'code', m:null, txId:null, note:'', reason:''}, lessonOpen:null, quizPick:null, grad:null});
}
function requestFeat(id) {
  const s = state, f = featOf(id);
  s.feat[id] = 'pending'; delete s.featNote[id];
  addFeed(`小安申請解鎖「${f.t}」`);
  const patch = {sheet:null, parView:'overview'};
  if (!chOf(s.ch).dual) patch.ch = 'unlock';
  set(patch);
  toast('kid', '已送出申請，等爸媽回覆');
  toast('par', `小安想解鎖「${f.t}」`);
}

const ACT = {
  goCh,
  prevCh() { const i = CH.findIndex(c => c.id === state.ch); if (i > 0) goCh(CH[i - 1].id); },
  nextCh() { const i = CH.findIndex(c => c.id === state.ch); if (i < CH.length - 1) goCh(CH[i + 1].id); },
  reset() { Object.values(timers).forEach(clearTimeout); state = initState(); render(); },
  kv(v) { set({kidView:v, sheet:null, pay:{step:'code', m:null, txId:null, note:'', reason:''}, lessonOpen:null, quizPick:null}); },
  pv(v) { set({parView:v}); },

  // 付款：店家送出金額 → 付款前想一想 → 付款（自動記帳）→ 需要／想要（備註選填）
  scan(id) {
    const s = state, m = MERCHANTS.find(x => x.id === id);
    if (m.block && s.blocked[m.block]) {
      return set({pay:{...s.pay, step:'blocked', m, reason:`「${m.cat}」已被爸媽設為封鎖類別。想買的話，可以先跟爸媽討論看看。`}});
    }
    if (s.todaySpent + m.amt > s.dayLimit) {
      return set({pay:{...s.pay, step:'blocked', m, reason:`超過今天的消費上限 NT$${fmt(s.dayLimit)}（今日已花 NT$${fmt(s.todaySpent)}）。`}});
    }
    set({pay:{...s.pay, step:'confirm', m}});
  },
  confirmPay() {
    const s = state, m = s.pay.m;
    if (m.amt > s.balance) return toast('kid', '餘額不足，先存一點再買吧');
    const tx = {id:Date.now(), name:m.name, amt:m.amt, cat:m.cat, tag:null, note:''};
    s.tx.push(tx);
    addFeed(`小安在${m.name}付款 NT$${m.amt}`);
    set({balance:s.balance - m.amt, weekSpent:s.weekSpent + m.amt, todaySpent:s.todaySpent + m.amt,
      pay:{...s.pay, step:'tag', txId:tx.id, note:''}});
  },
  cancelPay() { ACT.kv('home'); toast('kid', `好決定！這筆錢可以留給「${state.goal.name}」`); },
  noteChip(c) { state.pay.note = state.pay.note === c ? '' : c; render(); },
  tag(tag) {
    const s = state, tx = s.tx.find(t => t.id === s.pay.txId);
    tx.tag = tag; tx.note = s.pay.note.trim();
    const f = s.feed.find(x => x.t === `小安在${tx.name}付款 NT$${tx.amt}`);
    if (f) f.t += `（${tag === 'need' ? '需要' : '想要'}）`;
    set({pay:{...s.pay, step:'done'}});
  },

  review(id) {
    const t = state.tx.find(x => x.id === Number(id));
    addFeed(`小安的每週回顧：最值得的一筆是「${t.name}」`);
    set({reviewPick:t.id}); toast('par', '小安完成每週回顧');
  },
  depositGoal() {
    const s = state, g = s.goal;
    if (s.balance < 100) return toast('kid', '餘額不足 NT$100');
    if (g.saved + 100 >= g.target) {
      const bonus = s.rules.goal ? 200 : 0;
      addFeed(`小安達成目標「${g.name}」${bonus ? '，已自動加碼 NT$200' : ''}`);
      set({goal:{...g, saved:g.target}, balance:s.balance - 100 + bonus, goalsDone:s.goalsDone + 1,
        celebrate:{name:g.name, target:g.target, bonus:!!bonus}});
      toast('par', bonus ? `小安達成「${g.name}」！已自動加碼 NT$200` : `小安達成「${g.name}」！`);
    } else {
      addFeed('小安存入目標 NT$100');
      set({goal:{...g, saved:g.saved + 100}, balance:s.balance - 100});
    }
  },
  nextGoal() { set({celebrate:null, goal:{name:'藍牙耳機', saved:0, target:2500}}); toast('kid', '新目標「藍牙耳機」設定好了！'); },
  cheer(i) { const m = CHEERS[i]; set({cheer:m}); toast('kid', '媽媽：' + m); toast('par', '鼓勵已送出'); },

  openLesson(id) { set({kidView:'school', lessonOpen:id, quizPick:null, sheet:null}); },
  closeLesson() { set({lessonOpen:null, quizPick:null}); },
  answer(i) {
    const s = state, l = lessonOf(s.lessonOpen); i = Number(i);
    if (s.quizPick !== null) return;
    s.quizPick = i;
    if (i === l.c && !s.lessonsDone.includes(l.id)) {
      s.lessonsDone = s.lessonsDone.concat(l.id);
      addFeed(`小安完成學堂「${l.t}」`);
      if (s.rules.lesson && s.lessonsDone.length >= 3 && !s.lessonBonusGiven) {
        s.balance += 50; s.lessonBonusGiven = true;
        addFeed('小安完成 3 堂課，已自動加碼 NT$50');
        toast('kid', '完成 3 堂課！媽媽加碼 NT$50 已入帳');
      }
    }
    render();
  },
  ask(i) {
    const q = AIQA[i];
    set({msgs:state.msgs.concat([{from:'me', text:q.q}, {from:q.warn ? 'warn' : 'ai', text:q.a}]).slice(-5)});
  },
  joinComp() { addFeed('小安想報名「青少年模擬投資競賽」，等您同意'); toast('kid', '想參加嗎？已通知爸媽，同意後就能報名'); },
  joinCamp() { addFeed('小安分享了「親子理財營」'); toast('kid', '已把「親子理財營」分享給爸媽'); },

  openSheet(id) { set({sheet:id}); },
  closeSheet() { set({sheet:null}); },
  requestFeat,
  approve(id) {
    const f = featOf(id);
    if (f.online) { state.feat[id] = 'open'; set({unlockShow:id, sheet:null}); toast('par', `「${f.t}」已線上開通`); }
    else { state.feat[id] = 'branch'; render(); toast('kid', `爸媽同意了！「${f.t}」要一起去分行辦理`); }
  },
  decline(id) {
    state.feat[id] = 'locked'; state.featNote[id] = '等你存滿 3,000 元再說喔！';
    render(); toast('kid', '媽媽：等你存滿 3,000 元再說喔！');
  },
  book(id) { state.feat[id] = 'booked'; render(); toast('kid', '媽媽預約了分行：' + BOOKING); },
  finish(id) { state.feat[id] = 'open'; set({unlockShow:id, sheet:null}); },
  closeUnlock() { set({unlockShow:null}); },

  setAllowance(a) { set({allowance:Number(a)}); },
  setFreq(f) { set({freq:f}); },
  toggleAuto() { set({auto:!state.auto}); },
  payAllowance() {
    const s = state;
    addFeed(`撥出零用錢 NT$${s.allowance}`);
    set({balance:s.balance + s.allowance, weekSpent:0});
    toast('kid', `媽媽撥了零用錢 NT$${s.allowance}，本週額度已更新`);
    toast('par', `已撥款 NT$${s.allowance} 給小安`);
  },
  toggleRule(id) { state.rules[id] = !state.rules[id]; render(); },
  setLimit(a) { set({dayLimit:Number(a)}); },
  toggleBlock(k) { state.blocked[k] = !state.blocked[k]; render(); },
  simScam() { set({scam:true, kidScam:true}); toast('par', '偵測到異常轉入，已暫停轉出'); },
  ackScam() { set({scam:false}); },
  ackKidScam() { set({kidScam:false}); },

  startGrad() { set({grad:'cert'}); },
  convertGrad() { addFeed('小安滿 18 歲，已轉為正式大戶帳戶'); set({grad:'done'}); },
  closeGrad() { set({grad:null}); }
};

// ================= 渲染 =================
const app = document.getElementById('app');
function render() {
  // 保留同一畫面的捲動位置
  const scrolls = {};
  app.querySelectorAll('[data-sk]').forEach(el => { scrolls[el.dataset.sk] = el.scrollTop; });
  const d = derive();
  app.innerHTML = viewSide() + viewMain(d);
  app.querySelectorAll('[data-sk]').forEach(el => { if (scrolls[el.dataset.sk]) el.scrollTop = scrolls[el.dataset.sk]; });
}

app.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACT[el.dataset.act];
  if (fn) fn(el.dataset.arg);
});
app.addEventListener('input', e => {
  if (e.target.id === 'note-input') state.pay.note = e.target.value; // 打字不重繪，避免失去焦點
});
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); ACT.nextCh(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); ACT.prevCh(); }
});

// 1440×900 舞台等比縮放置中
function fit() {
  const s = Math.min(innerWidth / 1440, innerHeight / 900);
  app.style.transform = `translate(${(innerWidth - 1440 * s) / 2}px, ${(innerHeight - 900 * s) / 2}px) scale(${s})`;
}
addEventListener('resize', fit);
fit();
render();
