'use strict';

exports.__esModule = true;

var _relayRuntime = require('relay-runtime');

var _RelayRequest = require('./RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

var _fetchWithMiddleware = require('./fetchWithMiddleware');

var _fetchWithMiddleware2 = _interopRequireDefault(_fetchWithMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RelayNetworkLayer {

  constructor(middlewares, opts) {
    this._middlewares = [];
    this._middlewaresSync = [];

    const mws = Array.isArray(middlewares) ? middlewares : [middlewares];
    mws.forEach(mw => {
      if (mw) {
        if (mw.execute) {
          this._middlewaresSync.push(mw.execute);
        } else {
          this._middlewares.push(mw);
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

    this.fetchFn = (operation, variables, cacheConfig, uploadables) => {
      for (let i = 0; i < this._middlewaresSync.length; i++) {
        const res = this._middlewaresSync[i](operation, variables, cacheConfig, uploadables);
        if (res) return res;
      }

      const req = new _RelayRequest2.default(operation, variables, cacheConfig, uploadables);
      return (0, _fetchWithMiddleware2.default)(req, this._middlewares);
    };

    const network = _relayRuntime.Network.create(this.fetchFn, this.subscribeFn);
    this.execute = network.execute;
  }
}
exports.default = RelayNetworkLayer;