/* eslint-disable no-underscore-dangle */
module.exports = (function() {
  "use strict";

  const log = require("debug")("nqm-api-tdx:send-request-fetch");
  const util = require("util");
  const Promise = require("es6-promise").polyfill();  // eslint-disable-line no-unused-vars
  const fetch = require("isomorphic-fetch");

  const defaultCallback = function(err) {
    if (err) {
      log("uncaught error: %s", err.message);
    }
  };

  const checkResponseStatus = function(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      const error = new Error(`failed response status: ${response.statusText}`);
      error.response = response;
      throw error;
    }
  };

  const postRequest = function(endpoint) {
    return function(command, postData, cb) {
      log("sending %s with %j", command, postData);
      cb = cb || defaultCallback;

      const uri = util.format("%s/%s", endpoint, command);
      const options = {
        method: "POST",
        body: JSON.stringify(postData),
        headers: {
          "Authorization": `Bearer ${this._accessToken}`,
          "Content-Type": "application/json",
        },
      };

      return fetch(uri, options)
        .then(checkResponseStatus)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          cb(null, json);
        })
        .catch((err) => {
          cb(err, null);
        });
    };
  };

      //   if (err) {
      //     let msg;
      //     if (err.response) {
      //       msg = util.format("%s failure: %s", command, err.response.text);
      //     } else {
      //       msg = util.format("%s failure: %s", command, err.message);
      //     }
      //     cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code });
      //   } else {
      //     cb(null, body);
      //   }
      // });

  const getRequest = function(endpoint) {
    return function(query, cb) {
      log("sending %s", query);
      cb = cb || defaultCallback;

      const uri = util.format("%s/%s", endpoint, query);
      const options = {
        method: "GET",
        timeout: 12 * 60 * 1000,
      };

      if (this._accessToken) {
        options.headers = {authorization: `Bearer ${this._accessToken}`};
      }

      return fetch(uri, options)
        .then(checkResponseStatus)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          cb(null, json);
        })
        .catch((err) => {
          log("getRequest error: %s", err.message);
          cb(err);
        });
    };
      // return request(options, function(err, res, body) {
      //   if (err) {
      //     let msg;
      //     if (err.response) {
      //       msg = util.format("%s failure: %s", query, err.response.text);
      //     } else {
      //       msg = util.format("%s failure: %s", query, err.message);
      //     }
      //     cb({name: "TDXApiError", message: msg, status: err.status, stack: err.stack, code: err.code});
      //   } else {
      //     cb(null, body);
      //   }
      // });
  };


  return {
    post: postRequest,
    get: getRequest,
  };
}());
