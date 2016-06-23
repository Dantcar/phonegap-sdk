'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Device = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _es6Promise = require('es6-promise');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var deviceReady = void 0;

var Device = exports.Device = function () {
  function Device() {
    _classCallCheck(this, Device);
  }

  _createClass(Device, null, [{
    key: 'ready',
    value: function ready() {
      if (!deviceReady) {
        if (Device.isPhoneGap()) {
          deviceReady = new _es6Promise.Promise(function (resolve) {
            var onDeviceReady = function onDeviceReady() {
              document.removeEventListener('deviceready', onDeviceReady);
              resolve();
            };

            document.addEventListener('deviceready', onDeviceReady, false);
          });
        } else {
          deviceReady = _es6Promise.Promise.resolve();
        }
      }

      return deviceReady;
    }
  }, {
    key: 'isPhoneGap',
    value: function isPhoneGap() {
      return document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
    }
  }, {
    key: 'isBrowser',
    value: function isBrowser() {
      return document.URL.indexOf('http://') !== -1 || document.URL.indexOf('https://') !== -1;
    }
  }, {
    key: 'isiOS',
    value: function isiOS() {
      return typeof global.device !== 'undefined' && global.device.platform === 'iOS';
    }
  }, {
    key: 'isAndroid',
    value: function isAndroid() {
      return typeof global.device !== 'undefined' && global.device.platform === 'Android';
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var json = {
        device: {},
        platform: {
          name: 'phonegap'
        },
        os: {},
        kinveySDK: {
          name: _package2.default.name,
          version: _package2.default.version
        }
      };

      if (typeof global.device !== 'undefined') {
        json.device.model = global.device.model;
        json.platform.version = global.device.cordova;
        json.os.name = global.device.platform;
        json.os.version = global.device.version;
      }

      return json;
    }
  }]);

  return Device;
}();