
/* eslint-disable no-console */

import { isFunction } from '../utils';

export default function retryMiddleware(options) {
  const opts = options || {};
  const timeout = opts.fetchTimeout || 15000;
  const retryDelays = opts.retryDelays || [1000, 3000];
  const statusCodes = opts.statusCodes || false;
  const logger = opts.logger === false ? () => {} : opts.logger || console.log.bind(console, '[RELAY-NETWORK]');
  const allowMutations = opts.allowMutations || false;
  const allowFormData = opts.allowFormData || false;
  const forceRetryFn = opts.forceRetry || false;

  let retryAfterMs = () => false;
  if (retryDelays) {
    if (Array.isArray(retryDelays)) {
      retryAfterMs = attempt => {
        if (retryDelays.length >= attempt) {
          return retryDelays[attempt];
        }
        return false;
      };
    } else if (isFunction(retryDelays)) {
      retryAfterMs = retryDelays;
    }
  }

  let retryOnStatusCode = (status, req, res) => {
    return res.status < 200 || res.status > 300;
  };
  if (statusCodes) {
    if (Array.isArray(statusCodes)) {
      retryOnStatusCode = (status, req, res) => statusCodes.indexOf(res.status) !== -1;
    } else if (isFunction(statusCodes)) {
      retryOnStatusCode = statusCodes;
    }
  }

  return next => req => {
    if (req.isMutation() && !allowMutations) {
      return next(req);
    }

    if (req.isFormData() && !allowFormData) {
      return next(req);
    }

    return makeRetriableRequest({
      req,
      next,
      timeout,
      retryAfterMs,
      retryOnStatusCode,
      forceRetryFn,
      logger
    });
  };
}

async function makeRetriableRequest(o, delay = 0, attempt = 0) {
  const makeRequest = async () => {
    try {
      let res;
      if (o.timeout) {
        res = await promiseWithTimeout(o.next(o.req), o.timeout, async () => {
          const retryDelayMS = o.retryAfterMs(attempt);
          if (retryDelayMS) {
            o.logger(`response timeout, retrying after ${retryDelayMS} ms`);
            return makeRetriableRequest(o, retryDelayMS, attempt + 1);
          }
          throw new Error(`RelayNetworkLayer: reached request timeout in ${o.timeout} ms`);
        });
      } else {
        res = await o.next(o.req);
      }
      return res;
    } catch (e) {
      if (e && e.res && o.retryOnStatusCode(e.res.status, o.req, e.res)) {
        const retryDelayMS = o.retryAfterMs(attempt);
        if (retryDelayMS) {
          o.logger(`response status ${e.res.status}, retrying after ${retryDelayMS} ms`);
          return makeRetriableRequest(o, retryDelayMS, attempt + 1);
        }
      }
      throw e;
    }
  };

  return delayExecution(makeRequest, delay, o.forceRetryFn);
}

export function delayExecution(execFn, delayMS = 0, forceRetryWhenDelay) {
  return new Promise(resolve => {
    if (delayMS > 0) {
      let delayInProgress = true;
      const delayId = setTimeout(() => {
        delayInProgress = false;
        resolve(execFn());
      }, delayMS);

      if (forceRetryWhenDelay) {
        const runNow = () => {
          if (delayInProgress) {
            clearTimeout(delayId);
            resolve(execFn());
          }
        };
        forceRetryWhenDelay(runNow, delayMS);
      }
    } else {
      resolve(execFn());
    }
  });
}

export function promiseWithTimeout(promise, timeoutMS, onTimeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve(onTimeout());
    }, timeoutMS);

    promise.then(res => {
      clearTimeout(timeoutId);
      resolve(res);
    }).catch(err => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
}