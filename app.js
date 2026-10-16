const KRW = new Intl.NumberFormat('ko-KR');
const STORAGE_KEY = 'modern-bathroom-pwa-v3';
const QUOTE_TYPE = 'modern-bathroom-estimate-v3';
const bathroomNames = ['욕실 1', '욕실 2', '욕실 3'];

const areaProfiles = {
  common: { 18: { floor: 2.4, wall: 18.0 }, 24: { floor: 2.8, wall: 21.5 }, 32: { floor: 3.2, wall: 24.5 }, 40: { floor: 3.6, wall: 28.0 }, 50: { floor: 4.2, wall: 32.0 } },
  master: { 18: { floor: 2.8, wall: 21.0 }, 24: { floor: 3.4, wall: 25.5 }, 32: { floor: 4.1, wall: 30.5 }, 40: { floor: 4.8, wall: 36.0 }, 50: { floor: 5.6, wall: 42.0 } },
  powder: { 18: { floor: 1.6, wall: 13.0 }, 24: { floor: 1.8, wall: 14.2 }, 32: { floor: 2.0, wall: 16.0 }, 40: { floor: 2.2, wall: 17.6 }, 50: { floor: 2.4, wall: 19.0 } }
};

const WORK_COSTS_KEY = 'bathroom_work_costs';
const DEFAULT_WORK_COSTS = {
  demolition_partial: 380000,
  demolition_full:    700000,
  demolition_overlay: 220000,
  plumbing:           350000,
  waterproof:         280000,
  waterproof_basic:   150000,
  ceiling:            250000,
  electrical:         180000,
  heatingFanExtra:    120000,
  fixtureInstall:     320000,
  cleanup:            150000,
  luxuryFactor:       12,
  reserveFactor:      5,
  extraTile_basic:    45000,
  extraTile_mid:      65000,
  extraTile_premium:  100000,
};
function getWorkCosts() {
  try {
    const saved = JSON.parse(localStorage.getItem(WORK_COSTS_KEY) || 'null');
    return saved ? { ...DEFAULT_WORK_COSTS, ...saved } : { ...DEFAULT_WORK_COSTS };
  } catch { return { ...DEFAULT_WORK_COSTS }; }
}

