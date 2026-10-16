/**
 * 욕실 견적 문의 수신기 — 이메일 전용 (구글 시트 필요 없음)
 * 고객이 접수하면 견적 내용이 ADMIN_EMAIL 로 메일로 도착합니다.
 * (견적 전체 데이터는 .json 첨부파일로도 함께 옵니다)
 *
 * 설정: 아래 ADMIN_EMAIL 만 바꾸세요.
 */
const ADMIN_EMAIL = 'sagakil2@naver.com';   // 알림 받을 이메일
const TELEGRAM_BOT_TOKEN = '';                  // (선택) 텔레그램 봇 토큰 — 폰 즉시 알림용
const TELEGRAM_CHAT_ID = '';                    // (선택) 텔레그램 채팅 ID

const DEMOLITION = { partial: '부분 철거', full: '전체 철거', overlay: '덧방(철거 최소)' };

/** 주소를 브라우저로 열었을 때 '정상 배포됨'을 확인하기 위한 응답 */
function doGet() {
  return json_({ ok: true, service: 'bathroom-estimate-inquiry-mail' });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (payload.website) return json_({ ok: true });            // 스팸 봇: 조용히 무시

    const inq = payload.inquiry || {};
    const c = inq.customer || {};
    const phone = String(c.customerPhone || '').replace(/\D/g, '');
    if (!String(c.customerName || '').trim() || phone.length < 9 || phone.length > 11) {
      return json_({ ok: false, error: 'invalid-contact' });
    }
    if (!inq.id) return json_({ ok: false, error: 'invalid-id' });

    // 같은 접수가 다시 들어오면(재전송·더블클릭) 메일을 또 보내지 않음
    const cache = CacheService.getScriptCache();
    if (cache.get('inq:' + inq.id)) return json_({ ok: true, duplicate: true });

    const grand = (inq.project && inq.project.grand) || 0;
    const subject = `[신규 욕실견적] ${c.customerName} · ${won_(grand)}`;
    const body = buildBody_(inq, c, grand, payload.memo);

    // 메일 발송 실패는 고객에게 '실패'로 알려야 하므로 숨기지 않음
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: subject,
        body: body,
        name: '욕실견적 접수',
        attachments: [Utilities.newBlob(JSON.stringify(inq, null, 2), 'application/json', inq.id + '.json')]
      });
    } catch (mailErr) {
      return json_({ ok: false, error: 'mail-failed' });
    }
    cache.put('inq:' + inq.id, '1', 21600);                    // 6시간 동안 중복 방지

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'post', contentType: 'application/json', muteHttpExceptions: true,
          payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: subject + '\n연락처: ' + c.customerPhone })
        });
      } catch (tgErr) {}
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server-error' });
  }
}

function buildBody_(inq, c, grand, memo) {
  const when = Utilities.formatDate(new Date(inq.submittedAt || Date.now()), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
  const L = [];
  L.push('■ 고객 정보');
  L.push(`이름: ${c.customerName}`);
  L.push(`연락처: ${c.customerPhone}`);
  L.push(`현장/주소: ${[c.projectName, c.address].filter(Boolean).join(' / ') || '-'}`);
  L.push(`평수: ${c.aptSize || '-'}  욕실 수: ${c.bathroomCount || '-'}개`);
  L.push(`공사 희망: ${c.scheduleStart || '-'} ~ ${c.scheduleEnd || '-'}`);
  L.push(`총 예산: ${c.totalBudget ? c.totalBudget + '만원' : '-'}`);
  if (memo) L.push(`\n요청사항: ${memo}`);
  L.push(`\n■ 예상 견적 합계: ${won_(grand)}`);

  (inq.bathrooms || []).forEach(b => {
    const o = b.options || {};
    const opts = [o.needPlumbingMove && '배관 이설', o.needWaterproofReinforce && '방수 보강', o.needCeilingReplace && '천장 교체', o.needHeatingFan && '난방 환풍기', o.needLuxuryFinish && '고급 마감'].filter(Boolean).join(', ');
    L.push(`\n━━ ${b.name} (${b.type || '-'}) — ${won_(b.grand)} ━━`);
    L.push(`철거: ${DEMOLITION[o.demolitionType] || o.demolitionType || '-'} / 샤워: ${o.showerType || '-'}${opts ? ' / 옵션: ' + opts : ''}`);
    if (b.lastAppliedRecommendation) L.push(`적용한 추천안: ${JSON.stringify(b.lastAppliedRecommendation)}`);
    (b.works || []).forEach(w => L.push(`  · ${w.key}: ${won_(w.amount)}`));
    (b.entries || []).forEach(en => L.push(`  - [${en.category || ''}] ${[en.brand, en.name, en.model].filter(Boolean).join(' ')} ×${en.qty}${en.unit || ''} = ${won_(en.amount)}`));
    L.push(`  자재 ${won_(b.materialTotal)} / 공사 ${won_(b.workTotal)}`);
  });
  L.push(`\n접수 시각: ${when}  (접수ID: ${inq.id})`);
  L.push('※ 사이트 견적은 참고용 추정 금액입니다. 현장 확인 후 확정하세요.');
  return L.join('\n');
}

function won_(n) { return Number(n || 0).toLocaleString('ko-KR') + '원'; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
