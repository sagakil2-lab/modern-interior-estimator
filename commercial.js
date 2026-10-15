'use strict';

const KRW = new Intl.NumberFormat('ko-KR');
const COM_KEY = 'modern-commercial-v1';
const INQ_KEY = 'bathroom_inquiries';

const SHOP_TYPES = {
  restaurant: '음식점', cafe: '카페', salon: '미용실',
  office: '사무실', retail: '소매점', etc: '기타',
};

const COM_ITEMS = [
  { key: 'demolition', icon: '🔨', label: '철거 공사',    desc: '기존 시설 해체·철거·폐기물 처리' },
  { key: 'flooring',   icon: '🪵', label: '바닥 공사',    desc: 'PVC·마루·포세린타일 바닥재 시공' },
  { key: 'wall',       icon: '🧱', label: '벽체 공사',    desc: '도장·도배지·타일 벽 마감 처리' },
  { key: 'ceiling',    icon: '🏠', label: '천장 공사',    desc: 'PVC·석고보드·루버·LED 천장재' },
  { key: 'electrical', icon: '💡', label: '전기/조명',    desc: '전기 배선·콘센트·조명 기구 설치' },
  { key: 'plumbing',   icon: '🚿', label: '설비/배관',    desc: '급배수·화장실·세면대·싱크 설비' },
  { key: 'glass',      icon: '🪟', label: '유리/파티션',  desc: '강화유리칸막이·파티션 설치' },
  { key: 'door',       icon: '🚪', label: '문/창호',      desc: '출입문·창문·중문 교체·설치' },
];

// 비용 계산
function calcComItem(key, grade, area) {
  switch (key) {
    case 'demolition': {
      const rates = { partial: 25000, full: 45000, complete: 60000 };
      return Math.round(area * (rates[grade] || 45000));
    }
    case 'flooring': {
      const { material = 'pvc', level = 'mid' } = (typeof grade === 'object') ? grade : {};
      const rates = {
        pvc:  { basic: 35000, mid: 52000, premium: 72000 },
        wood: { basic: 55000, mid: 78000, premium: 115000 },
        tile: { basic: 65000, mid: 92000, premium: 138000 },
      };
      return Math.round(area * ((rates[material] || rates.pvc)[level] || 52000));
    }
    case 'wall': {
      const { material = 'wallpaper', level = 'mid' } = (typeof grade === 'object') ? grade : {};
      const wallArea = area * 2.8;
      const rates = {
        paint:     { basic: 10000, mid: 16000, premium: 26000 },
        wallpaper: { basic: 18000, mid: 27000, premium: 40000 },
        tile:      { basic: 55000, mid: 82000, premium: 125000 },
      };
      return Math.round(wallArea * ((rates[material] || rates.wallpaper)[level] || 27000));
    }
    case 'ceiling': {
      const rates = { basic: 20000, mid: 36000, premium: 60000 };
      return Math.round(area * (rates[grade] || 36000));
    }
    case 'electrical': {
      const base = { basic: 1500000, mid: 2500000, premium: 4200000 }[grade] || 2500000;
      return Math.round(base * Math.max(1, area / 30));
    }
    case 'plumbing': {
      return { basic: 1000000, mid: 2000000, premium: 3500000 }[grade] || 1000000;
    }
    case 'glass': {
      return { basic: 280000, mid: 520000, premium: 900000 }[grade] || 280000;
    }
    case 'door': {
      const { level = 'basic', count = 1 } = (typeof grade === 'object') ? grade : {};
      return ({ basic: 350000, mid: 600000, premium: 950000 }[level] || 350000) * Math.max(1, parseInt(count) || 1);
    }
    default: return 0;
  }
}

