var Server   = require('./server');
var Router   = require('./router');
var routeHandler = require('./handler');
var state = require('./state');
var url = require('url');
var fs = require('fs');
var path = require('path');
var pathRegEx = require('path-to-regexp');

exports = module.exports = proto = {};

/**
 * proto._cacheStaticPaths
 * @param  {String} rootDirectory path to recursively search in
 * @summary builds an in-memory cache of the existing static files
 */

proto._cacheStaticPaths = function(rootDirectory) {

  var _this = this;

  fs.readdir(rootDirectory, function(err, data) {

    /* Determine the path and whether its a file or folder */
    data.forEach(function(file) {

      var location = path.resolve(rootDirectory + '/' + file);
      var folder = fs.lstatSync(location).isDirectory();

      if (folder) _this._cacheStaticPaths(location)
      else state.staticPaths.push(location);

    })

  });

}

/**
 * proto.route
 * @param  {String} path base location for route
 * @param  {Object} router  Microbe router object
 * @summary used to set the routes for the Microbe proto
 */

proto.route = function(path, router) {

  /* Cache the path no matter what */
  state.routes.push(path);

  /* If a function is passed, treat it as a basic GET route */
  if (typeof router === 'function') {

    var routeObject = Router(path).get(router);
    this._routeHandlers[path] = routeObject;
    return true;
  }

  /* If an object is passed, assume it is a Router object */
  else if (typeof router === 'object') {
    this._routeHandlers[path] = router;
    return true;
  }

  /* If no route handler is passed, assume the user wants to chain routes*/
  else if (!router) {
    var routeObject = Router(path);
    this._routeHandlers[path] = routeObject;
    return routeObject;
  }

};


/**
 * proto.register
 * @param  {Function} callback middleware function
 * @param  {Function} next     control flow callback
 * @summary register middleware functions for routes. Middlware should be
 *          declared in the order it will be executed.
 */

proto.register = function(route, handler) {
  /* If no path is provided, register the middlware for all routes */

};

/**
 * proto.set
 * @param  {String} key   setting being changed
 * @param  {String} value new value for the setting
 * @summary used to set internal states like the view location, public folder
 *          and other configurations
 */

proto.set = function(key, value) {
  if (!state[key]) throw new Error('Cannot configure property: ' + key);
  state[key] = value;
}

/**
 * proto.start
 * @param  {Number}   port     HTTP Port for server
 * @param  {function} callback Callback function once server starts
 * @summary used to start the actual HTTP server for the Microbe proto
 */
proto.start = function(port, callback) {

  this._cacheStaticPaths(state.publicPath);
  proto._server = Server(port, this);
  proto._server.listen(port, callback);

}
