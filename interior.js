'use strict';

const KRW = new Intl.NumberFormat('ko-KR');
const INT_KEY = 'modern-interior-v1';
const INQ_KEY = 'bathroom_inquiries';

/* ════════════════════════════════════════
   평수별 공간 면적 (㎡)
════════════════════════════════════════ */
const SPACE_AREAS = {
  18: { livingRoom:18, kitchen:7,  masterBed:10, bed1:7,  bed2:0,  bathroom1:3.2, bathroom2:0,   entrance:2.5, balcony:4  },
  24: { livingRoom:25, kitchen:9,  masterBed:12, bed1:9,  bed2:0,  bathroom1:3.8, bathroom2:0,   entrance:3,   balcony:6  },
  32: { livingRoom:32, kitchen:11, masterBed:15, bed1:11, bed2:8,  bathroom1:4.2, bathroom2:3.0, entrance:3.5, balcony:8  },
  40: { livingRoom:40, kitchen:14, masterBed:18, bed1:13, bed2:10, bathroom1:5.0, bathroom2:3.5, entrance:4,   balcony:10 },
  50: { livingRoom:50, kitchen:17, masterBed:22, bed1:16, bed2:12, bathroom1:6.0, bathroom2:4.0, entrance:5,   balcony:12 },
};

/* ════════════════════════════════════════
   공간 목록
════════════════════════════════════════ */
const INT_SPACES = [
  { key:'livingRoom', label:'거실',   icon:'🛋️' },
  { key:'kitchen',    label:'주방',   icon:'🍳' },
  { key:'masterBed',  label:'안방',   icon:'🛏️' },
  { key:'bed1',       label:'침실 1', icon:'🛏️' },
  { key:'bed2',       label:'침실 2', icon:'🛏️', minSize:32 },
  { key:'bathroom1',  label:'욕실 1', icon:'🚿' },
  { key:'bathroom2',  label:'욕실 2', icon:'🚿', minSize:32 },
  { key:'entrance',   label:'현관',   icon:'🚪' },
  { key:'balcony',    label:'베란다', icon:'🌤️' },
];

/* ════════════════════════════════════════
   공사 항목 목록
   spaceFilter: 해당 공간이 하나라도 선택돼야 표시
   requireSpace: 특정 공간이 선택돼야만 표시
════════════════════════════════════════ */
const INT_WORKS = [
  // ── 마감 공사 (일괄 적용)
  {
    cat:'마감 공사', key:'flooring', icon:'🪵', label:'바닥재 일괄 시공',
    desc:'거실·주방·안방·침실 선택 공간 전체에 동일 자재 일괄 적용',
    spaceFilter:['livingRoom','kitchen','masterBed','bed1','bed2'],
  },
  {
    cat:'마감 공사', key:'wallpaper', icon:'📜', label:'도배 / 벽지 일괄',
    desc:'거실·주방·안방·침실·현관 선택 공간 전체에 동일 벽지 일괄 적용',
    spaceFilter:['livingRoom','kitchen','masterBed','bed1','bed2','entrance'],
  },
  {
    cat:'마감 공사', key:'lighting', icon:'💡', label:'조명 교체',
    desc:'선택된 공간별 조명 기구 교체 (공간 유형별 단가 자동 계산)',
    spaceFilter:'all',
  },
  // ── 공간별 공사
  {
    cat:'공간별 공사', key:'kitchenReno', icon:'🍳', label:'주방 리모델링',
    desc:'싱크대·수납장·상판 교체 (가전 별도)',
    requireSpace:'kitchen',
  },
  {
    cat:'공간별 공사', key:'bathroom1', icon:'🚿', label:'욕실 1 리모델링',
    desc:'타일·위생도기·설비 전체 교체 (상세 견적은 욕실 견적 앱 이용)',
    requireSpace:'bathroom1',
  },
  {
    cat:'공간별 공사', key:'bathroom2', icon:'🛁', label:'욕실 2 리모델링',
    desc:'타일·위생도기·설비 전체 교체 (상세 견적은 욕실 견적 앱 이용)',
    requireSpace:'bathroom2',
  },
  {
    cat:'공간별 공사', key:'entranceTile', icon:'🔲', label:'현관 바닥 타일',
    desc:'현관 바닥 포세린 타일 교체',
    requireSpace:'entrance',
  },
  {
    cat:'공간별 공사', key:'door', icon:'🚪', label:'중문 / 현관문 교체',
    desc:'중문 또는 현관문 신규 설치',
    requireSpace:'entrance',
  },
  {
    cat:'공간별 공사', key:'balconyFloor', icon:'🌤️', label:'베란다 바닥',
    desc:'베란다 바닥 타일 또는 방수마루 시공',
    requireSpace:'balcony',
  },
  {
    cat:'공간별 공사', key:'balconyExpand', icon:'⬛', label:'베란다 확장',
    desc:'창호 철거·단열재·바닥난방 포함 확장 공사',
    requireSpace:'balcony',
  },
  // ── 설비 공사
  {
    cat:'설비 공사', key:'sash', icon:'🪟', label:'샤시 / 창호 교체',
    desc:'알루미늄·로이유리·시스템창호 선택, 창 개수 입력',
  },
  {
    cat:'설비 공사', key:'demolition', icon:'🔨', label:'철거 공사',
    desc:'기존 도배·장판·마감재 철거 후 반출',
  },
  // ── 기타 공사
  {
    cat:'기타 공사', key:'cleaning', icon:'🧹', label:'입주 청소',
    desc:'공사 완료 후 이사 전 전문 업체 청소',
  },
  {
    cat:'기타 공사', key:'protection', icon:'🛡️', label:'보양 공사',
    desc:'공사 중 기존 바닥·엘리베이터·복도 보양지 설치',
  },
  {
    cat:'기타 공사', key:'elevator', icon:'🏢', label:'엘리베이터 사용료',
    desc:'공사 기간 중 이사용 엘리베이터 사용 비용 (일당 5만원)',
  },
  {
    cat:'기타 공사', key:'waste', icon:'🗑️', label:'폐기물 처리',
    desc:'공사 폐기물 수거·운반·처리 비용',
  },
];

