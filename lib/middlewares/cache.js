'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = queryMiddleware;

var _relayRuntime = require('relay-runtime');

var _utils = require('../utils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function queryMiddleware(opts) {
  var _this = this;

  var _ref = opts || {},
      size = _ref.size,
      ttl = _ref.ttl,
      onInit = _ref.onInit,
      allowMutations = _ref.allowMutations,
      allowFormData = _ref.allowFormData,
      clearOnMutation = _ref.clearOnMutation;

  var cache = new _relayRuntime.QueryResponseCache({
    size: size || 100, // 100 requests
    ttl: ttl || 15 * 60 * 1000 // 15 minutes
  });

  if ((0, _utils.isFunction)(onInit)) {
    onInit(cache);
  }

  return function (next) {
    return function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req) {
        var queryId, variables, res, _queryId, _variables, cachedRes, _res;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!req.isMutation()) {
                  _context.next = 4;
                  break;
                }

                if (clearOnMutation) {
                  cache.clear();
                }

                if (allowMutations) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt('return', next(req));

              case 4:
                if (!(req.isFormData() && !allowFormData)) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt('return', next(req));

              case 6:
                if (!(req.cacheConfig && req.cacheConfig.force)) {
                  _context.next = 14;
                  break;
                }

                queryId = req.getID();
                variables = req.getVariables();
                _context.next = 11;
                return next(req);

              case 11:
                res = _context.sent;


                cache.set(queryId, variables, res);
                return _context.abrupt('return', res);

              case 14:
                _context.prev = 14;
                _queryId = req.getID();
                _variables = req.getVariables();
                cachedRes = cache.get(_queryId, _variables);

                if (!cachedRes) {
                  _context.next = 20;
                  break;
                }

                return _context.abrupt('return', cachedRes);

              case 20:
                _context.next = 22;
                return next(req);

              case 22:
                _res = _context.sent;

                cache.set(_queryId, _variables, _res);

                return _context.abrupt('return', _res);

              case 27:
                _context.prev = 27;
                _context.t0 = _context['catch'](14);

                // if error, just log it to console
                console.log(_context.t0); // eslint-disable-line

              case 30:
                return _context.abrupt('return', next(req));

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[14, 27]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }();
  };
}