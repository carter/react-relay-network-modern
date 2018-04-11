'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatRequestErrors = formatRequestErrors;
exports.createRequestError = createRequestError;

var _RelayRequest = require('./RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RRNLRequestError = function (_Error) {
  _inherits(RRNLRequestError, _Error);

  function RRNLRequestError(msg) {
    _classCallCheck(this, RRNLRequestError);

    var _this = _possibleConstructorReturn(this, (RRNLRequestError.__proto__ || Object.getPrototypeOf(RRNLRequestError)).call(this, msg));

    _this.name = 'RRNLRequestError';
    return _this;
  }

  return RRNLRequestError;
}(Error);

/**
 * Formats an error response from GraphQL server request.
 */


function formatRequestErrors(request, errors) {
  var CONTEXT_BEFORE = 20;
  var CONTEXT_LENGTH = 60;

  if (!request.getQueryString) {
    return errors.join('\n');
  }

  var queryLines = request.getQueryString().split('\n');
  return errors.map(function (_ref, ii) {
    var locations = _ref.locations,
        message = _ref.message;

    var prefix = ii + 1 + '. ';
    var indent = ' '.repeat(prefix.length);

    // custom errors thrown in graphql-server may not have locations
    var locationMessage = locations ? '\n' + locations.map(function (_ref2) {
      var column = _ref2.column,
          line = _ref2.line;

      var queryLine = queryLines[line - 1];
      var offset = Math.min(column - 1, CONTEXT_BEFORE);
      return [queryLine.substr(column - 1 - offset, CONTEXT_LENGTH), ' '.repeat(Math.max(offset, 0)) + '^^^'].map(function (messageLine) {
        return indent + messageLine;
      }).join('\n');
    }).join('\n') : '';
    return prefix + message + locationMessage;
  }).join('\n');
}

function createRequestError(req, res) {
  var errorReason = '';

  if (!res) {
    errorReason = 'Server return empty response.';
  } else if (!res.json) {
    errorReason = (res.text ? res.text : 'Server return empty response with Status Code: ' + res.status + '.') + (res ? '\n\n' + res.toString() : '');
  } else if (res.errors) {
    if (req instanceof _RelayRequest2.default) {
      errorReason = formatRequestErrors(req, res.errors);
    } else {
      errorReason = JSON.stringify(res.errors);
    }
  } else if (!res.data) {
    errorReason = 'Server return empty response.data.\n\n' + res.toString();
  }

  var error = new RRNLRequestError('Relay request for `' + req.getID() + '` failed by the following reasons:\n\n' + errorReason);

  error.req = req;
  error.res = res;
  return error;
}