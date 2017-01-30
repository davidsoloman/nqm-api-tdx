/* eslint-disable no-underscore-dangle */
module.exports = (function() {
  "use strict";

  const log = require("debug")("nqm-api-tdx:send-request-node");
  const util = require("util");

  const defaultCallback = function(err) {
    if (err) {
      log("uncaught error: %s", err.message);
    }
  };

  const postRequest = function(endpoint) {
    return function(command, postData, cb) {
      cb = cb || defaultCallback;

      const request = require("request");
      const options = {
        uri: util.format("%s/%s", endpoint, command),
        method: "POST",
        json: postData,
        headers: {authorization: `Bearer ${this._accessToken}`},
      };

      return request(options, function(err, res, body) {
        if (err) {
          let msg;
          if (err.response) {
            msg = util.format("%s failure: %s", command, err.response.text);
          } else {
            msg = util.format("%s failure: %s", command, err.message);
          }
          cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code });
        } else {
          cb(null, body);
        }
      });
    };
  };

  const getRequest = function(endpoint) {
    return function(query, cb) {
      cb = cb || defaultCallback;

      const request = new XMLHttpRequest();

      const uri = util.format("%s/%s", endpoint, query);

      request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
          try {
            const body = JSON.parse(this.response);
            cb(null, body);
          } catch (err) {
            cb(err);
          }
        } else {
          log("Response received and there was an error");

        }
      };

      request.onerror = function() {
        console.error('Request error');
      };

      request.open("GET", options.uri, true);

      if (this._accessToken) {
        request.setRequestHeader("authorization", `Bearer ${this._accessToken}`);
      }

      request.send();
      






      const request = require("request");
      const options = {
        uri: util.format("%s/%s", endpoint, query),
        method: "GET",
        json: true,
      };

      if (this._accessToken) {
        options.headers = {authorization: `Bearer ${this._accessToken}`};
      }

      return request(options, function(err, res, body) {
        if (err) {
          let msg;
          if (err.response) {
            msg = util.format("%s failure: %s", query, err.response.text);
          } else {
            msg = util.format("%s failure: %s", query, err.message);
          }
          cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code});
        } else {
          cb(null, body);
        }
      });
    };
  };

  return {
    post: postRequest,
    get: getRequest,
  };
}());