const GRADE_DEFS = {
  demolition: {
    type: 'select',
    options: [
      { value: 'partial',  label: '부분 철거 (기존 마감재만 제거) — 25,000원/㎡' },
      { value: 'full',     label: '일반 철거 (바닥·벽·천장) — 45,000원/㎡', def: true },
      { value: 'complete', label: '완전 철거 (골조까지) — 60,000원/㎡' },
    ],
  },
  flooring: {
    type: 'combo',
    materialLabel: '바닥 자재',
    materials: [
      { value: 'pvc',  label: 'PVC / LVT', def: true },
      { value: 'wood', label: '마루 (합판/강마루)' },
      { value: 'tile', label: '포세린 타일' },
    ],
    gradeLabel: '등급',
    grades: [
      { value: 'basic',   label: '기본형' },
      { value: 'mid',     label: '중급형', def: true },
      { value: 'premium', label: '고급형' },
    ],
  },
  wall: {
    type: 'combo',
    materialLabel: '벽 마감 자재',
    materials: [
      { value: 'paint',     label: '도장 (페인트)' },
      { value: 'wallpaper', label: '도배지', def: true },
      { value: 'tile',      label: '타일' },
    ],
    gradeLabel: '등급',
    grades: [
      { value: 'basic',   label: '기본형' },
      { value: 'mid',     label: '중급형', def: true },
      { value: 'premium', label: '고급형' },
    ],
  },
  ceiling: {
    type: 'select',
    options: [
      { value: 'basic',   label: '기본형 (PVC 천장재) — 20,000원/㎡' },
      { value: 'mid',     label: '중급형 (석고보드/루버) — 36,000원/㎡', def: true },
      { value: 'premium', label: '고급형 (알루미늄/LED 일체) — 60,000원/㎡' },
    ],
  },
  electrical: {
    type: 'select',
    options: [
      { value: 'basic',   label: '기본형 — 30㎡ 기준 약 150만원~' },
      { value: 'mid',     label: '중급형 — 30㎡ 기준 약 250만원~', def: true },
      { value: 'premium', label: '고급형 (스마트조명 포함) — 30㎡ 기준 약 420만원~' },
    ],
  },
  plumbing: {
    type: 'select',
    options: [
      { value: 'basic',   label: '기본형 (화장실 1개) — 약 100만원~', def: true },
      { value: 'mid',     label: '중급형 (화장실 2개) — 약 200만원~' },
      { value: 'premium', label: '고급형 (화장실+주방싱크 포함) — 약 350만원~' },
    ],
  },
  glass: {
    type: 'select',
    options: [
      { value: 'basic',   label: '기본형 (반강화유리) — 약 28만원~', def: true },
      { value: 'mid',     label: '중급형 (강화유리+프레임) — 약 52만원~' },
      { value: 'premium', label: '고급형 (무프레임 강화) — 약 90만원~' },
    ],
  },
  door: {
    type: 'door',
    grades: [
      { value: 'basic',   label: '기본형 — 35만원/개', def: true },
      { value: 'mid',     label: '중급형 — 60만원/개' },
      { value: 'premium', label: '고급형 — 95만원/개' },
    ],
  },
};

// ─── State ───
function defaultState() {
  return { step: 1, info: {}, selected: {}, grades: {} };
}
let comState = (() => {
  try { return JSON.parse(localStorage.getItem(COM_KEY) || 'null') || defaultState(); }
  catch { return defaultState(); }
})();

function saveState() { localStorage.setItem(COM_KEY, JSON.stringify(comState)); }

