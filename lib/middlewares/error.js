'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = errorMiddleware;

var _RelayRequest = require('../RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

var _RelayRequestBatch = require('../RelayRequestBatch');

var _RelayRequestBatch2 = _interopRequireDefault(_RelayRequestBatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
/* eslint-disable no-console */

function errorMiddleware(options) {
  var opts = options || {};
  var logger = opts.logger || console.error.bind(console);
  var prefix = opts.prefix || '[RELAY-NETWORK] GRAPHQL SERVER ERROR:\n\n';
  var disableServerMiddlewareTip = opts.disableServerMiddlewareTip || false;

  function displayErrors(errors, reqRes) {
    return errors.forEach(function (error) {
      var message = error.message,
          stack = error.stack,
          rest = _objectWithoutProperties(error, ['message', 'stack']);

      var msg = '' + prefix;
      var fmt = [];

      if (stack && Array.isArray(stack)) {
        msg = msg + '%c' + stack.shift() + '\n%c' + stack.join('\n');
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      } else {
        msg = msg + '%c' + message + ' %c';
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      }

      if (rest && Object.keys(rest).length) {
        msg = msg + '\n  %O';
        fmt.push(rest);
      }

      msg = msg + '\n\n%cRequest Response data:\n  %c%O';
      fmt.push('font-weight: bold;', 'font-weight: normal;', reqRes);

      if (!stack && !disableServerMiddlewareTip) {
        msg = msg + '\n\n%cNotice:%c' + noticeAbsentStack();
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      }

      logger.apply(undefined, [msg + '\n\n'].concat(fmt));
    });
  }

  return function (next) {
    return function (req) {
      return next(req).then(function (res) {
        if (req instanceof _RelayRequest2.default) {
          if (Array.isArray(res.errors)) {
            displayErrors(res.errors, { req: req, res: res });
          }
        } else if (req instanceof _RelayRequestBatch2.default) {
          if (Array.isArray(res.json)) {
            res.json.forEach(function (payload) {
              if (Array.isArray(payload.errors)) {
                displayErrors(payload.errors, { req: req, res: res });
              }
            });
          }
        }

        return res;
      });
    };
  };
}

function noticeAbsentStack() {
  return '\n    If you using \'express-graphql\', you may get server stack-trace for error.\n    Just tune \'formatError\' to return \'stack\' with stack-trace:\n\n    import graphqlHTTP from \'express-graphql\';\n\n    const graphQLMiddleware = graphqlHTTP({\n      schema: myGraphQLSchema,\n      formatError: (error) => ({\n        message: error.message,\n        stack: process.env.NODE_ENV === \'development\' ? error.stack.split(\'\\n\') : null,\n      })\n    });\n\n    app.use(\'/graphql\', graphQLMiddleware);';
}