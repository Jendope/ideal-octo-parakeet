package com.fraudguard.hk

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.ContactsContract
import android.speech.tts.TextToSpeech
import android.view.View
import android.view.WindowManager
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.util.Locale

/**
 * FraudGuard HK - Android WebView App
 * 
 * This app wraps the FraudGuard HK web application in a WebView
 * and provides native Android functionality through a JavaScript bridge.
 * 
 * Features:
 * - Voice recognition and TTS
 * - Phone calls and SMS
 * - App launching
 * - Contact access
 * - Screenshot capture for AutoGLM analysis
 */
class MainActivity : AppCompatActivity(), TextToSpeech.OnInitListener {

    private lateinit var webView: WebView
    private lateinit var androidBridge: AndroidBridge
    private var tts: TextToSpeech? = null
    private var isTTSEnabled = false

    // Server URL - change to your server address
    // For local testing: http://10.0.2.2:3000 (Android emulator)
    // For real device: http://YOUR_IP:3000
    private val WEBAPP_URL = "http://10.104.52.104:3000"  // Change this to your server

    // Permissions needed
    private val PERMISSIONS = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.SEND_SMS,
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.CAMERA
    )
    private val PERMISSION_REQUEST_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Full screen mode
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        )
        
        // Keep screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Create layout
        val layout = FrameLayout(this)
        layout.layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )

        // Create WebView
        webView = WebView(this)
        webView.layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )
        layout.addView(webView)
        setContentView(layout)

        // Initialize TTS
        tts = TextToSpeech(this, this)

        // Initialize bridge
        androidBridge = AndroidBridge(this, webView, tts)

        // Setup WebView
        setupWebView()

        // Request permissions
        requestPermissions()

        // Load web app
        webView.loadUrl(WEBAPP_URL)
    }

    private fun setupWebView() {
        webView.settings.apply {
            // Enable JavaScript
            javaScriptEnabled = true
            
            // Enable DOM storage
            domStorageEnabled = true
            
            // Enable database
            databaseEnabled = true
            
            // Enable file access
            allowFileAccess = true
            allowContentAccess = true
            
            // Enable zoom controls
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            
            // Cache settings
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // Mixed content for HTTP/HTTPS
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
            
            // User agent
            userAgentString = "$userAgentString FraudGuardHK/1.0 Android"
        }

        // Add JavaScript interface
        webView.addJavascriptInterface(androidBridge, "AndroidBridge")

        // Enable debugging
        WebView.setWebContentsDebuggingEnabled(true)

        // WebViewClient for page navigation
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                
                // Inject detection script
                webView.evaluateJavascript("""
                    window.isAndroidApp = true;
                    window.AndroidBridge = AndroidBridge;
                    console.log('AndroidBridge injected successfully');
                    
                    // Notify the web app that Android bridge is ready
                    if (typeof onAndroidBridgeReady === 'function') {
                        onAndroidBridgeReady();
                    }
                """.trimIndent(), null)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                // Handle external URLs
                if (url != null && !url.startsWith(WEBAPP_URL)) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                }
                return false
            }
        }

        // WebChromeClient for JS dialogs and console
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: android.webkit.ConsoleMessage?): Boolean {
                message?.let {
                    android.util.Log.d("WebView", "${it.message()} -- From line ${it.lineNumber()} of ${it.sourceId()}")
                }
                return true
            }
        }
    }

    private fun requestPermissions() {
        val permissionsToRequest = PERMISSIONS.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()

        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest, PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val denied = permissions.filterIndexed { index, _ ->
                grantResults.getOrNull(index) != PackageManager.PERMISSION_GRANTED
            }
            
            if (denied.isNotEmpty()) {
                Toast.makeText(
                    this,
                    "Some features may not work without permissions",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts?.setLanguage(Locale.TRADITIONAL_CHINESE)
            isTTSEnabled = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED
            
            if (isTTSEnabled) {
                android.util.Log.d("FraudGuard", "TTS initialized for Traditional Chinese")
            } else {
                // Fallback to English
                tts?.setLanguage(Locale.US)
                isTTSEnabled = true
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        super.onDestroy()
    }

    // Handle activity results for voice recognition, contacts, etc.
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        when (requestCode) {
            AndroidBridge.REQUEST_VOICE_RECOGNITION -> {
                if (resultCode == RESULT_OK && data != null) {
                    val matches = data.getStringArrayListExtra("android.speech.extra.RESULTS")
                    matches?.firstOrNull()?.let { text ->
                        androidBridge.onVoiceResult(text)
                    }
                }
            }
            AndroidBridge.REQUEST_CONTACT_PICK -> {
                if (resultCode == RESULT_OK && data != null) {
                    val contactUri = data.data
                    contactUri?.let { uri ->
                        val cursor = contentResolver.query(uri, null, null, null, null)
                        cursor?.use {
                            if (it.moveToFirst()) {
                                val nameIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
                                val numberIndex = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
                                val name = it.getString(nameIndex)
                                val number = it.getString(numberIndex)
                                androidBridge.onContactResult(name, number)
                            }
                        }
                    }
                }
            }
        }
    }
}



