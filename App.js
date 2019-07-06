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
    this._accelX = new Array(3 * 40).fill(0);
    this._accelY = new Array(3 * 40).fill(0);
    this._accelZ = new Array(3 * 40).fill(0);
    this.state = {
      targetSamplingRate: 40,
      accelX: this._accelX,
      accelY: this._accelY,
      accelZ: this._accelZ,
      fps: undefined,
    };
    this.accelXStart = 0;
    this.accelYStart = 0;
    this.accelZStart = 0;
    setUpdateIntervalForType(SensorTypes.accelerometer, 1000/this.state.targetSamplingRate); // 40 Hz, defaults to 100ms
  }

  componentDidMount() {
    this._frames = 0;
    this._startTime = new Date().getTime();
    this.accelSub = accelerometer
      .subscribe(
        ({x, y, z}) => {
          //this._accelX.shift();
          // this._accelX.push(x);
          //this._accelY.shift();
          // this._accelY.push(y);
          //this._accelZ.shift();
          // this._accelZ.push(z);
          this._accelX[this.accelXStart] = x;
          this._accelY[this.accelYStart] = y;
          this._accelZ[this.accelZStart] = z;
          this.accelXStart++;
          if (this.accelXStart >= this._accelX.length) {
            this.accelXStart = 0;
          }
          this.accelYStart++;
          if (this.accelYStart >= this._accelY.length) {
            this.accelYStart = 0;
          }
          this.accelZStart++;
          if (this.accelZStart >= this._accelZ.length) {
            this.accelZStart = 0;
          }
          this._frames++;
          // this.setState({accelX: accelX_new, accelY: accelY_new, accelZ: accelZ_new});
        },
        error => {
          console.log("The sensor is not available");
        }
      );
    setInterval(() => this.setState({
      accelX: this._accelX,
      accelY: this._accelY,
      accelZ: this._accelZ,
    }), 125);
    setInterval(() => {
      const fpsDur = new Date().getTime() - this._startTime;
      const fps = Math.round(this._frames / (fpsDur / 1000) * 10) / 10;
      this.setState({fps: fps});
      this._frames = 0;
      this._startTime = new Date().getTime();
    }, 3000);
  }

  componentWillUnmount() {
    if (this.accelSub) {
      this.accelSub.unsubscribe();
      this.accelSub = undefined;
    }
  }

  render() {
    const fill = 'rgb(134, 65, 244)'
    const NUM_VISIBLE_SAMPLES = 3 * 40;
    // this.state.accelX[4] = -5;
    // this.state.accelX[5] = +5;
    // console.debug("accelX", this.state.accelX);
    const accelX_last = this.state.accelX.slice(Math.max(this.state.accelX.length - NUM_VISIBLE_SAMPLES, 0), this.state.accelX.length);

    return (
      <View style={styles.container}>
        <Text>{this.state.fps} of {this.state.targetSamplingRate} Hz</Text>
        <Text>Accelerometer</Text>
        <BarChart
            style={{ height: 200, width: "100%" }}
            data={ accelX_last }
            svg={{ fill }}
            contentInset={{ top: 30, bottom: 30 }}
            yMin={-10}
            yMax={+10}
        >
            <Grid/>
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
