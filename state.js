const fs = require('fs');
const path = require('path');

// ── 載入 .env ──
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ── 路徑常數 ──
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'last_check.json');

// ── 確保 data 目錄存在 ──
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * 讀取上次檢查狀態
 */
function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { announcements: [], lastCheck: null };
  }
}

/**
 * 寫入上次檢查狀態
 */
function saveState(state) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

module.exports = { loadState, saveState };
