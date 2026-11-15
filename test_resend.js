require('dotenv').config();

const axios = require('axios');

async function test() {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_TO;

  console.log('🔑 API Key:', key ? key.substring(0, 12) + '...' : 'MISSING');
  console.log('📧 To:', to);

  const payload = {
    from: '松山社大公告 <onboarding@resend.dev>',
    to: [to],
    subject: '🧪 測試 - 松山社大新公告',
    html: '<h2>測試成功！</h2><p>如果你看到這封信，代表 Resend API 設定正確。</p>'
  };

  try {
    const res = await axios.post('https://api.resend.com/emails', payload, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('\n✅ 發信成功！');
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('\n❌ 發信失敗：');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
}

test();