/* ════════════════════════════════════════
   자재·등급 옵션 정의
════════════════════════════════════════ */
const WORK_DEFS = {
  flooring: {
    type:'combo',
    materialLabel:'바닥 자재',
    materials:[
      { value:'hdf',        label:'강화마루 (HDF) — 내구성 우수', def:true },
      { value:'engineered', label:'강마루 (합판마루) — 고급감' },
      { value:'lpl',        label:'LPL / 비닐마루 — 실속형' },
      { value:'pvc',        label:'PVC / LVT — 방수·관리 편리' },
    ],
    gradeLabel:'등급',
    grades:[
      { value:'basic',   label:'기본형' },
      { value:'mid',     label:'중급형', def:true },
      { value:'premium', label:'고급형' },
    ],
  },
  wallpaper: {
    type:'select', label:'벽지 자재',
    options:[
      { value:'hapji', label:'합지 벽지 — 실속형 (㎡당 약 12,000원)', def:true },
      { value:'silk',  label:'실크 벽지 — 내구성·청소 용이 (㎡당 약 24,000원)' },
      { value:'paint', label:'친환경 도배 페인트 — 모던·고급 (㎡당 약 17,000원)' },
    ],
  },
  lighting: {
    type:'select', label:'조명 등급',
    options:[
      { value:'basic',   label:'기본형 — LED 전구 교체 중심', def:true },
      { value:'mid',     label:'중급형 — 간접조명 + 포인트 조명 포함' },
      { value:'premium', label:'고급형 — 스마트조명 시스템 (IoT 연동)' },
    ],
  },
  kitchenReno: {
    type:'select', label:'리모델링 범위',
    options:[
      { value:'door',    label:'도어면만 교체 — 50~80만원' },
      { value:'partial', label:'부분 교체 — 상판+도어 교체 · 150~250만원', def:true },
      { value:'full',    label:'전면 교체 — 가구·상판 전체 · 400~800만원' },
    ],
  },
  bathroom1: {
    type:'select', label:'리모델링 등급',
    options:[
      { value:'basic',   label:'기본형 — 약 250만원~' },
      { value:'mid',     label:'중급형 — 약 450만원~', def:true },
      { value:'premium', label:'고급형 — 약 800만원~' },
    ],
  },
  bathroom2: {
    type:'select', label:'리모델링 등급',
    options:[
      { value:'basic',   label:'기본형 — 약 250만원~' },
      { value:'mid',     label:'중급형 — 약 450만원~', def:true },
      { value:'premium', label:'고급형 — 약 800만원~' },
    ],
  },
  entranceTile: {
    type:'select', label:'타일 등급',
    options:[
      { value:'basic',   label:'기본형 포세린 — 65,000원/㎡' },
      { value:'mid',     label:'중급형 포세린 — 95,000원/㎡', def:true },
      { value:'premium', label:'고급형 수입 타일 — 140,000원/㎡' },
    ],
  },
  door: {
    type:'select', label:'문 종류',
    options:[
      { value:'basic',   label:'기본형 중문 — 약 120만원~', def:true },
      { value:'mid',     label:'중급형 중문 (슬림형) — 약 200만원~' },
      { value:'premium', label:'고급형 현관문 교체 — 약 320만원~' },
    ],
  },
  balconyFloor: {
    type:'combo',
    materialLabel:'베란다 바닥 자재',
    materials:[
      { value:'tile', label:'포세린 타일', def:true },
      { value:'wood', label:'방수마루' },
    ],
    gradeLabel:'등급',
    grades:[
      { value:'basic',   label:'기본형' },
      { value:'mid',     label:'중급형', def:true },
      { value:'premium', label:'고급형' },
    ],
  },
  balconyExpand: {
    type:'select', label:'확장 범위',
    options:[
      { value:'basic',   label:'기본 확장 — 창호+단열 · 약 200만원~', def:true },
      { value:'premium', label:'고급 확장 — 창호+단열+바닥난방+방음 · 약 400만원~' },
    ],
  },
  sash: {
    type:'sash',
    label:'창호 종류',
    grades:[
      { value:'basic',   label:'일반 알루미늄 창호 — 약 50만원/창', def:true },
      { value:'mid',     label:'로이유리 창호 (단열 강화) — 약 80만원/창' },
      { value:'premium', label:'시스템 창호 (이중창·방음) — 약 150만원/창' },
    ],
  },
  demolition: {
    type:'select', label:'철거 범위',
    options:[
      { value:'partial', label:'마감재만 철거 — 도배·장판·몰딩', def:true },
      { value:'full',    label:'전체 철거 — 바닥·벽·천장 마감재 전부' },
    ],
  },
  cleaning: {
    type:'select', label:'청소 등급',
    options:[
      { value:'basic',   label:'기본 입주청소 — 약 30만원~' },
      { value:'mid',     label:'일반 입주청소 (전 공간) — 약 50만원~', def:true },
      { value:'premium', label:'프리미엄 입주청소 (창문·베란다 포함) — 약 80만원~' },
    ],
  },
  protection: {
    type:'select', label:'보양 범위',
    options:[
      { value:'basic', label:'기본 보양 — 복도·엘리베이터·계단 보양지', def:true },
      { value:'mid',   label:'전체 보양 — 공사 구역 전체 바닥·벽 보양지 설치' },
    ],
  },
  elevator: {
    type:'elevator',
  },
  waste: {
    type:'select', label:'처리 규모',
    options:[
      { value:'basic',   label:'소형 0.5톤 트럭 — 약 30만원' },
      { value:'mid',     label:'중형 1톤 트럭 — 약 60만원', def:true },
      { value:'premium', label:'대형 2.5톤 트럭 — 약 100만원' },
    ],
  },
};

