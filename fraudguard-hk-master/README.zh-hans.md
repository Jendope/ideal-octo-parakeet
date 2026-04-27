# FraudGuard HK 防诈卫士

**其他语言**: [English](README.md) | [繁體中文](README.zh-hant.md)

---

## 📑 目录

- [应用程序简介](#️-应用程序简介)
- [功能演示](#-功能演示)
- [主要功能](#-主要功能)
- [系统架构](#-系统架构)
- [技术规格](#-技术规格)
- [快速开始](#-快速开始)
- [Docker 部署](#-docker-部署)
- [环境变量](#-环境变量)
- [项目结构](#-项目结构)
- [API 文档](#-api-文档)
- [Android 应用程序](#-android-应用程序)
- [部署指南](#-部署指南)
- [开发指南](#-开发指南)
- [常见问题](#-常见问题)
- [参与贡献](#-参与贡献)
- [授权](#-授权)

---

## 🛡️ 应用程序简介

FraudGuard HK 是一款专为香港长者设计的智能防诈骗助手，结合尖端人工智能技术，帮助识别和防范各类诈骗消息，提供长者友好的用户界面。

### 问题背景

香港针对长者的诈骗案件显著增加，包括：
- 电话诈骗（冒充官员或家人）
- 投资诈骗（假股票、虚拟货币）
- 情感诈骗
- 钓鱼消息（假银行通知、中奖消息）

许多长者因以下原因难以识别诈骗：
- 缺乏技术知识
- 语言障碍
- 身体限制（视力、听力衰退）
- 对权威人士的信任

### 解决方案

FraudGuard HK 针对这些挑战提供：
- **语音优先界面** - 自然地使用粤语、普通话或英语对话
- **大型无障碍界面** - 大按钮、清晰字体、高对比度
- **AI 驱动检测** - 先进模型分析消息内容和情境
- **家人警示系统** - 自动通知信任的联系人
- **多语言支持** - 完整支持粤语、普通话和英语

---

## 🎥 功能演示

### 界面模式

#### 长者模式（大按钮界面）
- 超大麦克风按钮用于语音输入
- 大型图片上传按钮用于截图分析
- 简单的风险等级指示器（安全 / 可疑 / 危险）
- 自动语音回复朗读分析结果

#### 聊天模式（标准界面）
- 文字输入用于输入或粘贴消息
- 聊天记录与分析结果
- 常用任务的快速操作按钮

---

## ✨ 主要功能

### 1. 智能诈骗检测

| 输入类型 | 说明 | 支持格式 |
|----------|------|----------|
| **语音输入** | 自然地描述可疑消息 | 粤语、普通话、英语 |
| **文字输入** | 粘贴或输入可疑消息内容 | 任何文字 |
| **图片上传** | 上传可疑消息截图 | PNG、JPG、WebP |

### 2. AI 分析引擎

系统使用多阶段分析流程：

1. **意图分类** - 判断查询类型
2. **内容提取** - 提取关键信息（电话号码、链接、金额）
3. **诈骗模式比对** - 与已知诈骗模式比对
4. **RAG 增强** - 搜索已验证的诈骗案例数据库
5. **风险评估** - 生成风险等级与解释

### 3. 长者友好设计

| 功能 | 说明 |
|------|------|
| **大型按钮** | 最小 48px 触控目标，方便点击 |
| **高对比度** | 清晰的视觉层次与无障碍色彩 |
| **语音反馈** | 自动 TTS 朗读分析结果 |
| **简单语言** | 以易懂的方式显示结果 |
| **响应式设计** | 支持手机和平板电脑 |

### 4. 家人警示系统

当检测到高风险诈骗时：
1. 自动发送警示给紧急联系人
2. 包含诈骗详情和风险等级
3. 支持多种渠道：
   - WhatsApp
   - WeChat
   - SMS
4. 多语言警示消息

### 5. 紧急联系人管理

- 添加无限数量的紧急联系人
- 设置通知优先顺序
- 紧急情况一键拨打
- 联系人跨设备同步

### 6. 自主代理功能 (AutoGLM-Phone)

语音启动的手机控制：

| 指令 | 操作 |
|------|------|
| "打开 WhatsApp" | 开启 WhatsApp |
| "打开微信" | 开启 WeChat |
| "打开电话" | 开启电话 App（数字键盘） |
| "打开短信" | 开启短信 App |
| "打开联系人" | 开启联系人 App |
| "找[名字]" | 搜索联系人 |
| "打给[名字]" | 拨打给联系人 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         客户端层                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   网页应用   │  │ Android 应用│  │   iOS 应用   │              │
│  │  (Next.js)  │  │  (Kotlin)   │  │  (未来开发)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API 层                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  /api/agent │  │ /api/contacts│ │/api/family- │              │
│  │   (聊天)    │  │  (联系人)   │  │  alert      │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       AI 服务层                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   ASR API   │  │  Vision API │  │   LLM API   │              │
│  │  (语音转    │  │ (图像 OCR   │  │  (分析与    │              │
│  │   文字)     │  │  与理解)    │  │   生成)     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   TTS API   │  │AutoGLM-Phone│  │  RAG 搜索   │              │
│  │  (文字转    │  │  (自主手机  │  │  (诈骗案例  │              │
│  │   语音)     │  │    控制)    │  │   数据库)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         数据层                                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   SQLite    │  │  Supabase   │                               │
│  │  (本地数据库)│  │ (向量数据库) │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 技术规格

### 前端技术

| 技术 | 用途 |
|------|------|
| Next.js 16 | React 框架（App Router） |
| TypeScript | 类型安全开发 |
| Tailwind CSS 4 | 实用优先样式 |
| shadcn/ui | 组件库 |
| Framer Motion | 动画效果 |
| Zustand | 状态管理 |

### 后端技术

| 技术 | 用途 |
|------|------|
| Next.js API Routes | 无服务器 API 端点 |
| Prisma | 数据库 ORM |
| SQLite | 本地数据库 |
| Supabase | 向量数据库（RAG） |

### AI 服务

| 服务 | 供应商 | 用途 |
|------|--------|------|
| Qwen Plus | DashScope（阿里云） | LLM 对话 |
| Qwen VL OCR | DashScope | 图像理解 |
| Qwen ASR | DashScope | 语音识别 |
| Qwen TTS | DashScope | 文字转语音 |
| GLM-4 Flash | BigModel（智谱） | 替代 LLM |
| AutoGLM-Phone | BigModel | 手机自动化 |

---

## 🚀 快速开始

### 系统需求

- **Node.js 18+** 或 **Bun**
- **npm**、**yarn** 或 **bun** 包管理器

### 安装步骤

#### macOS / Linux (Bash)

```bash
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安装依赖
bun install

# 设置环境变量
cp .env.example .env

# 编辑 .env 填入 API 密钥
nano .env  # 或使用你喜欢的编辑器

# 初始化数据库
bun run db:push

# 启动开发服务器
bun run dev
```

#### Windows Command Prompt (CMD)

```cmd
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安装依赖
bun install

# 设置环境变量
copy .env.example .env

# 编辑 .env 填入 API 密钥（使用记事本或你喜欢的编辑器）
notepad .env

# 初始化数据库
bun run db:push

# 启动开发服务器
bun run dev
```

#### Windows PowerShell

```powershell
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安装依赖
bun install

# 设置环境变量
Copy-Item .env.example .env

# 编辑 .env 填入 API 密钥（使用记事本或你喜欢的编辑器）
notepad .env

# 初始化数据库
bun run db:push

# 启动开发服务器
bun run dev
```

#### 使用 npm（任何平台）

```bash
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 安装依赖
npm install

# 设置环境变量
# macOS/Linux:
cp .env.example .env
# Windows CMD:
copy .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env

# 编辑 .env 填入 API 密钥

# 初始化数据库
npm run db:push

# 启动开发服务器
npm run dev
```

### 打开应用程序

打开浏览器前往：**http://localhost:3000**

---

## 🐳 Docker 部署

### 使用 Docker 快速开始

在生产环境运行 FraudGuard HK 的最简单方式。

#### 系统需求
- 已安装 Docker（[安装 Docker](https://docs.docker.com/get-docker/)）
- Docker Compose（Docker Desktop 已内置）

#### 使用 Docker Compose 运行

**macOS / Linux (Bash):**
```bash
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 从模板创建 .env 文件
cp .env.example .env

# 编辑 .env 填入 API 密钥
nano .env

# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

**Windows CMD:**
```cmd
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 从模板创建 .env 文件
copy .env.example .env

# 编辑 .env 填入 API 密钥
notepad .env

# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

**Windows PowerShell:**
```powershell
# 下载项目
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# 从模板创建 .env 文件
Copy-Item .env.example .env

# 编辑 .env 填入 API 密钥
notepad .env

# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

#### Docker 命令参考

| 命令 | 说明 |
|------|------|
| `docker-compose up -d` | 在后台启动容器 |
| `docker-compose down` | 停止并移除容器 |
| `docker-compose logs -f` | 查看实时日志 |
| `docker-compose restart` | 重启容器 |
| `docker-compose build` | 重新构建镜像 |
| `docker-compose ps` | 列出运行中的容器 |

### 手动构建 Docker 镜像

```bash
# 构建镜像
docker build -t fraudguard-hk .

# 运行容器
docker run -d \
  --name fraudguard-hk \
  -p 3000:3000 \
  --env-file .env \
  fraudguard-hk
```

**Windows CMD:**
```cmd
# 构建镜像
docker build -t fraudguard-hk .

# 运行容器
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

**Windows PowerShell:**
```powershell
# 构建镜像
docker build -t fraudguard-hk .

# 运行容器
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

### Docker 环境变量

运行容器时可以覆盖环境变量：

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

## ⚙️ 环境变量

在项目根目录创建 `.env` 文件，包含以下变量：

```env
# ===========================================
# 数据库设置（必须）
# ===========================================
DATABASE_URL="file:./db/custom.db"

# ===========================================
# Supabase 设置（RAG 功能必须）
# ===========================================
# 请至 https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api 取得
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-anon-key"

# ===========================================
# AI 供应商：DashScope（阿里云）
# ===========================================
# 请至 https://dashscope.console.aliyun.com/ 取得 API 密钥
# 推荐：支持粤语、新加坡服务器
DASHSCOPE_API_KEY="your-dashscope-api-key"
DASHSCOPE_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# ===========================================
# AI 供应商：BigModel（智谱 AI）
# ===========================================
# 请至 https://open.bigmodel.cn/ 取得 API 密钥
# 推荐：中国服务器、AutoGLM-Phone
BIGMODEL_API_KEY="your-bigmodel-api-key"
BIGMODEL_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
```

### 必要与可选变量

| 变量 | 必要 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ 必要 | 本地 SQLite 数据库 |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ 建议 | RAG 诈骗检测必须 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ 建议 | RAG 诈骗检测必须 |
| `DASHSCOPE_API_KEY` | ⚠️ 建议 | 使用 DashScope 或 BigModel 择一 |
| `BIGMODEL_API_KEY` | ⚠️ 选项 | DashScope 的替代方案 |

### 获取 API 密钥

#### DashScope（阿里云）
1. 前往 [DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 使用阿里云账号注册/登录
3. 前往 API Key 管理
4. 创建新的 API Key
5. 复制密钥到 `.env` 文件

#### BigModel（智谱 AI）
1. 前往 [BigModel 平台](https://open.bigmodel.cn/)
2. 注册/登录
3. 前往 API Keys 区域
4. 创建新的 API Key
5. 复制密钥到 `.env` 文件

#### Supabase
1. 前往 [Supabase 控制台](https://supabase.com/dashboard)
2. 创建新项目或选择现有项目
3. 前往 Settings → API
4. 复制 `URL` 到 `NEXT_PUBLIC_SUPABASE_URL`
5. 复制 `anon public` 密钥到 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 📁 项目结构

```
fraudguard-hk/
├── android-app/                 # Android 原生应用
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/fraudguard/hk/
│   │       │   ├── MainActivity.kt
│   │       │   └── AndroidBridge.kt
│   │       └── AndroidManifest.xml
│   └── README.md
│
├── data-collection/             # 诈骗数据抓取脚本
│   ├── hk01_scraper.py
│   └── daily_update.py
│
├── db/                          # 数据库文件
│   └── custom.db
│
├── prisma/                      # 数据库 Schema
│   └── schema.prisma
│
├── public/                      # 静态资源
│   └── logo.svg
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API 路由
│   │   │   ├── agent/           # AI 代理端点
│   │   │   │   ├── asr/route.ts        # 语音识别
│   │   │   │   ├── chat/route.ts       # 聊天完成
│   │   │   │   ├── tts/route.ts        # 文字转语音
│   │   │   │   ├── vision/route.ts     # 图像分析
│   │   │   │   ├── autoglm/route.ts    # 手机自动化
│   │   │   │   ├── rag/route.ts        # RAG 搜索
│   │   │   │   ├── intent/route.ts     # 意图分类
│   │   │   │   └── action/route.ts     # 动作执行
│   │   │   ├── contacts/route.ts       # 联系人管理
│   │   │   └── family-alert/route.ts   # 家人通知
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── safeguard/           # 主要应用组件
│   │   │   ├── elderly-mode.tsx       # 长者界面
│   │   │   ├── default-mode.tsx       # 聊天界面
│   │   │   ├── settings-dialog.tsx    # 设置
│   │   │   ├── emergency-contacts.tsx # 联系人管理
│   │   │   ├── language-selector.tsx  # 语言切换
│   │   │   └── family-alert-panel.tsx # 警示面板
│   │   └── ui/                  # shadcn/ui 组件
│   │
│   ├── hooks/                   # 自定义 React Hooks
│   │   ├── use-mobile.ts
│   │   ├── use-toast.ts
│   │   └── use-android-bridge.ts
│   │
│   ├── lib/                     # 核心库
│   │   ├── ai-client.ts         # AI 服务客户端
│   │   ├── agent-orchestrator.ts # 代理协调
│   │   ├── app-config.ts        # 应用配置
│   │   ├── db.ts                # 数据库客户端
│   │   ├── i18n/                # 国际化
│   │   │   ├── index.tsx
│   │   │   └── translations.ts
│   │   ├── mode-manager.ts      # UI 模式管理
│   │   └── utils.ts             # 工具函数
│   │
│   ├── utils/supabase/          # Supabase 客户端
│   │   ├── client.ts            # 浏览器客户端
│   │   ├── server.ts            # 服务器客户端
│   │   ├── middleware.ts        # 认证中间件
│   │   └── session.ts           # 会话管理
│   │
│   └── proxy.ts                 # Next.js 16 中间件代理
│
├── .env.example                 # 环境变量模板
├── .dockerignore                # Docker 忽略文件
├── Dockerfile                   # Docker 配置
├── docker-compose.yml           # Docker Compose 配置
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 📖 API 文档

### 聊天代理 API

**POST** `/api/agent/chat`

处理文字输入并返回诈骗分析。

```typescript
// 请求
{
  "message": "我收到电话，有人自称警察...",
  "language": "zh-HK",
  "mode": "qwen" // 或 "glm"
}

// 响应
{
  "success": true,
  "result": {
    "risk_level": "high",
    "scam_type": "phone_scam",
    "explanation": "这是常见的冒充警察诈骗...",
    "recommendation": "请勿提供任何个人资料...",
    "voice_response": "https://..."
  }
}
```

### 语音识别 API

**POST** `/api/agent/asr`

将语音转换为文字。

```typescript
// 请求（multipart/form-data）
{
  "audio": File, // WAV、MP3、M4A
  "language": "zh-HK" // zh-HK、zh-CN、en
}

// 响应
{
  "success": true,
  "text": "有人打电话说我中奖...",
  "confidence": 0.95
}
```

### 图像分析 API

**POST** `/api/agent/vision`

分析图像中的诈骗内容。

```typescript
// 请求（multipart/form-data）
{
  "image": File, // PNG、JPG、WebP
  "language": "zh-HK"
}

// 响应
{
  "success": true,
  "result": {
    "ocr_text": "提取的文字内容...",
    "risk_level": "medium",
    "scam_indicators": ["urgent_request", "unknown_sender"],
    "explanation": "..."
  }
}
```

### 文字转语音 API

**POST** `/api/agent/tts`

将文字转换为语音。

```typescript
// 请求
{
  "text": "这是一个诈骗消息，请小心...",
  "language": "zh-HK",
  "voice": "longxiaochun" // 或其他语音选项
}

// 响应
{
  "success": true,
  "audio_url": "data:audio/wav;base64,..."
}
```

### 联系人 API

**GET** `/api/contacts`

获取所有紧急联系人。

```typescript
// 响应
{
  "contacts": [
    {
      "id": "1",
      "name": "儿子",
      "phone": "+85212345678",
      "priority": 1,
      "notify_on_alert": true
    }
  ]
}
```

**POST** `/api/contacts`

添加联系人。

```typescript
// 请求
{
  "name": "儿子",
  "phone": "+85212345678",
  "priority": 1,
  "notify_on_alert": true
}
```

### 家人警示 API

**POST** `/api/family-alert`

发送警示给紧急联系人。

```typescript
// 请求
{
  "scam_type": "phone_scam",
  "risk_level": "high",
  "details": "用户收到可疑电话...",
  "contacts": ["contact_id_1", "contact_id_2"]
}

// 响应
{
  "success": true,
  "sent_to": ["+85212345678", "+85298765432"],
  "channels": ["whatsapp", "sms"]
}
```

---

## 📱 Android 应用程序

### 功能特色
- 原生语音识别（支持粤语、普通话、英语三种语言）
- 直接拨打电话和发送短信
- 一键开启 WhatsApp/WeChat
- 紧急联系人管理
- 深度链接整合网页应用

### 安装方法

1. **在 Android Studio 中打开**
   ```bash
   cd android-app
   # 在 Android Studio 中打开此文件夹
   ```

2. **设置服务器 URL**

   编辑 `app/src/main/java/com/fraudguard/hk/MainActivity.kt`：
   ```kotlin
   private const val SERVER_URL = "https://your-server.com"
   ```

3. **构建 APK**
   - 在 Android Studio：Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 或使用 Gradle：
     ```bash
     # macOS/Linux
     ./gradlew assembleDebug
     
     # Windows CMD/PowerShell
     gradlew.bat assembleDebug
     ```

4. **安装到设备**
   - 将 APK 传输到设备并安装
   - 或使用 ADB：
     ```bash
     adb install app/build/outputs/apk/debug/app-debug.apk
     ```

---

## 🚢 部署指南

### Vercel（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **部署**
   ```bash
   vercel --prod
   ```

3. **设置环境变量**
   - 在 Vercel Dashboard → Project → Settings → Environment Variables
   - 加入 `.env.example` 中的所有变量

### Render

1. **创建 `render.yaml`**（已包含在项目中）

2. **连接到 Render**
   - 前往 render.com
   - 创建新的 Web Service
   - 连接你的 GitHub 仓库
   - Render 会自动检测 `render.yaml`

### Docker（生产环境）

请参阅上方 [Docker 部署](#-docker-部署) 章节。

### 手动生产环境构建

```bash
# 构建正式版本
bun run build

# 启动正式服务器
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

## 💻 开发指南

### 可用命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 启动开发服务器 |
| `bun run build` | 构建正式版本 |
| `bun run start` | 启动正式服务器 |
| `bun run lint` | 执行 ESLint |
| `bun run db:push` | 推送 Schema 到数据库 |
| `bun run db:generate` | 生成 Prisma 客户端 |
| `bun run db:migrate` | 执行数据库迁移 |
| `bun run db:reset` | 重置数据库 |

### 代码风格

- TypeScript 严格模式已启用
- ESLint + Next.js 推荐规则
- 使用 Prettier 格式化
- 优先使用函数组件与 Hooks
- 客户端组件使用 `use client` 指令

### 添加新语言

1. 编辑 `src/lib/i18n/translations.ts`
2. 为新语言加入翻译：
   ```typescript
   export const translations = {
     'zh-HK': { ... },
     'zh-CN': { ... },
     'en': { ... },
     'new-lang': {
       // 在此加入翻译
     }
   }
   ```
3. 更新 `LanguageSelector` 组件

### Python 数据收集设置

项目包含 Python 脚本用于收集诈骗数据，位于 `data-collection/` 目录。

#### 系统需求
- Python 3.10 或更高版本
- pip（Python 包管理器）

#### 设置虚拟环境

**macOS / Linux (Bash):**
```bash
# 进入 data-collection 目录
cd data-collection

# 创建虚拟环境
python3 -m venv venv

# 启动虚拟环境
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 运行脚本
python hk01_scraper.py
python daily_update.py

# 完成后关闭虚拟环境
deactivate
```

**Windows CMD:**
```cmd
# 进入 data-collection 目录
cd data-collection

# 创建虚拟环境
python -m venv venv

# 启动虚拟环境
venv\Scripts\activate.bat

# 安装依赖
pip install -r requirements.txt

# 运行脚本
python hk01_scraper.py
python daily_update.py

# 完成后关闭虚拟环境
deactivate
```

**Windows PowerShell:**
```powershell
# 进入 data-collection 目录
cd data-collection

# 创建虚拟环境
python -m venv venv

# 启动虚拟环境
.\venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt

# 运行脚本
python hk01_scraper.py
python daily_update.py

# 完成后关闭虚拟环境
deactivate
```

#### 可用脚本

| 脚本 | 说明 |
|------|------|
| `hk01_scraper.py` | 从 HK01 抓取诈骗新闻 |
| `daily_update.py` | 每日数据库更新脚本 |

---

## 🔧 常见问题

### 常见问题排查

#### "Missing X-Token header" 错误
- 确认 `.env` 中已设置 `DASHSCOPE_API_KEY` 或 `BIGMODEL_API_KEY`
- 加入密钥后重新启动开发服务器

#### 数据库错误
```bash
# 重置数据库
bun run db:reset

# 重新生成 Prisma 客户端
bun run db:generate
```

**Windows CMD:**
```cmd
bun run db:reset
bun run db:generate
```

#### 音频无法播放
- 检查浏览器的音频权限
- 确认 TTS API 返回有效的音频

#### 图片上传失败
- 检查文件大小（最大 10MB）
- 确认格式为 PNG、JPG 或 WebP

#### Supabase 连接错误
- 验证 `NEXT_PUBLIC_SUPABASE_URL` 是否正确
- 检查 Supabase 项目是否启用
- 验证 API 密钥是否有效

#### Docker 问题
```bash
# 重新构建 Docker 镜像
docker-compose build --no-cache

# 查看容器日志
docker-compose logs -f

# 移除卷并重新开始
docker-compose down -v
docker-compose up -d
```

### 调试模式

启用调试日志：
```env
DEBUG=true
NODE_ENV=development
```

### 获取帮助

1. 查看现有 [Issues](https://github.com/Jendope/fraudguard-hk/issues)
2. 创建新 issue 并附上：
   - 错误消息
   - 重现步骤
   - 环境详情

---

## 🤝 参与贡献

欢迎参与贡献！请依照以下步骤：

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交变更（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建 Pull Request

### 开发规范

- 撰写清楚的提交消息
- 为新功能加入测试
- 更新文档
- 遵循现有代码风格

---

## 📞 紧急热线

| 服务 | 电话 | 服务时间 |
|------|------|----------|
| **香港警务处反诈骗协调中心** | 18222 | 24/7 |
| **香港警务处紧急求助** | 999 | 24/7 |
| **香港金融管理局** | 2878 8196 | 办公时间 |

---

## 📄 授权

本项目采用 MIT 授权 - 详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

- [DashScope](https://dashscope.aliyun.com/) - AI 服务
- [BigModel](https://open.bigmodel.cn/) - 替代 AI 服务
- [Supabase](https://supabase.com/) - 向量数据库
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件
- 香港警务处 - 防骗资源

---

<p align="center">
  以 ❤️ 为香港长者社区制作
</p>
