# 松山社大公告監控 → Email 通知

## 專案概述

定期爬取 [臺北市松山社區大學](https://www.sscctpe.org.tw/) 的最新公告，若有新公告則透過 Email 發送通知。

---

## 功能需求

### 1. 爬取松山社大公告
- **監控網址**：`https://www.sscctpe.org.tw/`（首頁的「最新公告」區塊）
- **抓取內容**：公告日期、標題、分類（課程資訊 / 社區活動 / 報名資訊等）
- **判斷方式**：比對上次記錄的公告列表，偵測新增項目

### 2. Email 通知
- **發送方式**：透過 [Resend](https://resend.com) API（免費方案：3000 封/月）
- **發送目標**：寄到指定信箱（如 mimisturtle@gmail.com）
- **通知格式**：HTML 排版，包含公告標題 + 日期 + 分類
- **郵件範例**：
  - **主旨**：📢 松山社大新公告（3 則）
  - **內文**：
    ```html
    <h2>松山社大新公告！</h2>
    <ul>
      <li><b>跟著河流去旅行 - 尋找消失的產業與城市記憶</b><br>📅 11-14 | 課程資訊</li>
      <li><b>11月21日公益電影欣賞活動</b><br>📅 11-05 | 課程資訊</li>
      <li><b>因應颱風來襲，明日停止上班上課</b><br>📅 10-23 | 課程資訊</li>
    </ul>
    <p><a href="https://www.sscctpe.org.tw/">查看完整公告 →</a></p>
    ```

### 3. 觸發方式（兩種都支援）

| 模式 | 說明 |
|------|------|
| **手動執行** | 跑指令 `node check.js` 立即檢查一次 |
| **排程執行** | 預設每天上午 9:00 自動檢查（Windows 用工作排程器） |

---

## 技術規格

- **語言**：Node.js (JavaScript)
- **套件**：
  - `cheerio` — HTML 解析（爬公告頁）
  - `axios` — HTTP 請求（Resend API + 爬網頁）
  - `dotenv` — 載入 .env 設定
  - `node-cron` — 排程定時執行（可選）
- **儲存方式**：本地 JSON 檔案記錄上次檢查到的公告 ID/日期，避免重複通知

---

## 使用流程

### 第一步：註冊 Resend & 取得 API Key

1. 開啟 [resend.com](https://resend.com)，用 Gmail 或 GitHub 帳號免費註冊（不需要信用卡）
2. 進入 Dashboard → **API Keys** → 點擊 **Create API Key**
3. 輸入名稱（如 `社大公告`），權限選 **Sending access**
4. 複製產生的 API Key（格式：`re_xxxxxxxxxxxxx`）
   - ⚠️ **這個 Key 只會顯示一次，請立刻複製儲存！**

### 第二步：設定專案環境

```bash
cd C:\Users\artsa\OneDrive\圖片\Desktop\Feis\t5
npm init -y
npm install cheerio axios dotenv node-cron
```

### 第三步：建立 `.env` 檔案

在專案根目錄建立 `.env`，填入你的憑證：

```env
RESEND_API_KEY=re_your_api_key_here    ← 剛剛複製的 API Key
NOTIFY_TO=mimisturtle@gmail.com        ← 你要收通知的信箱
MONITOR_URL=https://www.sscctpe.org.tw/
CHECK_INTERVAL_HOURS=6
```

### 第四步：執行程式

```bash
# 手動檢查一次
node check.js

# 或啟動自動排程模式（依 .env 的 CHECK_INTERVAL_HOURS 間隔檢查）
node scheduler.js
```

### 第五步（選用）：設定 Windows 工作排程器

讓程式每天定時自動執行，不用一直開著：

```powershell
# 開啟工作排程器
schtasks /create /tn "松山社大公告檢查" /tr "node C:\Users\artsa\OneDrive\圖片\Desktop\Feis\t5\check.js" /sc daily /st 09:00
```

停用：`schtasks /delete /tn "松山社大公告檢查" /f`

---

## 專案結構

```
t5/
├── AGENTS.md          ← 你正在看的這個檔案
├── .env               ← 你的憑證（不納入 git）
├── .env.example       ← 範例檔，供參考
├── .gitignore         ← 忽略 .env 和資料
├── package.json
├── check.js           ← 手動檢查 + 發送通知的主程式
├── scheduler.js       ← 排程模式（可選）
├── data/
│   └── last_check.json ← 記錄上次檢查狀態
└── README.md          ← 使用說明文件
```

---

## 注意事項

- **Rate Limiting**：避免太頻繁爬取，建議間隔至少 1~6 小時
- **網站改版**：如果松山社大網頁結構改變，可能需要調整 cheerio selector
- **Email 安全**：`.env` 已加入 `.gitignore`，不要上傳到公開 repo
- **Resend API Key**：跟密碼一樣重要，不要外洩。免費方案每天上限 100 封、每月 3000 封，對這個用途完全夠用
