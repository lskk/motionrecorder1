/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { BarChart, Grid } from "react-native-svg-charts";

import {
  accelerometer,
  gyroscope,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes
} from "react-native-sensors";
import { map, filter } from "rxjs/operators";

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
    this.accelX = new Array(3 * 40).fill(0);
    this.accelY = new Array(3 * 40).fill(0);
    this.accelZ = new Array(3 * 40).fill(0);
    this.gyroX = new Array(3 * 40).fill(0);
    this.gyroY = new Array(3 * 40).fill(0);
    this.gyroZ = new Array(3 * 40).fill(0);
    this.magnetoX = new Array(3 * 40).fill(0);
    this.magnetoY = new Array(3 * 40).fill(0);
    this.magnetoZ = new Array(3 * 40).fill(0);
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
      targetSamplingRate: 160,
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
        this.accelX[this.accelXStart] = x;
        this.accelY[this.accelYStart] = y;
        this.accelZ[this.accelZStart] = z;
        this.accelXStart++;
        if (this.accelXStart >= this.accelX.length) {
          this.accelXStart = 0;
        }
        this.accelYStart++;
        if (this.accelYStart >= this.accelY.length) {
          this.accelYStart = 0;
        }
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
        this.gyroX[this.gyroXStart] = x;
        this.gyroY[this.gyroYStart] = y;
        this.gyroZ[this.gyroZStart] = z;
        this.gyroXStart++;
        if (this.gyroXStart >= this.gyroX.length) {
          this.gyroXStart = 0;
        }
        this.gyroYStart++;
        if (this.gyroYStart >= this.gyroY.length) {
          this.gyroYStart = 0;
        }
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
        this.magnetoX[this.magnetoXStart] = x;
        this.magnetoY[this.magnetoYStart] = y;
        this.magnetoZ[this.magnetoZStart] = z;
        this.magnetoXStart++;
        if (this.magnetoXStart >= this.magnetoX.length) {
          this.magnetoXStart = 0;
        }
        this.magnetoYStart++;
        if (this.magnetoYStart >= this.magnetoY.length) {
          this.magnetoYStart = 0;
        }
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
      125
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
    const fill = "rgb(134, 65, 244)";
    const NUM_VISIBLE_SAMPLES = 3 * 40;
    // this.state.accelX[4] = -5;
    // this.state.accelX[5] = +5;
    // console.debug("accelX", this.state.accelX);
    const accelX_last = this.state.accelX.slice(
      Math.max(this.state.accelX.length - NUM_VISIBLE_SAMPLES, 0),
      this.state.accelX.length
    );
    const gyroX_last = this.state.gyroX.slice(
      Math.max(this.state.gyroX.length - NUM_VISIBLE_SAMPLES, 0),
      this.state.gyroX.length
    );
    const magnetoX_last = this.state.magnetoX.slice(
      Math.max(this.state.magnetoX.length - NUM_VISIBLE_SAMPLES, 0),
      this.state.magnetoX.length
    );

    return (
      <View style={styles.container}>
        <Text>Accelerometer</Text>
        <Text>{this.state.accelFps} of {this.state.targetSamplingRate} Hz</Text>
        <BarChart
          style={{ height: 150, width: "100%" }}
          data={accelX_last}
          svg={{ fill }}
          contentInset={{ top: 30, bottom: 30 }}
          spacingInner={0}
          yMin={-15}
          yMax={+15}
        >
          <Grid />
        </BarChart>

        <Text>Gyroscope</Text>
        <Text>{this.state.gyroFps} of {this.state.targetSamplingRate} Hz</Text>
        <BarChart
          style={{ height: 150, width: "100%" }}
          data={gyroX_last}
          svg={{ fill }}
          contentInset={{ top: 30, bottom: 30 }}
          spacingInner={0}
          yMin={-8}
          yMax={+8}
        >
          <Grid />
        </BarChart>

        <Text>Magnetometer</Text>
        <Text>{this.state.magnetoFps} of {this.state.targetSamplingRate} Hz</Text>
        <BarChart
          style={{ height: 150, width: "100%" }}
          data={magnetoX_last}
          svg={{ fill }}
          contentInset={{ top: 30, bottom: 30 }}
          spacingInner={0}
          yMin={-45}
          yMax={+45}
        >
          <Grid />
        </BarChart>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
