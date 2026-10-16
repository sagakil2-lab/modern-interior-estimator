// home.js — 시공 사례 데이터 및 필터/모달 로직

// ─────────────────────────────────────────────
//  콘텐츠 사진 맵 (localStorage)
// ─────────────────────────────────────────────
const contentPhotoMap = (() => {
  // 기본값: content-photos-data.js (images/content 폴더 연결, 모든 방문자 공통)
  // 관리자가 이 브라우저에서 따로 지정한 값(localStorage)이 있으면 그것이 우선
  let local = {};
  try { local = JSON.parse(localStorage.getItem('bathroom_content_photos') || '{}'); }
  catch { local = {}; }
  return Object.assign({}, window._CONTENT_PHOTOS || {}, local);
})();

// 정보 카드 사진: 카드에 photoKey 가 지정돼 있으면 그것을, 없으면 '탭ID|카드제목' 기본 연결을 사용
function infoCardPhoto(tab, card) {
  if (card.photoKey && contentPhotoMap[card.photoKey]) return contentPhotoMap[card.photoKey];
  return (window._INFO_CARD_PHOTOS || {})[tab.id + '|' + card.title] || null;
}
function infoCardImgHtml(photo, title) {
  return photo
    ? `<img src="${photo}" alt="${title}" class="info-card-img" loading="lazy" decoding="async" style="width:100%;max-height:220px;object-fit:cover;border-radius:8px;margin-bottom:12px;cursor:zoom-in" />`
    : '';
}

// ─────────────────────────────────────────────
//  시공 사례 데이터 — cases-default-data.js 에서 로드
//  새 사례 추가/수정은 admin.html 시공사례 관리 섹션에서 Excel로 진행하세요.
// ─────────────────────────────────────────────
let CASES = JSON.parse(JSON.stringify(window._DEFAULT_CASES_DATA || []));

// ── 비용·자재·날짜가 없는 사례(시공 전/후 사진만 있는 사례)도 표시하기 위한 헬퍼 ──
function caseTotal(c) { return c.costs ? Object.values(c.costs).reduce((a, v) => a + (Number(v) || 0), 0) : 0; }
// 시공 전/후 사진: photos 와 photoLabels(['시공 전','시공 후']) 가 짝으로 있으면 전/후 비교 사례
function caseBA(c) {
  const ph = c.photos || [], lb = c.photoLabels || [];
  if (ph.length < 2 || lb.length !== ph.length) return null;
  const bi = lb.findIndex(l => String(l).includes('전')), ai = lb.findIndex(l => String(l).includes('후'));
  if (bi < 0 || ai < 0 || bi === ai) return null;
  return { before: ph[bi], after: ph[ai] };
}
function caseMainPhoto(c) {
  const ba = caseBA(c);
  return casePhotoMap[c.id] || casePhotoMap[`${c.id}-1`] || (ba ? ba.after : (c.photos && c.photos[0])) || null;
}
function caseChipsHtml(c) {
  return `<span class="chip chip-region">${c.region} · ${c.district}</span>
    <span class="chip chip-loc">${c.location}</span>
    ${c.apt_size ? `<span class="chip chip-size">${c.apt_size}평</span>` : ''}
    ${caseBA(c) ? '<span class="chip chip-ba">시공 전·후</span>' : ''}`;
}

// ─────────────────────────────────────────────
//  욕실 리모델링 정보 탭
// ─────────────────────────────────────────────
const INFO_TABS = [
  {
    id: 'dentbang', label: '덧방 시공', icon: '🧱',
    cards: [
      { title: '덧방이란?', body: '기존 욕실 타일을 철거하지 않고, 그 위에 얇은 접착제로 새 타일을 붙이는 시공 방식입니다. \'타일 위 타일\'이라고도 하며 비용과 기간을 줄일 수 있습니다.' },
      { title: '장점', list: ['철거 비용 절감 (약 15~20만원)', '공사 기간 1일 단축', '소음·먼지·폐기물 대폭 감소', '기존 방수층 유지 가능'] },
      { title: '단점 및 주의사항', list: ['바닥이 1~1.5 cm 높아져 문턱 간섭 가능', '하중 증가 (기존 타일 무게 추가)', '기존 타일이 들뜨거나 균열 있으면 불가', '완전한 방수 보강이 어려움'] },
      { title: '💡 전문가 TIP', body: '덧방 전 기존 타일을 두드려 \'통 소리(빈 소리)\'가 나는 곳이 없는지 확인하세요. 들뜬 타일 위에 덧방하면 나중에 함께 박리될 수 있습니다.', tip: true },
    ]
  },
  {
    id: 'jollycut', label: '졸리컷', icon: '✂️',
    cards: [
      { title: '졸리컷이란?', body: '타일 모서리를 45° 각도로 절삭·연마해 코너에서 두 장이 맞닿게 마감하는 기법입니다. 코너비드(금속 마감재) 없이 타일만으로 깔끔한 모서리를 만듭니다.' },
      { title: '일반 코너비드 vs 졸리컷', compare: [
          { label: '코너비드', sub: '일반 마감', pros: '시공 간단·저렴', cons: '시간 지나면 녹·변색, 틈새 오염' },
          { label: '졸리컷', sub: '고급 마감', pros: '깔끔·오염 없음·고급스러움', cons: '숙련 기술 필요, 시공비 다소 높음' },
      ]},
      { title: '적합한 타일', body: '포세린 타일(흡수율 0.5% 미만)에 가장 적합합니다. 세라믹 타일은 절삭 시 깨지기 쉬워 권장하지 않습니다. 두께 10 mm 이상의 타일을 사용하세요.' },
      { title: '💡 전문가 TIP', body: '졸리컷은 숙련된 기사의 기술력이 결과를 좌우합니다. 시공 전 샘플 타일로 각도·마감 상태를 미리 확인하세요. 고급 인테리어에서는 코너·엣지 모두 졸리컷으로 마감합니다.', tip: true },
    ]
  },
  {
    id: 'waterproof', label: '방수 공사', icon: '💧',
    cards: [
      { title: '방수 공사의 중요성', body: '욕실 방수는 누수로 인한 아랫집 피해를 막는 핵심 공정입니다. 방수층이 손상되면 콘크리트 부식·곰팡이·구조물 손상으로 이어질 수 있습니다.' },
      { title: '방수 공법 종류', list: [
          '도막방수 — 액체 방수제를 2~3회 도포. 가장 보편적. 시공 후 24시간 이상 건조 필수',
          '시트방수 — 방수 시트를 부착. 욕조·샤워부스 주변에 효과적',
          '결정형 방수 — 시멘트 기반으로 콘크리트와 화학 결합. 반영구적이나 고가',
      ]},
      { title: '방수가 필요한 위치', list: [
          '바닥 전체 — 타일 제거 후 반드시 시공',
          '벽면 하부 50~100 cm — 물이 튀는 범위 권장',
          '욕조·샤워부스 주변 벽 — 높이 150 cm까지 권장',
          '배수구 주변 — 특별 보강 처리 필수',
      ]},
      { title: '💡 전문가 TIP', body: '방수 공사 후 물을 채워 24~48시간 담수 테스트를 권장합니다. 이 과정을 생략하면 나중에 누수가 발생해도 원인 파악이 매우 어렵습니다.', tip: true },
    ]
  },
  {
    id: 'materials', label: '자재 선택', icon: '🔍',
    cards: [
      { title: '타일 종류 비교', list: [
          '포세린 — 흡수율 0.5% 미만, 내구성·내수성 최고. 욕실 바닥·벽 최우선 권장',
          '세라믹 — 흡수율 최대 10%, 경제적. 벽면 가능, 바닥은 비권장',
          '자연석 — 독특한 질감. 흡수율 높아 방수 처리·관리 필요. 비용 높음',
          '모자이크 — 포인트 구역에 적합. 시공 노임 다소 높음',
      ]},
      { title: '수전 선택 기준', list: [
          '세라믹 카트리지 — 내구성 가장 좋음 (권장)',
          '마감: 크롬(관리 쉬움) / 무광(지문 안 남음, 고급) / 골드·블랙(트렌디)',
          '브랜드별 국내 AS 여부 반드시 확인',
      ]},
      { title: '양변기 형태 비교', compare: [
          { label: '원피스', sub: '일체형', pros: '청소 쉬움, 세련된 외관', cons: '수리 시 전체 교체, 가격 높음' },
          { label: '투피스', sub: '분리형', pros: '수리·교체 편리, 경제적', cons: '상하 연결부 청소 불편' },
      ]},
      { title: '💡 전문가 TIP', body: '타일은 같은 롯트(생산 배치)로 구매해야 색상 편차가 없습니다. 시공 면적의 10~15% 여유분을 추가 구매하세요. 나중에 같은 롯트를 구하기 어렵습니다.', tip: true },
    ]
  },
  {
    id: 'duration', label: '시공 기간', icon: '📅',
    cards: [
      { title: '규모별 예상 기간', list: [
          '소형 욕실 (0.8평 미만) — 2~3일',
          '일반 욕실 (1~1.5평) — 3~4일',
          '안방 욕실 (1.5평 이상) — 4~5일',
          '욕조 포함 시 — 기본 일정 +1~2일 추가',
      ]},
      { title: '공정별 소요 시간', list: [
          '1일차 — 철거(반나절~1일), 방수 공사(오후)',
          '2일차 — 방수 건조 확인, 바닥 타일 시공',
          '3일차 — 벽면 타일 시공',
          '4일차 — 줄눈·실리콘, 위생도기·수전 설치',
          '5일차 — 마감 점검, 청소 및 인도',
      ]},
      { title: '공사 중 주의사항', list: [
          '방수 후 최소 24시간 이상 건조 시간 확보 필수',
          '겨울철 저온에서는 접착제·방수제 경화 시간 연장됨',
          '타일 줄눈은 시공 24시간 후부터 물 접촉 가능',
          '실리콘 코킹은 24시간 완전 경화 후 사용 권장',
      ]},
      { title: '💡 전문가 TIP', body: '공사 전날 욕실 내 모든 물건을 미리 빼두고 임시 세면 공간을 준비하세요. 공사 기간 동안 해당 욕실은 완전히 사용 불가합니다.', tip: true },
    ]
  },
  {
    id: 'maintenance', label: '줄눈·실리콘 관리', icon: '🧹',
    cards: [
      { title: '줄눈 종류와 특징', list: [
          '시멘트 줄눈 — 경제적. 오염 흡수 쉬워 주기적 관리 필요',
          '에폭시 줄눈 — 방오·방수 우수, 곰팡이 거의 없음. 시공비 다소 높음',
          '컬러 줄눈 — 타일과 조화로운 색상 선택 가능. 인테리어 포인트',
      ]},
      { title: '줄눈 청소 방법', list: [
          '일반 청소 — 중성 세제 + 부드러운 브러시 (산성 세제는 줄눈 손상)',
          '심한 오염 — 줄눈 전용 세정제 사용',
          '재시공 주기 — 일반 줄눈 5~10년, 에폭시 15년 이상',
      ]},
      { title: '실리콘 코킹 관리', list: [
          '검게 변색되거나 들뜨면 즉시 재시공 필요 (누수 원인)',
          '재시공 시 기존 실리콘 완전 제거 후 새로 시공',
          '곰팡이 방지 항균 실리콘 사용 권장',
          '재시공 주기 — 3~5년 (환경에 따라 다름)',
      ]},
      { title: '💡 전문가 TIP', body: '욕실 사용 후 환풍기를 30분 이상 가동하고 스퀴지로 물기를 제거하는 것만으로도 곰팡이 발생을 크게 줄일 수 있습니다. 줄눈 보호제를 연 1회 도포하면 수명이 크게 늘어납니다.', tip: true },
    ]
  },
];

