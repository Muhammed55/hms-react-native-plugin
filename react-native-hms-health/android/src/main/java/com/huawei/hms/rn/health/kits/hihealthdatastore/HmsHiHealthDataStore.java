package com.huawei.hms.rn.health.kits.hihealthdatastore;

import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.huawei.hihealth.error.HiHealthError;
import com.huawei.hihealthkit.data.store.HiHealthDataStore;
import com.huawei.hihealthkit.data.store.HiRealTimeListener;
import com.huawei.hms.rn.health.foundation.util.HMSLogger;
import com.huawei.hms.rn.health.foundation.util.MapUtils;
import com.huawei.hms.rn.health.foundation.view.BaseController;
import com.huawei.hms.rn.health.foundation.view.BaseProtocol;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class HmsHiHealthDataStore extends BaseController implements BaseProtocol.Event {
   private static final String TAG = HmsHiHealthDataStore.class.getSimpleName();

   // Internal context object
   private final ReactContext reactContext;

   private final HMSLogger logger;

   public HmsHiHealthDataStore(ReactApplicationContext reactContext) {
      super(TAG, reactContext);
      this.reactContext = reactContext;
      logger = HMSLogger.getInstance(reactContext);
   }

   @ReactMethod
   public void startReadingHeartRate(final Promise promise) {
      String logName = "HmsHiHealthDataStore.startReadingHeartRate";
      logger.startMethodExecutionTimer(logName);

      HiHealthDataStore.startReadingHeartRate(reactContext, new HiRealTimeListener() {
         @Override
         public void onResult(int state) {
            Log.i(TAG, "onResult: " + state);
            if (state == 0) {
               promise.resolve(state);
            } else {
               promise.reject(Integer.toString(state), "startReadingHeartRate's onResult returned " + state);
            }
         }

         @Override
         public void onChange(int resultCode, String value) {
            try {
               if (resultCode == HiHealthError.SUCCESS) {
                  WritableMap params = new WritableNativeMap();
                  params.putInt("resultCode", resultCode);
                  JSONObject valueJson = new JSONObject(value);
                  Map<String, Object> valueMap = new HashMap<>();
                  Iterator<String> keyIterator = valueJson.keys();
                  while(keyIterator.hasNext()) {
                     String key = keyIterator.next();
                     valueMap.put(key, valueJson.getString(key));
                  }
                  params.putMap("value", Arguments.makeNativeMap(valueMap));
                  sendEvent(reactContext, "HeartRateOnChange", params);
               } else {
                  JSONObject jsonObject = new JSONObject();
                  jsonObject.put("resultCode", resultCode);
                  jsonObject.put("value", value);
                  sendEvent(reactContext, "HeartRateOnChange",
                          MapUtils.toWritableMap(jsonObject));
               }
            } catch (JSONException e) {
               e.printStackTrace();
            }
         }
      });
   }

   @ReactMethod
   public void stopReadingHeartRate(Promise promise) {
      HiHealthDataStore.stopReadingHeartRate(reactContext, new HiRealTimeListener() {
         @Override
         public void onResult(int state) {
            if (state == 0) {
               promise.resolve(state);
            } else {
               promise.reject(Integer.toString(state), "stopReadingHeartRate's onResult returned " + state);
            }
         }

         @Override
         public void onChange(int resultCode, String value) {
            // This callback is never triggered right now.
         }
      });
   }

   @ReactMethod
   public void addListener(String eventName) {
      // Keep: required since react-native 0.65 to prevent warnings.
   }

   @ReactMethod
   public void removeListeners(Integer count) {
      // Keep: required since react-native 0.65 to prevent warnings.
   }

   @Override
   public void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
   }
}
