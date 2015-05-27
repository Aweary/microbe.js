var pathRegEx = require('path-to-regexp');
var state = require('./state');


/**
 * Router
 * @param  {String} path Base URL for the HTTP path
 * @return {Objcet} router Microbe Router object
 * @summary The Microbe Router is a simple object which contains all
 *          the route handlers for a given path. It can be used directly,
 *          or implicitly by using app.route()
 */
module.exports = function(path) {

  /* Instantiate the router object */
  var router = {};

  /* Use a path matching RegEx for registering the path */
  router.params = [];
  router.matchPath = pathRegEx(path, router.params);

  /* Add the path and handlers to the router */
  router.path = path;
  router.handlers = {};

  /* Handle all GET requests for the router */
  router.get = function(handler) {
    router.handlers.get = handler;
    return this;
  };

  /* Handle all POST requests for the router */
  router.post = function(handler) {
    router.handlers.post = handler;
    return this;
  };

  /* Handle all PUT requests for the router */
  router.put = function(handler) {
    router.handlers.put = handler;
    return this;
  };

  /* Handle all DELETE requests for the router */
  router.delete = function(handler) {
    router.handlers.delete = handler;
    return this;
  };

  router._handle404 = function(req, res) {
    res.end('404 Not Found');
  };

  return router;

}
