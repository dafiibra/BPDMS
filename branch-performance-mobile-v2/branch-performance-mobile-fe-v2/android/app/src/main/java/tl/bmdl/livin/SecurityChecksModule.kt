package tl.bmdl.livin

import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.hardware.display.DisplayManager
import android.provider.Settings
import android.text.TextUtils
import android.view.Display
import android.view.inputmethod.InputMethodManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SecurityChecksModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val allowedKeyboardPackages = setOf(
        "com.google.android.inputmethod.latin",
        "com.sec.android.inputmethod",
        "com.android.inputmethod.latin",
        "com.touchtype.swiftkey",
        "com.miui.inputmethod",
        "com.coloros.inputmethod",
        "com.bbk.inputmethod",
        "com.asus.ime",
        "com.sonyericsson.textinput.uxp",
        "com.lge.ime"
    )

    override fun getName(): String = "SecurityChecksModule"

    @ReactMethod
    fun isAccessibilityServiceEnabled(promise: Promise) {
        try {
            val enabled = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            )
            promise.resolve(!TextUtils.isEmpty(enabled))
        } catch (e: Exception) {
            promise.reject("ACCESSIBILITY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isDeveloperModeActive(promise: Promise) {
        try {
            val devMode = Settings.Global.getInt(
                reactContext.contentResolver,
                Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                0
            )
            promise.resolve(devMode != 0)
        } catch (e: Exception) {
            promise.reject("DEV_MODE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isMultipleDisplayActive(promise: Promise) {
        try {
            val dm = reactContext.getSystemService(Context.DISPLAY_SERVICE) as? DisplayManager
            if (dm == null) { promise.resolve(false); return }
            val activeCount = dm.displays.count { it.state == Display.STATE_ON }
            promise.resolve(activeCount > 1)
        } catch (e: Exception) {
            promise.reject("DISPLAY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isKeyboardNotAllowed(promise: Promise) {
        try {
            val imm = reactContext.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
            if (imm == null) { promise.resolve(true); return }

            val defaultId = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.DEFAULT_INPUT_METHOD
            ) ?: run { promise.resolve(true); return }

            val active = imm.enabledInputMethodList.firstOrNull { it.id == defaultId }
                ?: run { promise.resolve(true); return }

            val pkg = active.packageName
            val isSystem = (active.serviceInfo.applicationInfo.flags and
                    ApplicationInfo.FLAG_SYSTEM) != 0
            val isWhitelisted = allowedKeyboardPackages.contains(pkg)

            promise.resolve(!(isSystem || isWhitelisted))
        } catch (e: Exception) {
            promise.reject("KEYBOARD_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openDeveloperSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        reactContext.startActivity(intent)
    }
}
