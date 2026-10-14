/**
 * 야자 출석체크 — Google Apps Script 웹앱 (서버)
 * 스프레드시트에 연결된 스크립트로 사용합니다. 설치 방법은 README.md 참고.
 */

const TZ = 'Asia/Seoul';
const PERIODS = [
  { id: 'P8', name: '8교시', short: '8교시', start: '16:40', end: '17:30' },
  { id: 'Y1', name: '야자 1교시', short: '야자1', start: '18:40', end: '20:00' },
  { id: 'Y2', name: '야자 2교시', short: '야자2', start: '20:10', end: '21:30' },
];
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const SCHOOL_DAYS = ['월', '화', '수', '목', '금'];
const REASONS = ['학원', '병원', '가정 사정', '기타'];
const EX_TYPES = ['결석', '조퇴', '사유'];
const MARKS = ['출석', '지각', '미출석'];

const SHEETS = {
  students: { name: '학생', header: ['이메일', '학번', '반', '번호', '이름'] },
  teachers: { name: '교사', header: ['이메일', '이름', '역할(교사/관리자)', '담당반'] },
  schedule: { name: '정기신청', header: ['이메일', '요일', '교시'] },
  exceptions: { name: '예외입력', header: ['ID', '이메일', '날짜', '종류', '교시', '조퇴시각', '사유', '상세', '증빙', '입력시각'] },
  supervisors: { name: '감독배정', header: ['날짜', '교사이메일'] },
  attendance: { name: '출석기록', header: ['날짜', '교시', '이메일', '상태', '체크교사', '체크시각'] },
  closed: { name: '운영안함', header: ['날짜', '메모'] },
};

// ───────────────────────── 설치 / 진입점 ─────────────────────────

/**
 * 데이터를 저장할 스프레드시트.
 * 스프레드시트에 연결된 스크립트면 그 시트를, 독립 스크립트면 setup()이 만든(또는 지정한) 시트를 씁니다.
 */
function ss_() {
  const bound = SpreadsheetApp.getActive();
  if (bound) return bound;
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('데이터 스프레드시트가 없습니다. 관리자가 Apps Script 편집기에서 setup()을 먼저 실행해야 합니다.');
  return SpreadsheetApp.openById(id);
}

