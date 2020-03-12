/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';

const BME280 = require('bme280-sensor');

// The BME280 constructor options are optional.
const DEFAULT_OPTIONS = {
  i2cBusNo: 1, // defaults to 1
  i2cAddress: BME280.BME280_DEFAULT_I2C_ADDRESS() // defaults to 0x77
};

function Sensor(options) {
  options = Object.assign(DEFAULT_OPTIONS, options || {});
  this.bme280 = new BME280(options);
}

Sensor.prototype.init = function (callback) {
  this.bme280.init()
    .then(callback)
    .catch((err) => {
      console.error(err);
    });
}

Sensor.prototype.read = function (callback) {
  this.bme280.readSensorData()
    .then((data) => {
      data.temperature = data.temperature_C;
      callback(null, data);
    })
    .catch(callback);
}

module.exports = Sensor;
