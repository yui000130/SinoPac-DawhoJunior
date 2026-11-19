'use strict';
/* 大戶 Junior 互動 Demo — 狀態、資料、渲染、互動
   兩支手機共用同一份 state；所有操作 → 改 state → render() 重繪
   手機畫面只放產品功能；所有「模擬／示範」操作集中在右側「示範控制台」 */

// ================= 資料 =================
const LESSONS = [
  {id:'budget', t:'什麼是預算？', body:'預算就是先決定錢要怎麼用，再開始花。零用錢一入帳，先想好這週要存多少、能花多少，就不會到週末才發現錢不夠。', q:'零用錢一入帳，最好先做什麼？', a:['先存一部分，再決定能花多少','先把想買的東西買下來'], c:0, ok:'沒錯！先存再花，是理財的第一步。', no:'先花再存，常常會發現沒錢可存喔。'},
  {id:'needwant', t:'需要 vs 想要', body:'需要是生活必須的，例如車資、文具；想要是有了會開心、但沒有也沒關係的，例如飲料、漫畫。兩種都可以花，重點是知道自己在花哪一種。', q:'一杯手搖飲比較接近？', a:['需要','想要'], c:1, ok:'答對了！偶爾買沒關係，知道它是「想要」就好。', no:'再想想：不喝手搖飲，生活會過不下去嗎？'},
  {id:'deposit', t:'定存與利息', body:'定存是跟銀行約好，把一筆錢放一段時間不動用，到期時銀行會多給你一點利息。放得越久，利息通常越多。', q:'定存還沒到期就想拿出來，會怎樣？', a:['跟活存一樣，隨時拿沒影響','通常會少拿一些利息'], c:1, ok:'正確！所以定存要放「暫時用不到的錢」。', no:'提前解約通常會少拿利息，要先想清楚喔。'},
  {id:'compound', t:'複利：讓錢自己長大', body:'利息或配息加回本金，下一次一起生錢，就是複利。時間拉得越長，滾出來的錢越多，所以越早開始存越有利。', q:'複利效果最需要什麼？', a:['時間','運氣'], c:0, ok:'沒錯！時間是複利最好的朋友。', no:'複利靠的不是運氣，而是長時間累積。'},
  {id:'stock', t:'爸媽幫我買的是什麼？認識股票與 ETF', body:'股票是公司的一小部分，買了就成為這家公司的小股東。ETF 像一個裝了很多家公司股票的籃子，買一份就同時擁有很多公司的一小部分，風險比只買一家分散。爸媽幫你買 ETF，是希望用很長的時間，讓錢慢慢長大。', q:'ETF 和只買一家公司的股票比起來？', a:['風險比較分散','保證一定賺錢'], c:0, ok:'答對了！分散是 ETF 的好處，但投資沒有保證賺錢這回事。', no:'投資沒有保證賺錢，ETF 的好處是風險比較分散。'},
  {id:'risk', t:'風險與分散', body:'投資有機會賺，也可能賠。把錢分散放在不同地方，某一個跌了，其他的還能撐住，就是「雞蛋不要放在同一個籃子」。', q:'為什麼要分散投資？', a:['降低單一投資賠錢的影響','這樣就保證一定賺錢'], c:0, ok:'正確！分散能降低風險，但沒有保證賺錢這回事。', no:'投資沒有保證賺錢，分散是為了降低風險。'},
  {id:'scam', t:'防詐：保證獲利都是騙人的', body:'有人說「幫忙收錢就能賺錢」或「保證穩賺不賠」，幾乎都是詐騙。把帳戶借給別人用，自己可能變成詐騙共犯，帳戶也會被凍結。', q:'網友說借你的帳戶收款可以賺 500 元，你該？', a:['拒絕，並告訴爸媽','答應，反正只是收錢'], c:0, ok:'做得好！這就是人頭帳戶詐騙。', no:'這是人頭帳戶詐騙，答應的話你會變成共犯！'},
  {id:'fakebuyer', t:'假買家詐騙：真正的買家不會要你操作網銀', body:'在網路上賣東西時，有些「買家」會說付款失敗、要你操作網銀「驗證帳戶」，或說轉錯帳要你再補一筆。真正的買家付款，從來不需要賣家操作網銀。遇到這種話術，先停下來，告訴爸媽。', q:'買家說要你操作網銀「驗證帳戶」才能收款，你該？', a:['停下來，告訴爸媽','照做，才收得到錢'], c:0, ok:'做得好！這就是假買家詐騙的話術。', no:'真正的買家不會要你操作網銀，這是詐騙！'}
];
// invest：孩子已有證券帳戶（親子帳戶）時可線上開通；沒有則需臨櫃開立
const FEATURES = [
  {id:'transfer', t:'轉帳給朋友', d:'聚餐分帳、團購付款，可以直接轉帳給同學。', online:true, lesson:'scam'},
  {id:'deposit', t:'定存', d:'把錢放一段時間不動，時間到了會多一點利息。', online:true, lesson:'deposit'},
  {id:'fx', t:'外幣存款', d:'存一點日圓或美元，認識匯率怎麼變化。', online:false, lesson:'risk'},
  {id:'invest', t:'自己投資', d:'自己挑選想投資的標的，每一筆由爸媽確認後送出。', online:false, lesson:'stock'}
];
const ACTS = {0:'序幕・開戶', 1:'第一幕・學得會', 2:'第二幕・看得懂', 3:'第三幕・守得住', 4:'終章'};
const CH = [
  {id:'open', act:0, n:'00', t:'開戶簡介', dual:true, kid:'home', par:'overview', tip:'選用章節。用右側控制台的「下一步」，看媽媽在 DAWHO 發起開戶、爸爸線上同意、小安下載 App 設定，最後媽媽設定第一筆零用錢。'},
  {id:'allow', act:1, n:'01', t:'零用錢自動入帳', dual:true, kid:'home', par:'allowance', tip:'媽媽在右邊設定金額與頻率。按控制台「到了撥款時間」，零用錢自動從媽媽的大戶帳戶轉入，小安的「可以用的錢」即時更新。'},
  {id:'home', act:1, n:'02', t:'孩子的首頁', dual:false, kid:'home', tip:'首頁大數字是「可以用的錢」，點「我的資產」才看得到總資產。下方是「媽媽可以看到」的範圍與「遇到可疑的事」求助按鈕；往下滑有灰色的解鎖功能。'},
  {id:'pay', act:1, n:'03', t:'付款前想一想', dual:false, kid:'pay', tip:'小安出示付款碼與載具。用控制台模擬店家掃碼：手搖飲、便利商店是「想要」常見類別，會先提醒「目標晚幾天」；公車不提醒，直接付款。付款後只要點需要或想要。遊戲點數儲值被爸媽封鎖。'},
  {id:'ledger', act:1, n:'04', t:'帳本與每週回顧', dual:false, kid:'ledger', tip:'點有「載具」標記的消費看發票品項；沒標記的消費點開就能補標「需要／想要」。按「手動補記」記下一筆夜市雞排，最後在每週回顧選出最值得的一筆。'},
  {id:'goal', act:1, n:'05', t:'存錢目標與獎勵', dual:true, kid:'goal', par:'rewards', tip:'按「存入 NT$100」三次達成目標，媽媽設定的加碼會自動入帳。也可以在右邊切換獎勵規則、送出鼓勵。'},
  {id:'assets', act:2, n:'06', t:'我的資產與配息通知', dual:true, kid:'assets', par:'settings', tip:'右邊媽媽打開「讓孩子看見我替他買的投資」，小安的「爸媽幫我存的」就會出現。再把投資權限改成「可以自己投資」，小安按「我想投資」送出申請，媽媽在總覽確認。控制台可模擬 0050 配息。'},
  {id:'school', act:2, n:'07', t:'理財學堂與 AI 小幫手', dual:false, kid:'school', tip:'點第 5 課「爸媽幫我買的是什麼？」完成小測驗（也可以從我的資產的「這是什麼？」進來）。再切到下方「小幫手」分頁，試試假買家詐騙的問題。'},
  {id:'unlock', act:3, n:'08', t:'解鎖理財功能', dual:true, kid:'home', par:'overview', tip:'在小安的首頁點灰色的「定存」，按「請爸媽解鎖」，再到右邊按「同意」。換成「外幣存款」試試，會走預約分行，最後用控制台模擬臨櫃完成開通。'},
  {id:'scam', act:3, n:'09', t:'詐騙攔截與一鍵求助', dual:true, kid:'home', par:'overview', tip:'16–17 歲是青少年受騙的主要族群，本章小安 16 歲。即使媽媽只看每月總額，防詐警示與求助仍即時通知。①陌生轉入先保留，轉不出去；②假買家只提醒不阻擋；③小安按「遇到可疑的事」。（假設已解鎖轉帳，離開本章年齡恢復）'},
  {id:'level', act:3, n:'10', t:'父母查看程度', dual:true, kid:'home', par:'settings', tip:'用控制台切換小安年齡 12／14／16 歲，媽媽的查看程度自動變為完整明細／店家與金額／每月分類總額；總覽的消費與同步通知跟著改變，小安首頁的「媽媽可以看到」同步更新。'},
  {id:'end', act:4, n:'終', t:'對永豐的價值', dual:false, summary:true, tip:'總結大戶 Junior 對永豐的三個價值。延伸想法（旅行基金、18 歲成年禮）未做進 Demo。'}
];
// 付款時由「店家」送出金額，孩子不用先選商品；有載具的店家會帶入發票品項
const MERCHANTS = [
  {id:'tea', name:'手搖飲店', amt:65, cat:'飲食', items:[['珍珠奶茶', 65]]},
  {id:'cvs', name:'便利商店', amt:85, cat:'飲食', items:[['飲料', 35], ['麵包', 50]]},
  {id:'bus', name:'公車', amt:15, cat:'交通', items:null},
  {id:'game', name:'遊戲點數儲值', amt:300, cat:'遊戲儲值', items:null, block:'game'}
];
const NOTE_CHIPS = ['飲料', '早餐', '文具', '零食'];
const CATS = ['飲食', '交通', '文具', '娛樂'];
const REMIND_CATS = ['飲食', '娛樂'];
const MAX_REMINDERS = 2;
// 示範數值，非即時股價
const HOLDINGS = [
  {name:'元大台灣50', code:'0050', shares:3, chg:'+3.2%'},
  {name:'永豐美國500大', code:'00858', shares:10, chg:'+1.5%'}
];
const INVEST_TOTAL = 1000;
const DIVIDEND = {code:'0050', amt:10};
const LARGE_TRANSFER = 3000;
const LEVELS = {
  detail:{t:'完整明細', kid:'每筆明細'},
  store:{t:'店家與金額', kid:'每筆的店家與金額'},
  monthly:{t:'每月分類總額', kid:'每月分類總額'}
};
const DEFAULT_LEVEL = age => age <= 12 ? 'detail' : age <= 15 ? 'store' : 'monthly';
const HELP_REASONS = ['有人要我轉錢／借帳戶', '我已經轉出去了', '收到奇怪的訊息', '其他'];
const AIQA = [
  {q:'為什麼要存錢？', a:'存錢就是幫「未來的自己」準備。想買比較貴的東西、或遇到突發狀況時，存下來的錢就派上用場。你的球鞋基金就是很好的開始！'},
  {q:'什麼是 ETF？', a:'ETF 像一個裝了很多家公司股票的籃子。買一份，就一次擁有很多公司的一小部分，風險比只買一家公司分散。學堂第 5 課有專門介紹。'},
  {q:'爸媽幫我買的股票會變多嗎？', a:'股票的價格會上上下下，沒有人能保證一定變多。但長期持有、加上配息，錢有機會慢慢長大，這就是「複利」。爸媽開啟分享後，你可以在「我的資產」看到。'},
  {q:'網友說借我的帳戶收款可以賺 500 元，可以嗎？', a:'千萬不要！這是典型的「人頭帳戶」詐騙。把帳戶借給別人收錢，你可能會被當成詐騙共犯，帳戶也會被凍結。請拒絕對方，並馬上告訴爸媽。', warn:true},
  {q:'買家說要我操作網銀驗證帳戶，可以嗎？', a:'不可以！真正的買家付款，不需要你操作網銀。「驗證帳戶」「轉錯帳要你補一筆」都是假買家詐騙的話術。請停止聯絡對方並告訴爸媽；不確定的話，按下方的「遇到可疑的事」。', warn:true}
];
const CHEERS = ['這週很會存喔！', '快達成了，加油！', '帳記得很清楚，讚！'];
const BOOKING = '12/13（六）10:00・[分行名稱]';
const SAVE_PER_WEEK = 100;
const BLOCK_NAMES = {game:'遊戲儲值', crypto:'加密貨幣交易', overseas:'境外網購'};
const EMPTY_PAY = () => ({step:'code', m:null, txId:null, note:'', reason:'', remind:false});

