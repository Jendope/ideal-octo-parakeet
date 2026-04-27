# FraudGuard HK Android App

[English](#english) | [繁體中文](#繁體中文) | [简体中文](#简体中文)

---

## 繁體中文

### 📱 Android 應用程式簡介

這是一個 Android WebView 應用程式，將 FraudGuard HK 網頁應用程式封裝為原生 Android 應用，並透過 JavaScript 橋接提供原生手機控制功能。

### ✨ 功能特色

#### 原生 Android 整合
- **語音識別**：使用 Android 內建語音識別，支援粵語、普通話、英語
- **文字轉語音**：原生 Android TTS，支援繁體中文
- **撥打電話**：直接撥打功能
- **發送簡訊**：發送和接收文字訊息
- **開啟應用程式**：透過名稱開啟已安裝的應用程式
- **聯絡人**：存取和搜尋手機聯絡人
- **網絡搜尋**：原生網絡搜尋整合
- **相機和相簿**：開啟相機和照片庫

#### 自主代理功能
應用程式整合了 AutoGLM-Phone 風格的自主操作：
- 語音指令可以觸發真實的手機操作
- 開啟應用程式、撥打電話、發送訊息
- 情境感知詐騙偵測

### 🔧 建置應用程式

#### 前置需求
- Android Studio Hedgehog (2023.1.1) 或更新版本
- Android SDK 34
- JDK 17
- Gradle 8.2

#### 建置步驟

1. **在 Android Studio 中開啟**
   ```bash
   cd android-app
   # 在 Android Studio 中開啟此資料夾
   ```

2. **設定伺服器 URL**
   
   編輯 `app/src/main/java/com/fraudguard/hk/MainActivity.kt`：
   ```kotlin
   private val WEBAPP_URL = "http://YOUR_SERVER_IP:3000"
   ```
   
   選項：
   - **Android 模擬器**：使用 `http://10.0.2.2:3000`（指向主機）
   - **真實設備**：使用電腦的 IP 地址（例如 `http://192.168.1.100:3000`）
   - **生產環境**：使用已部署的伺服器 URL

3. **建置 APK**
   ```bash
   ./gradlew assembleDebug
   ```
   
   或在 Android Studio：Build > Build Bundle(s) / APK(s) > Build APK(s)

4. **安裝到設備**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### 📦 專案結構

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/fraudguard/hk/
│   │   │   ├── MainActivity.kt        # 主要 Activity 與 WebView
│   │   │   └── AndroidBridge.kt       # JavaScript 介面
│   │   ├── res/
│   │   │   ├── layout/                # UI 佈局
│   │   │   ├── values/                # 字串、顏色、樣式
│   │   │   └── xml/                   # 網絡安全設定
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── README.md
```

### 🎤 JavaScript 橋接 API

在 Android 應用程式中執行時，JavaScript 可使用 `AndroidBridge` 物件：

```javascript
// 檢查是否在 Android 中執行
if (window.AndroidBridge) {
  // 語音識別（支援三種語言）
  AndroidBridge.startVoiceRecognition('callbackFunctionName');
  
  // 文字轉語音
  AndroidBridge.speak('你好世界');
  
  // 開啟應用程式
  AndroidBridge.openApp('whatsapp');
  AndroidBridge.openApp('com.tencent.mm'); // WeChat
  
  // 電話功能
  AndroidBridge.makeCall('+85212345678');
  AndroidBridge.sendSMS('+85212345678', 'Hello');
  
  // 網絡搜尋
  AndroidBridge.searchWeb('香港詐騙新聞');
  
  // 自主操作
  AndroidBridge.executeAutonomousAction(JSON.stringify({
    type: 'open_app',
    app_name: 'whatsapp'
  }));
}
```

### 可用方法

| 方法 | 說明 |
|------|------|
| `isAndroid()` | 返回 `true` |
| `speak(text)` | 文字轉語音 |
| `startVoiceRecognition(callback)` | 啟動語音識別 |
| `makeCall(phoneNumber)` | 撥打電話 |
| `sendSMS(phoneNumber, message)` | 發送簡訊 |
| `openApp(appName)` | 透過名稱或包名開啟應用程式 |
| `isAppInstalled(packageName)` | 檢查應用程式是否已安裝 |
| `pickContact(callback)` | 開啟聯絡人選擇器 |
| `searchContacts(query)` | 搜尋聯絡人 |
| `searchWeb(query)` | 網絡搜尋 |
| `openUrl(url)` | 在瀏覽器中開啟 URL |
| `setAlarm(hour, minute, message)` | 設定鬧鐘 |
| `openCamera()` | 開啟相機應用程式 |
| `openGallery()` | 開啟照片庫 |
| `executeAutonomousAction(json)` | 執行自主操作 |

### 支援的應用程式名稱（中英文）

| 應用程式名稱 | 包名 | 說明 |
|--------------|------|------|
| whatsapp | com.whatsapp | WhatsApp 通訊 |
| wechat, 微信, weixin | com.tencent.mm | WeChat/微信 |
| telegram | org.telegram.messenger | Telegram |
| phone, dialer, 電話 | com.android.dialer | **電話 App（數字鍵盤）** |
| messages, sms, 簡訊, 訊息 | com.google.android.apps.messaging | **簡訊 App** |
| contacts, 聯絡人 | com.android.contacts | **聯絡人 App** |
| facebook | com.facebook.katana | Facebook |
| messenger | com.facebook.orca | Facebook Messenger |
| instagram | com.instagram | Instagram |
| youtube | com.google.android.youtube | YouTube |
| maps, 地圖 | com.google.android.apps.maps | Google 地圖 |
| gmail, email | com.google.android.gm | Gmail |
| settings, 設定 | com.android.settings | 系統設定 |
| camera, 相機 | com.android.camera | 相機 |
| clock, 時鐘, alarm | com.android.deskclock | 時鐘/鬧鐘 |
| calendar, 日曆 | com.google.android.calendar | 日曆 |
| calculator, 計算機 | com.android.calculator2 | 計算機 |

### 🔒 權限

應用程式需要以下權限：
- `INTERNET` - 載入網頁內容
- `RECORD_AUDIO` - 語音識別
- `CALL_PHONE` - 撥打電話
- `SEND_SMS` - 發送簡訊
- `READ_CONTACTS` - 存取聯絡人
- `CAMERA` - 開啟相機
- `READ/WRITE_EXTERNAL_STORAGE` - 照片存取

### 🔌 AutoGLM-Phone 整合

應用程式設計為可與 AutoGLM-Phone 配合使用，實現自主手機控制。Python 實現在 `/autoglm_phone.py`。

#### 運作方式

1. 使用者以粵語說出指令
2. Android 的語音識別進行轉錄
3. 網頁應用程式將文字發送到意圖解析 API
4. AI 判斷操作類型（開啟應用程式、撥打電話等）
5. JavaScript 橋接透過 Android 原生 API 執行操作
6. TTS 向使用者確認操作

### 語音指令範例

| 粵語 | 操作 |
|------|------|
| "打開 WhatsApp" | 開啟 WhatsApp |
| "打開微信" | 開啟 WeChat |
| "打開電話" | 開啟電話 App（數字鍵盤） |
| "打開簡訊" | 開啟簡訊 App |
| "打開聯絡人" | 開啟聯絡人 App |
| "打俾媽咪" | 撥打電話給媽咪（如果在聯絡人中） |
| "幫我檢查呢個訊息" | 分析訊息是否有詐騙 |
| "搵下呢個電話號碼" | 在網上搜尋電話號碼 |
| "呢個係咪詐騙？" | 檢查是否有詐騙 |

### 除錯

#### WebView 除錯

在 MainActivity.kt 中，已啟用 WebView 除錯：
```kotlin
WebView.setWebContentsDebuggingEnabled(true)
```

您可以在 Chrome 中除錯 WebView：
1. 在 Chrome 中開啟 `chrome://inspect`
2. 找到您的 WebView
3. 點擊「inspect」

#### 日誌

查看日誌：
```bash
adb logcat | grep -E "(FraudGuard|AndroidBridge|WebView)"
```

---

## 简体中文

### 📱 Android 应用程序简介

这是一个 Android WebView 应用程序，将 FraudGuard HK 网页应用程序封装为原生 Android 应用，并通过 JavaScript 桥接提供原生手机控制功能。

### ✨ 功能特色

#### 原生 Android 整合
- **语音识别**：使用 Android 内置语音识别，支持粤语、普通话、英语
- **文字转语音**：原生 Android TTS，支持繁体中文
- **拨打电话**：直接拨打功能
- **发送短信**：发送和接收文字消息
- **开启应用程序**：通过名称开启已安装的应用程序
- **联系人**：访问和搜索手机联系人
- **网络搜索**：原生网络搜索整合
- **相机和相册**：开启相机和照片库

#### 自主代理功能
应用程序整合了 AutoGLM-Phone 风格的自主操作：
- 语音指令可以触发真实的手机操作
- 开启应用程序、拨打电话、发送消息
- 情境感知诈骗检测

### 🔧 建置应用程序

#### 前置需求
- Android Studio Hedgehog (2023.1.1) 或更新版本
- Android SDK 34
- JDK 17
- Gradle 8.2

#### 建置步骤

1. **在 Android Studio 中开启**
   ```bash
   cd android-app
   # 在 Android Studio 中开启此文件夹
   ```

2. **设定服务器 URL**
   
   编辑 `app/src/main/java/com/fraudguard/hk/MainActivity.kt`：
   ```kotlin
   private val WEBAPP_URL = "http://YOUR_SERVER_IP:3000"
   ```

3. **建置 APK**
   ```bash
   ./gradlew assembleDebug
   ```

4. **安装到设备**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### 🎤 JavaScript 桥接 API

在 Android 应用程序中执行时，JavaScript 可使用 `AndroidBridge` 对象：

```javascript
if (window.AndroidBridge) {
  // 语音识别
  AndroidBridge.startVoiceRecognition('callbackFunctionName');
  
  // 文字转语音
  AndroidBridge.speak('你好世界');
  
  // 开启应用程序
  AndroidBridge.openApp('whatsapp');
  
  // 电话功能
  AndroidBridge.makeCall('+85212345678');
  AndroidBridge.sendSMS('+85212345678', 'Hello');
}
```

### 語音指令範例

| 普通話 | 操作 |
|--------|------|
| "打开 WhatsApp" | 开启 WhatsApp |
| "打开微信" | 开启 WeChat |
| "打开电话" | 开启电话 App（数字键盘） |
| "打开短信" | 开启短信 App |
| "打开联系人" | 开启联系人 App |
| "打电话给妈妈" | 拨打电话给妈妈 |
| "帮我检查这个消息" | 分析消息是否有诈骗 |
| "搜索这个电话号码" | 在网上搜索电话号码 |
| "这个是不是诈骗？" | 检查是否有诈骗 |

---

## English

### 📱 Android App Overview

This is an Android WebView application that wraps the FraudGuard HK web application and provides native phone control capabilities through a JavaScript bridge.

### ✨ Features

#### Native Android Integration
- **Voice Recognition**: Uses Android's built-in speech recognition for Cantonese, Mandarin, and English
- **Text-to-Speech**: Native Android TTS with Traditional Chinese support
- **Phone Calls**: Direct calling capability
- **SMS**: Send and receive text messages
- **App Launching**: Open installed apps by name
- **Contacts**: Access and search phone contacts
- **Web Search**: Native web search integration
- **Camera & Gallery**: Open camera and photo gallery

#### Autonomous Agent
The app integrates with AutoGLM-Phone style autonomous actions:
- Voice commands can trigger real phone actions
- Open apps, make calls, send messages via voice
- Context-aware scam detection

### 🔧 Building the App

#### Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- Android SDK 34
- JDK 17
- Gradle 8.2

#### Build Steps

1. **Open in Android Studio**
   ```bash
   cd android-app
   # Open this folder in Android Studio
   ```

2. **Configure Server URL**
   
   Edit `app/src/main/java/com/fraudguard/hk/MainActivity.kt`:
   ```kotlin
   private val WEBAPP_URL = "http://YOUR_SERVER_IP:3000"
   ```
   
   Options:
   - **Android Emulator**: Use `http://10.0.2.2:3000` (points to host machine)
   - **Real Device**: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)
   - **Production**: Use your deployed server URL

