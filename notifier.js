const axios = require('axios');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

/**
 * 產生 HTML 郵件內文
 */
function buildEmailHTML(newAnnouncements) {
  const items = newAnnouncements.map(a => {
    const cat = a.category ? ` | ${a.category}` : '';
    return `<li><b>${escapeHtml(a.title)}</b><br>📅 ${a.date}${cat}</li>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px;">📢 松山社大新公告！</h2>
  <ul style="line-height: 1.8;">
    ${items}
  </ul>
  <p><a href="https://www.sscctpe.org.tw/" style="color: #1a73e8;">查看完整公告 →</a></p>
  <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
    檢查時間：${new Date().toLocaleString('zh-TW')}<br>
    此為自動通知，由松山社大公告監控系統發送。
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 透過 Resend API 發送 Email
 */
async function sendEmail(newAnnouncements) {
  if (!RESEND_API_KEY || RESEND_API_KEY === '') {
    console.error('❌ 請在 .env 中設定 RESEND_API_KEY');
    throw new Error('Missing RESEND_API_KEY');
  }

  const to = process.env.NOTIFY_TO || '';

  const payload = {
    from: '松山社大公告 <onboarding@resend.dev>',
    to: [to],
    subject: `📢 松山社大新公告（${newAnnouncements.length} 則）`,
    html: buildEmailHTML(newAnnouncements)
  };

  try {
    const response = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Email 已發送 → ${to} (ID: ${response.data.id})`);
    return response.data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    console.error('❌ Email 發送失敗：', msg);
    throw err;
  }
}

module.exports = { sendEmail };
