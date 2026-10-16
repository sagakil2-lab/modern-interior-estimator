// 견적 문의를 관리자(Google Apps Script 웹앱)로 전송하는 모듈
// ① Code.gs 를 배포한 뒤 나오는 웹앱 URL(.../exec)을 아래에 붙여 넣으세요.
window.INQUIRY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxF3jcSp7cjxrPQAkxqcaOAtNcolOleeWzuvq4QURzun2Dd6_ML8tsQgupcaxkWeg/exec';

// 반환: { ok: true } | { ok: false, error: '...' }
window.sendInquiryToAdmin = async function (inquiry, memo) {
  if (!window.INQUIRY_ENDPOINT) return { ok: false, error: 'not-configured' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    // text/plain 으로 보내야 CORS preflight 없이 Apps Script가 받을 수 있음
    const res = await fetch(window.INQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ inquiry, memo: memo || '', website: '' }), // website = 스팸 봇 함정 필드
      signal: ctrl.signal
    });
    const data = await res.json();
    return data && data.ok ? { ok: true } : { ok: false, error: (data && data.error) || 'server-error' };
  } catch (err) {
    return { ok: false, error: err && err.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
};
