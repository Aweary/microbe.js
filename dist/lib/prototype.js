'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = Application;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _utilConstants = require('./util/constants');

var _events = require('events');

var _mergeDescriptors = require('merge-descriptors');

var _mergeDescriptors2 = _interopRequireDefault(_mergeDescriptors);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _utilError = require('./util/error');

var _utilError2 = _interopRequireDefault(_utilError);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _utilHelpers = require('./util/helpers');

var debug = (0, _debug2['default'])('app');

/* Microbe prototype */

function Application(root) {

  this.env = process.env.NODE_ENV || 'development';
  this.settings = {};
  this.router = new _router2['default']();
  this.caches = {};
  this.stack = [];
  this.kickoff(root);
}

var proto = Application.prototype;
Object.setPrototypeOf(proto, _events.EventEmitter.prototype);

/**
 * Populate default settings on start
 * @private
 */

proto.kickoff = function kickoff(root) {

  var root = _path2['default'].resolve(root);
  this.set('routeParamters', []);
  this.set('staticRoutes', []);
  this.set('routes', []);
  this.set('projectRoot', root);
  this.emit('kickoff');

  debug('App settings: %o', this.settings);
};

/**
 * Get an internal `settings` value
 *
 * @param {String} key settings map key
 * @return {*} resulting value or false
 * @example
 */

proto.query = function query(key) {
  return this.settings[key];
};

/**
 * Set an internal `settings` value
 * @param {String|Object} key(s)
 * @param {*} value
 */

proto.set = function set(setting, value) {
  debug('Setting key %o to value %o', setting, value);
  arguments.length === 1 ? (0, _mergeDescriptors2['default'])(this.settings, setting) : this.settings[setting] = value;
  debug('Updated settings object: %o', this.settings);
  return this;
};

/**
 * Return a JSON representation
 * @return {[type]} [description]
 */
proto.toJSON = function inspect() {
  return {
    settings: this.settings,
    env: this.env
  };
};

/**
 * builds an in-memory cache of the existing static files.
 * It recursively climbs the decalured static resource folder
 * and builds a cache of all the file paths. proto.cache
 * @param  {String} root path to recursively search in
 */

proto.cache = function cache(folder) {

  var self = this;
  var cached = this.caches.assets;
  if (!cached) {
    cached = this.caches.assets = [];
  }
  var parent = this.query('projectRoot');
  var root = _path2['default'].resolve(parent, folder);

  debug('Caching static paths for %o', root);

  _fs2['default'].readdir(root, function (err, files) {

    if (err) (0, _utilError2['default'])('missing', root);

    files.forEach(function (file) {

      var location = _path2['default'].resolve(root, file);
      debug('Static path: %o', location);
      debug('Is it a folder? %o', (0, _utilHelpers.isFolder)(location));

      (0, _utilHelpers.isFolder)(location) ? self.cache(location) : cached.push(location);
    });
  });
};

/**
 * proto.route
 * @param  {String} path base location for route
 * @param  {Object} router  Microbe router object
 * @summary used to set the routes for the Microbe proto
 */

proto.route = function route(options) {
  var path = options.path;
  var method = options.method;
  var handler = options.handler;

  var router = this.router;
  router[method.toLowerCase()](path, handler);
  this.emit('route', { path: path, method: method, handler: handler });
};

proto.get = function getRoute(path, handler) {
  var method = 'GET';
  var options = { path: path, method: method, handler: handler };
  this.route(options);
};

/**
 * Used to start the actual HTTP server for the Microbe app
 * @param  {Number} port   HTTP Port for server
 * @param  {Function} callback Callback function once server starts
 */

proto.start = function start(port, callback) {

  var cb = callback || function () {};
  var pub = this.query('publicFolder');
  debug('App:start publicPath: %o', pub);
  if (pub) this.cache(pub);
  this.set('port', port);
  this.server = (0, _server2['default'])(port, this);
  this.server.listen(port, cb);
  this.emit('start', port);
  debug('Starting app on port %o', port);
};

/**
 * Register middleware handlers with routes
 * @param  {String} route      route for the middleware
 * @param  {Function} handler actual middleware handler
 */

proto.use = function use(route, handler) {

  var stack = this.stack;

  handler === undefined ? stack.push({ route: '*', handler: route }) : stack.push({ route: route, handler: handler });

  debug('Registered middleware on %o', route);
};
module.exports = exports['default'];