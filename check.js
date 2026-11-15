const { fetchAnnouncements } = require('./scraper');
const { sendEmail } = require('./notifier');
const { loadState, saveState } = require('./state');

/**
 * 比對新公告：只回傳上次沒出現過的項目
 */
function findNewAnnouncements(current, state) {
  const knownTitles = new Set(state.announcements.map(a => a.title));
  return current.filter(a => !knownTitles.has(a.title));
}

/**
 * 主要檢查邏輯
 */
async function check() {
  console.log('\n🔍 開始檢查松山社大公告...');
  console.log(`📅 ${new Date().toLocaleString('zh-TW')}\n`);

  // 1. 爬取最新公告
  const announcements = await fetchAnnouncements();

  if (announcements.length === 0) {
    console.log('⚠️ 沒有抓到任何公告，可能是網站結構有變或網路問題');
    return;
  }

  // 2. 讀取上次狀態
  const state = loadState();
  console.log(`📋 上次記錄 ${state.announcements.length} 則\n`);

  // 3. 找出新公告
  const newAnnouncements = findNewAnnouncements(announcements, state);

  if (newAnnouncements.length === 0) {
    console.log('✅ 沒有新公告');
  } else {
    console.log(`📢 發現 ${newAnnouncements.length} 則新公告：`);
    newAnnouncements.forEach(a => {
      console.log(`   • ${a.date} | ${a.title}`);
    });

    // 4. 發送 Email
    try {
      await sendEmail(newAnnouncements);
      console.log('');
    } catch (err) {
      console.error('❌ Email 發送失敗：', err.message);
    }
  }

  // 5. 更新狀態（把最新列表存起來）
  saveState({
    announcements: announcements.map(a => ({ title: a.title, date: a.date })),
    lastCheck: new Date().toISOString()
  });

  console.log(`\n💾 狀態已儲存`);
}

module.exports = { check };
