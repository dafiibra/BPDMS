package tl.bmdl.livin

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class VpnDetectorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var vpnCallback: ConnectivityManager.NetworkCallback? = null

    override fun getName(): String = "VpnDetectorModule"

    @ReactMethod
    fun checkIsVpnActive(promise: Promise) {
        try {
            promise.resolve(isVpnActive())
        } catch (e: Exception) {
            promise.reject("VPN_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun checkIsProxyActive(promise: Promise) {
        try {
            val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            val proxy = cm?.defaultProxy
            promise.resolve(proxy != null && proxy.host.isNullOrEmpty().not())
        } catch (e: Exception) {
            promise.reject("PROXY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun startListening() {
        val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        if (vpnCallback != null) return

        vpnCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) = emitState()
            override fun onLost(network: Network) = emitState()
            override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) = emitState()
        }
        vpnCallback?.let { cm.registerDefaultNetworkCallback(it) }
        emitState()
    }

    @ReactMethod
    fun stopListening() {
        val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return
        vpnCallback?.let { cm.unregisterNetworkCallback(it) }
        vpnCallback = null
    }

    private fun isVpnActive(): Boolean {
        val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return false
        val activeNetwork = cm.activeNetwork ?: return false
        return cm.getNetworkCapabilities(activeNetwork)
            ?.hasTransport(NetworkCapabilities.TRANSPORT_VPN) == true
    }

    private fun isProxyActive(): Boolean {
        val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
            ?: return false
        val proxy = cm.defaultProxy ?: return false
        return proxy.host.isNullOrEmpty().not()
    }

    private fun emitState() {
        val params = Arguments.createMap().apply {
            putBoolean("isVpnActive", isVpnActive())
            putBoolean("isProxyActive", isProxyActive())
        }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("VpnStateChanged", params)
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
