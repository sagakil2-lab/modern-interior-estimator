/**
 * 욕실 견적 문의 수신기 (Google Apps Script)
 * 고객이 보낸 견적을 ① 구글 시트에 한 줄로 쌓고 ② 관리자 이메일(+선택: 텔레그램)로 알립니다.
 *
 * 설정: 아래 3개만 바꾸세요. 시트는 이 스크립트가 연결된(컨테이너) 스프레드시트를 씁니다.
 */
const ADMIN_EMAIL = 'your-email@example.com';   // 알림 받을 이메일
const TELEGRAM_BOT_TOKEN = '';                  // (선택) 텔레그램 봇 토큰 — 즉시 폰 알림용
const TELEGRAM_CHAT_ID = '';                    // (선택) 텔레그램 채팅 ID

const SHEET_NAME = '문의';
const HEADERS = ['접수시각', '상태', '고객명', '연락처', '주소', '평형', '욕실수', '희망착공', '예산', '총견적(원)', '욕실별 요약', '요청사항', '접수ID', '상세(JSON)'];

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

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = getSheet_();
      // 같은 접수ID가 이미 있으면(재전송) 중복 저장·중복 알림 없이 성공 처리
      const idCol = HEADERS.indexOf('접수ID') + 1;
      const last = sheet.getLastRow();
      if (last > 1) {
        const ids = sheet.getRange(2, idCol, last - 1, 1).getValues().flat();
        if (ids.indexOf(inq.id) !== -1) return json_({ ok: true, duplicate: true });
      }

      const summary = (inq.bathrooms || []).map(b => {
        const o = b.options || {};
        const opts = [o.needPlumbingMove && '배관이설', o.needWaterproofReinforce && '방수보강', o.needCeilingReplace && '천장교체', o.needHeatingFan && '난방환풍기', o.needLuxuryFinish && '고급마감'].filter(Boolean).join('·');
        return `${b.name}(${b.type || '-'}) ${o.demolitionType || '-'}/${o.showerType || '-'}${opts ? ' +' + opts : ''} = ${won_(b.grand)}`;
      }).join('\n');

      const grand = (inq.project && inq.project.grand) || 0;
      sheet.appendRow([
        new Date(inq.submittedAt || Date.now()), '신규', c.customerName, c.customerPhone, c.address || '',
        c.aptSize || '', c.bathroomCount || '', c.scheduleStart || '', c.totalBudget || '',
        grand, summary, String(payload.memo || '').slice(0, 500), inq.id, JSON.stringify(inq)
      ]);
      notify_(c, grand, summary, payload.memo);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'server-error' });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function notify_(c, grand, summary, memo) {
  const text = [
    `[신규 욕실견적] ${c.customerName} · ${won_(grand)}`,
    `연락처: ${c.customerPhone}`,
    `주소: ${c.address || '-'}  (${c.aptSize || '-'}평, 욕실 ${c.bathroomCount || '-'}개)`,
    `희망착공: ${c.scheduleStart || '-'}  예산: ${c.totalBudget || '-'}`,
    '', summary,
    memo ? '\n요청사항: ' + memo : ''
  ].join('\n');
  try { MailApp.sendEmail(ADMIN_EMAIL, `[신규 욕실견적] ${c.customerName} ${won_(grand)}`, text); } catch (e) {}
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      UrlFetchApp.fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text })
      });
    } catch (e) {}
  }
}

function won_(n) { return Number(n || 0).toLocaleString('ko-KR') + '원'; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
