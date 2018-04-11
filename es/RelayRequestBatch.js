var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

export default class RelayRequestBatch {

  constructor(requests) {
    this.requests = requests;
    this.fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody()
    };
  }

  setFetchOption(name, value) {
    this.fetchOpts[name] = value;
  }

  setFetchOptions(opts) {
    this.fetchOpts = _extends({}, this.fetchOpts, opts);
  }

  getBody() {
    if (!this.fetchOpts.body) {
      this.fetchOpts.body = this.prepareBody();
    }
    return this.fetchOpts.body || '';
  }

  prepareBody() {
    return `[${this.requests.map(r => r.getBody()).join(',')}]`;
  }

  getIds() {
    return this.requests.map(r => r.getID());
  }

  getID() {
    return `BATCH_REQUEST:${this.getIds().join(':')}`;
  }

  isMutation() {
    return false;
  }

  isFormData() {
    return false;
  }

  clone() {
    // $FlowFixMe
    const newRequest = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    newRequest.fetchOpts = _extends({}, this.fetchOpts);
    newRequest.fetchOpts.headers = _extends({}, this.fetchOpts.headers);
    return newRequest;
  }

  getVariables() {
    throw new Error('Batch request does not have variables.');
  }

  getQueryString() {
    return this.prepareBody();
  }
}