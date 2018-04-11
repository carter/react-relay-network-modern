'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RelayRequestBatch = function () {
  function RelayRequestBatch(requests) {
    _classCallCheck(this, RelayRequestBatch);

    this.requests = requests;
    this.fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody()
    };
  }

  _createClass(RelayRequestBatch, [{
    key: 'setFetchOption',
    value: function setFetchOption(name, value) {
      this.fetchOpts[name] = value;
    }
  }, {
    key: 'setFetchOptions',
    value: function setFetchOptions(opts) {
      this.fetchOpts = _extends({}, this.fetchOpts, opts);
    }
  }, {
    key: 'getBody',
    value: function getBody() {
      if (!this.fetchOpts.body) {
        this.fetchOpts.body = this.prepareBody();
      }
      return this.fetchOpts.body || '';
    }
  }, {
    key: 'prepareBody',
    value: function prepareBody() {
      return '[' + this.requests.map(function (r) {
        return r.getBody();
      }).join(',') + ']';
    }
  }, {
    key: 'getIds',
    value: function getIds() {
      return this.requests.map(function (r) {
        return r.getID();
      });
    }
  }, {
    key: 'getID',
    value: function getID() {
      return 'BATCH_REQUEST:' + this.getIds().join(':');
    }
  }, {
    key: 'isMutation',
    value: function isMutation() {
      return false;
    }
  }, {
    key: 'isFormData',
    value: function isFormData() {
      return false;
    }
  }, {
    key: 'clone',
    value: function clone() {
      // $FlowFixMe
      var newRequest = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
      newRequest.fetchOpts = _extends({}, this.fetchOpts);
      newRequest.fetchOpts.headers = _extends({}, this.fetchOpts.headers);
      return newRequest;
    }
  }, {
    key: 'getVariables',
    value: function getVariables() {
      throw new Error('Batch request does not have variables.');
    }
  }, {
    key: 'getQueryString',
    value: function getQueryString() {
      return this.prepareBody();
    }
  }]);

  return RelayRequestBatch;
}();

exports.default = RelayRequestBatch;