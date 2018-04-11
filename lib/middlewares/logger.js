'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
/* eslint-disable no-console */

exports.default = loggerMiddleware;

var _RelayRequest = require('../RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

var _RelayRequestBatch = require('../RelayRequestBatch');

var _RelayRequestBatch2 = _interopRequireDefault(_RelayRequestBatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function loggerMiddleware(opts) {
  var logger = opts && opts.logger || console.log.bind(console, '[RELAY-NETWORK]');

  return function (next) {
    return function (req) {
      var start = new Date().getTime();

      logger('Run ' + req.getID(), req);
      return next(req).then(function (res) {
        var end = new Date().getTime();

        var queryId = void 0;
        var queryData = void 0;
        if (req instanceof _RelayRequest2.default) {
          queryId = req.getID();
          queryData = {
            query: req.getQueryString(),
            variables: req.getVariables()
          };
        } else if (req instanceof _RelayRequestBatch2.default) {
          queryId = req.getID();
          queryData = {
            requestList: req.requests,
            responseList: res.json
          };
        } else {
          queryId = 'CustomRequest';
          queryData = {};
        }

        logger('Done ' + queryId + ' in ' + (end - start) + 'ms', _extends({}, queryData, { req: req, res: res }));
        if (res.status !== 200) {
          logger('Status ' + res.status + ': ' + (res.statusText || '') + ' for ' + queryId);
        }
        return res;
      });
    };
  };
}