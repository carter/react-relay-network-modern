'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getFormDataInterface() {
  return typeof window !== 'undefined' && window.FormData || global && global.FormData;
}

var RelayRequest = function () {
  function RelayRequest(operation, variables, cacheConfig, uploadables) {
    _classCallCheck(this, RelayRequest);

    this.operation = operation;
    this.variables = variables;
    this.cacheConfig = cacheConfig;
    this.uploadables = uploadables;

    this.id = this.operation.id || this.operation.name || this._generateID();

    this.fetchOpts = {
      method: 'POST',
      headers: {},
      body: this.prepareBody()
    };
  }

  _createClass(RelayRequest, [{
    key: 'getBody',
    value: function getBody() {
      return this.fetchOpts.body;
    }
  }, {
    key: 'prepareBody',
    value: function prepareBody() {
      var uploadables = this.uploadables;

      if (uploadables) {
        var _FormData_ = getFormDataInterface();
        if (!_FormData_) {
          throw new Error('Uploading files without `FormData` interface does not supported.');
        }

        var formData = new _FormData_();
        formData.append('id', this.getID());
        formData.append('query', this.getQueryString());
        formData.append('variables', JSON.stringify(this.getVariables()));

        Object.keys(uploadables).forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
            formData.append(key, uploadables[key]);
          }
        });

        return formData;
      }

      return JSON.stringify({
        id: this.getID(),
        query: this.getQueryString(),
        variables: this.getVariables()
      });
    }
  }, {
    key: 'getID',
    value: function getID() {
      return this.id;
    }
  }, {
    key: '_generateID',
    value: function _generateID() {
      if (!this.constructor.lastGenId) {
        this.constructor.lastGenId = 0;
      }
      this.constructor.lastGenId += 1;
      return this.constructor.lastGenId.toString();
    }
  }, {
    key: 'getQueryString',
    value: function getQueryString() {
      return this.operation.text || '';
    }
  }, {
    key: 'getVariables',
    value: function getVariables() {
      return this.variables;
    }
  }, {
    key: 'isMutation',
    value: function isMutation() {
      return this.getQueryString().startsWith('mutation');
    }
  }, {
    key: 'isFormData',
    value: function isFormData() {
      var _FormData_ = getFormDataInterface();
      return !!_FormData_ && this.fetchOpts.body instanceof _FormData_;
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
  }]);

  return RelayRequest;
}();

exports.default = RelayRequest;