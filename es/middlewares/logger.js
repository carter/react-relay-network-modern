var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/* eslint-disable no-console */

import RelayRequest from '../RelayRequest';
import RelayRequestBatch from '../RelayRequestBatch';


export default function loggerMiddleware(opts) {
  const logger = opts && opts.logger || console.log.bind(console, '[RELAY-NETWORK]');

  return next => req => {
    const start = new Date().getTime();

    logger(`Run ${req.getID()}`, req);
    return next(req).then(res => {
      const end = new Date().getTime();

      let queryId;
      let queryData;
      if (req instanceof RelayRequest) {
        queryId = req.getID();
        queryData = {
          query: req.getQueryString(),
          variables: req.getVariables()
        };
      } else if (req instanceof RelayRequestBatch) {
        queryId = req.getID();
        queryData = {
          requestList: req.requests,
          responseList: res.json
        };
      } else {
        queryId = 'CustomRequest';
        queryData = {};
      }

      logger(`Done ${queryId} in ${end - start}ms`, _extends({}, queryData, { req, res }));
      if (res.status !== 200) {
        logger(`Status ${res.status}: ${res.statusText || ''} for ${queryId}`);
      }
      return res;
    });
  };
}