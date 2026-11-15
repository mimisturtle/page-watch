const { fetchAnnouncements } = require('./scraper');
const { loadState, saveState } = require('./state');

/**
 * 比對新公告
 */
function findNewAnnouncements(current, state) {
  const knownTitles = new Set(state.announcements.map(a => a.title));
  return current.filter(a => !knownTitles.has(a.title));
}

/**
 * 產生 HTML 郵件內文（不真正發送）
 */
function buildEmailHTML(newAnnouncements) {
  const items = newAnnouncements.map(a => {
    const cat = a.category ? ` | ${a.category}` : '';
    return `<li><b>${escapeHtml(a.title)}</b><br>📅 ${a.date}${cat}</li>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h2 style="color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px;">📢 松山社大新公告！</h2>
  <ul style="line-height: 1.8;">
    ${items}
  </ul>
  <p><a href="https://www.sscctpe.org.tw/">查看完整公告 →</a></p>
  <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 12px; color: #999;">
    檢查時間：${new Date().toLocaleString('zh-TW')}
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 測試模式：爬取 + 產生郵件 HTML，印在終端機上
 */
async function test() {
  console.log('\n🔍 開始檢查松山社大公告...（測試模式）');
  console.log(`📅 ${new Date().toLocaleString('zh-TW')}\n`);

  // 1. 爬取
  const announcements = await fetchAnnouncements();
  if (announcements.length === 0) {
    console.log('⚠️ 沒有抓到公告');
    return;
  }

  // 2. 讀取狀態
  const state = loadState();
  console.log(`📋 上次記錄 ${state.announcements.length} 則\n`);

  // 3. 找出新公告
  const newAnnouncements = findNewAnnouncements(announcements, state);

  if (newAnnouncements.length === 0) {
    console.log('✅ 沒有新公告');
    console.log('\n--- 模擬郵件內容（HTML） ---\n');
    console.log(buildEmailHTML([]));
    console.log('--------------------------\n');
  } else {
    console.log(`📢 發現 ${newAnnouncements.length} 則新公告：`);
    newAnnouncements.forEach(a => {
      console.log(`   • ${a.date} | ${a.title}`);
    });

    console.log('\n--- 模擬郵件內容（HTML） ---\n');
    console.log(buildEmailHTML(newAnnouncements));
    console.log('--------------------------\n');
  }

  // 4. 儲存狀態
  saveState({
    announcements: announcements.map(a => ({ title: a.title, date: a.date })),
    lastCheck: new Date().toISOString()
  });
  console.log('💾 狀態已儲存');
}

test().catch(err => {
  console.error('❌ 錯誤：', err);
  process.exit(1);
});
