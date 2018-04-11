'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var runFetch = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
    var url, resFromFetch, res;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            url = req.fetchOpts.url;

            if (!url) url = '/graphql';

            if (!req.fetchOpts.headers.Accept) req.fetchOpts.headers.Accept = '*/*';
            if (!req.fetchOpts.headers['Content-Type'] && !req.isFormData()) {
              req.fetchOpts.headers['Content-Type'] = 'application/json';
            }

            // $FlowFixMe
            _context.next = 6;
            return (0, _legacyFetch2.default)(url, req.fetchOpts);

          case 6:
            resFromFetch = _context.sent;
            _context.next = 9;
            return _RelayResponse2.default.createFromFetch(resFromFetch);

          case 9:
            res = _context.sent;

            if (!(res.status && res.status >= 400)) {
              _context.next = 12;
              break;
            }

            throw (0, _createRequestError.createRequestError)(req, res);

          case 12:
            return _context.abrupt('return', res);

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function runFetch(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = fetchWithMiddleware;

var _createRequestError = require('./createRequestError');

var _RelayResponse = require('./RelayResponse');

var _RelayResponse2 = _interopRequireDefault(_RelayResponse);

var _legacyFetch = require('./legacyFetch');

var _legacyFetch2 = _interopRequireDefault(_legacyFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable no-param-reassign, prefer-const */

function fetchWithMiddleware(req, middlewares) {
  var wrappedFetch = compose.apply(undefined, _toConsumableArray(middlewares))(runFetch);

  return wrappedFetch(req).then(function (res) {
    if (!res || res.errors || !res.data) {
      throw (0, _createRequestError.createRequestError)(req, res);
    }
    return res;
  });
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  } else {
    var last = funcs[funcs.length - 1];
    var rest = funcs.slice(0, -1);
    return function () {
      return rest.reduceRight(function (composed, f) {
        return f(composed);
      }, last.apply(undefined, arguments));
    };
  }
}