/** 처음 한 번 실행: 필요한 시트와 머리글을 만듭니다. 독립 스크립트면 스프레드시트도 새로 만듭니다. */
function setup() {
  const props = PropertiesService.getScriptProperties();
  let ss = SpreadsheetApp.getActive();
  if (!ss) {
    const id = props.getProperty('SPREADSHEET_ID');
    ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create('야자 출석 데이터');
    props.setProperty('SPREADSHEET_ID', ss.getId());
  }
  Object.keys(SHEETS).forEach(key => {
    const { name, header } = SHEETS[key];
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.getRange(1, 1, sh.getMaxRows(), header.length).setNumberFormat('@');
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
  const blank = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
  if (blank && ss.getSheets().length > 1 && blank.getLastRow() === 0) ss.deleteSheet(blank);
  Logger.log('데이터 스프레드시트: ' + ss.getUrl());
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('야자 출석')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ───────────────────────── 공통 도구 ─────────────────────────

function stamp_(d) { return Utilities.formatDate(d || new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss"); }
function today_() { return stamp_().slice(0, 10); }
function ymd_(ds) { return ds.split('-').map(Number); }
function weekday_(ds) { const [y, m, d] = ymd_(ds); return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; }
function addDays_(ds, n) { const [y, m, d] = ymd_(ds); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); }
function mondayOf_(ds) { return addDays_(ds, -((WEEKDAYS.indexOf(weekday_(ds)) + 6) % 7)); }
function minutes_(hhmm) { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
function startAt_(ds, p) { return ds + 'T' + p.start + ':00'; }
function endAt_(ds, p) { return ds + 'T' + p.end + ':00'; }
function key_() { return Array.prototype.join.call(arguments, '|'); }
function isDate_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }

function period_(k) {
  const p = PERIODS.find(x => x.id === k || x.name === k || x.short === k);
  if (!p) throw new Error('알 수 없는 교시입니다: ' + k);
  return p;
}
function pid_(k) { const p = PERIODS.find(x => x.id === k || x.name === k || x.short === k); return p ? p.id : null; }

function byClassNum_(a, b) { return (Number(a.cls) - Number(b.cls)) || (Number(a.num) - Number(b.num)); }

function cell_(v) {
  if (v instanceof Date) {
    return v.getFullYear() < 1900 ? Utilities.formatDate(v, TZ, 'HH:mm') : Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
  }
  return v === null || v === undefined ? '' : String(v).trim();
}

/** 시트를 읽어 {sh, rows:[{row, v:[문자열...]}]} 로 돌려줍니다. */
function table_(key) {
  const { name, header } = SHEETS[key];
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error(`'${name}' 시트가 없습니다. 관리자가 setup()을 먼저 실행해야 합니다.`);
  const values = sh.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const v = header.map((_, c) => cell_(values[i][c]));
    if (v.some(c => c !== '')) rows.push({ row: i + 1, v });
  }
  return { sh, rows };
}

function appendRows_(sh, data) {
  if (!data.length) return;
  const start = sh.getLastRow() + 1;
  const need = start + data.length - 1 - sh.getMaxRows();
  if (need > 0) sh.insertRowsAfter(sh.getMaxRows(), need + 500);
  const rg = sh.getRange(start, 1, data.length, data[0].length);
  rg.setNumberFormat('@');
  rg.setValues(data);
}

function rewrite_(sh, width, data) {
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, width).clearContent();
  appendRows_(sh, data);
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

// ───────────────────────── 사용자 ─────────────────────────

function me_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) throw new Error('로그인 정보를 확인할 수 없습니다. 학교 구글 계정으로 접속하세요.');
  const t = table_('teachers').rows.find(r => r.v[0].toLowerCase() === email);
  if (t) return { email, role: 'teacher', name: t.v[1], isAdmin: t.v[2] === '관리자', homeroom: t.v[3] };
  const s = table_('students').rows.find(r => r.v[0].toLowerCase() === email);
  if (s) return { email, role: 'student', sid: s.v[1], cls: s.v[2], num: s.v[3], name: s.v[4] };
  return { email, role: 'none' };
}

function requireStudent_() {
  const me = me_();
  if (me.role !== 'student') throw new Error('학생만 사용할 수 있습니다.');
  return me;
}

function requireTeacher_() {
  const me = me_();
  if (me.role !== 'teacher') throw new Error('교사만 사용할 수 있습니다.');
  return me;
}

// ───────────────────────── 출석 계산 ─────────────────────────

function exFromRow_(v) {
  return {
    id: v[0], email: v[1].toLowerCase(), date: v[2], type: v[3],
    periods: v[4] ? v[4].split(',').map(s => pid_(s.trim())).filter(Boolean) : [],
    leave: v[5], reason: v[6], detail: v[7], proof: v[8], createdAt: v[9],
  };
}

function exLabel_(ex) { return ex.type === '사유' ? (ex.reason || '사유') : ex.type; }

function exSummary_(ex) {
  if (ex.type === '결석') return '종일 결석';
  if (ex.type === '조퇴') return ex.leave + ' 조퇴';
  return ex.periods.map(id => period_(id).name).join(', ') + ' · ' + ex.reason;
}

/** 한 번의 요청에 필요한 시트 데이터를 모두 읽어 둡니다. */
function context_() {
  const ctx = {
    now: stamp_(),
    students: table_('students').rows.map(r => ({ email: r.v[0].toLowerCase(), sid: r.v[1], cls: r.v[2], num: r.v[3], name: r.v[4] })),
    schedule: new Set(),
    exByDay: {},
    marks: {},
    marked: new Set(),
    closed: new Set(table_('closed').rows.map(r => r.v[0])),
    supervisors: {},
    teacherNames: {},
  };
  table_('schedule').rows.forEach(r => {
    const id = pid_(r.v[2]);
    if (id) ctx.schedule.add(key_(r.v[0].toLowerCase(), r.v[1], id));
  });
  table_('exceptions').rows.forEach(r => {
    const ex = exFromRow_(r.v);
    const k = key_(ex.email, ex.date);
    (ctx.exByDay[k] = ctx.exByDay[k] || []).push(ex);
  });
  table_('attendance').rows.forEach(r => {
    const id = pid_(r.v[1]);
    if (!id) return;
    ctx.marks[key_(r.v[0], id, r.v[2].toLowerCase())] = r.v[3];
    ctx.marked.add(key_(r.v[0], id));
  });
  table_('supervisors').rows.forEach(r => { ctx.supervisors[r.v[0]] = r.v[1].toLowerCase(); });
  table_('teachers').rows.forEach(r => { ctx.teacherNames[r.v[0].toLowerCase()] = r.v[1]; });
  return ctx;
}

/** 해당 교시를 빠지게 하는 입력(결석/조퇴/사유). 교시 시작 전에 입력한 것만 인정합니다. */
function excuse_(ctx, email, ds, p) {
  const list = ctx.exByDay[key_(email, ds)] || [];
  const start = startAt_(ds, p);
  for (const ex of list) {
    if (!(ex.createdAt < start)) continue;
    if (ex.type === '결석') return ex;
    if (ex.type === '조퇴' && ex.leave && minutes_(ex.leave) < minutes_(p.end)) return ex;
    if (ex.type === '사유' && ex.periods.indexOf(p.id) >= 0) return ex;
  }
  return null;
}

/**
 * 학생의 한 교시 상태. 신청하지 않았거나 운영하지 않는 날이면 null.
 * code: present | late | absent(무단) | excused(사유) | planned(예정) | unchecked(미체크)
 */
function status_(ctx, email, ds, p) {
  if (ctx.closed.has(ds)) return null;
  if (!ctx.schedule.has(key_(email, weekday_(ds), p.id))) return null;
  const ex = excuse_(ctx, email, ds, p);
  if (ex) return { code: 'excused', label: exLabel_(ex) };
  const mark = ctx.marks[key_(ds, p.id, email)];
  if (mark === '출석') return { code: 'present', label: '출석' };
  if (mark === '지각') return { code: 'late', label: '지각' };
  if (mark === '미출석') return { code: 'absent', label: '무단 불참' };
  if (ctx.now < startAt_(ds, p)) return { code: 'planned', label: '예정' };
  // 감독 교사가 체크한 교시가 끝났는데 체크되지 않은 학생은 무단 불참
  if (ctx.now >= endAt_(ds, p) && ctx.marked.has(key_(ds, p.id))) return { code: 'absent', label: '무단 불참' };
  return { code: 'unchecked', label: '미체크' };
}

function tally_(ctx, email, from, to) {
  const c = { present: 0, late: 0, excused: 0, absent: 0, total: 0, rate: null };
  for (let ds = from; ds <= to; ds = addDays_(ds, 1)) {
    PERIODS.forEach(p => {
      const st = status_(ctx, email, ds, p);
      if (!st || st.code === 'planned' || st.code === 'unchecked') return;
      c[st.code]++;
      c.total++;
    });
  }
  const base = c.total - c.excused;
  if (base > 0) c.rate = Math.round((c.present + c.late) / base * 100);
  return c;
}

/** 무단 불참 없이 출석한 날이 며칠 이어졌는지. 사유로만 빠진 날은 건너뜁니다. */
function streak_(ctx, email, today) {
  let n = 0;
  for (let i = 0; i < 180; i++) {
    const ds = addDays_(today, -i);
    const sts = PERIODS.map(p => status_(ctx, email, ds, p)).filter(Boolean);
    if (!sts.length) continue;
    if (sts.some(s => s.code === 'absent')) break;
    if (sts.some(s => s.code === 'present' || s.code === 'late')) n++;
  }
  return n;
}

// ───────────────────────── 공통 API ─────────────────────────

function getInit() {
  const me = me_();
  const out = { me, periods: PERIODS, days: SCHOOL_DAYS, reasons: REASONS, now: stamp_() };
  if (me.role === 'teacher') {
    const set = {};
    table_('students').rows.forEach(r => { if (r.v[2]) set[r.v[2]] = true; });
    out.classes = Object.keys(set).sort((a, b) => Number(a) - Number(b));
  }
  return out;
}

// ───────────────────────── 학생 API ─────────────────────────

function getMySchedule() {
  const me = requireStudent_();
  return table_('schedule').rows
    .filter(r => r.v[0].toLowerCase() === me.email && pid_(r.v[2]))
    .map(r => key_(r.v[1], pid_(r.v[2])));
}

/** items: [['월','P8'], ...] */
function saveMySchedule(items) {
  const me = requireStudent_();
  const seen = {};
  const add = [];
  (items || []).forEach(([day, k]) => {
    const id = pid_(k);
    if (SCHOOL_DAYS.indexOf(day) < 0 || !id || seen[day + id]) return;
    seen[day + id] = true;
    add.push([me.email, day, period_(id).name]);
  });
  withLock_(() => {
    const { sh, rows } = table_('schedule');
    const keep = rows.filter(r => r.v[0].toLowerCase() !== me.email).map(r => r.v.slice(0, 3));
    rewrite_(sh, 3, keep.concat(add));
  });
  return getMySchedule();
}

/**
 * p: {date, type:'결석'|'조퇴'|'사유', periods:['Y1'], leave:'13:00', reason:'학원', detail, file:{name,type,data(base64)}}
 */
function addException(p) {
  const me = requireStudent_();
  const now = stamp_();
  if (!isDate_(p.date)) throw new Error('날짜를 선택하세요.');
  if (p.date < now.slice(0, 10)) throw new Error('지난 날짜는 입력할 수 없습니다.');
  if (EX_TYPES.indexOf(p.type) < 0) throw new Error('종류를 선택하세요.');

  let periods = [];
  let leave = '';
  let reason = '';
  if (p.type === '사유') {
    periods = PERIODS.filter(x => (p.periods || []).indexOf(x.id) >= 0);
    if (!periods.length) throw new Error('교시를 하나 이상 선택하세요.');
    if (REASONS.indexOf(p.reason) < 0) throw new Error('사유를 선택하세요.');
    reason = p.reason;
    const started = periods.filter(x => startAt_(p.date, x) <= now);
    if (started.length) throw new Error(started.map(x => x.name).join(', ') + '은(는) 이미 시작되어 입력할 수 없습니다.');
  } else {
    if (p.type === '조퇴') {
      if (!/^\d{2}:\d{2}$/.test(p.leave || '')) throw new Error('조퇴 시각을 입력하세요.');
      leave = p.leave;
    }
    const affected = PERIODS.filter(x => p.type === '결석' || minutes_(leave) < minutes_(x.end));
    if (!affected.length) throw new Error('조퇴 시각 이후에 빠지는 교시가 없습니다.');
    if (!affected.some(x => startAt_(p.date, x) > now)) throw new Error('해당 교시가 모두 시작되어 입력할 수 없습니다.');
  }

  const detail = String(p.detail || '').trim().slice(0, 200);
  const proof = p.file ? saveProof_(me, p.date, p.file) : '';
  const row = [
    Utilities.getUuid().slice(0, 8), me.email, p.date, p.type,
    periods.map(x => x.name).join(', '), leave, reason, detail, proof, now,
  ];
  withLock_(() => appendRows_(table_('exceptions').sh, [row]));
  return getMyExceptions();
}

function saveProof_(me, date, file) {
  if (!/^image\//.test(file.type || '')) throw new Error('사진 파일만 첨부할 수 있습니다.');
  const bytes = Utilities.base64Decode(file.data);
  if (bytes.length > 5 * 1024 * 1024) throw new Error('사진은 5MB 이하만 첨부할 수 있습니다.');
  const name = `${date}_${me.sid}_${me.name}_${file.name || 'proof.jpg'}`;
  return proofFolder_().createFile(Utilities.newBlob(bytes, file.type, name)).getUrl();
}

function proofFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('PROOF_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* 폴더가 지워졌으면 새로 만듭니다 */ }
  }
  const folder = DriveApp.createFolder('야자 출석 증빙');
  props.setProperty('PROOF_FOLDER_ID', folder.getId());
  return folder;
}

/** 첫 교시(8교시) 시작 전까지만 지울 수 있습니다. */
function canDelete_(ex, now) { return startAt_(ex.date, PERIODS[0]) > now; }

function getMyExceptions() {
  const me = requireStudent_();
  const now = stamp_();
  const from = addDays_(now.slice(0, 10), -7);
  return table_('exceptions').rows
    .map(r => exFromRow_(r.v))
    .filter(ex => ex.email === me.email && ex.date >= from)
    .sort((a, b) => (a.date === b.date ? (a.createdAt < b.createdAt ? 1 : -1) : (a.date < b.date ? 1 : -1)))
    .map(ex => ({
      id: ex.id, date: ex.date, day: weekday_(ex.date), type: ex.type, label: exLabel_(ex),
      summary: exSummary_(ex), detail: ex.detail, hasProof: !!ex.proof, canDelete: canDelete_(ex, now),
    }));
}

function deleteException(id) {
  const me = requireStudent_();
  withLock_(() => {
    const { sh, rows } = table_('exceptions');
    const r = rows.find(x => x.v[0] === String(id) && x.v[1].toLowerCase() === me.email);
    if (!r) throw new Error('입력 내역을 찾을 수 없습니다.');
    if (!canDelete_(exFromRow_(r.v), stamp_())) throw new Error('이미 교시가 시작되어 지울 수 없습니다. 담임 선생님께 말씀드리세요.');
    sh.deleteRow(r.row);
  });
  return getMyExceptions();
}

function getMyStatus() {
  const me = requireStudent_();
  const ctx = context_();
  const today = ctx.now.slice(0, 10);
  const monday = mondayOf_(today);
  const week = [];
  let studyMin = 0;
  let done = 0;
  let planned = 0;
  for (let i = 0; i < 5; i++) {
    const ds = addDays_(monday, i);
    const items = [];
    PERIODS.forEach(p => {
      const st = status_(ctx, me.email, ds, p);
      if (!st) return;
      items.push({ period: p.short, code: st.code, label: st.label });
      if (st.code !== 'excused') planned++;
      if (st.code === 'present' || st.code === 'late') {
        done++;
        studyMin += minutes_(p.end) - minutes_(p.start);
      }
    });
    week.push({ date: ds, day: weekday_(ds), isToday: ds === today, closed: ctx.closed.has(ds), items });
  }
  const statsFrom = addDays_(today, -27);
  return {
    week, studyMin, done, planned,
    streak: streak_(ctx, me.email, today),
    stats: tally_(ctx, me.email, statsFrom, today),
  };
}

// ───────────────────────── 교사 API ─────────────────────────

function getRoster(ds, pid) {
  const me = requireTeacher_();
  if (!isDate_(ds)) throw new Error('날짜가 올바르지 않습니다.');
  const p = period_(pid);
  const ctx = context_();
  const sup = ctx.supervisors[ds] || '';
  const res = {
    date: ds, day: weekday_(ds), period: p,
    closed: ctx.closed.has(ds),
    supervisor: sup ? (ctx.teacherNames[sup] || sup) : '',
    canEdit: (me.isAdmin || (sup && sup === me.email)) && ds <= ctx.now.slice(0, 10),
    targets: [], absent: [],
  };
  if (res.closed) return res;
  ctx.students.forEach(s => {
    if (!ctx.schedule.has(key_(s.email, res.day, p.id))) return;
    const ex = excuse_(ctx, s.email, ds, p);
    if (ex) {
      const [, mo, d] = ymd_(ex.createdAt.slice(0, 10));
      res.absent.push({
        cls: s.cls, num: s.num, name: s.name, label: exLabel_(ex), detail: ex.detail,
        hasProof: !!ex.proof, time: `${mo}/${d} ${ex.createdAt.slice(11, 16)}`,
      });
    } else {
      res.targets.push({ email: s.email, cls: s.cls, num: s.num, name: s.name, mark: ctx.marks[key_(ds, p.id, s.email)] || '' });
    }
  });
  res.targets.sort(byClassNum_);
  res.absent.sort(byClassNum_);
  return res;
}

function checkEdit_(me, ctx, ds) {
  if (!me.isAdmin && ctx.supervisors[ds] !== me.email) throw new Error('이 날의 감독 교사만 출석을 체크할 수 있습니다.');
  if (ds > ctx.now.slice(0, 10)) throw new Error('미래 날짜는 체크할 수 없습니다.');
}

function upsertMarks_(me, ds, p, pairs) {
  const { sh, rows } = table_('attendance');
  const now = stamp_();
  const idx = {};
  rows.forEach(r => { if (r.v[0] === ds && pid_(r.v[1]) === p.id) idx[r.v[2].toLowerCase()] = r.row; });
  const appends = [];
  const deletes = [];
  pairs.forEach(([email, mark]) => {
    const row = idx[email];
    if (!mark) { if (row) deletes.push(row); return; }
    const data = [ds, p.name, email, mark, me.email, now];
    if (row) sh.getRange(row, 1, 1, data.length).setValues([data]);
    else appends.push(data);
  });
  appendRows_(sh, appends);
  deletes.sort((a, b) => b - a).forEach(r => sh.deleteRow(r));
}

/** mark: '출석' | '지각' | '미출석' | '' (체크 취소) */
function setAttendance(ds, pid, email, mark) {
  const me = requireTeacher_();
  const p = period_(pid);
  if (mark && MARKS.indexOf(mark) < 0) throw new Error('알 수 없는 상태입니다.');
  email = String(email).toLowerCase();
  return withLock_(() => {
    const ctx = context_();
    checkEdit_(me, ctx, ds);
    if (!ctx.schedule.has(key_(email, weekday_(ds), p.id)) || excuse_(ctx, email, ds, p)) {
      throw new Error('이 교시의 출석 대상이 아닙니다. 새로고침 하세요.');
    }
    upsertMarks_(me, ds, p, [[email, mark]]);
    return mark;
  });
}

function markAllPresent(ds, pid) {
  const me = requireTeacher_();
  const p = period_(pid);
  withLock_(() => {
    const ctx = context_();
    checkEdit_(me, ctx, ds);
    const pairs = ctx.students
      .filter(s => ctx.schedule.has(key_(s.email, weekday_(ds), p.id)) && !excuse_(ctx, s.email, ds, p) && !ctx.marks[key_(ds, p.id, s.email)])
      .map(s => [s.email, '출석']);
    upsertMarks_(me, ds, p, pairs);
  });
  return getRoster(ds, pid);
}

/** range: 'week' | 'month' | 'term'(학기: 3월 1일 또는 8월 1일부터) */
function getClassReport(cls, range) {
  const me = requireTeacher_();
  cls = String(cls);
  if (!me.isAdmin && String(me.homeroom) !== cls) throw new Error('담당 반만 조회할 수 있습니다.');
  const ctx = context_();
  const today = ctx.now.slice(0, 10);
  const [y, m] = ymd_(today);
  let from;
  if (range === 'week') from = mondayOf_(today);
  else if (range === 'month') from = today.slice(0, 8) + '01';
  else from = m >= 8 ? `${y}-08-01` : m >= 3 ? `${y}-03-01` : `${y - 1}-08-01`;

  const students = ctx.students.filter(s => String(s.cls) === cls).sort(byClassNum_);
  const rows = students.map(s => Object.assign({ num: s.num, name: s.name }, tally_(ctx, s.email, from, today)));
  const emails = {};
  students.forEach(s => { emails[s.email] = s; });
  const recent = [];
  Object.keys(ctx.exByDay).forEach(k => ctx.exByDay[k].forEach(ex => {
    const s = emails[ex.email];
    if (!s || ex.createdAt.slice(0, 10) < from) return;
    recent.push({ name: s.name, num: s.num, type: ex.type, label: exLabel_(ex), summary: exSummary_(ex), detail: ex.detail, date: ex.date, createdAt: ex.createdAt, proof: ex.proof });
  }));
  recent.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { cls, from, to: today, rows, recent: recent.slice(0, 30) };
}
