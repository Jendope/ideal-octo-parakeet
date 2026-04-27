# FraudGuard HK 防詐衛士

**其他語言**: [English](README.md) | [简体中文](README.zh-hans.md)

---

## 📑 目錄

- [應用程式簡介](#️-應用程式簡介)
- [功能示範](#-功能示範)
- [主要功能](#-主要功能)
- [系統架構](#-系統架構)
- [技術規格](#-技術規格)
- [快速開始](#-快速開始)
- [Docker 部署](#-docker-部署)
- [環境變數](#-環境變數)
- [專案結構](#-專案結構)
- [API 文件](#-api-文件)
- [Android 應用程式](#-android-應用程式)
- [部署指南](#-部署指南)
- [開發指南](#-開發指南)
- [常見問題](#-常見問題)
- [參與貢獻](#-參與貢獻)
- [授權](#-授權)

---

## 🛡️ 應用程式簡介

FraudGuard HK 是一款專為香港長者設計的智能防詐騙助手，結合尖端人工智能技術，幫助識別和防範各類詐騙訊息，提供長者友善的使用者介面。

### 問題背景

香港針對長者的詐騙案件顯著增加，包括：
- 電話詐騙（冒充官員或家人）
- 投資詐騙（假股票、虛擬貨幣）
- 情感詐騙
- 釣魚訊息（假銀行通知、中獎訊息）

許多長者因以下原因難以識別詐騙：
- 缺乏技術知識
- 語言障礙
- 身體限制（視力、聽力衰退）
- 對權威人士的信任

### 解決方案

FraudGuard HK 針對這些挑戰提供：
- **語音優先介面** - 自然地使用粵語、普通話或英語對話
- **大型無障礙介面** - 大按鈕、清晰字體、高對比度
- **AI 驅動偵測** - 先進模型分析訊息內容和情境
- **家人警示系統** - 自動通知信任的聯絡人
- **多語言支援** - 完整支援粵語、普通話和英語

---

## 🎥 功能示範

### 介面模式

#### 長者模式（大按鈕介面）
- 超大麥克風按鈕用於語音輸入
- 大型圖片上傳按鈕用於截圖分析
- 簡單的風險等級指示器（安全 / 可疑 / 危險）
- 自動語音回覆朗讀分析結果

#### 聊天模式（標準介面）
- 文字輸入用於輸入或貼上訊息
- 聊天記錄與分析結果
- 常用任務的快速操作按鈕

---

## ✨ 主要功能

### 1. 智能詐騙偵測

| 輸入類型 | 說明 | 支援格式 |
|----------|------|----------|
| **語音輸入** | 自然地描述可疑訊息 | 粵語、普通話、英語 |
| **文字輸入** | 貼上或輸入可疑訊息內容 | 任何文字 |
| **圖片上傳** | 上傳可疑訊息截圖 | PNG、JPG、WebP |

### 2. AI 分析引擎

系統使用多階段分析流程：

1. **意圖分類** - 判斷查詢類型
2. **內容提取** - 提取關鍵資訊（電話號碼、連結、金額）
3. **詐騙模式比對** - 與已知詐騙模式比對
4. **RAG 增強** - 搜尋已驗證的詐騙案例資料庫
5. **風險評估** - 產生風險等級與解釋

### 3. 長者友善設計

| 功能 | 說明 |
|------|------|
| **大型按鈕** | 最小 48px 觸控目標，方便點擊 |
| **高對比度** | 清晰的視覺層次與無障礙色彩 |
| **語音回饋** | 自動 TTS 朗讀分析結果 |
| **簡單語言** | 以易懂的方式顯示結果 |
| **響應式設計** | 支援手機和平板電腦 |

### 4. 家人警示系統

當偵測到高風險詐騙時：
1. 自動發送警示給緊急聯絡人
2. 包含詐騙詳情和風險等級
3. 支援多種管道：
   - WhatsApp
   - WeChat
   - SMS
4. 多語言警示訊息

### 5. 緊急聯絡人管理

- 新增無限數量的緊急聯絡人
- 設定通知優先順序
- 緊急情況一鍵撥打
- 聯絡人跨裝置同步

### 6. 自主代理功能 (AutoGLM-Phone)

語音啟動的手機控制：

| 指令 | 操作 |
|------|------|
| "打開 WhatsApp" | 開啟 WhatsApp |
| "打開微信" | 開啟 WeChat |
| "打開電話" | 開啟電話 App（數字鍵盤） |
| "打開簡訊" | 開啟簡訊 App |
| "打開聯絡人" | 開啟聯絡人 App |
| "搵[名字]" | 搜尋聯絡人 |
| "打俾[名字]" | 撥打給聯絡人 |

---

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         客戶端層                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   網頁應用   │  │ Android 應用│  │   iOS 應用   │              │
│  │  (Next.js)  │  │  (Kotlin)   │  │  (未來開發)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API 層                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  /api/agent │  │ /api/contacts│ │/api/family- │              │
│  │   (聊天)    │  │  (聯絡人)   │  │  alert      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI 服務層                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   ASR API   │  │  Vision API │  │   LLM API   │              │
│  │  (語音轉    │  │ (圖像 OCR   │  │  (分析與    │              │
│  │   文字)     │  │  與理解)    │  │   生成)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   TTS API   │  │AutoGLM-Phone│  │  RAG 搜尋   │              │
│  │  (文字轉    │  │  (自主手機  │  │  (詐騙案例  │              │
│  │   語音)     │  │    控制)    │  │   資料庫)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         資料層                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   SQLite    │  │  Supabase   │                               │
│  │  (本地資料庫)│  │ (向量資料庫) │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 技術規格

### 前端技術

| 技術 | 用途 |
|------|------|
| Next.js 16 | React 框架（App Router） |
| TypeScript | 類型安全開發 |
| Tailwind CSS 4 | 實用優先樣式 |
| shadcn/ui | 元件庫 |
| Framer Motion | 動畫效果 |
| Zustand | 狀態管理 |

### 後端技術

| 技術 | 用途 |
|------|------|
| Next.js API Routes | 無伺服器 API 端點 |
| Prisma | 資料庫 ORM |
| SQLite | 本地資料庫 |
| Supabase | 向量資料庫（RAG） |

### AI 服務

| 服務 | 供應商 | 用途 |
|------|--------|------|
| Qwen Plus | DashScope（阿里雲） | LLM 對話 |
| Qwen VL OCR | DashScope | 圖像理解 |
| Qwen ASR | DashScope | 語音識別 |
| Qwen TTS | DashScope | 文字轉語音 |
| GLM-4 Flash | BigModel（智譜） | 替代 LLM |
| AutoGLM-Phone | BigModel | 手機自動化 |

---

## 🚀 快速開始

### 系統需求

- **Node.js 18+** 或 **Bun**
- **npm**、**yarn** 或 **bun** 套件管理器

### 安裝步驟

#### macOS / Linux (Bash)

```bash
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安裝依賴
bun install

# 設定環境變數
cp .env.example .env

# 編輯 .env 填入 API 金鑰
nano .env  # 或使用你喜歡的編輯器

# 初始化資料庫
bun run db:push

# 啟動開發伺服器
bun run dev
```

#### Windows Command Prompt (CMD)

```cmd
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安裝依賴
bun install

# 設定環境變數
copy .env.example .env

# 編輯 .env 填入 API 金鑰（使用記事本或你喜歡的編輯器）
notepad .env

# 初始化資料庫
bun run db:push

# 啟動開發伺服器
bun run dev
```

#### Windows PowerShell

```powershell
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安裝依賴
bun install

# 設定環境變數
Copy-Item .env.example .env

# 編輯 .env 填入 API 金鑰（使用記事本或你喜歡的編輯器）
notepad .env

# 初始化資料庫
bun run db:push

# 啟動開發伺服器
bun run dev
```

#### 使用 npm（任何平台）

```bash
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安裝依賴
npm install

# 設定環境變數
# macOS/Linux:
cp .env.example .env
# Windows CMD:
copy .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env

# 編輯 .env 填入 API 金鑰

# 初始化資料庫
npm run db:push

# 啟動開發伺服器
npm run dev
```

### 開啟應用程式

開啟瀏覽器前往：**http://localhost:3000**

---

## 🐳 Docker 部署

### 使用 Docker 快速開始

在正式環境執行 FraudGuard HK 的最簡單方式。

#### 系統需求
- 已安裝 Docker（[安裝 Docker](https://docs.docker.com/get-docker/)）
- Docker Compose（Docker Desktop 已內建）

#### 使用 Docker Compose 執行

**macOS / Linux (Bash):**
```bash
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 從範本建立 .env 檔案
cp .env.example .env

# 編輯 .env 填入 API 金鑰
nano .env

# 建置並執行
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

**Windows CMD:**
```cmd
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 從範本建立 .env 檔案
copy .env.example .env

# 編輯 .env 填入 API 金鑰
notepad .env

# 建置並執行
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

**Windows PowerShell:**
```powershell
# 下載專案
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 從範本建立 .env 檔案
Copy-Item .env.example .env

# 編輯 .env 填入 API 金鑰
notepad .env

# 建置並執行
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

#### Docker 指令參考

| 指令 | 說明 |
|------|------|
| `docker-compose up -d` | 在背景啟動容器 |
| `docker-compose down` | 停止並移除容器 |
| `docker-compose logs -f` | 查看即時日誌 |
| `docker-compose restart` | 重新啟動容器 |
| `docker-compose build` | 重新建置映像檔 |
| `docker-compose ps` | 列出執行中的容器 |

### 手動建置 Docker 映像檔

```bash
# 建置映像檔
docker build -t fraudguard-hk .

# 執行容器
docker run -d \
  --name fraudguard-hk \
  -p 3000:3000 \
  --env-file .env \
  fraudguard-hk
```

**Windows CMD:**
```cmd
# 建置映像檔
docker build -t fraudguard-hk .

# 執行容器
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

**Windows PowerShell:**
```powershell
# 建置映像檔
docker build -t fraudguard-hk .

# 執行容器
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

### Docker 環境變數

執行容器時可以覆寫環境變數：

```bash
docker run -d \
  --name fraudguard-hk \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-key" \
  -e DASHSCOPE_API_KEY="your-key" \
  fraudguard-hk
```

---

## ⚙️ 環境變數

在專案根目錄建立 `.env` 檔案，包含以下變數：

```env
# ===========================================
# 資料庫設定（必須）
# ===========================================
DATABASE_URL="file:./db/custom.db"

# ===========================================
# Supabase 設定（RAG 功能必須）
# ===========================================
# 請至 https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api 取得
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-anon-key"

# ===========================================
# AI 供應商：DashScope（阿里雲）
# ===========================================
# 請至 https://dashscope.console.aliyun.com/ 取得 API 金鑰
# 推薦：支援粵語、新加坡伺服器
DASHSCOPE_API_KEY="your-dashscope-api-key"
DASHSCOPE_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# ===========================================
# AI 供應商：BigModel（智譜 AI）
# ===========================================
# 請至 https://open.bigmodel.cn/ 取得 API 金鑰
# 推薦：中國伺服器、AutoGLM-Phone
BIGMODEL_API_KEY="your-bigmodel-api-key"
BIGMODEL_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
```

### 必要與選項變數

| 變數 | 必要 | 說明 |
|------|------|------|
| `DATABASE_URL` | ✅ 必要 | 本地 SQLite 資料庫 |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ 建議 | RAG 詐騙偵測必須 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ 建議 | RAG 詐騙偵測必須 |
| `DASHSCOPE_API_KEY` | ⚠️ 建議 | 使用 DashScope 或 BigModel 擇一 |
| `BIGMODEL_API_KEY` | ⚠️ 選項 | DashScope 的替代方案 |

### 取得 API 金鑰

#### DashScope（阿里雲）
1. 前往 [DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 使用阿里雲帳號註冊/登入
3. 前往 API Key 管理
4. 建立新的 API Key
5. 複製金鑰到 `.env` 檔案

#### BigModel（智譜 AI）
1. 前往 [BigModel 平台](https://open.bigmodel.cn/)
2. 註冊/登入
3. 前往 API Keys 區域
4. 建立新的 API Key
5. 複製金鑰到 `.env` 檔案

#### Supabase
1. 前往 [Supabase 控制台](https://supabase.com/dashboard)
2. 建立新專案或選擇現有專案
3. 前往 Settings → API
4. 複製 `URL` 到 `NEXT_PUBLIC_SUPABASE_URL`
5. 複製 `anon public` 金鑰到 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 📁 專案結構

```
fraudguard-hk/
├── android-app/                 # Android 原生應用
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/fraudguard/hk/
│   │       │   ├── MainActivity.kt
│   │       │   └── AndroidBridge.kt
│   │       └── AndroidManifest.xml
│   └── README.md
│
├── data-collection/             # 詐騙資料抓取腳本
│   ├── hk01_scraper.py
│   └── daily_update.py
│
├── db/                          # 資料庫檔案
│   └── custom.db
│
├── prisma/                      # 資料庫 Schema
│   └── schema.prisma
│
├── public/                      # 靜態資源
│   └── logo.svg
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API 路由
│   │   │   ├── agent/           # AI 代理端點
│   │   │   │   ├── asr/route.ts        # 語音識別
│   │   │   │   ├── chat/route.ts       # 聊天完成
│   │   │   │   ├── tts/route.ts        # 文字轉語音
│   │   │   │   ├── vision/route.ts     # 圖像分析
│   │   │   │   ├── autoglm/route.ts    # 手機自動化
│   │   │   │   ├── rag/route.ts        # RAG 搜尋
│   │   │   │   ├── intent/route.ts     # 意圖分類
│   │   │   │   └── action/route.ts     # 動作執行
│   │   │   ├── contacts/route.ts       # 聯絡人管理
│   │   │   └── family-alert/route.ts   # 家人通知
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── safeguard/           # 主要應用元件
│   │   │   ├── elderly-mode.tsx       # 長者介面
│   │   │   ├── default-mode.tsx       # 聊天介面
│   │   │   ├── settings-dialog.tsx    # 設定
│   │   │   ├── emergency-contacts.tsx # 聯絡人管理
│   │   │   ├── language-selector.tsx  # 語言切換
│   │   │   └── family-alert-panel.tsx # 警示面板
│   │   └── ui/                  # shadcn/ui 元件
│   │
│   ├── hooks/                   # 自訂 React Hooks
│   │   ├── use-mobile.ts
│   │   ├── use-toast.ts
│   │   └── use-android-bridge.ts
│   │
│   ├── lib/                     # 核心函式庫
│   │   ├── ai-client.ts         # AI 服務客戶端
│   │   ├── agent-orchestrator.ts # 代理協調
│   │   ├── app-config.ts        # 應用設定
│   │   ├── db.ts                # 資料庫客戶端
│   │   ├── i18n/                # 國際化
│   │   │   ├── index.tsx
│   │   │   └── translations.ts
│   │   ├── mode-manager.ts      # UI 模式管理
│   │   └── utils.ts             # 工具函式
│   │
│   ├── utils/supabase/          # Supabase 客戶端
│   │   ├── client.ts            # 瀏覽器客戶端
│   │   ├── server.ts            # 伺服器客戶端
│   │   ├── middleware.ts        # 認證中介軟體
│   │   └── session.ts           # 工作階段管理
│   │
│   └── proxy.ts                 # Next.js 16 中介軟體代理
│
├── .env.example                 # 環境變數範本
├── .dockerignore                # Docker 忽略檔案
├── Dockerfile                   # Docker 設定
├── docker-compose.yml           # Docker Compose 設定
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 📖 API 文件

### 聊天代理 API

**POST** `/api/agent/chat`

處理文字輸入並返回詐騙分析。

```typescript
// 請求
{
  "message": "我收到電話，有人自稱警察...",
  "language": "zh-HK",
  "mode": "qwen" // 或 "glm"
}

// 回應
{
  "success": true,
  "result": {
    "risk_level": "high",
    "scam_type": "phone_scam",
    "explanation": "這是常見的冒充警察詐騙...",
    "recommendation": "請勿提供任何個人資料...",
    "voice_response": "https://..."
  }
}
```

### 語音識別 API

**POST** `/api/agent/asr`

將語音轉換為文字。

```typescript
// 請求（multipart/form-data）
{
  "audio": File, // WAV、MP3、M4A
  "language": "zh-HK" // zh-HK、zh-CN、en
}

// 回應
{
  "success": true,
  "text": "有人打電話話我中獎...",
  "confidence": 0.95
}
```

### 圖像分析 API

**POST** `/api/agent/vision`

分析圖像中的詐騙內容。

```typescript
// 請求（multipart/form-data）
{
  "image": File, // PNG、JPG、WebP
  "language": "zh-HK"
}

// 回應
{
  "success": true,
  "result": {
    "ocr_text": "提取的文字內容...",
    "risk_level": "medium",
    "scam_indicators": ["urgent_request", "unknown_sender"],
    "explanation": "..."
  }
}
```

### 文字轉語音 API

**POST** `/api/agent/tts`

將文字轉換為語音。

```typescript
// 請求
{
  "text": "這是一個詐騙訊息，請小心...",
  "language": "zh-HK",
  "voice": "longxiaochun" // 或其他語音選項
}

// 回應
{
  "success": true,
  "audio_url": "data:audio/wav;base64,..."
}
```

### 聯絡人 API

**GET** `/api/contacts`

取得所有緊急聯絡人。

```typescript
// 回應
{
  "contacts": [
    {
      "id": "1",
      "name": "兒子",
      "phone": "+85212345678",
      "priority": 1,
      "notify_on_alert": true
    }
  ]
}
```

**POST** `/api/contacts`

新增聯絡人。

```typescript
// 請求
{
  "name": "兒子",
  "phone": "+85212345678",
  "priority": 1,
  "notify_on_alert": true
}
```

### 家人警示 API

**POST** `/api/family-alert`

發送警示給緊急聯絡人。

```typescript
// 請求
{
  "scam_type": "phone_scam",
  "risk_level": "high",
  "details": "用戶收到可疑電話...",
  "contacts": ["contact_id_1", "contact_id_2"]
}

// 回應
{
  "success": true,
  "sent_to": ["+85212345678", "+85298765432"],
  "channels": ["whatsapp", "sms"]
}
```

---

## 📱 Android 應用程式

### 功能特色
- 原生語音識別（支援粵語、普通話、英語三種語言）
- 直接撥打電話和發送簡訊
- 一鍵開啟 WhatsApp/WeChat
- 緊急聯絡人管理
- 深度連結整合網頁應用

### 安裝方法

1. **在 Android Studio 中開啟**
   ```bash
   cd android-app
   # 在 Android Studio 中開啟此資料夾
   ```

2. **設定伺服器 URL**

   編輯 `app/src/main/java/com/fraudguard/hk/MainActivity.kt`：
   ```kotlin
   private const val SERVER_URL = "https://your-server.com"
   ```

3. **建置 APK**
   - 在 Android Studio：Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 或使用 Gradle：
     ```bash
     # macOS/Linux
     ./gradlew assembleDebug
     
     # Windows CMD/PowerShell
     gradlew.bat assembleDebug
     ```

4. **安裝到裝置**
   - 將 APK 傳送到裝置並安裝
   - 或使用 ADB：
     ```bash
     adb install app/build/outputs/apk/debug/app-debug.apk
     ```

---

## 🚢 部署指南

### Vercel（推薦）

1. **安裝 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署**
   ```bash
   vercel --prod
   ```

3. **設定環境變數**
   - 在 Vercel Dashboard → Project → Settings → Environment Variables
   - 加入 `.env.example` 中的所有變數

### Render

1. **建立 `render.yaml`**（已包含在專案中）

2. **連接到 Render**
   - 前往 render.com
   - 建立新的 Web Service
   - 連接你的 GitHub 儲存庫
   - Render 會自動偵測 `render.yaml`

### Docker（正式環境）

請參閱上方 [Docker 部署](#-docker-部署) 章節。

### 手動正式環境建置

```bash
# 建置正式版本
bun run build

# 啟動正式伺服器
bun run start
```

**Windows CMD:**
```cmd
bun run build
bun run start
```

**Windows PowerShell:**
```powershell
bun run build
bun run start
```

---

## 💻 開發指南

### 可用指令

| 指令 | 說明 |
|------|------|
| `bun run dev` | 啟動開發伺服器 |
| `bun run build` | 建置正式版本 |
| `bun run start` | 啟動正式伺服器 |
| `bun run lint` | 執行 ESLint |
| `bun run db:push` | 推送 Schema 到資料庫 |
| `bun run db:generate` | 產生 Prisma 客戶端 |
| `bun run db:migrate` | 執行資料庫遷移 |
| `bun run db:reset` | 重置資料庫 |

### 程式碼風格

- TypeScript 嚴格模式已啟用
- ESLint + Next.js 推薦規則
- 使用 Prettier 格式化
- 優先使用函數元件與 Hooks
- 客戶端元件使用 `use client` 指令

### 新增語言

1. 編輯 `src/lib/i18n/translations.ts`
2. 為新語言加入翻譯：
   ```typescript
   export const translations = {
     'zh-HK': { ... },
     'zh-CN': { ... },
     'en': { ... },
     'new-lang': {
       // 在此加入翻譯
     }
   }
   ```
3. 更新 `LanguageSelector` 元件

### Python 資料收集設定

專案包含 Python 腳本用於收集詐騙資料，位於 `data-collection/` 目錄。

#### 系統需求
- Python 3.10 或更高版本
- pip（Python 套件管理器）

#### 設定虛擬環境

**macOS / Linux (Bash):**
```bash
# 進入 data-collection 目錄
cd data-collection

# 建立虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate

# 安裝依賴
pip install -r requirements.txt

# 執行腳本
python hk01_scraper.py
python daily_update.py

# 完成後關閉虛擬環境
deactivate
```

**Windows CMD:**
```cmd
# 進入 data-collection 目錄
cd data-collection

# 建立虛擬環境
python -m venv venv

# 啟動虛擬環境
venv\Scripts\activate.bat

# 安裝依賴
pip install -r requirements.txt

# 執行腳本
python hk01_scraper.py
python daily_update.py

# 完成後關閉虛擬環境
deactivate
```

**Windows PowerShell:**
```powershell
# 進入 data-collection 目錄
cd data-collection

# 建立虛擬環境
python -m venv venv

# 啟動虛擬環境
.\venv\Scripts\Activate.ps1

# 安裝依賴
pip install -r requirements.txt

# 執行腳本
python hk01_scraper.py
python daily_update.py

# 完成後關閉虛擬環境
deactivate
```

#### 可用腳本

| 腳本 | 說明 |
|------|------|
| `hk01_scraper.py` | 從 HK01 抓取詐騙新聞 |
| `daily_update.py` | 每日資料庫更新腳本 |

---

## 🔧 常見問題

### 常見問題排解

#### "Missing X-Token header" 錯誤
- 確認 `.env` 中已設定 `DASHSCOPE_API_KEY` 或 `BIGMODEL_API_KEY`
- 加入金鑰後重新啟動開發伺服器

#### 資料庫錯誤
```bash
# 重置資料庫
bun run db:reset

# 重新產生 Prisma 客戶端
bun run db:generate
```

**Windows CMD:**
```cmd
bun run db:reset
bun run db:generate
```

#### 音訊無法播放
- 檢查瀏覽器的音訊權限
- 確認 TTS API 返回有效的音訊

#### 圖片上傳失敗
- 檢查檔案大小（最大 10MB）
- 確認格式為 PNG、JPG 或 WebP

#### Supabase 連線錯誤
- 驗證 `NEXT_PUBLIC_SUPABASE_URL` 是否正確
- 檢查 Supabase 專案是否啟用
- 驗證 API 金鑰是否有效

#### Docker 問題
```bash
# 重新建置 Docker 映像檔
docker-compose build --no-cache

# 查看容器日誌
docker-compose logs -f

# 移除磁碟區並重新開始
docker-compose down -v
docker-compose up -d
```

### 除錯模式

啟用除錯記錄：
```env
DEBUG=true
NODE_ENV=development
```

### 取得協助

1. 查看現有 [Issues](https://github.com/Jendope/fraudguard-hk/issues)
2. 建立新 issue 並附上：
   - 錯誤訊息
   - 重現步驟
   - 環境詳情

---

## 🤝 參與貢獻

歡迎參與貢獻！請依照以下步驟：

1. Fork 本儲存庫
2. 建立功能分支（`git checkout -b feature/amazing-feature`）
3. 提交變更（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 建立 Pull Request

### 開發規範

- 撰寫清楚的提交訊息
- 為新功能加入測試
- 更新文件
- 遵循現有程式碼風格

---

## 📞 緊急熱線

| 服務 | 電話 | 服務時間 |
|------|------|----------|
| **香港警務處反詐騙協調中心** | 18222 | 24/7 |
| **香港警務處緊急求助** | 999 | 24/7 |
| **香港金融管理局** | 2878 8196 | 辦公時間 |

---

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案。

---

## 🙏 致謝

- [DashScope](https://dashscope.aliyun.com/) - AI 服務
- [BigModel](https://open.bigmodel.cn/) - 替代 AI 服務
- [Supabase](https://supabase.com/) - 向量資料庫
- [shadcn/ui](https://ui.shadcn.com/) - UI 元件
- 香港警務處 - 防騙資源

---

<p align="center">
  以 ❤️ 為香港長者社群製作
</p>
