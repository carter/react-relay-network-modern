'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelayResponse = function () {
  function RelayResponse() {
    _classCallCheck(this, RelayResponse);
  }

  _createClass(RelayResponse, [{
    key: 'processJsonData',
    value: function processJsonData(json) {
      this.json = json;
      if (json) {
        if (json.data) this.data = json.data;
        if (json.errors) this.errors = json.errors;
      }
    }
  }, {
    key: 'clone',
    value: function clone() {
      // $FlowFixMe
      return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return ['Response:', '   Url: ' + (this.url || ''), '   Status code: ' + (this.status || ''), '   Status text: ' + (this.statusText || ''), '   Response headers: ' + JSON.stringify(this.headers), '   Response body: ' + JSON.stringify(this.json)].join('\n');
    }
  }], [{
    key: 'createFromFetch',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(res) {
        var r;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                r = new RelayResponse();

                r._res = res;
                r.ok = res.ok;
                r.status = res.status;
                r.url = res.url;
                r.headers = res.headers;

                if (!(res.status < 200 || res.status >= 300)) {
                  _context.next = 12;
                  break;
                }

                _context.next = 9;
                return res.text();

              case 9:
                r.text = _context.sent;
                _context.next = 17;
                break;

              case 12:
                _context.t0 = r;
                _context.next = 15;
                return res.json();

              case 15:
                _context.t1 = _context.sent;

                _context.t0.processJsonData.call(_context.t0, _context.t1);

              case 17:
                return _context.abrupt('return', r);

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function createFromFetch(_x) {
        return _ref.apply(this, arguments);
      }

      return createFromFetch;
    }() // response from low-level method, eg. fetch

  }, {
    key: 'createFromGraphQL',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(res) {
        var r;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                r = new RelayResponse();

                r._res = res;
                r.ok = true;
                r.status = 200;
                r.data = res.data;
                r.errors = res.errors;

                return _context2.abrupt('return', r);

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function createFromGraphQL(_x2) {
        return _ref2.apply(this, arguments);
      }

      return createFromGraphQL;
    }()
  }]);

  return RelayResponse;
}();

exports.default = RelayResponse;