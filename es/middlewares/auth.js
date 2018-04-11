
/* eslint-disable no-param-reassign, arrow-body-style, dot-notation */

import { isFunction } from '../utils';


class WrongTokenError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'WrongTokenError';
  }
}

export default function authMiddleware(opts) {
  const {
    token: tokenOrThunk,
    tokenRefreshPromise,
    allowEmptyToken = false,
    prefix = 'Bearer ',
    header = 'Authorization'
  } = opts || {};

  let tokenRefreshInProgress = null;

  return next => async req => {
    try {
      // $FlowFixMe
      const token = await (isFunction(tokenOrThunk) ? tokenOrThunk(req) : tokenOrThunk);

      if (!token && tokenRefreshPromise && !allowEmptyToken) {
        throw new WrongTokenError('Empty token');
      }

      if (token) {
        req.fetchOpts.headers[header] = `${prefix}${token}`;
      }
      const res = await next(req);
      return res;
    } catch (e) {
      if (e && tokenRefreshPromise) {
        if (e.message === 'Empty token' || e.res && e.res.status === 401) {
          if (tokenRefreshPromise) {
            if (!tokenRefreshInProgress) {
              tokenRefreshInProgress = Promise.resolve(tokenRefreshPromise(req, e.res)).then(newToken => {
                tokenRefreshInProgress = null;
                return newToken;
              });
            }

            return tokenRefreshInProgress.then(newToken => {
              const newReq = req.clone();
              newReq.fetchOpts.headers[header] = `${prefix}${newToken}`;
              return next(newReq); // re-run query with new token
            });
          }
        }
      }

      throw e;
    }
  };
}