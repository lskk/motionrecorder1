/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { LineChart, BarChart, Grid, YAxis } from "react-native-svg-charts";
import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";
import { map, filter } from "rxjs/operators";
import DeviceInfo from 'react-native-device-info';
import ndarray from "ndarray";
import ndarrayResample from "ndarray-resample";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.accelX = ndarray(new Float64Array(3 * 40));
    this.accelY = ndarray(new Float64Array(3 * 40));
    this.accelZ = ndarray(new Float64Array(3 * 40));
    this.gyroX = ndarray(new Float64Array(3 * 40));
    this.gyroY = ndarray(new Float64Array(3 * 40));
    this.gyroZ = ndarray(new Float64Array(3 * 40));
    this.magnetoX = ndarray(new Float64Array(3 * 40));
    this.magnetoY = ndarray(new Float64Array(3 * 40));
    this.magnetoZ = ndarray(new Float64Array(3 * 40));
    this.accelXStart = 0;
    this.accelYStart = 0;
    this.accelZStart = 0;
    this.gyroXStart = 0;
    this.gyroYStart = 0;
    this.gyroZStart = 0;
    this.magnetoXStart = 0;
    this.magnetoYStart = 0;
    this.magnetoZStart = 0;
    this.state = {
      targetSamplingRate: 60,
      accelX: this.accelX,
      accelY: this.accelY,
      accelZ: this.accelZ,
      gyroX: this.gyroX,
      gyroY: this.gyroY,
      gyroZ: this.gyroZ,
      magnetoX: this.magnetoX,
      magnetoY: this.magnetoY,
      magnetoZ: this.magnetoZ,
      accelFps: undefined,
      gyroFps: undefined,
      magnetoFps: undefined,
      deviceInfo: {
        brand: DeviceInfo.getBrand(),
        deviceId: DeviceInfo.getDeviceId(),
        deviceCountry: DeviceInfo.getDeviceCountry(),
        deviceName: DeviceInfo.getDeviceName(),
        product: DeviceInfo.getProduct(),
        model: DeviceInfo.getModel(),
        display: DeviceInfo.getDisplay(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        uniqueId: DeviceInfo.getUniqueID(),
      }
    };
    setUpdateIntervalForType(
      SensorTypes.accelerometer,
      1000 / this.state.targetSamplingRate
    );
    setUpdateIntervalForType(
      SensorTypes.gyroscope,
      1000 / this.state.targetSamplingRate
    );
    setUpdateIntervalForType(
      SensorTypes.magnetometer,
      1000 / this.state.targetSamplingRate
    );
  }

  componentDidMount() {
    this.accelFrames = 0;
    this.gyroFrames = 0;
    this.magnetoFrames = 0;
    this._startTime = new Date().getTime();
    this.accelSub = accelerometer.subscribe(
      ({ x, y, z }) => {
        this.accelX.set(this.accelXStart, x);
        this.accelXStart++;
        if (this.accelXStart >= this.accelX.shape) {
          this.accelXStart = 0;
        }
        this.accelY.set(this.accelYStart, y);
        this.accelYStart++;
        if (this.accelYStart >= this.accelY.length) {
          this.accelYStart = 0;
        }
        this.accelZ.set(this.accelZStart, z);
        this.accelZStart++;
        if (this.accelZStart >= this.accelZ.length) {
          this.accelZStart = 0;
        }
        this.accelFrames++;
      },
      error => {
        console.error("Accelerometer is not available");
      }
    );
    this.gyroSub = gyroscope.subscribe(
      ({ x, y, z }) => {
        this.gyroX.set(this.gyroXStart, x);
        this.gyroXStart++;
        if (this.gyroXStart >= this.gyroX.length) {
          this.gyroXStart = 0;
        }
        this.gyroY.set(this.gyroYStart, y);
        this.gyroYStart++;
        if (this.gyroYStart >= this.gyroY.length) {
          this.gyroYStart = 0;
        }
        this.gyroZ.set(this.gyroZStart, z);
        this.gyroZStart++;
        if (this.gyroZStart >= this.gyroZ.length) {
          this.gyroZStart = 0;
        }
        this.gyroFrames++;
      },
      error => {
        console.error("Gyroscope is not available");
      }
    );
    this.magnetoSub = magnetometer.subscribe(
      ({ x, y, z }) => {
        this.magnetoX.set(this.magnetoXStart, x);
        this.magnetoXStart++;
        if (this.magnetoXStart >= this.magnetoX.length) {
          this.magnetoXStart = 0;
        }
        this.magnetoY.set(this.magnetoYStart, y);
        this.magnetoYStart++;
        if (this.magnetoYStart >= this.magnetoY.length) {
          this.magnetoYStart = 0;
        }
        this.magnetoZ.set(this.magnetoZStart, z);
        this.magnetoZStart++;
        if (this.magnetoZStart >= this.magnetoZ.length) {
          this.magnetoZStart = 0;
        }
        this.magnetoFrames++;
      },
      error => {
        console.error("Magnetometer is not available");
      }
    );
    setInterval(
      () =>
        this.setState({
          accelX: this.accelX,
          accelY: this.accelY,
          accelZ: this.accelZ,
          gyroX: this.gyroX,
          gyroY: this.gyroY,
          gyroZ: this.gyroZ,
          magnetoX: this.magnetoX,
          magnetoY: this.magnetoY,
          magnetoZ: this.magnetoZ,
        }),
      1000
    );
    setInterval(() => {
      const fpsDur = new Date().getTime() - this._startTime;
      const accelFps = Math.round((this.accelFrames / (fpsDur / 1000)) * 10) / 10;
      const gyroFps = Math.round((this.gyroFrames / (fpsDur / 1000)) * 10) / 10;
      const magnetoFps = Math.round((this.magnetoFrames / (fpsDur / 1000)) * 10) / 10;
      this.setState({ accelFps, gyroFps, magnetoFps });
      this.accelFrames = 0;
      this.gyroFrames = 0;
      this.magnetoFrames = 0;
      this._startTime = new Date().getTime();
    }, 3000);
  }

  componentWillUnmount() {
    if (this.accelSub) {
      this.accelSub.unsubscribe();
      this.accelSub = undefined;
    }
    if (this.gyroSub) {
      this.gyroSub.unsubscribe();
      this.gyroSub = undefined;
    }
    if (this.magnetoSub) {
      this.magnetoSub.unsubscribe();
      this.magnetoSub = undefined;
    }
  }

  render() {
    const stroke1 = {stroke: "rgb(134, 65, 244)"};
    const stroke2 = {stroke: "rgb(65, 244, 134)"};
    const stroke3 = {stroke: "rgb(244, 134, 65)"};
    const NUM_VISIBLE_SAMPLES = 3 * 40;
    // this.state.accelX[4] = -5;
    // this.state.accelX[5] = +5;
    // console.debug("accelX", this.state.accelX);
    const accelX_last = Array.from(this.state.accelX.lo(
      Math.max(this.state.accelX.shape - NUM_VISIBLE_SAMPLES, 0)).data);
    const accelY_last = Array.from(this.state.accelY.lo(
      Math.max(this.state.accelY.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const accelZ_last = Array.from(this.state.accelZ.lo(
      Math.max(this.state.accelZ.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const gyroX_last = Array.from(this.state.gyroX.lo(
      Math.max(this.state.gyroX.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const gyroY_last = Array.from(this.state.gyroY.lo(
      Math.max(this.state.gyroY.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const gyroZ_last = Array.from(this.state.gyroZ.lo(
      Math.max(this.state.gyroZ.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const magnetoX_last = Array.from(this.state.magnetoX.lo(
      Math.max(this.state.magnetoX.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const magnetoY_last = Array.from(this.state.magnetoY.lo(
      Math.max(this.state.magnetoY.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const magnetoZ_last = Array.from(this.state.magnetoZ.lo(
      Math.max(this.state.magnetoZ.length - NUM_VISIBLE_SAMPLES, 0)).data);
    const { deviceInfo } = this.state;
    return (
      <View style={styles.container}>
        <Text style={{fontWeight: "bold", marginTop: 10}}>Device</Text>
        <Text>Device: {deviceInfo.brand}/{deviceInfo.model}/{deviceInfo.deviceCountry}</Text>
        <Text>System: {deviceInfo.systemName}/{deviceInfo.systemVersion}</Text>
        <Text style={{marginBottom: 10}}>Unique ID: {deviceInfo.uniqueId}</Text>

        <Text style={{fontWeight: "bold"}}>Accelerometer</Text>
        <Text>{this.state.accelFps} of {this.state.targetSamplingRate} Hz</Text>
        <View style={{height: 100, width: "100%"}}>
          <LineChart
            style={{flex: 1}}
            data={accelX_last}
            svg={stroke1}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-20}
            yMax={+20}
          >
            <Grid />
          </LineChart>
          <LineChart
            style={StyleSheet.absoluteFill}
            data={accelY_last}
            svg={stroke2}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-20}
            yMax={+20}
          />
          <LineChart
            style={StyleSheet.absoluteFill}
            data={accelZ_last}
            svg={stroke3}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-20}
            yMax={+20}
          />
        </View>

        <Text style={{fontWeight: "bold"}}>Gyroscope</Text>
        <Text>{this.state.gyroFps} of {this.state.targetSamplingRate} Hz</Text>
        <View style={{height: 100, width: "100%"}}>
          <LineChart
            style={{flex: 1}}
            data={gyroX_last}
            svg={stroke1}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-8}
            yMax={+8}
          >
            <Grid />
          </LineChart>
          <LineChart
            style={StyleSheet.absoluteFill}
            data={gyroY_last}
            svg={stroke2}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-8}
            yMax={+8}
          />
          <LineChart
            style={StyleSheet.absoluteFill}
            data={gyroZ_last}
            svg={stroke3}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-8}
            yMax={+8}
          />
        </View>

        <Text style={{fontWeight: "bold"}}>Magnetometer</Text>
        <Text>{this.state.magnetoFps} of {this.state.targetSamplingRate} Hz</Text>
        <View style={{height: 100, width: "100%"}}>
          <LineChart
            style={{flex: 1}}
            data={magnetoX_last}
            svg={stroke1}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-45}
            yMax={+45}
          >
            <Grid />
          </LineChart>
          <LineChart
            style={StyleSheet.absoluteFill}
            data={magnetoY_last}
            svg={stroke2}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-45}
            yMax={+45}
          />
          <LineChart
            style={StyleSheet.absoluteFill}
            data={magnetoZ_last}
            svg={stroke3}
            contentInset={{ top: 10, bottom: 10 }}
            spacingInner={0} spacingOuter={0}
            yMin={-45}
            yMax={+45}
          />
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