// INFO_TABS localStorage 오버라이드 적용
(function() {
  try {
    const s = JSON.parse(localStorage.getItem('bathroom_info_tabs') || 'null');
    if (s && s.length) INFO_TABS.splice(0, INFO_TABS.length, ...s);
  } catch {}
})();

let activeInfoTab = 0;

function renderInfoSection() {
  const navEl   = document.getElementById('infoTabNav');
  const bodyEl  = document.getElementById('infoTabBody');
  if (!navEl || !bodyEl) return;

  navEl.innerHTML = INFO_TABS.map((tab, i) =>
    `<button class="info-tab-btn${i === activeInfoTab ? ' active' : ''}" data-idx="${i}">
       <span class="itb-icon">${tab.icon}</span>${tab.label}
     </button>`
  ).join('');

  navEl.querySelectorAll('.info-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeInfoTab = Number(btn.dataset.idx);
      renderInfoSection();
      document.getElementById('info').scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  bodyEl.innerHTML = INFO_TABS.map((tab, i) => {
    const panelCards = tab.cards.map(card => {
      if (card.compare) {
        const compHtml = card.compare.map((c, ci) =>
          `<div class="info-compare-box${ci % 2 === 1 ? ' alt' : ''}">
            <div class="info-compare-label">${c.label} <span style="font-weight:400;font-size:.76rem;opacity:.7">${c.sub||''}</span></div>
            <div class="info-compare-row"><strong>장점</strong> ${c.pros}</div>
            <div class="info-compare-row"><strong>단점</strong> ${c.cons}</div>
          </div>`
        ).join('');
        return `<div class="info-card${card.tip ? ' tip-card' : ''}">
          <h3 class="info-card-title">${card.title}</h3>
          <div class="info-card-content">${infoCardImgHtml(infoCardPhoto(tab, card), card.title)}<div class="info-compare">${compHtml}</div></div>
          <button class="info-card-toggle"><span class="itoggle-label">열기</span><span class="itoggle-arrow">▾</span></button>
        </div>`;
      }
      const content = card.list
        ? `<ul class="info-card-list">${card.list.map(li => `<li>${li}</li>`).join('')}</ul>`
        : `<p class="info-card-body">${card.body}</p>`;
      const cardPhoto = infoCardPhoto(tab, card);
      return `<div class="info-card${card.tip ? ' tip-card' : ''}">
        <h3 class="info-card-title">${card.title}</h3>
        <div class="info-card-content">
          ${infoCardImgHtml(cardPhoto, card.title)}
          ${content}
        </div>
        <button class="info-card-toggle"><span class="itoggle-label">열기</span><span class="itoggle-arrow">▾</span></button>
      </div>`;
    }).join('');
    return `<div class="info-tab-panel${i === activeInfoTab ? ' active' : ''}" data-tab="${tab.id}">${panelCards}</div>`;
  }).join('');

  bodyEl.querySelectorAll('.info-card-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.info-card');
      const isOpen = card.classList.toggle('open');
      btn.querySelector('.itoggle-label').textContent = isOpen ? '접기' : '열기';
      btn.querySelector('.itoggle-arrow').style.transform = isOpen ? 'rotate(180deg)' : '';
    });
  });

  bodyEl.addEventListener('click', e => {
    const img = e.target.closest('.info-card-img');
    if (!img) return;
    openAboutLightbox([img.src], 0);
  });
}

// ─────────────────────────────────────────────
//  소개 섹션 데이터
// ─────────────────────────────────────────────
const ABOUT_TABS = [
  { id: 'overview', icon: '🏢', label: '업체 소개' },
  { id: 'licenses', icon: '📋', label: '자격증·면허' },
  { id: 'partners', icon: '🤝', label: '협력업체' },
  { id: 'location', icon: '📍', label: '회사 위치' },
];