/* ════════════════════════════════════════
   비용 계산
════════════════════════════════════════ */
function calcWorkCost(workKey, grade, state) {
  const aptSize = parseInt(state.info?.aptSize || 24);
  const areas   = SPACE_AREAS[aptSize] || SPACE_AREAS[24];

  switch (workKey) {
    case 'flooring': {
      const floorRooms = ['livingRoom','kitchen','masterBed','bed1','bed2'];
      const totalArea  = floorRooms.filter(s => state.spaces[s]).reduce((sum, s) => sum + (areas[s] || 0), 0);
      if (!totalArea) return 0;
      const { material='hdf', level='mid' } = (typeof grade === 'object' && grade) ? grade : {};
      const rates = {
        hdf:        { basic:38000, mid:58000, premium:88000  },
        engineered: { basic:58000, mid:80000, premium:118000 },
        lpl:        { basic:30000, mid:46000, premium:68000  },
        pvc:        { basic:22000, mid:36000, premium:54000  },
      };
      return Math.round(totalArea * ((rates[material] || rates.hdf)[level] || 58000));
    }
    case 'wallpaper': {
      const paperRooms    = ['livingRoom','kitchen','masterBed','bed1','bed2','entrance'];
      const totalWallArea = paperRooms.filter(s => state.spaces[s]).reduce((sum, s) => sum + (areas[s] || 0) * 2.5, 0);
      if (!totalWallArea) return 0;
      const rates = { hapji:12000, silk:24000, paint:17000 };
      return Math.round(totalWallArea * (rates[grade] || 12000));
    }
    case 'lighting': {
      const lightRates = {
        livingRoom: { basic:300000, mid:580000,  premium:1100000 },
        kitchen:    { basic:150000, mid:280000,  premium:520000  },
        masterBed:  { basic:100000, mid:210000,  premium:400000  },
        bed1:       { basic:80000,  mid:170000,  premium:320000  },
        bed2:       { basic:80000,  mid:170000,  premium:320000  },
        bathroom1:  { basic:50000,  mid:100000,  premium:200000  },
        bathroom2:  { basic:50000,  mid:100000,  premium:200000  },
        entrance:   { basic:50000,  mid:110000,  premium:220000  },
        balcony:    { basic:40000,  mid:80000,   premium:160000  },
      };
      return Object.keys(lightRates)
        .filter(s => state.spaces[s])
        .reduce((sum, s) => sum + ((lightRates[s][grade] || lightRates[s].basic) || 0), 0);
    }
    case 'kitchenReno':  return { door:650000,    partial:2000000, full:5500000 }[grade] || 2000000;
    case 'bathroom1':    return { basic:2500000,   mid:4500000,   premium:8000000 }[grade] || 4500000;
    case 'bathroom2':    return { basic:2500000,   mid:4500000,   premium:8000000 }[grade] || 4500000;
    case 'entranceTile': return Math.round((areas.entrance || 3) * ({ basic:65000, mid:95000, premium:140000 }[grade] || 95000));
    case 'door':         return { basic:1200000, mid:2000000, premium:3200000 }[grade] || 1200000;
    case 'balconyFloor': {
      const { material='tile', level='mid' } = (typeof grade === 'object' && grade) ? grade : {};
      const rates = {
        tile: { basic:55000, mid:82000, premium:125000 },
        wood: { basic:42000, mid:62000, premium:95000  },
      };
      return Math.round((areas.balcony || 6) * ((rates[material] || rates.tile)[level] || 82000));
    }
    case 'balconyExpand': return { basic:2000000, premium:4000000 }[grade] || 2000000;
    case 'sash': {
      const { level='basic', count=5 } = (typeof grade === 'object' && grade) ? grade : {};
      return ({ basic:500000, mid:800000, premium:1500000 }[level] || 500000) * Math.max(1, parseInt(count) || 5);
    }
    case 'demolition': {
      const totalArea = Object.entries(areas).filter(([k]) => state.spaces[k]).reduce((s, [,a]) => s + a, 0) || 50;
      return Math.round(totalArea * ({ partial:18000, full:38000 }[grade] || 18000));
    }
    case 'cleaning':   return { basic:300000, mid:500000, premium:800000 }[grade] || 500000;
    case 'protection': {
      const totalArea = Object.values(areas).reduce((s, a) => s + (a || 0), 0);
      return Math.round(totalArea * ({ basic:4000, mid:7000 }[grade] || 4000));
    }
    case 'elevator': {
      const { days=3 } = (typeof grade === 'object' && grade) ? grade : {};
      return 50000 * Math.max(1, parseInt(days) || 3);
    }
    case 'waste': return { basic:300000, mid:600000, premium:1000000 }[grade] || 600000;
    default: return 0;
  }
}

