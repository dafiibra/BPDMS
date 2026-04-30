package tl.bmdl.livin

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.Executors

class CallStateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var telephonyManager: TelephonyManager? = null
    private var audioManager: AudioManager? = null
    private var phoneStateListener: PhoneStateListener? = null
    private var telephonyCallback: TelephonyCallback? = null
    private var isCellularOnCall = false
    private var lastEmittedState = "IDLE"

    private val handler = Handler(Looper.getMainLooper())
    private val voipPoller = object : Runnable {
        override fun run() {
            if (!isCellularOnCall) {
                val mode = audioManager?.mode ?: AudioManager.MODE_NORMAL
                val newState = when (mode) {
                    AudioManager.MODE_IN_COMMUNICATION -> "OFFHOOK"
                    else -> "IDLE"
                }
                if (newState != lastEmittedState) emitRaw(newState)
            }
            handler.postDelayed(this, 500)
        }
    }

    override fun getName(): String = "CallStateModule"

    @ReactMethod
    fun startListening() {
        audioManager = reactContext.getSystemService(AudioManager::class.java)

        // Start VoIP poller (no permission needed)
        handler.post(voipPoller)

        // Start cellular call listener (needs READ_PHONE_STATE)
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE)
            != PackageManager.PERMISSION_GRANTED) return

        telephonyManager = reactContext.getSystemService(TelephonyManager::class.java)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val callback = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
                override fun onCallStateChanged(state: Int) = handleCellularState(state)
            }
            telephonyCallback = callback
            telephonyManager?.registerTelephonyCallback(Executors.newSingleThreadExecutor(), callback)
        } else {
            val listener = object : PhoneStateListener() {
                @Suppress("OVERRIDE_DEPRECATION")
                override fun onCallStateChanged(state: Int, phoneNumber: String?) = handleCellularState(state)
            }
            phoneStateListener = listener
            @Suppress("DEPRECATION")
            telephonyManager?.listen(listener, PhoneStateListener.LISTEN_CALL_STATE)
        }
    }

    @ReactMethod
    fun stopListening() {
        handler.removeCallbacks(voipPoller)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            telephonyCallback?.let { telephonyManager?.unregisterTelephonyCallback(it) }
        } else {
            @Suppress("DEPRECATION")
            phoneStateListener?.let { telephonyManager?.listen(it, PhoneStateListener.LISTEN_NONE) }
        }
    }

    private fun handleCellularState(state: Int) {
        isCellularOnCall = state != TelephonyManager.CALL_STATE_IDLE
        val stateStr = when (state) {
            TelephonyManager.CALL_STATE_OFFHOOK -> "OFFHOOK"
            TelephonyManager.CALL_STATE_RINGING -> "RINGING"
            else -> "IDLE"
        }
        emitRaw(stateStr)
    }

    private fun emitRaw(state: String) {
        lastEmittedState = state
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("CallStateChanged", state)
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
