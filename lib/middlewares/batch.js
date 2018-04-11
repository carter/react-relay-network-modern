'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var sendRequests = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(requestMap, next, opts) {
    var ids, request, _res, batchRequest, url, _opts$fetchOpts, headersOrThunk, fetchOpts, _headers, batchResponse;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            ids = Object.keys(requestMap);

            if (!(ids.length === 1)) {
              _context.next = 11;
              break;
            }

            // SEND AS SINGLE QUERY
            request = requestMap[ids[0]];
            _context.next = 5;
            return next(request.req);

          case 5:
            _res = _context.sent;

            request.completeOk(_res);
            request.duplicates.forEach(function (r) {
              return r.completeOk(_res);
            });
            return _context.abrupt('return', _res);

          case 11:
            if (!(ids.length > 1)) {
              _context.next = 37;
              break;
            }

            // SEND AS BATCHED QUERY

            batchRequest = new _RelayRequestBatch2.default(ids.map(function (id) {
              return requestMap[id].req;
            }));
            // $FlowFixMe

            _context.next = 15;
            return (0, _utils.isFunction)(opts.batchUrl) ? opts.batchUrl(requestMap) : opts.batchUrl;

          case 15:
            url = _context.sent;

            batchRequest.setFetchOption('url', url);

            _opts$fetchOpts = opts.fetchOpts, headersOrThunk = _opts$fetchOpts.headersOrThunk, fetchOpts = _objectWithoutProperties(_opts$fetchOpts, ['headersOrThunk']);

            batchRequest.setFetchOptions(fetchOpts);

            if (!headersOrThunk) {
              _context.next = 24;
              break;
            }

            _context.next = 22;
            return (0, _utils.isFunction)(headersOrThunk) ? headersOrThunk(batchRequest) : headersOrThunk;

          case 22:
            _headers = _context.sent;

            batchRequest.setFetchOption('headers', _headers);

          case 24:
            _context.prev = 24;
            _context.next = 27;
            return next(batchRequest);

          case 27:
            batchResponse = _context.sent;

            if (!(!batchResponse || !Array.isArray(batchResponse.json))) {
              _context.next = 30;
              break;
            }

            throw new Error('Wrong response from server. Did your server support batch request?');

          case 30:

            batchResponse.json.forEach(function (payload) {
              if (!payload) return;
              var request = requestMap[payload.id];
              if (request) {
                var _res2 = createSingleResponse(batchResponse, payload);
                request.completeOk(_res2);
              }
            });

            return _context.abrupt('return', batchResponse);

          case 34:
            _context.prev = 34;
            _context.t0 = _context['catch'](24);

            ids.forEach(function (id) {
              requestMap[id].completeErr(_context.t0);
            });

          case 37:
            return _context.abrupt('return', Promise.resolve());

          case 38:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[24, 34]]);
  }));

  return function sendRequests(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

// check that server returns responses for all requests


exports.default = batchMiddleware;

var _utils = require('../utils');

var _RelayRequestBatch = require('../RelayRequestBatch');

var _RelayRequestBatch2 = _interopRequireDefault(_RelayRequestBatch);

var _RelayRequest = require('../RelayRequest');

var _RelayRequest2 = _interopRequireDefault(_RelayRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
/* eslint-disable no-param-reassign */

// Max out at roughly 100kb (express-graphql imposed max)
var DEFAULT_BATCH_SIZE = 102400;

function batchMiddleware(options) {
  var opts = options || {};
  var batchTimeout = opts.batchTimeout || 0; // 0 is the same as nextTick in nodeJS
  var allowMutations = opts.allowMutations || false;
  var batchUrl = opts.batchUrl || '/graphql/batch';
  var maxBatchSize = opts.maxBatchSize || DEFAULT_BATCH_SIZE;
  var singleton = {};

  var fetchOpts = {};
  if (opts.method) fetchOpts.method = opts.method;
  if (opts.credentials) fetchOpts.credentials = opts.credentials;
  if (opts.mode) fetchOpts.mode = opts.mode;
  if (opts.cache) fetchOpts.cache = opts.cache;
  if (opts.redirect) fetchOpts.redirect = opts.redirect;
  if (opts.headers) fetchOpts.headersOrThunk = opts.headers;

  return function (next) {
    return function (req) {
      // do not batch mutations unless allowMutations = true
      if (req.isMutation() && !allowMutations) {
        return next(req);
      }

      if (!(req instanceof _RelayRequest2.default)) {
        throw new Error('Relay batch middleware accepts only simple RelayRequest. Did you add batchMiddleware twice?');
      }

      // req with FormData can not be batched
      if (req.isFormData()) {
        return next(req);
      }

      return passThroughBatch(req, next, {
        batchTimeout: batchTimeout,
        batchUrl: batchUrl,
        singleton: singleton,
        maxBatchSize: maxBatchSize,
        fetchOpts: fetchOpts
      });
    };
  };
}

function passThroughBatch(req, next, opts) {
  var singleton = opts.singleton;


  var bodyLength = req.fetchOpts.body.length;
  if (!bodyLength) {
    return next(req);
  }

  if (!singleton.batcher || !singleton.batcher.acceptRequests) {
    singleton.batcher = prepareNewBatcher(next, opts);
  }

  if (singleton.batcher.bodySize + bodyLength + 1 > opts.maxBatchSize) {
    singleton.batcher = prepareNewBatcher(next, opts);
  }

  // +1 accounts for tailing comma after joining
  singleton.batcher.bodySize += bodyLength + 1;

  // queue request
  return new Promise(function (resolve, reject) {
    var relayReqId = req.getID();
    var requestMap = singleton.batcher.requestMap;


    var requestWrapper = {
      req: req,
      completeOk: function completeOk(res) {
        requestWrapper.done = true;
        resolve(res);
        requestWrapper.duplicates.forEach(function (r) {
          return r.completeOk(res);
        });
      },
      completeErr: function completeErr(err) {
        requestWrapper.done = true;
        reject(err);
        requestWrapper.duplicates.forEach(function (r) {
          return r.completeErr(err);
        });
      },
      done: false,
      duplicates: []
    };

    if (requestMap[relayReqId]) {
      /*
        I've run into a scenario with Relay Classic where if you have 2 components
        that make the exact same query, Relay will dedup the queries and reuse
        the request ids but still make 2 requests. The batch code then loses track
        of all the duplicate requests being made and never resolves or rejects
        the duplicate requests
        https://github.com/nodkz/react-relay-network-layer/pull/52
      */
      requestMap[relayReqId].duplicates.push(requestWrapper);
    } else {
      requestMap[relayReqId] = requestWrapper;
    }
  });
}

function prepareNewBatcher(next, opts) {
  var batcher = {
    bodySize: 2, // account for '[]'
    requestMap: {},
    acceptRequests: true
  };

  setTimeout(function () {
    batcher.acceptRequests = false;
    sendRequests(batcher.requestMap, next, opts).then(function () {
      return finalizeUncompleted(batcher.requestMap);
    }).catch(function () {
      return finalizeUncompleted(batcher.requestMap);
    });
  }, opts.batchTimeout);

  return batcher;
}

function finalizeUncompleted(requestMap) {
  Object.keys(requestMap).forEach(function (id) {
    var request = requestMap[id];
    if (!request.done) {
      request.completeErr(new Error('Server does not return response for request with id ' + id + ' \n' + ('Response should have following shape { "id": "' + id + '", "data": {} }')));
    }
  });
}

function createSingleResponse(batchResponse, json) {
  // Fallback for graphql-graphene and apollo-server batch responses
  var data = json.payload || json;
  var res = batchResponse.clone();
  res.processJsonData(data);
  return res;
}