function isWorkAvailable(work, state) {
  if (work.requireSpace) return !!state.spaces[work.requireSpace];
  if (!work.spaceFilter || work.spaceFilter === 'all') return true;
  return work.spaceFilter.some(s => state.spaces[s]);
}

function getDefaultGrade(def) {
  if (!def) return null;
  if (def.type === 'select')   return def.options.find(o => o.def)?.value || def.options[0]?.value;
  if (def.type === 'combo')    return { material: def.materials.find(m => m.def)?.value || def.materials[0]?.value, level: def.grades.find(g => g.def)?.value || def.grades[0]?.value };
  if (def.type === 'sash')     return { level: def.grades.find(g => g.def)?.value || 'basic', count: 5 };
  if (def.type === 'elevator') return { days: 3 };
  return null;
}

/* ════════════════════════════════════════
   State
════════════════════════════════════════ */
function defaultState() { return { step:1, info:{}, spaces:{}, works:{}, grades:{} }; }
let intState = (() => {
  try { return JSON.parse(localStorage.getItem(INT_KEY) || 'null') || defaultState(); }
  catch { return defaultState(); }
})();
function saveState() { localStorage.setItem(INT_KEY, JSON.stringify(intState)); }

/* ════════════════════════════════════════
   Step navigation
════════════════════════════════════════ */
let currentStep = 1;
function goToStep(n) {
  currentStep = n; intState.step = n; saveState();
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-step-panel="${n}"]`)?.classList.add('active');
  document.querySelectorAll('#intStepNav li').forEach(li => {
    const s = parseInt(li.dataset.step);
    li.className = s < n ? 'done' : s === n ? 'active' : '';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (n === 2) renderSpaces();
  if (n === 3) renderWorksAndGrades();
  if (n === 4) renderEstimate();
  updateSummary();
}

/* ════════════════════════════════════════
   Step 2: 공간 선택
════════════════════════════════════════ */
function renderSpaces() {
  const aptSize = parseInt(document.getElementById('intAptSize')?.value || intState.info?.aptSize || 24);
  const areas   = SPACE_AREAS[aptSize] || SPACE_AREAS[24];
  const wrap    = document.getElementById('intSpacesGrid');

  wrap.innerHTML = INT_SPACES.map(sp => {
    if (sp.minSize && aptSize < sp.minSize) return '';
    const area = areas[sp.key];
    if (!area) return '';
    const sel = !!intState.spaces[sp.key];
    return `<label class="int-space-card ${sel ? 'selected' : ''}">
      <input type="checkbox" class="int-space-chk" data-space="${sp.key}" ${sel ? 'checked' : ''} />
      <span class="int-space-icon">${sp.icon}</span>
      <span class="int-space-title">${sp.label}</span>
      <span class="int-space-area">약 ${area}㎡</span>
    </label>`;
  }).filter(Boolean).join('');

  wrap.querySelectorAll('.int-space-chk').forEach(cb => {
    cb.addEventListener('change', () => {
      intState.spaces[cb.dataset.space] = cb.checked;
      cb.closest('.int-space-card').classList.toggle('selected', cb.checked);
      updateSummary(); saveState();
    });
  });
}

/* ════════════════════════════════════════
   Step 3: 공사 항목 + 자재
════════════════════════════════════════ */
function areaHintText(workKey, state) {
  const aptSize = parseInt(state.info?.aptSize || 24);
  const areas   = SPACE_AREAS[aptSize] || SPACE_AREAS[24];
  if (workKey === 'flooring') {
    const total = ['livingRoom','kitchen','masterBed','bed1','bed2'].filter(s => state.spaces[s]).reduce((sum, s) => sum + (areas[s] || 0), 0);
    return total ? `적용 면적 합산: ${total}㎡` : '(공간 선택 없음)';
  }
  if (workKey === 'wallpaper') {
    const total = ['livingRoom','kitchen','masterBed','bed1','bed2','entrance'].filter(s => state.spaces[s]).reduce((sum, s) => sum + (areas[s] || 0) * 2.5, 0);
    return total ? `적용 벽면 합산: 약 ${Math.round(total)}㎡` : '(공간 선택 없음)';
  }
  if (workKey === 'lighting') {
    const cnt = INT_SPACES.filter(sp => state.spaces[sp.key]).length;
    return cnt ? `선택된 공간 ${cnt}곳 일괄` : '(공간 선택 없음)';
  }
  return '';
}

function gradeOptionsHtml(key, def, curGrade) {
  if (!def) return '';
  if (def.type === 'select') {
    const cur = (typeof curGrade === 'string') ? curGrade : (getDefaultGrade(def) || '');
    return `<label class="int-opt-label">${def.label || '옵션'}
      <select class="int-opt-sel int-grade-sel" data-key="${key}">
        ${def.options.map(o => `<option value="${o.value}" ${cur === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
      </select></label>`;
  }
  if (def.type === 'combo') {
    const cG  = (typeof curGrade === 'object' && curGrade) ? curGrade : {};
    const mat = cG.material || def.materials.find(m => m.def)?.value || def.materials[0].value;
    const lvl = cG.level    || def.grades.find(g => g.def)?.value   || def.grades[0].value;
    return `<div class="grid two">
      <label class="int-opt-label">${def.materialLabel}
        <select class="int-opt-sel int-grade-mat" data-key="${key}">
          ${def.materials.map(m => `<option value="${m.value}" ${mat === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select></label>
      <label class="int-opt-label">${def.gradeLabel}
        <select class="int-opt-sel int-grade-lvl" data-key="${key}">
          ${def.grades.map(g => `<option value="${g.value}" ${lvl === g.value ? 'selected' : ''}>${g.label}</option>`).join('')}
        </select></label>
    </div>`;
  }
  if (def.type === 'sash') {
    const cG  = (typeof curGrade === 'object' && curGrade) ? curGrade : {};
    const lvl = cG.level || 'basic';
    const cnt = cG.count || 5;
    return `<div class="grid two">
      <label class="int-opt-label">${def.label}
        <select class="int-opt-sel int-sash-lvl" data-key="${key}">
          ${def.grades.map(g => `<option value="${g.value}" ${lvl === g.value ? 'selected' : ''}>${g.label}</option>`).join('')}
        </select></label>
      <label class="int-opt-label">창 개수
        <input type="number" class="int-opt-inp int-sash-cnt" data-key="${key}" min="1" max="30" value="${cnt}" />
      </label></div>`;
  }
  if (def.type === 'elevator') {
    const days = ((typeof curGrade === 'object' && curGrade) ? curGrade : {}).days || 3;
    return `<label class="int-opt-label">사용 일수 (일당 50,000원)
      <input type="number" class="int-opt-inp int-elev-days" data-key="${key}" min="1" max="30" value="${days}" style="max-width:140px" />
    </label>`;
  }
  return '';
}

function workCardHtml(w) {
  const def       = WORK_DEFS[w.key];
  const isChecked = !!intState.works[w.key];
  const curGrade  = intState.grades[w.key] || getDefaultGrade(def);
  const hint      = areaHintText(w.key, intState);
  const descFull  = hint ? `${w.desc}<br><em style="color:var(--brand);font-weight:700">${hint}</em>` : w.desc;
  const priceStr  = isChecked ? KRW.format(calcWorkCost(w.key, curGrade, intState)) + '원' : '';

  return `<div class="int-work-item ${isChecked ? 'selected' : ''}" data-work-key="${w.key}">
    <label class="int-work-header">
      <input type="checkbox" class="int-work-chk" data-key="${w.key}" ${isChecked ? 'checked' : ''} />
      <span class="int-work-emoji">${w.icon}</span>
      <span class="int-work-text">
        <span class="int-work-name">${w.label}</span>
        <span class="int-work-desc">${descFull}</span>
      </span>
      <span class="int-work-price" id="wp-${w.key}">${priceStr}</span>
    </label>
    <div class="int-work-options">
      ${gradeOptionsHtml(w.key, def, curGrade)}
    </div>
  </div>`;
}

function renderWorksAndGrades() {
  const wrap       = document.getElementById('intGradeWrap');
  const available  = INT_WORKS.filter(w => isWorkAvailable(w, intState));
  if (!available.length) {
    wrap.innerHTML = '<p class="muted" style="padding:24px;text-align:center">STEP 2에서 공간을 먼저 선택해주세요.</p>';
    return;
  }
  const cats = [...new Set(available.map(w => w.cat))];
  wrap.innerHTML = cats.map(cat => {
    const catWorks = available.filter(w => w.cat === cat);
    return `<div style="margin-bottom:24px">
      <p class="int-cat-title">${cat}</p>
      <div style="display:flex;flex-direction:column;gap:10px">${catWorks.map(w => workCardHtml(w)).join('')}</div>
    </div>`;
  }).join('');
  bindWorkEvents(wrap);
}

function bindWorkEvents(wrap) {
  wrap.querySelectorAll('.int-work-chk').forEach(cb => {
    cb.addEventListener('change', () => {
      const key = cb.dataset.key;
      intState.works[key] = cb.checked;
      if (cb.checked && !intState.grades[key]) intState.grades[key] = getDefaultGrade(WORK_DEFS[key]);
      saveState(); updateSummary();
      // 해당 카드만 재렌더
      const item = cb.closest('.int-work-item');
      const w = INT_WORKS.find(x => x.key === key);
      if (item && w) {
        const tmp = document.createElement('div');
        tmp.innerHTML = workCardHtml(w);
        const newCard = tmp.firstElementChild;
        item.replaceWith(newCard);
        bindCardEvents(newCard);
      }
    });
  });
  wrap.querySelectorAll('.int-work-item').forEach(card => bindCardEvents(card));
}

function bindCardEvents(card) {
  const key = card.dataset.workKey;
  const update = (field, val) => {
    if (field === 'value') {
      intState.grades[key] = val;
    } else {
      if (typeof intState.grades[key] !== 'object' || !intState.grades[key]) intState.grades[key] = {};
      intState.grades[key][field] = val;
    }
    saveState(); updateSummary();
    const priceEl = document.getElementById(`wp-${key}`);
    if (priceEl && intState.works[key]) {
      priceEl.textContent = KRW.format(calcWorkCost(key, intState.grades[key], intState)) + '원';
    }
  };
  card.querySelector('.int-grade-sel')?.addEventListener('change', function () { update('value', this.value); });
  card.querySelector('.int-grade-mat')?.addEventListener('change', function () { update('material', this.value); });
  card.querySelector('.int-grade-lvl')?.addEventListener('change', function () { update('level', this.value); });
  card.querySelector('.int-sash-lvl')?.addEventListener('change', function () { update('level', this.value); });
  card.querySelector('.int-sash-cnt')?.addEventListener('change', function () { update('count', parseInt(this.value) || 5); });
  card.querySelector('.int-elev-days')?.addEventListener('change', function () { update('days', parseInt(this.value) || 3); });
}

/* ════════════════════════════════════════
   비용 계산 통합
════════════════════════════════════════ */
function calcAllCosts() {
  const items = [];
  INT_WORKS.forEach(w => {
    if (!intState.works[w.key] || !isWorkAvailable(w, intState)) return;
    const grade  = intState.grades[w.key] || getDefaultGrade(WORK_DEFS[w.key]);
    const amount = calcWorkCost(w.key, grade, intState);
    if (amount > 0) items.push({ cat:w.cat, key:w.key, icon:w.icon, label:w.label, amount });
  });
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const reserve  = Math.round(subtotal * 0.05);
  return { items, subtotal, reserve, total: subtotal + reserve };
}

/* ════════════════════════════════════════
   사이드바 요약
════════════════════════════════════════ */
function updateSummary() {
  const { items, total } = calcAllCosts();
  const el = document.getElementById('intSummary');
  if (!items.length) {
    el.innerHTML = '<p class="muted" style="font-size:.85rem;padding:8px 0;line-height:1.6">공간과 공사 항목을<br>선택하면 비용이 표시됩니다.</p>';
    return;
  }
  const cats = [...new Set(items.map(i => i.cat))];
  let html = '<div style="display:flex;flex-direction:column;gap:12px;font-size:.83rem">';
  cats.forEach(cat => {
    const ci = items.filter(i => i.cat === cat);
    html += `<div><div style="font-size:.7rem;font-weight:800;color:var(--muted);letter-spacing:.06em;margin-bottom:5px">${cat.toUpperCase()}</div>
      ${ci.map(i => `<div style="display:flex;justify-content:space-between;gap:6px;margin-bottom:3px">
        <span style="color:var(--muted)">${i.icon} ${i.label}</span>
        <strong>${KRW.format(i.amount)}원</strong>
      </div>`).join('')}</div>`;
  });
  html += '</div>';
  html += `<div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--line);display:flex;justify-content:space-between;align-items:center">
    <span style="font-weight:800">합계</span>
    <strong style="font-size:1.1rem;color:var(--brand)">${KRW.format(total)}원</strong>
  </div>
  <p style="font-size:.73rem;color:var(--muted);margin-top:8px;line-height:1.5">현장 상황에 따라 실제 금액이 변동될 수 있습니다.</p>`;
  el.innerHTML = html;
}

/* ════════════════════════════════════════
   Step 4: 최종 견적서
════════════════════════════════════════ */
function renderEstimate() {
  const info = intState.info;
  const { items, subtotal, reserve, total } = calcAllCosts();
  const scopeMap = { full:'전체 리모델링', partial:'부분 리모델링', refresh:'간단 새단장' };
  const cats = [...new Set(items.map(i => i.cat))];

  let tableRows = '';
  cats.forEach(cat => {
    const ci = items.filter(i => i.cat === cat);
    const catTotal = ci.reduce((s, i) => s + i.amount, 0);
    tableRows += `<tr><td colspan="2" style="background:#f6f9ff;font-size:.76rem;font-weight:800;letter-spacing:.05em;color:var(--muted);padding:9px 14px">${cat.toUpperCase()}</td></tr>`;
    ci.forEach(i => {
      tableRows += `<tr><td style="padding-left:22px">${i.icon} ${i.label}</td><td style="text-align:right">${KRW.format(i.amount)}원</td></tr>`;
    });
    tableRows += `<tr style="background:#f9fbff"><td style="padding-left:22px;font-weight:700;font-size:.84rem;color:var(--brand)">소계</td><td style="text-align:right;font-weight:700;font-size:.84rem;color:var(--brand)">${KRW.format(catTotal)}원</td></tr>`;
  });

  // 선택 공간 표시
  const selectedSpaces = INT_SPACES.filter(sp => intState.spaces[sp.key]).map(sp => `${sp.icon} ${sp.label}`).join(' / ');

  document.getElementById('intEstimateDoc').innerHTML = `
    <div style="border:1px solid var(--line);border-radius:16px;overflow:hidden">
      <div style="background:#162033;color:#fff;padding:22px 28px">
        <h2 style="font-size:1.3rem;font-weight:900;margin:0 0 4px">종합 인테리어 견적서</h2>
        <p style="color:rgba(255,255,255,.6);font-size:.85rem;margin:0">Modern Interior · 발행일 ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      <div style="padding:22px 28px;background:#fafbff;border-bottom:1px solid var(--line)">
        <div class="grid two" style="gap:10px;font-size:.9rem">
          <div><span style="color:var(--muted)">고객명</span>&nbsp;&nbsp;<strong>${info.customerName||'—'}</strong></div>
          <div><span style="color:var(--muted)">연락처</span>&nbsp;&nbsp;<strong>${info.phone||'—'}</strong></div>
          <div><span style="color:var(--muted)">현장명</span>&nbsp;&nbsp;<strong>${info.projectName||'—'}</strong></div>
          <div><span style="color:var(--muted)">평수</span>&nbsp;&nbsp;<strong>${info.aptSize||'—'}평대</strong></div>
          <div style="grid-column:span 2"><span style="color:var(--muted)">주소</span>&nbsp;&nbsp;<strong>${info.address||'—'}</strong></div>
          <div><span style="color:var(--muted)">공사 범위</span>&nbsp;&nbsp;<strong>${scopeMap[info.scope]||'—'}</strong></div>
          ${info.start ? `<div><span style="color:var(--muted)">시작일</span>&nbsp;&nbsp;<strong>${info.start}</strong></div>` : ''}
          ${info.end   ? `<div><span style="color:var(--muted)">종료일</span>&nbsp;&nbsp;<strong>${info.end}</strong></div>`   : ''}
        </div>
        ${selectedSpaces ? `<div style="margin-top:12px;font-size:.84rem"><span style="color:var(--muted)">시공 공간</span>&nbsp;&nbsp;<strong>${selectedSpaces}</strong></div>` : ''}
      </div>
      <div style="padding:22px 28px">
        <table class="est-table" style="margin-bottom:0">
          <thead><tr><th>공사 항목</th><th style="text-align:right">금액</th></tr></thead>
          <tbody>${tableRows}</tbody>
          <tfoot>
            ${reserve ? `<tr><td style="color:var(--muted);font-size:.88rem">예비비 (5%)</td><td style="text-align:right;color:var(--muted);font-size:.88rem">${KRW.format(reserve)}원</td></tr>` : ''}
            <tr style="background:#e8f0ff">
              <td style="font-size:1.05rem;font-weight:900;color:var(--brand)">최 종 합 계</td>
              <td style="text-align:right;font-size:1.05rem;font-weight:900;color:var(--brand)">${KRW.format(total)}원</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    <div style="margin-top:16px;background:#fffbeb;border:1.5px solid #fde68a;border-radius:12px;padding:18px 20px">
      <p style="font-weight:800;font-size:.95rem;color:#92400e;margin:0 0 10px">📋 참고사항</p>
      <ul style="margin:0;padding-left:18px;color:#78350f;font-size:.85rem;line-height:1.9">
        <li>본 견적서는 참고용 추정 금액이며, 정확한 금액은 현장 방문 후 확정됩니다.</li>
        <li>현장 조건(누수·방수·배관 노후 등)에 따라 추가 비용이 발생할 수 있습니다.</li>
        <li>가구·가전·커튼 비용은 포함되지 않습니다.</li>
        <li>욕실 정밀 견적은 별도 욕실 견적 앱(🛁)을 이용해 주세요.</li>
        <li>샤시·확장 공사는 아파트 단지 규정 확인 후 진행해 주세요.</li>
      </ul>
    </div>`;
}

/* ════════════════════════════════════════
   문의 모달
════════════════════════════════════════ */
function showInquiryModal() {
  const info = intState.info;
  const { total } = calcAllCosts();
  const spaceList = INT_SPACES.filter(sp => intState.spaces[sp.key]).map(sp => `${sp.icon}${sp.label}`).join(' ');
  const workList  = INT_WORKS.filter(w => intState.works[w.key]).map(w => w.label).join(', ');
  document.getElementById('intInqBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:.9rem">
      <div style="display:flex;justify-content:space-between"><span class="muted">견적 유형</span><strong>🏠 종합인테리어</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">고객명</span><strong>${info.customerName||'—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">연락처</span><strong>${info.phone||'—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">현장명</span><strong>${info.projectName||'—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">평수</span><strong>${info.aptSize||'—'}평대</strong></div>
      <div style="display:flex;justify-content:space-between;gap:8px"><span class="muted">시공 공간</span><strong style="text-align:right">${spaceList||'—'}</strong></div>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><span class="muted">공사 항목</span><strong style="text-align:right;max-width:240px;font-size:.82rem">${workList||'—'}</strong></div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--line)">
        <span class="muted">견적 총액</span>
        <strong style="color:var(--brand);font-size:1.05rem">${KRW.format(total)}원</strong>
      </div>
    </div>`;
  document.getElementById('intInquiryModal').classList.remove('hidden');
}

function submitInquiry() {
  const info = intState.info;
  const { total } = calcAllCosts();
  const list = JSON.parse(localStorage.getItem(INQ_KEY) || '[]');
  list.push({
    estimateType: 'interior',
    customer: { customerName:info.customerName||'', phone:info.phone||'', projectName:info.projectName||'', address:info.address||'', aptSize:info.aptSize||'', scope:info.scope||'' },
    totalEstimate: total,
    status: 'new',
    submittedAt: new Date().toISOString(),
    id: Date.now().toString(),
  });
  localStorage.setItem(INQ_KEY, JSON.stringify(list));
  document.getElementById('intInquiryModal').classList.add('hidden');
  const toast = document.getElementById('intToast');
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3200);
}