let catalog = [
  { id:'wall-basic-white', group:'wallTile', category:'벽타일', brand:'이누스', name:'베이직 화이트 벽타일', model:'WT-3060-WH', price:26000, unit:'박스', coverage:1.44, desc:'300x600 무광 화이트 벽타일' },
  { id:'wall-stone-gray', group:'wallTile', category:'벽타일', brand:'이즈세라믹', name:'스톤그레이 벽타일', model:'ISW-3060-GR', price:32000, unit:'박스', coverage:1.44, desc:'300x600 스톤 패턴 벽타일' },
  { id:'wall-premium-beige', group:'wallTile', category:'벽타일', brand:'대림바스', name:'프리미엄 베이지 벽타일', model:'DL-WB-601', price:39000, unit:'박스', coverage:1.44, desc:'고급 무광 베이지 벽타일' },
  { id:'floor-basic-gray', group:'floorTile', category:'바닥타일', brand:'이누스', name:'논슬립 그레이 바닥타일', model:'FT-300-GY', price:29000, unit:'박스', coverage:1.0, desc:'미끄럼방지 포세린 바닥타일' },
  { id:'floor-dark-stone', group:'floorTile', category:'바닥타일', brand:'이즈세라믹', name:'다크스톤 바닥타일', model:'ISF-300-DS', price:36000, unit:'박스', coverage:1.0, desc:'짙은톤 논슬립 포세린' },
  { id:'floor-premium-concrete', group:'floorTile', category:'바닥타일', brand:'대림바스', name:'프리미엄 콘크리트 바닥타일', model:'DL-F-301', price:42000, unit:'박스', coverage:1.0, desc:'고급 콘크리트 질감 바닥타일' },
  { id:'toilet-twopiece-basic', group:'toilet', category:'양변기', brand:'계림', name:'투피스 양변기 기본형', model:'KL-TP-101', price:210000, unit:'EA', desc:'기본형 투피스 양변기' },
  { id:'toilet-skirted-mid', group:'toilet', category:'양변기', brand:'대림바스', name:'치마형 양변기 중급형', model:'CC-550PWF', price:645000, unit:'EA', desc:'관리 편한 치마형 디자인' },
  { id:'toilet-bidet-premium', group:'toilet', category:'양변기', brand:'아메리칸스탠다드', name:'비데일체형 프리미엄', model:'AS-BD-900', price:1380000, unit:'EA', desc:'고급형 비데 일체형 양변기' },
  { id:'basin-pedestal-basic', group:'basin', category:'세면기', brand:'계림', name:'반다리 세면기', model:'L-340UF', price:206800, unit:'EA', desc:'기본형 반다리 세면기' },
  { id:'basin-vanity-mid', group:'basin', category:'세면기', brand:'이누스', name:'하부장 세면기', model:'IL672E', price:149000, unit:'EA', desc:'수납형 하부장 세면기' },
  { id:'basin-counter-premium', group:'basin', category:'세면기', brand:'대림바스', name:'프리미엄 카운터 세면기', model:'PL-L4010', price:420000, unit:'EA', desc:'상판형 프리미엄 세면기' },
  { id:'faucet-basin-basic', group:'basinFaucet', category:'세면수전', brand:'대림바스', name:'세면수전 기본형', model:'DLB-3216', price:129000, unit:'EA', desc:'기본형 원홀 세면수전' },
  { id:'faucet-basin-mid', group:'basinFaucet', category:'세면수전', brand:'대림바스', name:'세면수전 중급형', model:'DLB-5612W', price:189000, unit:'EA', desc:'화이트 포인트 세면수전' },
  { id:'faucet-basin-premium', group:'basinFaucet', category:'세면수전', brand:'아메리칸스탠다드', name:'세면수전 프리미엄', model:'AS-LV-770', price:320000, unit:'EA', desc:'고급 크롬 피니시 세면수전' },
  { id:'faucet-shower-basic', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'샤워수전 기본형', model:'DLB-7316', price:165000, unit:'EA', desc:'기본형 샤워수전 세트' },
  { id:'faucet-shower-mid', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'레인샤워 수전 중급형', model:'DL-B7611', price:398000, unit:'EA', desc:'레인샤워 포함 중급형 세트' },
  { id:'faucet-shower-premium', group:'showerFaucet', category:'샤워수전', brand:'아메리칸스탠다드', name:'프리미엄 레인샤워', model:'AS-RS-920', price:690000, unit:'EA', desc:'고급형 레인샤워 시스템' },
  { id:'fan-basic', group:'fan', category:'환풍기', brand:'힘펠', name:'욕실 환풍기 기본형', model:'JV-201M', price:49000, unit:'EA', desc:'일반형 욕실 환풍기' },
  { id:'fan-mid', group:'fan', category:'환풍기', brand:'힘펠', name:'저소음 환풍기 중급형', model:'C2-100LF', price:89000, unit:'EA', desc:'저소음 환풍기' },
  { id:'fan-premium', group:'fan', category:'환풍기', brand:'힘펠', name:'휴젠뜨 난방/환기형', model:'FHD3-C150P', price:560000, unit:'EA', desc:'난방/제습/환기 복합형' },
  { id:'fan-hempel-timer', group:'fan', category:'환풍기', brand:'힘펠', name:'타이머 환풍기', model:'C-15T', price:95000, unit:'EA', desc:'타이머 내장 자동 꺼짐 환풍기' },
  { id:'fan-hempel-humid', group:'fan', category:'환풍기', brand:'힘펠', name:'습도감지 자동 환풍기', model:'C2-100DH', price:120000, unit:'EA', desc:'습도 자동 감지 환기 제어' },
  { id:'fan-hempel-led', group:'fan', category:'환풍기', brand:'힘펠', name:'LED 조명 환풍기', model:'C-15PE', price:145000, unit:'EA', desc:'LED 조명 + 환기 일체형' },
  { id:'fan-hempel-dc', group:'fan', category:'환풍기', brand:'힘펠', name:'DC 저소음 환풍기', model:'DC-100LF', price:165000, unit:'EA', desc:'DC 모터 초저소음 환풍기' },
  { id:'fan-hempel-erv', group:'fan', category:'환풍기', brand:'힘펠', name:'열회수형 환기장치', model:'ERV-100', price:380000, unit:'EA', desc:'에너지 절약 열회수 환기장치' },
  { id:'fan-cleantech-basic', group:'fan', category:'환풍기', brand:'크린텍', name:'욕실 환풍기 기본형', model:'CT-150', price:42000, unit:'EA', desc:'크린텍 일반형 욕실 환풍기' },
  { id:'fan-cleantech-low', group:'fan', category:'환풍기', brand:'크린텍', name:'저소음 환풍기', model:'CT-200L', price:68000, unit:'EA', desc:'크린텍 저소음 욕실 환풍기' },
  { id:'fan-cleantech-led', group:'fan', category:'환풍기', brand:'크린텍', name:'LED 조명 환풍기', model:'CT-LED150', price:98000, unit:'EA', desc:'크린텍 LED 조명 일체형 환풍기' },
  { id:'fan-panasonic-low', group:'fan', category:'환풍기', brand:'파나소닉', name:'저소음 환풍기', model:'FV-10NLS', price:75000, unit:'EA', desc:'파나소닉 저소음 욕실 환풍기' },
  { id:'fan-panasonic-mid', group:'fan', category:'환풍기', brand:'파나소닉', name:'중급 환풍기', model:'FV-16NLC', price:125000, unit:'EA', desc:'파나소닉 중급형 욕실 환풍기' },
  { id:'fan-panasonic-heat', group:'fan', category:'환풍기', brand:'파나소닉', name:'난방 환풍기', model:'FV-30BH2', price:290000, unit:'EA', desc:'파나소닉 욕실 난방·환기 복합형' },
  { id:'fan-rinnai-heat', group:'fan', category:'환풍기', brand:'린나이', name:'욕실 난방 환풍기', model:'RBH-S240', price:285000, unit:'EA', desc:'린나이 욕실 난방+환기 복합형' },
  { id:'ceiling-basic', group:'ceiling', category:'천장재', brand:'국산', name:'PVC 욕실천장 기본형', model:'PVC-01', price:45000, unit:'㎡', desc:'기본형 욕실 PVC 천장재' },
  { id:'ceiling-mid', group:'ceiling', category:'천장재', brand:'국산', name:'돔천장 중급형', model:'DOME-02', price:65000, unit:'㎡', desc:'돔형 천장 + 점검구' },
  { id:'ceiling-premium', group:'ceiling', category:'천장재', brand:'국산', name:'프리미엄 천장 마감', model:'CEIL-03', price:90000, unit:'㎡', desc:'고급 마감 천장재' },
  { id:'ceiling-pvc-ivory', group:'ceiling', category:'천장재', brand:'국산', name:'PVC 아이보리 천장', model:'PVC-IV-01', price:44000, unit:'㎡', desc:'아이보리 PVC 욕실 천장재' },
  { id:'ceiling-pvc-beige', group:'ceiling', category:'천장재', brand:'국산', name:'PVC 베이지 천장', model:'PVC-BG-01', price:44000, unit:'㎡', desc:'베이지 PVC 욕실 천장재' },
  { id:'ceiling-pvc-marble', group:'ceiling', category:'천장재', brand:'국산', name:'PVC 마블패턴 천장', model:'PVC-MB-01', price:52000, unit:'㎡', desc:'대리석 패턴 PVC 욕실 천장재' },
  { id:'ceiling-pvc-wood', group:'ceiling', category:'천장재', brand:'국산', name:'PVC 우드패턴 천장', model:'PVC-WD-01', price:55000, unit:'㎡', desc:'우드 패턴 PVC 욕실 천장재' },
  { id:'ceiling-dome-ivory', group:'ceiling', category:'천장재', brand:'국산', name:'돔천장 아이보리 + 점검구', model:'DOM-IV-02', price:62000, unit:'㎡', desc:'아이보리 돔형 천장 + 점검구' },
  { id:'ceiling-dome-beige', group:'ceiling', category:'천장재', brand:'국산', name:'돔천장 베이지 + 점검구', model:'DOM-BG-02', price:62000, unit:'㎡', desc:'베이지 돔형 천장 + 점검구' },
  { id:'ceiling-abs-moisture', group:'ceiling', category:'천장재', brand:'국산', name:'방습 ABS 천장', model:'ABS-MR-01', price:72000, unit:'㎡', desc:'고습도 욕실용 방습 ABS 천장재' },
  { id:'ceiling-alu-louver', group:'ceiling', category:'천장재', brand:'국산', name:'알루미늄 루버 천장', model:'ALU-LU-01', price:82000, unit:'㎡', desc:'알루미늄 루버 욕실 천장재' },
  { id:'ceiling-alu-louver-black', group:'ceiling', category:'천장재', brand:'국산', name:'알루미늄 루버 블랙 천장', model:'ALU-LU-BK', price:90000, unit:'㎡', desc:'블랙 알루미늄 루버 욕실 천장재' },
  { id:'ceiling-lux-light', group:'ceiling', category:'천장재', brand:'국산', name:'루버 + LED 조명 일체 천장', model:'LUX-LED-01', price:130000, unit:'㎡', desc:'루버 천장 + LED 간접 조명 일체형' },
  { id:'mirror-basic', group:'mirrorCabinet', category:'거울장', brand:'한샘', name:'기본 거울장', model:'HS-MC-100', price:140000, unit:'EA', desc:'기본 수납형 거울장' },
  { id:'mirror-led', group:'mirrorCabinet', category:'거울장', brand:'한샘', name:'LED 거울장', model:'HS-MC-200', price:260000, unit:'EA', desc:'LED 조명형 거울장' },
  { id:'mirror-premium', group:'mirrorCabinet', category:'거울장', brand:'대림바스', name:'프리미엄 슬라이드장', model:'DL-MR-301', price:420000, unit:'EA', desc:'고급 수납형 슬라이드장' },
  { id:'partition-basic', group:'partition', category:'파티션/부스', brand:'국산', name:'고정 유리 파티션', model:'PT-GL-01', price:280000, unit:'SET', desc:'오픈형 고정 유리 파티션' },
  { id:'partition-booth', group:'partition', category:'파티션/부스', brand:'국산', name:'샤워부스 세트', model:'PT-BT-02', price:620000, unit:'SET', desc:'문 포함 샤워부스' },
  { id:'bathtub-basic', group:'partition', category:'파티션/부스', brand:'국산', name:'욕조 포함형 세트', model:'BT-1500', price:780000, unit:'SET', desc:'욕조 설치형 세트' },
  { id:'drain-basic', group:'drain', category:'배수/트랩', brand:'국산', name:'배수구 + 트랩 기본형', model:'DR-01', price:65000, unit:'SET', desc:'기본 배수 부속 세트' },
  { id:'drain-premium', group:'drain', category:'배수/트랩', brand:'국산', name:'스테인리스 배수 세트', model:'DR-02', price:120000, unit:'SET', desc:'프리미엄 스테인리스 배수 세트' },
  { id:'accessory-basic', group:'accessory', category:'악세서리', brand:'대림바스', name:'기본 악세서리 3종', model:'ACC-100', price:70000, unit:'SET', desc:'휴지걸이, 수건걸이, 선반' },
  { id:'accessory-premium', group:'accessory', category:'악세서리', brand:'대림바스', name:'프리미엄 악세서리 5종', model:'ACC-300', price:180000, unit:'SET', desc:'고급 악세서리 패키지' },
  { id:'material-basic', group:'material', category:'부자재', brand:'국산', name:'줄눈/실리콘/접착제 기본', model:'MAT-100', price:180000, unit:'SET', desc:'기본 부자재 패키지' },
  { id:'material-premium', group:'material', category:'부자재', brand:'국산', name:'에폭시줄눈 포함 부자재', model:'MAT-300', price:320000, unit:'SET', desc:'고급 줄눈/실리콘 패키지' },

  { id:'wall-subway-white-gloss', group:'wallTile', category:'벽타일', brand:'이누스', name:'서브웨이 광택 화이트', model:'IT-2040-GW', price:25000, unit:'박스', coverage:0.96, desc:'200x400 광택 화이트 서브웨이 벽타일' },
  { id:'wall-subway-ivory-gloss', group:'wallTile', category:'벽타일', brand:'이누스', name:'서브웨이 광택 아이보리', model:'IT-2040-IV', price:25000, unit:'박스', coverage:0.96, desc:'200x400 광택 아이보리 서브웨이 벽타일' },
  { id:'wall-subway-white-mat', group:'wallTile', category:'벽타일', brand:'영림', name:'서브웨이 무광 화이트', model:'YL-2040-MWH', price:26000, unit:'박스', coverage:0.96, desc:'200x400 무광 화이트 서브웨이 벽타일' },
  { id:'wall-subway-gray-mat', group:'wallTile', category:'벽타일', brand:'영림', name:'서브웨이 무광 그레이', model:'YL-2040-MGR', price:27000, unit:'박스', coverage:0.96, desc:'200x400 무광 그레이 서브웨이 벽타일' },
  { id:'wall-subway-cream-mat', group:'wallTile', category:'벽타일', brand:'영림', name:'서브웨이 무광 크림', model:'YL-2040-MCR', price:27000, unit:'박스', coverage:0.96, desc:'200x400 무광 크림 서브웨이 벽타일' },
  { id:'wall-3060-gloss-white', group:'wallTile', category:'벽타일', brand:'이누스', name:'글로시 화이트 300x600', model:'IT-3060-GW', price:27000, unit:'박스', coverage:1.44, desc:'300x600 광택 화이트 벽타일' },
  { id:'wall-3060-natural-stone', group:'wallTile', category:'벽타일', brand:'이누스', name:'내추럴 스톤 300x600', model:'IT-3060-NS', price:33000, unit:'박스', coverage:1.44, desc:'300x600 내추럴 스톤 패턴 벽타일' },
  { id:'wall-3060-classic-white', group:'wallTile', category:'벽타일', brand:'영림', name:'클래식 화이트 300x600', model:'YL-3060-CW', price:24000, unit:'박스', coverage:1.44, desc:'300x600 무광 화이트 벽타일' },
  { id:'wall-3060-natural-beige', group:'wallTile', category:'벽타일', brand:'영림', name:'내추럴 베이지 300x600', model:'YL-3060-NB', price:28000, unit:'박스', coverage:1.44, desc:'300x600 내추럴 베이지 벽타일' },
  { id:'wall-3060-marble-cream', group:'wallTile', category:'벽타일', brand:'영림', name:'마블 크림 300x600', model:'YL-3060-MC', price:35000, unit:'박스', coverage:1.44, desc:'300x600 마블 크림 패턴 벽타일' },
  { id:'wall-3060-stone-blue', group:'wallTile', category:'벽타일', brand:'영림', name:'스톤 블루 300x600', model:'YL-3060-SB', price:32000, unit:'박스', coverage:1.44, desc:'300x600 스톤 블루 패턴 벽타일' },
  { id:'wall-3060-hansem-white', group:'wallTile', category:'벽타일', brand:'한샘', name:'화이트 무광 300x600', model:'HS-3060-WH', price:32000, unit:'박스', coverage:1.44, desc:'300x600 화이트 무광 욕실 벽타일' },
  { id:'wall-3060-hansem-gray', group:'wallTile', category:'벽타일', brand:'한샘', name:'그레이 무광 300x600', model:'HS-3060-GR', price:34000, unit:'박스', coverage:1.44, desc:'300x600 그레이 무광 욕실 벽타일' },
  { id:'wall-3060-hansem-beige', group:'wallTile', category:'벽타일', brand:'한샘', name:'베이지 무광 300x600', model:'HS-3060-BG', price:33000, unit:'박스', coverage:1.44, desc:'300x600 베이지 무광 욕실 벽타일' },
  { id:'wall-3060-lx-marble', group:'wallTile', category:'벽타일', brand:'LX하우시스', name:'마블 화이트 300x600', model:'LX-3060-MWH', price:38000, unit:'박스', coverage:1.44, desc:'300x600 마블 화이트 패턴 벽타일' },
  { id:'wall-3060-lx-stone', group:'wallTile', category:'벽타일', brand:'LX하우시스', name:'그레이 스톤 300x600', model:'LX-3060-GS', price:38000, unit:'박스', coverage:1.44, desc:'300x600 그레이 스톤 패턴 벽타일' },
  { id:'wall-3060-lx-beige', group:'wallTile', category:'벽타일', brand:'LX하우시스', name:'내추럴 베이지 300x600', model:'LX-3060-NB', price:40000, unit:'박스', coverage:1.44, desc:'300x600 내추럴 베이지 패턴 벽타일' },
  { id:'wall-3060-kcc-concrete', group:'wallTile', category:'벽타일', brand:'KCC글라스', name:'콘크리트 그레이 300x600', model:'KCC-3060-CG', price:36000, unit:'박스', coverage:1.44, desc:'300x600 콘크리트 그레이 무광 벽타일' },
  { id:'wall-3060-kcc-white', group:'wallTile', category:'벽타일', brand:'KCC글라스', name:'클린 화이트 300x600', model:'KCC-3060-WH', price:30000, unit:'박스', coverage:1.44, desc:'300x600 클린 화이트 광택 벽타일' },
  { id:'wall-3090-white', group:'wallTile', category:'벽타일', brand:'이누스', name:'무광 화이트 슬림 300x900', model:'IT-3090-WH', price:43000, unit:'박스', coverage:1.62, desc:'300x900 무광 화이트 세장형 벽타일' },
  { id:'wall-3090-beige', group:'wallTile', category:'벽타일', brand:'영림', name:'베이지 슬림 300x900', model:'YL-3090-BG', price:46000, unit:'박스', coverage:1.62, desc:'300x900 베이지 세장형 벽타일' },
  { id:'wall-3090-gray', group:'wallTile', category:'벽타일', brand:'한샘', name:'그레이 슬림 300x900', model:'HS-3090-GR', price:48000, unit:'박스', coverage:1.62, desc:'300x900 그레이 세장형 벽타일' },
  { id:'wall-3090-marble', group:'wallTile', category:'벽타일', brand:'LX하우시스', name:'대리석 패턴 슬림 300x900', model:'LX-3090-MB', price:56000, unit:'박스', coverage:1.62, desc:'300x900 대리석 패턴 세장형 벽타일' },
  { id:'wall-3090-stone', group:'wallTile', category:'벽타일', brand:'영림', name:'스톤 그레이 슬림 300x900', model:'YL-3090-SG', price:50000, unit:'박스', coverage:1.62, desc:'300x900 스톤 그레이 세장형 벽타일' },
  { id:'wall-6120-white', group:'wallTile', category:'벽타일', brand:'이누스', name:'대형 화이트 포세린 600x1200', model:'IT-6120-WH', price:72000, unit:'박스', coverage:1.44, desc:'600x1200 화이트 대형 포세린 벽타일' },
  { id:'wall-6120-gray', group:'wallTile', category:'벽타일', brand:'영림', name:'대형 그레이 포세린 600x1200', model:'YL-6120-GR', price:79000, unit:'박스', coverage:1.44, desc:'600x1200 그레이 대형 포세린 벽타일' },
  { id:'wall-6120-marble', group:'wallTile', category:'벽타일', brand:'LX하우시스', name:'프리미엄 마블 대형 600x1200', model:'LX-6120-PM', price:86000, unit:'박스', coverage:1.44, desc:'600x1200 마블 패턴 프리미엄 벽타일' },
  { id:'wall-6120-beige', group:'wallTile', category:'벽타일', brand:'한샘', name:'대형 베이지 포세린 600x1200', model:'HS-6120-BG', price:76000, unit:'박스', coverage:1.44, desc:'600x1200 베이지 대형 포세린 벽타일' },
  { id:'wall-hex-white', group:'wallTile', category:'벽타일', brand:'이누스', name:'헥사곤 화이트 모자이크', model:'IT-HEX-WH', price:33000, unit:'박스', coverage:0.9, desc:'헥사곤 화이트 포인트 모자이크 벽타일' },
  { id:'wall-hex-gray', group:'wallTile', category:'벽타일', brand:'영림', name:'헥사곤 그레이 모자이크', model:'YL-HEX-GR', price:36000, unit:'박스', coverage:0.9, desc:'헥사곤 그레이 포인트 모자이크 벽타일' },
  { id:'wall-hex-black', group:'wallTile', category:'벽타일', brand:'이누스', name:'헥사곤 블랙 모자이크', model:'IT-HEX-BK', price:38000, unit:'박스', coverage:0.9, desc:'헥사곤 블랙 포인트 모자이크 벽타일' },

  { id:'floor-200-white', group:'floorTile', category:'바닥타일', brand:'이누스', name:'논슬립 화이트 200x200', model:'FT-200-WH', price:26000, unit:'박스', coverage:1.0, desc:'200x200 논슬립 화이트 바닥타일' },
  { id:'floor-200-beige', group:'floorTile', category:'바닥타일', brand:'이누스', name:'논슬립 베이지 200x200', model:'FT-200-BG', price:26000, unit:'박스', coverage:1.0, desc:'200x200 논슬립 베이지 바닥타일' },
  { id:'floor-200-gray', group:'floorTile', category:'바닥타일', brand:'영림', name:'논슬립 그레이 200x200', model:'YL-F200-GR', price:28000, unit:'박스', coverage:1.0, desc:'200x200 논슬립 그레이 바닥타일' },
  { id:'floor-200-brown', group:'floorTile', category:'바닥타일', brand:'영림', name:'논슬립 브라운 200x200', model:'YL-F200-BR', price:28000, unit:'박스', coverage:1.0, desc:'200x200 논슬립 브라운 바닥타일' },
  { id:'floor-300-beige-inus', group:'floorTile', category:'바닥타일', brand:'이누스', name:'논슬립 베이지 300x300', model:'IT-F300-BG', price:30000, unit:'박스', coverage:0.99, desc:'300x300 논슬립 베이지 바닥타일' },
  { id:'floor-300-beige-yl', group:'floorTile', category:'바닥타일', brand:'영림', name:'논슬립 베이지 300x300', model:'YL-F300-BG', price:30000, unit:'박스', coverage:0.99, desc:'300x300 논슬립 베이지 바닥타일' },
  { id:'floor-300-white-hs', group:'floorTile', category:'바닥타일', brand:'한샘', name:'논슬립 화이트 300x300', model:'HS-F300-WH', price:33000, unit:'박스', coverage:0.99, desc:'300x300 논슬립 화이트 바닥타일' },
  { id:'floor-300-gray-lx', group:'floorTile', category:'바닥타일', brand:'LX하우시스', name:'논슬립 그레이 300x300', model:'LX-F300-GR', price:32000, unit:'박스', coverage:0.99, desc:'300x300 논슬립 그레이 바닥타일' },
  { id:'floor-300-stone-yl', group:'floorTile', category:'바닥타일', brand:'영림', name:'스톤 논슬립 300x300', model:'YL-F300-ST', price:38000, unit:'박스', coverage:0.99, desc:'300x300 스톤 패턴 논슬립 바닥타일' },
  { id:'floor-300-marble-yl', group:'floorTile', category:'바닥타일', brand:'영림', name:'대리석 논슬립 300x300', model:'YL-F300-MB', price:40000, unit:'박스', coverage:0.99, desc:'300x300 대리석 패턴 논슬립 바닥타일' },
  { id:'floor-300-brown-inus', group:'floorTile', category:'바닥타일', brand:'이누스', name:'우드 브라운 논슬립 300x300', model:'IT-F300-WD', price:35000, unit:'박스', coverage:0.99, desc:'300x300 우드 브라운 논슬립 바닥타일' },
  { id:'floor-600-gray-inus', group:'floorTile', category:'바닥타일', brand:'이누스', name:'대형 논슬립 그레이 600x600', model:'FT-600-GR', price:56000, unit:'박스', coverage:1.44, desc:'600x600 논슬립 그레이 대형 바닥타일' },
  { id:'floor-600-gray-yl', group:'floorTile', category:'바닥타일', brand:'영림', name:'대형 포세린 논슬립 600x600', model:'YL-F600-GR', price:62000, unit:'박스', coverage:1.44, desc:'600x600 포세린 논슬립 대형 바닥타일' },
  { id:'floor-600-gray-lx', group:'floorTile', category:'바닥타일', brand:'LX하우시스', name:'대형 포세린 논슬립 600x600', model:'LX-F600-GR', price:69000, unit:'박스', coverage:1.44, desc:'600x600 포세린 논슬립 대형 바닥타일' },
  { id:'floor-600-white-hs', group:'floorTile', category:'바닥타일', brand:'한샘', name:'대형 논슬립 600x600', model:'HS-F600-WH', price:60000, unit:'박스', coverage:1.44, desc:'600x600 대형 논슬립 바닥타일' },
  { id:'floor-600-marble-lx', group:'floorTile', category:'바닥타일', brand:'LX하우시스', name:'대형 마블 논슬립 600x600', model:'LX-F600-MB', price:78000, unit:'박스', coverage:1.44, desc:'600x600 마블 패턴 논슬립 대형 바닥타일' },
  { id:'floor-mosaic-white', group:'floorTile', category:'바닥타일', brand:'이누스', name:'안전 모자이크 바닥타일', model:'FT-MOS-WH', price:36000, unit:'박스', coverage:0.9, desc:'모자이크 논슬립 안전 바닥타일' },

  { id:'toilet-basic-inus', group:'toilet', category:'양변기', brand:'이누스', name:'투피스 양변기 기본형', model:'IN-TP-100', price:188000, unit:'EA', desc:'이누스 기본형 투피스 양변기' },
  { id:'toilet-basic-is', group:'toilet', category:'양변기', brand:'아이에스동서', name:'투피스 양변기 기본형', model:'IS-TP-201', price:199000, unit:'EA', desc:'아이에스동서 기본형 투피스 양변기' },
  { id:'toilet-basic-royal', group:'toilet', category:'양변기', brand:'로얄앤컴퍼니', name:'투피스 양변기', model:'RC-TP-100', price:225000, unit:'EA', desc:'로얄앤컴퍼니 기본형 투피스 양변기' },
  { id:'toilet-onepiece-basic', group:'toilet', category:'양변기', brand:'계림', name:'원피스 양변기 기본형', model:'KL-OP-110', price:268000, unit:'EA', desc:'계림 기본형 원피스 양변기' },
  { id:'toilet-onepiece-inus', group:'toilet', category:'양변기', brand:'이누스', name:'원피스 양변기 중급형', model:'IN-OP-400', price:385000, unit:'EA', desc:'이누스 원피스 중급형 양변기' },
  { id:'toilet-skirted-inus', group:'toilet', category:'양변기', brand:'이누스', name:'치마형 원피스 양변기', model:'IN-SK-300', price:425000, unit:'EA', desc:'이누스 치마형 원피스 양변기' },
  { id:'toilet-onepiece-daelim', group:'toilet', category:'양변기', brand:'대림바스', name:'원피스 양변기 중급형', model:'DL-OP-530', price:490000, unit:'EA', desc:'대림바스 원피스 중급형 양변기' },
  { id:'toilet-skirted-royal', group:'toilet', category:'양변기', brand:'로얄앤컴퍼니', name:'치마형 원피스 양변기', model:'RC-SK-300', price:455000, unit:'EA', desc:'로얄앤컴퍼니 치마형 원피스 양변기' },
  { id:'toilet-onepiece-is', group:'toilet', category:'양변기', brand:'아이에스동서', name:'원피스 양변기 중급형', model:'IS-OP-350', price:400000, unit:'EA', desc:'아이에스동서 원피스 중급형 양변기' },
  { id:'toilet-smart-inus', group:'toilet', category:'양변기', brand:'이누스', name:'스마트 비데일체형', model:'IN-BD-700', price:985000, unit:'EA', desc:'이누스 스마트 비데일체형 양변기' },
  { id:'toilet-smart-daelim', group:'toilet', category:'양변기', brand:'대림바스', name:'스마트 비데일체형', model:'DL-BD-900', price:1160000, unit:'EA', desc:'대림바스 스마트 비데일체형 양변기' },
  { id:'toilet-wallhung-inus', group:'toilet', category:'양변기', brand:'이누스', name:'벽걸이형 탱크리스 양변기', model:'IN-WH-500', price:1290000, unit:'EA', desc:'이누스 벽걸이형 탱크리스 양변기' },
  { id:'toilet-wallhung-as', group:'toilet', category:'양변기', brand:'아메리칸스탠다드', name:'벽배수형 프리미엄', model:'AS-WH-600', price:1690000, unit:'EA', desc:'아메리칸스탠다드 벽배수형 프리미엄 양변기' },

  { id:'o2-fl-dfl810', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'D-원홀세면수전', model:'DFL-810', price:37000, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-dfl811', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'D-세면수전', model:'DFL-811', price:37000, unit:'EA', desc:'세면수전' },
  { id:'o2-fl-dfl812', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'D-원홀겸용수전', model:'DFL-812', price:59000, unit:'EA', desc:'원홀 겸용수전' },
  { id:'o2-fl-dfl813', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'D-겸용수전', model:'DFL-813', price:59000, unit:'EA', desc:'겸용수전' },
  { id:'o2-fl-mfl602s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'M-4인치 세면수전', model:'MFL-602S', price:35800, unit:'EA', desc:'4인치 세면수전' },
  { id:'o2-fl-mfl603s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 겸용 샤워수전', model:'MFL-603S', price:52300, unit:'EA', desc:'4인치 겸용 샤워수전' },
  { id:'o2-fl-ncfs934', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀코브라', model:'NCFS-934', price:36100, unit:'EA', desc:'원홀코브라 세면수전' },
  { id:'o2-fl-ncfl930', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'NCFL-930', price:42100, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-qfl031', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면수전', model:'QFL-031', price:43900, unit:'EA', desc:'4인치 세면수전' },
  { id:'o2-fl-qfl033s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면샤워 겸용수전', model:'QFL-033S', price:70000, unit:'EA', desc:'4인치 세면/샤워 겸용수전' },
  { id:'o2-fl-qfl297s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'QFL-297S', price:47800, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-pfl147s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면수전', model:'PFL-147S', price:55000, unit:'EA', desc:'4인치 세면수전' },
  { id:'o2-fl-pfl146s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'PFL-146S', price:48100, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-wfl527s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'WFL-527S', price:44700, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-nfl277s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'NFL-277S', price:53300, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-lfl801s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'LFL-801S', price:60200, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-sfl1000', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'스테인레스 원홀세면수전', model:'SFL-1000', price:21000, unit:'EA', desc:'스테인레스 원홀 세면수전' },
  { id:'o2-fl-sfl1002', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'스테인레스 원홀겸용수전', model:'SFL-1002', price:62000, unit:'EA', desc:'스테인레스 원홀 겸용수전' },
  { id:'o2-fl-efl108s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면샤워겸용', model:'EFL-108S', price:51400, unit:'EA', desc:'4인치 세면샤워 겸용수전' },
  { id:'o2-fl-ufl592s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'U-4인치 겸용샤워수전', model:'UFL-592S', price:55500, unit:'EA', desc:'4인치 겸용 샤워수전' },
  { id:'o2-fl-ufl599s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'U-원홀겸용세면수전', model:'UFL-599S', price:63100, unit:'EA', desc:'원홀 겸용 세면수전' },
  { id:'o2-fl-pfl207s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면샤워 겸용수전', model:'PFL-207S', price:91100, unit:'EA', desc:'4인치 세면샤워 겸용수전' },
  { id:'o2-fl-pfl207tls', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면샤워 겸용수전 TL', model:'PFL-207TLS', price:99500, unit:'EA', desc:'4인치 세면샤워 겸용수전' },
  { id:'o2-fl-pfl207trs', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'4인치 세면샤워 겸용수전 TR', model:'PFL-207TRS', price:99500, unit:'EA', desc:'4인치 세면샤워 겸용수전' },
  { id:'o2-fl-fl824s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'FL-824S', price:117200, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-fl825', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'회전원홀세면수전', model:'FL-825', price:110000, unit:'EA', desc:'회전 원홀 세면수전' },
  { id:'o2-fl-fl827s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'FL-827S', price:78100, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-hbfl828s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'HBFL-828S', price:91000, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-hbfl833s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'HBFL-833S', price:81500, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-hbfl842s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'HBFL-842S', price:101500, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-hbfl857s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'HBFL-857S', price:92500, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-hbfl861s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'HBFL-861S', price:107700, unit:'EA', desc:'원홀 세면수전' },
  { id:'o2-fl-gsfl790s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'GSFL-790S', price:185200, unit:'EA', desc:'원홀 세면수전 프리미엄' },
  { id:'o2-fl-gmfl771s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀세면수전', model:'GMFL-771S', price:161100, unit:'EA', desc:'원홀 세면수전 프리미엄' },
  { id:'o2-fl-gmfl772s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼세면수전', model:'GMFL-772S', price:214800, unit:'EA', desc:'원홀 탑볼 세면수전' },
  { id:'o2-fl-gmfl778s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼세면수전', model:'GMFL-778S', price:214800, unit:'EA', desc:'원홀 탑볼 세면수전' },
  { id:'o2-fl-nfl273s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼세면수전', model:'NFL-273S', price:112000, unit:'EA', desc:'원홀 탑볼 세면수전' },
  { id:'o2-fl-gbfl795s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼세면수전', model:'GBFL-795S', price:179600, unit:'EA', desc:'원홀 탑볼 세면수전' },
  { id:'o2-fl-gdfl756s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼수전', model:'GDFL-756S', price:275900, unit:'EA', desc:'원홀 탑볼 수전' },
  { id:'o2-fl-gdfl757s', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'원홀탑볼세면수전', model:'GDFL-757S', price:361100, unit:'EA', desc:'원홀 탑볼 세면수전 고급형' },
  { id:'o2-fl-hfl264', group:'basinFaucet', category:'세면수전', brand:'오투바스', name:'H-투핸들 원홀세면수전', model:'HFL-264', price:150000, unit:'EA', desc:'투핸들 원홀 세면/주방 수전' },

  { id:'o2-fb-dfb809', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'D-샤워수전', model:'DFB-809', price:64000, unit:'EA', desc:'기본형 샤워수전' },
  { id:'o2-fb-mfb601', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'MFB-601', price:53900, unit:'EA', desc:'샤워욕조수전' },
  { id:'o2-fb-sfb1001', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'스테인레스 샤워욕조수전', model:'SFB-1001', price:78300, unit:'EA', desc:'스테인레스 샤워욕조수전' },
  { id:'o2-fb-pfb148', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워수전', model:'PFB-148', price:89400, unit:'EA', desc:'샤워수전' },
  { id:'o2-fb-hbfb863', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워수전', model:'HBFB-863', price:85500, unit:'EA', desc:'샤워수전' },
  { id:'o2-fb-hbfb836', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'HBFB-836', price:105500, unit:'EA', desc:'샤워욕조수전' },
  { id:'o2-fb-hbfb831', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'HBFB-831', price:110000, unit:'EA', desc:'샤워욕조수전' },
  { id:'o2-fb-hbfb864', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'HBFB-864', price:163900, unit:'EA', desc:'샤워욕조수전' },
  { id:'o2-fb-qfb176', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'Q-노출샤워수전', model:'QFB-176', price:99800, unit:'EA', desc:'노출형 샤워수전' },
  { id:'o2-fb-gfb463', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'레인샤워수전', model:'GFB-463', price:132400, unit:'EA', desc:'레인샤워 수전' },
  { id:'o2-fb-gbfb796', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GBFB-796', price:275900, unit:'EA', desc:'샤워욕조수전' },
  { id:'o2-fb-gmfb773', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GMFB-773', price:305600, unit:'EA', desc:'샤워욕조수전 프리미엄' },
  { id:'o2-fb-gmfb779', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GMFB-779', price:305600, unit:'EA', desc:'샤워욕조수전 프리미엄' },
  { id:'o2-fb-gtfb303', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'써머샤워욕조수전', model:'GTFB-303', price:314800, unit:'EA', desc:'온도조절 써머샤워욕조수전' },
  { id:'o2-fb-gnfb770', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GNFB-770', price:342600, unit:'EA', desc:'샤워욕조수전 고급형' },
  { id:'o2-fb-gnfb768', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GNFB-768', price:405600, unit:'EA', desc:'샤워욕조수전 고급형' },
  { id:'o2-fb-gsfb792', group:'showerFaucet', category:'샤워수전', brand:'오투바스', name:'샤워욕조수전', model:'GSFB-792', price:405600, unit:'EA', desc:'샤워욕조수전 최고급형' },

  { id:'o2-sk-dfs816', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'D-원홀핸드스프레이씽크수전', model:'DFS-816', price:65000, unit:'EA', desc:'원홀 핸드스프레이 씽크수전' },
  { id:'o2-sk-qfs138s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'핸드스프레이씽크수전', model:'QFS-138S', price:75300, unit:'EA', desc:'핸드스프레이 씽크수전' },
  { id:'o2-sk-ikf737s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'샤크 원홀스프레이씽크수전', model:'IKF-737S', price:95000, unit:'EA', desc:'폭포수형 원홀 씽크수전' },
  { id:'o2-sk-pfs164s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'원홀핸드스프레이씽크수전', model:'PFS-164S', price:85900, unit:'EA', desc:'원홀 핸드스프레이 씽크수전' },
  { id:'o2-sk-ck006s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'원홀핸드스프레이씽크수전', model:'CK-006S', price:63600, unit:'EA', desc:'원홀 핸드스프레이 씽크수전' },
  { id:'o2-sk-sfs1004', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'스테인레스 원홀스프레이씽크', model:'SFS-1004', price:36300, unit:'EA', desc:'스테인레스 원홀 스프레이 씽크수전' },
  { id:'o2-sk-mss600s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'MSS-600S', price:51300, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-mfs312s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'M-원홀코브라씽크수전', model:'MFS-312S', price:50000, unit:'EA', desc:'원홀 코브라 씽크수전' },
  { id:'o2-sk-qss894s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'QSS-894S', price:59200, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-qss100s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'QSS-100S', price:57700, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-qss130s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'QSS-130S', price:60000, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-xss507s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'XSS-507S', price:56000, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-pss150s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'코브라씽크수전', model:'PSS-150S', price:79100, unit:'EA', desc:'코브라 씽크수전' },
  { id:'o2-sk-pss162s', group:'sinkFaucet', category:'씽크수전', brand:'오투바스', name:'P-원홀코브라씽크수전', model:'PSS-162S', price:72200, unit:'EA', desc:'원홀 코브라 씽크수전' },
  { id:'sink-daelim-cobra', group:'sinkFaucet', category:'씽크수전', brand:'대림바스', name:'코브라 씽크수전 기본형', model:'DLB-S310', price:55000, unit:'EA', desc:'대림바스 코브라형 씽크수전' },
  { id:'sink-daelim-onehole', group:'sinkFaucet', category:'씽크수전', brand:'대림바스', name:'원홀 씽크수전', model:'DLB-S420', price:78000, unit:'EA', desc:'대림바스 원홀 씽크수전' },
  { id:'sink-daelim-spray', group:'sinkFaucet', category:'씽크수전', brand:'대림바스', name:'핸드스프레이 씽크수전', model:'DLB-S510', price:95000, unit:'EA', desc:'대림바스 핸드스프레이 씽크수전' },
  { id:'sink-daelim-pulldown', group:'sinkFaucet', category:'씽크수전', brand:'대림바스', name:'풀다운 씽크수전', model:'DLB-S620', price:148000, unit:'EA', desc:'대림바스 풀다운 고회전 씽크수전' },
  { id:'sink-daelim-touch', group:'sinkFaucet', category:'씽크수전', brand:'대림바스', name:'터치 씽크수전', model:'DLB-S700', price:198000, unit:'EA', desc:'대림바스 터치센서 씽크수전' },
  { id:'sink-inus-cobra', group:'sinkFaucet', category:'씽크수전', brand:'이누스', name:'코브라 씽크수전', model:'IN-S200', price:52000, unit:'EA', desc:'이누스 코브라형 씽크수전' },
  { id:'sink-inus-onehole', group:'sinkFaucet', category:'씽크수전', brand:'이누스', name:'원홀 씽크수전', model:'IN-S300', price:72000, unit:'EA', desc:'이누스 원홀 씽크수전' },
  { id:'sink-inus-spray', group:'sinkFaucet', category:'씽크수전', brand:'이누스', name:'핸드스프레이 씽크수전', model:'IN-S400', price:98000, unit:'EA', desc:'이누스 핸드스프레이 씽크수전' },
  { id:'sink-inus-pulldown', group:'sinkFaucet', category:'씽크수전', brand:'이누스', name:'풀다운 씽크수전', model:'IN-S500', price:135000, unit:'EA', desc:'이누스 풀다운 씽크수전' },
  { id:'sink-hansem-basic', group:'sinkFaucet', category:'씽크수전', brand:'한샘', name:'씽크수전 기본형', model:'HS-S100', price:48000, unit:'EA', desc:'한샘 기본형 씽크수전' },
  { id:'sink-hansem-spray', group:'sinkFaucet', category:'씽크수전', brand:'한샘', name:'핸드스프레이 씽크수전', model:'HS-S200', price:88000, unit:'EA', desc:'한샘 핸드스프레이 씽크수전' },
  { id:'sink-hansem-premium', group:'sinkFaucet', category:'씽크수전', brand:'한샘', name:'프리미엄 씽크수전', model:'HS-S300', price:128000, unit:'EA', desc:'한샘 프리미엄 원홀 씽크수전' },
  { id:'sink-as-pulldown', group:'sinkFaucet', category:'씽크수전', brand:'아메리칸스탠다드', name:'풀다운 씽크수전', model:'AS-S500', price:215000, unit:'EA', desc:'아메리칸스탠다드 풀다운 씽크수전' },
  { id:'sink-as-premium', group:'sinkFaucet', category:'씽크수전', brand:'아메리칸스탠다드', name:'프리미엄 씽크수전', model:'AS-S600', price:285000, unit:'EA', desc:'아메리칸스탠다드 프리미엄 씽크수전' },

  { id:'o2-sh-mb532', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'프리미엄 블랙 샤워헤드', model:'MB-532', price:18500, unit:'EA', desc:'프리미엄 블랙 샤워헤드' },
  { id:'o2-sh-mb534', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'프리미엄 골드 샤워헤드', model:'MB-534', price:25800, unit:'EA', desc:'프리미엄 골드 샤워헤드' },
  { id:'o2-sh-mb547', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'샤워헤드 화이트', model:'MB-547', price:17400, unit:'EA', desc:'화이트 샤워헤드' },
  { id:'o2-sh-mb548', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'샤워헤드 크롬', model:'MB-548', price:17400, unit:'EA', desc:'크롬 샤워헤드' },
  { id:'o2-sh-mb549', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'샤워헤드 블랙', model:'MB-549', price:17400, unit:'EA', desc:'블랙 샤워헤드' },
  { id:'o2-sh-mb550', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'크롬멀티 샤워헤드', model:'MB-550', price:15500, unit:'EA', desc:'크롬 멀티 샤워헤드' },
  { id:'o2-sh-mb552', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'버블크롬 샤워헤드', model:'MB-552', price:8900, unit:'EA', desc:'버블크롬 샤워헤드' },
  { id:'o2-sh-mb556', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'버튼형 절수 샤워헤드', model:'MB-556', price:16900, unit:'EA', desc:'버튼형 절수 샤워헤드' },
  { id:'o2-sh-mb158', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S2 샤워헤드', model:'MB-158', price:6500, unit:'EA', desc:'S2 샤워헤드' },
  { id:'o2-sh-mb262', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S8 샤워헤드', model:'MB-262', price:9500, unit:'EA', desc:'S8 샤워헤드' },
  { id:'o2-sh-mb280', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S4 안마샤워헤드', model:'MB-280', price:14900, unit:'EA', desc:'S4 안마 샤워헤드' },
  { id:'o2-sh-mb281', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S2 멀티샤워헤드', model:'MB-281', price:7900, unit:'EA', desc:'S2 멀티 샤워헤드' },
  { id:'o2-sh-mb282', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'원형 샤워헤드', model:'MB-282', price:26000, unit:'EA', desc:'원형 샤워헤드' },
  { id:'o2-sh-mb283', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'사각 샤워헤드', model:'MB-283', price:26000, unit:'EA', desc:'사각 샤워헤드' },
  { id:'o2-sh-mb320', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'카라3기능 샤워헤드', model:'MB-320', price:10900, unit:'EA', desc:'3기능 샤워헤드' },
  { id:'o2-sh-mb446', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'백색미세홀 샤워헤드', model:'MB-446', price:7000, unit:'EA', desc:'백색 미세홀 샤워헤드' },
  { id:'o2-sh-mb447', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'플러스미세홀 샤워헤드', model:'MB-447', price:7500, unit:'EA', desc:'플러스 미세홀 샤워헤드 크롬' },
  { id:'o2-sh-mb448', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S1크롬 샤워헤드', model:'MB-448', price:5900, unit:'EA', desc:'S1 크롬 샤워헤드' },
  { id:'o2-sh-mb557', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S5 샤워헤드', model:'MB-557', price:10900, unit:'EA', desc:'S5 샤워헤드' },
  { id:'o2-sh-mb610', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'S7멀티 샤워헤드', model:'MB-610', price:11000, unit:'EA', desc:'S7 멀티 샤워헤드' },
  { id:'o2-sh-mb629', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'블랙 미세홀 샤워헤드', model:'MB-629', price:11000, unit:'EA', desc:'블랙 미세홀 샤워헤드' },
  { id:'o2-sh-mb751', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'화이트 미세홀 샤워헤드', model:'MB-751', price:9900, unit:'EA', desc:'화이트 미세홀 샤워헤드' },
  { id:'o2-sh-sw400', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'ABC샤워헤드 화이트', model:'SW-400', price:4990, unit:'EA', desc:'ABC 샤워헤드 화이트' },
  { id:'o2-sh-sw401', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'ABC샤워헤드 크롬', model:'SW-401', price:4990, unit:'EA', desc:'ABC 샤워헤드 크롬' },
  { id:'o2-sh-mb482', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'휴 필터 샤워헤드', model:'MB-482', price:18000, unit:'EA', desc:'휴 필터 샤워헤드' },
  { id:'o2-sh-mb483', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'휴 필터 샤워헤드', model:'MB-483', price:23900, unit:'EA', desc:'휴 필터 샤워헤드' },
  { id:'o2-sh-mb484', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'휴 필터 샤워헤드', model:'MB-484', price:19800, unit:'EA', desc:'휴 필터 샤워헤드' },
  { id:'o2-sh-mb563', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'필터샤워헤드', model:'MB-563', price:12900, unit:'EA', desc:'필터 샤워헤드' },
  { id:'o2-sh-mb748', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'필터샤워헤드 세트', model:'MB-748', price:26700, unit:'EA', desc:'필터 샤워헤드 세트' },
  { id:'o2-sh-mb749', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'필터샤워헤드 세트', model:'MB-749', price:25800, unit:'EA', desc:'필터 샤워헤드 세트' },
  { id:'o2-sh-mb750', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'필터샤워헤드 세트', model:'MB-750', price:31700, unit:'EA', desc:'필터 샤워헤드 세트' },
  { id:'o2-sh-huf632', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'필터 샤워헤드세트', model:'HUF-632', price:12000, unit:'EA', desc:'필터 샤워헤드 세트' },
  { id:'o2-sh-mb627', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'블랙 PVC샤워헤드 호스 세트', model:'MB-627', price:18900, unit:'SET', desc:'블랙 PVC 샤워헤드+호스 세트' },
  { id:'o2-sh-mb628', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'화이트 PVC샤워헤드 호스 세트', model:'MB-628', price:18900, unit:'SET', desc:'화이트 PVC 샤워헤드+호스 세트' },
  { id:'o2-sh-sw405', group:'showerHead', category:'샤워헤드', brand:'오투바스', name:'ABC 백색샤워헤드+호스 세트', model:'SW-405', price:9900, unit:'SET', desc:'ABC 백색 샤워헤드+1.5m 호스 세트' },

  { id:'o2-hose-mb034c', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'메탈샤워호스', model:'MB-034C', price:4900, unit:'EA', desc:'메탈 샤워호스' },
  { id:'o2-hose-mb037c', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'메탈샤워호스', model:'MB-037C', price:6900, unit:'EA', desc:'메탈 샤워호스' },
  { id:'o2-hose-mb039c', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'메탈샤워호스', model:'MB-039C', price:5900, unit:'EA', desc:'메탈 샤워호스' },
  { id:'o2-hose-mb034g', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'골드 메탈샤워호스', model:'MB-034G', price:13000, unit:'EA', desc:'골드 메탈 샤워호스' },
  { id:'o2-hose-mb034b', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'블랙 메탈샤워호스', model:'MB-034B', price:12000, unit:'EA', desc:'블랙 메탈 샤워호스' },
  { id:'o2-hose-mb700', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'꼬임방지 메탈샤워호스', model:'MB-700', price:7900, unit:'EA', desc:'꼬임방지 메탈 샤워호스' },
  { id:'o2-hose-mb702', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'꼬임방지 메탈샤워호스', model:'MB-702', price:8900, unit:'EA', desc:'꼬임방지 메탈 샤워호스' },
  { id:'o2-hose-mb703', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'꼬임방지 메탈샤워호스', model:'MB-703', price:9900, unit:'EA', desc:'꼬임방지 메탈 샤워호스' },
  { id:'o2-hose-mb752', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'블랙 PVC샤워호스', model:'MB-752', price:9900, unit:'EA', desc:'블랙 PVC 샤워호스' },
  { id:'o2-hose-mb753', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'화이트 PVC샤워호스', model:'MB-753', price:9900, unit:'EA', desc:'화이트 PVC 샤워호스' },
  { id:'o2-hose-mb754', group:'showerHose', category:'샤워호스', brand:'오투바스', name:'실버 PVC샤워호스', model:'MB-754', price:10900, unit:'EA', desc:'실버 PVC 샤워호스' },

  { id:'o2-ax-ax100a', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트', model:'AX-100A', price:26400, unit:'SET', desc:'욕실 악세사리 4품 세트' },
  { id:'o2-ax-ax200a', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트', model:'AX-200A', price:27400, unit:'SET', desc:'욕실 악세사리 4품 세트' },
  { id:'o2-ax-ax400b', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트 블랙', model:'AX-400B', price:49400, unit:'SET', desc:'욕실 악세사리 블랙 4품 세트' },
  { id:'o2-ax-ax400c', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트 크롬', model:'AX-400C', price:39000, unit:'SET', desc:'욕실 악세사리 크롬 4품 세트' },
  { id:'o2-ax-ax550c', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트 크롬', model:'AX-550C', price:74600, unit:'SET', desc:'욕실 악세사리 크롬 4품 세트' },
  { id:'o2-ax-ax550s', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트 SUS', model:'AX-550S', price:99800, unit:'SET', desc:'욕실 악세사리 SUS 4품 세트' },
  { id:'o2-ax-ax550d', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리 4품세트 다크그레이', model:'AX-550D', price:121800, unit:'SET', desc:'욕실 악세사리 다크그레이 4품 세트' },
  { id:'o2-ax-ax410', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리', model:'AX-410', price:65200, unit:'SET', desc:'욕실 악세사리 세트' },
  { id:'o2-ax-ax495', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리', model:'AX-495', price:82000, unit:'SET', desc:'욕실 악세사리 세트' },
  { id:'o2-ax-ax546bk', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실악세사리', model:'AX-546BK', price:92400, unit:'SET', desc:'욕실 악세사리 세트' },
  { id:'o2-ax-ax486cu', group:'accessory', category:'악세서리', brand:'오투바스', name:'타월걸이', model:'AX-486CU', price:16900, unit:'EA', desc:'타월걸이' },
  { id:'o2-ax-ax496', group:'accessory', category:'악세서리', brand:'오투바스', name:'타월걸이', model:'AX-496', price:26180, unit:'EA', desc:'타월걸이' },
  { id:'o2-ax-ax539', group:'accessory', category:'악세서리', brand:'오투바스', name:'타월걸이', model:'AX-539', price:26460, unit:'EA', desc:'타월걸이' },
  { id:'o2-ax-ax488cu', group:'accessory', category:'악세서리', brand:'오투바스', name:'비누대', model:'AX-488CU', price:8500, unit:'EA', desc:'비누대' },
  { id:'o2-ax-ax489cu', group:'accessory', category:'악세서리', brand:'오투바스', name:'컵대', model:'AX-489CU', price:8500, unit:'EA', desc:'컵대' },
  { id:'o2-ax-ax413', group:'accessory', category:'악세서리', brand:'오투바스', name:'컵대', model:'AX-413', price:8680, unit:'EA', desc:'컵대' },
  { id:'o2-ax-ax234', group:'accessory', category:'악세서리', brand:'오투바스', name:'컵대', model:'AX-234', price:6000, unit:'EA', desc:'컵대' },
  { id:'o2-ax-ax239', group:'accessory', category:'악세서리', brand:'오투바스', name:'컵대', model:'AX-239', price:2000, unit:'EA', desc:'컵대' },
  { id:'o2-ax-ax497', group:'accessory', category:'악세서리', brand:'오투바스', name:'휴지걸이', model:'AX-497', price:20300, unit:'EA', desc:'휴지걸이' },
  { id:'o2-ax-ax246', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실 유리 코너선반', model:'AX-246', price:7000, unit:'EA', desc:'유리 코너 선반' },
  { id:'o2-ax-ax248', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실 유리 일자선반', model:'AX-248', price:8600, unit:'EA', desc:'유리 일자 선반' },
  { id:'o2-ax-ab182', group:'accessory', category:'악세서리', brand:'오투바스', name:'슬라이드바', model:'AB-182', price:19700, unit:'EA', desc:'슬라이드바' },
  { id:'o2-ax-ab194', group:'accessory', category:'악세서리', brand:'오투바스', name:'슬라이드바', model:'AB-194', price:22200, unit:'EA', desc:'슬라이드바' },
  { id:'o2-ax-mb041bk', group:'accessory', category:'악세서리', brand:'오투바스', name:'흡착식행거 크롬', model:'MB-041BK', price:5900, unit:'EA', desc:'흡착식 행거 크롬' },
  { id:'o2-ax-mb606bk', group:'accessory', category:'악세서리', brand:'오투바스', name:'흡착식행거 백색', model:'MB-606BK', price:4800, unit:'EA', desc:'흡착식 행거 백색' },
  { id:'o2-ax-ax223', group:'accessory', category:'악세서리', brand:'오투바스', name:'욕실 옷걸이 크롬', model:'AX-223', price:1000, unit:'EA', desc:'욕실 옷걸이 크롬' },

  { id:'o2-bs-hcl5404', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기', model:'HCL-5404', price:74000, unit:'EA', desc:'화장대용 사각 세면기' },
  { id:'o2-bs-hcl5405', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기', model:'HCL-5405', price:90000, unit:'EA', desc:'화장대용 사각 세면기' },
  { id:'o2-bs-hcl5401', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기', model:'HCL-5401', price:100000, unit:'EA', desc:'화장대용 사각 세면기' },
  { id:'o2-bs-hcl5407', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기', model:'HCL-5407', price:120000, unit:'EA', desc:'화장대용 사각 세면기' },
  { id:'o2-bs-hcl5203', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기', model:'HCL-5203', price:110000, unit:'EA', desc:'화장대용 사각 세면기' },
  { id:'o2-bs-hcl5505', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 사각 세면기 골드', model:'HCL-5505', price:160000, unit:'EA', desc:'화장대용 사각 세면기 골드' },
  { id:'o2-bs-hcl5204', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 타원 세면기', model:'HCL-5204', price:70000, unit:'EA', desc:'화장대용 타원 세면기' },
  { id:'o2-bs-hcl5201', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 타원 세면기', model:'HCL-5201', price:120000, unit:'EA', desc:'화장대용 타원 세면기' },
  { id:'o2-bs-hcl5202cl', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 타원 세면기', model:'HCL-5202CL', price:92000, unit:'EA', desc:'화장대용 타원 세면기' },
  { id:'o2-bs-hcl5301', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 곡선 세면기', model:'HCL-5301', price:92000, unit:'EA', desc:'화장대용 곡선 세면기' },
  { id:'o2-bs-hcl5503', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 원형 세면기', model:'HCL-5503', price:176000, unit:'EA', desc:'화장대용 원형 세면기' },
  { id:'o2-bs-hcl5506', group:'basin', category:'세면기', brand:'오투바스', name:'화장대용 원형 세면기', model:'HCL-5506', price:110000, unit:'EA', desc:'화장대용 원형 세면기' },
  { id:'o2-bs-hcl3002', group:'basin', category:'세면기', brand:'오투바스', name:'평면붙임 세면기', model:'HCL-3002', price:72000, unit:'EA', desc:'평면붙임 세면기' },
  { id:'o2-bs-hcl6201', group:'basin', category:'세면기', brand:'오투바스', name:'탑카운터형 타원 세면기', model:'HCL-6201', price:44000, unit:'EA', desc:'탑카운터형 타원 세면기' },
  { id:'o2-bs-hcl7201cl', group:'basin', category:'세면기', brand:'오투바스', name:'언더카운터형 타원 세면기', model:'HCL-7201CL', price:42000, unit:'EA', desc:'언더카운터형 타원 세면기' },
  { id:'o2-bs-hcl7401', group:'basin', category:'세면기', brand:'오투바스', name:'언더카운터형 사각 세면기', model:'HCL-7401', price:48000, unit:'EA', desc:'언더카운터형 사각 세면기' },
  { id:'o2-bs-swf1707060c', group:'basin', category:'세면기', brand:'오투바스', name:'세면대', model:'SWF-1707060C', price:480000, unit:'EA', desc:'욕실 세면대 일체형' },
  { id:'o2-bs-swf1706090c', group:'basin', category:'세면기', brand:'오투바스', name:'세면기', model:'SWF-1706090C', price:560000, unit:'EA', desc:'욕실 세면기 일체형' },
  { id:'o2-bs-swf1712075c', group:'basin', category:'세면기', brand:'오투바스', name:'세면대', model:'SWF-1712075C', price:720000, unit:'EA', desc:'욕실 세면대 일체형' },
  { id:'o2-bs-swf1506065c', group:'basin', category:'세면기', brand:'오투바스', name:'세면대', model:'SWF-1506065C', price:740000, unit:'EA', desc:'욕실 세면대 일체형' },
  { id:'o2-bs-swf1425075c', group:'basin', category:'세면기', brand:'오투바스', name:'세면대', model:'SWF-1425075C', price:700000, unit:'EA', desc:'욕실 세면대 일체형' },

  { id:'o2-furn-btc0093', group:'bathroomFurniture', category:'욕실장', brand:'오투바스', name:'누베스 하부장 스탠드형', model:'BTC-0093', price:376200, unit:'EA', desc:'누베스 하부장 스탠드형' },
  { id:'o2-furn-btc0100', group:'bathroomFurniture', category:'욕실장', brand:'오투바스', name:'비스포크 하부장', model:'BTC-0100', price:273200, unit:'EA', desc:'비스포크 하부장' },
  { id:'o2-furn-btc0054', group:'bathroomFurniture', category:'욕실장', brand:'오투바스', name:'누베스 화이트 상부장 가로형', model:'BTC-0054', price:244000, unit:'EA', desc:'누베스 화이트 상부장 가로형' },
  { id:'o2-furn-btc0059', group:'bathroomFurniture', category:'욕실장', brand:'오투바스', name:'비스포크 3도어 욕실장 상부장', model:'BTC-0059', price:146800, unit:'EA', desc:'비스포크 3도어 욕실장 상부장' },
  { id:'furn-hansem-lower-600', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면 하부장 600mm', model:'HS-VB-600', price:185000, unit:'EA', desc:'한샘 욕실 세면 하부 수납장 600mm' },
  { id:'furn-hansem-lower-750', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면 하부장 750mm', model:'HS-VB-750', price:228000, unit:'EA', desc:'한샘 욕실 세면 하부 수납장 750mm' },
  { id:'furn-hansem-lower-900', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면 하부장 900mm', model:'HS-VB-900', price:282000, unit:'EA', desc:'한샘 욕실 세면 하부 수납장 900mm' },
  { id:'furn-hansem-upper-600', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'욕실 수납 상부장 600mm', model:'HS-UC-600', price:148000, unit:'EA', desc:'한샘 욕실 벽걸이 상부 수납장' },
  { id:'furn-hansem-upper-900', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'욕실 수납 상부장 900mm', model:'HS-UC-900', price:195000, unit:'EA', desc:'한샘 욕실 벽걸이 상부 수납장 900mm' },
  { id:'furn-hansem-vanity-600', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면대 일체형 600mm', model:'HS-VT-600', price:385000, unit:'EA', desc:'한샘 세면기+하부장 일체형 600mm' },
  { id:'furn-hansem-vanity-750', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면대 일체형 750mm', model:'HS-VT-750', price:455000, unit:'EA', desc:'한샘 세면기+하부장 일체형 750mm' },
  { id:'furn-hansem-vanity-900', group:'bathroomFurniture', category:'욕실장', brand:'한샘', name:'세면대 일체형 900mm', model:'HS-VT-900', price:548000, unit:'EA', desc:'한샘 세면기+하부장 일체형 900mm' },
  { id:'furn-inus-lower-600', group:'bathroomFurniture', category:'욕실장', brand:'이누스', name:'세면 하부장 600mm', model:'IN-VB-600', price:198000, unit:'EA', desc:'이누스 욕실 세면 하부 수납장 600mm' },
  { id:'furn-inus-lower-750', group:'bathroomFurniture', category:'욕실장', brand:'이누스', name:'세면 하부장 750mm', model:'IN-VB-750', price:245000, unit:'EA', desc:'이누스 욕실 세면 하부 수납장 750mm' },
  { id:'furn-inus-vanity-750', group:'bathroomFurniture', category:'욕실장', brand:'이누스', name:'세면대 일체형 750mm', model:'IN-VT-750', price:428000, unit:'EA', desc:'이누스 세면기+하부장 일체형 750mm' },
  { id:'furn-daelim-lower-600', group:'bathroomFurniture', category:'욕실장', brand:'대림바스', name:'세면 하부장 600mm', model:'DL-VB-600', price:218000, unit:'EA', desc:'대림바스 욕실 세면 하부 수납장 600mm' },
  { id:'furn-daelim-upper-600', group:'bathroomFurniture', category:'욕실장', brand:'대림바스', name:'욕실 상부장 600mm', model:'DL-UC-600', price:170000, unit:'EA', desc:'대림바스 욕실 벽걸이 상부 수납장' },
  { id:'furn-daelim-vanity-750', group:'bathroomFurniture', category:'욕실장', brand:'대림바스', name:'세면대 일체형 750mm', model:'DL-VT-750', price:485000, unit:'EA', desc:'대림바스 세면기+하부장 일체형 750mm' },
  { id:'furn-masis-lower-600', group:'bathroomFurniture', category:'욕실장', brand:'마시스', name:'욕실 하부장 600mm', model:'MS-VB-600', price:165000, unit:'EA', desc:'마시스 방수 욕실 하부 수납장 600mm' },
  { id:'furn-masis-lower-750', group:'bathroomFurniture', category:'욕실장', brand:'마시스', name:'욕실 하부장 750mm', model:'MS-VB-750', price:205000, unit:'EA', desc:'마시스 방수 욕실 하부 수납장 750mm' },
  { id:'furn-masis-upper-600', group:'bathroomFurniture', category:'욕실장', brand:'마시스', name:'욕실 상부장 600mm', model:'MS-UC-600', price:138000, unit:'EA', desc:'마시스 욕실 벽걸이 상부 수납장' },
  { id:'furn-masis-vanity-750', group:'bathroomFurniture', category:'욕실장', brand:'마시스', name:'세면대 일체형 750mm', model:'MS-VT-750', price:398000, unit:'EA', desc:'마시스 세면기+하부장 일체형 750mm' },

  { id:'o2-mr-btc0087', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'PS 팔각거울', model:'BTC-0087', price:65000, unit:'EA', desc:'PS 팔각거울 블랙/화이트' },
  { id:'o2-mr-swf1110060m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1110060M', price:112000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1210065m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1210065M', price:128000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1425060m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1425060M', price:112000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1500090m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1500090M', price:128000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1506065m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1506065M', price:112000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1615080m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1615080M', price:128000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1707060m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1707060M', price:96000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1706090m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울 대형', model:'SWF-1706090M', price:160000, unit:'EA', desc:'욕실거울 대형' },
  { id:'o2-mr-swf1712075m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1712075M', price:128000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1723060m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울', model:'SWF-1723060M', price:120000, unit:'EA', desc:'욕실거울' },
  { id:'o2-mr-swf1422090m', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'욕실거울 특대형', model:'SWF-1422090M', price:240000, unit:'EA', desc:'욕실거울 특대형' },
  { id:'o2-mr-btc0076', group:'mirrorCabinet', category:'거울장', brand:'오투바스', name:'힐라 조명거울', model:'BTC-0076', price:472000, unit:'EA', desc:'힐라 LED 조명거울 세로형' },

  { id:'o2-bidet-alb3600', group:'bidet', category:'비데', brand:'오투바스', name:'트레비 비데', model:'ALB-3600', price:195000, unit:'EA', desc:'트레비 비데' },
  { id:'o2-bidet-albr3600', group:'bidet', category:'비데', brand:'오투바스', name:'무선 리모컨비데', model:'ALB-R3600', price:219000, unit:'EA', desc:'무선 리모컨 비데' },
  { id:'bidet-coway-basic', group:'bidet', category:'비데', brand:'코웨이', name:'비데 기본형', model:'BA-13A', price:162000, unit:'EA', desc:'코웨이 기본 세정 비데' },
  { id:'bidet-coway-std', group:'bidet', category:'비데', brand:'코웨이', name:'비데 스탠다드', model:'BA-13AW', price:198000, unit:'EA', desc:'코웨이 온수 세정 스탠다드 비데' },
  { id:'bidet-coway-premium', group:'bidet', category:'비데', brand:'코웨이', name:'비데 프리미엄', model:'BA-15A', price:288000, unit:'EA', desc:'코웨이 자동 탈취·건조 프리미엄 비데' },
  { id:'bidet-coway-smart', group:'bidet', category:'비데', brand:'코웨이', name:'스마트 비데', model:'BD-W100A', price:325000, unit:'EA', desc:'코웨이 리모컨+스마트 기능 비데' },
  { id:'bidet-nobita-basic', group:'bidet', category:'비데', brand:'노비타', name:'비데 기본형', model:'BD-3000', price:138000, unit:'EA', desc:'노비타 기본 온수 비데' },
  { id:'bidet-nobita-std', group:'bidet', category:'비데', brand:'노비타', name:'비데 중급형', model:'BD-3500', price:178000, unit:'EA', desc:'노비타 중급 온수·건조 비데' },
  { id:'bidet-nobita-heat', group:'bidet', category:'비데', brand:'노비타', name:'온열시트 비데', model:'BD-4000', price:228000, unit:'EA', desc:'노비타 온열시트 탑재 비데' },
  { id:'bidet-nobita-premium', group:'bidet', category:'비데', brand:'노비타', name:'비데 프리미엄', model:'BD-5000', price:298000, unit:'EA', desc:'노비타 자동 개폐·탈취 프리미엄 비데' },
  { id:'bidet-daelim-basic', group:'bidet', category:'비데', brand:'대림바스', name:'비데 기본형', model:'DL-BD-100', price:148000, unit:'EA', desc:'대림바스 기본 온수 비데' },
  { id:'bidet-daelim-mid', group:'bidet', category:'비데', brand:'대림바스', name:'비데 중급형', model:'DL-BD-300', price:215000, unit:'EA', desc:'대림바스 온수·건조·탈취 비데' },
  { id:'bidet-inus-basic', group:'bidet', category:'비데', brand:'이누스', name:'비데 기본형', model:'IN-BD-100', price:155000, unit:'EA', desc:'이누스 기본 온수 비데' },
  { id:'bidet-inus-premium', group:'bidet', category:'비데', brand:'이누스', name:'비데 프리미엄', model:'IN-BD-300', price:248000, unit:'EA', desc:'이누스 온수·건조·리모컨 프리미엄 비데' },
  { id:'bidet-bodyfriend', group:'bidet', category:'비데', brand:'바디프랜드', name:'비데', model:'BF-B100', price:268000, unit:'EA', desc:'바디프랜드 온수 세정 비데' },
  { id:'bidet-is-basic', group:'bidet', category:'비데', brand:'아이에스동서', name:'비데 기본형', model:'IS-BD-200', price:160000, unit:'EA', desc:'아이에스동서 기본 온수 비데' },
  { id:'bidet-lg-basic', group:'bidet', category:'비데', brand:'LG전자', name:'비데 기본형', model:'LG-BD-A110', price:198000, unit:'EA', desc:'LG전자 기본 온수 세정 비데' },
  { id:'bidet-lg-premium', group:'bidet', category:'비데', brand:'LG전자', name:'비데 프리미엄', model:'LG-BD-A310', price:320000, unit:'EA', desc:'LG전자 자동 세정·건조 프리미엄 비데' },

  { id:'o2-dr-ml332', group:'drain', category:'배수/트랩', brand:'오투바스', name:'주름관 I트랩', model:'ML-332', price:2400, unit:'EA', desc:'주름관 I트랩' },
  { id:'o2-dr-ml126a', group:'drain', category:'배수/트랩', brand:'오투바스', name:'P트랩', model:'ML-126A', price:4500, unit:'EA', desc:'P트랩' },
  { id:'o2-dr-ml135', group:'drain', category:'배수/트랩', brand:'오투바스', name:'자동 폽업', model:'ML-135', price:6300, unit:'EA', desc:'자동 폽업' },
  { id:'o2-dr-ml124', group:'drain', category:'배수/트랩', brand:'오투바스', name:'폽업 국산KS', model:'ML-124', price:14100, unit:'EA', desc:'폽업 국산KS' },
  { id:'o2-dr-ml337', group:'drain', category:'배수/트랩', brand:'오투바스', name:'세면기 고압호스 400mm', model:'ML-337', price:2800, unit:'EA', desc:'세면기 고압 호스 400mm' },
  { id:'o2-dr-ml337l', group:'drain', category:'배수/트랩', brand:'오투바스', name:'세면기 고압호스 1000mm', model:'ML-337L', price:4800, unit:'EA', desc:'세면기 고압 호스 1000mm' },
  { id:'o2-dr-mc336', group:'drain', category:'배수/트랩', brand:'오투바스', name:'양변기 고압호스', model:'MC-336', price:2800, unit:'EA', desc:'양변기 고압 호스 400mm' },

  { id:'o2-pl-mw177s', group:'plumbing', category:'부속품', brand:'오투바스', name:'스테인레스 앵글벨브', model:'MW-177S', price:2200, unit:'EA', desc:'SUS304 앵글 밸브' },
  { id:'o2-pl-ms601bk', group:'plumbing', category:'부속품', brand:'오투바스', name:'601절수기', model:'MS-601BK', price:5200, unit:'EA', desc:'601 절수기' },
  { id:'o2-pl-ms503bk', group:'plumbing', category:'부속품', brand:'오투바스', name:'503절수기', model:'MS-503BK', price:3400, unit:'EA', desc:'503 절수기' },
  { id:'o2-pl-ms501bk', group:'plumbing', category:'부속품', brand:'오투바스', name:'501절수기', model:'MS-501BK', price:4000, unit:'EA', desc:'501 절수기' },
  { id:'o2-pl-ms079bk', group:'plumbing', category:'부속품', brand:'오투바스', name:'장미절수기', model:'MS-079BK', price:5800, unit:'EA', desc:'장미 절수기' },
  { id:'o2-pl-mx436', group:'plumbing', category:'부속품', brand:'오투바스', name:'편심셋트', model:'MX-436', price:15600, unit:'SET', desc:'편심 세트' },
  { id:'o2-pl-mx450', group:'plumbing', category:'부속품', brand:'오투바스', name:'역류방지편심셋트', model:'MX-450', price:25000, unit:'SET', desc:'역류방지 편심 세트' },
  { id:'o2-pl-mx452', group:'plumbing', category:'부속품', brand:'오투바스', name:'3/4산역류편심셋트', model:'MX-452', price:26600, unit:'SET', desc:'3/4산 역류방지 편심 세트' },
  { id:'o2-pl-mx565', group:'plumbing', category:'부속품', brand:'오투바스', name:'장편심셋트', model:'MX-565', price:18800, unit:'SET', desc:'장 편심 세트' },
  { id:'o2-pl-mx364', group:'plumbing', category:'부속품', brand:'오투바스', name:'클로스형 카트리지', model:'MX-364', price:5600, unit:'EA', desc:'클로스형 카트리지' },
  { id:'o2-pl-mx365', group:'plumbing', category:'부속품', brand:'오투바스', name:'오픈형 카트리지', model:'MX-365', price:5600, unit:'EA', desc:'오픈형 카트리지' },
  { id:'o2-pl-mx366', group:'plumbing', category:'부속품', brand:'오투바스', name:'클로스형 카트리지', model:'MX-366', price:5600, unit:'EA', desc:'클로스형 카트리지' },
  { id:'o2-pl-mx580', group:'plumbing', category:'부속품', brand:'오투바스', name:'90도 카트리지 써머몸통용', model:'MX-580', price:7800, unit:'EA', desc:'90도 카트리지 써머몸통용' },
  { id:'o2-pl-mx581', group:'plumbing', category:'부속품', brand:'오투바스', name:'90도 카트리지 단수용', model:'MX-581', price:6500, unit:'EA', desc:'90도 카트리지 단수용' },
  { id:'o2-pl-mx583', group:'plumbing', category:'부속품', brand:'오투바스', name:'2방향전환카트리지', model:'MX-583', price:7800, unit:'EA', desc:'2방향 전환 카트리지' },
  { id:'o2-pl-mx584', group:'plumbing', category:'부속품', brand:'오투바스', name:'3방향전환카트리지', model:'MX-584', price:7800, unit:'EA', desc:'3방향 전환 카트리지' },
  { id:'o2-pl-ms083', group:'plumbing', category:'부속품', brand:'오투바스', name:'씽크메탈호스 0.5M', model:'MS-083', price:5300, unit:'EA', desc:'씽크 메탈 호스 0.5M' },
  { id:'o2-pl-ms015', group:'plumbing', category:'부속품', brand:'오투바스', name:'핸드스프레이씽크헤드', model:'MS-015', price:7800, unit:'EA', desc:'핸드스프레이 씽크헤드' },
  { id:'o2-pl-ms048', group:'plumbing', category:'부속품', brand:'오투바스', name:'핸드스프레이씽크헤드', model:'MS-048', price:8600, unit:'EA', desc:'핸드스프레이 씽크헤드' },
  { id:'o2-pl-ms340', group:'plumbing', category:'부속품', brand:'오투바스', name:'핸드스프레이씽크헤드', model:'MS-340', price:10200, unit:'EA', desc:'핸드스프레이 씽크헤드' },
  { id:'o2-pl-ms481', group:'plumbing', category:'부속품', brand:'오투바스', name:'델타씽크헤드', model:'MS-481', price:9100, unit:'EA', desc:'델타 씽크헤드' },
  { id:'o2-pl-ms007', group:'plumbing', category:'부속품', brand:'오투바스', name:'핸드스프레이씽크헤드', model:'MS-007', price:11400, unit:'EA', desc:'핸드스프레이 씽크헤드' },
  { id:'o2-pl-my985', group:'plumbing', category:'부속품', brand:'오투바스', name:'다기능스프레이건', model:'MY-985', price:11900, unit:'EA', desc:'다기능 스프레이건' },
  { id:'o2-pl-my988', group:'plumbing', category:'부속품', brand:'오투바스', name:'미니스프레이건', model:'MY-988', price:9400, unit:'EA', desc:'미니 스프레이건' },
  { id:'o2-pl-mx567', group:'plumbing', category:'부속품', brand:'오투바스', name:'테프론 테이프', model:'MX-567', price:500, unit:'EA', desc:'테프론 테이프' },
  { id:'o2-pl-mb560c', group:'plumbing', category:'부속품', brand:'오투바스', name:'욕조덮개 크롬', model:'MB-560C', price:2000, unit:'EA', desc:'욕조덮개 분배기포함 크롬' },
  { id:'o2-pl-mb560w', group:'plumbing', category:'부속품', brand:'오투바스', name:'욕조덮개 백색', model:'MB-560W', price:1700, unit:'EA', desc:'욕조덮개 분배기포함 백색' },

  // 대림바스 실제 제품 (daelimbath.com 공식 + 대림몰 연동)
  { id:'dl-toilet-cc730', group:'toilet', category:'양변기', brand:'대림바스', name:'CC-730 투피스 림리스 양변기', model:'CC-730', price:370000, unit:'EA', desc:'림리스·절수형 투피스 양변기 (부속포함)' },
  { id:'dl-toilet-cc735', group:'toilet', category:'양변기', brand:'대림바스', name:'CC-735 치마형 림리스 양변기', model:'CC-735', price:320000, unit:'EA', desc:'치마형(스커트) 림리스 투피스 양변기' },
  { id:'dl-basin-velo', group:'basin', category:'세면기', brand:'대림바스', name:'VELO 일체형 세면기', model:'VELO', price:280000, unit:'EA', desc:'대림바스 VELO 시리즈 일체형 세면기' },
  { id:'dl-faucet-lusso-chrome', group:'basinFaucet', category:'세면수전', brand:'대림바스', name:'LUSSO 세면수전 크롬', model:'HFL-A10CR3', price:198000, unit:'EA', desc:'LUSSO 시리즈 원홀 세면수전 크롬' },
  { id:'dl-shower-arno-chrome', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'아르노 라운드 샤워수전 크롬', model:'DL-B4213CR', price:245000, unit:'EA', desc:'아르노 시리즈 샤워욕조수전 크롬' },
  { id:'dl-shower-arno-nickel', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'아르노 라운드 샤워수전 니켈', model:'DL-B4213LN', price:268000, unit:'EA', desc:'아르노 시리즈 샤워욕조수전 브러쉬드니켈' },
  { id:'dl-shower-arno-sq-nickel', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'아르노 스퀘어 샤워수전 니켈', model:'DL-B4313LN', price:285000, unit:'EA', desc:'아르노 스퀘어 시리즈 샤워욕조수전 니켈' },
  { id:'dl-shower-column', group:'showerFaucet', category:'샤워수전', brand:'대림바스', name:'COLUMN 레인샤워수전 니켈', model:'DL-B6011LN', price:398000, unit:'EA', desc:'COLUMN 시리즈 레인샤워 욕조 3WAY 수전 니켈' }
];

// Remove fictional / unverified products
const _REMOVE_IDS = new Set([
  'wall-basic-white','wall-stone-gray','wall-premium-beige',
  'floor-basic-gray','floor-dark-stone','floor-premium-concrete',
  'toilet-twopiece-basic','toilet-skirted-mid','toilet-bidet-premium',
  'basin-pedestal-basic','basin-counter-premium',
  'faucet-basin-basic','faucet-basin-mid','faucet-basin-premium',
  'faucet-shower-basic','faucet-shower-mid','faucet-shower-premium',
  'fan-basic',
  'ceiling-basic','ceiling-mid','ceiling-premium','ceiling-pvc-ivory','ceiling-pvc-beige','ceiling-pvc-marble','ceiling-pvc-wood',
  'ceiling-dome-ivory','ceiling-dome-beige','ceiling-abs-moisture','ceiling-alu-louver','ceiling-alu-louver-black','ceiling-lux-light',
  'mirror-basic','mirror-led','mirror-premium',
  'partition-basic','partition-booth','bathtub-basic',
  'drain-basic','drain-premium',
  'accessory-basic','accessory-premium',
  'material-basic','material-premium',
  'wall-subway-white-gloss','wall-subway-ivory-gloss',
  'wall-3060-gloss-white','wall-3060-natural-stone',
  'wall-3060-hansem-white','wall-3060-hansem-gray','wall-3060-hansem-beige',
  'wall-3060-kcc-concrete','wall-3060-kcc-white',
  'wall-3090-white','wall-3090-gray',
  'wall-6120-white','wall-6120-beige',
  'wall-hex-white','wall-hex-black',
  'floor-200-white','floor-200-beige',
  'floor-300-beige-inus','floor-300-white-hs',
  'floor-300-brown-inus','floor-600-gray-inus','floor-600-white-hs',
  'floor-mosaic-white',
  'toilet-basic-inus','toilet-basic-is','toilet-basic-royal',
  'toilet-onepiece-basic','toilet-onepiece-inus','toilet-skirted-inus',
  'toilet-onepiece-daelim','toilet-skirted-royal','toilet-onepiece-is',
  'toilet-smart-inus','toilet-smart-daelim','toilet-wallhung-inus','toilet-wallhung-as',
  'sink-daelim-cobra','sink-daelim-onehole','sink-daelim-spray','sink-daelim-pulldown','sink-daelim-touch',
  'sink-inus-cobra','sink-inus-onehole','sink-inus-spray','sink-inus-pulldown',
  'sink-hansem-basic','sink-hansem-spray','sink-hansem-premium',
  'sink-as-pulldown','sink-as-premium',
  'furn-hansem-lower-600','furn-hansem-lower-750','furn-hansem-lower-900',
  'furn-hansem-upper-600','furn-hansem-upper-900',
  'furn-hansem-vanity-600','furn-hansem-vanity-750','furn-hansem-vanity-900',
  'furn-inus-lower-600','furn-inus-lower-750','furn-inus-vanity-750',
  'furn-daelim-lower-600','furn-daelim-upper-600','furn-daelim-vanity-750',
  'furn-masis-lower-600','furn-masis-lower-750','furn-masis-upper-600','furn-masis-vanity-750'
]);
catalog = catalog.filter(p => !_REMOVE_IDS.has(p.id));

let model3dIds = new Set(); // product IDs that have GLB models in IndexedDB

// ── Static file path helpers ───────────────────────────────────────────────
// Maps product data field values → actual folder names on disk
const _BRAND_FOLDER = { '대림바스': '대림' };
const _CAT_FOLDERS  = {
  '세면기':   ['세면기', '세면대'],
  '세면수전': ['세면수전', '수전'],
  '샤워수전': ['샤워수전', '수전'],
  '씽크수전': ['씽크수전', '수전'],
};
// 연속 실패 횟수 — 목록(product-images-data.js)이 없을 때만 쓰는 추측 방식의 404 소음 방지용
let _staticImgFailStreak = 0;
const _STATIC_IMG_MAX_FAIL = 12;

// 경로의 각 구간을 URL 안전하게 변환 (공백·한글·#·% 등이 들어간 파일명 대응)
function _encPath(p) { return String(p).replace(/^\.\//, '').split('/').map(encodeURIComponent).join('/'); }

// 배포 사이트용: images/products 폴더의 실제 파일 목록(product-images-data.js)에서 경로를 찾음.
// 파일 확장자(png/jpg/webp), 대소문자, 폴더 구조가 달라도 실제 파일명을 그대로 사용하므로 안전함.
function _manifestImgPath(p) {
  const M = window._PRODUCT_IMAGES;
  if (!M) return null;
  const brand = String(_BRAND_FOLDER[p.brand] || p.brand || '').toLowerCase();
  const model = String(p.model || '').toLowerCase();
  const id    = String(p.id || '').toLowerCase();
  return M[brand + '/' + model] || M['*/' + model] || M['*/' + id] || null;
}

// 3D 모델(.glb) 파일도 같은 목록(window._PRODUCT_GLBS)에서 찾음
function _manifestGlbPath(p) {
  const M = window._PRODUCT_GLBS;
  if (!M) return null;
  const brand = String(_BRAND_FOLDER[p.brand] || p.brand || '').toLowerCase();
  const model = String(p.model || '').toLowerCase();
  const id    = String(p.id || '').toLowerCase();
  return M[brand + '/' + model] || M['*/' + model] || M['*/' + id] || null;
}

function _staticImgCandidates(p) {
  const brand = _BRAND_FOLDER[p.brand] || p.brand;
  const cat   = (_CAT_FOLDERS[p.category] || [p.category])[0];
  // 목록 파일이 없을 때의 추측 경로 (jpg·png 모두 시도)
  return [
    `images/products/${brand}/${cat}/${p.model}.jpg`,
    `images/products/${brand}/${cat}/${p.model}.png`,
    `images/products/${brand}/${p.model}.jpg`,
    `images/products/${brand}/${p.model}.png`,
  ];
}
function _staticGlbCandidates(p) {
  const brand = _BRAND_FOLDER[p.brand] || p.brand;
  const cats  = _CAT_FOLDERS[p.category] || [p.category];
  const out = [];
  for (const cat of cats) out.push(`images/products/${brand}/${cat}/${p.model}.glb`);
  out.push(`images/products/${brand}/${p.model}.glb`);
  return out;
}

// Use admin-managed catalog if available; otherwise seed from default data
const _adminCatalog = JSON.parse(localStorage.getItem('bathroom-catalog-db-v1') || 'null');
if (_adminCatalog && Array.isArray(_adminCatalog) && _adminCatalog.length > 0) {
  catalog = _adminCatalog;
} else if (window._DEFAULT_CATALOG_DATA && Array.isArray(window._DEFAULT_CATALOG_DATA) && window._DEFAULT_CATALOG_DATA.length > 0) {
  catalog = window._DEFAULT_CATALOG_DATA;
}

const CATALOG_STEPS = [
  { group: 'toilet',            label: '양변기' },
  { group: 'bidet',             label: '비데' },
  { group: 'basin',             label: '세면기' },
  { group: 'basinFaucet',       label: '세면수전' },
  { group: 'showerFaucet',      label: '샤워수전' },
  { group: 'wallTile',          label: '벽타일' },
  { group: 'floorTile',         label: '바닥타일' },
  { group: 'fan',               label: '환풍기' },
  { group: 'ceiling',           label: '천장재' },
  { group: 'mirrorCabinet',     label: '거울장' },
  { group: 'bathroomFurniture', label: '욕실장' },
  { group: 'partition',         label: '파티션/부스' },
  { group: 'drain',             label: '배수/트랩' },
  { group: 'accessory',         label: '악세서리' },
  { group: 'bathroomDoor',      label: '욕실문' },
  { group: 'material',          label: '부자재' },
];

const GROUP_LABELS = Object.fromEntries(CATALOG_STEPS.map(s => [s.group, s.label]));

const DEMOLITION_LABELS = { partial: '부분 철거', full: '올철거', overlay: '덧방 시공' };
const SHOWER_TYPE_LABELS = { open: '오픈 샤워', partition: '유리 파티션', booth: '샤워 부스', bathtub: '욕조 포함' };

function getExtraTileRates() { const c = getWorkCosts(); return { basic: c.extraTile_basic, mid: c.extraTile_mid, premium: c.extraTile_premium }; }
const EXTRA_TILE_GRADE_LABELS = { basic: '기본형', mid: '중급형', premium: '프리미엄' };
const EXTRA_TILES = [
  { key: 'entrance', label: '현관 타일' },
  { key: 'kitchen',  label: '주방 타일' },
  { key: 'balcony',  label: '베란다 타일' },
];

const el = {
  stepNav: document.getElementById('stepNav'),
  panels: [...document.querySelectorAll('.step-panel')],
  bathroomOverview: document.getElementById('bathroomOverview'),
  configTabs: document.getElementById('configTabs'),
  singleBathroomForm: document.getElementById('singleBathroomForm'),
  catalogTabs: document.getElementById('catalogTabs'),
  catalogWizardProgress: document.getElementById('catalogWizardProgress'),
  catalogToolbar: document.getElementById('catalogToolbar'),
  recoTabs: document.getElementById('recoTabs'),
  estimateTabs: document.getElementById('estimateTabs'),
  activeBathroomSummary: document.getElementById('activeBathroomSummary'),
  catalogContainer: document.getElementById('catalogContainer'),
  catalogSearch: document.getElementById('catalogSearch'),
  catalogCategoryFilter: document.getElementById('catalogCategoryFilter'),
  catalogBrandFilter: document.getElementById('catalogBrandFilter'),
  cartList: document.getElementById('cartList'),
  costSummary: document.getElementById('costSummary'),
  recommendations: document.getElementById('recommendations'),
  estimateDocument: document.getElementById('estimateDocument'),
  installBtn: document.getElementById('installBtn'),
  printBtn: document.getElementById('printBtn'),
  saveLocalBtn: document.getElementById('saveLocalBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  importJsonBtn: document.getElementById('importJsonBtn'),
  importJsonInput: document.getElementById('importJsonInput'),
  replaceModal: document.getElementById('replaceModal'),
  replaceModalBackdrop: document.getElementById('replaceModalBackdrop'),
  replaceModalTitle: document.getElementById('replaceModalTitle'),
  replaceModalSub: document.getElementById('replaceModalSub'),
  replaceModalBody: document.getElementById('replaceModalBody'),
  replaceModalClose: document.getElementById('replaceModalClose'),
  replaceModalCloseBtn: document.getElementById('replaceModalCloseBtn'),
  replaceSearch: document.getElementById('replaceSearch'),
  recoModal: document.getElementById('recoModal'),
  recoModalBackdrop: document.getElementById('recoModalBackdrop'),
  recoModalTitle: document.getElementById('recoModalTitle'),
  recoModalSub: document.getElementById('recoModalSub'),
  recoModalBody: document.getElementById('recoModalBody'),
  recoModalClose: document.getElementById('recoModalClose'),
  recoModalCloseBtn: document.getElementById('recoModalCloseBtn'),
  recoModalApply: document.getElementById('recoModalApply')
};

let deferredPrompt = null;
let recoEditItems = null;
let recoEditBathroom = null;

function createBathroom(index) {
  return {
    id: `bath-${index + 1}`,
    name: bathroomNames[index],
    type: index === 0 ? 'common' : index === 1 ? 'master' : 'powder',
    demolitionType: 'full',
    showerType: index === 1 ? 'partition' : 'open',
    needPlumbingMove: false,
    needWaterproofReinforce: true,
    needCeilingReplace: true,
    needHeatingFan: false,
    needStorageUpgrade: false,
    needLuxuryFinish: false,
    selectedItems: {},
    manualOverrides: {},
    lastAppliedRecommendation: null,
    catalogStep: 0,
    catalogWizardMode: true
  };
}

function defaultState() {
  return {
    step: 1,
    info: { customerName: '', customerPhone: '', projectName: '', address: '', aptSize: '24', bathroomCount: 1, scheduleStart: '', scheduleEnd: '', totalBudget: '',
      entranceTile: false, entranceTileArea: '', entranceTileGrade: 'mid',
      kitchenTile: false, kitchenTileArea: '', kitchenTileGrade: 'mid',
      balconyTile: false, balconyTileArea: '', balconyTileGrade: 'mid' },
    activeBathroomIndex: 0,
    estimateViewIndex: -1,
    bathrooms: [createBathroom(0)]
  };
}

function hydrateBathrooms(count, existing = []) {
  return Array.from({ length: count }, (_, i) => {
    const base = createBathroom(i);
    const prev = existing[i] || {};
    return { ...base, ...prev, name: bathroomNames[i], selectedItems: prev.selectedItems || {}, manualOverrides: prev.manualOverrides || {} };
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return defaultState();
    const merged = { ...defaultState(), ...saved, info: { ...defaultState().info, ...(saved.info || {}) } };
    const count = Number(merged.info.bathroomCount || 1);
    merged.bathrooms = hydrateBathrooms(count, saved.bathrooms || []);
    merged.activeBathroomIndex = Math.min(merged.activeBathroomIndex || 0, count - 1);
    if (typeof merged.estimateViewIndex !== 'number') merged.estimateViewIndex = -1;
    return merged;
  } catch {
    return defaultState();
  }
}

const state = loadState();

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function formatWon(n) { return `${KRW.format(Math.round(n || 0))}원`; }
function getBathroom(i = state.activeBathroomIndex) { return state.bathrooms[i]; }
function groupLabel(group) { return catalog.find(i => i.group === group)?.category || group; }
const PRODUCT_URLS = {
  'o2-fl-dfl810':  'https://o2bath.com/product/d-%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-dfl-810/260/',
  'o2-fl-dfl811':  'https://o2bath.com/product/d-%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-dfl-811/262/',
  'o2-fl-dfl812':  'https://o2bath.com/product/d-%EC%9B%90%ED%99%80%EA%B2%B8%EC%9A%A9%EC%88%98%EC%A0%84-dfl-812/264/',
  'o2-fl-dfl813':  'https://o2bath.com/product/d-%EA%B2%B8%EC%9A%A9%EC%88%98%EC%A0%84-dfl-813/263/',
  'o2-fl-mfl602s': 'https://o2bath.com/product/m-4%EC%9D%B8%EC%B9%98-%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-mfl-602s/369/',
  'o2-fl-mfl603s': 'https://o2bath.com/product/4%EC%9D%B8%EC%B9%98-%EA%B2%B8%EC%9A%A9-%EC%83%A4%EC%9B%8C-mfl-603s/371/',
  'o2-fl-ncfs934': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%BD%94%EB%B8%8C%EB%9D%BC-ncfs-934/359/',
  'o2-fl-ncfl930': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4-ncfl-930/355/',
  'o2-fl-qfl031':  'https://o2bath.com/product/4%EC%9D%B8%EC%B9%98-%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-qfl-031/102/',
  'o2-fl-qfl033s': 'https://o2bath.com/product/4%EC%9D%B8%EC%B9%98-%EC%84%B8%EB%A9%B4-%EC%83%A4%EC%9B%8C-%EA%B2%B8%EC%9A%A9%EC%88%98%EC%A0%84-qfl-033s/389/',
  'o2-fl-qfl297s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-qfl-297s/101/',
  'o2-fl-pfl147s': 'https://o2bath.com/product/4%EC%9D%B8%EC%B9%98-%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-pfl-147s/99/',
  'o2-fl-pfl146s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-pfl-146s/98/',
  'o2-fl-wfl527s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-wfl-527s/83/',
  'o2-fl-nfl277s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-nfl-277s/96/',
  'o2-fl-lfl801s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-lfl-801s/94/',
  'o2-fl-sfl1000': 'https://o2bath.com/product/%EC%8A%A4%ED%85%8C%EC%9D%B8%EB%A0%88%EC%8A%A4-%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-sfl-1000/399/',
  'o2-fl-sfl1002': 'https://o2bath.com/product/%EC%8A%A4%ED%85%8C%EC%9D%B8%EB%A0%88%EC%8A%A4-%EC%9B%90%ED%99%80%EA%B2%B8%EC%9A%A9%EC%88%98%EC%A0%84-sfl-1002/401/',
  'o2-fl-efl108s': 'https://o2bath.com/product/4%EC%9D%B8%EC%A7%80-%EC%84%B8%EB%A9%B4%EC%83%A4%EC%9B%8C%EA%B2%B8%EC%9A%A9-efl-108s/394/',
  'o2-fl-ufl592s': 'https://o2bath.com/product/u-4%EC%9D%B8%EC%B9%98-%EA%B2%B8%EC%9A%A9%EC%83%A4%EC%9B%8C-ufl-592s/290/',
  'o2-fl-ufl599s': 'https://o2bath.com/product/u-%EC%9B%90%ED%99%80%EA%B2%B8%EC%9A%A9%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-ufl-599s/293/',
  'o2-fl-pfl207s': 'https://o2bath.com/product/4%EC%9D%B8%EC%B9%98-%EC%84%B8%EB%A9%B4-%EC%83%A4%EC%9B%8C-%EA%B2%B8%EC%9A%A9-%EC%88%98%EC%A0%84-pfl-207s/391/',
  'o2-fl-fl824s':  'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-fl-824s/79/',
  'o2-fl-fl825':   'https://o2bath.com/product/%ED%9A%8C%EC%A0%84%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-fl-825/406/',
  'o2-fl-fl827s':  'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-fl-827s/80/',
  'o2-fl-hbfl828s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-hbfl-828s/89/',
  'o2-fl-hbfl833s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-hbfl-833s/90/',
  'o2-fl-hbfl842s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-hbfl-842s/91/',
  'o2-fl-gsfl790s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-gsfl-790s/78/',
  'o2-fl-gmfl771s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-gmfl-771s/65/',
  'o2-fl-gmfl772s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%ED%83%91%EB%B3%BC%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-gmfl-772s/84/',
  'o2-fl-nfl273s': 'https://o2bath.com/product/%EC%9B%90%ED%99%80%ED%83%91%EB%B3%BC%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-nfl-273s/97/',
  'o2-fl-gdfl757s':'https://o2bath.com/product/%EC%9B%90%ED%99%80%ED%83%91%EB%B3%BC%EC%84%B8%EB%A9%B4%EC%88%98%EC%A0%84-gdfl-757s/87/',
  'o2-fl-hfl264':  'https://o2bath.com/product/h-%ED%88%AC%ED%95%B8%EB%93%A4-%EC%9B%90%ED%99%80-%EC%84%B8%EB%A9%B4%EC%A3%BC%EB%B0%A9-hfl-264/259/',
  'o2-fb-dfb809':  'https://o2bath.com/product/d-%EC%83%A4%EC%9B%8C%EC%88%98%EC%A0%84-dfb-809/261/',
  'o2-fb-mfb601':  'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%9A%95%EC%A1%B0%EC%88%98%EC%A0%84-mfb-601/163/',
  'o2-fb-sfb1001': 'https://o2bath.com/product/%EC%8A%A4%ED%85%8C%EC%9D%B8%EB%A0%88%EC%8A%A4-%EC%83%A4%EC%9B%8C%EC%9A%95%EC%A1%B0%EC%88%98%EC%A0%84-sfb-1001/400/',
  'o2-fb-pfb148':  'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%88%98%EC%A0%84-pfb-148/164/',
  'o2-fb-hbfb863': 'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%88%98%EC%A0%84-hbfb-863/115/',
  'o2-fb-hbfb836': 'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%9A%95%EC%A1%B0%EC%88%98%EC%A0%84-hbfb-836/113/',
  'o2-fb-hbfb831': 'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%9A%95%EC%A1%B0%EC%88%98%EC%A0%84-hbfb-831/111/',
  'o2-fb-hbfb864': 'https://o2bath.com/product/%EC%83%A4%EC%9B%8C%EC%9A%95%EC%A1%B0%EC%88%98%EC%A0%84-hbfb-864/116/',
  'o2-fb-qfb176':  'https://o2bath.com/product/q-%EB%85%B8%EC%B6%9C%EC%83%A4%EC%9B%8C%EC%88%98%EC%A0%84-qfb-176/229/',
  'o2-fb-gfb463':  'https://o2bath.com/product/%EB%A0%88%EC%9D%B8%EC%83%A4%EC%9B%8C-gfb-463/227/',
  'basin-vanity-mid':   'https://m.inusmall.com/product/%EC%9D%B4%EB%88%84%EC%8A%A4-il672e-%EC%9D%BC%EC%B2%B4%ED%98%95-%EC%84%B8%EB%A9%B4%EA%B8%B0-%EB%AC%B4%EB%A3%8C%EB%B0%B0%EC%86%A1-%EC%88%98%EC%A0%84%EB%B6%80%EC%86%8D-%EB%B3%84%EB%8F%84/59/',
  'fan-mid':            'https://www.himpelmall.com/mall/m_mall_detail.php?ps_goid=701',
  'fan-premium':        'https://prod.danawa.com/info/?pcode=18189407',
  'dl-toilet-cc730':         'https://www.daelimbath.com/product/product_view?idx=65',
  'dl-toilet-cc735':         'https://bathnmore.co.kr/product/%EB%8C%80%EB%A6%BC%EB%B0%94%EC%8A%A4-cc-735-%ED%88%AC%ED%94%BC%EC%8A%A4-%EC%B9%98%EB%A7%88%ED%98%95-%EC%96%91%EB%B3%80%EA%B8%B0-%EB%A6%BC%EB%A6%AC%EC%8A%A4-%EC%8B%A0%EC%A0%9C%ED%92%88-cc735/7786/',
  'dl-basin-velo':           'https://www.daelimbath.com/product/product_view?idx=953',
  'dl-faucet-lusso-chrome':  'https://www.daelimbath.com/product/product_view?idx=975',
  'dl-shower-arno-chrome':   'https://www.daelimbath.com/product/product_view?idx=1089',
  'dl-shower-arno-nickel':   'https://www.daelimbath.com/product/product_view?idx=1090',
  'dl-shower-arno-sq-nickel':'https://www.daelimbath.com/product/product_view?idx=1093',
  'dl-shower-column':        'https://www.daelimbath.com/product/product_view?idx=970',
};

function thumbText(item) { return `${item.brand[0] || ''}${item.category[0] || ''}`; }
function productNaverUrl(item) { return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(item.brand + ' ' + item.model)}`; }
function resolveProductUrl(item) { return PRODUCT_URLS[item.id] || item.url || null; }
function productUrl(item) { return resolveProductUrl(item) || productNaverUrl(item); }
function productShopLinks(item) {
  const url = resolveProductUrl(item);
  const direct = url ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="shop-link shop-link-direct">공식몰 ↗</a>` : '';
  const daelimmall = !url && item.brand === '대림바스' ? `<a href="https://brand.naver.com/daelimmall" target="_blank" rel="noopener noreferrer" class="shop-link shop-link-daelim">대림몰 ↗</a>` : '';
  const naver = `<a href="${productNaverUrl(item)}" target="_blank" rel="noopener noreferrer" class="shop-link shop-link-naver">네이버</a>`;
  return `<span class="shop-links">${direct}${daelimmall}${naver}</span>`;
}

function ensureBathroomCount(count) {
  const num = Number(count);
  state.info.bathroomCount = num;
  state.bathrooms = hydrateBathrooms(num, state.bathrooms);
  state.activeBathroomIndex = Math.min(state.activeBathroomIndex, num - 1);
  if (state.estimateViewIndex >= num) state.estimateViewIndex = -1;
  saveState();
}

function getAreaProfile(bathroom) {
  return areaProfiles[bathroom.type][state.info.aptSize];
}

function getTileQuantities(bathroom) {
  const profile = getAreaProfile(bathroom);
  const wallItem = bathroom.selectedItems.wallTile || catalog.find(i => i.group === 'wallTile');
  const floorItem = bathroom.selectedItems.floorTile || catalog.find(i => i.group === 'floorTile');
  return {
    wallArea: profile.wall,
    floorArea: profile.floor,
    wallBoxes: Math.ceil((profile.wall * 1.1) / (wallItem.coverage || 1)),
    floorBoxes: Math.ceil((profile.floor * 1.1) / (floorItem.coverage || 1))
  };
}

function getBaseWorks(bathroom) {
  const c = getWorkCosts();
  const rows = [
    { key: '철거 공사',    amount: { partial: c.demolition_partial, full: c.demolition_full, overlay: c.demolition_overlay }[bathroom.demolitionType] || 0 },
    { key: '설비/배관 공사', amount: bathroom.needPlumbingMove ? c.plumbing : 0 },
    { key: '방수 공사',    amount: bathroom.needWaterproofReinforce ? c.waterproof : c.waterproof_basic },
    { key: '천장/전기 공사', amount: (bathroom.needCeilingReplace ? c.ceiling : 0) + c.electrical + (bathroom.needHeatingFan ? c.heatingFanExtra : 0) },
    { key: '기구 설치 공사', amount: c.fixtureInstall },
    { key: '폐기물/청소',  amount: c.cleanup },
  ];
  return rows.filter(r => r.amount > 0);
}

const QTY_ADJUSTABLE_GROUPS = new Set(['material', 'accessory']);

function getSelectedEntries(bathroom) {
  const tiles = getTileQuantities(bathroom);
  return Object.values(bathroom.selectedItems).map(item => {
    let qty = item._qty || 1;
    if (item.group === 'wallTile') qty = tiles.wallBoxes;
    if (item.group === 'floorTile') qty = tiles.floorBoxes;
    if (item.group === 'ceiling') qty = tiles.floorArea;  // 바닥 면적(㎡) 기준
    return { ...item, qty, amount: Math.round(qty * item.price) };
  }).sort((a, b) => a.category.localeCompare(b.category, 'ko'));
}

function adjustItemQty(bathIndex, group, delta) {
  const item = state.bathrooms[bathIndex].selectedItems[group];
  if (!item) return;
  const next = Math.max(1, (item._qty || 1) + delta);
  state.bathrooms[bathIndex].selectedItems[group] = { ...item, _qty: next };
  saveState();
  renderAll();
}

function computeTotals(entries, bathroom) {
  const materialTotal = entries.reduce((sum, item) => sum + item.amount, 0);
  const works = getBaseWorks(bathroom);
  const workTotal = works.reduce((sum, r) => sum + r.amount, 0);
  const c = getWorkCosts();
  const luxury = bathroom.needLuxuryFinish ? Math.round((materialTotal + workTotal) * (c.luxuryFactor / 100)) : 0;
  const reserve = Math.round((materialTotal + workTotal + luxury) * (c.reserveFactor / 100));
  const grand = materialTotal + workTotal + luxury + reserve;
  return { materialTotal, works, workTotal, luxury, reserve, grand };
}

function getBathroomTotals(index) {
  const bathroom = state.bathrooms[index];
  const entries = getSelectedEntries(bathroom);
  return { bathroom, entries, ...computeTotals(entries, bathroom) };
}

function computeExtraTileCost() {
  const rates = getExtraTileRates();
  const items = [];
  EXTRA_TILES.forEach(({ key, label }) => {
    const enabled = state.info[`${key}Tile`];
    const area    = Number(state.info[`${key}TileArea`]);
    const grade   = state.info[`${key}TileGrade`] || 'mid';
    if (enabled && area > 0) {
      items.push({ label, area, grade, cost: Math.round(area * (rates[grade] || rates.mid)) });
    }
  });
  return { items, total: items.reduce((s, i) => s + i.cost, 0) };
}

function getProjectTotals() {
  const totals = state.bathrooms.reduce((acc, _, index) => {
    const t = getBathroomTotals(index);
    acc.materialTotal += t.materialTotal;
    acc.workTotal += t.workTotal;
    acc.luxury += t.luxury;
    acc.reserve += t.reserve;
    acc.grand += t.grand;
    return acc;
  }, { materialTotal: 0, workTotal: 0, luxury: 0, reserve: 0, grand: 0 });
  const extra = computeExtraTileCost();
  totals.extraTileItems = extra.items;
  totals.extraTileTotal = extra.total;
  totals.grand += extra.total;
  return totals;
}

function setStep(step) {
  state.step = step;
  saveState();
  [...el.stepNav.children].forEach(li => {
    const s = Number(li.dataset.step);
    li.classList.toggle('active', s === step);
    li.classList.toggle('done', s < step);
  });
  el.panels.forEach(panel => panel.classList.toggle('active', Number(panel.dataset.stepPanel) === step));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function addItemToBathroom(index, item) {
  state.bathrooms[index].selectedItems[item.group] = item;
  if (!state.bathrooms[index].manualOverrides) state.bathrooms[index].manualOverrides = {};
  state.bathrooms[index].manualOverrides[item.group] = item;
  const bathroom = state.bathrooms[index];
  const isWizardActive = bathroom.catalogWizardMode !== false && index === state.activeBathroomIndex;
  if (isWizardActive) {
    const currentStep = bathroom.catalogStep ?? 0;
    if (currentStep < CATALOG_STEPS.length - 1) {
      let nextStep = currentStep + 1;
      if (CATALOG_STEPS[nextStep]?.group === 'ceiling' && !bathroom.needCeilingReplace) {
        nextStep = Math.min(nextStep + 1, CATALOG_STEPS.length - 1);
      }
      bathroom.catalogStep = nextStep;
      el.catalogBrandFilter.value = 'all';
    }
  }
  saveState();
  renderAll();
  if (isWizardActive && el.catalogWizardProgress) {
    setTimeout(() => el.catalogWizardProgress.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }
}

function removeItemFromBathroom(index, group) {
  delete state.bathrooms[index].selectedItems[group];
  if (state.bathrooms[index].manualOverrides) delete state.bathrooms[index].manualOverrides[group];
  saveState();
  renderAll();
}

function bindTopForm() {
  ['customerName', 'customerPhone', 'projectName', 'address', 'aptSize', 'scheduleStart', 'scheduleEnd'].forEach(id => {
    const node = document.getElementById(id);
    node.value = state.info[id] || '';
    node.addEventListener('input', e => {
      state.info[id] = e.target.value;
      saveState();
      renderAll();
    });
  });
  const countNode = document.getElementById('bathroomCount');
  countNode.value = String(state.info.bathroomCount);
  countNode.addEventListener('change', e => {
    ensureBathroomCount(Number(e.target.value));
    renderAll();
  });
  const budgetNode = document.getElementById('totalBudget');
  budgetNode.value = state.info.totalBudget || '';
  budgetNode.addEventListener('input', e => {
    state.info.totalBudget = e.target.value;
    saveState();
    updateBudgetHint();
    renderAll();
  });
  updateBudgetHint();

  EXTRA_TILES.forEach(({ key }) => {
    const checkEl  = document.getElementById(`${key}TileCheck`);
    const areaEl   = document.getElementById(`${key}TileArea`);
    const gradeEl  = document.getElementById(`${key}TileGrade`);
    const bodyEl   = document.getElementById(`${key}TileBody`);
    const cardEl   = document.getElementById(`${key}TileCard`);
    if (!checkEl) return;

    const syncVisibility = () => {
      const on = !!state.info[`${key}Tile`];
      bodyEl.classList.toggle('hidden', !on);
      cardEl.classList.toggle('active', on);
    };

    checkEl.checked = !!state.info[`${key}Tile`];
    areaEl.value    = state.info[`${key}TileArea`] || '';
    gradeEl.value   = state.info[`${key}TileGrade`] || 'mid';
    syncVisibility();

    checkEl.addEventListener('change', e => {
      state.info[`${key}Tile`] = e.target.checked;
      syncVisibility(); saveState(); updateExtraTileEst(); renderAll();
    });
    areaEl.addEventListener('input', e => {
      state.info[`${key}TileArea`] = e.target.value;
      saveState(); updateExtraTileEst(); renderAll();
    });
    gradeEl.addEventListener('change', e => {
      state.info[`${key}TileGrade`] = e.target.value;
      saveState(); updateExtraTileEst(); renderAll();
    });
  });
  updateExtraTileEst();
}

function updateExtraTileEst() {
  EXTRA_TILES.forEach(({ key }) => {
    const estEl = document.getElementById(`${key}TileEst`);
    if (!estEl) return;
    const enabled = state.info[`${key}Tile`];
    const area    = Number(state.info[`${key}TileArea`]);
    const grade   = state.info[`${key}TileGrade`] || 'mid';
    estEl.textContent = (enabled && area > 0) ? `≈ ${formatWon(Math.round(area * getExtraTileRates()[grade]))}` : '';
  });
}

function updateBudgetHint() {
  const hint = document.getElementById('budgetPerBath');
  if (!hint) return;
  const total = Number(state.info.totalBudget);
  const count = state.bathrooms.length;
  if (total > 0 && count > 1) {
    const per = Math.round(total / count);
    hint.textContent = `→ 욕실 1개당 약 ${per.toLocaleString('ko-KR')}만원`;
  } else {
    hint.textContent = '';
  }
}

function populateCategoryFilter() {
  const categories = [...new Set(catalog.map(item => item.category))];
  el.catalogCategoryFilter.innerHTML = `<option value="all">전체 카테고리</option>${categories.map(c => `<option value="${c}">${c}</option>`).join('')}`;
}

function renderBathroomOverview() {
  el.bathroomOverview.innerHTML = state.bathrooms.map((bathroom, index) => {
    const area = getAreaProfile(bathroom);
    return `<article class="bathroom-card">
      <h3>${bathroom.name}</h3>
      <p>${bathroom.type === 'common' ? '공용 욕실' : bathroom.type === 'master' ? '안방 욕실' : '소형 욕실'}</p>
      <p>예상 바닥 ${area.floor.toFixed(1)}㎡ · 벽 ${area.wall.toFixed(1)}㎡</p>
    </article>`;
  }).join('');
}

function renderTabs(container, activeIndex, mode) {
  container.innerHTML = state.bathrooms.map((bathroom, index) => `<button class="bath-tab ${index === activeIndex ? 'active' : ''}" data-tab-index="${index}" data-tab-mode="${mode}">${bathroom.name}</button>`).join('') + (mode === 'estimate' ? `<button class="bath-tab ${activeIndex === -1 ? 'active' : ''}" data-tab-index="-1" data-tab-mode="estimate">전체 견적</button>` : '');
  container.querySelectorAll('[data-tab-index]').forEach(btn => btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.tabIndex);
    if (btn.dataset.tabMode === 'estimate') state.estimateViewIndex = idx;
    else state.activeBathroomIndex = idx;
    saveState();
    renderAll();
  }));
}

function renderSingleBathroomForm() {
  const bathroom = getBathroom();
  const idx = state.activeBathroomIndex;

  const btnGroup = (field, opts) =>
    `<div class="btn-group">${opts.map(([val, label, sub]) =>
      `<button class="btn-opt${bathroom[field] === val ? ' active' : ''}" data-field="${field}" data-value="${val}">
        <span class="btn-opt-label">${label}</span>
        <span class="btn-opt-sub">${sub}</span>
      </button>`
    ).join('')}</div>`;

  const optCard = (field, label, sub, cost) =>
    `<div class="opt-card${bathroom[field] ? ' active' : ''}" data-field="${field}">
      <div class="opt-card-info">
        <div class="opt-card-name">${label}</div>
        <div class="opt-card-sub">${sub}</div>
        ${cost ? `<div class="opt-card-cost">${cost}</div>` : ''}
      </div>
      <div class="opt-card-tick">✓</div>
    </div>`;

  el.singleBathroomForm.innerHTML = `<article class="bathroom-form-card">
    <h3>${bathroom.name}${bathroom.lastAppliedRecommendation ? `<span class="last-reco-note">추천안 적용: ${bathroom.lastAppliedRecommendation}</span>` : ''}</h3>

    <div class="cond-section">
      <div class="cond-label">욕실 유형</div>
      ${btnGroup('type', [
        ['common',  '공용 욕실',  '복도·거실에서 접근'],
        ['master',  '안방 욕실',  '마스터베드룸 전용'],
        ['powder',  '소형 욕실',  '화장실 단독형'],
      ])}
    </div>

    <div class="cond-section">
      <div class="cond-label">철거 방식</div>
      ${btnGroup('demolitionType', [
        ['partial', '부분 철거',  '타일만 교체'],
        ['full',    '올철거',    '방수층까지 완전 철거'],
        ['overlay', '덧방 시공', '기존 타일 위 시공'],
      ])}
    </div>

    <div class="cond-section">
      <div class="cond-label">샤워 구조</div>
      ${btnGroup('showerType', [
        ['open',      '오픈 샤워',    '커튼·구분 없음'],
        ['partition', '유리 파티션',  '고정 유리 분리'],
        ['booth',     '샤워 부스',    '도어 있는 부스'],
        ['bathtub',   '욕조 포함',    '욕조 설치형'],
      ])}
    </div>

    <div class="cond-section">
      <div class="cond-label">추가 옵션 <span class="field-hint">해당 항목을 눌러 켜기/끄기</span></div>
      <div class="opt-cards-grid">
        ${optCard('needPlumbingMove',        '배관 이설',       '배관 위치 변경 필요',    '+350,000원')}
        ${optCard('needWaterproofReinforce', '방수 보강',       '강화 방수 처리',         '+280,000원')}
        ${optCard('needCeilingReplace',      '천장 교체',       '천장 마감재 교체',       '+250,000원')}
        ${optCard('needHeatingFan',          '난방/제습 환풍기', '열선·제습 복합형 교체',  '+120,000원')}
        ${optCard('needStorageUpgrade',      '수납 업그레이드', '수납장 추가 희망',        '')}
        ${optCard('needLuxuryFinish',        '고급 마감',       '자재+공사비의 12% 추가', '+12%')}
      </div>
    </div>
  </article>`;

  el.singleBathroomForm.querySelectorAll('.btn-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const { field, value } = btn.dataset;
      state.bathrooms[idx][field] = value;
      if (field === 'demolitionType') {
        if (value === 'partial' || value === 'full') state.bathrooms[idx].needWaterproofReinforce = true;
        if (value === 'overlay') state.bathrooms[idx].needWaterproofReinforce = state.bathrooms[idx].showerType === 'bathtub';
      }
      if (field === 'showerType' && state.bathrooms[idx].demolitionType === 'overlay') {
        state.bathrooms[idx].needWaterproofReinforce = value === 'bathtub';
      }
      saveState(); renderAll();
    });
  });

  el.singleBathroomForm.querySelectorAll('.opt-card').forEach(card => {
    card.addEventListener('click', () => {
      state.bathrooms[idx][card.dataset.field] = !state.bathrooms[idx][card.dataset.field];
      saveState(); renderAll();
    });
  });
}

function renderActiveBathroomSummary() {
  const bathroom = getBathroom();
  const area = getAreaProfile(bathroom);
  const tiles = getTileQuantities(bathroom);
  el.activeBathroomSummary.innerHTML = `<strong>${bathroom.name}</strong> · ${bathroom.type === 'common' ? '공용 욕실' : bathroom.type === 'master' ? '안방 욕실' : '소형 욕실'} · 예상 바닥 ${area.floor.toFixed(1)}㎡ / 벽체 ${area.wall.toFixed(1)}㎡ · 벽타일 ${tiles.wallBoxes}박스 / 바닥타일 ${tiles.floorBoxes}박스`;
}

function renderCatalogWizard() {
  const bathroom = getBathroom();
  const wizardMode = bathroom.catalogWizardMode !== false;
  const step = Math.min(bathroom.catalogStep ?? 0, CATALOG_STEPS.length - 1);

  if (el.catalogToolbar) {
    el.catalogToolbar.style.display = '';
    const catLabel = el.catalogCategoryFilter.closest('label');
    if (catLabel) catLabel.style.display = wizardMode ? 'none' : '';
  }

  if (!el.catalogWizardProgress) return;

  if (!wizardMode) {
    el.catalogWizardProgress.innerHTML = `<div class="wizard-progress"><div class="wizard-mode-toggle-row"><button class="secondary" id="catalogModeToggle" style="font-size:.8rem;padding:7px 14px">단계별 선택으로 전환</button></div></div>`;
    el.catalogWizardProgress.querySelector('#catalogModeToggle').addEventListener('click', () => {
      state.bathrooms[state.activeBathroomIndex].catalogWizardMode = true;
      saveState(); renderAll();
    });
    return;
  }

  const effectiveSteps = CATALOG_STEPS.filter(s => s.group !== 'ceiling' || (bathroom.needCeilingReplace ?? true));
  const chips = effectiveSteps.map((s, effIdx) => {
    const absIdx = CATALOG_STEPS.indexOf(s);
    const isDone = !!bathroom.selectedItems[s.group];
    const isActive = absIdx === step;
    let cls = 'wizard-chip';
    if (isActive) cls += ' active';
    else if (isDone) cls += ' done';
    const numHtml = `<span class="wc-num">${isDone ? '✓' : effIdx + 1}</span>`;
    return `<button class="${cls}" data-wizard-step="${absIdx}">${numHtml}<span class="wc-lbl">${s.label}</span></button>`;
  }).join('');

  const lastEffectiveAbsIdx = CATALOG_STEPS.indexOf(effectiveSteps[effectiveSteps.length - 1]);
  const isLast = step >= lastEffectiveAbsIdx;
  const effectivePos = effectiveSteps.findIndex(s => CATALOG_STEPS.indexOf(s) === step);
  const displayPos = effectivePos >= 0 ? effectivePos + 1 : step + 1;
  el.catalogWizardProgress.innerHTML = `
    <div class="wizard-progress">
      <div class="wizard-step-header">
        <span class="wizard-step-count">${displayPos} / ${effectiveSteps.length} 단계</span>
        <strong class="wizard-step-name">${CATALOG_STEPS[step]?.label || ''} 선택 중</strong>
        <button class="ghost" id="catalogModeToggle" style="font-size:.78rem;padding:6px 12px;margin-left:auto;border-radius:10px">전체 보기</button>
      </div>
      <div class="wizard-chips">${chips}</div>
      <div class="wizard-nav">
        <button class="ghost wizard-prev" id="wizardPrevBtn" ${step === 0 ? 'disabled' : ''}>← 이전 자재</button>
        <button class="secondary wizard-skip" id="wizardSkipBtn" ${isLast ? 'disabled' : ''}>다음 자재선택 →</button>
      </div>
    </div>`;

  el.catalogWizardProgress.querySelector('#catalogModeToggle').addEventListener('click', () => {
    state.bathrooms[state.activeBathroomIndex].catalogWizardMode = false;
    saveState(); renderAll();
  });
  el.catalogWizardProgress.querySelector('#wizardPrevBtn').addEventListener('click', () => {
    const b = state.bathrooms[state.activeBathroomIndex];
    b.catalogStep = Math.max(0, (b.catalogStep ?? 0) - 1);
    el.catalogBrandFilter.value = 'all';
    saveState(); renderAll();
  });
  el.catalogWizardProgress.querySelector('#wizardSkipBtn').addEventListener('click', () => {
    const b = state.bathrooms[state.activeBathroomIndex];
    b.catalogStep = Math.min(CATALOG_STEPS.length - 1, (b.catalogStep ?? 0) + 1);
    el.catalogBrandFilter.value = 'all';
    saveState(); renderAll();
  });
  el.catalogWizardProgress.querySelectorAll('[data-wizard-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.bathrooms[state.activeBathroomIndex].catalogStep = Number(btn.dataset.wizardStep);
      el.catalogBrandFilter.value = 'all';
      saveState(); renderAll();
    });
  });
}

function updateBrandFilter(baseItems) {
  const brands = [...new Set(baseItems.map(i => i.brand))].sort((a, b) => a.localeCompare(b, 'ko'));
  const current = el.catalogBrandFilter.value;
  el.catalogBrandFilter.innerHTML = `<option value="all">전체 브랜드</option>` +
    brands.map(b => `<option value="${b}"${b === current ? ' selected' : ''}>${b}</option>`).join('');
}

function renderCatalog() {
  const bathroom = getBathroom();
  const wizardMode = bathroom.catalogWizardMode !== false;
  const currentStep = Math.min(bathroom.catalogStep ?? 0, CATALOG_STEPS.length - 1);

  // 천장 교체 미선택 시 천장재 스텝 자동 건너뛰기
  if (wizardMode && CATALOG_STEPS[currentStep]?.group === 'ceiling' && !(bathroom.needCeilingReplace ?? true)) {
    const b = state.bathrooms[state.activeBathroomIndex];
    b.catalogStep = Math.min(currentStep + 1, CATALOG_STEPS.length - 1);
    saveState();
    renderCatalogWizard();
    renderCatalog();
    return;
  }

  const search = el.catalogSearch.value.trim().toLowerCase();
  const category = el.catalogCategoryFilter.value;
  const brand = el.catalogBrandFilter.value;
  const selectedGroups = new Set(Object.keys(bathroom.selectedItems));

  // Base set (wizard step or category) — used to populate brand filter options
  const baseItems = wizardMode
    ? catalog.filter(item => item.group === CATALOG_STEPS[currentStep].group)
    : catalog.filter(item => {
        if (item.group === 'ceiling' && !(bathroom.needCeilingReplace ?? true)) return false;
        return category === 'all' || item.category === category;
      });
  updateBrandFilter(baseItems);

  const filtered = baseItems.filter(item => {
    if (!wizardMode) {
      const hay = `${item.brand} ${item.name} ${item.model} ${item.category}`.toLowerCase();
      if (search && !hay.includes(search)) return false;
    }
    return brand === 'all' || item.brand === brand;
  });
  const tpl = document.getElementById('catalogCardTemplate');
  el.catalogContainer.innerHTML = '';
  filtered.forEach(item => {
    const frag = tpl.content.cloneNode(true);
    const thumb = frag.querySelector('.thumb');
    thumb.textContent = thumbText(item);
    const cardImgWrap = frag.querySelector('.card-img-wrap');

    const showCardImg = (dataUrl) => {
      const img = document.createElement('img');
      img.alt = item.name;
      img.src = dataUrl;
      cardImgWrap.classList.remove('hidden');
      cardImgWrap.innerHTML = '';
      cardImgWrap.appendChild(img);
    };
    const tryFileImg = () => {
      const listed = _manifestImgPath(item);
      if (listed) {
        const img = document.createElement('img');
        img.alt = item.name;
        img.src = './' + _encPath(listed);
        img.onload = () => { cardImgWrap.classList.remove('hidden'); cardImgWrap.innerHTML = ''; cardImgWrap.appendChild(img); };
        return;
      }
      if (window._PRODUCT_IMAGES) return;   // 파일 목록이 있는데 이 제품 사진이 없으면 추측하지 않음(404 방지)
      if (_staticImgFailStreak >= _STATIC_IMG_MAX_FAIL) return; // 연속 실패 시 중단
      const paths = _staticImgCandidates(item);
      let i = 0;
      const tryNext = () => {
        if (i >= paths.length) { _staticImgFailStreak++; return; }
        const img = document.createElement('img');
        img.alt = item.name;
        img.src = paths[i++];
        img.onload = () => {
          _staticImgFailStreak = 0;
          cardImgWrap.classList.remove('hidden');
          cardImgWrap.innerHTML = '';
          cardImgWrap.appendChild(img);
        };
        img.onerror = tryNext;
      };
      tryNext();
    };
    if (window.ImageDB) {
      ImageDB.get(item.id).then(dataUrl => { if (dataUrl) showCardImg(dataUrl); else tryFileImg(); }).catch(tryFileImg);
    } else {
      tryFileImg();
    }

    frag.querySelector('.badge').textContent = item.category;
    frag.querySelector('h3').textContent = `${item.brand} ${item.name}`;
    const metaEl = frag.querySelector('.meta');
    metaEl.textContent = `형번 ${item.model} · ${item.unit}`;
    const shopLinksEl = document.createElement('span');
    shopLinksEl.innerHTML = productShopLinks(item);
    metaEl.after(shopLinksEl);
    frag.querySelector('.desc').textContent = item.desc;
    frag.querySelector('.price').textContent = formatWon(item.price);
    const btn = frag.querySelector('.add-btn');
    btn.textContent = selectedGroups.has(item.group) ? '교체하기' : '담기';
    btn.addEventListener('click', e => { e.stopPropagation(); addItemToBathroom(state.activeBathroomIndex, item); });
    const detailBtn = frag.querySelector('.detail-btn');
    detailBtn.addEventListener('click', e => { e.stopPropagation(); openProductDetailModal(item); });
    const model3dBtn = frag.querySelector('.model3d-btn');
    if (model3dIds.has(item.id)) {
      model3dBtn.style.display = '';
      model3dBtn.addEventListener('click', e => { e.stopPropagation(); openModel3dModal(item); });
    }
    frag.querySelector('.catalog-card').addEventListener('click', () => openProductDetailModal(item));
    el.catalogContainer.appendChild(frag);
  });
}

function buildRecommendationSeed(ratio) {
  const pick = (group, r) => {
    const items = catalog.filter(i => i.group === group).sort((a, b) => a.price - b.price);
    if (!items.length) return null;
    return items[Math.min(Math.floor(r * items.length), items.length - 1)];
  };
  const seed = {
    wallTile:      pick('wallTile',      ratio),
    floorTile:     pick('floorTile',     ratio),
    toilet:        pick('toilet',        ratio),
    basin:         pick('basin',         ratio),
    basinFaucet:   pick('basinFaucet',   ratio),
    showerFaucet:  pick('showerFaucet',  ratio),
    fan:           pick('fan',           ratio),
    ceiling:       pick('ceiling',       ratio),
    mirrorCabinet: pick('mirrorCabinet', ratio),
    drain:         pick('drain',         Math.min(ratio * 1.5, 1)),
    accessory:     pick('accessory',     ratio),
    material:      pick('material',      ratio),
  };
  if (ratio >= 0.45) {
    seed.bidet = pick('bidet', (ratio - 0.45) / 0.55);
  }
  if (ratio >= 0.65) {
    seed.bathroomFurniture = pick('bathroomFurniture', (ratio - 0.65) / 0.35);
  }
  return seed;
}

function buildRecommendationsForBathroom(bathroom) {
  const tiers = [
    ['초경제형',   0.00],
    ['경제형',     0.11],
    ['실속형',     0.22],
    ['표준형',     0.33],
    ['중급형',     0.44],
    ['중상급형',   0.55],
    ['고급형',     0.66],
    ['프리미엄형', 0.77],
    ['최고급형',   0.88],
    ['럭셔리형',   1.00],
  ];
  const partitions = catalog.filter(i => i.group === 'partition').sort((a, b) => a.price - b.price);
  const pickPartition = r => partitions[Math.min(Math.floor(r * partitions.length), partitions.length - 1)];
  const heatFans = catalog.filter(i => i.group === 'fan' && i.price >= 200000).sort((a, b) => a.price - b.price);

  // 사용자가 직접 선택한 항목 목록 (추천안 일괄 적용 항목은 제외)
  const pinned = bathroom.manualOverrides || {};
  const pinnedGroups = new Set(Object.keys(pinned).filter(k => pinned[k]));

  return tiers.map(([label, ratio], idx) => {
    const items = buildRecommendationSeed(ratio);
    if (bathroom.showerType === 'open')         items.partition = partitions[0];
    else if (bathroom.showerType === 'booth')   items.partition = catalog.find(i => i.id === 'partition-booth') || pickPartition(ratio);
    else if (bathroom.showerType === 'bathtub') items.partition = catalog.find(i => i.id === 'bathtub-basic')   || pickPartition(ratio);
    else                                        items.partition = pickPartition(ratio);
    if (bathroom.needHeatingFan && heatFans.length) {
      items.fan = heatFans[Math.min(Math.floor(ratio * heatFans.length), heatFans.length - 1)];
    }
    if (!bathroom.needCeilingReplace) delete items.ceiling;
    // 사용자가 직접 고른 항목은 모든 추천안에 고정
    pinnedGroups.forEach(group => { items[group] = pinned[group]; });
    Object.keys(items).forEach(k => { if (!items[k]) delete items[k]; });
    const tempBathroom = { ...bathroom, selectedItems: items };
    const entries = getSelectedEntries(tempBathroom);
    const totals = computeTotals(entries, tempBathroom);
    return { id: `reco-${idx + 1}`, title: `${idx + 1}안 ${label}`, items, entries, totals, pinnedGroups };
  });
}

function applyRecommendation(index, recommendation) {
  state.bathrooms[index].selectedItems = { ...recommendation.items };
  state.bathrooms[index].lastAppliedRecommendation = recommendation.title;
  saveState();
  renderAll();
}

// ── 욕실 1의 자재를 나머지 욕실(욕실 2·3)에 그대로 복사 ─────────────────────────
// 철거·샤워 구조·천장 교체 같은 '욕실별 조건'은 그대로 두고, 선택한 자재만 복사한다.
// 타일 수량은 욕실 크기(유형)별로 자동 계산되므로 복사해도 각 욕실에 맞게 산출된다.
let _sameFirstNotice = '';
let _sameFirstTimer = null;
function setSameFirstNotice(msg) {
  _sameFirstNotice = msg;
  clearTimeout(_sameFirstTimer);
  _sameFirstTimer = setTimeout(() => { _sameFirstNotice = ''; renderSameAsFirst(); }, 9000);
}
function bathroom1HasItems() {
  return state.bathrooms.length > 0 && Object.keys(state.bathrooms[0].selectedItems || {}).length > 0;
}
function bathroomHasItems(i) { return Object.keys(state.bathrooms[i].selectedItems || {}).length > 0; }
function bathroomIndexLabel(indexes) { return '욕실 ' + indexes.map(i => i + 1).join('·'); }

function copyBathroom1ToOthers(targetIndexes) {
  const src = state.bathrooms[0];
  const skipped = [];
  targetIndexes.forEach(i => {
    const dst = state.bathrooms[i];
    const items = JSON.parse(JSON.stringify(src.selectedItems || {}));
    const overrides = JSON.parse(JSON.stringify(src.manualOverrides || {}));
    if (!(dst.needCeilingReplace ?? true)) { delete items.ceiling; delete overrides.ceiling; }   // 천장 교체를 하지 않는 욕실은 천장재 제외
    if (src.showerType !== dst.showerType && items.partition) {                                   // 샤워 구조가 다르면 파티션/부스/욕조는 복사하지 않음
      skipped.push(dst.name);
      delete items.partition; delete overrides.partition;
    }
    dst.selectedItems = items;
    dst.manualOverrides = overrides;
    dst.lastAppliedRecommendation = src.lastAppliedRecommendation ? `${src.lastAppliedRecommendation} (욕실 1과 동일)` : null;
    dst.catalogWizardMode = false;   // 복사된 자재를 전체 목록에서 바로 고칠 수 있게
  });
  setSameFirstNotice(`✅ ${bathroomIndexLabel(targetIndexes)}에 욕실 1과 같은 자재를 적용했습니다. 욕실 탭에서 필요한 자재만 따로 바꿀 수 있어요.` +
    (skipped.length ? ` (${skipped.join(', ')}은 샤워 구조가 달라 파티션/부스는 복사하지 않았으니 직접 선택해 주세요)` : ''));
  saveState();
  renderAll();
}

// STEP 3·4 상단의 "욕실 1과 같은 자재 적용" 버튼 영역
function renderSameAsFirst() {
  ['sameFirstBar3', 'sameFirstBar4'].forEach(id => {
    const box = document.getElementById(id);
    if (!box) return;
    if (state.bathrooms.length < 2) { box.innerHTML = ''; box.style.display = 'none'; return; }
    box.style.display = '';
    const ready = bathroom1HasItems();
    const label = bathroomIndexLabel(state.bathrooms.map((_, i) => i).filter(i => i > 0));
    const hint = _sameFirstNotice
      ? `<span class="same-first-hint ok">${_sameFirstNotice}</span>`
      : `<span class="same-first-hint">${ready ? '욕실 1에서 선택한 자재를 그대로 복사합니다. 복사한 뒤 각 욕실에서 따로 수정할 수 있어요.' : '먼저 욕실 1의 자재를 선택하면 사용할 수 있어요.'}</span>`;
    box.innerHTML = `<button type="button" class="secondary same-first-btn" data-same-first ${ready ? '' : 'disabled'}>📋 ${label}에 욕실 1과 같은 자재 적용</button>${hint}`;
  });
}

function handleSameFirstClick() {
  if (!bathroom1HasItems()) return;
  const targets = state.bathrooms.map((_, i) => i).filter(i => i > 0);
  const withItems = targets.filter(bathroomHasItems);
  if (withItems.length && !confirm(`${bathroomIndexLabel(withItems)}에 이미 선택한 자재가 있습니다.\n욕실 1과 같은 자재로 바꿀까요?`)) return;
  copyBathroom1ToOthers(targets);
}

// '다음' 버튼에서 자재가 비어 있는 욕실이 있을 때: 욕실 1이 선택돼 있으면 복사 후 진행할지 묻는다.
// 반환: true = 복사하고 진행, false = 진행하지 않음, null = 이 기능으로 처리할 수 없음(기존 안내 사용)
function offerCopyFromFirst(missingIdx) {
  if (missingIdx.includes(0) || !bathroom1HasItems()) return null;
  const ok = confirm(`${bathroomIndexLabel(missingIdx)}은(는) 아직 자재가 선택되지 않았습니다.\n욕실 1과 같은 자재로 적용하고 다음 단계로 넘어갈까요?\n\n(철거·샤워 구조 같은 욕실별 조건은 그대로 유지됩니다)`);
  if (ok) copyBathroom1ToOthers(missingIdx);
  return ok;
}

function openReplaceModal(bathroomIndex, group) {
  const items = catalog.filter(i => i.group === group).sort((a, b) => a.price - b.price);
  if (!items.length) return;
  const category = items[0].category;
  const currentItem = state.bathrooms[bathroomIndex]?.selectedItems[group];

  el.replaceModal.dataset.bathroomIndex = bathroomIndex;
  el.replaceModal.dataset.group = group;
  el.replaceModalTitle.textContent = `자재 교체 — ${category}`;
  el.replaceModalSub.textContent = `${state.bathrooms[bathroomIndex]?.name} · ${items.length}개 제품`;

  const renderItems = (filter = '') => {
    const q = filter.toLowerCase();
    const filtered = q ? items.filter(i => `${i.brand} ${i.name} ${i.model} ${i.desc || ''}`.toLowerCase().includes(q)) : items;
    el.replaceModalBody.innerHTML = filtered.length ? filtered.map(item => {
      const isCurrent = currentItem && currentItem.id === item.id;
      return `<div class="replace-item${isCurrent ? ' is-current' : ''}">
        <div class="replace-item-left">
          <div class="thumb" style="width:40px;height:40px;font-size:.78rem">${thumbText(item)}</div>
          <div>
            <div class="replace-item-name"><strong>${item.brand}</strong> ${item.name}</div>
            <div class="replace-item-meta">${item.model}${item.desc ? ' · ' + item.desc : ''}</div>
            ${productShopLinks(item)}
          </div>
        </div>
        <div class="replace-item-right">
          <span class="replace-item-price">${formatWon(item.price)}<span class="muted" style="font-size:.78rem;font-weight:400">/${item.unit}</span></span>
          <button class="${isCurrent ? 'ghost' : 'primary'} replace-select-btn" data-item-id="${item.id}" ${isCurrent ? 'disabled' : ''}>${isCurrent ? '현재 선택' : '선택'}</button>
        </div>
      </div>`;
    }).join('') : '<p class="muted" style="padding:20px 0;text-align:center">검색 결과가 없습니다.</p>';

    el.replaceModalBody.querySelectorAll('.replace-select-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const newItem = items.find(i => i.id === btn.dataset.itemId);
        if (newItem) { addItemToBathroom(Number(el.replaceModal.dataset.bathroomIndex), newItem); closeReplaceModal(); }
      });
    });
  };

  el.replaceSearch.value = '';
  el.replaceSearch.oninput = e => renderItems(e.target.value);
  el.replaceModalClose.onclick = closeReplaceModal;
  el.replaceModalCloseBtn.onclick = closeReplaceModal;
  el.replaceModalBackdrop.onclick = closeReplaceModal;
  renderItems();
  el.replaceModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  el.replaceSearch.focus();
}

function closeReplaceModal() {
  el.replaceModal.classList.add('hidden');
  document.body.style.overflow = '';
}

const ALL_RECO_GROUPS = ['wallTile','floorTile','toilet','basin','basinFaucet','showerFaucet',
  'fan','ceiling','mirrorCabinet','partition','drain','accessory','material','bidet','bathroomFurniture'];

function renderRecoModalMain() {
  const tempBathroom = { ...recoEditBathroom, selectedItems: recoEditItems };
  const entries = getSelectedEntries(tempBathroom);
  const totals = computeTotals(entries, tempBathroom);
  const addableGroups = ALL_RECO_GROUPS.filter(g => !recoEditItems[g] && catalog.some(i => i.group === g));

  el.recoModalBody.innerHTML = `
    <div class="reco-edit-totals">
      <div class="reco-edit-total-row"><span>자재 합계</span><strong>${formatWon(totals.materialTotal)}</strong></div>
      <div class="reco-edit-total-row"><span>공사비</span><strong>${formatWon(totals.workTotal)}</strong></div>
      <div class="reco-edit-total-row"><span>예비비</span><strong>${formatWon(totals.reserve)}</strong></div>
      <div class="reco-edit-total-row grand"><span>총 견적</span><strong>${formatWon(totals.grand)}</strong></div>
    </div>
    <div class="reco-edit-items">
      ${entries.map(row => `
        <div class="reco-edit-item">
          <div class="reco-edit-item-left">
            <div class="reco-edit-cat">${row.category}</div>
            <div class="reco-edit-name">${row.brand} ${row.name}</div>
            <div class="reco-edit-meta">${row.model} · ${formatWon(row.price)}/${row.unit}</div>
            ${productShopLinks(row)}
          </div>
          <div class="reco-edit-item-right">
            <span class="reco-edit-amt">${formatWon(row.amount)}</span>
            <button class="secondary" style="padding:5px 10px;font-size:.78rem" data-edit-group="${row.group}">교체</button>
            <button class="reco-edit-del-btn" data-del-group="${row.group}">삭제</button>
          </div>
        </div>`).join('')}
    </div>
    ${addableGroups.length ? `
    <div class="reco-edit-add-section">
      <p class="eyebrow" style="margin:0 0 6px;font-size:.72rem">추가 가능 품목</p>
      <div class="reco-edit-add-list">
        ${addableGroups.map(g => {
          const cat = catalog.find(i => i.group === g)?.category || g;
          return `<button class="secondary" style="font-size:.82rem;padding:6px 12px" data-add-group="${g}">${cat} 추가 +</button>`;
        }).join('')}
      </div>
    </div>` : ''}`;

  el.recoModalBody.querySelectorAll('[data-del-group]').forEach(btn =>
    btn.addEventListener('click', () => { delete recoEditItems[btn.dataset.delGroup]; renderRecoModalMain(); }));
  el.recoModalBody.querySelectorAll('[data-edit-group],[data-add-group]').forEach(btn =>
    btn.addEventListener('click', () => renderRecoModalPicker(btn.dataset.editGroup || btn.dataset.addGroup)));
}

function renderRecoModalPicker(group) {
  const items = catalog.filter(i => i.group === group).sort((a, b) => a.price - b.price);
  const category = items[0]?.category || group;

  const renderList = (filter = '') => {
    const q = filter.toLowerCase();
    const filtered = q ? items.filter(i => `${i.brand} ${i.name} ${i.model}`.toLowerCase().includes(q)) : items;
    document.getElementById('recoPickerList').innerHTML = filtered.length ? filtered.map(item => {
      const isCur = recoEditItems[group]?.id === item.id;
      return `<div class="replace-item${isCur ? ' is-current' : ''}">
        <div class="replace-item-left">
          <div class="thumb" style="width:40px;height:40px;font-size:.75rem">${thumbText(item)}</div>
          <div>
            <div class="replace-item-name"><strong>${item.brand}</strong> ${item.name}</div>
            <div class="replace-item-meta">${item.model}${item.desc ? ' · ' + item.desc : ''}</div>
            ${productShopLinks(item)}
          </div>
        </div>
        <div class="replace-item-right">
          <span class="replace-item-price">${formatWon(item.price)}<span class="muted" style="font-size:.76rem;font-weight:400">/${item.unit}</span></span>
          <button class="${isCur ? 'ghost' : 'primary'}" style="font-size:.8rem;padding:6px 12px" data-pick-id="${item.id}" ${isCur ? 'disabled' : ''}>${isCur ? '현재 선택' : '선택'}</button>
        </div>
      </div>`;
    }).join('') : '<p class="muted" style="padding:16px 0;text-align:center">검색 결과가 없습니다.</p>';

    document.querySelectorAll('[data-pick-id]:not([disabled])').forEach(btn =>
      btn.addEventListener('click', () => {
        recoEditItems[group] = items.find(i => i.id === btn.dataset.pickId);
        renderRecoModalMain();
      }));
  };

  el.recoModalBody.innerHTML = `
    <div class="reco-picker-header">
      <button class="ghost" id="recoPickerBack" style="padding:6px 12px;font-size:.85rem">← 돌아가기</button>
      <span>${category} 선택</span>
    </div>
    <input class="reco-picker-search" id="recoPickerSearch" type="search" placeholder="${category} 검색..." />
    <div id="recoPickerList"></div>`;

  document.getElementById('recoPickerBack').addEventListener('click', renderRecoModalMain);
  document.getElementById('recoPickerSearch').addEventListener('input', e => renderList(e.target.value));
  renderList();
}

function openRecoModal(recoId, recos, bathroom) {
  const reco = recos.find(r => r.id === recoId);
  if (!reco) return;
  recoEditItems = Object.fromEntries(Object.entries(reco.items));
  recoEditBathroom = bathroom;
  el.recoModalTitle.textContent = reco.title;
  el.recoModalSub.textContent = `${bathroom.name} 기준 · 자재를 자유롭게 수정해 보세요`;
  el.recoModalClose.onclick = closeRecoModal;
  el.recoModalCloseBtn.onclick = closeRecoModal;
  el.recoModalBackdrop.onclick = closeRecoModal;
  el.recoModalApply.onclick = () => {
    const index = state.activeBathroomIndex;
    state.bathrooms[index].selectedItems = { ...recoEditItems };
    state.bathrooms[index].manualOverrides = {};  // 추천안 적용 시 수동 고정 초기화
    state.bathrooms[index].lastAppliedRecommendation = el.recoModalTitle.textContent;
    saveState(); renderAll(); closeRecoModal();
    alert(`${bathroom.name}에 적용됐습니다. STEP 3에서 추가 수정할 수 있습니다.`);
  };
  renderRecoModalMain();
  el.recoModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeRecoModal() {
  el.recoModal.classList.add('hidden');
  document.body.style.overflow = '';
}

let _model3dObjectUrl = null;

function openModel3dModal(item) {
  const modal = document.getElementById('model3dModal');
  if (!modal) return;
  document.getElementById('model3dTitle').textContent = `${item.brand} ${item.name}`;
  document.getElementById('model3dSub').textContent = `${item.category} · 형번 ${item.model} · 마우스로 회전 · 스크롤로 확대/축소`;
  const viewer = document.getElementById('model3dViewer');
  viewer.src = '';
  if (_model3dObjectUrl) { URL.revokeObjectURL(_model3dObjectUrl); _model3dObjectUrl = null; }
  const listedGlb = _manifestGlbPath(item);
  const glbPaths = listedGlb ? ['./' + _encPath(listedGlb)] : _staticGlbCandidates(item);
  const loadViewer = src => {
    viewer.src = src;
    viewer.addEventListener('load', () => {
      if (_model3dRenderMode !== 'normal') applyModel3dRenderMode(_model3dRenderMode);
    }, { once: true });
  };
  if (window.Model3DDB) {
    Model3DDB.get(item.id).then(blob => {
      if (blob) {
        _model3dObjectUrl = URL.createObjectURL(blob);
        loadViewer(_model3dObjectUrl);
      } else {
        loadViewer(glbPaths[0] || '');
      }
    }).catch(() => { loadViewer(glbPaths[0] || ''); });
  } else {
    loadViewer(glbPaths[0] || '');
  }
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

let _model3dRenderMode = 'normal';

function applyModel3dRenderMode(mode) {
  _model3dRenderMode = mode;
  const wireframe = mode === 'wireframe';
  const flat = mode === 'flat';

  function processScene(root) {
    if (!root?.traverse) return;
    root.traverse(node => {
      if (!node.isMesh) return;
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach(mat => {
        mat.wireframe = wireframe;
        if (mat.flatShading !== flat) { mat.flatShading = flat; mat.needsUpdate = true; }
      });
    });
  }

  const viewer = document.getElementById('model3dViewer');
  const model = viewer?.model;
  if (model) {
    // Try known Three.js scene access paths (varies by model-viewer version)
    if (model.scene) processScene(model.scene);
    else if (model.gltf?.scene) processScene(model.gltf.scene);
    else if (model.scenes) model.scenes.forEach(s => processScene(s));
  }

  // Update button active state
  document.querySelectorAll('.m3render').forEach(btn => {
    const active = btn.dataset.mode === mode;
    btn.style.background = active ? 'var(--brand)' : 'transparent';
    btn.style.color = active ? '#fff' : 'var(--muted)';
    btn.style.fontWeight = active ? '700' : '400';
  });
}

function setModel3dBg(color) {
  const viewer = document.getElementById('model3dViewer');
  const wrap = document.getElementById('model3dViewerWrap');
  if (viewer) { viewer.style.backgroundColor = color; viewer.style.setProperty('--poster-color', color); }
  if (wrap) wrap.style.background = color;
  document.querySelectorAll('.m3bg').forEach(btn => {
    const active = btn.dataset.color === color;
    btn.style.borderColor = active ? 'var(--brand)' : '#e5eaf3';
    btn.style.boxShadow = active ? '0 0 0 2px rgba(19,87,197,.25)' : 'none';
  });
  const picker = document.getElementById('model3dBgColorPicker');
  if (picker && !picker.matches(':focus')) picker.value = color;
}

function closeModel3dModal() {
  const modal = document.getElementById('model3dModal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
  const viewer = document.getElementById('model3dViewer');
  if (viewer) viewer.src = '';
  if (_model3dObjectUrl) { URL.revokeObjectURL(_model3dObjectUrl); _model3dObjectUrl = null; }
}

function openProductDetailModal(item) {
  const modal = document.getElementById('productDetailModal');
  const titleEl = document.getElementById('productDetailTitle');
  const subEl = document.getElementById('productDetailSub');
  const bodyEl = document.getElementById('productDetailBody');
  const addBtn = document.getElementById('productDetailAddBtn');

  titleEl.textContent = `${item.brand} ${item.name}`;
  subEl.textContent = `${item.category} · 형번 ${item.model}`;

  const bathroom = getBathroom();
  const hasGroup = !!bathroom.selectedItems[item.group];
  addBtn.textContent = hasGroup ? '교체하기' : '담기';
  addBtn.onclick = () => { addItemToBathroom(state.activeBathroomIndex, item); closeProductDetailModal(); };

  bodyEl.innerHTML = '';

  const imgSection = document.createElement('div');
  imgSection.className = 'product-detail-img';
  imgSection.textContent = thumbText(item);
  bodyEl.appendChild(imgSection);

  const tryDetailImg = (dataUrl) => {
    const img = document.createElement('img');
    img.alt = item.name;
    img.src = dataUrl;
    img.onload = () => { imgSection.textContent = ''; imgSection.appendChild(img); };
  };
  const tryDetailFileImg = () => {
    const img = document.createElement('img');
    img.alt = item.name;
    const listed = _manifestImgPath(item);
    img.src = listed ? './' + _encPath(listed) : `./images/products/${item.id}.jpg`;
    img.onload = () => { imgSection.textContent = ''; imgSection.appendChild(img); };
  };
  if (window.ImageDB) {
    ImageDB.get(item.id).then(dataUrl => { if (dataUrl) tryDetailImg(dataUrl); else tryDetailFileImg(); }).catch(tryDetailFileImg);
  } else {
    tryDetailFileImg();
  }

  const shopLinksHtml = productShopLinks(item);
  const rows = [
    ['브랜드', item.brand],
    ['형번', item.model],
    ['카테고리', item.category],
    ['단가', `<strong style="color:var(--brand);font-size:1.05rem">${formatWon(item.price)}</strong>`],
    ['단위', item.unit],
    item.coverage ? ['커버리지', `${item.coverage} ㎡/박스`] : null,
    item.desc ? ['설명', item.desc] : null,
    ['구매처', shopLinksHtml],
  ].filter(Boolean);

  const table = document.createElement('table');
  table.className = 'product-detail-table';
  table.innerHTML = rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('');
  bodyEl.appendChild(table);

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeProductDetailModal() {
  document.getElementById('productDetailModal').classList.add('hidden');
  document.body.style.overflow = '';
}

const CASE_REF_KEY = 'bathroom_case_ref';
function getCaseRef() { try { const s = localStorage.getItem(CASE_REF_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function clearCaseRef() { localStorage.removeItem(CASE_REF_KEY); renderRecommendations(); }

function renderRecommendations() {
  const bathroom = getBathroom();
  const recos = buildRecommendationsForBathroom(bathroom);

  // 사용자가 직접 선택한 고정 항목 (추천안 일괄 적용 항목은 제외)
  const pinnedGroups = new Set(
    Object.keys(bathroom.manualOverrides || {}).filter(k => (bathroom.manualOverrides || {})[k])
  );

  // 예산 계산
  const totalBudgetWon = Number(state.info.totalBudget) * 10000 || 0;
  const bathroomCount = state.bathrooms.length;
  const perBathroomBudget = totalBudgetWon > 0 ? totalBudgetWon / bathroomCount : 0;

  // 예산 내 최적안 (예산 이하 중 가장 비싼 것)
  let optimalIdx = -1;
  if (perBathroomBudget > 0) {
    for (let i = recos.length - 1; i >= 0; i--) {
      if (recos[i].totals.grand <= perBathroomBudget) { optimalIdx = i; break; }
    }
  }

  // 참고 사례 배너
  const ref = getCaseRef();
  let refHtml = '';
  let closestIdx = -1;
  if (ref) {
    let minDiff = Infinity;
    recos.forEach((reco, i) => {
      const diff = Math.abs(reco.totals.grand - ref.totalCost);
      if (diff < minDiff) { minDiff = diff; closestIdx = i; }
    });
    refHtml = `<div class="case-ref-banner">
      <div class="case-ref-thumb" style="background:${ref.thumbBg}">
        <span class="case-ref-concept">${ref.concept}</span>
      </div>
      <div class="case-ref-body">
        <span class="case-ref-label">참고 시공사례</span>
        <strong class="case-ref-title">${ref.title}</strong>
        <p class="case-ref-meta">${ref.region} ${ref.district} · ${ref.location} · ${ref.apt_size}평 · ${ref.date?.slice(0,7) || ''}</p>
        <p class="case-ref-cost">사례 실제 금액 <strong>${formatWon(ref.totalCost)}</strong>
          ${closestIdx >= 0 ? `— <span class="case-ref-match">${recos[closestIdx].title}과 가장 유사</span>` : ''}
        </p>
      </div>
      <button class="case-ref-dismiss" onclick="clearCaseRef()" title="참고 해제">✕</button>
    </div>`;
  }

  // 고정 항목 배너
  let pinnedBannerHtml = '';
  if (pinnedGroups.size > 0) {
    const pinnedChips = [...pinnedGroups].map(g => {
      const item = (bathroom.manualOverrides || {})[g];
      const label = GROUP_LABELS[g] || g;
      return `<span class="pinned-chip">${label}: ${item.brand} ${item.name}</span>`;
    }).join('');
    pinnedBannerHtml = `<div class="pinned-banner">
      <div class="pinned-banner-head">
        <span class="pinned-banner-icon">고정</span>
        <span>직접 선택한 <strong>${pinnedGroups.size}개 항목</strong>이 10개 추천안 모두에 동일하게 적용됩니다.</span>
      </div>
      <div class="pinned-chips">${pinnedChips}</div>
    </div>`;
  }

  // 예산 안내 배너
  let budgetBannerHtml = '';
  if (perBathroomBudget > 0) {
    const inBudgetCount = recos.filter(r => r.totals.grand <= perBathroomBudget).length;
    budgetBannerHtml = `<div class="budget-banner">
      <span class="budget-banner-icon">예산</span>
      <span>욕실 1개당 <strong>${formatWon(perBathroomBudget)}</strong> 이하 추천안
        ${inBudgetCount > 0
          ? `— <strong>${inBudgetCount}개</strong> 해당 · <strong>${recos[optimalIdx]?.title}</strong>이 예산 내 최적`
          : '— 예산 내 해당 없음 (예산 증액 검토 필요)'}
      </span>
    </div>`;
  }

  el.recommendations.innerHTML = refHtml + pinnedBannerHtml + budgetBannerHtml + recos.map((reco, idx) => {
    const wallItem   = reco.items.wallTile;
    const toiletItem = reco.items.toilet;
    const wallBrand   = wallItem   ? wallItem.brand   : '-';
    const toiletBrand = toiletItem ? toiletItem.brand : '-';
    const hasBidet     = !!reco.items.bidet;
    const hasFurniture = !!reco.items.bathroomFurniture;
    const isPinnedWall   = pinnedGroups.has('wallTile');
    const isPinnedToilet = pinnedGroups.has('toilet');
    const overBudget = perBathroomBudget > 0 && reco.totals.grand > perBathroomBudget;
    const isOptimal  = idx === optimalIdx;
    const budgetPct  = perBathroomBudget > 0
      ? Math.min(Math.round(reco.totals.grand / perBathroomBudget * 100), 200)
      : 0;

    let extraClass = '';
    if (isOptimal) extraClass = ' reco-card-optimal';
    else if (overBudget) extraClass = ' reco-card-over';
    if (idx === closestIdx) extraClass += ' reco-card-match';

    const badgesHtml = [
      isOptimal  ? '<div class="reco-badge optimal">예산 내 최적</div>' : '',
      overBudget ? '<div class="reco-badge over-budget">예산 초과</div>'  : '',
      idx === closestIdx ? '<div class="reco-match-badge">사례와 유사</div>' : '',
    ].join('');

    const budgetBarHtml = perBathroomBudget > 0 ? `
      <div class="reco-budget-bar-wrap" title="${overBudget ? '예산 초과 ' : ''}${budgetPct}%">
        <div class="reco-budget-bar ${overBudget ? 'over' : 'ok'}" style="width:${Math.min(budgetPct, 100)}%"></div>
        ${overBudget ? `<div class="reco-budget-bar over-marker" style="width:${Math.min(budgetPct - 100, 100)}%;left:100%"></div>` : ''}
      </div>` : '';

    const pinnedCountHtml = pinnedGroups.size > 0
      ? `<span class="reco-tag pinned-count">${pinnedGroups.size}개 고정</span>` : '';

    return `
    <article class="reco-card${extraClass}" data-reco-id="${reco.id}" style="cursor:pointer">
      ${badgesHtml}
      <div class="reco-summary">
        <div class="reco-summary-left">
          <div class="reco-num">${idx + 1}</div>
          <div>
            <h3>${reco.title}</h3>
            <div class="reco-tags">
              <span class="reco-tag${isPinnedWall ? ' pinned' : ''}">${isPinnedWall ? '▣ ' : ''}${wallBrand} 벽타일</span>
              <span class="reco-tag${isPinnedToilet ? ' pinned' : ''}">${isPinnedToilet ? '▣ ' : ''}${toiletBrand} 양변기</span>
              ${hasBidet ? '<span class="reco-tag yes">비데 포함</span>' : '<span class="reco-tag no">비데 없음</span>'}
              ${hasFurniture ? '<span class="reco-tag yes">욕실장 포함</span>' : '<span class="reco-tag no">욕실장 없음</span>'}
              ${pinnedCountHtml}
            </div>
          </div>
        </div>
        <div class="reco-summary-right">
          <span class="reco-price${overBudget ? ' price-over' : ''}">${formatWon(reco.totals.grand)}</span>
          ${perBathroomBudget > 0 ? `<span class="budget-pct ${overBudget ? 'over' : 'ok'}">${budgetPct}%</span>` : ''}
          <button class="reco-toggle">자세히 보기 ▾</button>
        </div>
      </div>
      ${budgetBarHtml}
    </article>`;
  }).join('');

  el.recommendations.querySelectorAll('.reco-card').forEach(card => {
    card.addEventListener('click', () => openRecoModal(card.dataset.recoId, recos, bathroom));
  });
}

function renderCartSummary() {
  const extra = computeExtraTileCost();
  const hasAnyItems = state.bathrooms.some(b => Object.keys(b.selectedItems).length > 0) || extra.total > 0;

  if (!hasAnyItems) {
    el.cartList.innerHTML = `
      <p class="muted" style="text-align:center;padding:14px 0;line-height:1.7">아직 선택된 자재가 없습니다.<br>STEP 3에서 자재를 선택하거나<br>STEP 4 추천안을 적용해 주세요.</p>
      <div class="cost-basis-box">
        <p class="eyebrow" style="margin:0 0 6px;font-size:.72rem">공사비 산정 기준</p>
        <ul class="cost-basis-list">
          <li>철거 공사 — STEP 2 철거 방식 선택 반영</li>
          <li>방수 공사 — 방수 강화 선택 시 추가</li>
          <li>배관 공사 — 배관 이동 필요 시 추가</li>
          <li>천장 / 전기 — 천장 교체 여부에 따라 산정</li>
          <li>기구 설치 / 폐기물·청소 — 기본 포함</li>
          <li>고급 마감 — 선택 시 자재+공사비의 10%</li>
          <li>예비비 — 합산액의 5% 자동 반영</li>
        </ul>
      </div>`;
    el.costSummary.innerHTML = '';
    return;
  }

  const bathroomHtml = state.bathrooms.map((bathroom, index) => {
    const totals = getBathroomTotals(index);
    const entriesHtml = totals.entries.length ? totals.entries.map(item => {
      const isAdj = QTY_ADJUSTABLE_GROUPS.has(item.group);
      const qtyHtml = isAdj
        ? `<span class="qty-ctrl"><button class="qty-btn" data-qty-dec="${item.group}" data-bath-index="${index}">−</button><span class="qty-num">${item.qty}</span><button class="qty-btn" data-qty-inc="${item.group}" data-bath-index="${index}">+</button></span>`
        : '';
      return `<div class="item-pill"><span>${item.category} · ${item.brand} ${item.name}${isAdj ? ` · ${item.unit}` : ''}</span><span class="pill-right">${qtyHtml}<span class="pill-amount">${formatWon(item.amount)}</span><button data-remove-group="${item.group}" data-bath-index="${index}">삭제</button></span></div>`;
    }).join('') : '<p class="muted">아직 담은 자재가 없습니다.</p>';
    return `<article class="cart-bathroom">
      <h3>${bathroom.name}</h3>
      <p>${bathroom.lastAppliedRecommendation ? `최근 추천안: ${bathroom.lastAppliedRecommendation}` : '직접 선택 중'}</p>
      ${entriesHtml}
      <p><strong>합계 ${formatWon(totals.grand)}</strong></p>
    </article>`;
  }).join('');

  const extraHtml = extra.items.length ? `<article class="cart-bathroom">
    <h3>추가 공간 타일</h3>
    ${extra.items.map(it => `<div class="item-pill"><span>${it.label} · ${EXTRA_TILE_GRADE_LABELS[it.grade]} · ${it.area}㎡</span><span class="pill-right"><span class="pill-amount">${formatWon(it.cost)}</span></span></div>`).join('')}
    <p><strong>합계 ${formatWon(extra.total)}</strong></p>
  </article>` : '';

  el.cartList.innerHTML = bathroomHtml + extraHtml;

  el.cartList.querySelectorAll('[data-remove-group]').forEach(btn => btn.addEventListener('click', () => removeItemFromBathroom(Number(btn.dataset.bathIndex), btn.dataset.removeGroup)));
  el.cartList.querySelectorAll('[data-qty-dec]').forEach(btn => btn.addEventListener('click', () => adjustItemQty(Number(btn.dataset.bathIndex), btn.dataset.qtyDec, -1)));
  el.cartList.querySelectorAll('[data-qty-inc]').forEach(btn => btn.addEventListener('click', () => adjustItemQty(Number(btn.dataset.bathIndex), btn.dataset.qtyInc, +1)));

  const project = getProjectTotals();
  el.costSummary.innerHTML = `
    <div class="line"><span>자재 합계</span><strong>${formatWon(project.materialTotal)}</strong></div>
    <div class="line"><span>공사비 합계</span><strong>${formatWon(project.workTotal)}</strong></div>
    ${project.extraTileTotal > 0 ? `<div class="line"><span>추가 공간 타일</span><strong>${formatWon(project.extraTileTotal)}</strong></div>` : ''}
    <div class="line"><span>고급 마감/옵션</span><strong>${formatWon(project.luxury)}</strong></div>
    <div class="line"><span>예비비</span><strong>${formatWon(project.reserve)}</strong></div>
    <div class="grand"><span>총 견적</span><strong>${formatWon(project.grand)}</strong></div>`;
}

function renderEstimateDocument() {
  const project = getProjectTotals();
  const infoBox = `
    <div class="estimate-header">
      <div>
        <p class="eyebrow">Modern Interior</p>
        <h2>모던인테리어 욕실 리모델링 견적서</h2>
        <p class="muted">본 견적서는 선택된 조건과 자재를 기준으로 자동 산출되었습니다.</p>
      </div>
      <div class="estimate-box">
        <div><strong>업체명</strong> 모던인테리어</div>
        <div><strong>견적일</strong> ${new Date().toLocaleDateString('ko-KR')}</div>
        <div><strong>프로젝트</strong> ${state.info.projectName || '-'}</div>
      </div>
    </div>
    <div class="estimate-grid">
      <div class="estimate-box"><strong>고객명</strong> ${state.info.customerName || '-'}<br><strong>연락처</strong> ${state.info.customerPhone || '-'}<br><strong>주소</strong> ${state.info.address || '-'}</div>
      <div class="estimate-box"><strong>평수</strong> ${state.info.aptSize}평대<br><strong>욕실 수</strong> ${state.info.bathroomCount}개${state.info.scheduleStart ? `<br><strong>공사 예정</strong> ${state.info.scheduleStart}${state.info.scheduleEnd ? ' ~ ' + state.info.scheduleEnd : ''}` : ''}${state.info.totalBudget ? `<br><strong>예산</strong> ${Number(state.info.totalBudget).toLocaleString('ko-KR')}만원` : ''}</div>
    </div>`;

  const sectionIndices = state.estimateViewIndex === -1 ? state.bathrooms.map((_, i) => i) : [state.estimateViewIndex];
  const sections = sectionIndices.map(index => {
    const totals = getBathroomTotals(index);
    const bathroom = totals.bathroom;
    const area = getAreaProfile(bathroom);
    const worksRows = totals.works.map(row => `<tr><td>공사</td><td>${row.key}</td><td>-</td><td>1 식</td><td>${formatWon(row.amount)}</td><td>${formatWon(row.amount)}</td><td>현장 조건 반영</td></tr>`).join('');
    const materialRows = totals.entries.map(row => `<tr class="est-replace-row" data-replace-bath="${index}" data-replace-group="${row.group}"><td>자재</td><td>${row.brand} ${row.name}</td><td>${row.model}</td><td>${row.qty} ${row.unit}</td><td>${formatWon(row.price)}</td><td>${formatWon(row.amount)}</td><td>${row.category} <button class="est-replace-btn">교체</button>${productShopLinks(row)}</td></tr>`).join('') || '<tr><td colspan="7">선택된 자재가 없습니다.</td></tr>';
    return `<section class="estimate-section">
      <h3>${bathroom.name}</h3>
      <div class="estimate-grid mini-grid">
        <div class="estimate-box">유형: ${bathroom.type === 'common' ? '공용 욕실' : bathroom.type === 'master' ? '안방 욕실' : '소형 욕실'}<br>철거: ${DEMOLITION_LABELS[bathroom.demolitionType] || bathroom.demolitionType}<br>샤워 구조: ${SHOWER_TYPE_LABELS[bathroom.showerType] || bathroom.showerType}</div>
        <div class="estimate-box">예상 바닥면적: ${area.floor.toFixed(1)}㎡<br>예상 벽면적: ${area.wall.toFixed(1)}㎡<br>최근 추천안: ${bathroom.lastAppliedRecommendation || '없음'}</div>
      </div>
      <table class="estimate-table">
        <thead><tr><th>구분</th><th>품목</th><th>형번</th><th>수량</th><th>단가</th><th>금액</th><th>비고</th></tr></thead>
        <tbody>${materialRows}${worksRows}</tbody>
      </table>
      <div class="estimate-total">
        <div class="line"><span>자재 합계</span><strong>${formatWon(totals.materialTotal)}</strong></div>
        <div class="line"><span>공사비 합계</span><strong>${formatWon(totals.workTotal)}</strong></div>
        <div class="line"><span>고급 마감/옵션</span><strong>${formatWon(totals.luxury)}</strong></div>
        <div class="line"><span>예비비</span><strong>${formatWon(totals.reserve)}</strong></div>
        <div class="line grand"><span>${bathroom.name} 총액</span><strong>${formatWon(totals.grand)}</strong></div>
      </div>
    </section>`;
  }).join('');

  let extraTileSection = '';
  if (project.extraTileItems && project.extraTileItems.length > 0) {
    const rows = project.extraTileItems.map(it =>
      `<tr><td>추가 공간</td><td>${it.label}</td><td>-</td><td>${it.area}㎡</td><td>${formatWon(getExtraTileRates()[it.grade])}/㎡</td><td>${formatWon(it.cost)}</td><td>${EXTRA_TILE_GRADE_LABELS[it.grade]} (자재+시공 포함)</td></tr>`
    ).join('');
    extraTileSection = `<section class="estimate-section">
      <h3>추가 공간 타일 공사</h3>
      <table class="estimate-table">
        <thead><tr><th>구분</th><th>품목</th><th>형번</th><th>면적</th><th>단가</th><th>금액</th><th>비고</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="estimate-total compact-total">
        <div class="line grand"><span>추가 공간 타일 합계</span><strong>${formatWon(project.extraTileTotal)}</strong></div>
      </div>
    </section>`;
  }

  const totalBox = `
    <div class="estimate-total master-total">
      <div class="line"><span>프로젝트 자재 합계</span><strong>${formatWon(project.materialTotal)}</strong></div>
      <div class="line"><span>프로젝트 공사비 합계</span><strong>${formatWon(project.workTotal)}</strong></div>
      ${project.extraTileTotal > 0 ? `<div class="line"><span>추가 공간 타일 공사</span><strong>${formatWon(project.extraTileTotal)}</strong></div>` : ''}
      <div class="line"><span>고급 마감/옵션</span><strong>${formatWon(project.luxury)}</strong></div>
      <div class="line"><span>예비비</span><strong>${formatWon(project.reserve)}</strong></div>
      <div class="line grand"><span>총 견적</span><strong>${formatWon(project.grand)}</strong></div>
    </div>
    <div class="note-block">
      1. 본 견적은 선택 자재 및 기본 시공 조건 기준 추정입니다.<br>
      2. 현장 실측, 철거 상태, 배관 변경, 누수 보수 여부에 따라 금액이 달라질 수 있습니다.<br>
      3. 저장된 견적 파일(JSON)을 다시 불러와 특정 품목만 교체해 재견적할 수 있습니다.
    </div>`;

  el.estimateDocument.innerHTML = infoBox + sections + extraTileSection + totalBox;

  el.estimateDocument.querySelectorAll('.est-replace-row').forEach(row => {
    row.addEventListener('click', e => {
      if (e.target.closest('.est-replace-btn') || e.currentTarget === row) {
        openReplaceModal(Number(row.dataset.replaceBath), row.dataset.replaceGroup);
      }
    });
  });
}

function renderAll() {
  renderBathroomOverview();
  renderTabs(el.configTabs, state.activeBathroomIndex, 'active');
  renderTabs(el.catalogTabs, state.activeBathroomIndex, 'active');
  renderTabs(el.recoTabs, state.activeBathroomIndex, 'active');
  renderTabs(el.estimateTabs, state.estimateViewIndex, 'estimate');
  renderSingleBathroomForm();
  renderActiveBathroomSummary();
  renderCatalogWizard();
  renderCatalog();
  renderRecommendations();
  renderSameAsFirst();
  renderCartSummary();
  renderEstimateDocument();
}

function makeExportPayload() {
  return {
    type: QUOTE_TYPE,
    exportedAt: new Date().toISOString(),
    data: state
  };
}

async function exportQuoteJson() {
  const payload = JSON.stringify(makeExportPayload(), null, 2);
  const filename = `${(state.info.projectName || 'modern-estimate').replace(/\s+/g, '_')}.json`;
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(payload);
      await writable.close();
      alert('견적 파일을 저장했습니다.');
      return;
    } catch (err) {
      if (err.name !== 'AbortError') console.error(err);
    }
  }
  const blob = new Blob([payload], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importQuoteJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (parsed.type !== QUOTE_TYPE || !parsed.data) throw new Error('invalid');
      const incoming = parsed.data;
      const merged = { ...defaultState(), ...incoming, info: { ...defaultState().info, ...(incoming.info || {}) } };
      const count = Number(merged.info.bathroomCount || 1);
      merged.bathrooms = hydrateBathrooms(count, incoming.bathrooms || []);
      Object.assign(state, merged);
      saveState();
      bindTopForm();
      renderAll();
      setStep(5);
      alert('견적 파일을 불러왔습니다. 이제 필요한 항목만 바꾸면 됩니다.');
    } catch {
      alert('불러오기에 실패했습니다. 이 앱에서 저장한 견적 파일인지 확인해 주세요.');
    }
  };
  reader.readAsText(file, 'utf-8');
}

// ── 견적 문의 ──────────────────────────────────────────────────────────────
const INQUIRY_KEY = 'bathroom_inquiries';

function loadInquiries() {
  try { return JSON.parse(localStorage.getItem(INQUIRY_KEY) || '[]'); } catch { return []; }
}

// 간편 의뢰: 견적 단계(구조 조건·자재 선택)를 모두 건너뛰고 STEP 1 기본 정보만으로 담당자에게 상담을 요청
let _inquiryQuick = false;
const QUICK_MEMO_PREFIX = '※ 견적 단계를 건너뛰고 기본 정보만 입력한 간편 의뢰입니다. (자재 선택·견적 금액 없음 — 연락해서 상담해 주세요)';

function openInquiryModal(opts) {
  const quick = !!(opts && opts.quick === true);
  _inquiryQuick = quick;
  const project = getProjectTotals();
  const info = state.info;
  const body = document.getElementById('inquiryModalBody');
  const hasCustomer = info.customerName || info.customerPhone;
  const titleEl = document.querySelector('#inquiryModal .reco-modal-header h2');
  const subEl = document.querySelector('#inquiryModal .reco-modal-header p');
  if (titleEl) titleEl.textContent = quick ? '담당자에게 바로 견적 의뢰' : '견적 문의 접수';
  if (subEl) subEl.textContent = quick ? '입력하신 기본 정보로 의뢰를 접수합니다' : '아래 내용으로 견적 의뢰를 접수합니다';
  document.getElementById('inquiryModalSubmit').textContent = quick ? '담당자에게 의뢰하기' : '문의 접수하기';
  const pending = '<span style="color:var(--muted)">미입력</span>';
  body.innerHTML = `
    ${quick ? '<p style="margin:0 0 12px;font-size:.87rem;line-height:1.7;background:#f3f7ff;border:1px solid #d6e4ff;border-radius:10px;padding:10px 14px">자재 선택 없이 <strong>기본 정보만</strong> 전달됩니다. 담당자가 연락드려 상담한 뒤 정확한 견적을 안내해 드립니다.</p>' : ''}
    <table class="product-detail-table" style="margin-bottom:16px">
      <tr><th>고객명</th><td>${info.customerName || pending}</td></tr>
      <tr><th>연락처</th><td>${info.customerPhone || pending}</td></tr>
      <tr><th>주소</th><td>${info.address || pending}</td></tr>
      <tr><th>욕실 수</th><td>${info.bathroomCount}개</td></tr>
      ${quick ? `${info.aptSize ? `<tr><th>아파트 평수</th><td>${info.aptSize}평</td></tr>` : ''}${info.scheduleStart ? `<tr><th>희망 공사</th><td>${info.scheduleStart}${info.scheduleEnd ? ' ~ ' + info.scheduleEnd : ''}</td></tr>` : ''}${info.totalBudget ? `<tr><th>총 예산</th><td>${info.totalBudget}만원</td></tr>` : ''}`
             : `<tr><th>총 견적액</th><td><strong style="color:var(--brand)">${formatWon(project.grand)}</strong></td></tr>`}
    </table>
    ${!hasCustomer ? '<p style="color:#b45309;font-size:.87rem;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;margin-bottom:12px">고객 정보(이름·연락처)가 없으면 담당자가 연락하기 어렵습니다. STEP 1에서 입력 후 접수해 주세요.</p>' : ''}
    <label style="display:block;font-size:.85rem;font-weight:700;margin-bottom:6px">요청사항 · 통화 가능 시간 (선택)</label>
    <textarea id="inquiryMemo" rows="3" maxlength="500" placeholder="예) 평일 저녁 7시 이후 통화 가능, 현장 방문은 주말 선호" style="width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:.9rem;margin-bottom:12px"></textarea>
    <label style="display:flex;gap:8px;align-items:flex-start;font-size:.82rem;line-height:1.6;margin-bottom:10px;cursor:pointer">
      <input type="checkbox" id="inquiryConsent" style="margin-top:4px">
      <span><strong>[필수] 개인정보 수집·이용 동의</strong><br>항목: 이름, 연락처, 주소, 견적 내용 / 목적: 욕실 시공 상담 및 견적 연락 / 보유기간: 상담 종료 후 1년(요청 시 즉시 삭제)</span>
    </label>
    <p id="inquiryError" style="display:none;color:#b91c1c;font-size:.85rem;line-height:1.6;margin:0 0 8px"></p>
    <p style="font-size:.85rem;color:var(--muted);line-height:1.7">• 접수 내용은 담당자에게 바로 전달됩니다.<br>• 영업일 1~2일 내 연락드립니다.</p>`;
  document.getElementById('inquiryModal').classList.remove('hidden');
}

function closeInquiryModal() {
  document.getElementById('inquiryModal').classList.add('hidden');
}

function showInquiryError(msg) {
  const box = document.getElementById('inquiryError');
  if (!box) { alert(msg); return; }
  box.textContent = msg;
  box.style.display = 'block';
}

async function submitInquiry() {
  const info0 = state.info;
  const phoneDigits = String(info0.customerPhone || '').replace(/\D/g, '');
  if (!String(info0.customerName || '').trim() || phoneDigits.length < 9 || phoneDigits.length > 11) {
    showInquiryError('STEP 1에서 이름과 연락처(숫자 9~11자리)를 정확히 입력한 뒤 접수해 주세요.');
    return;
  }
  if (!document.getElementById('inquiryConsent')?.checked) {
    showInquiryError('개인정보 수집·이용에 동의해 주세요.');
    return;
  }
  let project, bathroomData;
  if (_inquiryQuick) {
    // 간편 의뢰: 구조 조건·자재·금액 없이 STEP 1 기본 정보만
    project = { materialTotal: 0, workTotal: 0, luxury: 0, reserve: 0, extraTileTotal: 0, extraTileItems: [], grand: 0 };
    bathroomData = [];
  } else {
  project = getProjectTotals();
  bathroomData = state.bathrooms.map((b, i) => {
    const t = getBathroomTotals(i);
    return {
      name: b.name, type: b.type,
      lastAppliedRecommendation: b.lastAppliedRecommendation || null,
      options: {
        demolitionType: b.demolitionType,
        showerType: b.showerType,
        needPlumbingMove: !!b.needPlumbingMove,
        needWaterproofReinforce: !!b.needWaterproofReinforce,
        needCeilingReplace: !!b.needCeilingReplace,
        needHeatingFan: !!b.needHeatingFan,
        needLuxuryFinish: !!b.needLuxuryFinish,
      },
      works: t.works,
      entries: t.entries.map(e => ({ brand: e.brand, name: e.name, model: e.model, qty: e.qty, unit: e.unit, price: e.price, amount: e.amount, category: e.category })),
      materialTotal: t.materialTotal, workTotal: t.workTotal, luxury: t.luxury, reserve: t.reserve, grand: t.grand
    };
  });
  }
  const inquiry = {
    id: 'inq-' + Date.now(),
    submittedAt: new Date().toISOString(),
    status: 'new',
    quick: _inquiryQuick,
    customer: { ...state.info },
    project: { materialTotal: project.materialTotal, workTotal: project.workTotal, luxury: project.luxury, reserve: project.reserve, extraTileTotal: project.extraTileTotal, extraTileItems: project.extraTileItems, grand: project.grand },
    bathrooms: bathroomData
  };
  const userMemo = (document.getElementById('inquiryMemo')?.value || '').trim();
  const memo = _inquiryQuick ? (QUICK_MEMO_PREFIX + (userMemo ? '\n' + userMemo : '')) : userMemo;
  inquiry.memo = memo;

  const submitBtn = document.getElementById('inquiryModalSubmit');
  submitBtn.disabled = true;
  submitBtn.textContent = '전송 중...';
  const result = await window.sendInquiryToAdmin(inquiry, memo);
  submitBtn.disabled = false;
  submitBtn.textContent = _inquiryQuick ? '담당자에게 의뢰하기' : '문의 접수하기';

  if (!result.ok) {
    const msg = result.error === 'not-configured'
      ? '전송 설정이 완료되지 않았습니다. 전화 또는 카카오톡으로 문의해 주세요.'
      : '전송에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요. 계속 안 되면 전화 또는 카카오톡으로 문의해 주세요.';
    showInquiryError(msg);
    return;
  }

  // 전송 성공 → 기록용 사본만 로컬에 보관
  inquiry.status = 'sent';
  const list = loadInquiries();
  list.unshift(inquiry);
  localStorage.setItem(INQUIRY_KEY, JSON.stringify(list));
  closeInquiryModal();
  const toast = document.getElementById('inquiryToast');
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 3500);
}

function registerEvents() {
  document.querySelectorAll('[data-next-step]').forEach(btn => btn.addEventListener('click', () => {
    const nextStep = Number(btn.dataset.nextStep);
    if (nextStep === 4 || nextStep === 5) {
      const missingIdx = state.bathrooms.map((_, i) => i).filter(i => !bathroomHasItems(i));
      if (missingIdx.length > 0) {
        const offered = offerCopyFromFirst(missingIdx);       // 욕실 1이 선택돼 있으면 같은 자재로 복사 제안
        if (offered === true) { setStep(nextStep); return; }
        if (offered === false) return;                          // 취소 → 이 단계에 머무름
        const names = missingIdx.map(i => state.bathrooms[i].name).join(', ');
        alert(nextStep === 4
          ? `아직 자재를 선택하지 않은 욕실이 있습니다: ${names}\n각 욕실 탭으로 이동하여 자재를 선택하거나 추천안을 적용해 주세요.`
          : `추천안이 적용되지 않은 욕실이 있습니다: ${names}\n각 욕실의 추천 카드를 클릭하여 안을 선택해 주세요.`);
        return;
      }
    }
    setStep(nextStep);
  }));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-same-first]');
    if (b && !b.disabled) handleSameFirstClick();
  });
  document.querySelectorAll('[data-prev-step]').forEach(btn => btn.addEventListener('click', () => setStep(Number(btn.dataset.prevStep))));
  document.querySelectorAll('[data-skip-step]').forEach(btn => btn.addEventListener('click', () => setStep(Number(btn.dataset.skipStep))));
  el.catalogSearch.addEventListener('input', renderCatalog);
  el.catalogCategoryFilter.addEventListener('change', () => {
    el.catalogBrandFilter.value = 'all';
    renderCatalog();
  });
  el.catalogBrandFilter.addEventListener('change', renderCatalog);
  // 비용 안내 팝업
  let _costNoticePending = null;
  function showCostNotice(onConfirm) {
    _costNoticePending = onConfirm;
    document.getElementById('costNoticeModal').classList.remove('hidden');
  }
  function closeCostNotice() {
    document.getElementById('costNoticeModal').classList.add('hidden');
    _costNoticePending = null;
  }
  document.getElementById('costNoticeClose').addEventListener('click', closeCostNotice);
  document.getElementById('costNoticeCancel').addEventListener('click', closeCostNotice);
  document.getElementById('costNoticeBackdrop').addEventListener('click', closeCostNotice);
  document.getElementById('costNoticeConfirm').addEventListener('click', () => {
    const fn = _costNoticePending;
    closeCostNotice();
    if (fn) fn();
  });

  el.printBtn.addEventListener('click', () => showCostNotice(() => window.print()));
  document.getElementById('inquiryBtn').addEventListener('click', () => showCostNotice(() => openInquiryModal()));
  // STEP 1: 견적 작성은 건너뛰고 담당자에게 바로 의뢰
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-quick-request]')) return;
    const name = String(state.info.customerName || '').trim();
    const digits = String(state.info.customerPhone || '').replace(/\D/g, '');
    if (!name) { alert('고객명을 입력해 주세요.'); document.getElementById('customerName')?.focus(); return; }
    if (digits.length < 9 || digits.length > 11) { alert('연락처를 숫자 9~11자리로 정확히 입력해 주세요.'); document.getElementById('customerPhone')?.focus(); return; }
    openInquiryModal({ quick: true });   // 비용 안내 팝업 없이 바로 접수 창
  });
  document.getElementById('inquiryModalClose').addEventListener('click', closeInquiryModal);
  document.getElementById('inquiryModalCancel').addEventListener('click', closeInquiryModal);
  document.getElementById('inquiryModalBackdrop').addEventListener('click', closeInquiryModal);
  document.getElementById('inquiryModalSubmit').addEventListener('click', submitInquiry);
  el.saveLocalBtn.addEventListener('click', () => showCostNotice(() => { saveState(); alert('현재 입력 내용을 이 브라우저에 저장했습니다.'); }));
  el.exportJsonBtn.addEventListener('click', () => showCostNotice(exportQuoteJson));
  el.importJsonBtn.addEventListener('click', () => el.importJsonInput.click());
  el.importJsonInput.addEventListener('change', e => { if (e.target.files[0]) importQuoteJson(e.target.files[0]); e.target.value = ''; });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('입력한 내용을 모두 초기화할까요?')) return;
    Object.assign(state, defaultState());
    saveState();
    bindTopForm();
    renderAll();
    setStep(1);
  });
}

function registerPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => registration.update())
      .catch(console.error);
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    el.installBtn.classList.remove('hidden');
  });
  el.installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    el.installBtn.classList.add('hidden');
  });
}

bindTopForm();
populateCategoryFilter();
registerEvents();
registerPWA();
renderAll();
if (localStorage.getItem('bathroom_force_step1')) {
  localStorage.removeItem('bathroom_force_step1');
  state.step = 1;
}
setStep(state.step || 1);

document.getElementById('productDetailClose').onclick = closeProductDetailModal;
document.getElementById('productDetailCloseBtn').onclick = closeProductDetailModal;
document.getElementById('productDetailModalBackdrop').onclick = closeProductDetailModal;

document.getElementById('model3dClose')?.addEventListener('click', closeModel3dModal);
document.getElementById('model3dCloseBtn')?.addEventListener('click', closeModel3dModal);
document.getElementById('model3dModalBackdrop')?.addEventListener('click', closeModel3dModal);
document.getElementById('model3dBgSwatches')?.addEventListener('click', e => {
  const btn = e.target.closest('.m3bg');
  if (btn) setModel3dBg(btn.dataset.color);
});
document.getElementById('model3dBgColorPicker')?.addEventListener('input', e => setModel3dBg(e.target.value));
document.getElementById('model3dModal')?.addEventListener('click', e => {
  const btn = e.target.closest('.m3render');
  if (btn) applyModel3dRenderMode(btn.dataset.mode);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeRecoModal(); closeReplaceModal(); closeProductDetailModal(); closeModel3dModal(); }
});

if (window.Model3DDB) {
  Model3DDB.getAllKeys().then(keys => {
    model3dIds = new Set(keys);
    // 배포 사이트: 파일 목록(product-images-data.js)으로 3D 모델이 있는 제품을 판별한다.
    // (예전에는 페이지를 열 때마다 제품 수백 개 × 경로 여러 개로 HEAD 요청을 보내서 GitHub Pages 요청 제한에 걸렸음)
    if (window._PRODUCT_GLBS) {
      catalog.forEach(p => { if (!model3dIds.has(p.id) && _manifestGlbPath(p)) model3dIds.add(p.id); });
    }
    renderCatalog();
  }).catch(() => {});
}