// ================= 狀態 =================
function initState() {
  return {
    ch:'allow', kidView:'home', parView:'allowance', openStep:0,
    balance:480, weekSpent:110, todaySpent:0, todayReminders:0, allowance:300, freq:'每週', auto:true,
    goal:{name:'球鞋基金', saved:1500, target:1800}, goalsDone:0, celebrate:null,
    // source: card 刷卡 | carrier 載具 | manual 手動補記；note 為孩子選填備註，只有孩子看得到
    tx:[
      {id:1, name:'便利商店', amt:85, cat:'飲食', tag:'need', source:'carrier', items:[['飲料', 35], ['麵包', 50]], note:'早餐', time:'週一 07:40'},
      {id:2, name:'公車', amt:15, cat:'交通', tag:'need', source:'card', items:null, note:'', time:'週一 07:55'},
      {id:3, name:'手搖飲店', amt:60, cat:'飲食', tag:'want', source:'carrier', items:[['珍珠奶茶', 60]], note:'', time:'週二 16:20'},
      {id:4, name:'文具店', amt:35, cat:'文具', tag:null, source:'carrier', items:[['自動鉛筆', 35]], note:'', time:'週三 12:30'},
      {id:5, name:'書店', amt:120, cat:'娛樂', tag:'want', source:'carrier', items:[['漫畫', 120]], note:'', time:'週四 17:10'}
    ],
    pay:EMPTY_PAY(), reviewPick:null, expandTx:null, manual:null,
    rules:{goal:true, noOver:false, lesson:false}, lessonBonusGiven:false,
    cheer:'', lessonsDone:[], lessonOpen:null, quizPick:null,
    msgs:[{from:'ai', text:'嗨小安，我是你的理財小幫手！關於錢的任何問題，都可以問我。'}],
    feat:{transfer:'locked', deposit:'locked', fx:'locked', invest:'locked'},
    featNote:{}, sheet:null, unlockShow:null,
    // 看得懂
    hasLinkedSecurities:true, shareInvest:false, shareLevel:'total', dividend:null,
    investDraft:null, investReqs:[],
    // 守得住
    dayLimit:1500, blocked:{game:true, crypto:true, overseas:false},
    heldIncoming:null, transferAlert:null,
    helpAsk:null, helpShow:false, helpRequested:false, helpReason:'', outboundFrozen:false, parAlerts:[],
    // 成長機制
    childAge:12, viewLevel:'detail', savedAge:null,
    feed:[], kidToast:'', parToast:''
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
// type: spend | goal | lesson | request | help | security | review | parent
function addFeed(type, t, extra = {}) { state.feed = [{type, t, ...extra}].concat(state.feed).slice(0, 8); }
function addAlert(title, text) { state.parAlerts = [{id:String(Date.now() + Math.random()), title, text}].concat(state.parAlerts).slice(0, 3); }

// ================= 小工具 =================
const fmt = n => Number(n).toLocaleString('en-US');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chOf = id => CH.find(c => c.id === id);
const featOf = id => FEATURES.find(f => f.id === id);
const lessonOf = id => LESSONS.find(l => l.id === id);
const itemsText = items => items.map(([n, a]) => `${n} ${a}`).join('＋');
const isOnline = f => f.id === 'invest' ? state.hasLinkedSecurities : f.online;
const tagWord = tag => tag === 'need' ? '需要' : '想要';

// 父母看得到的同步事件：依查看程度過濾；防詐與求助永遠顯示
function feedText(f) {
  if (f.type !== 'spend') return f.t;
  const tx = state.tx.find(t => t.id === f.txId);
  if (!tx) return f.t;
  const manual = tx.source === 'manual';
  if (state.viewLevel === 'store') return manual ? `小安手動補記一筆 NT$${tx.amt}` : `小安在${tx.name}付款 NT$${tx.amt}`;
  const extras = [];
  if (tx.items) extras.push(itemsText(tx.items)); else if (manual) extras.push(tx.name);
  if (tx.tag) extras.push(tagWord(tx.tag));
  return (manual ? `小安手動補記 NT$${tx.amt}` : `小安在${tx.name}付款 NT$${tx.amt}`) + (extras.length ? `（${extras.join('・')}）` : '');
}
const visibleFeed = () => state.feed.filter(f => state.viewLevel !== 'monthly' || f.type !== 'spend');

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
  call:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:'<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.4 3M6.6 6.6C4.3 8.1 3 12 3 12s4 6 9 6c1.4 0 2.7-.4 3.9-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  wallet:'<path d="M4 7h15a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h11"/><path d="M16 13h.5"/>',
  trend:'<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>',
  down:'<path d="M6 9l6 6 6-6"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  hold:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  play:'<path d="M7 5l12 7-12 7z"/>'
};
const ic = (n, st = '', cls = 'ico') => `<svg class="${cls}" style="${st}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
const tagHtml = t => t.tag === 'need' ? '<span class="tag need">需要</span>'
  : t.tag === 'want' ? '<span class="tag want">想要</span>' : '<span class="tag none">未標記</span>';
const srcHtml = t => t.source === 'carrier' ? '<span class="src">載具</span>' : t.source === 'manual' ? '<span class="src m">手動</span>' : '';
const QR = `<svg width="132" height="132" viewBox="0 0 17 17" aria-hidden="true" shape-rendering="crispEdges"><rect width="17" height="17" fill="#fff"/><g fill="#13213F"><rect x="1" y="1" width="5" height="5"/><rect x="11" y="1" width="5" height="5"/><rect x="1" y="11" width="5" height="5"/><rect x="7" y="1" width="1" height="2"/><rect x="9" y="2" width="1" height="3"/><rect x="7" y="4" width="2" height="1"/><rect x="7" y="7" width="3" height="1"/><rect x="11" y="7" width="1" height="3"/><rect x="13" y="8" width="3" height="1"/><rect x="1" y="7" width="2" height="1"/><rect x="4" y="8" width="2" height="2"/><rect x="8" y="9" width="2" height="2"/><rect x="7" y="12" width="1" height="4"/><rect x="9" y="13" width="2" height="1"/><rect x="12" y="11" width="2" height="2"/><rect x="14" y="13" width="2" height="3"/><rect x="11" y="14" width="2" height="2"/></g><g fill="#fff"><rect x="2" y="2" width="3" height="3"/><rect x="12" y="2" width="3" height="3"/><rect x="2" y="12" width="3" height="3"/></g><g fill="#13213F"><rect x="3" y="3" width="1" height="1"/><rect x="13" y="3" width="1" height="1"/><rect x="3" y="13" width="1" height="1"/></g></svg>`;
const BARCODE = `<svg width="200" height="40" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">${[2,1,1,3,1,2,2,1,3,1,1,2,1,1,2,3,1,2,1,1,2,2,1,3,1,1,2,1,2,1,1,3,2,1,1,2,1,2,3,1].reduce((acc, w, i) => { const x = acc.x; acc.x += w + 1; if (i % 2 === 0) acc.s += `<rect x="${x}" y="0" width="${w}" height="20" fill="#13213F"/>`; return acc; }, {x:0, s:''}).s}</svg>`;

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
  const showInvest = s.hasLinkedSecurities && s.shareInvest;
  const rules = [
    {id:'goal', t:'達成存錢目標，加碼 NT$200', d:'目標達成時自動入帳'},
    {id:'noOver', t:'本月沒超支，下月 +NT$50', d:`本月已花 NT$${fmt(total)}／預算 NT$${fmt(budget)}・${total <= budget ? '目前未超支' : '已超支'}`},
    {id:'lesson', t:'完成 3 堂學堂課程，加碼 NT$50', d:`學堂完成時自動入帳・目前 ${s.lessonsDone.length} 堂`}
  ];
  return {weekLeft, goalPct, needPct, wantPct, total, cats, openN, rules, showInvest,
    // 保留中的陌生入帳不計入可以用的錢
    totalAssets:s.balance + g.saved + (showInvest ? INVEST_TOTAL : 0),
    untagged:s.tx.filter(t => !t.tag).length,
    rev:s.tx.slice().reverse(),
    etaWeeks:Math.ceil((g.target - g.saved) / SAVE_PER_WEEK)};
}