/* ════════════════════════════════════════
   초기화
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // 단계 네비게이션
  document.querySelectorAll('#intStepNav li').forEach(li => {
    li.addEventListener('click', () => { if (parseInt(li.dataset.step) < currentStep) goToStep(parseInt(li.dataset.step)); });
  });
  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prevStep)));
  });

  // STEP 1 → 2
  document.getElementById('intStep1Next').addEventListener('click', () => {
    intState.info = {
      customerName: document.getElementById('intCustomerName').value.trim(),
      phone:        document.getElementById('intPhone').value.trim(),
      projectName:  document.getElementById('intProjectName').value.trim(),
      address:      document.getElementById('intAddress').value.trim(),
      aptSize:      document.getElementById('intAptSize').value,
      scope:        document.getElementById('intScope').value,
      start:        document.getElementById('intStart').value,
      end:          document.getElementById('intEnd').value,
      budget:       document.getElementById('intBudget').value,
    };
    saveState(); goToStep(2);
  });

  // STEP 2 → 3
  document.getElementById('intStep2Next').addEventListener('click', () => {
    if (!INT_SPACES.some(sp => intState.spaces[sp.key])) { alert('공간을 하나 이상 선택해주세요.'); return; }
    goToStep(3);
  });

  // STEP 3 → 4
  document.getElementById('intStep3Next').addEventListener('click', () => {
    if (!INT_WORKS.some(w => intState.works[w.key])) { alert('공사 항목을 하나 이상 선택해주세요.'); return; }
    goToStep(4);
  });

  document.getElementById('intPrintBtn').addEventListener('click', () => window.print());
  document.getElementById('intInquiryBtn').addEventListener('click', showInquiryModal);
  document.getElementById('intInqClose').addEventListener('click', () => document.getElementById('intInquiryModal').classList.add('hidden'));
  document.getElementById('intInqCancel').addEventListener('click', () => document.getElementById('intInquiryModal').classList.add('hidden'));
  document.getElementById('intInqBackdrop').addEventListener('click', () => document.getElementById('intInquiryModal').classList.add('hidden'));
  document.getElementById('intInqSubmit').addEventListener('click', submitInquiry);

  document.getElementById('intResetBtn').addEventListener('click', () => {
    if (!confirm('견적을 초기화할까요?')) return;
    localStorage.removeItem(INT_KEY);
    intState = defaultState(); currentStep = 1;
    ['intCustomerName','intPhone','intProjectName','intAddress','intStart','intEnd','intBudget']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    goToStep(1);
  });

  // 저장된 상태 복원
  const fi = intState.info;
  if (fi.customerName) document.getElementById('intCustomerName').value = fi.customerName;
  if (fi.phone)        document.getElementById('intPhone').value        = fi.phone;
  if (fi.projectName)  document.getElementById('intProjectName').value  = fi.projectName;
  if (fi.address)      document.getElementById('intAddress').value      = fi.address;
  if (fi.aptSize)      document.getElementById('intAptSize').value      = fi.aptSize;
  if (fi.scope)        document.getElementById('intScope').value        = fi.scope;
  if (fi.start)        document.getElementById('intStart').value        = fi.start;
  if (fi.end)          document.getElementById('intEnd').value          = fi.end;
  if (fi.budget)       document.getElementById('intBudget').value       = fi.budget;

  updateSummary();
  const savedStep = intState.step || 1;
  if (savedStep > 1) goToStep(savedStep);
  else renderSpaces();
});