const ABOUT_DATA = {
  overview: {
    name: 'Modern Interior',
    founded: 2010,
    specialty: '욕실 리모델링 전문',
    desc: '2010년 설립 이래 15년간 500건 이상의 욕실 리모델링 시공 경험을 바탕으로 고객 만족을 최우선으로 하는 욕실 리모델링 전문 업체입니다. 합리적인 가격과 꼼꼼한 시공으로 단 한 명의 고객도 실망시키지 않겠다는 철학을 지켜오고 있습니다.',
    features: [
      { icon: '🏆', title: '15년 시공 경력', desc: '2010년 설립, 욕실 리모델링 전문 노하우 축적' },
      { icon: '✅', title: '1년 무상 AS 보장', desc: '시공 후 1년간 무상 AS 제공, 완벽한 사후 관리' },
      { icon: '💰', title: '합리적인 견적', desc: '투명한 자재 원가 공개, 거품 없는 정직한 가격' },
      { icon: '🔧', title: '전문 숙련 기술자', desc: '기능사 자격증 보유 전문 팀이 직접 시공' },
    ],
  },
  licenses: [
    { name: '타일기능사', subtitle: '타일 시공 전문', issuer: '한국산업인력공단', year: 2007, icon: '🧱' },
  ],
  partners: [
    {
      category: '함께하는 협력업체',
      items: [
        { name: '센스아트 인테리어', desc: '함께하는 협력업체입니다. 블로그에서 더 많은 소식을 확인해 보세요.', logo: '🤝', url: 'https://blog.naver.com/sense_art_1', linkText: '네이버 블로그' },
      ],
    },
    {
      category: '위생도기',
      items: [
        { name: '대림바스', desc: '국내 1위 위생도기 브랜드 / 양변기·세면기 공급', logo: '🛁' },
        { name: '이누스', desc: '고급 위생도기 전문 / 프리미엄 제품 공급', logo: '🚽' },
      ],
    },
    {
      category: '타일·마감재',
      items: [
        { name: 'LX하우시스', desc: '국내 대표 건자재 기업 / 타일·필름 공급', logo: '🧱' },
        { name: '디와이하우징', desc: '포세린·도자타일 전문 공급업체', logo: '🔷' },
        { name: '영림', desc: '다양한 규격 타일 공급', logo: '🔲' },
      ],
    },
    {
      category: '수전·악세서리',
      items: [
        { name: '오투바스', desc: '욕실 수전 및 악세서리 전문 브랜드', logo: '🚰' },
        { name: '대림바스', desc: '수전금구 및 욕실용품 공급', logo: '🛁' },
      ],
    },
    {
      category: '부자재·설비',
      items: [
        { name: '힘펠', desc: '저소음 욕실 환풍기 전문 / DC모터 환풍기 공급', logo: '💨' },
        { name: '코웨이', desc: '비데 전문 브랜드 / 스마트 비데 공급', logo: '🪥' },
        { name: '리바트', desc: '욕실 수납 가구 및 거울장 공급', logo: '🪞' },
      ],
    },
  ],
  location: {
    rep: '유종태',
    address: '인천광역시 남동구 능허대로 559번길 27 3층',
    tel: '010-9544-2206',
    email: 'sagakil2@naver.com',
    kakao: 'sagakil2',
    hours: '평일 09:00 – 18:00',
    parking: '',
  },
  teams: [],
};

// ABOUT_DATA localStorage 오버라이드 적용
(function() {
  try {
    const s = JSON.parse(localStorage.getItem('bathroom_about_data') || 'null');
    if (!s) return;
    if (s.overview) {
      Object.assign(ABOUT_DATA.overview, s.overview);
      if (s.overview.features) ABOUT_DATA.overview.features = s.overview.features;
    }
    if (s.licenses) ABOUT_DATA.licenses = s.licenses;
    if (s.partners) ABOUT_DATA.partners = s.partners;
    if (s.location) Object.assign(ABOUT_DATA.location, s.location);
    if (s.teams)    ABOUT_DATA.teams = s.teams;
  } catch {}
})();

let activeAboutTab = 0;

