import { QueryResponseCache } from 'relay-runtime';

import { isFunction } from '../utils';

export default function queryMiddleware(opts) {
  const { size, ttl, onInit, allowMutations, allowFormData, clearOnMutation } = opts || {};
  const cache = new QueryResponseCache({
    size: size || 100, // 100 requests
    ttl: ttl || 15 * 60 * 1000 // 15 minutes
  });

  if (isFunction(onInit)) {
    onInit(cache);
  }

  return next => async req => {
    if (req.isMutation()) {
      if (clearOnMutation) {
        cache.clear();
      }
      if (!allowMutations) {
        return next(req);
      }
    }

    if (req.isFormData() && !allowFormData) {
      return next(req);
    }

    if (req.cacheConfig && req.cacheConfig.force) {
      const queryId = req.getID();
      const variables = req.getVariables();
      const res = await next(req);

      cache.set(queryId, variables, res);
      return res;
    }

    try {
      const queryId = req.getID();
      const variables = req.getVariables();

      const cachedRes = cache.get(queryId, variables);
      if (cachedRes) {
        return cachedRes;
      }

      const res = await next(req);
      cache.set(queryId, variables, res);

      return res;
    } catch (e) {
      // if error, just log it to console
      console.log(e); // eslint-disable-line
    }

    return next(req);
  };
}