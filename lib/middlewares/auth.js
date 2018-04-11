'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = authMiddleware;

var _utils = require('../utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/* eslint-disable no-param-reassign, arrow-body-style, dot-notation */

var WrongTokenError = function (_Error) {
  _inherits(WrongTokenError, _Error);

  function WrongTokenError(msg) {
    _classCallCheck(this, WrongTokenError);

    var _this = _possibleConstructorReturn(this, (WrongTokenError.__proto__ || Object.getPrototypeOf(WrongTokenError)).call(this, msg));

    _this.name = 'WrongTokenError';
    return _this;
  }

  return WrongTokenError;
}(Error);

function authMiddleware(opts) {
  var _this2 = this;

  var _ref = opts || {},
      tokenOrThunk = _ref.token,
      tokenRefreshPromise = _ref.tokenRefreshPromise,
      _ref$allowEmptyToken = _ref.allowEmptyToken,
      allowEmptyToken = _ref$allowEmptyToken === undefined ? false : _ref$allowEmptyToken,
      _ref$prefix = _ref.prefix,
      prefix = _ref$prefix === undefined ? 'Bearer ' : _ref$prefix,
      _ref$header = _ref.header,
      header = _ref$header === undefined ? 'Authorization' : _ref$header;

  var tokenRefreshInProgress = null;

  return function (next) {
    return function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
        var _token, _res;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return (0, _utils.isFunction)(tokenOrThunk) ? tokenOrThunk(req) : tokenOrThunk;

              case 3:
                _token = _context.sent;

                if (!(!_token && tokenRefreshPromise && !allowEmptyToken)) {
                  _context.next = 6;
                  break;
                }

                throw new WrongTokenError('Empty token');

              case 6:

                if (_token) {
                  req.fetchOpts.headers[header] = '' + prefix + _token;
                }
                _context.next = 9;
                return next(req);

              case 9:
                _res = _context.sent;
                return _context.abrupt('return', _res);

              case 13:
                _context.prev = 13;
                _context.t0 = _context['catch'](0);

                if (!(_context.t0 && tokenRefreshPromise)) {
                  _context.next = 20;
                  break;
                }

                if (!(_context.t0.message === 'Empty token' || _context.t0.res && _context.t0.res.status === 401)) {
                  _context.next = 20;
                  break;
                }

                if (!tokenRefreshPromise) {
                  _context.next = 20;
                  break;
                }

                if (!tokenRefreshInProgress) {
                  tokenRefreshInProgress = Promise.resolve(tokenRefreshPromise(req, _context.t0.res)).then(function (newToken) {
                    tokenRefreshInProgress = null;
                    return newToken;
                  });
                }

                return _context.abrupt('return', tokenRefreshInProgress.then(function (newToken) {
                  var newReq = req.clone();
                  newReq.fetchOpts.headers[header] = '' + prefix + newToken;
                  return next(newReq); // re-run query with new token
                }));

              case 20:
                throw _context.t0;

              case 21:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[0, 13]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }();
  };
}