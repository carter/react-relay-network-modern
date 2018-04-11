"use strict";

exports.__esModule = true;
exports.isFunction = isFunction;

/* eslint-disable  */

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}