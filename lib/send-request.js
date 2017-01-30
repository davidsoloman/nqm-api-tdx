
module.exports = (function() {
  "use strict";

  if (typeof window === "object" && window.XMLHttpRequest) {
    return require("./send-request-browser");
  } else {
    return require("./send-request-node");
  }

  // return require("./send-request-fetch");
}());