3. **Build APK**
   ```bash
   ./gradlew assembleDebug
   ```
   
   Or in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)

4. **Install on Device**
   ```bash
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

### 🎤 JavaScript Bridge API

The `AndroidBridge` object is available in JavaScript when running inside the Android app:

```javascript
if (window.AndroidBridge) {
  // Voice recognition (supports 3 languages)
  AndroidBridge.startVoiceRecognition('callbackFunctionName');
  
  // Text-to-speech
  AndroidBridge.speak('Hello World');
  
  // Open app
  AndroidBridge.openApp('whatsapp');
  
  // Phone functions
  AndroidBridge.makeCall('+85212345678');
  AndroidBridge.sendSMS('+85212345678', 'Hello');
}
```

### Voice Command Examples

| English | Action |
|---------|--------|
| "Open WhatsApp" | Opens WhatsApp |
| "Open WeChat" | Opens WeChat |
| "Open Phone" | Opens Phone app (dialer keypad) |
| "Open Messages" | Opens Messages/SMS app |
| "Open Contacts" | Opens Contacts app |
| "Call Mom" | Calls Mom (if in contacts) |
| "Check this message for scams" | Analyzes message for fraud |
| "Search this phone number" | Searches phone number online |
| "Is this a scam?" | Checks for fraud |

### 🔒 Permissions

The app requests the following permissions:
- `INTERNET` - Load web content
- `RECORD_AUDIO` - Voice recognition
- `CALL_PHONE` - Make phone calls
- `SEND_SMS` - Send text messages
- `READ_CONTACTS` - Access contacts
- `CAMERA` - Open camera
- `READ/WRITE_EXTERNAL_STORAGE` - Photo access

### Debugging

#### WebView Debugging

In MainActivity.kt, WebView debugging is enabled:
```kotlin
WebView.setWebContentsDebuggingEnabled(true)
```

You can debug the WebView in Chrome:
1. Open `chrome://inspect` in Chrome
2. Find your WebView
3. Click "inspect"

#### Logs

View logs:
```bash
adb logcat | grep -E "(FraudGuard|AndroidBridge|WebView)"
```

## License

MIT License - See main project LICENSE file.
