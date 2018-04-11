'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _relayRuntime = require('relay-runtime');

var _RelayRequest = require('./RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

var _fetchWithMiddleware = require('./fetchWithMiddleware');

var _fetchWithMiddleware2 = _interopRequireDefault(_fetchWithMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelayNetworkLayer = function RelayNetworkLayer(middlewares, opts) {
  var _this = this;

  _classCallCheck(this, RelayNetworkLayer);

  this._middlewares = [];
  this._middlewaresSync = [];

  var mws = Array.isArray(middlewares) ? middlewares : [middlewares];
  mws.forEach(function (mw) {
    if (mw) {
      if (mw.execute) {
        _this._middlewaresSync.push(mw.execute);
      } else {
        _this._middlewares.push(mw);
      }
    }
  });

  if (opts) {
    this.subscribeFn = opts.subscribeFn;

    // TODO deprecate
    if (opts.beforeFetch) {
      this._middlewaresSync.push(opts.beforeFetch);
    }
  }

  this.fetchFn = function (operation, variables, cacheConfig, uploadables) {
    for (var i = 0; i < _this._middlewaresSync.length; i++) {
      var res = _this._middlewaresSync[i](operation, variables, cacheConfig, uploadables);
      if (res) return res;
    }

    var req = new _RelayRequest2.default(operation, variables, cacheConfig, uploadables);
    return (0, _fetchWithMiddleware2.default)(req, _this._middlewares);
  };

  var network = _relayRuntime.Network.create(this.fetchFn, this.subscribeFn);
  this.execute = network.execute;
};

exports.default = RelayNetworkLayer;