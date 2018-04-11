'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var makeRetriableRequest = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(o) {
    var _this = this;

    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var attempt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var makeRequest;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            makeRequest = function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var _res, retryDelayMS;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.prev = 0;
                        _res = void 0;

                        if (!o.timeout) {
                          _context2.next = 8;
                          break;
                        }

                        _context2.next = 5;
                        return promiseWithTimeout(o.next(o.req), o.timeout, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                          var retryDelayMS;
                          return regeneratorRuntime.wrap(function _callee$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  retryDelayMS = o.retryAfterMs(attempt);

                                  if (!retryDelayMS) {
                                    _context.next = 4;
                                    break;
                                  }

                                  o.logger('response timeout, retrying after ' + retryDelayMS + ' ms');
                                  return _context.abrupt('return', makeRetriableRequest(o, retryDelayMS, attempt + 1));

                                case 4:
                                  throw new Error('RelayNetworkLayer: reached request timeout in ' + o.timeout + ' ms');

                                case 5:
                                case 'end':
                                  return _context.stop();
                              }
                            }
                          }, _callee, _this);
                        })));

                      case 5:
                        _res = _context2.sent;
                        _context2.next = 11;
                        break;

                      case 8:
                        _context2.next = 10;
                        return o.next(o.req);

                      case 10:
                        _res = _context2.sent;

                      case 11:
                        return _context2.abrupt('return', _res);

                      case 14:
                        _context2.prev = 14;
                        _context2.t0 = _context2['catch'](0);

                        if (!(_context2.t0 && _context2.t0.res && o.retryOnStatusCode(_context2.t0.res.status, o.req, _context2.t0.res))) {
                          _context2.next = 21;
                          break;
                        }

                        retryDelayMS = o.retryAfterMs(attempt);

                        if (!retryDelayMS) {
                          _context2.next = 21;
                          break;
                        }

                        o.logger('response status ' + _context2.t0.res.status + ', retrying after ' + retryDelayMS + ' ms');
                        return _context2.abrupt('return', makeRetriableRequest(o, retryDelayMS, attempt + 1));

                      case 21:
                        throw _context2.t0;

                      case 22:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this, [[0, 14]]);
              }));

              return function makeRequest() {
                return _ref2.apply(this, arguments);
              };
            }();

            return _context3.abrupt('return', delayExecution(makeRequest, delay, o.forceRetryFn));

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function makeRetriableRequest(_x3) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = retryMiddleware;
exports.delayExecution = delayExecution;
exports.promiseWithTimeout = promiseWithTimeout;

var _utils = require('../utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable no-console */

function retryMiddleware(options) {
  var opts = options || {};
  var timeout = opts.fetchTimeout || 15000;
  var retryDelays = opts.retryDelays || [1000, 3000];
  var statusCodes = opts.statusCodes || false;
  var logger = opts.logger === false ? function () {} : opts.logger || console.log.bind(console, '[RELAY-NETWORK]');
  var allowMutations = opts.allowMutations || false;
  var allowFormData = opts.allowFormData || false;
  var forceRetryFn = opts.forceRetry || false;

  var retryAfterMs = function retryAfterMs() {
    return false;
  };
  if (retryDelays) {
    if (Array.isArray(retryDelays)) {
      retryAfterMs = function retryAfterMs(attempt) {
        if (retryDelays.length >= attempt) {
          return retryDelays[attempt];
        }
        return false;
      };
    } else if ((0, _utils.isFunction)(retryDelays)) {
      retryAfterMs = retryDelays;
    }
  }

  var retryOnStatusCode = function retryOnStatusCode(status, req, res) {
    return res.status < 200 || res.status > 300;
  };
  if (statusCodes) {
    if (Array.isArray(statusCodes)) {
      retryOnStatusCode = function retryOnStatusCode(status, req, res) {
        return statusCodes.indexOf(res.status) !== -1;
      };
    } else if ((0, _utils.isFunction)(statusCodes)) {
      retryOnStatusCode = statusCodes;
    }
  }

  return function (next) {
    return function (req) {
      if (req.isMutation() && !allowMutations) {
        return next(req);
      }

      if (req.isFormData() && !allowFormData) {
        return next(req);
      }

      return makeRetriableRequest({
        req: req,
        next: next,
        timeout: timeout,
        retryAfterMs: retryAfterMs,
        retryOnStatusCode: retryOnStatusCode,
        forceRetryFn: forceRetryFn,
        logger: logger
      });
    };
  };
}

function delayExecution(execFn) {
  var delayMS = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var forceRetryWhenDelay = arguments[2];

  return new Promise(function (resolve) {
    if (delayMS > 0) {
      var delayInProgress = true;
      var delayId = setTimeout(function () {
        delayInProgress = false;
        resolve(execFn());
      }, delayMS);

      if (forceRetryWhenDelay) {
        var _runNow = function _runNow() {
          if (delayInProgress) {
            clearTimeout(delayId);
            resolve(execFn());
          }
        };
        forceRetryWhenDelay(_runNow, delayMS);
      }
    } else {
      resolve(execFn());
    }
  });
}

function promiseWithTimeout(promise, timeoutMS, onTimeout) {
  return new Promise(function (resolve, reject) {
    var timeoutId = setTimeout(function () {
      resolve(onTimeout());
    }, timeoutMS);

    promise.then(function (res) {
      clearTimeout(timeoutId);
      resolve(res);
    }).catch(function (err) {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}