// ================= 左側與標題 =================
function viewSide() {
  const c = chOf(state.ch);
  let lastAct = -1, nav = '';
  CH.forEach(x => {
    if (x.act !== lastAct) { nav += `<div class="acthd">${ACTS[x.act]}</div>`; lastAct = x.act; }
    const badge = x.summary ? '' : `<span class="badge ${x.dual ? 'duo' : ''}">${x.dual ? '親子' : '孩子'}</span>`;
    nav += `<button class="chap ${x.id === state.ch ? 'on' : ''}" data-act="goCh" data-arg="${x.id}"><span class="num">${x.n}</span><span>${x.t}</span>${badge}</button>`;
  });
  return `<aside class="side">
    <div class="col" style="gap:2px">
      <div class="brand"><div class="logo">Jr</div><div class="brand-name">大戶 Junior</div></div>
      <div class="slogan">讓孩子學得會、看得懂、守得住自己的錢</div>
    </div>
    <nav class="chaps" aria-label="示範章節">${nav}</nav>
    <div class="tipbox"><div class="t">試試看</div><div class="b">${c.tip}</div></div>
    <div class="side-foot">
      <button class="btn sec" style="min-height:40px" data-act="reset">重新開始示範</button>
      <div class="xs" style="line-height:1.5">提案概念展示，非永豐銀行正式產品；畫面中的人物、金額、持股與合作活動皆為示範。← → 切換章節。</div>
    </div>
  </aside>`;
}

function viewMain(d) {
  const c = chOf(state.ch);
  const idx = CH.indexOf(c);
  const mode = c.summary ? '' : `<span class="mode ${c.dual ? 'duo' : 'solo'}">${c.dual ? '親子互動・雙手機' : '孩子端・單手機'}</span>`;
  let stage;
  if (c.summary) stage = viewSummary();
  else if (c.id === 'open') stage = `<div class="stagerow">
      <div class="phonecol"><div class="lbl-phone">小安的手機（12 歲）</div>${openKid(d)}</div>
      <div class="phonecol"><div class="lbl-phone">${state.openStep === 1 ? '爸爸的手機・DAWHO App' : '媽媽的手機・DAWHO App'}</div>${openParent()}</div>
      ${viewConsole()}</div>`;
  else stage = `<div class="stagerow">
      <div class="phonecol"><div class="lbl-phone">小安的手機（${state.childAge} 歲）・大戶 Junior App</div>${viewKid(d)}</div>
      ${c.dual
        ? `<div class="phonecol fade"><div class="lbl-phone">媽媽的手機・DAWHO App › Junior</div>${viewParent(d)}</div>${viewConsole()}`
        : `<div class="rightcol">${viewSync()}${viewConsole()}</div>`}
    </div>`;
  return `<main class="main">
    <div class="mhead">
      <button class="navbtn" data-act="prevCh" ${idx === 0 ? 'disabled' : ''}>${ic('back')}上一章</button>
      <div class="mtitle"><span class="actchip">${ACTS[c.act]}</span><span class="t">${c.n === '終' ? '' : c.n + '　'}${c.t}</span>${mode}</div>
      <button class="navbtn" data-act="nextCh" ${idx === CH.length - 1 ? 'disabled' : ''}>下一章${ic('next')}</button>
    </div>
    ${stage}
  </main>`;
}

function viewSync() {
  const s = state, list = visibleFeed();
  const note = s.viewLevel === 'monthly'
    ? '單筆消費不會通知媽媽；防詐警示與求助永遠通知。'
    : s.viewLevel === 'store' ? '消費只通知店家與金額；防詐警示與求助永遠通知。'
    : '消費含品項與需要／想要標記；防詐警示與求助永遠通知。';
  return `<div class="sync fade">
    <div class="hd">${ic('phone', 'color:#1E40AF')}媽媽的 DAWHO App 同步收到</div>
    ${list.length
      ? list.slice(0, 5).map(f => `<div class="it">${esc(feedText(f))}</div>`).join('')
      : '<div class="empty">小安在這一章的操作，會依查看程度同步到媽媽的 App。</div>'}
    <div class="xs" style="line-height:1.6;margin-top:2px">目前媽媽可以看到：${LEVELS[s.viewLevel].kid}。${note}孩子自己寫的備註只有自己看得到。</div>
  </div>`;
}

// ================= 示範控制台（非產品畫面） =================
function viewConsole() {
  const s = state;
  const b = (act, label, arg = '', dis = false) => `<button class="cbtn" data-act="${act}" ${arg !== '' ? `data-arg="${arg}"` : ''} ${dis ? 'disabled' : ''}>${ic('play', 'width:12px;height:12px')}${label}</button>`;
  let body;
  switch (s.ch) {
    case 'open': {
      const steps = ['媽媽發起開戶', '爸爸線上同意', '小安設定 App', '設定第一筆零用錢'];
      body = `<div class="csteps">${steps.map((t, i) => `<span class="${i === s.openStep ? 'on' : i < s.openStep ? 'done' : ''}">${i + 1}. ${t}</span>`).join('')}</div>
        ${s.openStep < 3 ? b('openNext', '下一步') : b('goCh', '前往 01 零用錢自動入帳', 'allow')}
        ${b('openReset', '重來')}`;
      break;
    }
    case 'allow': body = b('autoAllowance', '到了撥款時間（自動撥款）'); break;
    case 'pay': body = `<span class="chd">店家掃碼後送出金額</span>${MERCHANTS.map(m => b('scan', `${m.name} NT$${m.amt}`, m.id)).join('')}`; break;
    case 'assets': body = b('simDividend', '0050 配息'); break;
    case 'unlock': {
      const booked = FEATURES.find(f => s.feat[f.id] === 'booked');
      body = b('finishBranch', booked ? `臨櫃完成開通「${booked.t}」` : '臨櫃完成開通（需先預約分行）', '', !booked);
      break;
    }
    case 'scam': body = `
      <span class="chd">① 人頭帳戶</span>
      ${b('simHeld', '陌生人轉入 NT$5,000', '', !!s.heldIncoming)}
      ${b('simMuleAsk', '網友要小安把錢轉出', '', !s.heldIncoming)}
      <span class="chd">② 假買家</span>
      ${b('simFakeBuyer', '買家要求補轉 NT$300')}`; break;
    case 'level': body = `<span class="chd">切換小安年齡</span><div class="cchips">${[12, 14, 16].map(a => `<button class="cchip ${s.childAge === a ? 'on' : ''}" data-act="setAge" data-arg="${a}">${a} 歲</button>`).join('')}</div>`; break;
    default: body = '<span class="cempty">本章直接操作手機即可</span>';
  }
  return `<div class="console"><div class="chd0">示範控制台・非產品畫面</div>${body}</div>`;
}

// ================= 終章 =================
function viewSummary() {
  const col = (icon, t, d) => `<div class="sumcol">${ic(icon, 'width:34px;height:34px;color:#FBBF24')}<span class="st">${t}</span><span class="sd">${d}</span></div>`;
  return `<div class="summary fade">
    <span class="sk">大戶 Junior 對永豐的價值</span>
    <span class="stt">讓孩子學得會、看得懂、守得住自己的錢</span>
    <div class="sumgrid">
      ${col('heart', '父母黏著', '零用錢、獎勵、查看與確認都在 DAWHO 內完成，提高父母開啟 App 的頻率。')}
      ${col('trend', '親子帳戶轉換', '讓永豐金證券既有的兒童證券帳戶，成為孩子看得懂、學得會的理財起點。')}
      ${col('shield', '防詐形象', '把永豐防詐從分行與 ATM 延伸到孩子的手機。')}
    </div>
    <span class="sfoot">延伸想法：旅行基金、18 歲成年禮（未在 Demo 中）</span>
  </div>`;
}

// ================= 00 開戶簡介（靜態流程） =================
const shell = (appN, ttl, avatar, body, parent = false) => `<div class="ph"><div class="scr">
  <div class="top"><div class="col"><span class="app-n ${parent ? 'p' : ''}">${appN}</span><span class="ttl">${ttl}</span></div><div class="avatar ${parent ? 'p' : ''}">${avatar}</div></div>
  <div class="body">${body}</div></div></div>`;
function openKid(d) {
  const st = state.openStep;
  if (st < 2) return `<div class="ph"><div class="scr blank">${ic('phone', 'width:40px;height:40px;color:#AEB8CB')}<span class="sm" style="text-align:center;line-height:1.6">小安還沒有大戶 Junior<br>等爸媽完成申請</span></div></div>`;
  if (st === 2) return shell('大戶 JUNIOR', '歡迎，小安！', '安', `
    <div class="card fade"><span class="h3">設定登入方式</span><span class="xs">之後用這個方式打開大戶 Junior</span>
      <div class="col" style="gap:6px;margin-top:4px">${['指紋', '臉部辨識', '6 位數密碼'].map((t, i) => `<div class="opt ${i === 0 ? 'right' : ''}">${t}</div>`).join('')}</div></div>
    <div class="card soft"><span class="sm" style="line-height:1.6">這是你的第一個帳戶。媽媽會幫你撥零用錢，你可以自己付款、記帳、存錢。</span></div>
    <button class="btn pri" data-act="openNext">完成設定</button>`);
  return viewKid(d);
}
function openParent() {
  const st = state.openStep;
  if (st === 0) return shell('DAWHO › JUNIOR', '為孩子開立帳戶', '媽', `
    <div class="card fade"><span class="h3">大戶 Junior・孩子的第一個帳戶</span>
      <div class="lr"><span class="sm">孩子</span><span>小安（12 歲）</span></div>
      <div class="lr"><span class="sm">身分資料</span><span>已填寫</span></div>
      <div class="lr"><span class="sm">法定代理人</span><span>媽媽（大戶用戶・已驗證）</span></div>
      <div class="lr"><span class="sm">另一位法定代理人</span><span>爸爸（待線上確認）</span></div></div>
    <span class="xs" style="line-height:1.6">媽媽是大戶既有用戶，身分已驗證，只需補上孩子資料。</span>
    <button class="btn pri" data-act="openNext">送出申請</button>`, true);
  if (st === 1) return shell('DAWHO', '通知', '爸', `
    <div class="req fade"><span class="xs" style="color:#1E40AF;font-weight:700">法定代理人同意</span>
      <span style="font-size:16px;font-weight:800">媽媽為小安申請開立大戶 Junior</span>
      <span class="sm" style="line-height:1.6">身為另一位法定代理人，需要你線上確認同意。</span>
      <button class="btn pri" data-act="openNext">同意</button></div>`, true);
  const chk = (t, done) => `<div class="lr"><span>${t}</span>${done ? ic('check', 'color:#0A5C47') : '<span class="xs">進行中</span>'}</div>`;
  if (st === 2) return shell('DAWHO › JUNIOR', '開戶進度', '媽', `
    <div class="card fade" style="gap:0">${chk('媽媽送出申請', true)}${chk('爸爸線上同意', true)}${chk('小安設定 App', false)}</div>
    <span class="xs">小安完成設定後，就可以設定第一筆零用錢</span>`, true);
  return shell('DAWHO › JUNIOR', '開戶完成', '媽', `
    <div class="card fade" style="gap:0">${chk('媽媽送出申請', true)}${chk('爸爸線上同意', true)}${chk('小安設定 App', true)}</div>
    <div class="card soft"><span class="sm">第一筆零用錢</span><span style="font-size:15px;font-weight:700">每週 NT$ 300 → 小安的 Junior 帳戶</span><span class="xs">每週日 20:00 自動轉入</span></div>`, true);
}