function renderAboutSection() {
  const navEl  = document.getElementById('aboutTabNav');
  const bodyEl = document.getElementById('aboutTabBody');
  if (!navEl || !bodyEl) return;

  navEl.innerHTML = ABOUT_TABS.map((tab, i) =>
    `<button class="about-tab-btn${i === activeAboutTab ? ' active' : ''}" data-idx="${i}">
       <span class="atb-icon">${tab.icon}</span>${tab.label}
     </button>`
  ).join('');

  navEl.querySelectorAll('.about-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeAboutTab = Number(btn.dataset.idx);
      renderAboutSection();
      document.getElementById('about').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const panels = [
    renderOverviewPanel(),
    renderLicensesPanel(),
    renderPartnersPanel(),
    renderLocationPanel(),
  ];

  bodyEl.innerHTML = panels.map((html, i) =>
    `<div class="about-tab-panel${i === activeAboutTab ? ' active' : ''}">${html}</div>`
  ).join('');

  bodyEl.querySelectorAll('.about-photo-thumb').forEach(img => {
    img.addEventListener('click', () => {
      const srcs = [...bodyEl.querySelectorAll('.about-photo-thumb')].map(el => el.src);
      openAboutLightbox(srcs, parseInt(img.dataset.lbIdx || '0'));
    });
  });
}

function renderOverviewPanel() {
  const d = ABOUT_DATA.overview;
  // 다중 사진 지원 (about_overview_0, _1, _2...)
  const photoSrcs = Object.keys(contentPhotoMap)
    .filter(k => /^about_overview_\d+$/.test(k))
    .sort((a, b) => parseInt(a.split('_').pop()) - parseInt(b.split('_').pop()))
    .map(k => contentPhotoMap[k]);
  // 구버전 단일키 폴백
  if (!photoSrcs.length && contentPhotoMap['about_overview']) photoSrcs.push(contentPhotoMap['about_overview']);
  let photoHtml = '';
  if (photoSrcs.length === 1) {
    photoHtml = `<img loading="lazy" decoding="async" src="${photoSrcs[0]}" alt="${d.name}" data-lb-idx="0" class="about-photo-thumb" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;margin-bottom:20px;box-shadow:0 4px 16px rgba(0,0,0,.1);cursor:pointer" />`;
  } else if (photoSrcs.length > 1) {
    photoHtml = `<div class="about-photo-grid">${photoSrcs.map((src, i) => `<img loading="lazy" decoding="async" src="${src}" alt="${d.name}" class="about-photo-thumb" data-lb-idx="${i}" />`).join('')}</div>`;
  }
  return `
    <div class="overview-intro">
      ${photoHtml}
      <div class="overview-logo-block">
        <span class="overview-logo-icon">🛁</span>
        <div>
          <h3 class="overview-name">${d.name}</h3>
          <p class="overview-specialty">${d.specialty} · 설립 ${d.founded}년</p>
        </div>
      </div>
      <p class="overview-desc">${d.desc}</p>
    </div>
    <div class="overview-features">
      ${d.features.map(f => `
        <div class="feature-card">
          <span class="feature-icon">${f.icon}</span>
          <h4 class="feature-title">${f.title}</h4>
          <p class="feature-desc">${f.desc}</p>
        </div>`).join('')}
    </div>
    ${ABOUT_DATA.teams.length ? `
    <div class="teams-section">
      <h4 class="teams-heading">🔧 시공 전문 팀</h4>
      <div class="teams-grid">
        ${ABOUT_DATA.teams.map(t => {
          const certBadges = (t.certs || '').split(',').map(c => c.trim()).filter(Boolean)
            .map(c => `<span class="cert-badge">${c}</span>`).join('');
          return `<div class="team-card">
            ${t.photo
              ? `<img src="${t.photo}" class="team-photo" alt="${t.name}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'team-icon',textContent:'${t.icon||'🔧'}'}))"/>`
              : `<span class="team-icon">${t.icon || '🔧'}</span>`}
            <h4 class="team-name">${t.name || ''}</h4>
            ${t.role   ? `<p class="team-role">${t.role}</p>` : ''}
            <div class="team-meta">
              ${t.region ? `<span class="team-meta-item">📍 ${t.region}</span>` : ''}
              ${t.career ? `<span class="team-meta-item">⏱ ${t.career}</span>` : ''}
            </div>
            ${certBadges ? `<div class="team-certs">${certBadges}</div>` : ''}
            ${t.desc   ? `<p class="team-desc">${t.desc}</p>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;
}

function renderLicensesPanel() {
  return `<div class="licenses-grid">
    ${ABOUT_DATA.licenses.map(lic => `
      <div class="license-card">
        ${lic.photo
          ? `<img src="${lic.photo}" class="license-photo" alt="${lic.name}" onerror="this.style.display='none'" />`
          : `<span class="license-icon">${lic.icon}</span>`}
        <div class="license-body">
          <h4 class="license-name">${lic.name}</h4>
          <p class="license-subtitle">${lic.subtitle}</p>
          <p class="license-meta">${lic.issuer}<br>${lic.year}년 취득</p>
        </div>
      </div>`).join('')}
  </div>`;
}

function renderPartnersPanel() {
  return ABOUT_DATA.partners.map(cat => `
    <div class="partner-category">
      <h4 class="partner-cat-title">${cat.category}</h4>
      <div class="partner-cards">
        ${cat.items.map(p => {
          const tag = p.url ? 'a' : 'div';
          const attrs = p.url ? ` href="${p.url}" target="_blank" rel="noopener noreferrer"` : '';
          return `
          <${tag} class="partner-card${p.url ? ' partner-card-link' : ''}"${attrs}>
            <span class="partner-logo">${p.logo}</span>
            <div class="partner-body">
              <p class="partner-name">${p.name}</p>
              <p class="partner-desc">${p.desc}</p>
              ${p.url ? `<span class="partner-link-text">${p.linkText || '바로가기'} 바로가기 ↗</span>` : ''}
            </div>
          </${tag}>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function renderLocationPanel() {
  const loc = ABOUT_DATA.location;
  // 지도 검색용 주소: 층·호수는 빼고 도로명 주소까지만 사용
  const mapAddr = String(loc.address || '').replace(/\s*\d+\s*층.*$/, '').trim();
  const q = encodeURIComponent(mapAddr);
  const telHref = String(loc.tel || '').replace(/[^\d+]/g, '');
  const row = (icon, html) => html ? `<li><span class="loc-icon">${icon}</span><span>${html}</span></li>` : '';
  return `
    <div class="location-wrap">
      <div class="location-map-frame">
        <iframe src="https://www.google.com/maps?q=${q}&hl=ko&z=17&output=embed"
                title="${mapAddr} 위치 지도" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
      <div class="location-info">
        <h4 class="location-info-title">오시는 길</h4>
        <ul class="location-list">
          ${row('📍', loc.address)}
          ${row('👤', loc.rep ? `대표 ${loc.rep}` : '')}
          ${row('📞', loc.tel ? `<a href="tel:${telHref}">${loc.tel}</a>` : '')}
          ${row('✉️', loc.email ? `<a href="mailto:${loc.email}">${loc.email}</a>` : '')}
          ${row('💬', loc.kakao ? `카카오톡 ${loc.kakao}` : '')}
          ${row('🕐', loc.hours)}
          ${row('🚗', loc.parking)}
        </ul>
        <div class="location-links">
          <a class="location-link-btn" href="https://map.naver.com/p/search/${q}" target="_blank" rel="noopener">네이버 지도</a>
          <a class="location-link-btn" href="https://map.kakao.com/?q=${q}" target="_blank" rel="noopener">카카오맵</a>
          <a class="location-link-btn" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">구글 지도</a>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  추천 시공사례 슬라이더
// ─────────────────────────────────────────────
const FEATURED_IDS = ['c006', 'c003', 'c004', 'c007', 'c001'];
let FEATURED = FEATURED_IDS.map(id => CASES.find(c => c.id === id)).filter(Boolean);

let sliderIdx = 0;
let sliderTimer = null;
let progressTimer = null;
const SLIDE_INTERVAL = 5000;

function renderSlider() {
  const track = document.getElementById('sliderTrack');
  const dots  = document.getElementById('sliderDots');
  if (!track || !dots) return;

  track.innerHTML = FEATURED.map(c => {
    const total = caseTotal(c);
    const photoUrl = caseMainPhoto(c);
    const thumbContent = photoUrl
      ? `<img class="slider-photo" loading="lazy" decoding="async" src="${photoUrl}" alt="${c.title}" />`
      : '';
    return `<div class="slider-card" data-id="${c.id}">
      <div class="slider-thumb-area" style="background:${c.thumbBg}">
        ${thumbContent}
        ${c.concept ? `<span class="slider-concept-badge">${c.concept}</span>` : ''}
      </div>
      <div class="slider-body">
        <div class="case-chips">${caseChipsHtml(c)}</div>
        <h3>${c.title}</h3>
        <p class="slider-desc">${c.desc}</p>
        <div class="slider-info-row">
          <span class="slider-total">${total ? `총 ${formatWon(total)}` : '시공 전·후 보기'}</span>
          <span class="slider-detail-link">자세히 보기 →</span>
        </div>
      </div>
    </div>`;
  }).join('');

  dots.innerHTML = FEATURED.map((_, i) =>
    `<button class="slider-dot${i === 0 ? ' active' : ''}" data-idx="${i}" aria-label="${i+1}번째 슬라이드"></button>`
  ).join('');

  track.querySelectorAll('.slider-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
  dots.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', () => goToSlide(Number(dot.dataset.idx)));
  });

  updateSliderPos(false);
  startSliderTimer();
}

function updateSliderPos(animate = true) {
  const track = document.getElementById('sliderTrack');
  if (!track) return;
  const outer = document.querySelector('.slider-outer');
  const w = outer ? outer.offsetWidth : 0;
  if (!animate) track.style.transition = 'none';
  track.style.transform = `translateX(${-sliderIdx * w}px)`;
  if (!animate) { track.offsetHeight; track.style.transition = ''; }

  document.querySelectorAll('#sliderDots .slider-dot').forEach((d, i) =>
    d.classList.toggle('active', i === sliderIdx));
}

function goToSlide(idx) {
  sliderIdx = ((idx % FEATURED.length) + FEATURED.length) % FEATURED.length;
  updateSliderPos(true);
  resetSliderTimer();
}

function startSliderTimer() {
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => goToSlide(sliderIdx + 1), SLIDE_INTERVAL);
}

function resetSliderTimer() {
  startSliderTimer();
}

// ─────────────────────────────────────────────
//  상태
// ─────────────────────────────────────────────
let activeRegion = 'all';
let activeLocation = 'all';
let searchQuery = '';
const CASES_PER_PAGE = 9;
let casePage = 0;
let casePhotoMap = {};

function loadCasePhotos() {
  // 기본값: cases-photos-data.js (images/cases 폴더 목록, 모든 방문자 공통)
  // 관리자가 이 브라우저에서 따로 지정한 값(localStorage)이 있으면 그것이 우선
  let local = {};
  try { local = JSON.parse(localStorage.getItem('bathroom_case_photos') || '{}'); }
  catch { local = {}; }
  casePhotoMap = Object.assign({}, window._CASE_PHOTOS || {}, local);
}

// ─────────────────────────────────────────────
//  유틸
// ─────────────────────────────────────────────
function formatWon(n) {
  return n.toLocaleString('ko-KR') + '원';
}

// ─────────────────────────────────────────────
//  필터링
// ─────────────────────────────────────────────
function filterCases() {
  return CASES.filter(c => {
    const inR = activeRegion === 'all' || c.region === activeRegion;
    const inL = activeLocation === 'all' || c.location === activeLocation;
    const q = searchQuery.trim().toLowerCase();
    const hay = [c.title, c.district, c.concept, c.desc, ...c.tags].join(' ').toLowerCase();
    return inR && inL && (!q || hay.includes(q));
  });
}

function resetFilters() {
  activeRegion = 'all';
  activeLocation = 'all';
  searchQuery = '';
  casePage = 0;
  document.getElementById('caseSearch').value = '';
  document.querySelectorAll('#regionFilter .fchip').forEach(b =>
    b.classList.toggle('active', b.dataset.region === 'all'));
  document.querySelectorAll('#locationFilter .fchip').forEach(b =>
    b.classList.toggle('active', b.dataset.location === 'all'));
  renderCards();
}

// ─────────────────────────────────────────────
//  카드 렌더링
// ─────────────────────────────────────────────
function renderCards() {
  const filtered = filterCases();
  const grid      = document.getElementById('casesGrid');
  const paginator = document.getElementById('casePaginator');
  const empty     = document.getElementById('emptyState');
  const count     = document.getElementById('resultsCount');

  if (!filtered.length) {
    grid.innerHTML = '';
    if (paginator) paginator.innerHTML = '';
    count.textContent = '0건의 시공 사례';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const totalPages = Math.ceil(filtered.length / CASES_PER_PAGE);
  casePage = Math.min(Math.max(casePage, 0), totalPages - 1);
  const start = casePage * CASES_PER_PAGE;
  const pageItems = filtered.slice(start, start + CASES_PER_PAGE);

  const s = start + 1;
  const e = Math.min(start + CASES_PER_PAGE, filtered.length);
  count.textContent = totalPages > 1
    ? `총 ${filtered.length}건의 시공 사례 (${s}–${e}번째)`
    : `총 ${filtered.length}건의 시공 사례`;

  grid.innerHTML = pageItems.map(c => {
    const total    = caseTotal(c);
    const ba       = caseBA(c);
    const photoUrl = caseMainPhoto(c);
    const metaParts = [c.duration ? `시공 ${c.duration}일` : '', c.date ? c.date.slice(0, 7) : ''].filter(Boolean);
    const thumbContent = photoUrl
      ? `<img src="${photoUrl}" alt="${c.title}${ba ? ' 시공 후' : ''}" class="thumb-img" loading="lazy" decoding="async" />${ba ? '<span class="ba-tag ba-tag-after">시공 후</span>' : ''}`
      : `<div class="thumb-placeholder"><span class="thumb-icon">🚿</span><span class="thumb-concept">${c.concept}</span></div>`;
    return `
      <article class="case-card" data-id="${c.id}" tabindex="0" role="button" aria-label="${c.title} 자세히 보기">
        <div class="case-thumb" style="background:${c.thumbBg}">${thumbContent}</div>
        <div class="case-body">
          <div class="case-chips">${caseChipsHtml(c)}</div>
          <h3 class="case-title">${c.title}</h3>
          ${metaParts.length ? `<p class="case-meta">${metaParts.join(' · ')}</p>` : ''}
          <p class="case-desc">${c.desc}</p>
          <div class="case-footer">
            <span class="case-total">${total ? `총 ${formatWon(total)}` : '📷 시공 전·후 보기'}</span>
            <span class="btn-detail">자세히 보기 →</span>
          </div>
        </div>
      </article>`;
  }).join('');

  // ── 페이지네이터 ──
  if (paginator) {
    if (totalPages <= 1) {
      paginator.innerHTML = '';
    } else {
      const btns = [];
      btns.push(`<button class="page-btn page-prev" data-page="${casePage - 1}" ${casePage === 0 ? 'disabled' : ''}>&#8249;</button>`);
      for (let i = 0; i < totalPages; i++) {
        btns.push(`<button class="page-btn${i === casePage ? ' active' : ''}" data-page="${i}">${i + 1}</button>`);
      }
      btns.push(`<button class="page-btn page-next" data-page="${casePage + 1}" ${casePage === totalPages - 1 ? 'disabled' : ''}>&#8250;</button>`);
      paginator.innerHTML = btns.join('');
      paginator.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          casePage = Number(btn.dataset.page);
          renderCards();
          document.getElementById('cases').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }

  grid.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(card.dataset.id); });
  });
}

// ─────────────────────────────────────────────
//  갤러리 캐러셀 상태
// ─────────────────────────────────────────────
let _galleryPhotos = [];
let _galleryIdx    = 0;

// ─────────────────────────────────────────────
//  회사소개 사진 라이트박스
// ─────────────────────────────────────────────
let _aboutLbPhotos = [];
let _aboutLbIdx    = 0;

function initAboutLightbox() {
  const lb = document.createElement('div');
  lb.id = 'aboutLightbox';
  lb.className = 'about-lb hidden';
  lb.innerHTML = `
    <button class="about-lb-close" id="aboutLbClose">✕</button>
    <button class="about-lb-arrow about-lb-prev hidden" id="aboutLbPrev">&#8249;</button>
    <img class="about-lb-img" id="aboutLbImg" src="" alt="회사 사진" />
    <button class="about-lb-arrow about-lb-next hidden" id="aboutLbNext">&#8250;</button>
    <div class="about-lb-counter hidden" id="aboutLbCounter"></div>`;
  document.body.appendChild(lb);

  lb.addEventListener('click', e => { if (e.target === lb) closeAboutLightbox(); });
  document.getElementById('aboutLbClose').addEventListener('click', closeAboutLightbox);
  document.getElementById('aboutLbPrev').addEventListener('click', () => aboutLbGoTo(_aboutLbIdx - 1));
  document.getElementById('aboutLbNext').addEventListener('click', () => aboutLbGoTo(_aboutLbIdx + 1));

  let _lbTouchX = 0;
  lb.addEventListener('touchstart', e => { _lbTouchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - _lbTouchX;
    if (Math.abs(dx) > 48) aboutLbGoTo(_aboutLbIdx + (dx < 0 ? 1 : -1));
  });
}

function openAboutLightbox(photos, idx) {
  _aboutLbPhotos = photos;
  aboutLbGoTo(idx);
  document.getElementById('aboutLightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAboutLightbox() {
  document.getElementById('aboutLightbox').classList.add('hidden');
  const _cm = document.getElementById('caseModal');
  document.body.style.overflow = (_cm && !_cm.classList.contains('hidden')) ? 'hidden' : '';
}

function aboutLbGoTo(idx) {
  _aboutLbIdx = Math.max(0, Math.min(idx, _aboutLbPhotos.length - 1));
  document.getElementById('aboutLbImg').src = _aboutLbPhotos[_aboutLbIdx];
  const multi = _aboutLbPhotos.length > 1;
  document.getElementById('aboutLbCounter').classList.toggle('hidden', !multi);
  if (multi) document.getElementById('aboutLbCounter').textContent = `${_aboutLbIdx + 1} / ${_aboutLbPhotos.length}`;
  document.getElementById('aboutLbPrev').classList.toggle('hidden', _aboutLbIdx === 0);
  document.getElementById('aboutLbNext').classList.toggle('hidden', _aboutLbIdx === _aboutLbPhotos.length - 1);
}

function galleryGoTo(idx) {
  if (!_galleryPhotos.length) return;
  _galleryIdx = Math.max(0, Math.min(idx, _galleryPhotos.length - 1));
  const img = document.getElementById('galMainImg');
  if (img) {
    img.style.opacity = '0';
    setTimeout(() => { img.src = _galleryPhotos[_galleryIdx]; img.style.opacity = '1'; }, 80);
  }
  const counter = document.getElementById('galCounter');
  if (counter) counter.textContent = `${_galleryIdx + 1} / ${_galleryPhotos.length}`;
  document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
    t.classList.toggle('active', i === _galleryIdx);
    if (i === _galleryIdx) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  const prev = document.getElementById('galPrev');
  const next = document.getElementById('galNext');
  if (prev) prev.disabled = _galleryIdx === 0;
  if (next) next.disabled = _galleryIdx === _galleryPhotos.length - 1;
}

function initGalleryEvents() {
  const prev  = document.getElementById('galPrev');
  const next  = document.getElementById('galNext');
  const main  = document.getElementById('galMain');
  if (prev) prev.addEventListener('click', () => galleryGoTo(_galleryIdx - 1));
  if (next) next.addEventListener('click', () => galleryGoTo(_galleryIdx + 1));
  document.querySelectorAll('.gallery-thumb').forEach((t, i) =>
    t.addEventListener('click', () => galleryGoTo(i))
  );
  // 터치 스와이프
  let _tx = 0;
  if (main) {
    main.addEventListener('touchstart', e => { _tx = e.touches[0].clientX; }, { passive: true });
    main.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - _tx;
      if (Math.abs(dx) > 48) galleryGoTo(_galleryIdx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
}

// ─────────────────────────────────────────────
//  모달
// ─────────────────────────────────────────────
function openModal(id) {
  const c = CASES.find(x => x.id === id);
  if (!c) return;
  currentModalCaseId = id;

  const total = caseTotal(c);
  const mats = c.materials || [];
  const matTotal = mats.reduce((a, m) => a + m.qty * m.unit_price, 0);
  const ba = caseBA(c);

  document.getElementById('modalTitle').textContent = c.title;
  document.getElementById('modalMeta').textContent =
    [`${c.region} ${c.district}`, c.location, c.apt_size ? `${c.apt_size}평` : '', c.duration ? `시공 ${c.duration}일` : '', c.date].filter(Boolean).join(' · ');

  // 갤러리 — admin에서 업로드한 사진 전체 (c001, c001-1, c001-2, ...) 수집
  const uploadedPhotos = (() => {
    const result = [];
    if (casePhotoMap[id]) result.push(casePhotoMap[id]);
    let n = 1;
    while (casePhotoMap[`${id}-${n}`]) { result.push(casePhotoMap[`${id}-${n}`]); n++; }
    return result;
  })();
  const allPhotos = uploadedPhotos.length > 0 ? [...uploadedPhotos, ...(c.photos || [])] : (c.photos || []);

  // 캐러셀 상태 초기화
  _galleryPhotos = allPhotos;
  _galleryIdx    = 0;

  const galleryHtml = ba
    ? `<div class="ba-compare">
        <figure class="ba-fig"><span class="ba-label ba-before">시공 전</span><img src="${ba.before}" alt="${c.title} 시공 전" data-ba="0" decoding="async" /></figure>
        <figure class="ba-fig"><span class="ba-label ba-after">시공 후</span><img src="${ba.after}" alt="${c.title} 시공 후" data-ba="1" decoding="async" /></figure>
      </div>
      <p class="ba-hint">사진을 누르면 크게 볼 수 있습니다.</p>`
    : allPhotos.length > 0
    ? `<div class="gallery-carousel">
        <div class="gallery-main" id="galMain">
          <img id="galMainImg" class="gallery-main-img" src="${allPhotos[0]}" alt="시공 사진 1" />
          ${allPhotos.length > 1 ? `
            <button class="gallery-arrow gallery-prev" id="galPrev" ${allPhotos.length <= 1 ? 'disabled' : ''}>&#8249;</button>
            <button class="gallery-arrow gallery-next" id="galNext">&#8250;</button>
            <div class="gallery-counter" id="galCounter">1 / ${allPhotos.length}</div>` : ''}
        </div>
        ${allPhotos.length > 1 ? `
        <div class="gallery-thumbs">
          ${allPhotos.map((p, i) => `<img class="gallery-thumb${i === 0 ? ' active' : ''}" loading="lazy" decoding="async" src="${p}" alt="썸네일 ${i + 1}" data-idx="${i}" />`).join('')}
        </div>` : ''}
      </div>`
    : `<div class="gallery-placeholder">
        <div class="photo-slot"><span class="photo-slot-text">시공 전<br><small>사진 등록 예정</small></span></div>
        <div class="photo-slot"><span class="photo-slot-text">시공 중<br><small>사진 등록 예정</small></span></div>
        <div class="photo-slot"><span class="photo-slot-text">세부 사진<br><small>사진 등록 예정</small></span></div>
        <div class="photo-slot photo-slot-wide"><span class="photo-slot-text">시공 완료<br><small>사진 등록 예정</small></span></div>
      </div>`;

  // 시공 정보 (값이 있는 항목만 표시)
  const infoRows = [
    ['주소', c.info && c.info.address], ['아파트', c.info && c.info.apt_name],
    ['욕실 유형', c.location], ['평수', c.apt_size ? `${c.apt_size}평` : ''],
    ['시공일', c.date], ['시공기간', c.duration ? `${c.duration}일` : ''], ['콘셉트', c.concept],
  ].filter(r => r[1]);
  const costHtml = total
    ? `<p class="modal-sec-title">공사비 내역</p>
      <table class="est-table">
        <tbody>
          <tr><td>자재비</td><td>${formatWon(c.costs.material)}</td></tr>
          <tr><td>시공 인건비</td><td>${formatWon(c.costs.labor)}</td></tr>
          <tr><td>철거비</td><td>${formatWon(c.costs.demolition)}</td></tr>
          <tr><td>방수비</td><td>${formatWon(c.costs.waterproofing)}</td></tr>
          <tr><td>기타 (운반 등)</td><td>${formatWon(c.costs.misc)}</td></tr>
        </tbody>
        <tfoot>
          <tr><td><strong>총 합계</strong></td><td><strong>${formatWon(total)}</strong></td></tr>
        </tfoot>
      </table>`
    : `<p class="modal-sec-title">시공 비용 안내</p>
      <p class="modal-cost-note">시공 비용은 욕실 크기, 철거 범위, 선택 자재에 따라 달라집니다.<br>무료 견적으로 예상 비용을 확인해 보세요.</p>`;
  const infoHtml = `
    <div class="modal-col">
      <p class="modal-sec-title">시공 정보</p>
      <table class="info-table">
        ${infoRows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}
      </table>
      <p class="modal-desc">${c.desc || ''}</p>
      <div class="modal-tags">${(c.tags || []).map(t => `<span class="tag">#${t}</span>`).join('')}</div>
    </div>
    <div class="modal-col">${costHtml}</div>`;

  // 자재 내역 (자재 정보가 있는 사례만)
  const matHtml = mats.length ? `
    <p class="modal-sec-title" style="margin-top:0">선택 자재 내역</p>
    <table class="est-table mat-table">
      <thead><tr><th>품목</th><th>브랜드</th><th>수량</th><th class="tr">금액</th></tr></thead>
      <tbody>
        ${mats.map(m => `
          <tr>
            <td>${m.name}</td>
            <td class="muted">${m.brand}</td>
            <td>${m.qty}${m.unit}</td>
            <td class="tr">${formatWon(m.qty * m.unit_price)}</td>
          </tr>`).join('')}
      </tbody>
      <tfoot>
        <tr><td colspan="3"><strong>자재 소계</strong></td><td class="tr"><strong>${formatWon(matTotal)}</strong></td></tr>
      </tfoot>
    </table>` : '';

  document.getElementById('modalBody').innerHTML = `
    ${galleryHtml}
    <div class="modal-grid">${infoHtml}</div>
    ${matHtml ? `<div class="modal-mat">${matHtml}</div>` : ''}
  `;

  // 전/후 사진 확대 보기
  document.querySelectorAll('#modalBody .ba-fig img').forEach(img => {
    img.addEventListener('click', () => openAboutLightbox([ba.before, ba.after], Number(img.dataset.ba)));
  });

  // 캐러셀 이벤트 바인딩 (DOM 삽입 후)
  if (!ba && _galleryPhotos.length > 1) initGalleryEvents();

  document.getElementById('caseModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('caseModal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ─────────────────────────────────────────────
//  초기화
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
//  시공사례 → 견적 앱 연동
// ─────────────────────────────────────────────
const CASE_REF_KEY = 'bathroom_case_ref';
let currentModalCaseId = null;

function saveCaseRefAndNavigate() {
  const c = CASES.find(x => x.id === currentModalCaseId);
  localStorage.setItem('bathroom_force_step1', '1');
  if (!c) { location.href = './bathroom.html'; return; }
  const totalCost = caseTotal(c);
  if (!totalCost) { location.href = './bathroom.html'; return; }   // 비용 정보가 없는 사례는 참고 사례 연동 없이 견적 시작
  const ref = {
    id: c.id, title: c.title, concept: c.concept,
    region: c.region, district: c.district, location: c.location,
    apt_size: c.apt_size, thumbBg: c.thumbBg, date: c.date,
    totalCost, materialCost: c.costs.material, laborCost: c.costs.labor,
    tags: c.tags,
  };
  localStorage.setItem(CASE_REF_KEY, JSON.stringify(ref));
  location.href = './bathroom.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // 커스텀 시공사례 localStorage 병합 (Excel 가져오기로 추가된 사례)
  try {
    const _custom = JSON.parse(localStorage.getItem('bathroom_cases_custom') || '[]');
    _custom.forEach(cc => {
      const idx = CASES.findIndex(c => c.id === cc.id);
      if (idx >= 0) CASES[idx] = cc; else CASES.push(cc);
    });
    if (_custom.length) FEATURED = FEATURED_IDS.map(id => CASES.find(c => c.id === id)).filter(Boolean);
  } catch (e) {}

  loadCasePhotos();
  renderSlider();
  renderInfoSection();
  renderAboutSection();
  document.getElementById('sliderPrev')?.addEventListener('click', () => goToSlide(sliderIdx - 1));
  document.getElementById('sliderNext')?.addEventListener('click', () => goToSlide(sliderIdx + 1));
  document.getElementById('modalStartBtn')?.addEventListener('click', saveCaseRefAndNavigate);

  // 창 리사이즈 시 슬라이드 위치 재계산
  window.addEventListener('resize', () => updateSliderPos(false), { passive: true });

  renderCards();

  // 지역 필터
  document.querySelectorAll('#regionFilter .fchip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeRegion = btn.dataset.region;
      casePage = 0;
      document.querySelectorAll('#regionFilter .fchip').forEach(b => b.classList.toggle('active', b === btn));
      renderCards();
    });
  });

  // 위치 필터
  document.querySelectorAll('#locationFilter .fchip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeLocation = btn.dataset.location;
      casePage = 0;
      document.querySelectorAll('#locationFilter .fchip').forEach(b => b.classList.toggle('active', b === btn));
      renderCards();
    });
  });

  // 검색
  document.getElementById('caseSearch').addEventListener('input', e => {
    searchQuery = e.target.value;
    casePage = 0;
    renderCards();
  });

  // 모달 닫기
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    const isLbOpen = !document.getElementById('aboutLightbox').classList.contains('hidden');
    if (isLbOpen) {
      if (e.key === 'Escape')     { closeAboutLightbox(); return; }
      if (e.key === 'ArrowLeft')  { aboutLbGoTo(_aboutLbIdx - 1); return; }
      if (e.key === 'ArrowRight') { aboutLbGoTo(_aboutLbIdx + 1); return; }
    }
    if (e.key === 'Escape') { closeModal(); return; }
    const isModalOpen = !document.getElementById('caseModal').classList.contains('hidden');
    if (!isModalOpen) return;
    if (e.key === 'ArrowLeft')  galleryGoTo(_galleryIdx - 1);
    if (e.key === 'ArrowRight') galleryGoTo(_galleryIdx + 1);
  });

  initAboutLightbox();

  // 네비 스크롤 효과
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // 견적 의뢰 현황 게시판
  renderInquiryBoard();
  // 소셜 플로팅 버튼 + 채팅 위젯
  renderSocialFloat();
  initChatWidget();
});

function renderSocialFloat() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('bathroom_social_links') || '{}'); } catch {}
  const links = [
    { key: 'blog',      label: '블로그',      cls: 'sfb-blog',      url: s.blog,
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>` },
    { key: 'instagram', label: '인스타그램',  cls: 'sfb-instagram',  url: s.instagram,
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>` },
    { key: 'youtube',   label: '유튜브',      cls: 'sfb-youtube',    url: s.youtube,
      icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.2 31.2 0 0024 12a31.2 31.2 0 00-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>` },
  ].filter(l => l.url);

  const wrap = document.createElement('div');
  wrap.className = 'social-float';
  const socialHtml = links.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener" class="social-float-btn ${l.cls}" title="${l.label}" aria-label="${l.label}">
      ${l.icon}<span class="sfb-label">${l.label}</span>
    </a>`).join('');
  const divider = links.length ? '<div class="sfb-divider"></div>' : '';
  wrap.innerHTML = socialHtml + divider + `
    <button class="social-float-btn sfb-chat" id="chatOpenBtn" title="상담 문의하기" aria-label="상담 문의하기">
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" style="margin-left:15px;flex-shrink:0"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      <span class="sfb-label">상담 문의</span>
    </button>`;
  document.body.appendChild(wrap);
}

// ── 채팅 위젯 ──────────────────────────────────────────────────────────────
const CHAT_KEY = 'bathroom_chat_sessions';
function _getChatSessions() { try { return JSON.parse(localStorage.getItem(CHAT_KEY) || '[]'); } catch { return []; } }
function _setChatSessions(a) { localStorage.setItem(CHAT_KEY, JSON.stringify(a)); }
function _chatTs(d) { return (d||new Date()).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}); }
function _chatEsc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }

function _chatBubble(role, text, ts) {
  const safe = _chatEsc(text);
  return role === 'agent'
    ? `<div class="chat-row chat-row-a"><span class="chat-av">🛁</span><div><div class="chat-bub chat-bub-a">${safe}</div><span class="chat-ts">${ts}</span></div></div>`
    : `<div class="chat-row chat-row-u"><div><div class="chat-bub chat-bub-u">${safe}</div><span class="chat-ts">${ts}</span></div></div>`;
}

function initChatWidget() {
  // 상담 문의 접수 폼: 고객이 연락처와 문의를 남기면 관리자 이메일로 전달됩니다.
  // (예전 '실시간 채팅'은 메시지가 고객 브라우저에만 저장돼 관리자에게 전달되지 않았습니다)
  const CONSENT = '<strong>[필수] 개인정보 수집·이용 동의</strong><br>항목: 이름(선택), 연락처, 문의 내용 / 목적: 상담 문의 응대 / 보유기간: 상담 종료 후 1년(요청 시 즉시 삭제)';

  // 사이트 하단 연락처에서 전화번호·운영시간을 읽어 안내에 사용 (한 곳에서만 관리)
  function contactInfo() {
    const box = document.querySelector('.footer-contact');
    const m = ((box && box.textContent) || '').match(/0\d{1,2}-?\d{3,4}-?\d{4}/);
    const hours = (document.querySelector('.footer-hours') || {}).textContent;
    return { phone: m ? m[0] : '', hours: hours ? hours.trim() : '' };
  }
  const ci = contactInfo();
  const callLine = ci.phone
    ? `급하시면 전화 주세요: <a href="tel:${ci.phone.replace(/\D/g, '')}">${ci.phone}</a>${ci.hours ? ' · ' + ci.hours : ''}`
    : '';

  const win = document.createElement('div');
  win.id = 'chatWin';
  win.className = 'chat-win chat-form-win hidden';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', '상담 문의');
  win.innerHTML = `
    <div class="chat-win-head">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.5rem;line-height:1">🛁</span>
        <div>
          <p style="margin:0;font-weight:800;font-size:.92rem;color:#fff">모던인테리어 상담 문의</p>
          <p style="margin:0;font-size:.74rem;color:rgba(255,255,255,.75)">연락처를 남겨주시면 확인 후 연락드립니다</p>
        </div>
      </div>
      <button type="button" class="chat-win-x" id="chatWinClose" aria-label="닫기">✕</button>
    </div>
    <div class="cform-body">
      <form id="cform" novalidate>
        <label class="cform-label">이름 <span>(선택)</span>
          <input id="cformName" type="text" maxlength="40" autocomplete="name" placeholder="예: 홍길동">
        </label>
        <label class="cform-label">연락처 <b>*</b>
          <input id="cformPhone" type="tel" inputmode="tel" maxlength="20" autocomplete="tel" placeholder="010-0000-0000">
        </label>
        <label class="cform-label">문의 내용 <b>*</b>
          <textarea id="cformMsg" rows="4" maxlength="1000" placeholder="예: 24평 아파트 욕실 2개 전체 리모델링 비용이 궁금합니다."></textarea>
        </label>
        <input id="cformWebsite" class="cform-hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="cform-consent"><input type="checkbox" id="cformConsent"><span>${CONSENT}</span></label>
        <p class="cform-error" id="cformError" role="alert" hidden></p>
        <button type="submit" class="cform-submit" id="cformSubmit">문의 접수하기</button>
        ${callLine ? `<p class="cform-call">${callLine}</p>` : ''}
      </form>
      <div class="cform-done" id="cformDone" hidden>
        <div class="cform-done-icon">✅</div>
        <p class="cform-done-title">접수되었습니다</p>
        <p class="cform-done-sub">남겨주신 연락처로 확인 후 연락드리겠습니다.</p>
        <button type="button" class="cform-again" id="cformAgain">새 문의 작성</button>
      </div>
    </div>`;
  document.body.appendChild(win);

  const $ = id => document.getElementById(id);
  const openBtn = $('chatOpenBtn');
  let attemptId = null;                    // 같은 접수를 재전송해도 서버가 중복으로 처리하도록 유지

  function openChat() {
    win.classList.remove('hidden');
    openBtn.classList.add('sfb-chat-open');
    setTimeout(() => { const f = $('cformName'); if (f && !$('cform').hidden) f.focus(); }, 50);
  }
  function closeChat() {
    win.classList.add('hidden');
    openBtn.classList.remove('sfb-chat-open');
  }
  function showError(msg) { const e = $('cformError'); e.textContent = msg; e.hidden = false; }
  function clearError() { $('cformError').hidden = true; }

  $('chatWinClose').addEventListener('click', closeChat);
  openBtn.addEventListener('click', () => win.classList.contains('hidden') ? openChat() : closeChat());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !win.classList.contains('hidden')) closeChat(); });

  async function send(payload) {
    const endpoint = window.INQUIRY_ENDPOINT;   // inquiry-sender.js 에서 설정 (견적 접수와 같은 주소)
    if (!endpoint) return { ok: false, error: 'not-configured' };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },   // CORS preflight 없이 전송
        body: JSON.stringify(Object.assign({ kind: 'chat' }, payload)),
        signal: ctrl.signal
      });
      const data = await res.json();
      return data && data.ok ? { ok: true } : { ok: false, error: (data && data.error) || 'server-error' };
    } catch (err) {
      return { ok: false, error: err && err.name === 'AbortError' ? 'timeout' : 'network' };
    } finally {
      clearTimeout(timer);
    }
  }

  $('cform').addEventListener('submit', async e => {
    e.preventDefault();
    clearError();
    const name = $('cformName').value.trim();
    const phone = $('cformPhone').value.trim();
    const message = $('cformMsg').value.trim();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 11) { showError('연락처를 숫자 9~11자리로 정확히 입력해 주세요.'); $('cformPhone').focus(); return; }
    if (!message) { showError('문의 내용을 입력해 주세요.'); $('cformMsg').focus(); return; }
    if (!$('cformConsent').checked) { showError('개인정보 수집·이용에 동의해 주세요.'); return; }

    if (!attemptId) attemptId = 'chat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const btn = $('cformSubmit');
    btn.disabled = true; btn.textContent = '전송 중...';
    const result = await send({ id: attemptId, name, phone, message, website: $('cformWebsite').value });
    btn.disabled = false; btn.textContent = '문의 접수하기';

    if (!result.ok) {
      const tail = ci.phone ? ` 급하시면 ${ci.phone}로 전화 주세요.` : '';
      showError(result.error === 'not-configured'
        ? '상담 접수 설정이 아직 완료되지 않았습니다.' + tail
        : result.error === 'busy'
          ? '지금 문의가 몰려 접수가 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' + tail
          : '전송에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.' + tail);
      return;
    }
    // 전송 성공 → 접수 완료 화면 (개인정보는 이 브라우저에 저장하지 않음)
    attemptId = null;
    $('cform').hidden = true;
    $('cformDone').hidden = false;
  });

  $('cformAgain').addEventListener('click', () => {
    $('cform').reset();
    clearError();
    $('cformDone').hidden = true;
    $('cform').hidden = false;
    $('cformName').focus();
  });
}

let _inqPage = 0;
const INQ_PAGE_SIZE = 10;

function renderInquiryBoard(page) {
  const wrap = document.getElementById('inqBoardWrap');
  if (!wrap) return;

  let list = [];
  try { list = JSON.parse(localStorage.getItem('bathroom_inquiries') || '[]'); } catch { list = []; }

  // 날짜 내림차순 정렬 (최신순)
  list = [...list].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  if (!list.length) {
    wrap.innerHTML = '<p class="inq-board-empty muted">등록된 견적 의뢰가 없습니다.</p>';
    return;
  }

  const totalPages = Math.ceil(list.length / INQ_PAGE_SIZE);
  if (page !== undefined) _inqPage = Math.max(0, Math.min(page, totalPages - 1));
  const start = _inqPage * INQ_PAGE_SIZE;
  const pageList = list.slice(start, start + INQ_PAGE_SIZE);

  const statusLabel = { new: '신규 접수', reviewing: '검토중', completed: '완료' };
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const typeLabel = { bathroom: '욕실', commercial: '상가', interior: '종합인테리어' };
  const typeColor = { bathroom: '#dbeafe:#1e40af', commercial: '#fef3c7:#92400e', interior: '#d1fae5:#065f46' };
  const rows = pageList.map((inq, idx) => {
    const c = inq.customer || {};
    const dt = new Date(inq.submittedAt);
    const dateStr = isNaN(dt) ? '—' : dt.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const addr = c.address ? (c.address.length > 22 ? c.address.substring(0, 22) + '…' : c.address) : '—';
    const status = inq.status || 'new';
    const etype = inq.estimateType || 'bathroom';
    const [tbg, tco] = (typeColor[etype] || typeColor.bathroom).split(':');
    const typeBadge = `<span style="display:inline-block;font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${tbg};color:${tco};white-space:nowrap">${typeLabel[etype] || etype}</span>`;
    // type-specific secondary info
    let info2 = '', info3 = '';
    if (etype === 'commercial') {
      info2 = c.area ? `${c.area}㎡` : '—';
      info3 = c.shopType || c.shopName || '—';
    } else if (etype === 'interior') {
      info2 = c.aptSize ? `${c.aptSize}평대` : '—';
      info3 = '전체 리모델링';
    } else {
      info2 = c.aptSize ? `${c.aptSize}평대` : '—';
      info3 = c.bathroomCount ? `욕실 ${c.bathroomCount}개` : '—';
    }
    return `<tr>
      <td class="muted-cell" style="font-size:.8rem;font-weight:600;width:40px">${start + idx + 1}</td>
      <td>${typeBadge}</td>
      <td>${esc(addr)}</td>
      <td style="text-align:center;white-space:nowrap">${esc(info2)}</td>
      <td style="text-align:center;white-space:nowrap;font-size:.82rem;color:var(--muted)">${esc(info3)}</td>
      <td class="muted-cell" style="text-align:center;white-space:nowrap">${dateStr}</td>
      <td style="text-align:center"><span class="inq-status-badge ${esc(status)}">${esc(statusLabel[status] || status)}</span></td>
    </tr>`;
  }).join('');

  const pagination = totalPages > 1 ? `
    <div class="inq-pagination">
      <button class="inq-pg-btn" onclick="renderInquiryBoard(${_inqPage - 1})" ${_inqPage === 0 ? 'disabled' : ''}>← 이전</button>
      <span class="inq-pg-info">${_inqPage + 1} / ${totalPages} 페이지</span>
      <button class="inq-pg-btn" onclick="renderInquiryBoard(${_inqPage + 1})" ${_inqPage >= totalPages - 1 ? 'disabled' : ''}>다음 →</button>
    </div>` : '';

  wrap.innerHTML = `<div class="inq-board-wrap">
    <table class="inq-board-table">
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th style="width:80px">유형</th>
          <th>주소</th>
          <th style="text-align:center">규모</th>
          <th style="text-align:center">구분</th>
          <th style="text-align:center">의뢰 날짜</th>
          <th style="text-align:center">진행 상태</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>${pagination}`;
}
