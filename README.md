# 松山社大公告監控 → Email 通知

定期爬取 [松山社大](https://www.sscctpe.org.tw/) 最新公告，有新公告時自動寄 Email 通知。

## 快速開始

### 1. 註冊 Resend

1. 到 [resend.com](https://resend.com) 免費註冊（不需要信用卡）
2. Dashboard → API Keys → Create API Key
3. 複製 API Key（格式：`re_xxxxxxxxx`）

### 2. 建立 `.env` 檔案

```bash
copy .env.example .env
```

編輯 `.env`，填入你的 API Key：

```env
RESEND_API_KEY=re_your_api_key_here
NOTIFY_TO=mimisturtle@gmail.com
MONITOR_URL=https://www.sscctpe.org.tw/
CHECK_INTERVAL_HOURS=6
```

### 3. 執行

```bash
# 手動檢查一次
node check.js

# 自動排程模式
node scheduler.js
```

## 專案結構

```
├── AGENTS.md        ← 需求規格
├── README.md        ← 本檔案
├── .env.example     ← 設定範例
├── package.json
├── check.js         ← 手動檢查（爬取 + 比對 + 發信）
├── scheduler.js     ← 排程模式
├── scraper.js       ← 爬蟲模組
├── notifier.js      ← Email 發信模組（Resend API）
├── state.js         ← 狀態管理
├── data/            ← 本地資料目錄
│   └── last_check.json
└── .env             ← 你的設定（不納入 git）
```

## Resend 免費方案

- **價格**：免費
- **額度**：3000 封/月，100 封/天
- **不需要驗證域名**即可測試發信（使用 `onboarding@resend.dev` 作為發件人）
- 超過额度會回傳錯誤，不會扣款

## Windows 排程器（選用）

每天上午 9 點自動執行：

```powershell
schtasks /create /tn "松山社大公告檢查" /tr "node C:\Users\artsa\OneDrive\圖片\Desktop\Feis\t5\check.js" /sc daily /st 09:00
```

停用：
```powershell
schtasks /delete /tn "松山社大公告檢查" /f
```
