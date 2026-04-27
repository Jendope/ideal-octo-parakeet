# FraudGuard HK

**Other languages**: [繁體中文](README.zh-hant.md) | [简体中文](README.zh-hans.md)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Demo](#-demo)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Android App](#-android-app)
- [Deployment](#-deployment)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛡️ Overview

FraudGuard HK is an intelligent anti-scam assistant designed specifically for elderly users in Hong Kong. It leverages cutting-edge AI technology to identify and prevent various types of scam messages, providing a user-friendly interface optimized for seniors.

### Problem Statement

Hong Kong has seen a significant rise in scam cases targeting elderly citizens, including:
- Phone scams (pretending to be officials or family members)
- Investment fraud (fake stocks, cryptocurrencies)
- Romance scams
- Phishing messages (fake bank notifications, lottery wins)

Many elderly users struggle to identify these scams due to:
- Lack of technical knowledge
- Language barriers
- Physical limitations (poor eyesight, hearing)
- Trust in authority figures

### Solution

FraudGuard HK addresses these challenges with:
- **Voice-first interface** - Speak naturally in Cantonese, Mandarin, or English
- **Large, accessible UI** - Big buttons, clear fonts, high contrast
- **AI-powered detection** - Advanced models analyze message content and context
- **Family alert system** - Automatic notification to trusted contacts
- **Multi-language support** - Full support for Cantonese, Mandarin, and English

---

## 🎥 Demo

### Interface Modes

#### Elderly Mode (Large Button Interface)
- Oversized microphone button for voice input
- Large image upload button for screenshot analysis
- Simple risk level indicators (Safe / Suspicious / Dangerous)
- Automatic voice response reading results aloud

#### Chat Mode (Standard Interface)
- Text input for typing or pasting messages
- Chat history with analysis results
- Quick action buttons for common tasks

---

## ✨ Key Features

### 1. Smart Scam Detection

| Input Type | Description | Supported Formats |
|------------|-------------|-------------------|
| **Voice Input** | Speak naturally to describe suspicious messages | Cantonese, Mandarin, English |
| **Text Input** | Paste or type suspicious message content | Any text |
| **Image Upload** | Upload screenshots of suspicious messages | PNG, JPG, WebP |

### 2. AI Analysis Engine

The system uses a multi-stage analysis pipeline:

1. **Intent Classification** - Determines the type of inquiry
2. **Content Extraction** - Extracts key information (phone numbers, links, amounts)
3. **Scam Pattern Matching** - Compares against known scam patterns
4. **RAG Enhancement** - Searches database of verified scam cases
5. **Risk Assessment** - Generates risk level with explanation

### 3. Elderly-Friendly Design

| Feature | Description |
|---------|-------------|
| **Large Buttons** | Minimum 48px touch targets for easy tapping |
| **High Contrast** | Clear visual hierarchy with accessible colors |
| **Voice Feedback** | Automatic TTS reads analysis results |
| **Simple Language** | Results displayed in easy-to-understand terms |
| **Responsive Design** | Works on phones and tablets |

### 4. Family Alert System

When a high-risk scam is detected:
1. Automatically sends alert to emergency contacts
2. Includes scam details and risk level
3. Supports multiple channels:
   - WhatsApp
   - WeChat
   - SMS
4. Multi-language alert messages

### 5. Emergency Contacts Management

- Add unlimited emergency contacts
- Set priority levels for notifications
- Quick call button for emergencies
- Contacts synced across devices

### 6. Autonomous Agent (AutoGLM-Phone)

Voice-activated phone control:

| Command | Action |
|---------|--------|
| "Open WhatsApp" | Launches WhatsApp |
| "Open WeChat" | Launches WeChat |
| "Open Phone" | Opens dialer keypad |
| "Open Messages" | Opens SMS app |
| "Open Contacts" | Opens Contacts |
| "Find [Name]" | Searches contacts |
| "Call [Name]" | Initiates call to contact |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Web App   │  │ Android App │  │   iOS App   │              │
│  │  (Next.js)  │  │  (Kotlin)   │  │  (Future)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  /api/agent │  │ /api/contacts│ │/api/family- │              │
│  │   (Chat)    │  │             │  │   alert     │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Services Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   ASR API   │  │  Vision API │  │   LLM API   │              │
│  │ (Speech to  │  │ (Image OCR  │  │  (Analysis  │              │
│  │   Text)     │  │  & Understanding)│ (Generation)│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   TTS API   │  │AutoGLM-Phone│  │  RAG Search │              │
│  │ (Text to    │  │ (Autonomous │  │ (Scam Case  │              │
│  │  Speech)    │  │   Actions)  │  │  Database)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐                               │
│  │   SQLite    │  │  Supabase   │                               │
│  │  (Local DB) │  │ (Vector DB) │                               │
│  └─────────────┘  └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type-safe development |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui | Component library |
| Framer Motion | Animations |
| Zustand | State management |

### Backend
| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless API endpoints |
| Prisma | ORM for database |
| SQLite | Local database |
| Supabase | Vector database for RAG |

### AI Services
| Service | Provider | Purpose |
|---------|----------|---------|
| Qwen Plus | DashScope (Alibaba) | LLM chat |
| Qwen VL OCR | DashScope | Image understanding |
| Qwen ASR | DashScope | Speech recognition |
| Qwen TTS | DashScope | Text-to-speech |
| GLM-4 Flash | BigModel (Zhipu) | Alternative LLM |
| AutoGLM-Phone | BigModel | Phone automation |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** or **Bun**
- **npm**, **yarn**, or **bun** package manager

### Installation

#### macOS / Linux (Bash)

```bash
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your preferred editor

# Initialize the database
bun run db:push

# Start development server
bun run dev
```

#### Windows Command Prompt (CMD)

```cmd
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Install dependencies
bun install

# Set up environment variables
copy .env.example .env

# Edit .env with your API keys (use Notepad or your preferred editor)
notepad .env

# Initialize the database
bun run db:push

# Start development server
bun run dev
```

#### Windows PowerShell

```powershell
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Install dependencies
bun install

# Set up environment variables
Copy-Item .env.example .env

# Edit .env with your API keys (use Notepad or your preferred editor)
notepad .env

# Initialize the database
bun run db:push

# Start development server
bun run dev
```

#### Using npm (Any Platform)

```bash
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Install dependencies
npm install

# Set up environment variables
# macOS/Linux:
cp .env.example .env
# Windows CMD:
copy .env.example .env
# Windows PowerShell:
Copy-Item .env.example .env

# Edit .env with your API keys

# Initialize the database
npm run db:push

# Start development server
npm run dev
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## 🐳 Docker Deployment

### Quick Start with Docker

The easiest way to run FraudGuard HK in production.

#### Prerequisites
- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose (included with Docker Desktop)

#### Run with Docker Compose

**macOS / Linux (Bash):**
```bash
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Create .env file from template
cp .env.example .env

# Edit .env with your API keys
nano .env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

**Windows CMD:**
```cmd
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Create .env file from template
copy .env.example .env

# Edit .env with your API keys
notepad .env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

**Windows PowerShell:**
```powershell
# Clone the repository
git clone https://github.com/Jendope/fraudguard-hk.git
cd fraudguard-hk

# Create .env file from template
Copy-Item .env.example .env

# Edit .env with your API keys
notepad .env

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Docker Commands Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start containers in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View live logs |
| `docker-compose restart` | Restart containers |
| `docker-compose build` | Rebuild images |
| `docker-compose ps` | List running containers |

### Build Docker Image Manually

```bash
# Build the image
docker build -t fraudguard-hk .

# Run the container
docker run -d \
  --name fraudguard-hk \
  -p 3000:3000 \
  --env-file .env \
  fraudguard-hk
```

**Windows CMD:**
```cmd
# Build the image
docker build -t fraudguard-hk .

# Run the container
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

**Windows PowerShell:**
```powershell
# Build the image
docker build -t fraudguard-hk .

# Run the container
docker run -d --name fraudguard-hk -p 3000:3000 --env-file .env fraudguard-hk
```

### Docker Environment Variables

You can override environment variables when running the container:

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

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ===========================================
# Database Configuration (Required)
# ===========================================
DATABASE_URL="file:./db/custom.db"

# ===========================================
# Supabase Configuration (Required for RAG)
# ===========================================
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your-supabase-anon-key"

# ===========================================
# AI Provider: DashScope (Alibaba Cloud)
# ===========================================
# Get your API key from: https://dashscope.console.aliyun.com/
# Recommended for: Cantonese support, Singapore servers
DASHSCOPE_API_KEY="your-dashscope-api-key"
DASHSCOPE_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# ===========================================
# AI Provider: BigModel (Zhipu AI)
# ===========================================
# Get your API key from: https://open.bigmodel.cn/
# Recommended for: China servers, AutoGLM-Phone
BIGMODEL_API_KEY="your-bigmodel-api-key"
BIGMODEL_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
```

### Required vs Optional

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ Yes | Local SQLite database |
| `NEXT_PUBLIC_SUPABASE_URL` | ⚠️ Recommended | Required for RAG scam detection |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ⚠️ Recommended | Required for RAG scam detection |
| `DASHSCOPE_API_KEY` | ⚠️ Recommended | Use DashScope OR BigModel |
| `BIGMODEL_API_KEY` | ⚠️ Optional | Alternative to DashScope |

### Getting API Keys

#### DashScope (Alibaba Cloud)
1. Visit [DashScope Console](https://dashscope.console.aliyun.com/)
2. Sign up / Log in with Alibaba Cloud account
3. Navigate to API Key Management
4. Create a new API key
5. Copy the key to your `.env` file

#### BigModel (Zhipu AI)
1. Visit [BigModel Platform](https://open.bigmodel.cn/)
2. Sign up / Log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### Supabase
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing
3. Go to Settings → API
4. Copy `URL` to `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon public` key to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

---

## 📁 Project Structure

```
fraudguard-hk/
├── android-app/                 # Android native app
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/fraudguard/hk/
│   │       │   ├── MainActivity.kt
│   │       │   └── AndroidBridge.kt
│   │       └── AndroidManifest.xml
│   └── README.md
│
├── data-collection/             # Scam data scraping scripts
│   ├── hk01_scraper.py
│   └── daily_update.py
│
├── db/                          # Database files
│   └── custom.db
│
├── prisma/                      # Database schema
│   └── schema.prisma
│
├── public/                      # Static assets
│   └── logo.svg
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API routes
│   │   │   ├── agent/           # AI agent endpoints
│   │   │   │   ├── asr/route.ts        # Speech recognition
│   │   │   │   ├── chat/route.ts       # Chat completion
│   │   │   │   ├── tts/route.ts        # Text-to-speech
│   │   │   │   ├── vision/route.ts     # Image analysis
│   │   │   │   ├── autoglm/route.ts    # Phone automation
│   │   │   │   ├── rag/route.ts        # RAG search
│   │   │   │   ├── intent/route.ts     # Intent classification
│   │   │   │   └── action/route.ts     # Action execution
│   │   │   ├── contacts/route.ts       # Contact management
│   │   │   └── family-alert/route.ts   # Family notifications
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── safeguard/           # Main app components
│   │   │   ├── elderly-mode.tsx       # Elderly UI
│   │   │   ├── default-mode.tsx       # Chat UI
│   │   │   ├── settings-dialog.tsx    # Settings
│   │   │   ├── emergency-contacts.tsx # Contact management
│   │   │   ├── language-selector.tsx  # Language switcher
│   │   │   └── family-alert-panel.tsx # Alert panel
│   │   └── ui/                  # shadcn/ui components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.ts
│   │   ├── use-toast.ts
│   │   └── use-android-bridge.ts
│   │
│   ├── lib/                     # Core libraries
│   │   ├── ai-client.ts         # AI service client
│   │   ├── agent-orchestrator.ts # Agent orchestration
│   │   ├── app-config.ts        # App configuration
│   │   ├── db.ts                # Database client
│   │   ├── i18n/                # Internationalization
│   │   │   ├── index.tsx
│   │   │   └── translations.ts
│   │   ├── mode-manager.ts      # UI mode management
│   │   └── utils.ts             # Utility functions
│   │
│   ├── utils/supabase/          # Supabase clients
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server client
│   │   ├── middleware.ts        # Auth middleware
│   │   └── session.ts           # Session management
│   │
│   └── proxy.ts                 # Next.js 16 middleware proxy
│
├── .env.example                 # Environment template
├── .dockerignore                # Docker ignore file
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 📖 API Documentation

### Chat Agent API

**POST** `/api/agent/chat`

Process text input and return scam analysis.

```typescript
// Request
{
  "message": "I received a call from someone claiming to be police...",
  "language": "zh-HK",
  "mode": "qwen" // or "glm"
}

// Response
{
  "success": true,
  "result": {
    "risk_level": "high",
    "scam_type": "phone_scam",
    "explanation": "This is a common police impersonation scam...",
    "recommendation": "Do not provide any personal information...",
    "voice_response": "https://..."
  }
}
```

### Speech Recognition API

**POST** `/api/agent/asr`

Convert speech to text.

```typescript
// Request (multipart/form-data)
{
  "audio": File, // WAV, MP3, M4A
  "language": "zh-HK" // zh-HK, zh-CN, en
}

// Response
{
  "success": true,
  "text": "有人打電話話我中獎...",
  "confidence": 0.95
}
```

### Image Analysis API

**POST** `/api/agent/vision`

Analyze image for scam content.

```typescript
// Request (multipart/form-data)
{
  "image": File, // PNG, JPG, WebP
  "language": "zh-HK"
}

// Response
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

### Text-to-Speech API

**POST** `/api/agent/tts`

Convert text to speech audio.

```typescript
// Request
{
  "text": "這是一個詐騙訊息，請小心...",
  "language": "zh-HK",
  "voice": "longxiaochun" // or other voice options
}

// Response
{
  "success": true,
  "audio_url": "data:audio/wav;base64,..."
}
```

### Contacts API

**GET** `/api/contacts`

Get all emergency contacts.

```typescript
// Response
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

Add a new contact.

```typescript
// Request
{
  "name": "兒子",
  "phone": "+85212345678",
  "priority": 1,
  "notify_on_alert": true
}
```

### Family Alert API

**POST** `/api/family-alert`

Send alert to emergency contacts.

```typescript
// Request
{
  "scam_type": "phone_scam",
  "risk_level": "high",
  "details": "User received suspicious call...",
  "contacts": ["contact_id_1", "contact_id_2"]
}

// Response
{
  "success": true,
  "sent_to": ["+85212345678", "+85298765432"],
  "channels": ["whatsapp", "sms"]
}
```

---

## 📱 Android App

### Features
- Native voice recognition (Cantonese, Mandarin, English)
- Direct phone calls and SMS
- One-tap WhatsApp/WeChat launch
- Emergency contact management
- Deep link integration with web app

### Build Instructions

1. **Open in Android Studio**
   ```bash
   cd android-app
   # Open this folder in Android Studio
   ```

2. **Configure server URL**

   Edit `app/src/main/java/com/fraudguard/hk/MainActivity.kt`:
   ```kotlin
   private const val SERVER_URL = "https://your-server.com"
   ```

3. **Build APK**
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Or use Gradle:
     ```bash
     # macOS/Linux
     ./gradlew assembleDebug
     
     # Windows CMD/PowerShell
     gradlew.bat assembleDebug
     ```

4. **Install on device**
   - Transfer APK to device and install
   - Or use ADB:
     ```bash
     adb install app/build/outputs/apk/debug/app-debug.apk
     ```

### Android Manifest Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CALL_PHONE" />
<uses-permission android:name="android.permission.SEND_SMS" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Set environment variables**
   - In Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.example`

### Render

1. **Create `render.yaml`** (already included in project)

2. **Connect to Render**
   - Go to render.com
   - Create new Web Service
   - Connect your GitHub repository
   - Render will detect `render.yaml`

### Docker (Production)

See [Docker Deployment](#-docker-deployment) section above.

### Manual Production Build

```bash
# Build for production
bun run build

# Start production server
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

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database |

### Code Style

- TypeScript strict mode enabled
- ESLint + Next.js recommended rules
- Prettier for formatting
- Prefer functional components with hooks
- Use `use client` directive for client components

### Adding New Languages

1. Edit `src/lib/i18n/translations.ts`
2. Add translations for new language:
   ```typescript
   export const translations = {
     'zh-HK': { ... },
     'zh-CN': { ... },
     'en': { ... },
     'new-lang': {
       // Add translations here
     }
   }
   ```
3. Update `LanguageSelector` component

### Adding New Scam Patterns

1. Add pattern to RAG database
2. Update `rag_core.py` for data collection
3. Test with sample messages

### Python Data Collection Setup

The project includes Python scripts for collecting scam data in the `data-collection/` directory.

#### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

#### Setup Virtual Environment

**macOS / Linux (Bash):**
```bash
# Navigate to data-collection directory
cd data-collection

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run scripts
python hk01_scraper.py
python daily_update.py

# Deactivate when done
deactivate
```

**Windows CMD:**
```cmd
# Navigate to data-collection directory
cd data-collection

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Run scripts
python hk01_scraper.py
python daily_update.py

# Deactivate when done
deactivate
```

**Windows PowerShell:**
```powershell
# Navigate to data-collection directory
cd data-collection

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run scripts
python hk01_scraper.py
python daily_update.py

# Deactivate when done
deactivate
```

#### Available Scripts

| Script | Description |
|--------|-------------|
| `hk01_scraper.py` | Scrape scam news from HK01 |
| `daily_update.py` | Daily database update script |

---

## 🔧 Troubleshooting

### Common Issues

#### "Missing X-Token header" error
- Ensure `DASHSCOPE_API_KEY` or `BIGMODEL_API_KEY` is set in `.env`
- Restart the development server after adding keys

#### Database errors
```bash
# Reset database
bun run db:reset

# Regenerate Prisma client
bun run db:generate
```

**Windows CMD:**
```cmd
bun run db:reset
bun run db:generate
```

#### Audio not playing
- Check browser permissions for audio
- Ensure TTS API is returning valid audio

#### Image upload fails
- Check file size (max 10MB)
- Ensure format is PNG, JPG, or WebP

#### Supabase connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check if Supabase project is active
- Verify API key is valid

#### Docker issues
```bash
# Rebuild Docker image
docker-compose build --no-cache

# View container logs
docker-compose logs -f

# Remove volumes and start fresh
docker-compose down -v
docker-compose up -d
```

### Debug Mode

Enable debug logging:
```env
DEBUG=true
NODE_ENV=development
```

### Getting Help

1. Check existing [Issues](https://github.com/Jendope/fraudguard-hk/issues)
2. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clear commit messages
- Add tests for new features
- Update documentation
- Follow existing code style

---

## 📞 Emergency Hotlines

| Service | Number | Hours |
|---------|--------|-------|
| **Hong Kong Police Anti-Deception Coordination Centre** | 18222 | 24/7 |
| **Hong Kong Police Emergency** | 999 | 24/7 |
| **Hong Kong Monetary Authority** | 2878 8196 | Office hours |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [DashScope](https://dashscope.aliyun.com/) - AI services
- [BigModel](https://open.bigmodel.cn/) - Alternative AI services
- [Supabase](https://supabase.com/) - Vector database
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- Hong Kong Police Force - Scam prevention resources

---

<p align="center">
  Made with ❤️ for Hong Kong's elderly community
</p>
