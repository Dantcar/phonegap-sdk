'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kinveyJavascriptSdkCore = require('kinvey-javascript-sdk-core');

var _device = require('./device');

var _events = require('events');

var _promise = require('core-js/es6/promise');

var _promise2 = _interopRequireDefault(_promise);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _bind = require('lodash/bind');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var pushNamespace = process && process.env && process.env.KINVEY_PUSH_NAMESPACE || 'push' || 'push';
var notificationEvent = process && process.env && process.env.KINVEY_NOTIFICATION_EVENT || 'notification' || 'notification';
var deviceIdCollectionName = process && process.env && process.env.KINVEY_DEVICE_COLLECTION_NAME || 'kinvey_deviceId' || 'kinvey_deviceId';
var pushSettingsCollectionName = process && process.env && process.env.KINVEY_PUSH_COLLECTION_NAME || 'kinvey_pushSettings' || 'kinvey_pushSettings';
var storage = global.localStorage;
var notificationEventListener = void 0;

var Push = function (_EventEmitter) {
  _inherits(Push, _EventEmitter);

  function Push() {
    _classCallCheck(this, Push);

    var _this = _possibleConstructorReturn(this, (Push.__proto__ || Object.getPrototypeOf(Push)).call(this));

    _this.client = _kinveyJavascriptSdkCore.Client.sharedInstance();
    notificationEventListener = (0, _bind2.default)(_this.notificationListener, _this);

    _device.Device.ready().then(function () {
      try {
        var pushOptions = JSON.parse(storage.getItem(pushSettingsCollectionName));
        if (pushOptions) {
          return _this.register(pushOptions);
        }
      } catch (error) {
        // Cactch the JSON parsing error
      }

      return null;
    });
    return _this;
  }

  _createClass(Push, [{
    key: 'isSupported',
    value: function isSupported() {
      return _device.Device.isiOS() || _device.Device.isAndroid();
    }
  }, {
    key: 'onNotification',
    value: function onNotification(listener) {
      return this.on(notificationEvent, listener);
    }
  }, {
    key: 'onceNotification',
    value: function onceNotification(listener) {
      return this.once(notificationEvent, listener);
    }
  }, {
    key: 'notificationListener',
    value: function notificationListener(data) {
      this.emit(notificationEvent, data);
    }
  }, {
    key: 'register',
    value: function register() {
      var _this2 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _device.Device.ready().then(function () {
        if (!_this2.isSupported()) {
          return _promise2.default.reject(new _kinveyJavascriptSdkCore.KinveyError('Kinvey currently only supports ' + 'push notifications on iOS and Android platforms.'));
        }

        if (typeof global.PushNotification === 'undefined') {
          throw new _kinveyJavascriptSdkCore.KinveyError('PhoneGap Push Notification Plugin is not installed.', 'Please refer to http://devcenter.kinvey.com/phonegap/guides/push#ProjectSetUp for help with ' + 'setting up your project.');
        }

        return _this2.unregister().catch(function () {
          return null;
        });
      }).then(function () {
        var promise = new _promise2.default(function (resolve, reject) {
          _this2.phonegapPush = global.PushNotification.init(options);
          _this2.phonegapPush.on(notificationEvent, notificationEventListener);

          _this2.phonegapPush.on('registration', function (data) {
            resolve(data.registrationId);
          });

          _this2.phonegapPush.on('error', function (error) {
            reject(new _kinveyJavascriptSdkCore.KinveyError('An error occurred registering this device for push notifications.', error));
          });

          return _this2.phonegapPush;
        }).then(function (deviceId) {
          if (!deviceId) {
            throw new _kinveyJavascriptSdkCore.KinveyError('Unable to retrieve the device id to register this device for push notifications.');
          }

          var user = _kinveyJavascriptSdkCore.User.getActiveUser(_this2.client);
          var request = new _kinveyJavascriptSdkCore.NetworkRequest({
            method: _kinveyJavascriptSdkCore.RequestMethod.POST,
            url: _url2.default.format({
              protocol: _this2.client.protocol,
              host: _this2.client.host,
              pathname: _this2.pathname + '/register-device'
            }),
            properties: options.properties,
            authType: user ? _kinveyJavascriptSdkCore.AuthType.Session : _kinveyJavascriptSdkCore.AuthType.Master,
            data: {
              platform: global.device.platform.toLowerCase(),
              framework: 'phonegap',
              deviceId: deviceId,
              userId: user ? undefined : options.userId
            },
            timeout: options.timeout,
            client: _this2.client
          });

          return request.execute().then(function (response) {
            storage.setItem(deviceIdCollectionName, deviceId);
            storage.setItem(pushSettingsCollectionName, JSON.stringify(options));
            return response.data;
          });
        });

        return promise;
      });
    }
  }, {
    key: 'unregister',
    value: function unregister() {
      var _this3 = this;

      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return _device.Device.ready().then(function () {
        if (!_this3.isSupported()) {
          return _promise2.default.reject(new _kinveyJavascriptSdkCore.KinveyError('Kinvey currently only supports ' + 'push notifications on iOS and Android platforms.'));
        }

        var promise = new _promise2.default(function (resolve, reject) {
          if (_this3.phonegapPush) {
            _this3.phonegapPush.off(notificationEvent, notificationEventListener);
            _this3.phonegapPush.unregister(function () {
              _this3.phonegapPush = null;
              resolve();
            }, function () {
              reject(new _kinveyJavascriptSdkCore.KinveyError('Unable to unregister with the PhoneGap Push Plugin.'));
            });
          }

          resolve();
        });

        promise = promise.then(function () {
          return _promise2.default.resolve(storage.getItem(deviceIdCollectionName));
        }).then(function (deviceId) {
          if (!deviceId) {
            throw new _kinveyJavascriptSdkCore.KinveyError('This device has not been registered for push notifications.');
          }

          var user = _kinveyJavascriptSdkCore.User.getActiveUser(_this3.client);
          var request = new _kinveyJavascriptSdkCore.NetworkRequest({
            method: _kinveyJavascriptSdkCore.RequestMethod.POST,
            url: _url2.default.format({
              protocol: _this3.client.protocol,
              host: _this3.client.host,
              pathname: _this3.pathname + '/unregister-device'
            }),
            properties: options.properties,
            authType: user ? _kinveyJavascriptSdkCore.AuthType.Session : _kinveyJavascriptSdkCore.AuthType.Master,
            data: {
              platform: global.device.platform.toLowerCase(),
              framework: 'phonegap',
              deviceId: deviceId,
              userId: user ? null : options.userId
            },
            timeout: options.timeout,
            client: _this3.client
          });
          return request.execute();
        }).then(function (response) {
          storage.removeItem(deviceIdCollectionName);
          storage.removeItem(pushSettingsCollectionName);
          return response.data;
        });

        return promise;
      });
    }
  }, {
    key: 'pathname',
    get: function get() {
      return '/' + pushNamespace + '/' + this.client.appKey;
    }
  }, {
    key: 'client',
    get: function get() {
      return this.pushClient;
    },
    set: function set(client) {
      if (!client) {
        throw new _kinveyJavascriptSdkCore.KinveyError('Kinvey.Push much have a client defined.');
      }

      this.pushClient = client;
    }
  }]);

  return Push;
}(_events.EventEmitter);

exports.default = Push;