// ================= 孩子端 =================
function viewKid(d) {
  const s = state;
  const titles = {home:'嗨，小安', pay:'付款', ledger:'我的帳本', goal:'存錢目標', school:'理財學堂', ai:'理財小幫手', growth:'我的成長路線', assets:'我的資產'};
  const showBack = ['pay', 'growth', 'assets'].includes(s.kidView);
  const tab = (v, icon, t) => `<button class="tab ${s.kidView === v ? 'on' : ''}" data-act="kv" data-arg="${v}">${ic(icon)}${t}</button>`;
  const bodyKey = 'kid-' + s.kidView + '-' + (s.kidView === 'pay' ? s.pay.step : '') + (s.lessonOpen || '');
  const views = {home:kidHome, pay:kidPay, ledger:kidLedger, goal:kidGoal, school:kidSchool, ai:kidAi, growth:kidGrowth, assets:kidAssets};
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
    ${kidOverlays()}
    ${s.kidToast ? `<div class="toast">${ic('bell', 'color:#FBBF24')}<span>${esc(s.kidToast)}</span></div>` : ''}
  </div></div>`;
}

const helpBtn = () => `<button class="helpbtn" data-act="askHelp">${ic('shieldAlert')}遇到可疑的事</button>`;

function kidHome(d) {
  const s = state;
  const statusText = {locked:'需要爸媽解鎖', pending:'等待爸媽回覆', branch:'爸媽已同意・待臨櫃', booked:'已預約分行', open:'已開通'};
  const tileCls = {locked:'locked', pending:'pending', branch:'pending', booked:'pending', open:'open'};
  return `
    ${s.outboundFrozen ? `<div class="frozen fade">${ic('shield')}<span>轉帳暫停中・日常付款不受影響・媽媽已收到你的求助</span></div>` : ''}
    ${s.heldIncoming ? `<div class="held fade">${ic('hold')}<span>有一筆陌生轉入 NT$${fmt(s.heldIncoming.amt)} 待爸媽確認，還不能使用</span></div>` : ''}
    <div class="bal">
      <span class="row sb" style="width:100%"><span class="lbl">可以用的錢</span><button class="ballink" data-act="kv" data-arg="assets">我的資產${ic('next', 'width:14px;height:14px')}</button></span>
      <span class="big">NT$ ${fmt(s.balance)}</span>
      <span class="row sb" style="width:100%;margin-top:2px"><span class="lbl">本週還能花</span><span style="font-size:13px;font-weight:700">NT$ ${fmt(d.weekLeft)} / ${s.allowance}</span></span>
      <div class="track"><div class="fill y" style="width:${Math.min(100, Math.round(d.weekLeft / s.allowance * 100))}%"></div></div>
    </div>
    <button class="btn pri" style="min-height:52px;font-size:16px" data-act="kv" data-arg="pay">${ic('scan')}付款</button>
    <div class="row sb" style="gap:6px">
      <span class="seeline">${ic('eye')}媽媽可以看到：${LEVELS[s.viewLevel].kid}</span>
      ${helpBtn()}
    </div>
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
    <button class="card darkc" style="flex-direction:row;align-items:center" data-act="kv" data-arg="growth">${ic('cap', 'color:#FBBF24')}<div class="col" style="flex:1"><span style="font-size:14px;font-weight:700">我的成長路線</span><span style="font-size:12px;color:#D3DBEA">看看我走到哪一步了</span></div></button>`;
}

function kidAssets(d) {
  const s = state;
  const canInvest = s.feat.invest === 'open';
  let invest = '';
  if (s.hasLinkedSecurities) {
    let inner;
    if (!s.shareInvest) {
      inner = `<span class="sm" style="line-height:1.6">爸媽可以選擇和你分享他們替你存的投資。</span>`;
    } else {
      inner = (s.shareLevel === 'total'
        ? `<div class="row sb"><span class="sm">投資總額</span><span style="font-size:20px;font-weight:800">約 NT$ ${fmt(INVEST_TOTAL)}</span></div><span class="xs">示範數值・爸媽選擇只分享總額</span>`
        : HOLDINGS.map(h => `<div class="hold">
            <div class="col" style="gap:2px;min-width:0"><span style="font-size:14px;font-weight:700">${h.name}</span><span class="xs">${h.code}・${h.shares} 股・<span style="color:#0A5C47;font-weight:700">${h.chg}</span>（示範）</span></div>
            <button class="chip s" data-act="openLesson" data-arg="stock">這是什麼？</button></div>`).join('') + `<span class="xs">投資總額約 NT$ ${fmt(INVEST_TOTAL)}（示範數值）</span>`)
        + `<span class="privacy" style="color:#4B5670">${ic('eye')}${canInvest ? '可以自己提出投資，由爸媽確認' : '只能看，交易由爸媽負責'}</span>`
        + (canInvest ? `<button class="btn pri" data-act="openInvest">${ic('trend')}我想投資</button>` : '')
        + s.investReqs.map(r => `<div class="ireq"><span>${r.code} ${r.shares} 股</span><span class="tag ${r.status === 'sent' ? 'ok' : r.status === 'declined' ? 'none' : 'want'}">${r.status === 'sent' ? '已送出委託（示範）' : r.status === 'declined' ? '爸媽先不要' : '等待爸媽確認'}</span></div>`).join('');
    }
    invest = `<div class="card ${s.shareInvest ? 'soft' : ''}">
      <div class="row">${ic('trend', 'color:#1E40AF')}<span class="h3" style="flex:1">爸媽幫我存的</span></div>
      <span class="use">長期投資，不能直接花</span>
      ${inner}
    </div>`;
  }
  return `
    <div class="bal" style="gap:4px">
      <span class="lbl">我的總資產</span>
      <span class="big">NT$ ${fmt(d.totalAssets)}</span>
      <span class="parts">零用錢＋存錢目標${d.showInvest ? '＋爸媽幫我存的（示範數值）' : ''}</span>
    </div>
    <div class="card">
      <div class="row">${ic('wallet', 'color:#1E40AF')}<span class="h3" style="flex:1">零用錢帳戶</span><b>NT$ ${fmt(s.balance)}</b></div>
      <span class="use ok">可以花</span>
    </div>
    <div class="card">
      <div class="row">${ic('target', 'color:#0A5C47')}<span class="h3" style="flex:1">存錢目標・${s.goal.name}</span><b>NT$ ${fmt(s.goal.saved)}</b></div>
      <span class="use">存起來的，要用時轉回零用錢</span>
      <div class="track"><div class="fill g" style="width:${d.goalPct}%"></div></div>
    </div>
    ${invest}
    ${d.showInvest && s.dividend ? `<div class="card warmc fade">
      <div class="row">${ic('gift', 'color:#7A3D00')}<span class="h3">你的 ${s.dividend.code} 配息了！</span></div>
      <span style="font-size:13px;line-height:1.6">配息 NT$ ${s.dividend.amt}（示範數值）。錢放著也能自己長出來，這就是「複利」的開始。</span>
      <button class="btn sec" data-act="openLesson" data-arg="compound">看學堂「複利」課</button>
    </div>` : ''}
    ${d.showInvest ? '<span class="xs" style="text-align:center">持股漲跌幅、投資總額、配息皆為示範數值，非即時股價</span>' : ''}`;
}

function kidPay(d) {
  const s = state, p = s.pay, m = p.m;
  if (p.step === 'code') return `
    <div class="card center" style="padding:16px;gap:8px">
      <span class="sm">請讓店員掃描，或將手機靠近感應</span>
      ${QR}
      <div class="carrier">
        <span class="row" style="gap:4px;font-size:11px;font-weight:700;color:#0A5C47">${ic('receipt', 'width:14px;height:14px')}已出示手機條碼載具</span>
        ${BARCODE}
        <span style="font-size:12px;font-weight:700;letter-spacing:2px">/JR8+K2Q</span>
      </div>
      <span class="xs">可以用的錢 NT$ ${fmt(s.balance)}・單日上限 NT$ ${fmt(s.dayLimit)}</span>
    </div>`;
  if (p.step === 'confirm') {
    const delay = Math.max(1, Math.ceil(m.amt / (SAVE_PER_WEEK / 7)));
    return `
    <div class="card center fade" style="padding:22px 16px">
      <span class="sm">${m.name} 請求付款</span>
      <span class="big">NT$ ${m.amt}</span>
      <span class="xs">${m.cat}</span>
    </div>
    ${p.remind ? `<div class="alert fade">
      <div class="row">${ic('target')}<span style="font-size:14px;font-weight:700">付款前想一想</span></div>
      <span style="font-size:14px;line-height:1.6">付了這筆，你的「${s.goal.name}」會<b>晚 ${delay} 天</b>達成。</span>
      <span class="xs" style="color:#4A2500">付款後本週還能花 NT$ ${fmt(Math.max(0, d.weekLeft - m.amt))}</span>
    </div>` : ''}
    <button class="btn pri" data-act="confirmPay">確認付款</button>
    <button class="btn sec" data-act="cancelPay">${p.remind ? '再想想，先不買' : '取消'}</button>`;
  }
  if (p.step === 'blocked') return `
    <div class="card center fade" style="padding:24px 16px">
      ${ic('shield', 'width:40px;height:40px;color:#4B5670')}
      <span class="h3" style="font-size:17px">這筆付款無法完成</span>
      <span class="sm" style="line-height:1.6">${p.reason}</span>
    </div>
    <button class="btn sec" data-act="kv" data-arg="home">知道了</button>`;
  if (p.step === 'tag') return `
    <div class="card center fade" style="padding:16px;gap:4px">
      ${ic('check', 'width:34px;height:34px;color:#0A5C47')}
      <span class="h3" style="font-size:18px">付款成功 NT$ ${m.amt}</span>
      <span class="sm">${m.name}・${m.cat}・已自動記帳</span>
      ${m.items ? `<span class="xs" style="color:#0A5C47;font-weight:700">載具帶入品項：${itemsText(m.items)}</span>` : ''}
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
      <div class="row sb"><span style="font-size:13px;font-weight:700">寫點備註？（選填）</span><span class="privacy">${ic('eyeOff')}只有你看得到</span></div>
      <input id="note-input" class="note-input" type="text" maxlength="20" placeholder="可以不寫，直接按上面的按鈕" value="${esc(p.note)}" aria-label="備註（選填）">
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
  const row = t => {
    const expandable = !!t.items || !t.tag;
    const open = s.expandTx === t.id && expandable;
    const inner = `<span class="col" style="min-width:0"><span class="row" style="gap:6px">${esc(t.name)}${srcHtml(t)}</span><span class="xs">${t.cat}・${t.time}${t.note ? '・' + esc(t.note) : ''}</span></span><span class="row">${tagHtml(t)}<b>-${t.amt}</b>${expandable ? ic('down', `width:14px;height:14px;transform:rotate(${open ? 180 : 0}deg)`) : ''}</span>`;
    if (!expandable) return `<div class="lr">${inner}</div>`;
    const panel = open ? `<div class="items fade">
      ${t.items ? t.items.map(([n, a]) => `<span class="row sb"><span>${n}</span><span>${a}</span></span>`).join('') + '<span class="xs">電子發票品項・由載具帶入</span>' : ''}
      ${!t.tag ? `<span style="font-size:12px;font-weight:700;margin-top:${t.items ? 6 : 0}px">補標記：這筆是？</span><div class="grid2"><button class="btn sec" style="min-height:38px" data-act="tagTx" data-arg="${t.id}:need">需要</button><button class="btn warm" style="min-height:38px" data-act="tagTx" data-arg="${t.id}:want">想要</button></div>` : ''}
    </div>` : '';
    return `<button class="lr lrbtn" data-act="expandTx" data-arg="${t.id}">${inner}</button>${panel}`;
  };
  return `
    ${d.untagged ? `<div class="held">${ic('chart')}<span>你還有 ${d.untagged} 筆消費沒標記，點開就能補上</span></div>` : ''}
    <div class="card">
      <span class="sm">本月共花費</span>
      <span class="big">NT$ ${fmt(d.total)}</span>
      <div class="col" style="gap:8px;margin-top:4px">
        ${d.cats.map(c => `<div class="col" style="gap:4px"><div class="row sb"><span style="font-size:13px">${c.name}</span><b style="font-size:13px">NT$ ${fmt(c.amt)}</b></div><div class="track"><div class="fill" style="width:${c.pct}%"></div></div></div>`).join('')}
      </div>
    </div>
    <div class="card" style="gap:0">
      <div class="row sb" style="margin-bottom:6px"><span class="h3">消費明細</span><button class="chip s" data-act="openManual">＋ 手動補記</button></div>
      ${d.rev.map(row).join('')}
      <span class="xs" style="margin-top:8px">點有「載具」標記的消費看發票品項；夜市、攤販等沒有發票的消費可以手動補記</span>
    </div>
    <div class="card">
      <span class="h3">需要 vs 想要</span>
      <div style="display:flex;height:14px;border-radius:99px;overflow:hidden;background:#E4E9F2"><div style="background:#2563EB;width:${d.needPct}%"></div><div style="background:#F59E0B;width:${d.wantPct}%"></div></div>
      <div class="row sb"><span class="tag need">需要 ${d.needPct}%</span><span class="tag want">想要 ${d.wantPct}%</span></div>
      <span style="font-size:13px;line-height:1.6">${d.wantPct >= 40 ? `這個月有 ${d.wantPct}% 花在「想要」，試著把一部分存進目標吧！` : `這個月「想要」只占 ${d.wantPct}%，控制得很好！`}</span>
    </div>
    <div class="card soft">
      <div class="row sb"><span class="h3">每週 30 秒回顧</span><span class="xs">週日</span></div>
      ${pick
        ? `<div class="fb ok fade">你選了「${esc(label(pick))}」，已分享給媽媽。</div>`
        : `${d.untagged ? `<div class="fb no">先把 ${d.untagged} 筆沒標記的消費補上「需要／想要」，回顧會更準喔！</div>` : ''}
           <span style="font-size:14px">這週最值得的一筆花費是？</span>
           <div class="col" style="gap:6px">${d.rev.slice(0, 4).map(t => `<button class="opt" data-act="review" data-arg="${t.id}">${esc(label(t))}・NT$ ${t.amt}</button>`).join('')}</div>`}
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
    <span class="xs" style="text-align:center">從零用錢帳戶轉入，目前可以用的錢 NT$ ${fmt(s.balance)}</span>`;
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
      <span style="font-size:16px;font-weight:800">青少年理財活動</span>
      <span style="font-size:12px;color:#D3DBEA">由合作單位舉辦，報名需爸媽同意。</span>
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
      <span style="font-size:19px;font-weight:800;line-height:1.4">${l.t}</span>
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
    </div>
    <div class="card warmc" style="flex-direction:row;align-items:center;justify-content:space-between">
      <span style="font-size:13px;line-height:1.5">不確定是不是詐騙？<br>說出來是對的。</span>${helpBtn()}
    </div>`;
}

function kidGrowth(d) {
  const s = state, n = s.lessonsDone.length;
  const stage = (cls, num, t, sub, extra = '') => `<div class="stage"><div class="dot ${cls}">${num}</div><div class="col" style="gap:2px"><span class="h3">${t}</span><span class="sm">${sub}</span>${extra}</div></div>`;
  return `
    <div class="grid3">
      <div class="card stat"><b>${s.goalsDone}</b><span class="xs">完成目標</span></div>
      <div class="card stat"><b>${n}</b><span class="xs">學完課程</span></div>
      <div class="card stat"><b>${d.openN}</b><span class="xs">解鎖功能</span></div>
    </div>
    <div class="card" style="gap:0">
      ${stage('done', 1, '零用錢管理', '記帳、需要／想要、存錢目標', '<span class="xs" style="color:#0A5C47;font-weight:700">進行中</span>')}
      ${stage('now', 2, '理財學堂', `隨時都能看，已完成 ${n} / ${LESSONS.length} 課`)}
      ${stage(d.showInvest ? 'now' : 'next', 3, '看懂我的資產', d.showInvest ? '爸媽已和你分享投資' : '爸媽可以選擇和你分享投資')}
      ${stage(d.openN > 0 ? 'now' : 'next', 4, '解鎖理財功能', `由爸媽決定，已解鎖 ${d.openN} / ${FEATURES.length}`)}
      ${stage('future', 5, '18 歲成年禮', '一鍵轉為正式大戶，接手爸媽替自己存的投資', '<span class="xs">未來延伸</span>')}
    </div>`;
}

function kidOverlays() {
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
      ${st === 'open' ? (f.id === 'invest' ? '<div class="fb ok">已開通！到「我的資產」按「我想投資」，每一筆由爸媽確認後送出。</div>' : '<div class="fb ok">已開通，可以開始使用了！（示範到此）</div>') : ''}
    </div></div>`;
  }
  if (s.manual) {
    const m = s.manual;
    html += `<div class="overlay"><div class="sheet">
      <div class="row sb"><span style="font-size:19px;font-weight:800">手動補記</span><button class="iconbtn" aria-label="關閉" data-act="closeManual">${ic('close')}</button></div>
      <span class="xs">沒有電子發票的消費（夜市、攤販），自己記一筆</span>
      <label class="fl">買了什麼<input id="m-name" class="note-input" type="text" maxlength="20" value="${esc(m.name)}"></label>
      <label class="fl">金額（NT$）<input id="m-amt" class="note-input" type="number" min="1" inputmode="numeric" value="${esc(m.amt)}"></label>
      <div class="chips">${CATS.map(c => `<button class="chip s ${m.cat === c ? 'on' : ''}" data-act="manualCat" data-arg="${c}">${c}</button>`).join('')}</div>
      <div class="grid2"><button class="btn sec" data-act="saveManual" data-arg="need">記為需要</button><button class="btn warm" data-act="saveManual" data-arg="want">記為想要</button></div>
    </div></div>`;
  }
  if (s.investDraft) {
    const v = s.investDraft;
    html += `<div class="overlay"><div class="sheet">
      <div class="row sb"><span style="font-size:19px;font-weight:800">我想投資</span><button class="iconbtn" aria-label="關閉" data-act="closeInvest">${ic('close')}</button></div>
      <span class="xs">每一筆都要爸媽在 DAWHO 確認後才會送出</span>
      <span class="fl">選擇標的</span>
      <div class="chips">${HOLDINGS.map(h => `<button class="chip s ${v.code === h.code ? 'on' : ''}" data-act="investPick" data-arg="${h.code}">${h.code} ${h.name}</button>`).join('')}</div>
      <span class="fl">股數</span>
      <div class="row"><button class="iconbtn" aria-label="減少" data-act="investQty" data-arg="-1">${ic('minus')}</button><b style="font-size:20px;min-width:48px;text-align:center">${v.shares}</b><button class="iconbtn" aria-label="增加" data-act="investQty" data-arg="1">${ic('plus')}</button><span class="sm">股</span></div>
      <label class="fl">為什麼想買？（選填，會給爸媽看）<input id="inv-reason" class="note-input" type="text" maxlength="30" value="${esc(v.reason)}" placeholder="例：學堂說 ETF 比較分散"></label>
      <button class="btn pri" data-act="submitInvest">送出投資申請</button>
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
  if (s.transferAlert === 'muleMsg') html += `<div class="overlay mid"><div class="pop left">
    <span class="xs" style="font-weight:700">網友傳來訊息</span>
    <div class="bub ai" style="max-width:100%">我轉錯了，那 5,000 是我的，幫我轉到這個帳戶：012-XXXX-XXXX，謝謝！</div>
    <button class="btn pri" data-act="muleTry">照做，轉出 NT$5,000</button>
    <button class="btn sec" data-act="muleIgnore">不理他</button>
  </div></div>`;
  if (s.transferAlert === 'mule') html += `<div class="overlay mid"><div class="pop left">
    <div class="row">${ic('shieldAlert', 'width:28px;height:28px;color:#7A3D00')}<span style="font-size:18px;font-weight:800">這筆錢還沒入帳，不能轉出</span></div>
    <div class="fb no">有人轉錢給你又要你轉出去，這是常見的<b>人頭帳戶詐騙</b>。</div>
    <span class="xs">這筆陌生轉入正在等爸媽確認，已同步通知媽媽</span>
    <button class="btn pri" data-act="alertCancel">取消</button>
    <button class="btn sec" data-act="askHelp">遇到可疑的事</button>
  </div></div>`;
  if (s.transferAlert === 'fakeBuyer') html += `<div class="overlay mid"><div class="pop left">
    <div class="row">${ic('shieldAlert', 'width:28px;height:28px;color:#7A3D00')}<span style="font-size:18px;font-weight:800">轉帳前等一下！</span></div>
    <div class="ctx">你在二手平台賣演唱會周邊。買家說：「我付款失敗了，請你操作網銀<b>驗證帳戶</b>，再<b>補轉</b> NT$300 給我。」</div>
    <div class="fb no">真正的買家不會要你操作網銀，這是<b>假買家詐騙</b>。</div>
    <button class="btn pri" data-act="alertCancel">取消轉帳</button>
    <button class="btn sec" data-act="alertContinue">我確定要繼續</button>
    <span class="xs" style="text-align:center">已同步通知媽媽</span>
  </div></div>`;
  if (s.helpAsk) html += `<div class="overlay"><div class="sheet">
    <div class="row sb"><span style="font-size:19px;font-weight:800">遇到可疑的事</span><button class="iconbtn" aria-label="關閉" data-act="closeAsk">${ic('close')}</button></div>
    <span class="sm">發生什麼事？（選填，可以直接送出）</span>
    <div class="col" style="gap:6px">${HELP_REASONS.map(r => `<button class="opt ${s.helpAsk.reason === r ? 'right' : ''}" data-act="helpPick" data-arg="${r}">${r}</button>`).join('')}</div>
    <button class="btn pri" data-act="requestHelp">通知媽媽</button>
    <span class="xs" style="text-align:center">送出後會暫停轉帳，刷卡與手機付款照常可用</span>
  </div></div>`;
  if (s.helpShow) html += `<div class="overlay mid"><div class="pop">
    <div class="ring g">${ic('heart', 'width:36px;height:36px')}</div>
    <span style="font-size:20px;font-weight:800">別擔心，說出來是對的</span>
    <span style="font-size:14px;line-height:1.7">已通知媽媽。轉帳已暫停，日常付款不受影響。</span>
    <div class="hotline">${ic('call')}<div class="col"><span class="xs">反詐騙諮詢專線</span><b style="font-size:22px">165</b></div></div>
    <button class="btn pri" data-act="closeHelp">好，我等媽媽</button>
  </div></div>`;
  return html;
}

// ================= 父母端 =================
function viewParent(d) {
  const s = state;
  const titles = {overview:'小安的帳戶', allowance:'零用錢設定', rewards:'獎勵與鼓勵', settings:'設定'};
  const tab = (v, icon, t) => `<button class="tab ${s.parView === v ? 'on' : ''}" data-act="pv" data-arg="${v}">${ic(icon)}${t}</button>`;
  const views = {overview:parOverview, allowance:parAllowance, rewards:parRewards, settings:parSettings};
  const alertN = (s.helpRequested ? 1 : 0) + (s.heldIncoming ? 1 : 0) + s.parAlerts.length;
  return `<div class="ph"><div class="scr">
    <div class="top">
      <div class="col"><span class="app-n p">DAWHO › JUNIOR</span><span class="ttl">${titles[s.parView]}</span></div>
      <div class="avatar p">媽</div>
    </div>
    ${alertN && s.parView !== 'overview' ? `<button class="alertbar" data-act="pv" data-arg="overview">${ic('shieldAlert')}有 ${alertN} 則防詐通知，點此查看</button>` : ''}
    <div class="body" data-sk="par-${s.parView}">${views[s.parView](d)}</div>
    <div class="tabs">${tab('overview', 'home', '總覽')}${tab('allowance', 'card', '零用錢')}${tab('rewards', 'gift', '獎勵')}${tab('settings', 'gear', '設定')}</div>
    ${s.parToast ? `<div class="toast">${ic('bell', 'color:#FBBF24')}<span>${esc(s.parToast)}</span></div>` : ''}
  </div></div>`;
}

const cheerCard = () => `<div class="card"><span class="h3">給小安一點鼓勵</span><div class="chips">${CHEERS.map((c, i) => `<button class="chip" data-act="cheer" data-arg="${i}">${c}</button>`).join('')}</div></div>`;

function spendBlock(d) {
  const s = state;
  if (s.viewLevel === 'monthly') return `<div class="card fade" style="gap:0">
    <div class="row sb" style="margin-bottom:4px"><span class="h3">本月消費總結</span><span class="xs">每月分類總額</span></div>
    <span style="font-size:22px;font-weight:800;margin-bottom:4px">NT$ ${fmt(d.total)}</span>
    ${d.cats.map(c => `<div class="lr"><span>${c.name}</span><b>NT$ ${fmt(c.amt)}</b></div>`).join('')}
    <span class="xs" style="margin-top:6px">不顯示單筆消費；平時只在異常時通知您</span>
  </div>`;
  const detail = s.viewLevel === 'detail';
  return `<div class="card fade" style="gap:0">
    <div class="row sb" style="margin-bottom:4px"><span class="h3">最近消費</span><span class="xs">${detail ? '完整明細' : '店家與金額'}</span></div>
    ${d.rev.slice(0, 5).map(t => `<div class="lr"><span class="col" style="min-width:0"><span>${esc(t.name)}</span><span class="xs">${t.time}${detail && t.items ? '・' + itemsText(t.items) : ''}</span></span><span class="row">${detail ? tagHtml(t) : ''}<b>-${t.amt}</b></span></div>`).join('')}
    <span class="xs" style="margin-top:6px">${detail ? '含品項與孩子的需要／想要標記' : '只顯示店家、金額與時間'}；孩子自己寫的備註不會顯示</span>
  </div>`;
}

// 總覽：只放現況，順序固定
function parOverview(d) {
  const s = state;
  let top = '';
  if (s.helpRequested) top += `<div class="helpcard fade">
    <div class="row">${ic('heart', 'color:#7A3D00')}<span class="h3">小安主動向你求助</span></div>
    ${s.helpReason ? `<span class="sm">小安選的狀況：<b>${esc(s.helpReason)}</b></span>` : ''}
    <span style="font-size:14px;line-height:1.6;font-weight:700">請先陪伴，不要責備。</span>
    <span class="xs" style="line-height:1.6">孩子願意說出來，是最重要的一步。轉帳已暫停，日常付款照常。</span>
    <div class="grid2"><button class="btn pri" data-act="callKid">${ic('call', 'width:16px;height:16px')}打電話給小安</button><button class="btn dark" data-act="callBank">聯繫永豐客服</button></div>
    <button class="btn ghost" style="font-size:13px" data-act="resolveHelp">處理完畢，解除轉帳暫停</button>
  </div>`;
  if (s.heldIncoming) top += `<div class="alert fade">
    <div class="row">${ic('hold', 'color:#7A3D00')}<span class="h3">陌生帳戶轉入 NT$${fmt(s.heldIncoming.amt)}，已先保留</span></div>
    <span style="font-size:13px;line-height:1.6">轉入方不是約定帳戶或家人。款項暫不入小安的可用餘額，等您確認。</span>
    <div class="grid2"><button class="btn sec" style="font-size:13px" data-act="heldAccept">確認是認識的人</button><button class="btn dark" style="font-size:13px" data-act="heldReturn">退回並通報</button></div>
  </div>`;
  top += s.parAlerts.map(a => `<div class="alert fade">
    <div class="row">${ic('shieldAlert', 'color:#7A3D00')}<span class="h3">${a.title}</span></div>
    <span style="font-size:13px;line-height:1.6">${a.text}</span>
    <button class="btn dark" data-act="ackAlert" data-arg="${a.id}">已確認</button></div>`).join('');
  const reqs = FEATURES.filter(f => ['pending', 'branch', 'booked'].includes(s.feat[f.id])).map(f => {
    const st = s.feat[f.id], lt = lessonOf(f.lesson), online = isOnline(f);
    return `<div class="req">
      <span class="xs" style="color:#1E40AF;font-weight:700">${st === 'pending' ? '新的解鎖申請' : '處理中'}</span>
      <span style="font-size:16px;font-weight:800">小安想解鎖「${f.t}」</span>
      ${s.lessonsDone.includes(f.lesson) ? `<span class="tag ok" style="align-self:flex-start">已學過「${lt.t}」</span>` : ''}
      ${st === 'pending' ? `<span class="xs">${f.id === 'invest' ? '小安已有證券帳戶（親子帳戶），同意後立即開通；每一筆投資仍需您確認' : online ? '同意後立即線上開通' : '同意後需預約分行，親子一起完成手續'}</span>
        <div class="grid2"><button class="btn pri" data-act="approve" data-arg="${f.id}">同意</button><button class="btn sec" data-act="decline" data-arg="${f.id}">先不要</button></div>` : ''}
      ${st === 'branch' ? `<span style="font-size:13px;line-height:1.6">此功能需臨櫃辦理。可直接預約分行時段，到場免排隊。</span><button class="btn pri" data-act="book" data-arg="${f.id}">一鍵預約分行</button>` : ''}
      ${st === 'booked' ? `<span style="font-size:13px;line-height:1.6">已預約 ${BOOKING}，到分行完成手續後開通</span>` : ''}
    </div>`;
  }).join('');
  const inv = s.investReqs.filter(r => r.status === 'pending').map(r => `<div class="req">
    <span class="xs" style="color:#1E40AF;font-weight:700">投資申請・需要您確認</span>
    <span style="font-size:16px;font-weight:800">小安想買 ${r.code} ${r.shares} 股</span>
    ${r.reason ? `<span class="sm">小安的理由：「${esc(r.reason)}」</span>` : ''}
    <div class="grid2"><button class="btn pri" data-act="investApprove" data-arg="${r.id}">同意並下單</button><button class="btn sec" data-act="investDecline" data-arg="${r.id}">先不要</button></div>
  </div>`).join('');
  const pick = s.reviewPick ? s.tx.find(t => t.id === s.reviewPick) : null;
  return `${top}${reqs}${inv}
    <div class="card">
      <div class="row sb"><span class="sm">小安可以用的錢</span><span class="sm">本月花費</span></div>
      <div class="row sb"><span style="font-size:24px;font-weight:800">NT$ ${fmt(s.balance)}</span><span style="font-size:18px;font-weight:700">NT$ ${fmt(d.total)}</span></div>
      <div class="row sb" style="margin-top:4px"><span class="sm">${s.goal.name}</span><span class="sm">${d.goalPct}%</span></div>
      <div class="track"><div class="fill g" style="width:${d.goalPct}%"></div></div>
    </div>
    ${spendBlock(d)}
    ${pick ? `<div class="card soft fade"><span class="xs" style="font-weight:700;color:#1E40AF">小安的每週回顧</span><span style="font-size:14px">這週最值得的一筆：「${esc(pick.name)}」NT$ ${pick.amt}</span></div>` : ''}
    ${cheerCard()}`;
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
    <button class="btn sec" data-act="payAllowance">提前撥款</button>`;
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
    ${visibleFeed().slice(0, 3).map(f => `<div class="xs fade" style="padding:0 4px">・${esc(feedText(f))}</div>`).join('')}`;
}

function parSettings() {
  const s = state;
  return `
    <div class="card">
      <span class="h3">查看程度</span>
      <span class="xs">依小安年齡 ${s.childAge} 歲自動預設，也可以手動調整</span>
      <div class="chips">${Object.keys(LEVELS).map(k => `<button class="chip s ${s.viewLevel === k ? 'on' : ''}" data-act="setLevel" data-arg="${k}">${LEVELS[k].t}</button>`).join('')}</div>
      <span class="privacy">${ic('shield')}防詐警示與求助不受此設定影響</span>
    </div>
    ${s.hasLinkedSecurities ? `<div class="card">
      <div class="row sb"><span class="col" style="gap:2px"><span class="h3">讓孩子看見我替他買的投資</span><span class="xs">來自永豐金證券親子帳戶・預設關閉</span></span>
      <button class="sw ${s.shareInvest ? 'on' : ''}" aria-pressed="${s.shareInvest}" aria-label="讓孩子看見我替他買的投資" data-act="toggleShare"><span class="knob"></span></button></div>
      ${s.shareInvest ? `<span class="xs" style="margin-top:2px">分享範圍</span>
        <div class="chips">${[['total', '只看總額'], ['detail', '看持股明細']].map(([k, t]) => `<button class="chip s ${s.shareLevel === k ? 'on' : ''}" data-act="setShareLevel" data-arg="${k}">${t}</button>`).join('')}</div>
        <span class="xs" style="margin-top:2px">投資權限</span>
        <div class="chips">${[['view', '只能看'], ['self', '可以自己投資']].map(([k, t]) => `<button class="chip s ${(s.feat.invest === 'open' ? 'self' : 'view') === k ? 'on' : ''}" data-act="setInvestPerm" data-arg="${k}">${t}</button>`).join('')}</div>
        <span class="xs">可以自己投資：小安可提出下單，每一筆都要您確認後才會送出</span>` : ''}
    </div>` : ''}
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
      ${['陌生入帳先保留', '短時間大量轉出', '新增陌生收款人'].map(t => `<div class="lr"><span>${t}</span><span class="sw fixed" role="img" aria-label="已開啟"><span class="knob"></span></span></div>`).join('')}
      <span class="xs" style="margin-top:6px;line-height:1.6">非約定、非家人的轉入先保留，等您確認後才入帳；大額轉出（NT$${fmt(LARGE_TRANSFER)} 以上）暫停並通知您；一般金額只提醒孩子、同步通知您。</span>
    </div>`;
}

// ================= 動作 =================
function goCh(id) {
  const s = state, c = chOf(id);
  const patch = {ch:id, kidView:c.kid || 'home', parView:c.par || s.parView, sheet:null, manual:null, investDraft:null,
    pay:EMPTY_PAY(), lessonOpen:null, quizPick:null, transferAlert:null, helpShow:false, helpAsk:null};
  // 第 09 章以 16 歲示範，離開後恢復
  if (s.ch === 'scam' && id !== 'scam' && s.savedAge) { patch.childAge = s.savedAge.age; patch.viewLevel = s.savedAge.level; patch.savedAge = null; }
  if (id === 'scam' && s.ch !== 'scam') { patch.savedAge = {age:s.childAge, level:s.viewLevel}; patch.childAge = 16; patch.viewLevel = DEFAULT_LEVEL(16); }
  if (id === 'open') patch.openStep = 0;
  set(patch);
}
function requestFeat(id) {
  const s = state, f = featOf(id);
  s.feat[id] = 'pending'; delete s.featNote[id];
  addFeed('request', `小安申請解鎖「${f.t}」`);
  const patch = {sheet:null, parView:'overview'};
  if (!chOf(s.ch).dual) patch.ch = 'unlock';
  set(patch);
  toast('kid', '已送出申請，等爸媽回覆');
  toast('par', `小安想解鎖「${f.t}」`);
}
function payAllowance(auto) {
  const s = state;
  addFeed('parent', `${auto ? '自動撥款' : '提前撥款'}：零用錢 NT$${s.allowance}`);
  set({balance:s.balance + s.allowance, weekSpent:0});
  toast('kid', `媽媽的零用錢 NT$${s.allowance} 入帳了，本週額度已更新`);
  toast('par', `${auto ? '已自動撥款' : '已提前撥款'} NT$${s.allowance} 給小安`);
}

const ACT = {
  goCh,
  prevCh() { const i = CH.findIndex(c => c.id === state.ch); if (i > 0) goCh(CH[i - 1].id); },
  nextCh() { const i = CH.findIndex(c => c.id === state.ch); if (i < CH.length - 1) goCh(CH[i + 1].id); },
  reset() { Object.values(timers).forEach(clearTimeout); state = initState(); render(); },
  kv(v) { set({kidView:v, sheet:null, manual:null, investDraft:null, pay:EMPTY_PAY(), lessonOpen:null, quizPick:null}); },
  pv(v) { set({parView:v}); },

  // 00 開戶簡介
  openNext() { if (state.openStep < 3) set({openStep:state.openStep + 1}); },
  openReset() { set({openStep:0}); },

  // 零用錢
  autoAllowance() { payAllowance(true); },
  payAllowance() { payAllowance(false); },

  // 付款：出示付款碼＋載具 → 店家送出金額 →（必要時）付款前想一想 → 付款 → 需要／想要
  scan(id) {
    const s = state, m = MERCHANTS.find(x => x.id === id);
    const base = {...EMPTY_PAY(), m};
    if (m.block && s.blocked[m.block]) {
      return set({kidView:'pay', pay:{...base, step:'blocked', reason:`「${m.cat}」已被爸媽設為封鎖類別。想買的話，可以先跟爸媽討論看看。`}});
    }
    if (s.todaySpent + m.amt > s.dayLimit) {
      return set({kidView:'pay', pay:{...base, step:'blocked', reason:`超過今天的消費上限 NT$${fmt(s.dayLimit)}（今日已花 NT$${fmt(s.todaySpent)}）。`}});
    }
    const weekLeft = Math.max(0, s.allowance - s.weekSpent);
    const trigger = (REMIND_CATS.includes(m.cat) && m.amt >= 50) || m.amt >= weekLeft / 2;
    const remind = trigger && s.todayReminders < MAX_REMINDERS;
    set({kidView:'pay', todayReminders:s.todayReminders + (remind ? 1 : 0), pay:{...base, step:'confirm', remind}});
  },
  confirmPay() {
    const s = state, m = s.pay.m;
    if (m.amt > s.balance) return toast('kid', '可以用的錢不夠，先存一點再買吧');
    const tx = {id:Date.now(), name:m.name, amt:m.amt, cat:m.cat, tag:null, source:m.items ? 'carrier' : 'card', items:m.items, note:'', time:'剛剛'};
    s.tx.push(tx);
    addFeed('spend', '', {txId:tx.id});
    set({balance:s.balance - m.amt, weekSpent:s.weekSpent + m.amt, todaySpent:s.todaySpent + m.amt,
      pay:{...s.pay, step:'tag', txId:tx.id, note:''}});
  },
  cancelPay() { const r = state.pay.remind; ACT.kv('home'); if (r) toast('kid', `好決定！這筆錢可以留給「${state.goal.name}」`); },
  noteChip(c) { state.pay.note = state.pay.note === c ? '' : c; render(); },
  tag(tag) {
    const s = state, tx = s.tx.find(t => t.id === s.pay.txId);
    tx.tag = tag; tx.note = s.pay.note.trim();
    set({pay:{...s.pay, step:'done'}});
  },

  // 帳本
  expandTx(id) { id = Number(id); set({expandTx:state.expandTx === id ? null : id}); },
  tagTx(arg) {
    const [id, tag] = arg.split(':');
    const tx = state.tx.find(t => t.id === Number(id));
    tx.tag = tag;
    set({expandTx:tx.items ? tx.id : null});
    toast('kid', `已標記「${tx.name}」為${tagWord(tag)}`);
  },
  openManual() { set({manual:{name:'夜市雞排', amt:'70', cat:'飲食'}}); },
  closeManual() { set({manual:null}); },
  manualCat(c) { state.manual.cat = c; render(); },
  saveManual(tag) {
    const s = state, m = s.manual, amt = Math.round(Number(m.amt));
    if (!m.name.trim() || !(amt > 0)) return toast('kid', '請填寫品項與金額');
    const tx = {id:Date.now(), name:m.name.trim(), amt, cat:m.cat, tag, source:'manual', items:null, note:'', time:'剛剛'};
    s.tx.push(tx);
    addFeed('spend', '', {txId:tx.id});
    set({manual:null});
    toast('kid', `已記下「${tx.name}」NT$${amt}`);
  },
  review(id) {
    const t = state.tx.find(x => x.id === Number(id));
    addFeed('review', `小安的每週回顧：最值得的一筆是「${t.name}」`);
    set({reviewPick:t.id}); toast('par', '小安完成每週回顧');
  },

  // 存錢目標
  depositGoal() {
    const s = state, g = s.goal;
    if (s.balance < 100) return toast('kid', '可以用的錢不夠 NT$100');
    if (g.saved + 100 >= g.target) {
      const bonus = s.rules.goal ? 200 : 0;
      addFeed('goal', `小安達成目標「${g.name}」${bonus ? '，已自動加碼 NT$200' : ''}`);
      set({goal:{...g, saved:g.target}, balance:s.balance - 100 + bonus, goalsDone:s.goalsDone + 1,
        celebrate:{name:g.name, target:g.target, bonus:!!bonus}});
      toast('par', bonus ? `小安達成「${g.name}」！已自動加碼 NT$200` : `小安達成「${g.name}」！`);
    } else {
      addFeed('goal', '小安存入目標 NT$100');
      set({goal:{...g, saved:g.saved + 100}, balance:s.balance - 100});
    }
  },
  nextGoal() { set({celebrate:null, goal:{name:'藍牙耳機', saved:0, target:2500}}); toast('kid', '新目標「藍牙耳機」設定好了！'); },
  cheer(i) { const m = CHEERS[i]; set({cheer:m}); toast('kid', '媽媽：' + m); toast('par', '鼓勵已送出'); },

  // 學堂與小幫手
  openLesson(id) { set({kidView:'school', lessonOpen:id, quizPick:null, sheet:null}); },
  closeLesson() { set({lessonOpen:null, quizPick:null}); },
  answer(i) {
    const s = state, l = lessonOf(s.lessonOpen); i = Number(i);
    if (s.quizPick !== null) return;
    s.quizPick = i;
    if (i === l.c && !s.lessonsDone.includes(l.id)) {
      s.lessonsDone = s.lessonsDone.concat(l.id);
      addFeed('lesson', `小安完成學堂「${l.t}」`);
      if (s.rules.lesson && s.lessonsDone.length >= 3 && !s.lessonBonusGiven) {
        s.balance += 50; s.lessonBonusGiven = true;
        addFeed('lesson', '小安完成 3 堂課，已自動加碼 NT$50');
        toast('kid', '完成 3 堂課！媽媽加碼 NT$50 已入帳');
      }
    }
    render();
  },
  ask(i) {
    const q = AIQA[i];
    set({msgs:state.msgs.concat([{from:'me', text:q.q}, {from:q.warn ? 'warn' : 'ai', text:q.a}]).slice(-5)});
  },
  joinComp() { addFeed('request', '小安想報名「青少年理財活動」，等您同意'); toast('kid', '想參加嗎？已通知爸媽，同意後就能報名'); },
  joinCamp() { addFeed('request', '小安分享了「親子理財營」'); toast('kid', '已把「親子理財營」分享給爸媽'); },

  // 解鎖
  openSheet(id) { set({sheet:id}); },
  closeSheet() { set({sheet:null}); },
  requestFeat,
  approve(id) {
    const f = featOf(id);
    if (isOnline(f)) {
      state.feat[id] = 'open';
      if (id === 'invest') state.shareInvest = true;
      set({unlockShow:id, sheet:null}); toast('par', `「${f.t}」已線上開通`);
    } else { state.feat[id] = 'branch'; render(); toast('kid', `爸媽同意了！「${f.t}」要一起去分行辦理`); }
  },
  decline(id) {
    state.feat[id] = 'locked'; state.featNote[id] = '等你存滿 3,000 元再說喔！';
    render(); toast('kid', '媽媽：等你存滿 3,000 元再說喔！');
  },
  book(id) { state.feat[id] = 'booked'; render(); toast('kid', '媽媽預約了分行：' + BOOKING); },
  finishBranch() {
    const f = FEATURES.find(x => state.feat[x.id] === 'booked');
    if (!f) return;
    state.feat[f.id] = 'open';
    set({unlockShow:f.id, sheet:null});
    toast('par', `「${f.t}」已在分行完成開通`);
  },
  closeUnlock() { set({unlockShow:null}); },

  // 看得懂：我的資產與投資權限
  toggleShare() {
    const on = !state.shareInvest;
    if (!on && state.feat.invest === 'open') state.feat.invest = 'locked';
    set({shareInvest:on});
    if (on) { addFeed('parent', '您開啟了投資分享'); toast('kid', '爸媽和你分享了投資，去「我的資產」看看！'); }
  },
  setShareLevel(k) { set({shareLevel:k}); },
  setInvestPerm(k) {
    state.feat.invest = k === 'self' ? 'open' : 'locked';
    render();
    toast('kid', k === 'self' ? '爸媽開放你自己提出投資，每一筆由爸媽確認' : '投資權限改為「只能看」');
  },
  simDividend() {
    set({dividend:{...DIVIDEND}});
    if (state.hasLinkedSecurities && state.shareInvest) {
      toast('kid', `你的 ${DIVIDEND.code} 配息了！NT$${DIVIDEND.amt}（示範）想知道錢怎麼長大？看學堂「複利」課`);
      toast('par', `${DIVIDEND.code} 配息已通知小安`);
    } else {
      toast('par', `${DIVIDEND.code} 配息入帳。開啟投資分享後，小安才會收到配息通知`);
    }
  },
  openInvest() { set({investDraft:{code:'00858', shares:1, reason:''}}); },
  closeInvest() { set({investDraft:null}); },
  investPick(code) { state.investDraft.code = code; render(); },
  investQty(n) { const v = state.investDraft; v.shares = Math.max(1, Math.min(99, v.shares + Number(n))); render(); },
  submitInvest() {
    const v = state.investDraft;
    const r = {id:String(Date.now()), code:v.code, shares:v.shares, reason:v.reason.trim(), status:'pending'};
    state.investReqs = state.investReqs.concat(r);
    addFeed('request', `小安提出投資申請：${r.code} ${r.shares} 股`);
    set({investDraft:null});
    toast('kid', '已送出投資申請，等爸媽確認');
    toast('par', `小安想買 ${r.code} ${r.shares} 股`);
  },
  investApprove(id) {
    const r = state.investReqs.find(x => x.id === id); r.status = 'sent';
    render(); toast('kid', `爸媽同意了！${r.code} ${r.shares} 股已送出委託（示範）`); toast('par', '已送出委託（示範）');
  },
  investDecline(id) {
    const r = state.investReqs.find(x => x.id === id); r.status = 'declined';
    render(); toast('kid', '爸媽說先不要，可以再跟爸媽聊聊為什麼');
  },

  // 守得住
  simHeld() {
    addFeed('security', '陌生帳戶轉入 NT$5,000 已先保留，等您確認');
    set({heldIncoming:{amt:5000}, kidView:'home', sheet:null, parView:'overview'});
    toast('kid', '有一筆陌生轉入 NT$5,000，正在等爸媽確認');
    toast('par', '陌生帳戶轉入 NT$5,000，已先保留');
  },
  simMuleAsk() { state.feat.transfer = 'open'; set({transferAlert:'muleMsg', kidView:'home', sheet:null}); },
  muleTry() {
    addAlert('防詐守護・已阻擋轉出', '小安嘗試把保留中的 NT$5,000 轉出到陌生帳戶。疑似人頭帳戶詐騙，系統已阻擋並提醒小安。');
    addFeed('security', '小安嘗試轉出保留中的款項，已阻擋');
    set({transferAlert:'mule', parView:'overview'});
    toast('par', '已阻擋一筆可疑轉出');
  },
  muleIgnore() { set({transferAlert:null}); toast('kid', '做得好！不認識的人轉來的錢，交給爸媽處理'); },
  heldAccept() {
    const amt = state.heldIncoming.amt;
    set({heldIncoming:null, balance:state.balance + amt});
    toast('par', '已確認，款項入帳'); toast('kid', `媽媽確認了，NT$${fmt(amt)} 已入帳`);
  },
  heldReturn() {
    addFeed('security', '陌生轉入 NT$5,000 已退回並通報');
    set({heldIncoming:null});
    toast('par', '已退回並通報永豐'); toast('kid', '那筆陌生轉入已退回，謝謝你沒有轉出去');
  },
  simFakeBuyer() {
    state.feat.transfer = 'open';
    addAlert('交易當下提醒', '小安準備轉出 NT$300，轉帳備註含「驗證」「補轉」等假買家詐騙關鍵字。系統已提醒小安，金額不大，未阻擋。');
    addFeed('security', '小安的轉帳觸發假買家詐騙提醒');
    set({transferAlert:'fakeBuyer', kidView:'home', sheet:null, parView:'overview'});
    toast('par', '小安的轉帳觸發了詐騙提醒');
  },
  alertCancel() {
    set({transferAlert:null});
    addFeed('security', '小安看到提醒後，取消了可疑轉帳');
    toast('kid', '做得好！不理會對方，有問題就問爸媽');
    toast('par', '小安取消了可疑轉帳');
  },
  alertContinue() {
    const s = state;
    if (s.outboundFrozen) { set({transferAlert:null}); return toast('kid', '轉帳暫停中，無法轉帳'); }
    addAlert('小安在提醒後仍轉出 NT$300', '建議找時間和小安聊聊這筆轉帳，先陪伴、不責備。如有需要可聯繫永豐客服。');
    addFeed('security', '小安在提醒後仍轉出 NT$300');
    set({transferAlert:null, balance:Math.max(0, s.balance - 300)});
    toast('kid', '已轉出 NT$300。如果覺得不對勁，隨時按「遇到可疑的事」');
    toast('par', '小安在提醒後仍轉出 NT$300');
  },
  askHelp() { set({helpAsk:{reason:''}, transferAlert:null, sheet:null}); },
  closeAsk() { set({helpAsk:null}); },
  helpPick(r) { state.helpAsk.reason = state.helpAsk.reason === r ? '' : r; render(); },
  requestHelp() {
    const s = state, reason = s.helpAsk ? s.helpAsk.reason : '';
    addFeed('help', `小安按下「遇到可疑的事」向您求助${reason ? `：${reason}` : ''}`);
    const patch = {helpRequested:true, helpReason:reason, outboundFrozen:true, helpAsk:null, helpShow:true, transferAlert:null, sheet:null, parView:'overview'};
    if (!chOf(s.ch).dual) {
      patch.ch = 'scam'; patch.savedAge = {age:s.childAge, level:s.viewLevel};
      patch.childAge = 16; patch.viewLevel = DEFAULT_LEVEL(16);
    }
    set(patch);
    toast('par', '小安主動向你求助');
  },
  closeHelp() { set({helpShow:false}); },
  callKid() { toast('kid', '媽媽打電話給你了'); toast('par', '正在撥給小安'); },
  callBank() { toast('par', '已為您轉接永豐客服，也可由客服協助解除暫停'); },
  resolveHelp() { set({helpRequested:false, helpReason:'', outboundFrozen:false}); toast('kid', '媽媽已處理完畢，轉帳恢復正常'); },
  ackAlert(id) { set({parAlerts:state.parAlerts.filter(a => a.id !== id)}); },

  // 父母設定
  setAllowance(a) { set({allowance:Number(a)}); },
  setFreq(f) { set({freq:f}); },
  toggleAuto() { set({auto:!state.auto}); },
  toggleRule(id) { state.rules[id] = !state.rules[id]; render(); },
  setLimit(a) { set({dayLimit:Number(a)}); },
  toggleBlock(k) { state.blocked[k] = !state.blocked[k]; render(); },
  setAge(a) { a = Number(a); set({childAge:a, viewLevel:DEFAULT_LEVEL(a)}); toast('kid', `媽媽可以看到：${LEVELS[DEFAULT_LEVEL(a)].kid}`); },
  setLevel(k) { set({viewLevel:k}); toast('kid', `媽媽可以看到：${LEVELS[k].kid}`); }
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
// 打字不重繪，避免失去焦點
app.addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'note-input') state.pay.note = e.target.value;
  if (id === 'm-name' && state.manual) state.manual.name = e.target.value;
  if (id === 'm-amt' && state.manual) state.manual.amt = e.target.value;
  if (id === 'inv-reason' && state.investDraft) state.investDraft.reason = e.target.value;
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
