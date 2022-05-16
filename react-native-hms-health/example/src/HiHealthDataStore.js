import React from "react";
import { NativeEventEmitter, Text, TouchableOpacity, View } from "react-native";

import { styles } from "./styles";

import { HmsHiHealthDataStore } from "@hmscore/react-native-hms-health";
import Utils from "./Utils";

/**
 * {@link HiHealthDataStore} class has sample codes
 *
 *
 */

 export default class HiHealthDataStore extends React.Component {
   constructor(props) {
     super(props);
     this.state = {
       heartRateCredibility: 0,
       heartRate : 0,
       hri_info: 0,   // Deprecated value. Returns 0.
       hrsqi_info: 0, // Deprecated value. Returns 0.
       time_info: 0
     };
   }

   componentDidMount() {
     Utils.logCall("call componentDidMount - HiHealthDataStore");

     const eventEmitter = new NativeEventEmitter(HmsHiHealthDataStore);

     this.heartRateEventListener = eventEmitter.addListener(
       "HeartRateOnChange",
       (event) => {
         console.log(event);
         if(event.resultCode == 0) {
           this.setState({
             heartRateCredibility: event.value.heartRateCredibility,
             heartRate : event.value.hr_info, // Deprecated value. Returns 0.
             hri_info: event.value.hri_info, // Deprecated value. Returns 0.
             hrsqi_info: event.value.hrsqi_info,
             time_info: event.value.time_info
           });
         }
         else if(event.resultCode == HiHealthDataStore.DEVICE_EXCEPTION) {
           Utils.notify("Have you put on your watch?\nUnable to read heart rate.");
         }
         // For possible exceptions, see https://developer.huawei.com/consumer/en/doc/development/HMSCore-Guides/extended-errocode-0000001053256958
         else {
           Utils.notify("Unable to read heart rate.\nresultCode: " + event.resultCode + "\nValue: " + event.value);
         }
       }
     );
   }

   componentWillUnmount() {
     try {
       this.heartRateEventListener.remove();
     } catch (e) { }
   }

   startReadingHeartRate() {
     HmsHiHealthDataStore.startReadingHeartRate()
        .then(result => console.log("startReadingHearRate result successful: " + result))
        .catch((error) => {
          console.log(error.message)
          if (error.code == HiHealthDataStore.ERR_DEVICE_NOT_CONNECTED) {
            Utils.notify("No device has been connected.\nGo to the Huawei Health app and connect a device.")
          }
        });
   }

   stopReadingHeartRate() {
     HmsHiHealthDataStore.stopReadingHeartRate()
        .then(result => console.log("stopReadingHeartRate result successful: " + result))
        .catch((errorCode, errorMessage) => console.log("stopReadingHeartRate failure " + errorCode + " " + errorMessage));
   }


   render() {
     return (
       <View style={styles.bg}>
        <Text style={styles.h1}>HiHealth DATA STORE</Text>
        <View style={styles.innerBody}>
          <View style={styles.buttonDataController}>
            <TouchableOpacity
              style={styles.horizontalButton}
              onPress={() => this.startReadingHeartRate()}
              underlayColor="#fff"
            >
              <Text style={styles.smallButtonLabel}> start reading heart rate </Text>
            </TouchableOpacity>

            <View style={styles.buttonDataController}>
              <TouchableOpacity
                style={styles.horizontalButton}
                onPress={() => this.stopReadingHeartRate()}
                underlayColor="#fff"
              >
                <Text style={styles.smallButtonLabel}> Stop reading heart rate </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View>
          <Text style={styles.h2}>heartRateCredibility: {this.state.heartRateCredibility}</Text>
          <Text style={[styles.h2, {fontSize: 28}]}>Heart rate: {this.state.heartRate}</Text>
          <Text style={styles.h2}>time_info: {this.state.time_info}</Text>
        </View>
       </View>
     )
   }
 }