// ─── Step navigation ───
let currentStep = 1;
function goToStep(n) {
  currentStep = n;
  comState.step = n;
  saveState();
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.querySelector(`[data-step-panel="${n}"]`);
  if (panel) panel.classList.add('active');
  document.querySelectorAll('#stepNav li').forEach(li => {
    const s = parseInt(li.dataset.step);
    li.className = s < n ? 'done' : s === n ? 'active' : '';
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateSummary();
  if (n === 3) renderGrades();
  if (n === 4) renderEstimate();
}

// ─── Step 2: 항목 카드 ───
function renderItemsGrid() {
  const wrap = document.getElementById('comItemsGrid');
  wrap.innerHTML = COM_ITEMS.map(item => `
    <label class="com-item-card ${comState.selected[item.key] ? 'selected' : ''}">
      <input type="checkbox" class="com-item-check" data-key="${item.key}"
        ${comState.selected[item.key] ? 'checked' : ''} />
      <span class="com-item-icon">${item.icon}</span>
      <span class="com-item-label">${item.label}</span>
      <span class="com-item-desc">${item.desc}</span>
    </label>
  `).join('');
  wrap.querySelectorAll('.com-item-check').forEach(cb => {
    cb.addEventListener('change', () => {
      comState.selected[cb.dataset.key] = cb.checked;
      cb.closest('.com-item-card').classList.toggle('selected', cb.checked);
      updateSummary();
      saveState();
    });
  });
}

// ─── Step 3: 자재/등급 ───
function getDefaultGrade(def) {
  if (def.type === 'select') return def.options.find(o => o.def)?.value || def.options[0].value;
  if (def.type === 'combo') return {
    material: def.materials.find(m => m.def)?.value || def.materials[0].value,
    level:    def.grades.find(g => g.def)?.value   || def.grades[0].value,
  };
  if (def.type === 'door') return { level: def.grades.find(g => g.def)?.value || 'basic', count: 1 };
  return null;
}

function renderGrades() {
  const wrap = document.getElementById('comGradeWrap');
  const selected = COM_ITEMS.filter(i => comState.selected[i.key]);
  if (!selected.length) {
    wrap.innerHTML = '<p class="muted" style="padding:24px;text-align:center">STEP 2에서 공사 항목을 선택해주세요.</p>';
    return;
  }
  wrap.innerHTML = selected.map(item => {
    const def = GRADE_DEFS[item.key];
    if (!def) return '';
    let html = `<div class="grade-section"><h3>${item.icon} ${item.label}</h3>`;
    if (def.type === 'select') {
      const cur = comState.grades[item.key] || getDefaultGrade(def);
      html += `<label>${def.options[0].label.split('—')[0].includes('기본') ? '등급 선택' : '옵션 선택'}
        <select class="com-grade-sel" data-key="${item.key}">
          ${def.options.map(o => `<option value="${o.value}" ${cur === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select></label>`;
    } else if (def.type === 'combo') {
      const curG = (typeof comState.grades[item.key] === 'object') ? comState.grades[item.key] : {};
      const curMat = curG.material || def.materials.find(m => m.def)?.value || def.materials[0].value;
      const curLvl = curG.level    || def.grades.find(g => g.def)?.value   || def.grades[0].value;
      html += `<div class="grid two">
        <label>${def.materialLabel}
          <select class="com-grade-mat" data-key="${item.key}">
            ${def.materials.map(m => `<option value="${m.value}" ${curMat === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
          </select></label>
        <label>${def.gradeLabel}
          <select class="com-grade-lvl" data-key="${item.key}">
            ${def.grades.map(g => `<option value="${g.value}" ${curLvl === g.value ? 'selected' : ''}>${g.label}</option>`).join('')}
          </select></label>
      </div>`;
    } else if (def.type === 'door') {
      const curG = (typeof comState.grades[item.key] === 'object') ? comState.grades[item.key] : {};
      const curLvl = curG.level || 'basic';
      const curCnt = curG.count || 1;
      html += `<div class="grid two">
        <label>등급
          <select class="com-grade-door-lvl" data-key="${item.key}">
            ${def.grades.map(g => `<option value="${g.value}" ${curLvl === g.value ? 'selected' : ''}>${g.label}</option>`).join('')}
          </select></label>
        <label>개수
          <input type="number" class="com-grade-door-cnt" data-key="${item.key}" min="1" max="20" value="${curCnt}" />
        </label>
      </div>`;
    }
    html += `</div>`;
    return html;
  }).join('');

  // 이벤트 바인딩
  wrap.querySelectorAll('.com-grade-sel').forEach(sel => {
    sel.addEventListener('change', () => { comState.grades[sel.dataset.key] = sel.value; updateSummary(); saveState(); });
  });
  const comboUpdate = (key, field, val) => {
    if (typeof comState.grades[key] !== 'object' || !comState.grades[key]) comState.grades[key] = {};
    comState.grades[key][field] = val;
    updateSummary(); saveState();
  };
  wrap.querySelectorAll('.com-grade-mat').forEach(sel => sel.addEventListener('change', () => comboUpdate(sel.dataset.key, 'material', sel.value)));
  wrap.querySelectorAll('.com-grade-lvl').forEach(sel => sel.addEventListener('change', () => comboUpdate(sel.dataset.key, 'level', sel.value)));
  wrap.querySelectorAll('.com-grade-door-lvl').forEach(sel => sel.addEventListener('change', () => comboUpdate(sel.dataset.key, 'level', sel.value)));
  wrap.querySelectorAll('.com-grade-door-cnt').forEach(inp => inp.addEventListener('change', () => comboUpdate(inp.dataset.key, 'count', parseInt(inp.value) || 1)));
}

// ─── 비용 계산 ───
function calcAllItems() {
  const area = parseFloat(document.getElementById('comArea')?.value || comState.info.area || '0') || 0;
  const items = [];
  COM_ITEMS.forEach(item => {
    if (!comState.selected[item.key]) return;
    const def = GRADE_DEFS[item.key];
    const grade = comState.grades[item.key] || getDefaultGrade(def);
    const amount = calcComItem(item.key, grade, area);
    if (amount > 0) items.push({ key: item.key, label: item.label, amount });
  });
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const reserve  = Math.round(subtotal * 0.05);
  if (subtotal > 0) items.push({ key: 'reserve', label: '예비비 (5%)', amount: reserve });
  return { items, subtotal, total: subtotal + reserve };
}

// ─── 사이드바 요약 ───
function updateSummary() {
  const { items, total } = calcAllItems();
  const el = document.getElementById('comSummary');
  if (!items.length) {
    el.innerHTML = '<p class="muted" style="font-size:.85rem;padding:8px 0;line-height:1.6">공사 항목을 선택하면<br>비용이 표시됩니다.</p>';
    return;
  }
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;font-size:.85rem">
      ${items.map(i => `
        <div style="display:flex;justify-content:space-between;gap:8px;${i.key === 'reserve' ? 'margin-top:4px;padding-top:4px;border-top:1px solid var(--line)' : ''}">
          <span style="color:var(--muted)">${i.label}</span>
          <strong>${KRW.format(i.amount)}원</strong>
        </div>`).join('')}
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:2px solid var(--line);display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:800">합계</span>
      <strong style="font-size:1.1rem;color:var(--brand)">${KRW.format(total)}원</strong>
    </div>
    <p style="font-size:.74rem;color:var(--muted);margin-top:8px;line-height:1.5">현장 상황에 따라 실제 금액이 변동될 수 있습니다.</p>`;
}

// ─── Step 4: 견적서 렌더링 ───
function renderEstimate() {
  const info = comState.info;
  const { items, subtotal, total } = calcAllItems();
  const area = parseFloat(info.area) || 0;
  const workItems = items.filter(i => i.key !== 'reserve');
  const reserve   = items.find(i => i.key === 'reserve');

  document.getElementById('comEstimateDoc').innerHTML = `
    <div style="border:1px solid var(--line);border-radius:16px;overflow:hidden">
      <div style="background:#162033;color:#fff;padding:22px 28px">
        <h2 style="font-size:1.3rem;font-weight:900;margin:0 0 4px">상가 인테리어 견적서</h2>
        <p style="color:rgba(255,255,255,.6);font-size:.85rem;margin:0">Modern Interior · 발행일 ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      <div style="padding:22px 28px;background:#fafbff;border-bottom:1px solid var(--line)">
        <div class="grid two" style="gap:10px;font-size:.9rem">
          <div><span style="color:var(--muted)">고객명</span>&nbsp;&nbsp;<strong>${info.customerName || '—'}</strong></div>
          <div><span style="color:var(--muted)">연락처</span>&nbsp;&nbsp;<strong>${info.phone || '—'}</strong></div>
          <div><span style="color:var(--muted)">상호명</span>&nbsp;&nbsp;<strong>${info.shopName || '—'}</strong></div>
          <div><span style="color:var(--muted)">유형</span>&nbsp;&nbsp;<strong>${SHOP_TYPES[info.type] || '—'}</strong></div>
          <div style="grid-column:span 2"><span style="color:var(--muted)">주소</span>&nbsp;&nbsp;<strong>${info.address || '—'}</strong></div>
          <div><span style="color:var(--muted)">전용 면적</span>&nbsp;&nbsp;<strong>${area}㎡</strong></div>
          ${info.start ? `<div><span style="color:var(--muted)">공사 시작일</span>&nbsp;&nbsp;<strong>${info.start}</strong></div>` : ''}
          ${info.end   ? `<div><span style="color:var(--muted)">공사 종료일</span>&nbsp;&nbsp;<strong>${info.end}</strong></div>` : ''}
        </div>
      </div>
      <div style="padding:22px 28px">
        <table class="est-table" style="margin-bottom:0">
          <thead>
            <tr><th>공사 항목</th><th style="text-align:right">금액</th></tr>
          </thead>
          <tbody>
            ${workItems.map(i => `<tr><td>${i.label}</td><td style="text-align:right">${KRW.format(i.amount)}원</td></tr>`).join('')}
          </tbody>
          <tfoot>
            ${reserve ? `<tr><td style="color:var(--muted);font-size:.88rem">예비비 (5%)</td><td style="text-align:right;color:var(--muted);font-size:.88rem">${KRW.format(reserve.amount)}원</td></tr>` : ''}
            <tr style="background:#e8f0ff">
              <td style="font-size:1.05rem;font-weight:900;color:var(--brand)">합 계</td>
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
        <li>철거 시 발생하는 추가 공사(누수·배관 불량 등)는 별도 청구됩니다.</li>
        <li>자재 가격은 시세 변동에 따라 달라질 수 있습니다.</li>
        <li>인허가 비용(소방·위생 신고 등)은 포함되지 않습니다.</li>
      </ul>
    </div>`;
}

// ─── 문의 모달 ───
function showInquiryModal() {
  const info = comState.info;
  const { total } = calcAllItems();
  const selectedLabels = COM_ITEMS.filter(i => comState.selected[i.key]).map(i => i.label).join(', ');
  document.getElementById('comInqBody').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:.9rem">
      <div style="display:flex;justify-content:space-between"><span class="muted">견적 유형</span><strong>🏪 상가 인테리어</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">고객명</span><strong>${info.customerName || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">연락처</span><strong>${info.phone || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">상호명</span><strong>${info.shopName || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">주소</span><strong>${info.address || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span class="muted">면적</span><strong>${info.area || '—'}㎡</strong></div>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px"><span class="muted">공사 항목</span><strong style="text-align:right;max-width:240px">${selectedLabels || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid var(--line)">
        <span class="muted">견적 총액</span>
        <strong style="color:var(--brand);font-size:1.05rem">${KRW.format(total)}원</strong>
      </div>
    </div>`;
  document.getElementById('comInquiryModal').classList.remove('hidden');
}

function submitInquiry() {
  const info = comState.info;
  const { total } = calcAllItems();
  const list = JSON.parse(localStorage.getItem(INQ_KEY) || '[]');
  list.push({
    estimateType: 'commercial',
    customer: {
      customerName: info.customerName || '',
      phone:        info.phone || '',
      shopName:     info.shopName || '',
      address:      info.address || '',
      shopType:     SHOP_TYPES[info.type] || '',
      area:         info.area || '',
    },
    totalEstimate: total,
    status: 'new',
    submittedAt: new Date().toISOString(),
    id: Date.now().toString(),
  });
  localStorage.setItem(INQ_KEY, JSON.stringify(list));
  document.getElementById('comInquiryModal').classList.add('hidden');
  const toast = document.getElementById('comToast');
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3200);
}

// ─── 초기화 ───
document.addEventListener('DOMContentLoaded', () => {
  // 진행 단계 클릭
  document.querySelectorAll('#stepNav li').forEach(li => {
    li.addEventListener('click', () => { if (parseInt(li.dataset.step) < currentStep) goToStep(parseInt(li.dataset.step)); });
  });

  // 이전 버튼
  document.querySelectorAll('[data-prev-step]').forEach(btn => {
    btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.prevStep)));
  });

  // STEP 1 → 2
  document.getElementById('comStep1Next').addEventListener('click', () => {
    comState.info = {
      customerName: document.getElementById('comCustomerName').value.trim(),
      phone:        document.getElementById('comPhone').value.trim(),
      shopName:     document.getElementById('comShopName').value.trim(),
      address:      document.getElementById('comAddress').value.trim(),
      type:         document.getElementById('comType').value,
      area:         document.getElementById('comArea').value,
      start:        document.getElementById('comStart').value,
      end:          document.getElementById('comEnd').value,
      budget:       document.getElementById('comBudget').value,
    };
    saveState();
    renderItemsGrid();
    goToStep(2);
  });

  // STEP 2 → 3
  document.getElementById('comStep2Next').addEventListener('click', () => {
    if (!COM_ITEMS.some(i => comState.selected[i.key])) {
      alert('공사 항목을 하나 이상 선택해주세요.');
      return;
    }
    goToStep(3);
  });

  // STEP 3 → 4
  document.getElementById('comStep3Next').addEventListener('click', () => goToStep(4));

  // 인쇄
  document.getElementById('comPrintBtn').addEventListener('click', () => window.print());

  // 문의
  document.getElementById('comInquiryBtn').addEventListener('click', showInquiryModal);
  document.getElementById('comInqClose').addEventListener('click', () => document.getElementById('comInquiryModal').classList.add('hidden'));
  document.getElementById('comInqCancel').addEventListener('click', () => document.getElementById('comInquiryModal').classList.add('hidden'));
  document.getElementById('comInqBackdrop').addEventListener('click', () => document.getElementById('comInquiryModal').classList.add('hidden'));
  document.getElementById('comInqSubmit').addEventListener('click', submitInquiry);

  // 초기화
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('견적을 초기화할까요?')) return;
    localStorage.removeItem(COM_KEY);
    comState = defaultState();
    currentStep = 1;
    ['comCustomerName','comPhone','comShopName','comAddress','comArea','comStart','comEnd','comBudget']
      .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    renderItemsGrid();
    goToStep(1);
  });

  // 저장된 상태 복원
  const fi = comState.info;
  if (fi.customerName) document.getElementById('comCustomerName').value = fi.customerName;
  if (fi.phone)        document.getElementById('comPhone').value        = fi.phone;
  if (fi.shopName)     document.getElementById('comShopName').value     = fi.shopName;
  if (fi.address)      document.getElementById('comAddress').value      = fi.address;
  if (fi.type)         document.getElementById('comType').value         = fi.type;
  if (fi.area)         document.getElementById('comArea').value         = fi.area;
  if (fi.start)        document.getElementById('comStart').value        = fi.start;
  if (fi.end)          document.getElementById('comEnd').value          = fi.end;
  if (fi.budget)       document.getElementById('comBudget').value       = fi.budget;

  renderItemsGrid();
  updateSummary();

  const savedStep = comState.step || 1;
  if (savedStep > 1) goToStep(savedStep);
});
