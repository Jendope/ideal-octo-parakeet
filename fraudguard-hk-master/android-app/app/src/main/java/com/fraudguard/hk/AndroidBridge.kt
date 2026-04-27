package com.fraudguard.hk

import android.Manifest
import android.app.SearchManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.AlarmClock
import android.provider.CalendarContract
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Settings
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import android.telephony.SmsManager
import android.util.Log
import android.webkit.WebView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.util.Locale

/**
 * AndroidBridge - JavaScript Interface for Native Android Functions
 * 
 * This class exposes Android native functionality to the WebView through JavaScript.
 * All methods annotated with @JavascriptInterface can be called from JavaScript.
 * 
 * Usage in JavaScript:
 *   AndroidBridge.makeCall('+85212345678')
 *   AndroidBridge.sendSMS('+85212345678', 'Hello')
 *   AndroidBridge.openApp('whatsapp')
 *   AndroidBridge.speak('您好')
 */
class AndroidBridge(
    private val context: Context,
    private val webView: WebView,
    private val tts: TextToSpeech?
) {
    companion object {
        const val REQUEST_VOICE_RECOGNITION = 1001
        const val REQUEST_CONTACT_PICK = 1002
        const val REQUEST_IMAGE_CAPTURE = 1003
        
        private const val TAG = "AndroidBridge"
        
        // App package names
        val APP_PACKAGES = mapOf(
            // Communication apps
            "whatsapp" to "com.whatsapp",
            "wechat" to "com.tencent.mm",
            "weixin" to "com.tencent.mm",
            "微信" to "com.tencent.mm",
            "telegram" to "org.telegram.messenger",
            "facebook" to "com.facebook.katana",
            "messenger" to "com.facebook.orca",
            "instagram" to "com.instagram",
            "twitter" to "com.twitter.android",
            "x" to "com.twitter.android",
            // Phone & SMS
            "phone" to "com.android.dialer",
            "dialer" to "com.android.dialer",
            "電話" to "com.android.dialer",
            "messages" to "com.google.android.apps.messaging",
            "sms" to "com.google.android.apps.messaging",
            "簡訊" to "com.google.android.apps.messaging",
            "訊息" to "com.google.android.apps.messaging",
            "短信" to "com.google.android.apps.messaging",
            "contacts" to "com.android.contacts",
            "聯絡人" to "com.android.contacts",
            "联系人" to "com.android.contacts",
            // Google apps
            "youtube" to "com.google.android.youtube",
            "maps" to "com.google.android.apps.maps",
            "地圖" to "com.google.android.apps.maps",
            "google" to "com.google.android.googlequicksearchbox",
            "chrome" to "com.android.chrome",
            "gmail" to "com.google.android.gm",
            "email" to "com.google.android.gm",
            // System apps
            "settings" to "com.android.settings",
            "設定" to "com.android.settings",
            "设置" to "com.android.settings",
            "camera" to "com.android.camera",
            "相機" to "com.android.camera",
            "相机" to "com.android.camera",
            "photos" to "com.google.android.apps.photos",
            "gallery" to "com.android.gallery3d",
            "相簿" to "com.google.android.apps.photos",
            "相册" to "com.google.android.apps.photos",
            "clock" to "com.android.deskclock",
            "時鐘" to "com.android.deskclock",
            "时钟" to "com.android.deskclock",
            "alarm" to "com.android.deskclock",
            "calendar" to "com.google.android.calendar",
            "日曆" to "com.google.android.calendar",
            "日历" to "com.google.android.calendar",
            "calculator" to "com.android.calculator2",
            "計算機" to "com.android.calculator2",
            "计算器" to "com.android.calculator2",
            "weather" to "com.google.android.apps.weather",
            "天氣" to "com.google.android.apps.weather",
            "天气" to "com.google.android.apps.weather",
            "notes" to "com.google.android.keep",
            "備忘錄" to "com.google.android.keep",
            "备忘录" to "com.google.android.keep"
        )
    }
    
    private var voiceRecognitionCallback: String? = null
    private var contactPickCallback: String? = null

    // ==================== Core Functions ====================
    
    /**
     * Check if running in Android WebView
     */
    @android.webkit.JavascriptInterface
    fun isAndroid(): Boolean = true
    
    /**
     * Check if a specific permission is granted
     */
    @android.webkit.JavascriptInterface
    fun hasPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }
    
    /**
     * Show a toast message
     */
    @android.webkit.JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    // ==================== Voice Recognition ====================
    
    /**
     * Start voice recognition
     * Results are sent back via JavaScript callback
     */
    @android.webkit.JavascriptInterface
    fun startVoiceRecognition(callback: String = "onVoiceResult") {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "zh-HK")  // Traditional Chinese
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "zh-HK")
            putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, false)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "請說話...")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        
        voiceRecognitionCallback = callback
        
        try {
            (context as MainActivity).startActivityForResult(intent, REQUEST_VOICE_RECOGNITION)
        } catch (e: ActivityNotFoundException) {
            Log.e(TAG, "Voice recognition not available", e)
            callJsFunction("console.error('Voice recognition not available')")
            showToast("此設備不支援語音識別")
        }
    }
    
    /**
     * Called when voice recognition returns a result
     */
    fun onVoiceResult(text: String) {
        voiceRecognitionCallback?.let { callback ->
            callJsFunction("$callback('$text')")
        }
    }

    // ==================== Text-to-Speech ====================
    
    /**
     * Speak text using TTS
     */
    @android.webkit.JavascriptInterface
    fun speak(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_ADD, null, "tts_utterance")
    }
    
    /**
     * Stop TTS
     */
    @android.webkit.JavascriptInterface
    fun stopSpeaking() {
        tts?.stop()
    }

    // ==================== Phone Functions ====================
    
    /**
     * Make a phone call
     */
    @android.webkit.JavascriptInterface
    fun makeCall(phoneNumber: String): Boolean {
        return try {
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.CALL_PHONE) 
                != PackageManager.PERMISSION_GRANTED) {
                showToast("沒有通話權限")
                requestPermission(Manifest.permission.CALL_PHONE)
                return false
            }
            
            val intent = Intent(Intent.ACTION_CALL).apply {
                data = Uri.parse("tel:$phoneNumber")
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to make call", e)
            showToast("無法撥打電話: ${e.message}")
            false
        }
    }
    
    /**
     * Open dialer with number
     */
    @android.webkit.JavascriptInterface
    fun openDialer(phoneNumber: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_DIAL).apply {
                data = Uri.parse("tel:$phoneNumber")
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open dialer", e)
            false
        }
    }
    
    /**
     * Send SMS
     */
    @android.webkit.JavascriptInterface
    fun sendSMS(phoneNumber: String, message: String): Boolean {
        return try {
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS)
                != PackageManager.PERMISSION_GRANTED) {
                showToast("沒有發送簡訊權限")
                requestPermission(Manifest.permission.SEND_SMS)
                return false
            }
            
            val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                context.getSystemService(android.telephony.SmsManager::class.java)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }
            
            smsManager.sendTextMessage(phoneNumber, null, message, null, null)
            showToast("簡訊已發送")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send SMS", e)
            showToast("發送簡訊失敗: ${e.message}")
            false
        }
    }
    
    /**
     * Open SMS app with pre-filled message
     */
    @android.webkit.JavascriptInterface
    fun openSMS(phoneNumber: String, message: String = ""): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("smsto:$phoneNumber")
                putExtra("sms_body", message)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open SMS", e)
            false
        }
    }

    // ==================== App Management ====================
    
    /**
     * Open an app by name or package
     */
    @android.webkit.JavascriptInterface
    fun openApp(appNameOrPackage: String): Boolean {
        // Check if it's a known app name
        val packageName = APP_PACKAGES[appNameOrPackage.lowercase(Locale.getDefault())]
            ?: appNameOrPackage
        
        return try {
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                context.startActivity(intent)
                showToast("正在打開 $appNameOrPackage")
                true
            } else {
                // Try to open in Play Store
                openPlayStore(packageName)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open app: $packageName", e)
            // Try Play Store as fallback
            openPlayStore(packageName)
        }
    }
    
    /**
     * Open Play Store for an app
     */
    private fun openPlayStore(packageName: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("market://details?id=$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            showToast("正在打開 Play Store")
            true
        } catch (e: ActivityNotFoundException) {
            // No Play Store, open browser
            val intent = Intent(Intent.ACTION_VIEW).apply {
                data = Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open Play Store", e)
            false
        }
    }
    
    /**
     * Check if an app is installed
     */
    @android.webkit.JavascriptInterface
    fun isAppInstalled(packageName: String): Boolean {
        return try {
            context.packageManager.getPackageInfo(packageName, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    // ==================== Contacts ====================
    
    /**
     * Open contact picker
     */
    @android.webkit.JavascriptInterface
    fun pickContact(callback: String = "onContactPicked") {
        val intent = Intent(Intent.ACTION_PICK).apply {
            type = ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE
        }
        contactPickCallback = callback
        (context as MainActivity).startActivityForResult(intent, REQUEST_CONTACT_PICK)
    }
    
    /**
     * Called when contact is picked
     */
    fun onContactResult(name: String, number: String) {
        contactPickCallback?.let { callback ->
            val json = JSONObject().apply {
                put("name", name)
                put("number", number)
            }
            callJsFunction("$callback('$json')")
        }
    }
    
    /**
     * Search contacts by name
     */
    @android.webkit.JavascriptInterface
    fun searchContacts(query: String): String {
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS)
            != PackageManager.PERMISSION_GRANTED) {
            return "[]"
        }
        
        val contacts = mutableListOf<JSONObject>()
        
        val cursor = context.contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            arrayOf(
                ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
                ContactsContract.CommonDataKinds.Phone.NUMBER
            ),
            "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} LIKE ?",
            arrayOf("%$query%"),
            null
        )
        
        cursor?.use {
            while (it.moveToNext()) {
                val name = it.getString(0)
                val number = it.getString(1)
                contacts.add(JSONObject().apply {
                    put("name", name)
                    put("number", number)
                })
            }
        }
        
        return contacts.toString()
    }

    // ==================== Web Search ====================
    
    /**
     * Search the web
     */
    @android.webkit.JavascriptInterface
    fun searchWeb(query: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_WEB_SEARCH).apply {
                putExtra(SearchManager.QUERY, query)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            // Fallback to browser
            try {
                val intent = Intent(Intent.ACTION_VIEW).apply {
                    data = Uri.parse("https://www.google.com/search?q=${Uri.encode(query)}")
                }
                context.startActivity(intent)
                true
            } catch (e2: Exception) {
                Log.e(TAG, "Failed to search web", e2)
                false
            }
        }
    }
    
    /**
     * Open URL in browser
     */
    @android.webkit.JavascriptInterface
    fun openUrl(url: String): Boolean {
        return try {
            var finalUrl = url
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                finalUrl = "https://$url"
            }
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(finalUrl))
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open URL", e)
            false
        }
    }

    // ==================== Alarms & Calendar ====================
    
    /**
     * Set an alarm
     */
    @android.webkit.JavascriptInterface
    fun setAlarm(hour: Int, minute: Int, message: String = ""): Boolean {
        return try {
            val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                putExtra(AlarmClock.EXTRA_HOUR, hour)
                putExtra(AlarmClock.EXTRA_MINUTES, minute)
                if (message.isNotEmpty()) {
                    putExtra(AlarmClock.EXTRA_MESSAGE, message)
                }
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to set alarm", e)
            false
        }
    }
    
    /**
     * Add calendar event
     */
    @android.webkit.JavascriptInterface
    fun addCalendarEvent(title: String, description: String = "", beginTime: Long = 0): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_INSERT).apply {
                data = CalendarContract.Events.CONTENT_URI
                putExtra(CalendarContract.Events.TITLE, title)
                if (description.isNotEmpty()) {
                    putExtra(CalendarContract.Events.DESCRIPTION, description)
                }
                if (beginTime > 0) {
                    putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, beginTime)
                }
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to add calendar event", e)
            false
        }
    }

    // ==================== Camera & Gallery ====================
    
    /**
     * Open camera
     */
    @android.webkit.JavascriptInterface
    fun openCamera(): Boolean {
        return try {
            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open camera", e)
            false
        }
    }
    
    /**
     * Open gallery
     */
    @android.webkit.JavascriptInterface
    fun openGallery(): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, "image/*")
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open gallery", e)
            false
        }
    }

    // ==================== Settings ====================
    
    /**
     * Open device settings
     */
    @android.webkit.JavascriptInterface
    fun openSettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_SETTINGS)
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open settings", e)
            false
        }
    }
    
    /**
     * Open app settings
     */
    @android.webkit.JavascriptInterface
    fun openAppSettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", context.packageName, null)
            }
            context.startActivity(intent)
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to open app settings", e)
            false
        }
    }

    // ==================== Scam Prevention ====================
    
    /**
     * Report a scam number - add to local blocklist
     */
    @android.webkit.JavascriptInterface
    fun blockNumber(phoneNumber: String): Boolean {
        // This would integrate with Android's Call Screening service
        // For now, just show a confirmation
        showToast("已標記為詐騙號碼: $phoneNumber")
        return true
    }
    
    /**
     * Check if number is suspicious (mock implementation)
     */
    @android.webkit.JavascriptInterface
    fun checkSuspiciousNumber(phoneNumber: String): String {
        // This would call the backend API
        val json = JSONObject().apply {
            put("number", phoneNumber)
            put("isSuspicious", false)
            put("reason", "需要網絡驗證")
            put("source", "local_check")
        }
        return json.toString()
    }

    // ==================== AutoGLM Integration ====================
    
    /**
     * Execute autonomous action parsed from voice command
     */
    @android.webkit.JavascriptInterface
    fun executeAutonomousAction(actionJson: String): String {
        return try {
            val action = JSONObject(actionJson)
            val type = action.optString("type", "none")
            
            val result = when (type) {
                "open_app" -> {
                    val appName = action.optString("app_name", "")
                    openApp(appName)
                }
                "make_call" -> {
                    val number = action.optString("phone_number", "")
                    if (number.isNotEmpty()) makeCall(number) else false
                }
                "send_message" -> {
                    val number = action.optString("phone_number", "")
                    val message = action.optString("message", "")
                    if (number.isNotEmpty() && message.isNotEmpty()) {
                        sendSMS(number, message)
                    } else false
                }
                "search_web" -> {
                    val query = action.optString("query", "")
                    if (query.isNotEmpty()) searchWeb(query) else false
                }
                "set_alarm" -> {
                    val hour = action.optInt("hour", 8)
                    val minute = action.optInt("minute", 0)
                    val message = action.optString("message", "")
                    setAlarm(hour, minute, message)
                }
                "speak" -> {
                    val text = action.optString("text", "")
                    if (text.isNotEmpty()) {
                        speak(text)
                        true
                    } else false
                }
                else -> {
                    Log.d(TAG, "Unknown action type: $type")
                    false
                }
            }
            
            JSONObject().apply {
                put("success", result)
                put("action", type)
            }.toString()
            
        } catch (e: Exception) {
            Log.e(TAG, "Failed to execute autonomous action", e)
            JSONObject().apply {
                put("success", false)
                put("error", e.message)
            }.toString()
        }
    }

    // ==================== Utility ====================
    
    private fun requestPermission(permission: String) {
        ActivityCompat.requestPermissions(
            context as MainActivity,
            arrayOf(permission),
            1001
        )
    }
    
    private fun callJsFunction(jsCode: String) {
        (context as MainActivity).runOnUiThread {
            webView.evaluateJavascript(jsCode, null)
        }
    }
    
    /**
     * Get device info
     */
    @android.webkit.JavascriptInterface
    fun getDeviceInfo(): String {
        return JSONObject().apply {
            put("manufacturer", Build.MANUFACTURER)
            put("model", Build.MODEL)
            put("androidVersion", Build.VERSION.RELEASE)
            put("sdkVersion", Build.VERSION.SDK_INT)
            put("packageName", context.packageName)
        }.toString()
    }
}
