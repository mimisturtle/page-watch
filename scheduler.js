const { check } = require('./check');
const cron = require('node-cron');

require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const INTERVAL_HOURS = parseInt(process.env.CHECK_INTERVAL_HOURS) || 6;

console.log(`🕐 排程模式啟動，每 ${INTERVAL_HOURS} 小時檢查一次`);
console.log(`   下次執行：${new Date(Date.now() + INTERVAL_HOURS * 3600000).toLocaleString('zh-TW')}\n`);

// 立即執行一次
check();

// 設定排程
cron.schedule(`0 */${INTERVAL_HOURS} * * *`, () => {
  console.log(`\n⏰ 定時檢查觸發 (${new Date().toLocaleString('zh-TW')})`);
  check();
});

console.log(`✅ 排程已設定（cron: 0 */${INTERVAL_HOURS} * * *）`);
console.log('   按 Ctrl+C 停止\n');

// 處理關閉訊號
process.on('SIGINT', () => {
  console.log('\n👋 排程已停止');
  process.exit(0);
});
