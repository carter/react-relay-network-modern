import { Network } from 'relay-runtime';
import RelayRequest from './RelayRequest';
import fetchWithMiddleware from './fetchWithMiddleware';


export default class RelayNetworkLayer {

  constructor(middlewares, opts) {
    this._middlewares = [];
    this._middlewaresSync = [];

    const mws = Array.isArray(middlewares) ? middlewares : [middlewares];
    mws.forEach(mw => {
      if (mw) {
        if (mw.execute) {
          this._middlewaresSync.push(mw.execute);
        } else {
          this._middlewares.push(mw);
        }
      }
    });

    if (opts) {
      this.subscribeFn = opts.subscribeFn;

      // TODO deprecate
      if (opts.beforeFetch) {
        this._middlewaresSync.push(opts.beforeFetch);
      }
    }

    this.fetchFn = (operation, variables, cacheConfig, uploadables) => {
      for (let i = 0; i < this._middlewaresSync.length; i++) {
        const res = this._middlewaresSync[i](operation, variables, cacheConfig, uploadables);
        if (res) return res;
      }

      const req = new RelayRequest(operation, variables, cacheConfig, uploadables);
      return fetchWithMiddleware(req, this._middlewares);
    };

    const network = Network.create(this.fetchFn, this.subscribeFn);
    this.execute = network.execute;
  }
}