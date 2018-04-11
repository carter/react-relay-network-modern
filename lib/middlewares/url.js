'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = urlMiddleware;

var _utils = require('../utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable no-param-reassign */

function urlMiddleware(opts) {
  var _this = this;

  var _ref = opts || {},
      url = _ref.url,
      headers = _ref.headers,
      _ref$method = _ref.method,
      method = _ref$method === undefined ? 'POST' : _ref$method,
      credentials = _ref.credentials,
      mode = _ref.mode,
      cache = _ref.cache,
      redirect = _ref.redirect;

  var urlOrThunk = url || '/graphql';
  var headersOrThunk = headers;

  return function (next) {
    return function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _utils.isFunction)(urlOrThunk) ? urlOrThunk(req) : urlOrThunk;

              case 2:
                req.fetchOpts.url = _context.sent;

                if (!headersOrThunk) {
                  _context.next = 7;
                  break;
                }

                _context.next = 6;
                return (0, _utils.isFunction)(headersOrThunk) ? headersOrThunk(req) : headersOrThunk;

              case 6:
                req.fetchOpts.headers = _context.sent;

              case 7:

                if (method) req.fetchOpts.method = method;
                if (credentials) req.fetchOpts.credentials = credentials;
                if (mode) req.fetchOpts.mode = mode;
                if (cache) req.fetchOpts.cache = cache;
                if (redirect) req.fetchOpts.redirect = redirect;

                return _context.abrupt('return', next(req));

              case 13:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }();
  };
}