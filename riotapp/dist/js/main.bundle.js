(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var riot = require('riot')
var majax = require('marmottajax')

// app.tag shows the menu and sets up routing for each page
require('./tags/app.tag')

// In this app, a "page" is a simply a riot tag with 
// HTML to display as a page. 
// All "pages" are stored in the ./pages dir and 
// are named "-page.tag". These are arbitrary
// decisions that are not defined by riot.

// These are the "page" tags.
require('./pages/overview-page.tag')
require('./pages/login-page.tag')
require('./pages/simple-page.tag')
require('./pages/ajax-page.tag')
require('./pages/slide-page.tag')

// These are example tags. View each file for more information.
require('./tags/simple.tag')
require('./tags/raw.tag')
require('./tags/gallery.tag')
require('./tags/form-engine.tag')

riot.mount('*')

},{"./pages/ajax-page.tag":5,"./pages/login-page.tag":6,"./pages/overview-page.tag":7,"./pages/simple-page.tag":8,"./pages/slide-page.tag":9,"./tags/app.tag":10,"./tags/form-engine.tag":11,"./tags/gallery.tag":12,"./tags/raw.tag":13,"./tags/simple.tag":14,"marmottajax":2,"riot":3}],2:[function(require,module,exports){

/**
 * main.js
 *
 * Main librairy file
 */

var marmottajax = function() {

	if (typeof this.self !== "undefined") {

		return new marmottajax(marmottajax.normalize(arguments));

	}

	var data = marmottajax.normalize(arguments);

	if (data === null) {

		throw "Les arguments passées à marmottajax sont invalides.";

	}

	this.url = data.url;
	this.method = data.method;
	this.json = data.json;
	this.watch = data.watch;
	this.parameters = data.parameters;
	this.headers = data.headers;

	if (this.method === "post" || this.method === "put" || this.method === "update" || this.method === "delete") {

		this.postData = "?";

		for (var key in this.parameters) {

			this.postData += this.parameters.hasOwnProperty(key) ? "&" + key + "=" + this.parameters[key] : "";

		}

	}

	else {

		this.url += this.url.indexOf("?") < 0 ? "?" : "";

		for (var key in this.parameters) {

		    this.url += this.parameters.hasOwnProperty(key) ? "&" + key + "=" + this.parameters[key] : "";

		}

	}

	this.setXhr();

	this.setWatcher();

};
module.exports = marmottajax;

/**
 * constants.js
 *
 * Constants variables
 */

marmottajax.defaultData = {

	method: "get",
	json: false,
	watch: -1,

	parameters: {}

};

marmottajax.validMethods = ["get", "post", "put", "update", "delete"];

/**
 * normalize-data.js
 *
 * Normalize data in Ajax request
 */

marmottajax.normalize = function(data) {

	/**
	 * Search data in arguments
	 */

	if (data.length === 0) {

		return null;

	}

	var result = {};

	if (data.length === 1 && typeof data[0] === "object") {

		result = data[0];

	}

	else if (data.length === 1 && typeof data[0] === "string") {

		result = {

			url: data[0]

		};

	}

	else if (data.length === 2 && typeof data[0] === "string" && typeof data[1] === "object") {

		data[1].url = data[0];

		result = data[1];

	}

	/**
	 * Normalize data in arguments
	 */

	if (!(typeof result.method === "string" && marmottajax.validMethods.indexOf(result.method.toLowerCase()) != -1)) {

		result.method = marmottajax.defaultData.method;

	}

	else {

		result.method = result.method.toLowerCase();

	}

	if (typeof result.json !== "boolean") {

		result.json = marmottajax.defaultData.json;

	}

	if (typeof result.watch !== "number") {

		result.watch = marmottajax.defaultData.watch;

	}

	if (typeof result.parameters !== "object") {

		result.parameters = marmottajax.defaultData.parameters;

	}

	if (typeof result.headers !== "object") {

		result.headers = marmottajax.defaultData.headers;

	}

	return result;

};

/**
 * set-xhr.js
 *
 * Set Watcher 
 */

marmottajax.prototype.setWatcher = function() {

	if (this.watch !== -1) {

		this.watchIntervalFunction = function() {

			if (this.xhr.readyState === 4 && this.xhr.status === 200) {

				this.updateXhr();

			}

			this.watcherTimeout();

		};

		this.watcherTimeout();

		this.stop = function() {

			this.changeTime(-1);

		};

		this.changeTime = function(newTime) {

			clearTimeout(this.changeTimeout);

			this.watch = typeof newTime === "number" ? newTime : this.watch;

			this.watcherTimeout();

		};

	}

};

/**
 * set-xhr.js
 *
 * Set XMLHttpRequest 
 */

marmottajax.prototype.setXhr = function() {

	this.xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

	this.xhr.lastResult = null;

	this.xhr.json = this.json;
	this.xhr.binding = null;

	this.bind = function(binding) {

		this.xhr.binding = binding;

		return this;

	};

	this.cancel = function(callback) {

		this.xhr.abort();

		return this;

	};

	this.xhr.callbacks = {

		then: [],
		change: [],
		error: []

	};

	for (var name in this.xhr.callbacks) {

		if (this.xhr.callbacks.hasOwnProperty(name)) {

			this[name] = function(name) {

				return function(callback) {

					this.xhr.callbacks[name].push(callback);

					return this;

				};

			}(name);

		}

	}

	this.xhr.call = function(categorie, result) {

		for (var i = 0; i < this.callbacks[categorie].length; i++) {

			if (typeof(this.callbacks[categorie][i]) === "function") {

				if (this.binding) {

					this.callbacks[categorie][i].call(this.binding, result);

				}

				else {

					this.callbacks[categorie][i](result);

				}

			}

		}

	};

	this.xhr.onreadystatechange = function() {

		if (this.readyState === 4 && this.status == 200) {

			var result = this.responseText;

			if (this.json) {

				try {

					result = JSON.parse(result);

				}

				catch (error) {

					this.call("error", "invalid json");

					return false;

				}

			}

			this.lastResult = result;

			this.call("then", result);

		}

		else if (this.readyState === 4 && this.status == 404) {

			this.call("error", "404");

		}

		else if (this.readyState === 4) {

			this.call("error", "unknow");

		}

	};

	this.xhr.open(this.method, this.url, true);
	this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	if (this.headers) {
		for (header in this.headers) {
			if (this.headers.hasOwnProperty(header)) {
		
				this.xhr.setRequestHeader(header, this.headers[header]);
		
			}
		}
	}

	this.xhr.send(typeof this.postData != "undefined" ? this.postData : null);

};

/**
 * update-xhr.js
 *
 * Update XMLHttpRequest result 
 */

marmottajax.prototype.updateXhr = function() {

	var data = {

		lastResult: this.xhr.lastResult,

		json: this.xhr.json,
		binding: this.xhr.binding,

		callbacks: {

			then: this.xhr.callbacks.then,
			change: this.xhr.callbacks.change,
			error: this.xhr.callbacks.error

		}

	};

	this.xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

	this.xhr.lastResult = data.lastResult;

	this.xhr.json = data.json;
	this.xhr.binding = data.binding;

	this.xhr.callbacks = {

		then: data.callbacks.then,
		change: data.callbacks.change,
		error: data.callbacks.error

	};

	this.xhr.call = function(categorie, result) {

		for (var i = 0; i < this.callbacks[categorie].length; i++) {

			if (typeof(this.callbacks[categorie][i]) === "function") {

				if (this.binding) {

					this.callbacks[categorie][i].call(this.binding, result);

				}

				else {

					this.callbacks[categorie][i](result);

				}

			}

		}

	};

	this.xhr.onreadystatechange = function() {

		if (this.readyState === 4 && this.status == 200) {

			var result = this.responseText;

			if (this.json) {

				try {

					result = JSON.parse(result);

				}

				catch (error) {

					this.call("error", "invalid json");

					return false;

				}

			}

			isDifferent = this.lastResult != result;

			try {

				isDifferent = (typeof this.lastResult !== "string" ? JSON.stringify(this.lastResult) : this.lastResult) != (typeof result !== "string" ? JSON.stringify(result) : result);

			}

			catch (error) {}

			if (isDifferent) {

				this.call("change", result);

			}

			this.lastResult = result;

		}

		else if (this.readyState === 4 && this.status == 404) {

			this.call("error", "404");

		}

		else if (this.readyState === 4) {

			this.call("error", "unknow");

		}

	};

	this.xhr.open(this.method, this.url, true);
	this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	this.xhr.send(typeof postData != "undefined" ? postData : null);

};

/**
 * set-xhr.js
 *
 * Set Watcher 
 */

marmottajax.prototype.watcherTimeout = function() {

	if (this.watch !== -1) {

		this.changeTimeout = setTimeout(function(that) {

			return function() {

				that.watchIntervalFunction();

			};

		}(this), this.watch);

	}

};
},{}],3:[function(require,module,exports){
/* Riot v2.3.13, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window, undefined) {
  'use strict';
var riot = { version: 'v2.3.13', settings: {} },
  // be aware, internal usage
  // ATTENTION: prefix the global dynamic variables with `__`

  // counter to give a unique id to all the Tag instances
  __uid = 0,
  // tags instances cache
  __virtualDom = [],
  // tags implementation cache
  __tagImpl = {},

  /**
   * Const
   */
  // riot specific prefixes
  RIOT_PREFIX = 'riot-',
  RIOT_TAG = RIOT_PREFIX + 'tag',

  // for typeof == '' comparisons
  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',
  // special native tags that cannot be treated like the others
  SPECIAL_TAGS_REGEX = /^(?:opt(ion|group)|tbody|col|t[rhd])$/,
  RESERVED_WORDS_BLACKLIST = ['_item', '_id', '_parent', 'update', 'root', 'mount', 'unmount', 'mixin', 'isMounted', 'isLoop', 'tags', 'parent', 'opts', 'trigger', 'on', 'off', 'one'],

  // version# for IE 8-11, 0 for others
  IE_VERSION = (window && window.document || {}).documentMode | 0
/* istanbul ignore next */
riot.observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {}

  /**
   * Private variables and methods
   */
  var callbacks = {},
    slice = Array.prototype.slice,
    onEachEvent = function(e, fn) { e.replace(/\S+/g, fn) },
    defineProperty = function (key, value) {
      Object.defineProperty(el, key, {
        value: value,
        enumerable: false,
        writable: false,
        configurable: false
      })
    }

  /**
   * Listen to the given space separated list of `events` and execute the `callback` each time an event is triggered.
   * @param  { String } events - events ids
   * @param  { Function } fn - callback function
   * @returns { Object } el
   */
  defineProperty('on', function(events, fn) {
    if (typeof fn != 'function')  return el

    onEachEvent(events, function(name, pos) {
      (callbacks[name] = callbacks[name] || []).push(fn)
      fn.typed = pos > 0
    })

    return el
  })

  /**
   * Removes the given space separated list of `events` listeners
   * @param   { String } events - events ids
   * @param   { Function } fn - callback function
   * @returns { Object } el
   */
  defineProperty('off', function(events, fn) {
    if (events == '*' && !fn) callbacks = {}
    else {
      onEachEvent(events, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; cb = arr && arr[i]; ++i) {
            if (cb == fn) arr.splice(i--, 1)
          }
        } else delete callbacks[name]
      })
    }
    return el
  })

  /**
   * Listen to the given space separated list of `events` and execute the `callback` at most once
   * @param   { String } events - events ids
   * @param   { Function } fn - callback function
   * @returns { Object } el
   */
  defineProperty('one', function(events, fn) {
    function on() {
      el.off(events, on)
      fn.apply(el, arguments)
    }
    return el.on(events, on)
  })

  /**
   * Execute all callback functions that listen to the given space separated list of `events`
   * @param   { String } events - events ids
   * @returns { Object } el
   */
  defineProperty('trigger', function(events) {

    // getting the arguments
    // skipping the first one
    var args = slice.call(arguments, 1),
      fns

    onEachEvent(events, function(name) {

      fns = slice.call(callbacks[name] || [], 0)

      for (var i = 0, fn; fn = fns[i]; ++i) {
        if (fn.busy) return
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }

      if (callbacks['*'] && name != '*')
        el.trigger.apply(el, ['*', name].concat(args))

    })

    return el
  })

  return el

}
/* istanbul ignore next */
;(function(riot) {

/**
 * Simple client-side router
 * @module riot-route
 */


var RE_ORIGIN = /^.+?\/+[^\/]+/,
  EVENT_LISTENER = 'EventListener',
  REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
  ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
  HAS_ATTRIBUTE = 'hasAttribute',
  REPLACE = 'replace',
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
  TRIGGER = 'trigger',
  MAX_EMIT_STACK_LEVEL = 3,
  win = typeof window != 'undefined' && window,
  doc = typeof document != 'undefined' && document,
  hist = win && history,
  loc = win && (hist.location || win.location), // see html5-history-api
  prot = Router.prototype, // to minify more
  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
  started = false,
  central = riot.observable(),
  routeFound = false,
  debouncedEmit,
  base, current, parser, secondParser, emitStack = [], emitStackLevel = 0

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

/**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {array} array
 */
function DEFAULT_SECOND_PARSER(path, filter) {
  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
    args = path.match(re)

  if (args) return args.slice(1)
}

/**
 * Simple/cheap debounce implementation
 * @param   {function} fn - callback
 * @param   {number} delay - delay in seconds
 * @returns {function} debounced function
 */
function debounce(fn, delay) {
  var t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, delay)
  }
}

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function start(autoExec) {
  debouncedEmit = debounce(emit, 1)
  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit)
  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
  doc[ADD_EVENT_LISTENER](clickEvent, click)
  if (autoExec) emit(true)
}

/**
 * Router class
 */
function Router() {
  this.$ = []
  riot.observable(this) // make it observable
  central.on('stop', this.s.bind(this))
  central.on('emit', this.e.bind(this))
}

function normalize(path) {
  return path[REPLACE](/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot(href) {
  return (href || loc.href || '')[REPLACE](RE_ORIGIN, '')
}

/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase(href) {
  return base[0] == '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : getPathFromRoot(href)[REPLACE](base, '')
}

function emit(force) {
  // the stack is needed for redirections
  var isRoot = emitStackLevel == 0
  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return

  emitStackLevel++
  emitStack.push(function() {
    var path = getPathFromBase()
    if (force || path != current) {
      central[TRIGGER]('emit', path)
      current = path
    }
  })
  if (isRoot) {
    while (emitStack.length) {
      emitStack[0]()
      emitStack.shift()
    }
    emitStackLevel = 0
  }
}

function click(e) {
  if (
    e.which != 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) return

  var el = e.target
  while (el && el.nodeName != 'A') el = el.parentNode
  if (
    !el || el.nodeName != 'A' // not A tag
    || el[HAS_ATTRIBUTE]('download') // has download attr
    || !el[HAS_ATTRIBUTE]('href') // has no href attr
    || el.target && el.target != '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
  ) return

  if (el.href != loc.href) {
    if (
      el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
      || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
    ) return
  }

  e.preventDefault()
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
function go(path, title, shouldReplace) {
  if (hist) { // if a browser
    path = base + normalize(path)
    title = title || doc.title
    // browsers ignores the second parameter `title`
    shouldReplace
      ? hist.replaceState(null, title, path)
      : hist.pushState(null, title, path)
    // so we need to set it manually
    doc.title = title
    routeFound = false
    emit()
    return routeFound
  }

  // Server-side usage: directly execute handlers for the path
  return central[TRIGGER]('emit', getPathFromBase(path))
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 * @param {boolean} third - replace flag
 */
prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) go(first, second, third || false)
  else if (second) this.r(first, second)
  else this.r('@', first)
}

/**
 * Stop routing
 */
prot.s = function() {
  this.off('*')
  this.$ = []
}

/**
 * Emit
 * @param {string} path - path
 */
prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter))
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args))
      return routeFound = true // exit from loop
    }
  }, this)
}

/**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {function} action - action to register
 */
prot.r = function(filter, action) {
  if (filter != '@') {
    filter = '/' + normalize(filter)
    this.$.push(filter)
  }
  this.on(filter, action)
}

var mainRouter = new Router()
var route = mainRouter.m.bind(mainRouter)

/**
 * Create a sub router
 * @returns {function} the method of a new Router object
 */
route.create = function() {
  var newSubRouter = new Router()
  // stop only this sub-router
  newSubRouter.m.stop = newSubRouter.s.bind(newSubRouter)
  // return sub-router's main method
  return newSubRouter.m.bind(newSubRouter)
}

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
route.base = function(arg) {
  base = arg || '#'
  current = getPathFromBase() // recalculate current path
}

/** Exec routing right now **/
route.exec = function() {
  emit(true)
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 * @param {function} fn2 - your secondParser function
 */
route.parser = function(fn, fn2) {
  if (!fn && !fn2) {
    // reset parser for testing...
    parser = DEFAULT_PARSER
    secondParser = DEFAULT_SECOND_PARSER
  }
  if (fn) parser = fn
  if (fn2) secondParser = fn2
}

/**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
route.query = function() {
  var q = {}
  var href = loc.href || current
  href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

/** Stop routing **/
route.stop = function () {
  if (started) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit)
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
      doc[REMOVE_EVENT_LISTENER](clickEvent, click)
    }
    central[TRIGGER]('stop')
    started = false
  }
}

/**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 */
route.start = function (autoExec) {
  if (!started) {
    if (win) {
      if (document.readyState == 'complete') start(autoExec)
      // the timeout is needed to solve
      // a weird safari bug https://github.com/riot/route/issues/33
      else win[ADD_EVENT_LISTENER]('load', function() {
        setTimeout(function() { start(autoExec) }, 1)
      })
    }
    started = true
  }
}

/** Prepare the router **/
route.base()
route.parser()

riot.route = route
})(riot)
/* istanbul ignore next */

/**
 * The riot template engine
 * @version v2.3.20
 */

/**
 * @module brackets
 *
 * `brackets         ` Returns a string or regex based on its parameter
 * `brackets.settings` Mirrors the `riot.settings` object (use brackets.set in new code)
 * `brackets.set     ` Change the current riot brackets
 */
/*global riot */

var brackets = (function (UNDEF) {

  var
    REGLOB  = 'g',

    MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,
    STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

    S_QBSRC = STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

    DEFAULT = '{ }',

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBSRC, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBSRC, REGLOB),
      '{': RegExp('([{}])|'   + S_QBSRC, REGLOB)
    }

  var
    cachedBrackets = UNDEF,
    _regex,
    _pairs = []

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) bp = _pairs
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    var
      cvt,
      arr = pair.split(' ')

    if (pair === DEFAULT) {
      arr[2] = arr[0]
      arr[3] = arr[1]
      cvt = _loopback
    }
    else {
      if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) {
        throw new Error('Unsupported brackets "' + pair + '"')
      }
      arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '))
      cvt = _rewrite
    }
    arr[4] = cvt(arr[1].length > 1 ? /{[\S\s]*?}/ : /{[^}]*}/, arr)
    arr[5] = cvt(/\\({|})/g, arr)
    arr[6] = cvt(/(\\?)({)/g, arr)
    arr[7] = RegExp('(\\\\?)(?:([[({])|(' + arr[3] + '))|' + S_QBSRC, REGLOB)
    arr[8] = pair
    return arr
  }

  function _reset (pair) {
    if (!pair) pair = DEFAULT

    if (pair !== _pairs[8]) {
      _pairs = _create(pair)
      _regex = pair === DEFAULT ? _loopback : _rewrite
      _pairs[9] = _regex(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/)
      _pairs[10] = _regex(/(^|[^\\]){=[\S\s]*?}/)
      _brackets._rawOffset = _pairs[0].length
    }
    cachedBrackets = pair
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _pairs[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) _bp = _pairs

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6]

    isexpr = start = re.lastIndex = 0

    while (match = re.exec(str)) {

      pos = match.index

      if (isexpr) {

        if (match[2]) {
          re.lastIndex = skipBraces(match[2], re.lastIndex)
          continue
        }

        if (!match[3])
          continue
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos))
        start = re.lastIndex
        re = _bp[6 + (isexpr ^= 1)]
        re.lastIndex = start
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start))
    }

    return parts

    function unescapeStr (str) {
      if (tmpl || isexpr)
        parts.push(str && str.replace(_bp[5], '$1'))
      else
        parts.push(str)
    }

    function skipBraces (ch, pos) {
      var
        match,
        recch = FINDBRACES[ch],
        level = 1
      recch.lastIndex = pos

      while (match = recch.exec(str)) {
        if (match[1] &&
          !(match[1] === ch ? ++level : --level)) break
      }
      return match ? recch.lastIndex : str.length
    }
  }

  _brackets.hasExpr = function hasExpr (str) {
    return _brackets(4).test(str)
  }

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_brackets(9))
    return m ?
      { key: m[1], pos: m[2], val: _pairs[0] + m[3].trim() + _pairs[1] } : { val: expr.trim() }
  }

  _brackets.array = function array (pair) {
    return _create(pair || cachedBrackets)
  }

  var _settings
  function _setSettings (o) {
    var b
    o = o || {}
    b = o.brackets
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    })
    _settings = o
    _reset(b)
  }
  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  })

  /* istanbul ignore next: in the node version riot is not in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
  _brackets.set = _reset

  _brackets.R_STRINGS = STRINGS
  _brackets.R_MLCOMMS = MLCOMMS
  _brackets.S_QBLOCKS = S_QBSRC

  return _brackets

})()

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */
/*global riot */

var tmpl = (function () {

  var _cache = {}

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.isRaw = function (expr) {
    return expr[brackets._rawOffset] === '='
  }

  _tmpl.haveRaw = function (src) {
    return brackets(10).test(src)
  }

  _tmpl.hasExpr = brackets.hasExpr

  _tmpl.loopKeys = brackets.loopKeys

  _tmpl.errorHandler = null

  function _logErr (err, ctx) {

    if (_tmpl.errorHandler) {

      err.riotData = {
        tagName: ctx && ctx.root && ctx.root.tagName,
        _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
      }
      _tmpl.errorHandler(err)
    }
  }

  function _create (str) {

    var expr = _getTmpl(str)
    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr

    return new Function('E', expr + ';')
  }

  var
    RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
    RE_QBMARK = /\x01(\d+)~/g

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets.split(str.replace(/\u2057/g, '"'), 1)

    if (parts.length > 2 || parts[0]) {
      var i, j, list = []

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr = i & 1 ?

              _parseExpr(expr, 1, qstr) :

              '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr

      }

      expr = j < 2 ? list[0] :
             '[' + list.join(',') + '].join("")'
    }
    else {

      expr = _parseExpr(parts[1], 0, qstr)
    }

    if (qstr[0])
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      })

    return expr
  }

  var
    CS_IDENT = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/

  function _parseExpr (expr, asText, qstr) {

    if (expr[0] === '=') expr = expr.slice(1)

    expr = expr
          .replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? '\x01' + (qstr.push(s) - 1) + '~' : s
          })
          .replace(/\s+/g, ' ').trim()
          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')

    if (expr) {
      var
        list = [],
        cnt = 0,
        match

      while (expr &&
            (match = expr.match(CS_IDENT)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g

        expr = RegExp.rightContext
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

        jsb  = expr.slice(0, match.index)
        expr = RegExp.rightContext

        list[cnt++] = _wrapExpr(jsb, 1, key)
      }

      expr = !cnt ? _wrapExpr(expr, asText) :
          cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
    }
    return expr

    function skipBraces (jsb, re) {
      var
        match,
        lv = 1,
        ir = jsb === '(' ? /[()]/g : jsb === '[' ? /[[\]]/g : /[{}]/g

      ir.lastIndex = re.lastIndex
      while (match = ir.exec(expr)) {
        if (match[0] === jsb) ++lv
        else if (!--lv) break
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex
    }
  }

  // istanbul ignore next: not both
  var
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/

  function _wrapExpr (expr, asText, key) {
    var tb

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar
          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
        }
        else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos))
        }
      }
      return match
    })

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
    }

    if (key) {

      expr = (tb ?
          'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""'
    }
    else if (asText) {

      expr = 'function(v){' + (tb ?
          expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)'
    }

    return expr
  }

  // istanbul ignore next: compatibility fix for beta versions
  _tmpl.parse = function (s) { return s }

  return _tmpl

})()

  tmpl.version = brackets.version = 'v2.3.20'


/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below

*/
// http://kangax.github.io/compat-table/es5/#ie8
// http://codeplanet.io/dropping-ie8/

var mkdom = (function (checkIE) {

  var rootEls = {
      tr: 'tbody',
      th: 'tr',
      td: 'tr',
      tbody: 'table',
      col: 'colgroup'
    },
    reToSrc = /<yield\s+to=(['"])?@\1\s*>([\S\s]+?)<\/yield\s*>/.source,
    GENERIC = 'div'

  checkIE = checkIE && checkIE < 10

  // creates any dom element in a div, table, or colgroup container
  function _mkdom(templ, html) {

    var match = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      rootTag = rootEls[tagName] || GENERIC,
      el = mkEl(rootTag)

    el.stub = true

    // replace all the yield tags with the tag inner html
    if (html) templ = replaceYield(templ, html)

    /* istanbul ignore next */
    if (checkIE && tagName && (match = tagName.match(SPECIAL_TAGS_REGEX)))
      ie9elem(el, templ, tagName, !!match[1])
    else
      el.innerHTML = templ

    return el
  }

  // creates tr, th, td, option, optgroup element for IE8-9
  /* istanbul ignore next */
  function ie9elem(el, html, tagName, select) {

    var div = mkEl(GENERIC),
      tag = select ? 'select>' : 'table>',
      child

    div.innerHTML = '<' + tag + html + '</' + tag

    child = $(tagName, div)
    if (child)
      el.appendChild(child)

  }
  // end ie9elem()

  /**
   * Replace the yield tag from any tag template with the innerHTML of the
   * original tag in the page
   * @param   { String } templ - tag implementation template
   * @param   { String } html  - original content of the tag in the DOM
   * @returns { String } tag template updated without the yield tag
   */
  function replaceYield(templ, html) {
    // do nothing if no yield
    if (!/<yield\b/i.test(templ)) return templ

    // be careful with #1343 - string on the source having `$1`
    var n = 0
    templ = templ.replace(/<yield\s+from=['"]([-\w]+)['"]\s*(?:\/>|>\s*<\/yield\s*>)/ig,
      function (str, ref) {
        var m = html.match(RegExp(reToSrc.replace('@', ref), 'i'))
        ++n
        return m && m[2] || ''
      })

    // yield without any "from", replace yield in templ with the innerHTML
    return n ? templ : templ.replace(/<yield\s*(?:\/>|>\s*<\/yield\s*>)/gi, html || '')
  }

  return _mkdom

})(IE_VERSION)

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {

  var i = tags.length,
    j = items.length,
    t

  while (i > j) {
    t = tags[--i]
    tags.splice(i, 1)
    t.unmount()
  }
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(child, i) {
  Object.keys(child.tags).forEach(function(tagName) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  })
}

/**
 * Adds the elements for a virtual tag
 * @param { Tag } tag - the tag whose root's children will be inserted or appended
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function addVirtual(tag, src, target) {
  var el = tag._root, sib
  tag._virts = []
  while (el) {
    sib = el.nextSibling
    if (target)
      src.insertBefore(el, target._root)
    else
      src.appendChild(el)

    tag._virts.push(el) // hold for unmounting
    el = sib
  }
}

/**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 * @param { Number } len - how many child nodes to move
 */
function moveVirtual(tag, src, target, len) {
  var el = tag._root, sib, i = 0
  for (; i < len; i++) {
    sib = el.nextSibling
    src.insertBefore(el, target._root)
    el = sib
  }
}


/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __tagImpl[tagName] || { tmpl: dom.outerHTML },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = /option/gi.test(tagName), // the option tags must be treated differently
    tags = [],
    oldItems = [],
    hasKeys,
    isVirtual = dom.tagName == 'VIRTUAL'

  // parse the each expression
  expr = tmpl.loopKeys(expr)

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)

  // clean template code
  parent.one('before-mount', function () {

    // remove the original DOM node
    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()



    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    // loop all the new items
    items.forEach(function(item, i) {
      // reorder only if the items are objects
      var _mustReorder = mustReorder && item instanceof Object,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!__tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()
        if (isVirtual) tag._root = tag.root.firstChild // save reference for further moves or inserts
        // this tag must be appended
        if (i == tags.length) {
          if (isVirtual)
            addVirtual(tag, frag)
          else frag.appendChild(tag.root)
        }
        // this tag must be insert
        else {
          if (isVirtual)
            addVirtual(tag, root, tags[i])
          else root.insertBefore(tag.root, tags[i].root)
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        pos = i // handled here so no move
      } else tag.update(item)

      // reorder the tag if it's not located in its previous position
      if (pos !== i && _mustReorder) {
        // update the DOM
        if (isVirtual)
          moveVirtual(tag, root, tags[i], dom.childNodes.length)
        else root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)

    }, true) // allow null values

    // remove the redundant tags
    unmountRedundant(items, tags)

    // insert the new nodes
    if (isOption) root.appendChild(frag)
    else root.insertBefore(frag, ref)

    // set the 'tags' property of the parent tag
    // if child is 'undefined' it means that we don't need to set this property
    // for example:
    // we don't need store the `myTag.tags['div']` property if we are looping a div tag
    // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
    if (child) parent.tags[tagName] = tags

    // clone the items array
    oldItems = items.slice()

  })

}
/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = (function(_riot) {

  if (!window) return { // skip injection on the server
    add: function () {},
    inject: function () {}
  }

  var styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]')
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  })()

  // Create cache and shortcut to the correct property
  var cssTextProp = styleNode.styleSheet,
    stylesToInject = ''

  // Expose the style node in a non-modificable property
  Object.defineProperty(_riot, 'styleNode', {
    value: styleNode,
    writable: true
  })

  /**
   * Public api
   */
  return {
    /**
     * Save a tag style to be later injected into DOM
     * @param   { String } css [description]
     */
    add: function(css) {
      stylesToInject += css
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     */
    inject: function() {
      if (stylesToInject) {
        if (cssTextProp) cssTextProp.cssText += stylesToInject
        else styleNode.innerHTML += stylesToInject
        stylesToInject = ''
      }
    }
  }

})(riot)


function parseNamedElements(root, tag, childTags, forceParsingNamed) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop ||
                  (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each'))
                    ? 1 : 0

      // custom child tag
      if (childTags) {
        var child = getTag(dom)

        if (child && !dom.isLoop)
          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
      }

      if (!dom.isLoop || forceParsingNamed)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (tmpl.hasExpr(val)) {
      expressions.push(extend({ dom: dom, expr: val }, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType,
      attr

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    attr = getAttr(dom, 'each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
    opts = inherit(conf.opts) || {},
    parent = conf.parent,
    isLoop = conf.isLoop,
    hasImpl = conf.hasImpl,
    item = cleanUpData(conf.item),
    expressions = [],
    childTags = [],
    root = conf.root,
    fn = impl.fn,
    tagName = root.tagName.toLowerCase(),
    attr = {},
    propsInSyncWithParent = [],
    dom

  if (fn && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop

  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (tmpl.hasExpr(val)) attr[el.name] = val
  })

  dom = mkdom(impl.tmpl, innerHTML)

  // options
  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    // update opts from current DOM attributes
    each(root.attributes, function(el) {
      var val = el.value
      opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
    })
    // recover those with expressions
    each(Object.keys(attr), function(name) {
      opts[toCamel(name)] = tmpl(attr[name], ctx)
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    if (!self.parent || !isLoop) return
    each(Object.keys(self.parent), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !contains(RESERVED_WORDS_BLACKLIST, k) && contains(propsInSyncWithParent, k)
      if (typeof self[k] === T_UNDEF || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = self.parent[k]
      }
    })
  }

  defineProperty(this, 'update', function(data) {

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent
    inheritFromParent()
    // normalize the tag properties in case an item object was initially passed
    if (data && typeof item === T_OBJECT) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self)
    // the updated event will be triggered
    // once the DOM will be ready and all the reflows are completed
    // this is useful if you want to get the "real" root properties
    // 4 ex: root.offsetWidth ...
    rAF(function() { self.trigger('updated') })
    return this
  })

  defineProperty(this, 'mixin', function() {
    each(arguments, function(mix) {
      var instance

      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
        // save the prototype to loop it afterwards
        mix = mix.prototype
      } else instance = mix

      // loop the keys in the function prototype or the all object keys
      each(Object.getOwnPropertyNames(mix), function(key) {
        // bind methods to self
        if (key != 'init')
          self[key] = isFunction(instance[key]) ?
                        instance[key].bind(self) :
                        instance[key]
      })

      // init method will be called automatically
      if (instance.init) instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function() {

    updateOpts()

    // initialiation
    if (fn) fn.call(self, opts)

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    // mount the child tags
    toggle(true)

    // update the root adding custom attributes coming from the compiler
    // it fixes also #1087
    if (impl.attrs || hasImpl) {
      walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
      parseExpressions(self.root, self, expressions)
    }

    if (!self.parent || isLoop) self.update(item)

    // internal use only, fixes #403
    self.trigger('before-mount')

    if (isLoop && !hasImpl) {
      // update the root attribute for the looped elements
      self.root = root = dom.firstChild

    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) self.root = root = parent.root
    }

    // parse the named dom nodes in the looped child
    // adding them to the parent as well
    if (isLoop)
      parseNamedElements(self.root, self.parent, null, true)

    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  })


  defineProperty(this, 'unmount', function(keepRootTag) {
    var el = root,
      p = el.parentNode,
      ptag

    self.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    __virtualDom.splice(__virtualDom.indexOf(self), 1)

    if (this._virts) {
      each(this._virts, function(v) {
        v.parentNode.removeChild(v)
      })
    }

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (isArray(ptag.tags[tagName]))
          each(ptag.tags[tagName], function(tag, i) {
            if (tag._riot_id == self._riot_id)
              ptag.tags[tagName].splice(i, 1)
          })
        else
          // otherwise just delete the tag instance
          ptag.tags[tagName] = undefined
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else
        // the riot-tag attribute isn't needed anymore, remove it
        remAttr(p, 'riot-tag')
    }


    self.trigger('unmount')
    toggle()
    self.off('*')
    self.isMounted = false
    delete root._tag

  })

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (!parent) return
    var evt = isMount ? 'on' : 'off'

    // the loop tags will be always in sync with the parent automatically
    if (isLoop)
      parent[evt]('unmount', self.unmount)
    else
      parent[evt]('update', self.update)[evt]('unmount', self.unmount)
  }

  // named elements available for fn
  parseNamedElements(dom, this, childTags)

}
/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item,
      el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    // cross browser event fix
    e = e || window.event

    // override the event properties
    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}


/**
 * Insert a DOM node replacing another one (used by if- attribute)
 * @param   { Object } root - parent node
 * @param   { Object } node - node replaced
 * @param   { Object } before - node added
 */
function insertTo(root, node, before) {
  if (!root) return
  root.insertBefore(before, node)
  root.removeChild(node)
}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = expr.dom.parentNode

    if (expr.bool)
      value = value ? attrName : false
    else if (value == null)
      value = ''

    // leave out riot- prefixes from strings inside textarea
    // fix #815: any value -> string
    if (parent && parent.tagName == 'TEXTAREA') {
      value = ('' + value).replace(/riot-/g, '')
      // change textarea's value
      parent.value = value
    }

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attrName) {
      dom.nodeValue = '' + value    // #815 related
      return
    }

    // remove original attribute
    remAttr(dom, attrName)
    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub,
        add = function() { insertTo(stub.parentNode, stub, dom) },
        remove = function() { insertTo(dom.parentNode, dom, stub) }

      // add to DOM
      if (value) {
        if (stub) {
          add()
          dom.inStub = false
          // avoid to trigger the mount event if the tags is not visible yet
          // maybe we can optimize this avoiding to mount the tag at all
          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted)
                el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }
      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        // if the parentNode is defined we can easily replace the tag
        if (dom.parentNode)
          remove()
        // otherwise we need to wait the updated event
        else (tag.parent || tag).one('updated', remove)

        dom.inStub = true
      }
    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
      if (value)
        setAttr(dom, attrName.slice(RIOT_PREFIX.length), value)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
      }

      if (value === 0 || value && typeof value !== T_OBJECT)
        setAttr(dom, attrName, value)

    }

  })

}
/**
 * Loops an array
 * @param   { Array } els - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]
    // return false -> remove current item during loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

/**
 * Detect if the argument passed is a function
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
function isFunction(v) {
  return typeof v === T_FUNCTION || false   // avoid IE problems
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name)
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } string - input string
 * @returns { String } my-string -> myString
 */
function toCamel(string) {
  return string.replace(/-(\w)/g, function(_, c) {
    return c.toUpperCase()
  })
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  dom.setAttribute(name, val)
}

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
function getTag(dom) {
  return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
}
/**
 * Add a child tag to its parent into the `tags` object
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the new tag will be stored
 * @param   { Object } parent - tag instance where the new child tag will be included
 */
function addChildTag(tag, tagName, parent) {
  var cachedTag = parent.tags[tagName]

  // if there are multiple children tags having the same name
  if (cachedTag) {
    // if the parent tags property is not yet an array
    // create it adding the first cached tag
    if (!isArray(cachedTag))
      // don't add the same tag twice
      if (cachedTag !== tag)
        parent.tags[tagName] = [cachedTag]
    // add the new nested tag to the array
    if (!contains(parent.tags[tagName], tag))
      parent.tags[tagName].push(tag)
  } else {
    parent.tags[tagName] = tag
  }
}

/**
 * Move the position of a custom tag in its parent tag
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tag, tagName, newPos) {
  var parent = tag.parent,
    tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
  else addChildTag(tag, tagName, parent)
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag(child, opts, innerHTML),
    tagName = getTagName(opts.root),
    ptag = getImmediateCustomParentTag(parent)
  // fix for the parent attribute in the looped elements
  tag.parent = ptag
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag._parent = parent

  // add this tag to the custom parent tag
  addChildTag(tag, tagName, ptag)
  // and also to the real parent tag
  if (ptag !== parent)
    addChildTag(tag, tagName, parent)
  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  opts.root.innerHTML = ''

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (!getTag(ptag.root)) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
* @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: false
  }, options))
  return el
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom) {
  var child = getTag(dom),
    namedTag = getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
}

/**
 * Check whether an array contains an item
 * @param   { Array } arr - target array
 * @param   { * } item - item to test
 * @returns { Boolean } Does 'arr' contain 'item'?
 */
function contains(arr, item) {
  return ~arr.indexOf(item)
}

/**
 * Check whether an object is a kind of array
 * @param   { * } a - anything
 * @returns {Boolean} is 'a' an array?
 */
function isArray(a) { return Array.isArray(a) || a instanceof Array }

/**
 * Detect whether a property of an object could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } is this property writable?
 */
function isWritable(obj, key) {
  var props = Object.getOwnPropertyDescriptor(obj, key)
  return typeof obj[key] === T_UNDEF || props && props.writable
}


/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
    return data

  var o = {}
  for (var key in data) {
    if (!contains(RESERVED_WORDS_BLACKLIST, key))
      o[key] = data[key]
  }
  return o
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 */
function walk(dom, fn) {
  if (dom) {
    // stop the recursion
    if (fn(dom) === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttributes(html, fn) {
  var m,
    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while (m = re.exec(html)) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

/**
 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
 * @param   { Object }  dom - DOM node we want to parse
 * @returns { Boolean } -
 */
function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @returns { Object } DOM node just created
 */
function mkEl(name) {
  return document.createElement(name)
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/**
 * Get the name property needed to identify a DOM node in riot
 * @param   { Object } dom - DOM node we need to parse
 * @returns { String | undefined } give us back a string to identify this dom node
 */
function getNamedKey(dom) {
  return getAttr(dom, 'id') || getAttr(dom, 'name')
}

/**
 * Set the named properties of a tag element
 * @param { Object } dom - DOM node we need to parse
 * @param { Object } parent - tag instance where the named dom element will be eventually added
 * @param { Array } keys - list of all the tag instance properties
 */
function setNamed(dom, parent, keys) {
  // get the key value we want to add to the tag instance
  var key = getNamedKey(dom),
    isArr,
    // add the node detected to a tag instance using the named property
    add = function(value) {
      // avoid to override the tag properties already set
      if (contains(keys, key)) return
      // check whether this value is an array
      isArr = isArray(value)
      // if the key was never set
      if (!value)
        // set it once on the tag instance
        parent[key] = dom
      // if it was an array and not yet set
      else if (!isArr || isArr && !contains(value, dom)) {
        // add the dom node into the array
        if (isArr)
          value.push(dom)
        else
          parent[key] = [value, dom]
      }
    }

  // skip the elements with no named properties
  if (!key) return

  // check whether this key has been already evaluated
  if (tmpl.hasExpr(key))
    // wait the first updated event only once
    parent.one('mount', function() {
      key = getNamedKey(dom)
      add(parent[key])
    })
  else
    add(parent[key])

}

/**
 * Faster String startsWith alternative
 * @param   { String } src - source string
 * @param   { String } str - test string
 * @returns { Boolean } -
 */
function startsWith(src, str) {
  return src.slice(0, str.length) === str
}

/**
 * requestAnimationFrame function
 * Adapted from https://gist.github.com/paulirish/1579671, license MIT
 */
var rAF = (function (w) {
  var raf = w.requestAnimationFrame    ||
            w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame

  if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {  // buggy iOS6
    var lastTime = 0

    raf = function (cb) {
      var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0)
      setTimeout(function () { cb(lastTime = nowtime + timeout) }, timeout)
    }
  }
  return raf

})(window || {})

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts) {
  var tag = __tagImpl[tagName],
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    // add this tag to the virtualDom variable
    if (!contains(__virtualDom, tag)) __virtualDom.push(tag)
  }

  return tag
}
/**
 * Riot public api
 */

// share methods for other riot parts, e.g. compiler
riot.util = { brackets: brackets, tmpl: tmpl }

/**
 * Create a mixin that could be globally shared across all the tags
 */
riot.mixin = (function() {
  var mixins = {}

  /**
   * Create/Return a mixin by its name
   * @param   { String } name - mixin name
   * @param   { Object } mixin - mixin logic
   * @returns { Object } the mixin logic
   */
  return function(name, mixin) {
    if (!mixin) return mixins[name]
    mixins[name] = mixin
  }

})()

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else styleManager.add(css)
  }
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @param   { string }  [bpair] - brackets used in the compilation
 * @returns { String } name/id of the tag just created
 */
riot.tag2 = function(name, html, css, attrs, fn, bpair) {
  if (css) styleManager.add(css)
  //if (bpair) riot.settings.brackets = bpair
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { String } selector - tag DOM selector
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
riot.mount = function(selector, tagName, opts) {

  var els,
    allTags,
    tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      if (!/[^-\w]/.test(e))
        list += ',*[' + RIOT_TAG + '=' + e.trim() + ']'
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(__tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    var last

    if (root.tagName) {
      if (tagName && (!(last = getAttr(root, RIOT_TAG)) || last != tagName))
        setAttr(root, RIOT_TAG, tagName)

      var tag = mountTo(root, tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    } else if (root.length)
      each(root, pushTags)   // assume nodeList

  }

  // ----- mount code -----

  // inject styles into DOM
  styleManager.inject()

  if (typeof tagName === T_OBJECT) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*')
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    else
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(','))

    // make sure to pass always a selector
    // to the querySelectorAll function
    els = selector ? $$(selector) : []
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName)
      els = $$(tagName, els)
    else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  if (els.tagName)
    pushTags(els)
  else
    each(els, pushTags)

  return tags
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
riot.update = function() {
  return each(__virtualDom, function(tag) {
    tag.update()
  })
}

/**
 * Export the Tag constructor
 */
riot.Tag = Tag
  // support CommonJS, AMD & browser
  /* istanbul ignore next */
  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);

},{}],4:[function(require,module,exports){
/**
  Rowjam
  A javascript library which makes it easier to process data from a database.
*/

module.exports = Rowjam;

var value = null;

function Rowjam(table, makeCopy) {
  var newMe = Object.create(Rowjam.prototype);
  if (makeCopy === false) {
    newMe.value = table;        
  } else {
    newMe.value = Rowjam.copyValue(table);
  }
  return newMe;
}


Rowjam.prototype.copy = function() {
  var newMe = Object.create(Rowjam.prototype);
  newMe.value = Rowjam.copyValue(this.value);
  return newMe;      
}

Rowjam.prototype.setTypes = function(typeOptions) {
  var table = this.value;
  var n = table.length;
  var typeArr = ['string','number','boolean'];
  var typeLookup = {}
  
  // to avoid lookups later on
  for (var column in typeOptions) {
    var newType = typeOptions[column];
    typeLookup[column] = typeArr.indexOf(newType);
  }
  
  // iterate over each row
  for (var i=0; i<n; i++) {
    var row = table[i];
    
    // iterate over each column in each row
    for (var column in typeOptions) {
      var oldVal = row[column];
      
      switch (typeLookup[column]) {
      case 0:
        row[column] = String(oldVal);
        break;
      case 1:
        row[column] = Number(oldVal);
        break;
      case 2:
        if (oldVal === "0") {
          row[column] = false; // fix obscure javascript behavior
        } else {
          row[column] = Boolean(oldVal);
        }
        break;
      }
    }
  }
  
  this.value = table;
  
  return this;
}

Rowjam.prototype.summarize = function(colsToSum, colsToConcat, delim, rowCountColumn) {
  var table = this.value;
  if (typeof(colsToSum) === 'undefined' || colsToSum === null) colsToSum = [];
  if (typeof(colsToConcat) === 'undefined' || colsToConcat === null) colsToConcat = [];
  if (typeof(delim) === 'undefined' || delim === null) delim = "\n";
  if (typeof(rowCountColumn) === 'undefined' || rowCountColumn === null) rowCountColumn = "";
  
  var summary = {};
  
  if (rowCountColumn.length > 0) {
    summary[rowCountColumn] = table.length;
  }
  
  // set number columns to 0.0
  for (var colIndex=0, nCols=colsToSum.length; colIndex<nCols; colIndex++) {
    var column = colsToSum[colIndex];
    summary[column] = 0.0;
  }
  
  // set text columns to ""
  for (var colIndex=0, nCols=colsToConcat.length; colIndex<nCols; colIndex++) {
    var column = colsToConcat[colIndex];
    summary[column] = "";
  }
  
  
  for (var rowIndex=0, nRows = table.length; rowIndex<nRows; rowIndex++) {
    var row = table[rowIndex];
    for (var colIndex=0, nCols=colsToSum.length; colIndex<nCols; colIndex++) {
      var column = colsToSum[colIndex];
      summary[column] += row[column];
    }
    
    for (var colIndex=0, nCols=colsToConcat.length; colIndex<nCols; colIndex++) {
      var column = colsToConcat[colIndex];
      if (summary[column].length > 0) {
        summary[column] += delim;
      }
      summary[column] += row[column];
    }
    
  }
  return summary;
};

Rowjam.prototype.findFirst = function(column, operator, value, caseSensitive)
{
  var found = Rowjam.multipurposeFilter(this.value, column, operator, value, caseSensitive, 1);
  if (found.length > 0) {
    return found[1][0];
  }
  return null;
}

Rowjam.prototype.indexOf = function(column, operator, value, caseSensitive)
{
  var found = Rowjam.multipurposeFilter(this.value, column, operator, value, caseSensitive, 1);
  var foundIndex = found[0];
  var foundArray = found[1];
  
  if (foundArray.length > 0) {
    return foundIndex;
  }
  return -1;
}

Rowjam.prototype.find = function(column, operator, value, caseSensitive)
{
  return Rowjam.multipurposeFilter(this.value, column, operator, value, caseSensitive, 0)[1];
}

Rowjam.prototype.filter = function(column, operator, value, caseSensitive)
{
  var found = Rowjam.multipurposeFilter(this.value, column, operator, value, caseSensitive, 0);
  this.value = found[1];
  
  return this;
}

Rowjam.multipurposeFilter = function(table, column, operator, value, caseSensitive, maxToFind)
{
  var found = [];
  var numFound = 0;
  var matchCase = false;
  if (typeof(caseSensitive) === undefined || caseSensitive === null) matchCase = true;

  // var table = this.value;
  var op = ['===', '=', '==','<', '>', '<=', '>=', 'empty', 'notempty', 'starts', 'contains'].indexOf(operator);
  if (value &&  typeof(value) === 'string' && matchCase) {
    value = value.toLowerCase();
  }
  
  for (var i=0, n=table.length; i<n; i++) {
    var row = table[i];
    var val = row[column];
    if (val && typeof val === 'string' && matchCase) {
      val = val.toLowerCase(val);
    }
    var keep = false;
    switch (op) {
    case 0:
    case 1:
    case 2:
      keep = val === value;
      break;
    case 3:
      keep = val < value;
      break;
    case 4:
      keep = val > value;
      break;
    case 5:
      keep = val <= value;
      break;
    case 6:
      keep = val >= value;
      break;
    case 7:
      keep = Rowjam.empty(val);
      break;
    case 8:
      keep = !Rowjam.empty(val);
      break;
    case 9: 
      keep = val.indexOf(value) === 0;
      break;
    case 10:
      keep = val.indexOf(value) >= 0;
      break;
    }
    
    if (keep) {
      numFound += 1;
      found.push(row);
      if (maxToFind > 0 && maxToFind === numFound) {
        return [i,found];
      }
    }
  }

  return [-1,found];
  // this.value = found;
  //
  // return this;
};

Rowjam.prototype.toLookup = function(keyColumn)
{
  var table = this.value;
  
  var lookup = {};
  
  var nRows=table.length;
  
  for (var i=0; i<nRows; i++) {
    var row = table[i];
    var primaryValue = row[keyColumn];
    if (lookup[primaryValue] === undefined) {
      lookup[primaryValue] = [row];
    } else {
      lookup[primaryValue].push(row);
    }
  }
  
  return lookup;
};

Rowjam.prototype.joinAsArray = function(saveColumn, srcColumn, joinTable, joinColumn)
{
  var table = this.value;
  var lookup = new Rowjam(joinTable).toLookup(joinColumn);
  
  for (var i=0, n=table.length; i<n; i++) {
    var row = table[i];
    var rowId = row[srcColumn];
    var joinedArr = lookup[rowId];
    if (joinedArr && joinedArr != undefined) {
      row[saveColumn] = joinedArr;
    } else {
      row[saveColumn] = [];
    }
  }
  
  this.value = table;
  return this;
};

Rowjam.prototype.joinAsSummary = function(saveColumn, srcColumn, joinTable, joinColumn, colsToSum, colsToConcat, delim, rowCountColumn)
{
  var table = this.value;
  var lookup = new Rowjam(joinTable).toLookup(joinColumn);
  if (colsToSum === undefined) {colsToSum = []};
  if (colsToConcat === undefined) {colsToConcat = []};
  if (delim === undefined) {delim = "\n"}
  
  for (var i=0, n=table.length; i<n; i++) {
    var row = table[i];
    var rowId = row[srcColumn];
    var joinedArr = lookup[rowId];
    if (joinedArr == undefined) {
      joinedArr = [];
    }
   var summary = new Rowjam(joinedArr).summarize(colsToSum, colsToConcat, delim, rowCountColumn);
   if (saveColumn.length === 0) {
     Rowjam.mergeProperties(row, summary);
   } else {
     row[saveColumn] = summary;
   }
  }
  
  this.value = table;
  return this;
};

/*
  takes an array of keys [key1, key2, key3]  and flattens data from [{key1:value,key2:value,key3:value}] to [[value,value,value],[value,value,value]] in the order of given keys.
*/
Rowjam.prototype.flatten_rows = function(keys) {
  var table = this.value;
  var outArray = [];
  if (!keys) {
    return this.flatten_each_row();
  }
  var nKeys = keys.length;
  for (var i=0; i<table.length; i++) {
    var row = table[i];
    var arrayRow = [];    
    for (var k=0; k<nKeys; k++) {
      var key = keys[k];
      arrayRow.push(row[key]);
    }
    outArray.push(arrayRow);
  }
  return outArray;
}

Rowjam.prototype.flatten_each_row = function()
{
  var table = this.value;
  var outArray = [];
  for (var i=0; i<table.length; i++) {
    var row = table[i];
    var arrayRow = [];    
    var keys = Object.keys(row);
    var nKeys = keys.length;
    
    for (var k=0; k<nKeys; k++) {
      var key = keys[k];
      arrayRow.push(row[key]);
    }
    outArray.push(arrayRow);
  }
  return outArray;
}


Rowjam.csvValue = function(val, delim) {
  if (!val)
    return '';
  val = val.toString();
  if ((val.indexOf(delim) === -1) && val.indexOf('"') === -1)
    return val;
  return '"' + val + '"';
}

Rowjam.prototype.to_csv = function(keys, displayHeaders) {
  var table = this.value;
  var colHeaderArr = [];
  var csvArr = [];
  var text = "";
  var nKeys = keys.length;
  var delim = ",";
  
  // set up column headers
  for (var i=0; i<nKeys; i++) {
    colHeaderArr.push( Rowjam.csvValue(displayHeaders[i]) );
  }
  
  // process data into csvArr
  for (var i=0; i<table.length; i++) {
    var row = table[i];
    var arrayRow = [];
    for (var k=0; k<nKeys; k++) {
      var key = keys[k];
      arrayRow.push(Rowjam.csvValue(row[key], delim));
    }
    csvArr.push(arrayRow);
  }
    
  // create text output
  text += "data:text/csv;charset=utf-8,";
  text += colHeaderArr.join(delim);
  text += "\n";
  for (var i=0; i<csvArr.length; i++) {
    text += csvArr[i].join(delim);
    text += "\n";
  }
  text += "\n";
 
  return text;
}

Rowjam.saveAsCsv = function( csvData, filename ) {
  data = encodeURI(csvData);
  link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', filename );
  link.click();
}

Rowjam.prototype.to_json = function() {
  return JSON.stringify(this.value);
}

Rowjam.prototype.dump = function() {
  console.log(JSON.stringify(this.value, null, 4));
  
  return this;
}

Rowjam.print = function(data) {
  console.log(JSON.stringify(data, null, 4));  
}

Rowjam.prototype.values = function(column, unique) {
  var table = this.value;
  if (typeof(unique) === 'undefined' || unique === null) unique = true;
  
  var lookup = new Set();
  
  var found = [];
  
  for (var rowIndex=0, nRows = table.length; rowIndex<nRows; rowIndex++) {
    var row = table[rowIndex];
    var value = row[column];
    
    if (value) {
      if (unique === true) {
        if (!lookup.has(value)) {
          found.push(value);
        }
        lookup.add(value);
      } else {
        found.push(value)
      }
    }
  }
  
  return found;
}


Rowjam.mergeProperties = function(target, src) {
  for (var prop in src) {
    target[prop] = src[prop];
  }
  return target;
}

Rowjam.empty = function(data)
{
  if(typeof(data) == 'number' || typeof(data) == 'boolean')
  { 
    return false; 
  }
  if(typeof(data) == 'undefined' || data === null)
  {
    return true; 
  }
  if(typeof(data.length) != 'undefined')
  {
    return data.length == 0;
  }
  for(var i in data)
  {
    if(data.hasOwnProperty(i))
    {
      return false;
    }
  }
  return true;
}

Rowjam.copyValue = function(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = Rowjam.copyValue(oldObj[i]);
        }
    }
    return newObj;
}


Rowjam.prototype.sort = function(sortOptionArray) {
  this.value.sort(function(a,b) {
    for (var i=0; i< sortOptionArray.length; i+=2) {
      var col = sortOptionArray[i];
      var direction = sortOptionArray[i+1] === 'desc'? -1 : 1;
      result = a[col]>b[col] ? 1 : (a[col]<b[col]? -1 : 0);
      if (result != 0) {
        return result * direction;
      }
    }
    return 0;
  });
  
  return this;
}

},{}],5:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('ajax-page', '<div> <p>Most data lives on the server. Most front-end javascript applications have to go get that data and display it for the user.</p> <p>There are dozens of libraries and modules to help you do these kinds of queries. This page will use one called <a href="https://github.com/dimitrinicolas/marmottajax">MarmottAjax</a>. It is one of my favorites because it is tiny, easy to use, and employs a promise structure with its syntax. If you don\'t know what promises are, <a href="http://www.html5rocks.com/en/tutorials/es6/promises/">read about them.</a></p> <p>Here is the simple table from the "Rendering Tables" page. However, the data that builds the table is retrieved as JSON from the server, instead of being declared in the script of the tag.</p> <table class="simple"> <tr> <th>Index</th> <th>First</th> <th>Last</th> <th>Phone</th> <th>City</th> <th>State</th> <th>Zip</th> </tr> <tr each="{row, index in rows}"> <td>{index + 1}</td> <td>{row.FIRST}</td> <td>{row.LAST}</td> <td>{row.PHONE}</td> <td>{row.CITY}</td> <td>{row.STATE}</td> <td>{row.ZIP}</td> </tr> </table> <br> <p>Here\'s the script that retrieves the data from the server:</p> <code-display filename="examples/ajax-page.tag" firstline="53" lastline="74" lang="javascript"></code-display> <p> We start the Ajax query on the <b>\'mount\'</b> event. Once the mount event is received, we know that the DOM has been loaded into the page. This removes any race conditions from the code. (Bad Race Condition: we get the data, but the DOM hasn\'t been loaded, so rendering the table fails.) </p> <p>We create a MarmottAjax request, with the url <a href="/contact-data.json">/contact-data.json</a>. Once the data has been downloaded, the function in the <b>then</b> callback fires.</p> <p>In the callback, we parse the JSON textual data into normal javascript data. We also assign this data to a property of the Tag instance:</p> <code-embed content="thisTag.rows = JSON.parse(json);" lang="html"></code-embed> <p>This makes the <b>rows</b> property accessible from the markup. Finally, we call <b>update()</b> on the tag instance to tell it to redraw itself, rendering the table with data.</p> <code-embed content="thisTag.update();" language="javascript"></code-embed> <br> <p>The HTML markup is pretty much the same as it was on the <a href="/#/pages/rendering-tables-page">Rendering Tables</a> page.</p> <code-display filename="examples/ajax-page.tag" firstline="8" lastline="28">/code-display> </div>', 'ajax-page table.simple td,[riot-tag="ajax-page"] table.simple td,[data-is="ajax-page"] table.simple td,ajax-page table th,[riot-tag="ajax-page"] table th,[data-is="ajax-page"] table th{ padding:10px; text-align: left; } ajax-page table.simple tr:nth-child(even),[riot-tag="ajax-page"] table.simple tr:nth-child(even),[data-is="ajax-page"] table.simple tr:nth-child(even){ background-color: #eee; }', '', function(opts) {
		var thisTag = this;
		var marmottAjax = require('marmottajax');

		thisTag.on('mount', function() {

			marmottAjax({url: 'contact-data.json', method: 'get'})
			.then(function(json) {

				thisTag.rows = JSON.parse(json);

				thisTag.update();
			})
		});
});
},{"marmottajax":2,"riot":3}],6:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('login-page', '<div class="altbody"> <h1>Login Page</h1> <form-engine id="form1"></form-engine> </div>', '', '', function(opts) {
		var thisTag = this
		var utils = riot.mixin("utils")

		thisTag.on('mount', function() {
			console.log(thisTag.formEngine)
			var form = thisTag.tags['form-engine']
			console.log("form", form)
			var ftag = utils.getTagById(thisTag, 'form1')
			console.log("found tag", ftag)
			ftag.addField('first','text','First Name',40)
			ftag.addField('last','text','Last Name',40)
			ftag.start()
		})
});
},{"riot":3}],7:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('overview-page', '<div> Hello this is Vineel. </div>', '', '', function(opts) {
});

},{"riot":3}],8:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('simple-page', '<div> This is a simple PAGE. </div>', 'simple-page div,[riot-tag="simple-page"] div,[data-is="simple-page"] div{ font-family: Arial; font-size: 12px; }', '', function(opts) {
});
},{"riot":3}],9:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('slide-page', '<gallery></gallery> <div id="box"> <div each="{family, index in families}"> <div class="family_name">{family.display_name}</div> <div class="family_thumbs"> <div each="{asset in parent.assetsByFamily[family.family_extid]}" class="placeholder" id="{asset.id}" onclick="{tapThumb}"> <img riot-src="{window.MEDIA_SERVER_PREFIX + ⁗thumbs/⁗ + asset.size1_url}"> </div> </div> </div> </div>', 'slide-page #box,[riot-tag="slide-page"] #box,[data-is="slide-page"] #box{ border: 2px solid #aa0; background-color:#000; color:#ddd; } slide-page .family_name,[riot-tag="slide-page"] .family_name,[data-is="slide-page"] .family_name{ font-family: "Helvetica Nueue", "Arial"; font-size:18px; margin-top:20px; } slide-page .family_thumbs,[riot-tag="slide-page"] .family_thumbs,[data-is="slide-page"] .family_thumbs{ display: flex; justify-content: left; flex-direction: row; flex-wrap: wrap; } slide-page .placeholder,[riot-tag="slide-page"] .placeholder,[data-is="slide-page"] .placeholder{ width: 200px; height: 200px; background-color: #aaa; margin-right: 2px; margin-bottom: 2px; } slide-page .placeholder img,[riot-tag="slide-page"] .placeholder img,[data-is="slide-page"] .placeholder img{ width: 200px; height: 200px; }', '', function(opts) {
    var thisTag = this
    var rowjam = require('rowjam')
    var notificationCenter = riot.mixin('notification_center');

    this.tapThumb = function(e) {
      console.log("tap thumb!", e)
      var tapAssetId = e.item.asset.asset_id
      notificationCenter.send('got_data', thisTag.assets, tapAssetId)
    }.bind(this)

    var processData = function(data) {
      thisTag.data = data;
      thisTag.assets = data.assets;
      thisTag.account = data.account;
      thisTag.families = data.families;

      var jam = rowjam(data.assets, true);
      thisTag.assetsByFamily = jam.toLookup("family_extid")

      thisTag.familyKeys = jam.values('family_extid', true);

    }

    var getSlideData = function(srcEmail, dayStr) {
      $.getJSON( window.API_SERVER_PREFIX + "api.php/slideshow",
        {
          email: srcEmail,
          day: dayStr
        },
        function( data ) {
          console.log("data", JSON.stringify(data));

          processData(data);

          thisTag.update();
        }
      )
    }

    this.on('mount', function() {
      getSlideData('vineel@vineel.com', '2016-05-11');
    })
});
},{"riot":3,"rowjam":4}],10:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('app', '<div> <div id="content"></div> </div>', '', '', function(opts) {

		var thisTag = this;

		riot.route.start(true);

		riot.route.base('#/')

		thisTag.on('mount', function() {

			riot.route('/', function() {
				riot.route('/pages/simple-page');
			});

			riot.route('/pages/*', function(tagName) {

				riot.mount(thisTag.content, tagName, null);
			});

		});

		var notificationCenter = {
		  notifications: riot.observable(),
		  listenTo: function (eventStr, eventFn) {
		    this.notifications.on(eventStr, eventFn);
		  },
		  send: function(eventStr, p1, p2, p3) {
		    this.notifications.trigger(eventStr, p1, p2, p3);
		  }
		};

		riot.mixin("notification_center", notificationCenter);

		var utils = {
			getTagById: function(context, tagId) {
				console.log("this.tags", context.tags)
				for (var tagType in context.tags) {
					console.log("tagType", tagType)
					var tagsOfType = context.tags[tagType]
					if (Array.isArray(tagsOfType)) {
						for (var i=0; i<tagsOfType.length; i++) {
							var t = tagsOfType[i]
							console.log("? t.opts.id", t.opts.id, "===", tagId)
							if (t.opts.id === tagId) {
								return t
							}
						}
					} else {
						if (tagsOfType.opts.id === tagId) {
							return tagsOfType
						}
					}
				}

				return null;
			}

		}
		riot.mixin("utils", utils)

});
},{"riot":3}],11:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('form-engine', '<form id="form"> <ul> <li each="{f in fields}" id="{f.name}"> <div class="label">{f.label}</div> <div class="input"><input type="text" name="{f.name}" onkeypress="{checkKeys}"></div> </li> <li id="submission"> Please Wait... </li> </ul> </form>', 'form-engine form ul li,[riot-tag="form-engine"] form ul li,[data-is="form-engine"] form ul li{ display: none; }', '', function(opts) {
		var thisTag = this
		thisTag.fields = []
		thisTag.values = {}
		thisTag.currentFieldIndex = -1

		this.checkKeys = function(e) {
			console.log("e",e)
			if (e.keyCode == 13) {
				thisTag.nextField()
				return false
			}
			return true
		}.bind(this)

		thisTag.addField = function (name, type, label, maxLength) {
			thisTag.fields.push({name: name, type: type, label: label, max: maxLength})
			thisTag.update()
		}

		thisTag.renderField = function (index) {
			var f = thisTag.fields[index]
			$("li#" + f.name).css("display","flex")
			$("li#" + f.name + " > div.input > input").focus()
		}

		thisTag.hideAll = function() {
			$('li').css('display','none')
		}

		thisTag.nextField = function() {
			if (thisTag.currentFieldIndex === thisTag.fields.length -1) {
				thisTag.submission()
			} else {
				thisTag.currentFieldIndex += 1
				thisTag.hideAll()
				thisTag.renderField(thisTag.currentFieldIndex)
			}
		}

		thisTag.submission = function() {
			thisTag.hideAll()
			$("li#submission").css("display","flex")
		}

		thisTag.start = function() {
			thisTag.currentFieldIndex = 0;
			thisTag.renderField(thisTag.currentFieldIndex)
		}
});
},{"riot":3}],12:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('gallery', '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"> <div class="pswp__bg"></div> <div class="pswp__scroll-wrap"> <div class="pswp__container"> <div class="pswp__item"></div> <div class="pswp__item"></div> <div class="pswp__item"></div> </div> <div class="pswp__ui pswp__ui--hidden"> <div class="pswp__top-bar"> <div class="pswp__counter"></div> <button class="pswp__button pswp__button--close" title="Close (Esc)"></button> <button class="pswp__button pswp__button--share" title="Share"></button> <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button> <div class="pswp__preloader"> <div class="pswp__preloader__icn"> <div class="pswp__preloader__cut"> <div class="pswp__preloader__donut"></div> </div> </div> </div> </div> <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"> <div class="pswp__share-tooltip"></div> </div> <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"> </button> <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"> </button> <div class="pswp__caption"> <div class="pswp__caption__center"></div> </div> </div> </div>', 'gallery #lightbox,[riot-tag="gallery"] #lightbox,[data-is="gallery"] #lightbox{ background-color: rgba(255,255,255,120); color: #F00; }', '', function(opts) {
		var prefix = window.MEDIA_SERVER_PREFIX + "photos/"
		var thisTag = this
		var notificationCenter = riot.mixin('notification_center');
		thisTag.assets = []
		thisTag.items = []
		thisTag.gallery = null

		thisTag.indexOfAsset = function(assetIdToFind) {
			for (var i=0; i<thisTag.assets.length; i++) {
				var asset = thisTag.assets[i]
				if (asset.asset_id === assetIdToFind) {
					return i;
				}
			}
			return 0;
		}

		notificationCenter.listenTo('got_data', function(data, assetIdToShow) {
			thisTag.assets = data
			thisTag.items = []
			for (var i=0; i<data.length; i++) {
				var asset = data[i]
				var item = {
					src: prefix + asset.url,
					w: asset.width,
					h: asset.height
				}
				thisTag.items.push(item)
			}

			var firstAsset = thisTag.indexOfAsset(assetIdToShow)
			thisTag.showGallery(firstAsset)
		})

		this.showGallery = function(firstAsset) {
			var pswpElement = document.querySelectorAll('.pswp')[0];

			var options = {
			    index: firstAsset
			};

			console.log("PhotoSwipe", PhotoSwipe)
			thisTag.gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, thisTag.items, options);
			thisTag.gallery.init();
		}.bind(this)
});
},{"riot":3}],13:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('raw', '<span></span>', '', '', function(opts) {
    this.root.innerHTML = opts.content
});
},{"riot":3}],14:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag2('simple', '<div> This is a simple TAG. </div>', 'simple div,[riot-tag="simple"] div,[data-is="simple"] div{ font-family: Arial; font-size: 12px; }', '', function(opts) {
});
},{"riot":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyaWZ5X2VudHJ5cG9pbnQuanMiLCJub2RlX21vZHVsZXMvbWFybW90dGFqYXgvYmluL21vZHVsZS5qcyIsIm5vZGVfbW9kdWxlcy9yaW90L3Jpb3QuanMiLCJub2RlX21vZHVsZXMvcm93amFtL2luZGV4LmpzIiwicGFnZXMvYWpheC1wYWdlLnRhZyIsInBhZ2VzL2xvZ2luLXBhZ2UudGFnIiwicGFnZXMvb3ZlcnZpZXctcGFnZS50YWciLCJwYWdlcy9zaW1wbGUtcGFnZS50YWciLCJwYWdlcy9zbGlkZS1wYWdlLnRhZyIsInRhZ3MvYXBwLnRhZyIsInRhZ3MvZm9ybS1lbmdpbmUudGFnIiwidGFncy9nYWxsZXJ5LnRhZyIsInRhZ3MvcmF3LnRhZyIsInRhZ3Mvc2ltcGxlLnRhZyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6ZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeDNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHJpb3QgPSByZXF1aXJlKCdyaW90JylcbnZhciBtYWpheCA9IHJlcXVpcmUoJ21hcm1vdHRhamF4JylcblxuLy8gYXBwLnRhZyBzaG93cyB0aGUgbWVudSBhbmQgc2V0cyB1cCByb3V0aW5nIGZvciBlYWNoIHBhZ2VcbnJlcXVpcmUoJy4vdGFncy9hcHAudGFnJylcblxuLy8gSW4gdGhpcyBhcHAsIGEgXCJwYWdlXCIgaXMgYSBzaW1wbHkgYSByaW90IHRhZyB3aXRoIFxuLy8gSFRNTCB0byBkaXNwbGF5IGFzIGEgcGFnZS4gXG4vLyBBbGwgXCJwYWdlc1wiIGFyZSBzdG9yZWQgaW4gdGhlIC4vcGFnZXMgZGlyIGFuZCBcbi8vIGFyZSBuYW1lZCBcIi1wYWdlLnRhZ1wiLiBUaGVzZSBhcmUgYXJiaXRyYXJ5XG4vLyBkZWNpc2lvbnMgdGhhdCBhcmUgbm90IGRlZmluZWQgYnkgcmlvdC5cblxuLy8gVGhlc2UgYXJlIHRoZSBcInBhZ2VcIiB0YWdzLlxucmVxdWlyZSgnLi9wYWdlcy9vdmVydmlldy1wYWdlLnRhZycpXG5yZXF1aXJlKCcuL3BhZ2VzL2xvZ2luLXBhZ2UudGFnJylcbnJlcXVpcmUoJy4vcGFnZXMvc2ltcGxlLXBhZ2UudGFnJylcbnJlcXVpcmUoJy4vcGFnZXMvYWpheC1wYWdlLnRhZycpXG5yZXF1aXJlKCcuL3BhZ2VzL3NsaWRlLXBhZ2UudGFnJylcblxuLy8gVGhlc2UgYXJlIGV4YW1wbGUgdGFncy4gVmlldyBlYWNoIGZpbGUgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG5yZXF1aXJlKCcuL3RhZ3Mvc2ltcGxlLnRhZycpXG5yZXF1aXJlKCcuL3RhZ3MvcmF3LnRhZycpXG5yZXF1aXJlKCcuL3RhZ3MvZ2FsbGVyeS50YWcnKVxucmVxdWlyZSgnLi90YWdzL2Zvcm0tZW5naW5lLnRhZycpXG5cbnJpb3QubW91bnQoJyonKVxuIiwiXHJcbi8qKlxyXG4gKiBtYWluLmpzXHJcbiAqXHJcbiAqIE1haW4gbGlicmFpcnkgZmlsZVxyXG4gKi9cclxuXHJcbnZhciBtYXJtb3R0YWpheCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuXHRpZiAodHlwZW9mIHRoaXMuc2VsZiAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG5cclxuXHRcdHJldHVybiBuZXcgbWFybW90dGFqYXgobWFybW90dGFqYXgubm9ybWFsaXplKGFyZ3VtZW50cykpO1xyXG5cclxuXHR9XHJcblxyXG5cdHZhciBkYXRhID0gbWFybW90dGFqYXgubm9ybWFsaXplKGFyZ3VtZW50cyk7XHJcblxyXG5cdGlmIChkYXRhID09PSBudWxsKSB7XHJcblxyXG5cdFx0dGhyb3cgXCJMZXMgYXJndW1lbnRzIHBhc3PDqWVzIMOgIG1hcm1vdHRhamF4IHNvbnQgaW52YWxpZGVzLlwiO1xyXG5cclxuXHR9XHJcblxyXG5cdHRoaXMudXJsID0gZGF0YS51cmw7XHJcblx0dGhpcy5tZXRob2QgPSBkYXRhLm1ldGhvZDtcclxuXHR0aGlzLmpzb24gPSBkYXRhLmpzb247XHJcblx0dGhpcy53YXRjaCA9IGRhdGEud2F0Y2g7XHJcblx0dGhpcy5wYXJhbWV0ZXJzID0gZGF0YS5wYXJhbWV0ZXJzO1xyXG5cdHRoaXMuaGVhZGVycyA9IGRhdGEuaGVhZGVycztcclxuXHJcblx0aWYgKHRoaXMubWV0aG9kID09PSBcInBvc3RcIiB8fCB0aGlzLm1ldGhvZCA9PT0gXCJwdXRcIiB8fCB0aGlzLm1ldGhvZCA9PT0gXCJ1cGRhdGVcIiB8fCB0aGlzLm1ldGhvZCA9PT0gXCJkZWxldGVcIikge1xyXG5cclxuXHRcdHRoaXMucG9zdERhdGEgPSBcIj9cIjtcclxuXHJcblx0XHRmb3IgKHZhciBrZXkgaW4gdGhpcy5wYXJhbWV0ZXJzKSB7XHJcblxyXG5cdFx0XHR0aGlzLnBvc3REYXRhICs9IHRoaXMucGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShrZXkpID8gXCImXCIgKyBrZXkgKyBcIj1cIiArIHRoaXMucGFyYW1ldGVyc1trZXldIDogXCJcIjtcclxuXHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0ZWxzZSB7XHJcblxyXG5cdFx0dGhpcy51cmwgKz0gdGhpcy51cmwuaW5kZXhPZihcIj9cIikgPCAwID8gXCI/XCIgOiBcIlwiO1xyXG5cclxuXHRcdGZvciAodmFyIGtleSBpbiB0aGlzLnBhcmFtZXRlcnMpIHtcclxuXHJcblx0XHQgICAgdGhpcy51cmwgKz0gdGhpcy5wYXJhbWV0ZXJzLmhhc093blByb3BlcnR5KGtleSkgPyBcIiZcIiArIGtleSArIFwiPVwiICsgdGhpcy5wYXJhbWV0ZXJzW2tleV0gOiBcIlwiO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fVxyXG5cclxuXHR0aGlzLnNldFhocigpO1xyXG5cclxuXHR0aGlzLnNldFdhdGNoZXIoKTtcclxuXHJcbn07XG5tb2R1bGUuZXhwb3J0cyA9IG1hcm1vdHRhamF4O1xuXHJcbi8qKlxyXG4gKiBjb25zdGFudHMuanNcclxuICpcclxuICogQ29uc3RhbnRzIHZhcmlhYmxlc1xyXG4gKi9cclxuXHJcbm1hcm1vdHRhamF4LmRlZmF1bHREYXRhID0ge1xyXG5cclxuXHRtZXRob2Q6IFwiZ2V0XCIsXHJcblx0anNvbjogZmFsc2UsXHJcblx0d2F0Y2g6IC0xLFxyXG5cclxuXHRwYXJhbWV0ZXJzOiB7fVxyXG5cclxufTtcclxuXHJcbm1hcm1vdHRhamF4LnZhbGlkTWV0aG9kcyA9IFtcImdldFwiLCBcInBvc3RcIiwgXCJwdXRcIiwgXCJ1cGRhdGVcIiwgXCJkZWxldGVcIl07XG5cclxuLyoqXHJcbiAqIG5vcm1hbGl6ZS1kYXRhLmpzXHJcbiAqXHJcbiAqIE5vcm1hbGl6ZSBkYXRhIGluIEFqYXggcmVxdWVzdFxyXG4gKi9cclxuXHJcbm1hcm1vdHRhamF4Lm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuXHJcblx0LyoqXHJcblx0ICogU2VhcmNoIGRhdGEgaW4gYXJndW1lbnRzXHJcblx0ICovXHJcblxyXG5cdGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xyXG5cclxuXHRcdHJldHVybiBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdHZhciByZXN1bHQgPSB7fTtcclxuXHJcblx0aWYgKGRhdGEubGVuZ3RoID09PSAxICYmIHR5cGVvZiBkYXRhWzBdID09PSBcIm9iamVjdFwiKSB7XHJcblxyXG5cdFx0cmVzdWx0ID0gZGF0YVswXTtcclxuXHJcblx0fVxyXG5cclxuXHRlbHNlIGlmIChkYXRhLmxlbmd0aCA9PT0gMSAmJiB0eXBlb2YgZGF0YVswXSA9PT0gXCJzdHJpbmdcIikge1xyXG5cclxuXHRcdHJlc3VsdCA9IHtcclxuXHJcblx0XHRcdHVybDogZGF0YVswXVxyXG5cclxuXHRcdH07XHJcblxyXG5cdH1cclxuXHJcblx0ZWxzZSBpZiAoZGF0YS5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGRhdGFbMF0gPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRhdGFbMV0gPT09IFwib2JqZWN0XCIpIHtcclxuXHJcblx0XHRkYXRhWzFdLnVybCA9IGRhdGFbMF07XHJcblxyXG5cdFx0cmVzdWx0ID0gZGF0YVsxXTtcclxuXHJcblx0fVxyXG5cclxuXHQvKipcclxuXHQgKiBOb3JtYWxpemUgZGF0YSBpbiBhcmd1bWVudHNcclxuXHQgKi9cclxuXHJcblx0aWYgKCEodHlwZW9mIHJlc3VsdC5tZXRob2QgPT09IFwic3RyaW5nXCIgJiYgbWFybW90dGFqYXgudmFsaWRNZXRob2RzLmluZGV4T2YocmVzdWx0Lm1ldGhvZC50b0xvd2VyQ2FzZSgpKSAhPSAtMSkpIHtcclxuXHJcblx0XHRyZXN1bHQubWV0aG9kID0gbWFybW90dGFqYXguZGVmYXVsdERhdGEubWV0aG9kO1xyXG5cclxuXHR9XHJcblxyXG5cdGVsc2Uge1xyXG5cclxuXHRcdHJlc3VsdC5tZXRob2QgPSByZXN1bHQubWV0aG9kLnRvTG93ZXJDYXNlKCk7XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKHR5cGVvZiByZXN1bHQuanNvbiAhPT0gXCJib29sZWFuXCIpIHtcclxuXHJcblx0XHRyZXN1bHQuanNvbiA9IG1hcm1vdHRhamF4LmRlZmF1bHREYXRhLmpzb247XHJcblxyXG5cdH1cclxuXHJcblx0aWYgKHR5cGVvZiByZXN1bHQud2F0Y2ggIT09IFwibnVtYmVyXCIpIHtcclxuXHJcblx0XHRyZXN1bHQud2F0Y2ggPSBtYXJtb3R0YWpheC5kZWZhdWx0RGF0YS53YXRjaDtcclxuXHJcblx0fVxyXG5cclxuXHRpZiAodHlwZW9mIHJlc3VsdC5wYXJhbWV0ZXJzICE9PSBcIm9iamVjdFwiKSB7XHJcblxyXG5cdFx0cmVzdWx0LnBhcmFtZXRlcnMgPSBtYXJtb3R0YWpheC5kZWZhdWx0RGF0YS5wYXJhbWV0ZXJzO1xyXG5cclxuXHR9XHJcblxyXG5cdGlmICh0eXBlb2YgcmVzdWx0LmhlYWRlcnMgIT09IFwib2JqZWN0XCIpIHtcclxuXHJcblx0XHRyZXN1bHQuaGVhZGVycyA9IG1hcm1vdHRhamF4LmRlZmF1bHREYXRhLmhlYWRlcnM7XHJcblxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHJlc3VsdDtcclxuXHJcbn07XG5cclxuLyoqXHJcbiAqIHNldC14aHIuanNcclxuICpcclxuICogU2V0IFdhdGNoZXIgXHJcbiAqL1xyXG5cclxubWFybW90dGFqYXgucHJvdG90eXBlLnNldFdhdGNoZXIgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0aWYgKHRoaXMud2F0Y2ggIT09IC0xKSB7XHJcblxyXG5cdFx0dGhpcy53YXRjaEludGVydmFsRnVuY3Rpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdGlmICh0aGlzLnhoci5yZWFkeVN0YXRlID09PSA0ICYmIHRoaXMueGhyLnN0YXR1cyA9PT0gMjAwKSB7XHJcblxyXG5cdFx0XHRcdHRoaXMudXBkYXRlWGhyKCk7XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLndhdGNoZXJUaW1lb3V0KCk7XHJcblxyXG5cdFx0fTtcclxuXHJcblx0XHR0aGlzLndhdGNoZXJUaW1lb3V0KCk7XHJcblxyXG5cdFx0dGhpcy5zdG9wID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHR0aGlzLmNoYW5nZVRpbWUoLTEpO1xyXG5cclxuXHRcdH07XHJcblxyXG5cdFx0dGhpcy5jaGFuZ2VUaW1lID0gZnVuY3Rpb24obmV3VGltZSkge1xyXG5cclxuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuY2hhbmdlVGltZW91dCk7XHJcblxyXG5cdFx0XHR0aGlzLndhdGNoID0gdHlwZW9mIG5ld1RpbWUgPT09IFwibnVtYmVyXCIgPyBuZXdUaW1lIDogdGhpcy53YXRjaDtcclxuXHJcblx0XHRcdHRoaXMud2F0Y2hlclRpbWVvdXQoKTtcclxuXHJcblx0XHR9O1xyXG5cclxuXHR9XHJcblxyXG59O1xuXHJcbi8qKlxyXG4gKiBzZXQteGhyLmpzXHJcbiAqXHJcbiAqIFNldCBYTUxIdHRwUmVxdWVzdCBcclxuICovXHJcblxyXG5tYXJtb3R0YWpheC5wcm90b3R5cGUuc2V0WGhyID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdHRoaXMueGhyID0gd2luZG93LlhNTEh0dHBSZXF1ZXN0ID8gbmV3IFhNTEh0dHBSZXF1ZXN0KCkgOiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG5cclxuXHR0aGlzLnhoci5sYXN0UmVzdWx0ID0gbnVsbDtcclxuXHJcblx0dGhpcy54aHIuanNvbiA9IHRoaXMuanNvbjtcclxuXHR0aGlzLnhoci5iaW5kaW5nID0gbnVsbDtcclxuXHJcblx0dGhpcy5iaW5kID0gZnVuY3Rpb24oYmluZGluZykge1xyXG5cclxuXHRcdHRoaXMueGhyLmJpbmRpbmcgPSBiaW5kaW5nO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLmNhbmNlbCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcblxyXG5cdFx0dGhpcy54aHIuYWJvcnQoKTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy54aHIuY2FsbGJhY2tzID0ge1xyXG5cclxuXHRcdHRoZW46IFtdLFxyXG5cdFx0Y2hhbmdlOiBbXSxcclxuXHRcdGVycm9yOiBbXVxyXG5cclxuXHR9O1xyXG5cclxuXHRmb3IgKHZhciBuYW1lIGluIHRoaXMueGhyLmNhbGxiYWNrcykge1xyXG5cclxuXHRcdGlmICh0aGlzLnhoci5jYWxsYmFja3MuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuXHJcblx0XHRcdHRoaXNbbmFtZV0gPSBmdW5jdGlvbihuYW1lKSB7XHJcblxyXG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG5cclxuXHRcdFx0XHRcdHRoaXMueGhyLmNhbGxiYWNrc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0XHRcdFx0fTtcclxuXHJcblx0XHRcdH0obmFtZSk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdHRoaXMueGhyLmNhbGwgPSBmdW5jdGlvbihjYXRlZ29yaWUsIHJlc3VsdCkge1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jYWxsYmFja3NbY2F0ZWdvcmllXS5sZW5ndGg7IGkrKykge1xyXG5cclxuXHRcdFx0aWYgKHR5cGVvZih0aGlzLmNhbGxiYWNrc1tjYXRlZ29yaWVdW2ldKSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcblxyXG5cdFx0XHRcdGlmICh0aGlzLmJpbmRpbmcpIHtcclxuXHJcblx0XHRcdFx0XHR0aGlzLmNhbGxiYWNrc1tjYXRlZ29yaWVdW2ldLmNhbGwodGhpcy5iaW5kaW5nLCByZXN1bHQpO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGVsc2Uge1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuY2FsbGJhY2tzW2NhdGVnb3JpZV1baV0ocmVzdWx0KTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCAmJiB0aGlzLnN0YXR1cyA9PSAyMDApIHtcclxuXHJcblx0XHRcdHZhciByZXN1bHQgPSB0aGlzLnJlc3BvbnNlVGV4dDtcclxuXHJcblx0XHRcdGlmICh0aGlzLmpzb24pIHtcclxuXHJcblx0XHRcdFx0dHJ5IHtcclxuXHJcblx0XHRcdFx0XHRyZXN1bHQgPSBKU09OLnBhcnNlKHJlc3VsdCk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Y2F0Y2ggKGVycm9yKSB7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5jYWxsKFwiZXJyb3JcIiwgXCJpbnZhbGlkIGpzb25cIik7XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmxhc3RSZXN1bHQgPSByZXN1bHQ7XHJcblxyXG5cdFx0XHR0aGlzLmNhbGwoXCJ0aGVuXCIsIHJlc3VsdCk7XHJcblxyXG5cdFx0fVxyXG5cclxuXHRcdGVsc2UgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCAmJiB0aGlzLnN0YXR1cyA9PSA0MDQpIHtcclxuXHJcblx0XHRcdHRoaXMuY2FsbChcImVycm9yXCIsIFwiNDA0XCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuXHJcblx0XHRcdHRoaXMuY2FsbChcImVycm9yXCIsIFwidW5rbm93XCIpO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy54aHIub3Blbih0aGlzLm1ldGhvZCwgdGhpcy51cmwsIHRydWUpO1xyXG5cdHRoaXMueGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XHJcblxyXG5cdGlmICh0aGlzLmhlYWRlcnMpIHtcclxuXHRcdGZvciAoaGVhZGVyIGluIHRoaXMuaGVhZGVycykge1xyXG5cdFx0XHRpZiAodGhpcy5oZWFkZXJzLmhhc093blByb3BlcnR5KGhlYWRlcikpIHtcclxuXHRcdFxyXG5cdFx0XHRcdHRoaXMueGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB0aGlzLmhlYWRlcnNbaGVhZGVyXSk7XHJcblx0XHRcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0dGhpcy54aHIuc2VuZCh0eXBlb2YgdGhpcy5wb3N0RGF0YSAhPSBcInVuZGVmaW5lZFwiID8gdGhpcy5wb3N0RGF0YSA6IG51bGwpO1xyXG5cclxufTtcblxyXG4vKipcclxuICogdXBkYXRlLXhoci5qc1xyXG4gKlxyXG4gKiBVcGRhdGUgWE1MSHR0cFJlcXVlc3QgcmVzdWx0IFxyXG4gKi9cclxuXHJcbm1hcm1vdHRhamF4LnByb3RvdHlwZS51cGRhdGVYaHIgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0dmFyIGRhdGEgPSB7XHJcblxyXG5cdFx0bGFzdFJlc3VsdDogdGhpcy54aHIubGFzdFJlc3VsdCxcclxuXHJcblx0XHRqc29uOiB0aGlzLnhoci5qc29uLFxyXG5cdFx0YmluZGluZzogdGhpcy54aHIuYmluZGluZyxcclxuXHJcblx0XHRjYWxsYmFja3M6IHtcclxuXHJcblx0XHRcdHRoZW46IHRoaXMueGhyLmNhbGxiYWNrcy50aGVuLFxyXG5cdFx0XHRjaGFuZ2U6IHRoaXMueGhyLmNhbGxiYWNrcy5jaGFuZ2UsXHJcblx0XHRcdGVycm9yOiB0aGlzLnhoci5jYWxsYmFja3MuZXJyb3JcclxuXHJcblx0XHR9XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMueGhyID0gd2luZG93LlhNTEh0dHBSZXF1ZXN0ID8gbmV3IFhNTEh0dHBSZXF1ZXN0KCkgOiBuZXcgQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xyXG5cclxuXHR0aGlzLnhoci5sYXN0UmVzdWx0ID0gZGF0YS5sYXN0UmVzdWx0O1xyXG5cclxuXHR0aGlzLnhoci5qc29uID0gZGF0YS5qc29uO1xyXG5cdHRoaXMueGhyLmJpbmRpbmcgPSBkYXRhLmJpbmRpbmc7XHJcblxyXG5cdHRoaXMueGhyLmNhbGxiYWNrcyA9IHtcclxuXHJcblx0XHR0aGVuOiBkYXRhLmNhbGxiYWNrcy50aGVuLFxyXG5cdFx0Y2hhbmdlOiBkYXRhLmNhbGxiYWNrcy5jaGFuZ2UsXHJcblx0XHRlcnJvcjogZGF0YS5jYWxsYmFja3MuZXJyb3JcclxuXHJcblx0fTtcclxuXHJcblx0dGhpcy54aHIuY2FsbCA9IGZ1bmN0aW9uKGNhdGVnb3JpZSwgcmVzdWx0KSB7XHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNhbGxiYWNrc1tjYXRlZ29yaWVdLmxlbmd0aDsgaSsrKSB7XHJcblxyXG5cdFx0XHRpZiAodHlwZW9mKHRoaXMuY2FsbGJhY2tzW2NhdGVnb3JpZV1baV0pID09PSBcImZ1bmN0aW9uXCIpIHtcclxuXHJcblx0XHRcdFx0aWYgKHRoaXMuYmluZGluZykge1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuY2FsbGJhY2tzW2NhdGVnb3JpZV1baV0uY2FsbCh0aGlzLmJpbmRpbmcsIHJlc3VsdCk7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0ZWxzZSB7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5jYWxsYmFja3NbY2F0ZWdvcmllXVtpXShyZXN1bHQpO1xyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9O1xyXG5cclxuXHR0aGlzLnhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRpZiAodGhpcy5yZWFkeVN0YXRlID09PSA0ICYmIHRoaXMuc3RhdHVzID09IDIwMCkge1xyXG5cclxuXHRcdFx0dmFyIHJlc3VsdCA9IHRoaXMucmVzcG9uc2VUZXh0O1xyXG5cclxuXHRcdFx0aWYgKHRoaXMuanNvbikge1xyXG5cclxuXHRcdFx0XHR0cnkge1xyXG5cclxuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04ucGFyc2UocmVzdWx0KTtcclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRjYXRjaCAoZXJyb3IpIHtcclxuXHJcblx0XHRcdFx0XHR0aGlzLmNhbGwoXCJlcnJvclwiLCBcImludmFsaWQganNvblwiKTtcclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblxyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlzRGlmZmVyZW50ID0gdGhpcy5sYXN0UmVzdWx0ICE9IHJlc3VsdDtcclxuXHJcblx0XHRcdHRyeSB7XHJcblxyXG5cdFx0XHRcdGlzRGlmZmVyZW50ID0gKHR5cGVvZiB0aGlzLmxhc3RSZXN1bHQgIT09IFwic3RyaW5nXCIgPyBKU09OLnN0cmluZ2lmeSh0aGlzLmxhc3RSZXN1bHQpIDogdGhpcy5sYXN0UmVzdWx0KSAhPSAodHlwZW9mIHJlc3VsdCAhPT0gXCJzdHJpbmdcIiA/IEpTT04uc3RyaW5naWZ5KHJlc3VsdCkgOiByZXN1bHQpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0Y2F0Y2ggKGVycm9yKSB7fVxyXG5cclxuXHRcdFx0aWYgKGlzRGlmZmVyZW50KSB7XHJcblxyXG5cdFx0XHRcdHRoaXMuY2FsbChcImNoYW5nZVwiLCByZXN1bHQpO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dGhpcy5sYXN0UmVzdWx0ID0gcmVzdWx0O1xyXG5cclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IDQgJiYgdGhpcy5zdGF0dXMgPT0gNDA0KSB7XHJcblxyXG5cdFx0XHR0aGlzLmNhbGwoXCJlcnJvclwiLCBcIjQwNFwiKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdFx0ZWxzZSBpZiAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB7XHJcblxyXG5cdFx0XHR0aGlzLmNhbGwoXCJlcnJvclwiLCBcInVua25vd1wiKTtcclxuXHJcblx0XHR9XHJcblxyXG5cdH07XHJcblxyXG5cdHRoaXMueGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcclxuXHR0aGlzLnhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIpO1xyXG5cdHRoaXMueGhyLnNlbmQodHlwZW9mIHBvc3REYXRhICE9IFwidW5kZWZpbmVkXCIgPyBwb3N0RGF0YSA6IG51bGwpO1xyXG5cclxufTtcblxyXG4vKipcclxuICogc2V0LXhoci5qc1xyXG4gKlxyXG4gKiBTZXQgV2F0Y2hlciBcclxuICovXHJcblxyXG5tYXJtb3R0YWpheC5wcm90b3R5cGUud2F0Y2hlclRpbWVvdXQgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0aWYgKHRoaXMud2F0Y2ggIT09IC0xKSB7XHJcblxyXG5cdFx0dGhpcy5jaGFuZ2VUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbih0aGF0KSB7XHJcblxyXG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHRcdHRoYXQud2F0Y2hJbnRlcnZhbEZ1bmN0aW9uKCk7XHJcblxyXG5cdFx0XHR9O1xyXG5cclxuXHRcdH0odGhpcyksIHRoaXMud2F0Y2gpO1xyXG5cclxuXHR9XHJcblxyXG59OyIsIi8qIFJpb3QgdjIuMy4xMywgQGxpY2Vuc2UgTUlULCAoYykgMjAxNSBNdXV0IEluYy4gKyBjb250cmlidXRvcnMgKi9cblxuOyhmdW5jdGlvbih3aW5kb3csIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG52YXIgcmlvdCA9IHsgdmVyc2lvbjogJ3YyLjMuMTMnLCBzZXR0aW5nczoge30gfSxcbiAgLy8gYmUgYXdhcmUsIGludGVybmFsIHVzYWdlXG4gIC8vIEFUVEVOVElPTjogcHJlZml4IHRoZSBnbG9iYWwgZHluYW1pYyB2YXJpYWJsZXMgd2l0aCBgX19gXG5cbiAgLy8gY291bnRlciB0byBnaXZlIGEgdW5pcXVlIGlkIHRvIGFsbCB0aGUgVGFnIGluc3RhbmNlc1xuICBfX3VpZCA9IDAsXG4gIC8vIHRhZ3MgaW5zdGFuY2VzIGNhY2hlXG4gIF9fdmlydHVhbERvbSA9IFtdLFxuICAvLyB0YWdzIGltcGxlbWVudGF0aW9uIGNhY2hlXG4gIF9fdGFnSW1wbCA9IHt9LFxuXG4gIC8qKlxuICAgKiBDb25zdFxuICAgKi9cbiAgLy8gcmlvdCBzcGVjaWZpYyBwcmVmaXhlc1xuICBSSU9UX1BSRUZJWCA9ICdyaW90LScsXG4gIFJJT1RfVEFHID0gUklPVF9QUkVGSVggKyAndGFnJyxcblxuICAvLyBmb3IgdHlwZW9mID09ICcnIGNvbXBhcmlzb25zXG4gIFRfU1RSSU5HID0gJ3N0cmluZycsXG4gIFRfT0JKRUNUID0gJ29iamVjdCcsXG4gIFRfVU5ERUYgID0gJ3VuZGVmaW5lZCcsXG4gIFRfRlVOQ1RJT04gPSAnZnVuY3Rpb24nLFxuICAvLyBzcGVjaWFsIG5hdGl2ZSB0YWdzIHRoYXQgY2Fubm90IGJlIHRyZWF0ZWQgbGlrZSB0aGUgb3RoZXJzXG4gIFNQRUNJQUxfVEFHU19SRUdFWCA9IC9eKD86b3B0KGlvbnxncm91cCl8dGJvZHl8Y29sfHRbcmhkXSkkLyxcbiAgUkVTRVJWRURfV09SRFNfQkxBQ0tMSVNUID0gWydfaXRlbScsICdfaWQnLCAnX3BhcmVudCcsICd1cGRhdGUnLCAncm9vdCcsICdtb3VudCcsICd1bm1vdW50JywgJ21peGluJywgJ2lzTW91bnRlZCcsICdpc0xvb3AnLCAndGFncycsICdwYXJlbnQnLCAnb3B0cycsICd0cmlnZ2VyJywgJ29uJywgJ29mZicsICdvbmUnXSxcblxuICAvLyB2ZXJzaW9uIyBmb3IgSUUgOC0xMSwgMCBmb3Igb3RoZXJzXG4gIElFX1ZFUlNJT04gPSAod2luZG93ICYmIHdpbmRvdy5kb2N1bWVudCB8fCB7fSkuZG9jdW1lbnRNb2RlIHwgMFxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbnJpb3Qub2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKGVsKSB7XG5cbiAgLyoqXG4gICAqIEV4dGVuZCB0aGUgb3JpZ2luYWwgb2JqZWN0IG9yIGNyZWF0ZSBhIG5ldyBlbXB0eSBvbmVcbiAgICogQHR5cGUgeyBPYmplY3QgfVxuICAgKi9cblxuICBlbCA9IGVsIHx8IHt9XG5cbiAgLyoqXG4gICAqIFByaXZhdGUgdmFyaWFibGVzIGFuZCBtZXRob2RzXG4gICAqL1xuICB2YXIgY2FsbGJhY2tzID0ge30sXG4gICAgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsXG4gICAgb25FYWNoRXZlbnQgPSBmdW5jdGlvbihlLCBmbikgeyBlLnJlcGxhY2UoL1xcUysvZywgZm4pIH0sXG4gICAgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCBrZXksIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICB9KVxuICAgIH1cblxuICAvKipcbiAgICogTGlzdGVuIHRvIHRoZSBnaXZlbiBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBgZXZlbnRzYCBhbmQgZXhlY3V0ZSB0aGUgYGNhbGxiYWNrYCBlYWNoIHRpbWUgYW4gZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgKiBAcGFyYW0gIHsgU3RyaW5nIH0gZXZlbnRzIC0gZXZlbnRzIGlkc1xuICAgKiBAcGFyYW0gIHsgRnVuY3Rpb24gfSBmbiAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZWxcbiAgICovXG4gIGRlZmluZVByb3BlcnR5KCdvbicsIGZ1bmN0aW9uKGV2ZW50cywgZm4pIHtcbiAgICBpZiAodHlwZW9mIGZuICE9ICdmdW5jdGlvbicpICByZXR1cm4gZWxcblxuICAgIG9uRWFjaEV2ZW50KGV2ZW50cywgZnVuY3Rpb24obmFtZSwgcG9zKSB7XG4gICAgICAoY2FsbGJhY2tzW25hbWVdID0gY2FsbGJhY2tzW25hbWVdIHx8IFtdKS5wdXNoKGZuKVxuICAgICAgZm4udHlwZWQgPSBwb3MgPiAwXG4gICAgfSlcblxuICAgIHJldHVybiBlbFxuICB9KVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSBnaXZlbiBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBgZXZlbnRzYCBsaXN0ZW5lcnNcbiAgICogQHBhcmFtICAgeyBTdHJpbmcgfSBldmVudHMgLSBldmVudHMgaWRzXG4gICAqIEBwYXJhbSAgIHsgRnVuY3Rpb24gfSBmbiAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZWxcbiAgICovXG4gIGRlZmluZVByb3BlcnR5KCdvZmYnLCBmdW5jdGlvbihldmVudHMsIGZuKSB7XG4gICAgaWYgKGV2ZW50cyA9PSAnKicgJiYgIWZuKSBjYWxsYmFja3MgPSB7fVxuICAgIGVsc2Uge1xuICAgICAgb25FYWNoRXZlbnQoZXZlbnRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIGlmIChmbikge1xuICAgICAgICAgIHZhciBhcnIgPSBjYWxsYmFja3NbbmFtZV1cbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgY2I7IGNiID0gYXJyICYmIGFycltpXTsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2IgPT0gZm4pIGFyci5zcGxpY2UoaS0tLCAxKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGRlbGV0ZSBjYWxsYmFja3NbbmFtZV1cbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBlbFxuICB9KVxuXG4gIC8qKlxuICAgKiBMaXN0ZW4gdG8gdGhlIGdpdmVuIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGBldmVudHNgIGFuZCBleGVjdXRlIHRoZSBgY2FsbGJhY2tgIGF0IG1vc3Qgb25jZVxuICAgKiBAcGFyYW0gICB7IFN0cmluZyB9IGV2ZW50cyAtIGV2ZW50cyBpZHNcbiAgICogQHBhcmFtICAgeyBGdW5jdGlvbiB9IGZuIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICogQHJldHVybnMgeyBPYmplY3QgfSBlbFxuICAgKi9cbiAgZGVmaW5lUHJvcGVydHkoJ29uZScsIGZ1bmN0aW9uKGV2ZW50cywgZm4pIHtcbiAgICBmdW5jdGlvbiBvbigpIHtcbiAgICAgIGVsLm9mZihldmVudHMsIG9uKVxuICAgICAgZm4uYXBwbHkoZWwsIGFyZ3VtZW50cylcbiAgICB9XG4gICAgcmV0dXJuIGVsLm9uKGV2ZW50cywgb24pXG4gIH0pXG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgYWxsIGNhbGxiYWNrIGZ1bmN0aW9ucyB0aGF0IGxpc3RlbiB0byB0aGUgZ2l2ZW4gc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgYGV2ZW50c2BcbiAgICogQHBhcmFtICAgeyBTdHJpbmcgfSBldmVudHMgLSBldmVudHMgaWRzXG4gICAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZWxcbiAgICovXG4gIGRlZmluZVByb3BlcnR5KCd0cmlnZ2VyJywgZnVuY3Rpb24oZXZlbnRzKSB7XG5cbiAgICAvLyBnZXR0aW5nIHRoZSBhcmd1bWVudHNcbiAgICAvLyBza2lwcGluZyB0aGUgZmlyc3Qgb25lXG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICBmbnNcblxuICAgIG9uRWFjaEV2ZW50KGV2ZW50cywgZnVuY3Rpb24obmFtZSkge1xuXG4gICAgICBmbnMgPSBzbGljZS5jYWxsKGNhbGxiYWNrc1tuYW1lXSB8fCBbXSwgMClcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGZuOyBmbiA9IGZuc1tpXTsgKytpKSB7XG4gICAgICAgIGlmIChmbi5idXN5KSByZXR1cm5cbiAgICAgICAgZm4uYnVzeSA9IDFcbiAgICAgICAgZm4uYXBwbHkoZWwsIGZuLnR5cGVkID8gW25hbWVdLmNvbmNhdChhcmdzKSA6IGFyZ3MpXG4gICAgICAgIGlmIChmbnNbaV0gIT09IGZuKSB7IGktLSB9XG4gICAgICAgIGZuLmJ1c3kgPSAwXG4gICAgICB9XG5cbiAgICAgIGlmIChjYWxsYmFja3NbJyonXSAmJiBuYW1lICE9ICcqJylcbiAgICAgICAgZWwudHJpZ2dlci5hcHBseShlbCwgWycqJywgbmFtZV0uY29uY2F0KGFyZ3MpKVxuXG4gICAgfSlcblxuICAgIHJldHVybiBlbFxuICB9KVxuXG4gIHJldHVybiBlbFxuXG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuOyhmdW5jdGlvbihyaW90KSB7XG5cbi8qKlxuICogU2ltcGxlIGNsaWVudC1zaWRlIHJvdXRlclxuICogQG1vZHVsZSByaW90LXJvdXRlXG4gKi9cblxuXG52YXIgUkVfT1JJR0lOID0gL14uKz9cXC8rW15cXC9dKy8sXG4gIEVWRU5UX0xJU1RFTkVSID0gJ0V2ZW50TGlzdGVuZXInLFxuICBSRU1PVkVfRVZFTlRfTElTVEVORVIgPSAncmVtb3ZlJyArIEVWRU5UX0xJU1RFTkVSLFxuICBBRERfRVZFTlRfTElTVEVORVIgPSAnYWRkJyArIEVWRU5UX0xJU1RFTkVSLFxuICBIQVNfQVRUUklCVVRFID0gJ2hhc0F0dHJpYnV0ZScsXG4gIFJFUExBQ0UgPSAncmVwbGFjZScsXG4gIFBPUFNUQVRFID0gJ3BvcHN0YXRlJyxcbiAgSEFTSENIQU5HRSA9ICdoYXNoY2hhbmdlJyxcbiAgVFJJR0dFUiA9ICd0cmlnZ2VyJyxcbiAgTUFYX0VNSVRfU1RBQ0tfTEVWRUwgPSAzLFxuICB3aW4gPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdyxcbiAgZG9jID0gdHlwZW9mIGRvY3VtZW50ICE9ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LFxuICBoaXN0ID0gd2luICYmIGhpc3RvcnksXG4gIGxvYyA9IHdpbiAmJiAoaGlzdC5sb2NhdGlvbiB8fCB3aW4ubG9jYXRpb24pLCAvLyBzZWUgaHRtbDUtaGlzdG9yeS1hcGlcbiAgcHJvdCA9IFJvdXRlci5wcm90b3R5cGUsIC8vIHRvIG1pbmlmeSBtb3JlXG4gIGNsaWNrRXZlbnQgPSBkb2MgJiYgZG9jLm9udG91Y2hzdGFydCA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljaycsXG4gIHN0YXJ0ZWQgPSBmYWxzZSxcbiAgY2VudHJhbCA9IHJpb3Qub2JzZXJ2YWJsZSgpLFxuICByb3V0ZUZvdW5kID0gZmFsc2UsXG4gIGRlYm91bmNlZEVtaXQsXG4gIGJhc2UsIGN1cnJlbnQsIHBhcnNlciwgc2Vjb25kUGFyc2VyLCBlbWl0U3RhY2sgPSBbXSwgZW1pdFN0YWNrTGV2ZWwgPSAwXG5cbi8qKlxuICogRGVmYXVsdCBwYXJzZXIuIFlvdSBjYW4gcmVwbGFjZSBpdCB2aWEgcm91dGVyLnBhcnNlciBtZXRob2QuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIGN1cnJlbnQgcGF0aCAobm9ybWFsaXplZClcbiAqIEByZXR1cm5zIHthcnJheX0gYXJyYXlcbiAqL1xuZnVuY3Rpb24gREVGQVVMVF9QQVJTRVIocGF0aCkge1xuICByZXR1cm4gcGF0aC5zcGxpdCgvWy8/I10vKVxufVxuXG4vKipcbiAqIERlZmF1bHQgcGFyc2VyIChzZWNvbmQpLiBZb3UgY2FuIHJlcGxhY2UgaXQgdmlhIHJvdXRlci5wYXJzZXIgbWV0aG9kLlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBjdXJyZW50IHBhdGggKG5vcm1hbGl6ZWQpXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsdGVyIC0gZmlsdGVyIHN0cmluZyAobm9ybWFsaXplZClcbiAqIEByZXR1cm5zIHthcnJheX0gYXJyYXlcbiAqL1xuZnVuY3Rpb24gREVGQVVMVF9TRUNPTkRfUEFSU0VSKHBhdGgsIGZpbHRlcikge1xuICB2YXIgcmUgPSBuZXcgUmVnRXhwKCdeJyArIGZpbHRlcltSRVBMQUNFXSgvXFwqL2csICcoW14vPyNdKz8pJylbUkVQTEFDRV0oL1xcLlxcLi8sICcuKicpICsgJyQnKSxcbiAgICBhcmdzID0gcGF0aC5tYXRjaChyZSlcblxuICBpZiAoYXJncykgcmV0dXJuIGFyZ3Muc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBTaW1wbGUvY2hlYXAgZGVib3VuY2UgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSAgIHtmdW5jdGlvbn0gZm4gLSBjYWxsYmFja1xuICogQHBhcmFtICAge251bWJlcn0gZGVsYXkgLSBkZWxheSBpbiBzZWNvbmRzXG4gKiBAcmV0dXJucyB7ZnVuY3Rpb259IGRlYm91bmNlZCBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmbiwgZGVsYXkpIHtcbiAgdmFyIHRcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBjbGVhclRpbWVvdXQodClcbiAgICB0ID0gc2V0VGltZW91dChmbiwgZGVsYXkpXG4gIH1cbn1cblxuLyoqXG4gKiBTZXQgdGhlIHdpbmRvdyBsaXN0ZW5lcnMgdG8gdHJpZ2dlciB0aGUgcm91dGVzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGF1dG9FeGVjIC0gc2VlIHJvdXRlLnN0YXJ0XG4gKi9cbmZ1bmN0aW9uIHN0YXJ0KGF1dG9FeGVjKSB7XG4gIGRlYm91bmNlZEVtaXQgPSBkZWJvdW5jZShlbWl0LCAxKVxuICB3aW5bQUREX0VWRU5UX0xJU1RFTkVSXShQT1BTVEFURSwgZGVib3VuY2VkRW1pdClcbiAgd2luW0FERF9FVkVOVF9MSVNURU5FUl0oSEFTSENIQU5HRSwgZGVib3VuY2VkRW1pdClcbiAgZG9jW0FERF9FVkVOVF9MSVNURU5FUl0oY2xpY2tFdmVudCwgY2xpY2spXG4gIGlmIChhdXRvRXhlYykgZW1pdCh0cnVlKVxufVxuXG4vKipcbiAqIFJvdXRlciBjbGFzc1xuICovXG5mdW5jdGlvbiBSb3V0ZXIoKSB7XG4gIHRoaXMuJCA9IFtdXG4gIHJpb3Qub2JzZXJ2YWJsZSh0aGlzKSAvLyBtYWtlIGl0IG9ic2VydmFibGVcbiAgY2VudHJhbC5vbignc3RvcCcsIHRoaXMucy5iaW5kKHRoaXMpKVxuICBjZW50cmFsLm9uKCdlbWl0JywgdGhpcy5lLmJpbmQodGhpcykpXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZShwYXRoKSB7XG4gIHJldHVybiBwYXRoW1JFUExBQ0VdKC9eXFwvfFxcLyQvLCAnJylcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcoc3RyKSB7XG4gIHJldHVybiB0eXBlb2Ygc3RyID09ICdzdHJpbmcnXG59XG5cbi8qKlxuICogR2V0IHRoZSBwYXJ0IGFmdGVyIGRvbWFpbiBuYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZiAtIGZ1bGxwYXRoXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBwYXRoIGZyb20gcm9vdFxuICovXG5mdW5jdGlvbiBnZXRQYXRoRnJvbVJvb3QoaHJlZikge1xuICByZXR1cm4gKGhyZWYgfHwgbG9jLmhyZWYgfHwgJycpW1JFUExBQ0VdKFJFX09SSUdJTiwgJycpXG59XG5cbi8qKlxuICogR2V0IHRoZSBwYXJ0IGFmdGVyIGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmIC0gZnVsbHBhdGhcbiAqIEByZXR1cm5zIHtzdHJpbmd9IHBhdGggZnJvbSBiYXNlXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhGcm9tQmFzZShocmVmKSB7XG4gIHJldHVybiBiYXNlWzBdID09ICcjJ1xuICAgID8gKGhyZWYgfHwgbG9jLmhyZWYgfHwgJycpLnNwbGl0KGJhc2UpWzFdIHx8ICcnXG4gICAgOiBnZXRQYXRoRnJvbVJvb3QoaHJlZilbUkVQTEFDRV0oYmFzZSwgJycpXG59XG5cbmZ1bmN0aW9uIGVtaXQoZm9yY2UpIHtcbiAgLy8gdGhlIHN0YWNrIGlzIG5lZWRlZCBmb3IgcmVkaXJlY3Rpb25zXG4gIHZhciBpc1Jvb3QgPSBlbWl0U3RhY2tMZXZlbCA9PSAwXG4gIGlmIChNQVhfRU1JVF9TVEFDS19MRVZFTCA8PSBlbWl0U3RhY2tMZXZlbCkgcmV0dXJuXG5cbiAgZW1pdFN0YWNrTGV2ZWwrK1xuICBlbWl0U3RhY2sucHVzaChmdW5jdGlvbigpIHtcbiAgICB2YXIgcGF0aCA9IGdldFBhdGhGcm9tQmFzZSgpXG4gICAgaWYgKGZvcmNlIHx8IHBhdGggIT0gY3VycmVudCkge1xuICAgICAgY2VudHJhbFtUUklHR0VSXSgnZW1pdCcsIHBhdGgpXG4gICAgICBjdXJyZW50ID0gcGF0aFxuICAgIH1cbiAgfSlcbiAgaWYgKGlzUm9vdCkge1xuICAgIHdoaWxlIChlbWl0U3RhY2subGVuZ3RoKSB7XG4gICAgICBlbWl0U3RhY2tbMF0oKVxuICAgICAgZW1pdFN0YWNrLnNoaWZ0KClcbiAgICB9XG4gICAgZW1pdFN0YWNrTGV2ZWwgPSAwXG4gIH1cbn1cblxuZnVuY3Rpb24gY2xpY2soZSkge1xuICBpZiAoXG4gICAgZS53aGljaCAhPSAxIC8vIG5vdCBsZWZ0IGNsaWNrXG4gICAgfHwgZS5tZXRhS2V5IHx8IGUuY3RybEtleSB8fCBlLnNoaWZ0S2V5IC8vIG9yIG1ldGEga2V5c1xuICAgIHx8IGUuZGVmYXVsdFByZXZlbnRlZCAvLyBvciBkZWZhdWx0IHByZXZlbnRlZFxuICApIHJldHVyblxuXG4gIHZhciBlbCA9IGUudGFyZ2V0XG4gIHdoaWxlIChlbCAmJiBlbC5ub2RlTmFtZSAhPSAnQScpIGVsID0gZWwucGFyZW50Tm9kZVxuICBpZiAoXG4gICAgIWVsIHx8IGVsLm5vZGVOYW1lICE9ICdBJyAvLyBub3QgQSB0YWdcbiAgICB8fCBlbFtIQVNfQVRUUklCVVRFXSgnZG93bmxvYWQnKSAvLyBoYXMgZG93bmxvYWQgYXR0clxuICAgIHx8ICFlbFtIQVNfQVRUUklCVVRFXSgnaHJlZicpIC8vIGhhcyBubyBocmVmIGF0dHJcbiAgICB8fCBlbC50YXJnZXQgJiYgZWwudGFyZ2V0ICE9ICdfc2VsZicgLy8gYW5vdGhlciB3aW5kb3cgb3IgZnJhbWVcbiAgICB8fCBlbC5ocmVmLmluZGV4T2YobG9jLmhyZWYubWF0Y2goUkVfT1JJR0lOKVswXSkgPT0gLTEgLy8gY3Jvc3Mgb3JpZ2luXG4gICkgcmV0dXJuXG5cbiAgaWYgKGVsLmhyZWYgIT0gbG9jLmhyZWYpIHtcbiAgICBpZiAoXG4gICAgICBlbC5ocmVmLnNwbGl0KCcjJylbMF0gPT0gbG9jLmhyZWYuc3BsaXQoJyMnKVswXSAvLyBpbnRlcm5hbCBqdW1wXG4gICAgICB8fCBiYXNlICE9ICcjJyAmJiBnZXRQYXRoRnJvbVJvb3QoZWwuaHJlZikuaW5kZXhPZihiYXNlKSAhPT0gMCAvLyBvdXRzaWRlIG9mIGJhc2VcbiAgICAgIHx8ICFnbyhnZXRQYXRoRnJvbUJhc2UoZWwuaHJlZiksIGVsLnRpdGxlIHx8IGRvYy50aXRsZSkgLy8gcm91dGUgbm90IGZvdW5kXG4gICAgKSByZXR1cm5cbiAgfVxuXG4gIGUucHJldmVudERlZmF1bHQoKVxufVxuXG4vKipcbiAqIEdvIHRvIHRoZSBwYXRoXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIGRlc3RpbmF0aW9uIHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSAtIHBhZ2UgdGl0bGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvdWxkUmVwbGFjZSAtIHVzZSByZXBsYWNlU3RhdGUgb3IgcHVzaFN0YXRlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSByb3V0ZSBub3QgZm91bmQgZmxhZ1xuICovXG5mdW5jdGlvbiBnbyhwYXRoLCB0aXRsZSwgc2hvdWxkUmVwbGFjZSkge1xuICBpZiAoaGlzdCkgeyAvLyBpZiBhIGJyb3dzZXJcbiAgICBwYXRoID0gYmFzZSArIG5vcm1hbGl6ZShwYXRoKVxuICAgIHRpdGxlID0gdGl0bGUgfHwgZG9jLnRpdGxlXG4gICAgLy8gYnJvd3NlcnMgaWdub3JlcyB0aGUgc2Vjb25kIHBhcmFtZXRlciBgdGl0bGVgXG4gICAgc2hvdWxkUmVwbGFjZVxuICAgICAgPyBoaXN0LnJlcGxhY2VTdGF0ZShudWxsLCB0aXRsZSwgcGF0aClcbiAgICAgIDogaGlzdC5wdXNoU3RhdGUobnVsbCwgdGl0bGUsIHBhdGgpXG4gICAgLy8gc28gd2UgbmVlZCB0byBzZXQgaXQgbWFudWFsbHlcbiAgICBkb2MudGl0bGUgPSB0aXRsZVxuICAgIHJvdXRlRm91bmQgPSBmYWxzZVxuICAgIGVtaXQoKVxuICAgIHJldHVybiByb3V0ZUZvdW5kXG4gIH1cblxuICAvLyBTZXJ2ZXItc2lkZSB1c2FnZTogZGlyZWN0bHkgZXhlY3V0ZSBoYW5kbGVycyBmb3IgdGhlIHBhdGhcbiAgcmV0dXJuIGNlbnRyYWxbVFJJR0dFUl0oJ2VtaXQnLCBnZXRQYXRoRnJvbUJhc2UocGF0aCkpXG59XG5cbi8qKlxuICogR28gdG8gcGF0aCBvciBzZXQgYWN0aW9uXG4gKiBhIHNpbmdsZSBzdHJpbmc6ICAgICAgICAgICAgICAgIGdvIHRoZXJlXG4gKiB0d28gc3RyaW5nczogICAgICAgICAgICAgICAgICAgIGdvIHRoZXJlIHdpdGggc2V0dGluZyBhIHRpdGxlXG4gKiB0d28gc3RyaW5ncyBhbmQgYm9vbGVhbjogICAgICAgIHJlcGxhY2UgaGlzdG9yeSB3aXRoIHNldHRpbmcgYSB0aXRsZVxuICogYSBzaW5nbGUgZnVuY3Rpb246ICAgICAgICAgICAgICBzZXQgYW4gYWN0aW9uIG9uIHRoZSBkZWZhdWx0IHJvdXRlXG4gKiBhIHN0cmluZy9SZWdFeHAgYW5kIGEgZnVuY3Rpb246IHNldCBhbiBhY3Rpb24gb24gdGhlIHJvdXRlXG4gKiBAcGFyYW0geyhzdHJpbmd8ZnVuY3Rpb24pfSBmaXJzdCAtIHBhdGggLyBhY3Rpb24gLyBmaWx0ZXJcbiAqIEBwYXJhbSB7KHN0cmluZ3xSZWdFeHB8ZnVuY3Rpb24pfSBzZWNvbmQgLSB0aXRsZSAvIGFjdGlvblxuICogQHBhcmFtIHtib29sZWFufSB0aGlyZCAtIHJlcGxhY2UgZmxhZ1xuICovXG5wcm90Lm0gPSBmdW5jdGlvbihmaXJzdCwgc2Vjb25kLCB0aGlyZCkge1xuICBpZiAoaXNTdHJpbmcoZmlyc3QpICYmICghc2Vjb25kIHx8IGlzU3RyaW5nKHNlY29uZCkpKSBnbyhmaXJzdCwgc2Vjb25kLCB0aGlyZCB8fCBmYWxzZSlcbiAgZWxzZSBpZiAoc2Vjb25kKSB0aGlzLnIoZmlyc3QsIHNlY29uZClcbiAgZWxzZSB0aGlzLnIoJ0AnLCBmaXJzdClcbn1cblxuLyoqXG4gKiBTdG9wIHJvdXRpbmdcbiAqL1xucHJvdC5zID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub2ZmKCcqJylcbiAgdGhpcy4kID0gW11cbn1cblxuLyoqXG4gKiBFbWl0XG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIHBhdGhcbiAqL1xucHJvdC5lID0gZnVuY3Rpb24ocGF0aCkge1xuICB0aGlzLiQuY29uY2F0KCdAJykuc29tZShmdW5jdGlvbihmaWx0ZXIpIHtcbiAgICB2YXIgYXJncyA9IChmaWx0ZXIgPT0gJ0AnID8gcGFyc2VyIDogc2Vjb25kUGFyc2VyKShub3JtYWxpemUocGF0aCksIG5vcm1hbGl6ZShmaWx0ZXIpKVxuICAgIGlmICh0eXBlb2YgYXJncyAhPSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpc1tUUklHR0VSXS5hcHBseShudWxsLCBbZmlsdGVyXS5jb25jYXQoYXJncykpXG4gICAgICByZXR1cm4gcm91dGVGb3VuZCA9IHRydWUgLy8gZXhpdCBmcm9tIGxvb3BcbiAgICB9XG4gIH0sIHRoaXMpXG59XG5cbi8qKlxuICogUmVnaXN0ZXIgcm91dGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWx0ZXIgLSBmaWx0ZXIgZm9yIG1hdGNoaW5nIHRvIHVybFxuICogQHBhcmFtIHtmdW5jdGlvbn0gYWN0aW9uIC0gYWN0aW9uIHRvIHJlZ2lzdGVyXG4gKi9cbnByb3QuciA9IGZ1bmN0aW9uKGZpbHRlciwgYWN0aW9uKSB7XG4gIGlmIChmaWx0ZXIgIT0gJ0AnKSB7XG4gICAgZmlsdGVyID0gJy8nICsgbm9ybWFsaXplKGZpbHRlcilcbiAgICB0aGlzLiQucHVzaChmaWx0ZXIpXG4gIH1cbiAgdGhpcy5vbihmaWx0ZXIsIGFjdGlvbilcbn1cblxudmFyIG1haW5Sb3V0ZXIgPSBuZXcgUm91dGVyKClcbnZhciByb3V0ZSA9IG1haW5Sb3V0ZXIubS5iaW5kKG1haW5Sb3V0ZXIpXG5cbi8qKlxuICogQ3JlYXRlIGEgc3ViIHJvdXRlclxuICogQHJldHVybnMge2Z1bmN0aW9ufSB0aGUgbWV0aG9kIG9mIGEgbmV3IFJvdXRlciBvYmplY3RcbiAqL1xucm91dGUuY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBuZXdTdWJSb3V0ZXIgPSBuZXcgUm91dGVyKClcbiAgLy8gc3RvcCBvbmx5IHRoaXMgc3ViLXJvdXRlclxuICBuZXdTdWJSb3V0ZXIubS5zdG9wID0gbmV3U3ViUm91dGVyLnMuYmluZChuZXdTdWJSb3V0ZXIpXG4gIC8vIHJldHVybiBzdWItcm91dGVyJ3MgbWFpbiBtZXRob2RcbiAgcmV0dXJuIG5ld1N1YlJvdXRlci5tLmJpbmQobmV3U3ViUm91dGVyKVxufVxuXG4vKipcbiAqIFNldCB0aGUgYmFzZSBvZiB1cmxcbiAqIEBwYXJhbSB7KHN0cnxSZWdFeHApfSBhcmcgLSBhIG5ldyBiYXNlIG9yICcjJyBvciAnIyEnXG4gKi9cbnJvdXRlLmJhc2UgPSBmdW5jdGlvbihhcmcpIHtcbiAgYmFzZSA9IGFyZyB8fCAnIydcbiAgY3VycmVudCA9IGdldFBhdGhGcm9tQmFzZSgpIC8vIHJlY2FsY3VsYXRlIGN1cnJlbnQgcGF0aFxufVxuXG4vKiogRXhlYyByb3V0aW5nIHJpZ2h0IG5vdyAqKi9cbnJvdXRlLmV4ZWMgPSBmdW5jdGlvbigpIHtcbiAgZW1pdCh0cnVlKVxufVxuXG4vKipcbiAqIFJlcGxhY2UgdGhlIGRlZmF1bHQgcm91dGVyIHRvIHlvdXJzXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiAtIHlvdXIgcGFyc2VyIGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbjIgLSB5b3VyIHNlY29uZFBhcnNlciBmdW5jdGlvblxuICovXG5yb3V0ZS5wYXJzZXIgPSBmdW5jdGlvbihmbiwgZm4yKSB7XG4gIGlmICghZm4gJiYgIWZuMikge1xuICAgIC8vIHJlc2V0IHBhcnNlciBmb3IgdGVzdGluZy4uLlxuICAgIHBhcnNlciA9IERFRkFVTFRfUEFSU0VSXG4gICAgc2Vjb25kUGFyc2VyID0gREVGQVVMVF9TRUNPTkRfUEFSU0VSXG4gIH1cbiAgaWYgKGZuKSBwYXJzZXIgPSBmblxuICBpZiAoZm4yKSBzZWNvbmRQYXJzZXIgPSBmbjJcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZ2V0IHVybCBxdWVyeSBhcyBhbiBvYmplY3RcbiAqIEByZXR1cm5zIHtvYmplY3R9IHBhcnNlZCBxdWVyeVxuICovXG5yb3V0ZS5xdWVyeSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcSA9IHt9XG4gIHZhciBocmVmID0gbG9jLmhyZWYgfHwgY3VycmVudFxuICBocmVmW1JFUExBQ0VdKC9bPyZdKC4rPyk9KFteJl0qKS9nLCBmdW5jdGlvbihfLCBrLCB2KSB7IHFba10gPSB2IH0pXG4gIHJldHVybiBxXG59XG5cbi8qKiBTdG9wIHJvdXRpbmcgKiovXG5yb3V0ZS5zdG9wID0gZnVuY3Rpb24gKCkge1xuICBpZiAoc3RhcnRlZCkge1xuICAgIGlmICh3aW4pIHtcbiAgICAgIHdpbltSRU1PVkVfRVZFTlRfTElTVEVORVJdKFBPUFNUQVRFLCBkZWJvdW5jZWRFbWl0KVxuICAgICAgd2luW1JFTU9WRV9FVkVOVF9MSVNURU5FUl0oSEFTSENIQU5HRSwgZGVib3VuY2VkRW1pdClcbiAgICAgIGRvY1tSRU1PVkVfRVZFTlRfTElTVEVORVJdKGNsaWNrRXZlbnQsIGNsaWNrKVxuICAgIH1cbiAgICBjZW50cmFsW1RSSUdHRVJdKCdzdG9wJylcbiAgICBzdGFydGVkID0gZmFsc2VcbiAgfVxufVxuXG4vKipcbiAqIFN0YXJ0IHJvdXRpbmdcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b0V4ZWMgLSBhdXRvbWF0aWNhbGx5IGV4ZWMgYWZ0ZXIgc3RhcnRpbmcgaWYgdHJ1ZVxuICovXG5yb3V0ZS5zdGFydCA9IGZ1bmN0aW9uIChhdXRvRXhlYykge1xuICBpZiAoIXN0YXJ0ZWQpIHtcbiAgICBpZiAod2luKSB7XG4gICAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKSBzdGFydChhdXRvRXhlYylcbiAgICAgIC8vIHRoZSB0aW1lb3V0IGlzIG5lZWRlZCB0byBzb2x2ZVxuICAgICAgLy8gYSB3ZWlyZCBzYWZhcmkgYnVnIGh0dHBzOi8vZ2l0aHViLmNvbS9yaW90L3JvdXRlL2lzc3Vlcy8zM1xuICAgICAgZWxzZSB3aW5bQUREX0VWRU5UX0xJU1RFTkVSXSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBzdGFydChhdXRvRXhlYykgfSwgMSlcbiAgICAgIH0pXG4gICAgfVxuICAgIHN0YXJ0ZWQgPSB0cnVlXG4gIH1cbn1cblxuLyoqIFByZXBhcmUgdGhlIHJvdXRlciAqKi9cbnJvdXRlLmJhc2UoKVxucm91dGUucGFyc2VyKClcblxucmlvdC5yb3V0ZSA9IHJvdXRlXG59KShyaW90KVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cblxuLyoqXG4gKiBUaGUgcmlvdCB0ZW1wbGF0ZSBlbmdpbmVcbiAqIEB2ZXJzaW9uIHYyLjMuMjBcbiAqL1xuXG4vKipcbiAqIEBtb2R1bGUgYnJhY2tldHNcbiAqXG4gKiBgYnJhY2tldHMgICAgICAgICBgIFJldHVybnMgYSBzdHJpbmcgb3IgcmVnZXggYmFzZWQgb24gaXRzIHBhcmFtZXRlclxuICogYGJyYWNrZXRzLnNldHRpbmdzYCBNaXJyb3JzIHRoZSBgcmlvdC5zZXR0aW5nc2Agb2JqZWN0ICh1c2UgYnJhY2tldHMuc2V0IGluIG5ldyBjb2RlKVxuICogYGJyYWNrZXRzLnNldCAgICAgYCBDaGFuZ2UgdGhlIGN1cnJlbnQgcmlvdCBicmFja2V0c1xuICovXG4vKmdsb2JhbCByaW90ICovXG5cbnZhciBicmFja2V0cyA9IChmdW5jdGlvbiAoVU5ERUYpIHtcblxuICB2YXJcbiAgICBSRUdMT0IgID0gJ2cnLFxuXG4gICAgTUxDT01NUyA9IC9cXC9cXCpbXipdKlxcKisoPzpbXipcXC9dW14qXSpcXCorKSpcXC8vZyxcbiAgICBTVFJJTkdTID0gL1wiW15cIlxcXFxdKig/OlxcXFxbXFxTXFxzXVteXCJcXFxcXSopKlwifCdbXidcXFxcXSooPzpcXFxcW1xcU1xcc11bXidcXFxcXSopKicvZyxcblxuICAgIFNfUUJTUkMgPSBTVFJJTkdTLnNvdXJjZSArICd8JyArXG4gICAgICAvKD86XFxicmV0dXJuXFxzK3woPzpbJFxcd1xcKVxcXV18XFwrXFwrfC0tKVxccyooXFwvKSg/IVsqXFwvXSkpLy5zb3VyY2UgKyAnfCcgK1xuICAgICAgL1xcLyg/PVteKlxcL10pW15bXFwvXFxcXF0qKD86KD86XFxbKD86XFxcXC58W15cXF1cXFxcXSopKlxcXXxcXFxcLilbXltcXC9cXFxcXSopKj8oXFwvKVtnaW1dKi8uc291cmNlLFxuXG4gICAgREVGQVVMVCA9ICd7IH0nLFxuXG4gICAgRklOREJSQUNFUyA9IHtcbiAgICAgICcoJzogUmVnRXhwKCcoWygpXSl8JyAgICsgU19RQlNSQywgUkVHTE9CKSxcbiAgICAgICdbJzogUmVnRXhwKCcoW1tcXFxcXV0pfCcgKyBTX1FCU1JDLCBSRUdMT0IpLFxuICAgICAgJ3snOiBSZWdFeHAoJyhbe31dKXwnICAgKyBTX1FCU1JDLCBSRUdMT0IpXG4gICAgfVxuXG4gIHZhclxuICAgIGNhY2hlZEJyYWNrZXRzID0gVU5ERUYsXG4gICAgX3JlZ2V4LFxuICAgIF9wYWlycyA9IFtdXG5cbiAgZnVuY3Rpb24gX2xvb3BiYWNrIChyZSkgeyByZXR1cm4gcmUgfVxuXG4gIGZ1bmN0aW9uIF9yZXdyaXRlIChyZSwgYnApIHtcbiAgICBpZiAoIWJwKSBicCA9IF9wYWlyc1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFxuICAgICAgcmUuc291cmNlLnJlcGxhY2UoL3svZywgYnBbMl0pLnJlcGxhY2UoL30vZywgYnBbM10pLCByZS5nbG9iYWwgPyBSRUdMT0IgOiAnJ1xuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIF9jcmVhdGUgKHBhaXIpIHtcbiAgICB2YXJcbiAgICAgIGN2dCxcbiAgICAgIGFyciA9IHBhaXIuc3BsaXQoJyAnKVxuXG4gICAgaWYgKHBhaXIgPT09IERFRkFVTFQpIHtcbiAgICAgIGFyclsyXSA9IGFyclswXVxuICAgICAgYXJyWzNdID0gYXJyWzFdXG4gICAgICBjdnQgPSBfbG9vcGJhY2tcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCAhPT0gMiB8fCAvW1xceDAwLVxceDFGPD5hLXpBLVowLTknXCIsO1xcXFxdLy50ZXN0KHBhaXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYnJhY2tldHMgXCInICsgcGFpciArICdcIicpXG4gICAgICB9XG4gICAgICBhcnIgPSBhcnIuY29uY2F0KHBhaXIucmVwbGFjZSgvKD89W1tcXF0oKSorPy5eJHxdKS9nLCAnXFxcXCcpLnNwbGl0KCcgJykpXG4gICAgICBjdnQgPSBfcmV3cml0ZVxuICAgIH1cbiAgICBhcnJbNF0gPSBjdnQoYXJyWzFdLmxlbmd0aCA+IDEgPyAve1tcXFNcXHNdKj99LyA6IC97W159XSp9LywgYXJyKVxuICAgIGFycls1XSA9IGN2dCgvXFxcXCh7fH0pL2csIGFycilcbiAgICBhcnJbNl0gPSBjdnQoLyhcXFxcPykoeykvZywgYXJyKVxuICAgIGFycls3XSA9IFJlZ0V4cCgnKFxcXFxcXFxcPykoPzooW1soe10pfCgnICsgYXJyWzNdICsgJykpfCcgKyBTX1FCU1JDLCBSRUdMT0IpXG4gICAgYXJyWzhdID0gcGFpclxuICAgIHJldHVybiBhcnJcbiAgfVxuXG4gIGZ1bmN0aW9uIF9yZXNldCAocGFpcikge1xuICAgIGlmICghcGFpcikgcGFpciA9IERFRkFVTFRcblxuICAgIGlmIChwYWlyICE9PSBfcGFpcnNbOF0pIHtcbiAgICAgIF9wYWlycyA9IF9jcmVhdGUocGFpcilcbiAgICAgIF9yZWdleCA9IHBhaXIgPT09IERFRkFVTFQgPyBfbG9vcGJhY2sgOiBfcmV3cml0ZVxuICAgICAgX3BhaXJzWzldID0gX3JlZ2V4KC9eXFxzKntcXF4/XFxzKihbJFxcd10rKSg/OlxccyosXFxzKihcXFMrKSk/XFxzK2luXFxzKyhcXFMuKilcXHMqfS8pXG4gICAgICBfcGFpcnNbMTBdID0gX3JlZ2V4KC8oXnxbXlxcXFxdKXs9W1xcU1xcc10qP30vKVxuICAgICAgX2JyYWNrZXRzLl9yYXdPZmZzZXQgPSBfcGFpcnNbMF0ubGVuZ3RoXG4gICAgfVxuICAgIGNhY2hlZEJyYWNrZXRzID0gcGFpclxuICB9XG5cbiAgZnVuY3Rpb24gX2JyYWNrZXRzIChyZU9ySWR4KSB7XG4gICAgcmV0dXJuIHJlT3JJZHggaW5zdGFuY2VvZiBSZWdFeHAgPyBfcmVnZXgocmVPcklkeCkgOiBfcGFpcnNbcmVPcklkeF1cbiAgfVxuXG4gIF9icmFja2V0cy5zcGxpdCA9IGZ1bmN0aW9uIHNwbGl0IChzdHIsIHRtcGwsIF9icCkge1xuICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBfYnAgaXMgZm9yIHRoZSBjb21waWxlclxuICAgIGlmICghX2JwKSBfYnAgPSBfcGFpcnNcblxuICAgIHZhclxuICAgICAgcGFydHMgPSBbXSxcbiAgICAgIG1hdGNoLFxuICAgICAgaXNleHByLFxuICAgICAgc3RhcnQsXG4gICAgICBwb3MsXG4gICAgICByZSA9IF9icFs2XVxuXG4gICAgaXNleHByID0gc3RhcnQgPSByZS5sYXN0SW5kZXggPSAwXG5cbiAgICB3aGlsZSAobWF0Y2ggPSByZS5leGVjKHN0cikpIHtcblxuICAgICAgcG9zID0gbWF0Y2guaW5kZXhcblxuICAgICAgaWYgKGlzZXhwcikge1xuXG4gICAgICAgIGlmIChtYXRjaFsyXSkge1xuICAgICAgICAgIHJlLmxhc3RJbmRleCA9IHNraXBCcmFjZXMobWF0Y2hbMl0sIHJlLmxhc3RJbmRleClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFtYXRjaFszXSlcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoIW1hdGNoWzFdKSB7XG4gICAgICAgIHVuZXNjYXBlU3RyKHN0ci5zbGljZShzdGFydCwgcG9zKSlcbiAgICAgICAgc3RhcnQgPSByZS5sYXN0SW5kZXhcbiAgICAgICAgcmUgPSBfYnBbNiArIChpc2V4cHIgXj0gMSldXG4gICAgICAgIHJlLmxhc3RJbmRleCA9IHN0YXJ0XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0ciAmJiBzdGFydCA8IHN0ci5sZW5ndGgpIHtcbiAgICAgIHVuZXNjYXBlU3RyKHN0ci5zbGljZShzdGFydCkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRzXG5cbiAgICBmdW5jdGlvbiB1bmVzY2FwZVN0ciAoc3RyKSB7XG4gICAgICBpZiAodG1wbCB8fCBpc2V4cHIpXG4gICAgICAgIHBhcnRzLnB1c2goc3RyICYmIHN0ci5yZXBsYWNlKF9icFs1XSwgJyQxJykpXG4gICAgICBlbHNlXG4gICAgICAgIHBhcnRzLnB1c2goc3RyKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNraXBCcmFjZXMgKGNoLCBwb3MpIHtcbiAgICAgIHZhclxuICAgICAgICBtYXRjaCxcbiAgICAgICAgcmVjY2ggPSBGSU5EQlJBQ0VTW2NoXSxcbiAgICAgICAgbGV2ZWwgPSAxXG4gICAgICByZWNjaC5sYXN0SW5kZXggPSBwb3NcblxuICAgICAgd2hpbGUgKG1hdGNoID0gcmVjY2guZXhlYyhzdHIpKSB7XG4gICAgICAgIGlmIChtYXRjaFsxXSAmJlxuICAgICAgICAgICEobWF0Y2hbMV0gPT09IGNoID8gKytsZXZlbCA6IC0tbGV2ZWwpKSBicmVha1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoID8gcmVjY2gubGFzdEluZGV4IDogc3RyLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIF9icmFja2V0cy5oYXNFeHByID0gZnVuY3Rpb24gaGFzRXhwciAoc3RyKSB7XG4gICAgcmV0dXJuIF9icmFja2V0cyg0KS50ZXN0KHN0cilcbiAgfVxuXG4gIF9icmFja2V0cy5sb29wS2V5cyA9IGZ1bmN0aW9uIGxvb3BLZXlzIChleHByKSB7XG4gICAgdmFyIG0gPSBleHByLm1hdGNoKF9icmFja2V0cyg5KSlcbiAgICByZXR1cm4gbSA/XG4gICAgICB7IGtleTogbVsxXSwgcG9zOiBtWzJdLCB2YWw6IF9wYWlyc1swXSArIG1bM10udHJpbSgpICsgX3BhaXJzWzFdIH0gOiB7IHZhbDogZXhwci50cmltKCkgfVxuICB9XG5cbiAgX2JyYWNrZXRzLmFycmF5ID0gZnVuY3Rpb24gYXJyYXkgKHBhaXIpIHtcbiAgICByZXR1cm4gX2NyZWF0ZShwYWlyIHx8IGNhY2hlZEJyYWNrZXRzKVxuICB9XG5cbiAgdmFyIF9zZXR0aW5nc1xuICBmdW5jdGlvbiBfc2V0U2V0dGluZ3MgKG8pIHtcbiAgICB2YXIgYlxuICAgIG8gPSBvIHx8IHt9XG4gICAgYiA9IG8uYnJhY2tldHNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ2JyYWNrZXRzJywge1xuICAgICAgc2V0OiBfcmVzZXQsXG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhY2hlZEJyYWNrZXRzIH0sXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgfSlcbiAgICBfc2V0dGluZ3MgPSBvXG4gICAgX3Jlc2V0KGIpXG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9icmFja2V0cywgJ3NldHRpbmdzJywge1xuICAgIHNldDogX3NldFNldHRpbmdzLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gX3NldHRpbmdzIH1cbiAgfSlcblxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dDogaW4gdGhlIG5vZGUgdmVyc2lvbiByaW90IGlzIG5vdCBpbiB0aGUgc2NvcGUgKi9cbiAgX2JyYWNrZXRzLnNldHRpbmdzID0gdHlwZW9mIHJpb3QgIT09ICd1bmRlZmluZWQnICYmIHJpb3Quc2V0dGluZ3MgfHwge31cbiAgX2JyYWNrZXRzLnNldCA9IF9yZXNldFxuXG4gIF9icmFja2V0cy5SX1NUUklOR1MgPSBTVFJJTkdTXG4gIF9icmFja2V0cy5SX01MQ09NTVMgPSBNTENPTU1TXG4gIF9icmFja2V0cy5TX1FCTE9DS1MgPSBTX1FCU1JDXG5cbiAgcmV0dXJuIF9icmFja2V0c1xuXG59KSgpXG5cbi8qKlxuICogQG1vZHVsZSB0bXBsXG4gKlxuICogdG1wbCAgICAgICAgICAtIFJvb3QgZnVuY3Rpb24sIHJldHVybnMgdGhlIHRlbXBsYXRlIHZhbHVlLCByZW5kZXIgd2l0aCBkYXRhXG4gKiB0bXBsLmhhc0V4cHIgIC0gVGVzdCB0aGUgZXhpc3RlbmNlIG9mIGEgZXhwcmVzc2lvbiBpbnNpZGUgYSBzdHJpbmdcbiAqIHRtcGwubG9vcEtleXMgLSBHZXQgdGhlIGtleXMgZm9yIGFuICdlYWNoJyBsb29wICh1c2VkIGJ5IGBfZWFjaGApXG4gKi9cbi8qZ2xvYmFsIHJpb3QgKi9cblxudmFyIHRtcGwgPSAoZnVuY3Rpb24gKCkge1xuXG4gIHZhciBfY2FjaGUgPSB7fVxuXG4gIGZ1bmN0aW9uIF90bXBsIChzdHIsIGRhdGEpIHtcbiAgICBpZiAoIXN0cikgcmV0dXJuIHN0clxuXG4gICAgcmV0dXJuIChfY2FjaGVbc3RyXSB8fCAoX2NhY2hlW3N0cl0gPSBfY3JlYXRlKHN0cikpKS5jYWxsKGRhdGEsIF9sb2dFcnIpXG4gIH1cblxuICBfdG1wbC5pc1JhdyA9IGZ1bmN0aW9uIChleHByKSB7XG4gICAgcmV0dXJuIGV4cHJbYnJhY2tldHMuX3Jhd09mZnNldF0gPT09ICc9J1xuICB9XG5cbiAgX3RtcGwuaGF2ZVJhdyA9IGZ1bmN0aW9uIChzcmMpIHtcbiAgICByZXR1cm4gYnJhY2tldHMoMTApLnRlc3Qoc3JjKVxuICB9XG5cbiAgX3RtcGwuaGFzRXhwciA9IGJyYWNrZXRzLmhhc0V4cHJcblxuICBfdG1wbC5sb29wS2V5cyA9IGJyYWNrZXRzLmxvb3BLZXlzXG5cbiAgX3RtcGwuZXJyb3JIYW5kbGVyID0gbnVsbFxuXG4gIGZ1bmN0aW9uIF9sb2dFcnIgKGVyciwgY3R4KSB7XG5cbiAgICBpZiAoX3RtcGwuZXJyb3JIYW5kbGVyKSB7XG5cbiAgICAgIGVyci5yaW90RGF0YSA9IHtcbiAgICAgICAgdGFnTmFtZTogY3R4ICYmIGN0eC5yb290ICYmIGN0eC5yb290LnRhZ05hbWUsXG4gICAgICAgIF9yaW90X2lkOiBjdHggJiYgY3R4Ll9yaW90X2lkICAvL2VzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICB9XG4gICAgICBfdG1wbC5lcnJvckhhbmRsZXIoZXJyKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIF9jcmVhdGUgKHN0cikge1xuXG4gICAgdmFyIGV4cHIgPSBfZ2V0VG1wbChzdHIpXG4gICAgaWYgKGV4cHIuc2xpY2UoMCwgMTEpICE9PSAndHJ5e3JldHVybiAnKSBleHByID0gJ3JldHVybiAnICsgZXhwclxuXG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbignRScsIGV4cHIgKyAnOycpXG4gIH1cblxuICB2YXJcbiAgICBSRV9RQkxPQ0sgPSBSZWdFeHAoYnJhY2tldHMuU19RQkxPQ0tTLCAnZycpLFxuICAgIFJFX1FCTUFSSyA9IC9cXHgwMShcXGQrKX4vZ1xuXG4gIGZ1bmN0aW9uIF9nZXRUbXBsIChzdHIpIHtcbiAgICB2YXJcbiAgICAgIHFzdHIgPSBbXSxcbiAgICAgIGV4cHIsXG4gICAgICBwYXJ0cyA9IGJyYWNrZXRzLnNwbGl0KHN0ci5yZXBsYWNlKC9cXHUyMDU3L2csICdcIicpLCAxKVxuXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA+IDIgfHwgcGFydHNbMF0pIHtcbiAgICAgIHZhciBpLCBqLCBsaXN0ID0gW11cblxuICAgICAgZm9yIChpID0gaiA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7ICsraSkge1xuXG4gICAgICAgIGV4cHIgPSBwYXJ0c1tpXVxuXG4gICAgICAgIGlmIChleHByICYmIChleHByID0gaSAmIDEgP1xuXG4gICAgICAgICAgICAgIF9wYXJzZUV4cHIoZXhwciwgMSwgcXN0cikgOlxuXG4gICAgICAgICAgICAgICdcIicgKyBleHByXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxyXFxuP3xcXG4vZywgJ1xcXFxuJylcbiAgICAgICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICtcbiAgICAgICAgICAgICAgJ1wiJ1xuXG4gICAgICAgICAgKSkgbGlzdFtqKytdID0gZXhwclxuXG4gICAgICB9XG5cbiAgICAgIGV4cHIgPSBqIDwgMiA/IGxpc3RbMF0gOlxuICAgICAgICAgICAgICdbJyArIGxpc3Quam9pbignLCcpICsgJ10uam9pbihcIlwiKSdcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIGV4cHIgPSBfcGFyc2VFeHByKHBhcnRzWzFdLCAwLCBxc3RyKVxuICAgIH1cblxuICAgIGlmIChxc3RyWzBdKVxuICAgICAgZXhwciA9IGV4cHIucmVwbGFjZShSRV9RQk1BUkssIGZ1bmN0aW9uIChfLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIHFzdHJbcG9zXVxuICAgICAgICAgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcbiAgICAgICAgICAucmVwbGFjZSgvXFxuL2csICdcXFxcbicpXG4gICAgICB9KVxuXG4gICAgcmV0dXJuIGV4cHJcbiAgfVxuXG4gIHZhclxuICAgIENTX0lERU5UID0gL14oPzooLT9bX0EtWmEtelxceEEwLVxceEZGXVstXFx3XFx4QTAtXFx4RkZdKil8XFx4MDEoXFxkKyl+KTovXG5cbiAgZnVuY3Rpb24gX3BhcnNlRXhwciAoZXhwciwgYXNUZXh0LCBxc3RyKSB7XG5cbiAgICBpZiAoZXhwclswXSA9PT0gJz0nKSBleHByID0gZXhwci5zbGljZSgxKVxuXG4gICAgZXhwciA9IGV4cHJcbiAgICAgICAgICAucmVwbGFjZShSRV9RQkxPQ0ssIGZ1bmN0aW9uIChzLCBkaXYpIHtcbiAgICAgICAgICAgIHJldHVybiBzLmxlbmd0aCA+IDIgJiYgIWRpdiA/ICdcXHgwMScgKyAocXN0ci5wdXNoKHMpIC0gMSkgKyAnficgOiBzXG4gICAgICAgICAgfSlcbiAgICAgICAgICAucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICAgICAgICAgIC5yZXBsYWNlKC9cXCA/KFtbXFwoe30sP1xcLjpdKVxcID8vZywgJyQxJylcblxuICAgIGlmIChleHByKSB7XG4gICAgICB2YXJcbiAgICAgICAgbGlzdCA9IFtdLFxuICAgICAgICBjbnQgPSAwLFxuICAgICAgICBtYXRjaFxuXG4gICAgICB3aGlsZSAoZXhwciAmJlxuICAgICAgICAgICAgKG1hdGNoID0gZXhwci5tYXRjaChDU19JREVOVCkpICYmXG4gICAgICAgICAgICAhbWF0Y2guaW5kZXhcbiAgICAgICAgKSB7XG4gICAgICAgIHZhclxuICAgICAgICAgIGtleSxcbiAgICAgICAgICBqc2IsXG4gICAgICAgICAgcmUgPSAvLHwoW1t7KF0pfCQvZ1xuXG4gICAgICAgIGV4cHIgPSBSZWdFeHAucmlnaHRDb250ZXh0XG4gICAgICAgIGtleSAgPSBtYXRjaFsyXSA/IHFzdHJbbWF0Y2hbMl1dLnNsaWNlKDEsIC0xKS50cmltKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpIDogbWF0Y2hbMV1cblxuICAgICAgICB3aGlsZSAoanNiID0gKG1hdGNoID0gcmUuZXhlYyhleHByKSlbMV0pIHNraXBCcmFjZXMoanNiLCByZSlcblxuICAgICAgICBqc2IgID0gZXhwci5zbGljZSgwLCBtYXRjaC5pbmRleClcbiAgICAgICAgZXhwciA9IFJlZ0V4cC5yaWdodENvbnRleHRcblxuICAgICAgICBsaXN0W2NudCsrXSA9IF93cmFwRXhwcihqc2IsIDEsIGtleSlcbiAgICAgIH1cblxuICAgICAgZXhwciA9ICFjbnQgPyBfd3JhcEV4cHIoZXhwciwgYXNUZXh0KSA6XG4gICAgICAgICAgY250ID4gMSA/ICdbJyArIGxpc3Quam9pbignLCcpICsgJ10uam9pbihcIiBcIikudHJpbSgpJyA6IGxpc3RbMF1cbiAgICB9XG4gICAgcmV0dXJuIGV4cHJcblxuICAgIGZ1bmN0aW9uIHNraXBCcmFjZXMgKGpzYiwgcmUpIHtcbiAgICAgIHZhclxuICAgICAgICBtYXRjaCxcbiAgICAgICAgbHYgPSAxLFxuICAgICAgICBpciA9IGpzYiA9PT0gJygnID8gL1soKV0vZyA6IGpzYiA9PT0gJ1snID8gL1tbXFxdXS9nIDogL1t7fV0vZ1xuXG4gICAgICBpci5sYXN0SW5kZXggPSByZS5sYXN0SW5kZXhcbiAgICAgIHdoaWxlIChtYXRjaCA9IGlyLmV4ZWMoZXhwcikpIHtcbiAgICAgICAgaWYgKG1hdGNoWzBdID09PSBqc2IpICsrbHZcbiAgICAgICAgZWxzZSBpZiAoIS0tbHYpIGJyZWFrXG4gICAgICB9XG4gICAgICByZS5sYXN0SW5kZXggPSBsdiA/IGV4cHIubGVuZ3RoIDogaXIubGFzdEluZGV4XG4gICAgfVxuICB9XG5cbiAgLy8gaXN0YW5idWwgaWdub3JlIG5leHQ6IG5vdCBib3RoXG4gIHZhclxuICAgIEpTX0NPTlRFWFQgPSAnXCJpbiB0aGlzP3RoaXM6JyArICh0eXBlb2Ygd2luZG93ICE9PSAnb2JqZWN0JyA/ICdnbG9iYWwnIDogJ3dpbmRvdycpICsgJykuJyxcbiAgICBKU19WQVJOQU1FID0gL1sse11bJFxcd10rOnwoXiAqfFteJFxcd1xcLl0pKD8hKD86dHlwZW9mfHRydWV8ZmFsc2V8bnVsbHx1bmRlZmluZWR8aW58aW5zdGFuY2VvZnxpcyg/OkZpbml0ZXxOYU4pfHZvaWR8TmFOfG5ld3xEYXRlfFJlZ0V4cHxNYXRoKSg/IVskXFx3XSkpKFskX0EtWmEtel1bJFxcd10qKS9nLFxuICAgIEpTX05PUFJPUFMgPSAvXig/PShcXC5bJFxcd10rKSlcXDEoPzpbXi5bKF18JCkvXG5cbiAgZnVuY3Rpb24gX3dyYXBFeHByIChleHByLCBhc1RleHQsIGtleSkge1xuICAgIHZhciB0YlxuXG4gICAgZXhwciA9IGV4cHIucmVwbGFjZShKU19WQVJOQU1FLCBmdW5jdGlvbiAobWF0Y2gsIHAsIG12YXIsIHBvcywgcykge1xuICAgICAgaWYgKG12YXIpIHtcbiAgICAgICAgcG9zID0gdGIgPyAwIDogcG9zICsgbWF0Y2gubGVuZ3RoXG5cbiAgICAgICAgaWYgKG12YXIgIT09ICd0aGlzJyAmJiBtdmFyICE9PSAnZ2xvYmFsJyAmJiBtdmFyICE9PSAnd2luZG93Jykge1xuICAgICAgICAgIG1hdGNoID0gcCArICcoXCInICsgbXZhciArIEpTX0NPTlRFWFQgKyBtdmFyXG4gICAgICAgICAgaWYgKHBvcykgdGIgPSAocyA9IHNbcG9zXSkgPT09ICcuJyB8fCBzID09PSAnKCcgfHwgcyA9PT0gJ1snXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocG9zKSB7XG4gICAgICAgICAgdGIgPSAhSlNfTk9QUk9QUy50ZXN0KHMuc2xpY2UocG9zKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoXG4gICAgfSlcblxuICAgIGlmICh0Yikge1xuICAgICAgZXhwciA9ICd0cnl7cmV0dXJuICcgKyBleHByICsgJ31jYXRjaChlKXtFKGUsdGhpcyl9J1xuICAgIH1cblxuICAgIGlmIChrZXkpIHtcblxuICAgICAgZXhwciA9ICh0YiA/XG4gICAgICAgICAgJ2Z1bmN0aW9uKCl7JyArIGV4cHIgKyAnfS5jYWxsKHRoaXMpJyA6ICcoJyArIGV4cHIgKyAnKSdcbiAgICAgICAgKSArICc/XCInICsga2V5ICsgJ1wiOlwiXCInXG4gICAgfVxuICAgIGVsc2UgaWYgKGFzVGV4dCkge1xuXG4gICAgICBleHByID0gJ2Z1bmN0aW9uKHYpeycgKyAodGIgP1xuICAgICAgICAgIGV4cHIucmVwbGFjZSgncmV0dXJuICcsICd2PScpIDogJ3Y9KCcgKyBleHByICsgJyknXG4gICAgICAgICkgKyAnO3JldHVybiB2fHx2PT09MD92OlwiXCJ9LmNhbGwodGhpcyknXG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cHJcbiAgfVxuXG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0OiBjb21wYXRpYmlsaXR5IGZpeCBmb3IgYmV0YSB2ZXJzaW9uc1xuICBfdG1wbC5wYXJzZSA9IGZ1bmN0aW9uIChzKSB7IHJldHVybiBzIH1cblxuICByZXR1cm4gX3RtcGxcblxufSkoKVxuXG4gIHRtcGwudmVyc2lvbiA9IGJyYWNrZXRzLnZlcnNpb24gPSAndjIuMy4yMCdcblxuXG4vKlxuICBsaWIvYnJvd3Nlci90YWcvbWtkb20uanNcblxuICBJbmNsdWRlcyBoYWNrcyBuZWVkZWQgZm9yIHRoZSBJbnRlcm5ldCBFeHBsb3JlciB2ZXJzaW9uIDkgYW5kIGJlbG93XG5cbiovXG4vLyBodHRwOi8va2FuZ2F4LmdpdGh1Yi5pby9jb21wYXQtdGFibGUvZXM1LyNpZThcbi8vIGh0dHA6Ly9jb2RlcGxhbmV0LmlvL2Ryb3BwaW5nLWllOC9cblxudmFyIG1rZG9tID0gKGZ1bmN0aW9uIChjaGVja0lFKSB7XG5cbiAgdmFyIHJvb3RFbHMgPSB7XG4gICAgICB0cjogJ3Rib2R5JyxcbiAgICAgIHRoOiAndHInLFxuICAgICAgdGQ6ICd0cicsXG4gICAgICB0Ym9keTogJ3RhYmxlJyxcbiAgICAgIGNvbDogJ2NvbGdyb3VwJ1xuICAgIH0sXG4gICAgcmVUb1NyYyA9IC88eWllbGRcXHMrdG89KFsnXCJdKT9AXFwxXFxzKj4oW1xcU1xcc10rPyk8XFwveWllbGRcXHMqPi8uc291cmNlLFxuICAgIEdFTkVSSUMgPSAnZGl2J1xuXG4gIGNoZWNrSUUgPSBjaGVja0lFICYmIGNoZWNrSUUgPCAxMFxuXG4gIC8vIGNyZWF0ZXMgYW55IGRvbSBlbGVtZW50IGluIGEgZGl2LCB0YWJsZSwgb3IgY29sZ3JvdXAgY29udGFpbmVyXG4gIGZ1bmN0aW9uIF9ta2RvbSh0ZW1wbCwgaHRtbCkge1xuXG4gICAgdmFyIG1hdGNoID0gdGVtcGwgJiYgdGVtcGwubWF0Y2goL15cXHMqPChbLVxcd10rKS8pLFxuICAgICAgdGFnTmFtZSA9IG1hdGNoICYmIG1hdGNoWzFdLnRvTG93ZXJDYXNlKCksXG4gICAgICByb290VGFnID0gcm9vdEVsc1t0YWdOYW1lXSB8fCBHRU5FUklDLFxuICAgICAgZWwgPSBta0VsKHJvb3RUYWcpXG5cbiAgICBlbC5zdHViID0gdHJ1ZVxuXG4gICAgLy8gcmVwbGFjZSBhbGwgdGhlIHlpZWxkIHRhZ3Mgd2l0aCB0aGUgdGFnIGlubmVyIGh0bWxcbiAgICBpZiAoaHRtbCkgdGVtcGwgPSByZXBsYWNlWWllbGQodGVtcGwsIGh0bWwpXG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmIChjaGVja0lFICYmIHRhZ05hbWUgJiYgKG1hdGNoID0gdGFnTmFtZS5tYXRjaChTUEVDSUFMX1RBR1NfUkVHRVgpKSlcbiAgICAgIGllOWVsZW0oZWwsIHRlbXBsLCB0YWdOYW1lLCAhIW1hdGNoWzFdKVxuICAgIGVsc2VcbiAgICAgIGVsLmlubmVySFRNTCA9IHRlbXBsXG5cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8vIGNyZWF0ZXMgdHIsIHRoLCB0ZCwgb3B0aW9uLCBvcHRncm91cCBlbGVtZW50IGZvciBJRTgtOVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBmdW5jdGlvbiBpZTllbGVtKGVsLCBodG1sLCB0YWdOYW1lLCBzZWxlY3QpIHtcblxuICAgIHZhciBkaXYgPSBta0VsKEdFTkVSSUMpLFxuICAgICAgdGFnID0gc2VsZWN0ID8gJ3NlbGVjdD4nIDogJ3RhYmxlPicsXG4gICAgICBjaGlsZFxuXG4gICAgZGl2LmlubmVySFRNTCA9ICc8JyArIHRhZyArIGh0bWwgKyAnPC8nICsgdGFnXG5cbiAgICBjaGlsZCA9ICQodGFnTmFtZSwgZGl2KVxuICAgIGlmIChjaGlsZClcbiAgICAgIGVsLmFwcGVuZENoaWxkKGNoaWxkKVxuXG4gIH1cbiAgLy8gZW5kIGllOWVsZW0oKVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIHRoZSB5aWVsZCB0YWcgZnJvbSBhbnkgdGFnIHRlbXBsYXRlIHdpdGggdGhlIGlubmVySFRNTCBvZiB0aGVcbiAgICogb3JpZ2luYWwgdGFnIGluIHRoZSBwYWdlXG4gICAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gdGVtcGwgLSB0YWcgaW1wbGVtZW50YXRpb24gdGVtcGxhdGVcbiAgICogQHBhcmFtICAgeyBTdHJpbmcgfSBodG1sICAtIG9yaWdpbmFsIGNvbnRlbnQgb2YgdGhlIHRhZyBpbiB0aGUgRE9NXG4gICAqIEByZXR1cm5zIHsgU3RyaW5nIH0gdGFnIHRlbXBsYXRlIHVwZGF0ZWQgd2l0aG91dCB0aGUgeWllbGQgdGFnXG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlWWllbGQodGVtcGwsIGh0bWwpIHtcbiAgICAvLyBkbyBub3RoaW5nIGlmIG5vIHlpZWxkXG4gICAgaWYgKCEvPHlpZWxkXFxiL2kudGVzdCh0ZW1wbCkpIHJldHVybiB0ZW1wbFxuXG4gICAgLy8gYmUgY2FyZWZ1bCB3aXRoICMxMzQzIC0gc3RyaW5nIG9uIHRoZSBzb3VyY2UgaGF2aW5nIGAkMWBcbiAgICB2YXIgbiA9IDBcbiAgICB0ZW1wbCA9IHRlbXBsLnJlcGxhY2UoLzx5aWVsZFxccytmcm9tPVsnXCJdKFstXFx3XSspWydcIl1cXHMqKD86XFwvPnw+XFxzKjxcXC95aWVsZFxccyo+KS9pZyxcbiAgICAgIGZ1bmN0aW9uIChzdHIsIHJlZikge1xuICAgICAgICB2YXIgbSA9IGh0bWwubWF0Y2goUmVnRXhwKHJlVG9TcmMucmVwbGFjZSgnQCcsIHJlZiksICdpJykpXG4gICAgICAgICsrblxuICAgICAgICByZXR1cm4gbSAmJiBtWzJdIHx8ICcnXG4gICAgICB9KVxuXG4gICAgLy8geWllbGQgd2l0aG91dCBhbnkgXCJmcm9tXCIsIHJlcGxhY2UgeWllbGQgaW4gdGVtcGwgd2l0aCB0aGUgaW5uZXJIVE1MXG4gICAgcmV0dXJuIG4gPyB0ZW1wbCA6IHRlbXBsLnJlcGxhY2UoLzx5aWVsZFxccyooPzpcXC8+fD5cXHMqPFxcL3lpZWxkXFxzKj4pL2dpLCBodG1sIHx8ICcnKVxuICB9XG5cbiAgcmV0dXJuIF9ta2RvbVxuXG59KShJRV9WRVJTSU9OKVxuXG4vKipcbiAqIENvbnZlcnQgdGhlIGl0ZW0gbG9vcGVkIGludG8gYW4gb2JqZWN0IHVzZWQgdG8gZXh0ZW5kIHRoZSBjaGlsZCB0YWcgcHJvcGVydGllc1xuICogQHBhcmFtICAgeyBPYmplY3QgfSBleHByIC0gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleXMgdXNlZCB0byBleHRlbmQgdGhlIGNoaWxkcmVuIHRhZ3NcbiAqIEBwYXJhbSAgIHsgKiB9IGtleSAtIHZhbHVlIHRvIGFzc2lnbiB0byB0aGUgbmV3IG9iamVjdCByZXR1cm5lZFxuICogQHBhcmFtICAgeyAqIH0gdmFsIC0gdmFsdWUgY29udGFpbmluZyB0aGUgcG9zaXRpb24gb2YgdGhlIGl0ZW0gaW4gdGhlIGFycmF5XG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IC0gbmV3IG9iamVjdCBjb250YWluaW5nIHRoZSB2YWx1ZXMgb2YgdGhlIG9yaWdpbmFsIGl0ZW1cbiAqXG4gKiBUaGUgdmFyaWFibGVzICdrZXknIGFuZCAndmFsJyBhcmUgYXJiaXRyYXJ5LlxuICogVGhleSBkZXBlbmQgb24gdGhlIGNvbGxlY3Rpb24gdHlwZSBsb29wZWQgKEFycmF5LCBPYmplY3QpXG4gKiBhbmQgb24gdGhlIGV4cHJlc3Npb24gdXNlZCBvbiB0aGUgZWFjaCB0YWdcbiAqXG4gKi9cbmZ1bmN0aW9uIG1raXRlbShleHByLCBrZXksIHZhbCkge1xuICB2YXIgaXRlbSA9IHt9XG4gIGl0ZW1bZXhwci5rZXldID0ga2V5XG4gIGlmIChleHByLnBvcykgaXRlbVtleHByLnBvc10gPSB2YWxcbiAgcmV0dXJuIGl0ZW1cbn1cblxuLyoqXG4gKiBVbm1vdW50IHRoZSByZWR1bmRhbnQgdGFnc1xuICogQHBhcmFtICAgeyBBcnJheSB9IGl0ZW1zIC0gYXJyYXkgY29udGFpbmluZyB0aGUgY3VycmVudCBpdGVtcyB0byBsb29wXG4gKiBAcGFyYW0gICB7IEFycmF5IH0gdGFncyAtIGFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSBjaGlsZHJlbiB0YWdzXG4gKi9cbmZ1bmN0aW9uIHVubW91bnRSZWR1bmRhbnQoaXRlbXMsIHRhZ3MpIHtcblxuICB2YXIgaSA9IHRhZ3MubGVuZ3RoLFxuICAgIGogPSBpdGVtcy5sZW5ndGgsXG4gICAgdFxuXG4gIHdoaWxlIChpID4gaikge1xuICAgIHQgPSB0YWdzWy0taV1cbiAgICB0YWdzLnNwbGljZShpLCAxKVxuICAgIHQudW5tb3VudCgpXG4gIH1cbn1cblxuLyoqXG4gKiBNb3ZlIHRoZSBuZXN0ZWQgY3VzdG9tIHRhZ3MgaW4gbm9uIGN1c3RvbSBsb29wIHRhZ3NcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY2hpbGQgLSBub24gY3VzdG9tIGxvb3AgdGFnXG4gKiBAcGFyYW0gICB7IE51bWJlciB9IGkgLSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBsb29wIHRhZ1xuICovXG5mdW5jdGlvbiBtb3ZlTmVzdGVkVGFncyhjaGlsZCwgaSkge1xuICBPYmplY3Qua2V5cyhjaGlsZC50YWdzKS5mb3JFYWNoKGZ1bmN0aW9uKHRhZ05hbWUpIHtcbiAgICB2YXIgdGFnID0gY2hpbGQudGFnc1t0YWdOYW1lXVxuICAgIGlmIChpc0FycmF5KHRhZykpXG4gICAgICBlYWNoKHRhZywgZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgbW92ZUNoaWxkVGFnKHQsIHRhZ05hbWUsIGkpXG4gICAgICB9KVxuICAgIGVsc2VcbiAgICAgIG1vdmVDaGlsZFRhZyh0YWcsIHRhZ05hbWUsIGkpXG4gIH0pXG59XG5cbi8qKlxuICogQWRkcyB0aGUgZWxlbWVudHMgZm9yIGEgdmlydHVhbCB0YWdcbiAqIEBwYXJhbSB7IFRhZyB9IHRhZyAtIHRoZSB0YWcgd2hvc2Ugcm9vdCdzIGNoaWxkcmVuIHdpbGwgYmUgaW5zZXJ0ZWQgb3IgYXBwZW5kZWRcbiAqIEBwYXJhbSB7IE5vZGUgfSBzcmMgLSB0aGUgbm9kZSB0aGF0IHdpbGwgZG8gdGhlIGluc2VydGluZyBvciBhcHBlbmRpbmdcbiAqIEBwYXJhbSB7IFRhZyB9IHRhcmdldCAtIG9ubHkgaWYgaW5zZXJ0aW5nLCBpbnNlcnQgYmVmb3JlIHRoaXMgdGFnJ3MgZmlyc3QgY2hpbGRcbiAqL1xuZnVuY3Rpb24gYWRkVmlydHVhbCh0YWcsIHNyYywgdGFyZ2V0KSB7XG4gIHZhciBlbCA9IHRhZy5fcm9vdCwgc2liXG4gIHRhZy5fdmlydHMgPSBbXVxuICB3aGlsZSAoZWwpIHtcbiAgICBzaWIgPSBlbC5uZXh0U2libGluZ1xuICAgIGlmICh0YXJnZXQpXG4gICAgICBzcmMuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQuX3Jvb3QpXG4gICAgZWxzZVxuICAgICAgc3JjLmFwcGVuZENoaWxkKGVsKVxuXG4gICAgdGFnLl92aXJ0cy5wdXNoKGVsKSAvLyBob2xkIGZvciB1bm1vdW50aW5nXG4gICAgZWwgPSBzaWJcbiAgfVxufVxuXG4vKipcbiAqIE1vdmUgdmlydHVhbCB0YWcgYW5kIGFsbCBjaGlsZCBub2Rlc1xuICogQHBhcmFtIHsgVGFnIH0gdGFnIC0gZmlyc3QgY2hpbGQgcmVmZXJlbmNlIHVzZWQgdG8gc3RhcnQgbW92ZVxuICogQHBhcmFtIHsgTm9kZSB9IHNyYyAgLSB0aGUgbm9kZSB0aGF0IHdpbGwgZG8gdGhlIGluc2VydGluZ1xuICogQHBhcmFtIHsgVGFnIH0gdGFyZ2V0IC0gaW5zZXJ0IGJlZm9yZSB0aGlzIHRhZydzIGZpcnN0IGNoaWxkXG4gKiBAcGFyYW0geyBOdW1iZXIgfSBsZW4gLSBob3cgbWFueSBjaGlsZCBub2RlcyB0byBtb3ZlXG4gKi9cbmZ1bmN0aW9uIG1vdmVWaXJ0dWFsKHRhZywgc3JjLCB0YXJnZXQsIGxlbikge1xuICB2YXIgZWwgPSB0YWcuX3Jvb3QsIHNpYiwgaSA9IDBcbiAgZm9yICg7IGkgPCBsZW47IGkrKykge1xuICAgIHNpYiA9IGVsLm5leHRTaWJsaW5nXG4gICAgc3JjLmluc2VydEJlZm9yZShlbCwgdGFyZ2V0Ll9yb290KVxuICAgIGVsID0gc2liXG4gIH1cbn1cblxuXG4vKipcbiAqIE1hbmFnZSB0YWdzIGhhdmluZyB0aGUgJ2VhY2gnXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIG5lZWQgdG8gbG9vcFxuICogQHBhcmFtICAgeyBUYWcgfSBwYXJlbnQgLSBwYXJlbnQgdGFnIGluc3RhbmNlIHdoZXJlIHRoZSBkb20gbm9kZSBpcyBjb250YWluZWRcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gZXhwciAtIHN0cmluZyBjb250YWluZWQgaW4gdGhlICdlYWNoJyBhdHRyaWJ1dGVcbiAqL1xuZnVuY3Rpb24gX2VhY2goZG9tLCBwYXJlbnQsIGV4cHIpIHtcblxuICAvLyByZW1vdmUgdGhlIGVhY2ggcHJvcGVydHkgZnJvbSB0aGUgb3JpZ2luYWwgdGFnXG4gIHJlbUF0dHIoZG9tLCAnZWFjaCcpXG5cbiAgdmFyIG11c3RSZW9yZGVyID0gdHlwZW9mIGdldEF0dHIoZG9tLCAnbm8tcmVvcmRlcicpICE9PSBUX1NUUklORyB8fCByZW1BdHRyKGRvbSwgJ25vLXJlb3JkZXInKSxcbiAgICB0YWdOYW1lID0gZ2V0VGFnTmFtZShkb20pLFxuICAgIGltcGwgPSBfX3RhZ0ltcGxbdGFnTmFtZV0gfHwgeyB0bXBsOiBkb20ub3V0ZXJIVE1MIH0sXG4gICAgdXNlUm9vdCA9IFNQRUNJQUxfVEFHU19SRUdFWC50ZXN0KHRhZ05hbWUpLFxuICAgIHJvb3QgPSBkb20ucGFyZW50Tm9kZSxcbiAgICByZWYgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyksXG4gICAgY2hpbGQgPSBnZXRUYWcoZG9tKSxcbiAgICBpc09wdGlvbiA9IC9vcHRpb24vZ2kudGVzdCh0YWdOYW1lKSwgLy8gdGhlIG9wdGlvbiB0YWdzIG11c3QgYmUgdHJlYXRlZCBkaWZmZXJlbnRseVxuICAgIHRhZ3MgPSBbXSxcbiAgICBvbGRJdGVtcyA9IFtdLFxuICAgIGhhc0tleXMsXG4gICAgaXNWaXJ0dWFsID0gZG9tLnRhZ05hbWUgPT0gJ1ZJUlRVQUwnXG5cbiAgLy8gcGFyc2UgdGhlIGVhY2ggZXhwcmVzc2lvblxuICBleHByID0gdG1wbC5sb29wS2V5cyhleHByKVxuXG4gIC8vIGluc2VydCBhIG1hcmtlZCB3aGVyZSB0aGUgbG9vcCB0YWdzIHdpbGwgYmUgaW5qZWN0ZWRcbiAgcm9vdC5pbnNlcnRCZWZvcmUocmVmLCBkb20pXG5cbiAgLy8gY2xlYW4gdGVtcGxhdGUgY29kZVxuICBwYXJlbnQub25lKCdiZWZvcmUtbW91bnQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAvLyByZW1vdmUgdGhlIG9yaWdpbmFsIERPTSBub2RlXG4gICAgZG9tLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tKVxuICAgIGlmIChyb290LnN0dWIpIHJvb3QgPSBwYXJlbnQucm9vdFxuXG4gIH0pLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gZ2V0IHRoZSBuZXcgaXRlbXMgY29sbGVjdGlvblxuICAgIHZhciBpdGVtcyA9IHRtcGwoZXhwci52YWwsIHBhcmVudCksXG4gICAgICAvLyBjcmVhdGUgYSBmcmFnbWVudCB0byBob2xkIHRoZSBuZXcgRE9NIG5vZGVzIHRvIGluamVjdCBpbiB0aGUgcGFyZW50IHRhZ1xuICAgICAgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuXG5cblxuICAgIC8vIG9iamVjdCBsb29wLiBhbnkgY2hhbmdlcyBjYXVzZSBmdWxsIHJlZHJhd1xuICAgIGlmICghaXNBcnJheShpdGVtcykpIHtcbiAgICAgIGhhc0tleXMgPSBpdGVtcyB8fCBmYWxzZVxuICAgICAgaXRlbXMgPSBoYXNLZXlzID9cbiAgICAgICAgT2JqZWN0LmtleXMoaXRlbXMpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgcmV0dXJuIG1raXRlbShleHByLCBrZXksIGl0ZW1zW2tleV0pXG4gICAgICAgIH0pIDogW11cbiAgICB9XG5cbiAgICAvLyBsb29wIGFsbCB0aGUgbmV3IGl0ZW1zXG4gICAgaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtLCBpKSB7XG4gICAgICAvLyByZW9yZGVyIG9ubHkgaWYgdGhlIGl0ZW1zIGFyZSBvYmplY3RzXG4gICAgICB2YXIgX211c3RSZW9yZGVyID0gbXVzdFJlb3JkZXIgJiYgaXRlbSBpbnN0YW5jZW9mIE9iamVjdCxcbiAgICAgICAgb2xkUG9zID0gb2xkSXRlbXMuaW5kZXhPZihpdGVtKSxcbiAgICAgICAgcG9zID0gfm9sZFBvcyAmJiBfbXVzdFJlb3JkZXIgPyBvbGRQb3MgOiBpLFxuICAgICAgICAvLyBkb2VzIGEgdGFnIGV4aXN0IGluIHRoaXMgcG9zaXRpb24/XG4gICAgICAgIHRhZyA9IHRhZ3NbcG9zXVxuXG4gICAgICBpdGVtID0gIWhhc0tleXMgJiYgZXhwci5rZXkgPyBta2l0ZW0oZXhwciwgaXRlbSwgaSkgOiBpdGVtXG5cbiAgICAgIC8vIG5ldyB0YWdcbiAgICAgIGlmIChcbiAgICAgICAgIV9tdXN0UmVvcmRlciAmJiAhdGFnIC8vIHdpdGggbm8tcmVvcmRlciB3ZSBqdXN0IHVwZGF0ZSB0aGUgb2xkIHRhZ3NcbiAgICAgICAgfHxcbiAgICAgICAgX211c3RSZW9yZGVyICYmICF+b2xkUG9zIHx8ICF0YWcgLy8gYnkgZGVmYXVsdCB3ZSBhbHdheXMgdHJ5IHRvIHJlb3JkZXIgdGhlIERPTSBlbGVtZW50c1xuICAgICAgKSB7XG5cbiAgICAgICAgdGFnID0gbmV3IFRhZyhpbXBsLCB7XG4gICAgICAgICAgcGFyZW50OiBwYXJlbnQsXG4gICAgICAgICAgaXNMb29wOiB0cnVlLFxuICAgICAgICAgIGhhc0ltcGw6ICEhX190YWdJbXBsW3RhZ05hbWVdLFxuICAgICAgICAgIHJvb3Q6IHVzZVJvb3QgPyByb290IDogZG9tLmNsb25lTm9kZSgpLFxuICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgfSwgZG9tLmlubmVySFRNTClcblxuICAgICAgICB0YWcubW91bnQoKVxuICAgICAgICBpZiAoaXNWaXJ0dWFsKSB0YWcuX3Jvb3QgPSB0YWcucm9vdC5maXJzdENoaWxkIC8vIHNhdmUgcmVmZXJlbmNlIGZvciBmdXJ0aGVyIG1vdmVzIG9yIGluc2VydHNcbiAgICAgICAgLy8gdGhpcyB0YWcgbXVzdCBiZSBhcHBlbmRlZFxuICAgICAgICBpZiAoaSA9PSB0YWdzLmxlbmd0aCkge1xuICAgICAgICAgIGlmIChpc1ZpcnR1YWwpXG4gICAgICAgICAgICBhZGRWaXJ0dWFsKHRhZywgZnJhZylcbiAgICAgICAgICBlbHNlIGZyYWcuYXBwZW5kQ2hpbGQodGFnLnJvb3QpXG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhpcyB0YWcgbXVzdCBiZSBpbnNlcnRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGlzVmlydHVhbClcbiAgICAgICAgICAgIGFkZFZpcnR1YWwodGFnLCByb290LCB0YWdzW2ldKVxuICAgICAgICAgIGVsc2Ugcm9vdC5pbnNlcnRCZWZvcmUodGFnLnJvb3QsIHRhZ3NbaV0ucm9vdClcbiAgICAgICAgICBvbGRJdGVtcy5zcGxpY2UoaSwgMCwgaXRlbSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRhZ3Muc3BsaWNlKGksIDAsIHRhZylcbiAgICAgICAgcG9zID0gaSAvLyBoYW5kbGVkIGhlcmUgc28gbm8gbW92ZVxuICAgICAgfSBlbHNlIHRhZy51cGRhdGUoaXRlbSlcblxuICAgICAgLy8gcmVvcmRlciB0aGUgdGFnIGlmIGl0J3Mgbm90IGxvY2F0ZWQgaW4gaXRzIHByZXZpb3VzIHBvc2l0aW9uXG4gICAgICBpZiAocG9zICE9PSBpICYmIF9tdXN0UmVvcmRlcikge1xuICAgICAgICAvLyB1cGRhdGUgdGhlIERPTVxuICAgICAgICBpZiAoaXNWaXJ0dWFsKVxuICAgICAgICAgIG1vdmVWaXJ0dWFsKHRhZywgcm9vdCwgdGFnc1tpXSwgZG9tLmNoaWxkTm9kZXMubGVuZ3RoKVxuICAgICAgICBlbHNlIHJvb3QuaW5zZXJ0QmVmb3JlKHRhZy5yb290LCB0YWdzW2ldLnJvb3QpXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcG9zaXRpb24gYXR0cmlidXRlIGlmIGl0IGV4aXN0c1xuICAgICAgICBpZiAoZXhwci5wb3MpXG4gICAgICAgICAgdGFnW2V4cHIucG9zXSA9IGlcbiAgICAgICAgLy8gbW92ZSB0aGUgb2xkIHRhZyBpbnN0YW5jZVxuICAgICAgICB0YWdzLnNwbGljZShpLCAwLCB0YWdzLnNwbGljZShwb3MsIDEpWzBdKVxuICAgICAgICAvLyBtb3ZlIHRoZSBvbGQgaXRlbVxuICAgICAgICBvbGRJdGVtcy5zcGxpY2UoaSwgMCwgb2xkSXRlbXMuc3BsaWNlKHBvcywgMSlbMF0pXG4gICAgICAgIC8vIGlmIHRoZSBsb29wIHRhZ3MgYXJlIG5vdCBjdXN0b21cbiAgICAgICAgLy8gd2UgbmVlZCB0byBtb3ZlIGFsbCB0aGVpciBjdXN0b20gdGFncyBpbnRvIHRoZSByaWdodCBwb3NpdGlvblxuICAgICAgICBpZiAoIWNoaWxkKSBtb3ZlTmVzdGVkVGFncyh0YWcsIGkpXG4gICAgICB9XG5cbiAgICAgIC8vIGNhY2hlIHRoZSBvcmlnaW5hbCBpdGVtIHRvIHVzZSBpdCBpbiB0aGUgZXZlbnRzIGJvdW5kIHRvIHRoaXMgbm9kZVxuICAgICAgLy8gYW5kIGl0cyBjaGlsZHJlblxuICAgICAgdGFnLl9pdGVtID0gaXRlbVxuICAgICAgLy8gY2FjaGUgdGhlIHJlYWwgcGFyZW50IHRhZyBpbnRlcm5hbGx5XG4gICAgICBkZWZpbmVQcm9wZXJ0eSh0YWcsICdfcGFyZW50JywgcGFyZW50KVxuXG4gICAgfSwgdHJ1ZSkgLy8gYWxsb3cgbnVsbCB2YWx1ZXNcblxuICAgIC8vIHJlbW92ZSB0aGUgcmVkdW5kYW50IHRhZ3NcbiAgICB1bm1vdW50UmVkdW5kYW50KGl0ZW1zLCB0YWdzKVxuXG4gICAgLy8gaW5zZXJ0IHRoZSBuZXcgbm9kZXNcbiAgICBpZiAoaXNPcHRpb24pIHJvb3QuYXBwZW5kQ2hpbGQoZnJhZylcbiAgICBlbHNlIHJvb3QuaW5zZXJ0QmVmb3JlKGZyYWcsIHJlZilcblxuICAgIC8vIHNldCB0aGUgJ3RhZ3MnIHByb3BlcnR5IG9mIHRoZSBwYXJlbnQgdGFnXG4gICAgLy8gaWYgY2hpbGQgaXMgJ3VuZGVmaW5lZCcgaXQgbWVhbnMgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIHNldCB0aGlzIHByb3BlcnR5XG4gICAgLy8gZm9yIGV4YW1wbGU6XG4gICAgLy8gd2UgZG9uJ3QgbmVlZCBzdG9yZSB0aGUgYG15VGFnLnRhZ3NbJ2RpdiddYCBwcm9wZXJ0eSBpZiB3ZSBhcmUgbG9vcGluZyBhIGRpdiB0YWdcbiAgICAvLyBidXQgd2UgbmVlZCB0byB0cmFjayB0aGUgYG15VGFnLnRhZ3NbJ2NoaWxkJ11gIHByb3BlcnR5IGxvb3BpbmcgYSBjdXN0b20gY2hpbGQgbm9kZSBuYW1lZCBgY2hpbGRgXG4gICAgaWYgKGNoaWxkKSBwYXJlbnQudGFnc1t0YWdOYW1lXSA9IHRhZ3NcblxuICAgIC8vIGNsb25lIHRoZSBpdGVtcyBhcnJheVxuICAgIG9sZEl0ZW1zID0gaXRlbXMuc2xpY2UoKVxuXG4gIH0pXG5cbn1cbi8qKlxuICogT2JqZWN0IHRoYXQgd2lsbCBiZSB1c2VkIHRvIGluamVjdCBhbmQgbWFuYWdlIHRoZSBjc3Mgb2YgZXZlcnkgdGFnIGluc3RhbmNlXG4gKi9cbnZhciBzdHlsZU1hbmFnZXIgPSAoZnVuY3Rpb24oX3Jpb3QpIHtcblxuICBpZiAoIXdpbmRvdykgcmV0dXJuIHsgLy8gc2tpcCBpbmplY3Rpb24gb24gdGhlIHNlcnZlclxuICAgIGFkZDogZnVuY3Rpb24gKCkge30sXG4gICAgaW5qZWN0OiBmdW5jdGlvbiAoKSB7fVxuICB9XG5cbiAgdmFyIHN0eWxlTm9kZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgLy8gY3JlYXRlIGEgbmV3IHN0eWxlIGVsZW1lbnQgd2l0aCB0aGUgY29ycmVjdCB0eXBlXG4gICAgdmFyIG5ld05vZGUgPSBta0VsKCdzdHlsZScpXG4gICAgc2V0QXR0cihuZXdOb2RlLCAndHlwZScsICd0ZXh0L2NzcycpXG5cbiAgICAvLyByZXBsYWNlIGFueSB1c2VyIG5vZGUgb3IgaW5zZXJ0IHRoZSBuZXcgb25lIGludG8gdGhlIGhlYWRcbiAgICB2YXIgdXNlck5vZGUgPSAkKCdzdHlsZVt0eXBlPXJpb3RdJylcbiAgICBpZiAodXNlck5vZGUpIHtcbiAgICAgIGlmICh1c2VyTm9kZS5pZCkgbmV3Tm9kZS5pZCA9IHVzZXJOb2RlLmlkXG4gICAgICB1c2VyTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuZXdOb2RlLCB1c2VyTm9kZSlcbiAgICB9XG4gICAgZWxzZSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKG5ld05vZGUpXG5cbiAgICByZXR1cm4gbmV3Tm9kZVxuICB9KSgpXG5cbiAgLy8gQ3JlYXRlIGNhY2hlIGFuZCBzaG9ydGN1dCB0byB0aGUgY29ycmVjdCBwcm9wZXJ0eVxuICB2YXIgY3NzVGV4dFByb3AgPSBzdHlsZU5vZGUuc3R5bGVTaGVldCxcbiAgICBzdHlsZXNUb0luamVjdCA9ICcnXG5cbiAgLy8gRXhwb3NlIHRoZSBzdHlsZSBub2RlIGluIGEgbm9uLW1vZGlmaWNhYmxlIHByb3BlcnR5XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfcmlvdCwgJ3N0eWxlTm9kZScsIHtcbiAgICB2YWx1ZTogc3R5bGVOb2RlLFxuICAgIHdyaXRhYmxlOiB0cnVlXG4gIH0pXG5cbiAgLyoqXG4gICAqIFB1YmxpYyBhcGlcbiAgICovXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogU2F2ZSBhIHRhZyBzdHlsZSB0byBiZSBsYXRlciBpbmplY3RlZCBpbnRvIERPTVxuICAgICAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gY3NzIFtkZXNjcmlwdGlvbl1cbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uKGNzcykge1xuICAgICAgc3R5bGVzVG9JbmplY3QgKz0gY3NzXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBJbmplY3QgYWxsIHByZXZpb3VzbHkgc2F2ZWQgdGFnIHN0eWxlcyBpbnRvIERPTVxuICAgICAqIGlubmVySFRNTCBzZWVtcyBzbG93OiBodHRwOi8vanNwZXJmLmNvbS9yaW90LWluc2VydC1zdHlsZVxuICAgICAqL1xuICAgIGluamVjdDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc3R5bGVzVG9JbmplY3QpIHtcbiAgICAgICAgaWYgKGNzc1RleHRQcm9wKSBjc3NUZXh0UHJvcC5jc3NUZXh0ICs9IHN0eWxlc1RvSW5qZWN0XG4gICAgICAgIGVsc2Ugc3R5bGVOb2RlLmlubmVySFRNTCArPSBzdHlsZXNUb0luamVjdFxuICAgICAgICBzdHlsZXNUb0luamVjdCA9ICcnXG4gICAgICB9XG4gICAgfVxuICB9XG5cbn0pKHJpb3QpXG5cblxuZnVuY3Rpb24gcGFyc2VOYW1lZEVsZW1lbnRzKHJvb3QsIHRhZywgY2hpbGRUYWdzLCBmb3JjZVBhcnNpbmdOYW1lZCkge1xuXG4gIHdhbGsocm9vdCwgZnVuY3Rpb24oZG9tKSB7XG4gICAgaWYgKGRvbS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICBkb20uaXNMb29wID0gZG9tLmlzTG9vcCB8fFxuICAgICAgICAgICAgICAgICAgKGRvbS5wYXJlbnROb2RlICYmIGRvbS5wYXJlbnROb2RlLmlzTG9vcCB8fCBnZXRBdHRyKGRvbSwgJ2VhY2gnKSlcbiAgICAgICAgICAgICAgICAgICAgPyAxIDogMFxuXG4gICAgICAvLyBjdXN0b20gY2hpbGQgdGFnXG4gICAgICBpZiAoY2hpbGRUYWdzKSB7XG4gICAgICAgIHZhciBjaGlsZCA9IGdldFRhZyhkb20pXG5cbiAgICAgICAgaWYgKGNoaWxkICYmICFkb20uaXNMb29wKVxuICAgICAgICAgIGNoaWxkVGFncy5wdXNoKGluaXRDaGlsZFRhZyhjaGlsZCwge3Jvb3Q6IGRvbSwgcGFyZW50OiB0YWd9LCBkb20uaW5uZXJIVE1MLCB0YWcpKVxuICAgICAgfVxuXG4gICAgICBpZiAoIWRvbS5pc0xvb3AgfHwgZm9yY2VQYXJzaW5nTmFtZWQpXG4gICAgICAgIHNldE5hbWVkKGRvbSwgdGFnLCBbXSlcbiAgICB9XG5cbiAgfSlcblxufVxuXG5mdW5jdGlvbiBwYXJzZUV4cHJlc3Npb25zKHJvb3QsIHRhZywgZXhwcmVzc2lvbnMpIHtcblxuICBmdW5jdGlvbiBhZGRFeHByKGRvbSwgdmFsLCBleHRyYSkge1xuICAgIGlmICh0bXBsLmhhc0V4cHIodmFsKSkge1xuICAgICAgZXhwcmVzc2lvbnMucHVzaChleHRlbmQoeyBkb206IGRvbSwgZXhwcjogdmFsIH0sIGV4dHJhKSlcbiAgICB9XG4gIH1cblxuICB3YWxrKHJvb3QsIGZ1bmN0aW9uKGRvbSkge1xuICAgIHZhciB0eXBlID0gZG9tLm5vZGVUeXBlLFxuICAgICAgYXR0clxuXG4gICAgLy8gdGV4dCBub2RlXG4gICAgaWYgKHR5cGUgPT0gMyAmJiBkb20ucGFyZW50Tm9kZS50YWdOYW1lICE9ICdTVFlMRScpIGFkZEV4cHIoZG9tLCBkb20ubm9kZVZhbHVlKVxuICAgIGlmICh0eXBlICE9IDEpIHJldHVyblxuXG4gICAgLyogZWxlbWVudCAqL1xuXG4gICAgLy8gbG9vcFxuICAgIGF0dHIgPSBnZXRBdHRyKGRvbSwgJ2VhY2gnKVxuXG4gICAgaWYgKGF0dHIpIHsgX2VhY2goZG9tLCB0YWcsIGF0dHIpOyByZXR1cm4gZmFsc2UgfVxuXG4gICAgLy8gYXR0cmlidXRlIGV4cHJlc3Npb25zXG4gICAgZWFjaChkb20uYXR0cmlidXRlcywgZnVuY3Rpb24oYXR0cikge1xuICAgICAgdmFyIG5hbWUgPSBhdHRyLm5hbWUsXG4gICAgICAgIGJvb2wgPSBuYW1lLnNwbGl0KCdfXycpWzFdXG5cbiAgICAgIGFkZEV4cHIoZG9tLCBhdHRyLnZhbHVlLCB7IGF0dHI6IGJvb2wgfHwgbmFtZSwgYm9vbDogYm9vbCB9KVxuICAgICAgaWYgKGJvb2wpIHsgcmVtQXR0cihkb20sIG5hbWUpOyByZXR1cm4gZmFsc2UgfVxuXG4gICAgfSlcblxuICAgIC8vIHNraXAgY3VzdG9tIHRhZ3NcbiAgICBpZiAoZ2V0VGFnKGRvbSkpIHJldHVybiBmYWxzZVxuXG4gIH0pXG5cbn1cbmZ1bmN0aW9uIFRhZyhpbXBsLCBjb25mLCBpbm5lckhUTUwpIHtcblxuICB2YXIgc2VsZiA9IHJpb3Qub2JzZXJ2YWJsZSh0aGlzKSxcbiAgICBvcHRzID0gaW5oZXJpdChjb25mLm9wdHMpIHx8IHt9LFxuICAgIHBhcmVudCA9IGNvbmYucGFyZW50LFxuICAgIGlzTG9vcCA9IGNvbmYuaXNMb29wLFxuICAgIGhhc0ltcGwgPSBjb25mLmhhc0ltcGwsXG4gICAgaXRlbSA9IGNsZWFuVXBEYXRhKGNvbmYuaXRlbSksXG4gICAgZXhwcmVzc2lvbnMgPSBbXSxcbiAgICBjaGlsZFRhZ3MgPSBbXSxcbiAgICByb290ID0gY29uZi5yb290LFxuICAgIGZuID0gaW1wbC5mbixcbiAgICB0YWdOYW1lID0gcm9vdC50YWdOYW1lLnRvTG93ZXJDYXNlKCksXG4gICAgYXR0ciA9IHt9LFxuICAgIHByb3BzSW5TeW5jV2l0aFBhcmVudCA9IFtdLFxuICAgIGRvbVxuXG4gIGlmIChmbiAmJiByb290Ll90YWcpIHJvb3QuX3RhZy51bm1vdW50KHRydWUpXG5cbiAgLy8gbm90IHlldCBtb3VudGVkXG4gIHRoaXMuaXNNb3VudGVkID0gZmFsc2VcbiAgcm9vdC5pc0xvb3AgPSBpc0xvb3BcblxuICAvLyBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSB0YWcganVzdCBjcmVhdGVkXG4gIC8vIHNvIHdlIHdpbGwgYmUgYWJsZSB0byBtb3VudCB0aGlzIHRhZyBtdWx0aXBsZSB0aW1lc1xuICByb290Ll90YWcgPSB0aGlzXG5cbiAgLy8gY3JlYXRlIGEgdW5pcXVlIGlkIHRvIHRoaXMgdGFnXG4gIC8vIGl0IGNvdWxkIGJlIGhhbmR5IHRvIHVzZSBpdCBhbHNvIHRvIGltcHJvdmUgdGhlIHZpcnR1YWwgZG9tIHJlbmRlcmluZyBzcGVlZFxuICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX3Jpb3RfaWQnLCArK19fdWlkKSAvLyBiYXNlIDEgYWxsb3dzIHRlc3QgIXQuX3Jpb3RfaWRcblxuICBleHRlbmQodGhpcywgeyBwYXJlbnQ6IHBhcmVudCwgcm9vdDogcm9vdCwgb3B0czogb3B0cywgdGFnczoge30gfSwgaXRlbSlcblxuICAvLyBncmFiIGF0dHJpYnV0ZXNcbiAgZWFjaChyb290LmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgdmFyIHZhbCA9IGVsLnZhbHVlXG4gICAgLy8gcmVtZW1iZXIgYXR0cmlidXRlcyB3aXRoIGV4cHJlc3Npb25zIG9ubHlcbiAgICBpZiAodG1wbC5oYXNFeHByKHZhbCkpIGF0dHJbZWwubmFtZV0gPSB2YWxcbiAgfSlcblxuICBkb20gPSBta2RvbShpbXBsLnRtcGwsIGlubmVySFRNTClcblxuICAvLyBvcHRpb25zXG4gIGZ1bmN0aW9uIHVwZGF0ZU9wdHMoKSB7XG4gICAgdmFyIGN0eCA9IGhhc0ltcGwgJiYgaXNMb29wID8gc2VsZiA6IHBhcmVudCB8fCBzZWxmXG5cbiAgICAvLyB1cGRhdGUgb3B0cyBmcm9tIGN1cnJlbnQgRE9NIGF0dHJpYnV0ZXNcbiAgICBlYWNoKHJvb3QuYXR0cmlidXRlcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciB2YWwgPSBlbC52YWx1ZVxuICAgICAgb3B0c1t0b0NhbWVsKGVsLm5hbWUpXSA9IHRtcGwuaGFzRXhwcih2YWwpID8gdG1wbCh2YWwsIGN0eCkgOiB2YWxcbiAgICB9KVxuICAgIC8vIHJlY292ZXIgdGhvc2Ugd2l0aCBleHByZXNzaW9uc1xuICAgIGVhY2goT2JqZWN0LmtleXMoYXR0ciksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIG9wdHNbdG9DYW1lbChuYW1lKV0gPSB0bXBsKGF0dHJbbmFtZV0sIGN0eClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplRGF0YShkYXRhKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGl0ZW0pIHtcbiAgICAgIGlmICh0eXBlb2Ygc2VsZltrZXldICE9PSBUX1VOREVGICYmIGlzV3JpdGFibGUoc2VsZiwga2V5KSlcbiAgICAgICAgc2VsZltrZXldID0gZGF0YVtrZXldXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5oZXJpdEZyb21QYXJlbnQgKCkge1xuICAgIGlmICghc2VsZi5wYXJlbnQgfHwgIWlzTG9vcCkgcmV0dXJuXG4gICAgZWFjaChPYmplY3Qua2V5cyhzZWxmLnBhcmVudCksIGZ1bmN0aW9uKGspIHtcbiAgICAgIC8vIHNvbWUgcHJvcGVydGllcyBtdXN0IGJlIGFsd2F5cyBpbiBzeW5jIHdpdGggdGhlIHBhcmVudCB0YWdcbiAgICAgIHZhciBtdXN0U3luYyA9ICFjb250YWlucyhSRVNFUlZFRF9XT1JEU19CTEFDS0xJU1QsIGspICYmIGNvbnRhaW5zKHByb3BzSW5TeW5jV2l0aFBhcmVudCwgaylcbiAgICAgIGlmICh0eXBlb2Ygc2VsZltrXSA9PT0gVF9VTkRFRiB8fCBtdXN0U3luYykge1xuICAgICAgICAvLyB0cmFjayB0aGUgcHJvcGVydHkgdG8ga2VlcCBpbiBzeW5jXG4gICAgICAgIC8vIHNvIHdlIGNhbiBrZWVwIGl0IHVwZGF0ZWRcbiAgICAgICAgaWYgKCFtdXN0U3luYykgcHJvcHNJblN5bmNXaXRoUGFyZW50LnB1c2goaylcbiAgICAgICAgc2VsZltrXSA9IHNlbGYucGFyZW50W2tdXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGRlZmluZVByb3BlcnR5KHRoaXMsICd1cGRhdGUnLCBmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhlIGRhdGEgcGFzc2VkIHdpbGwgbm90IG92ZXJyaWRlXG4gICAgLy8gdGhlIGNvbXBvbmVudCBjb3JlIG1ldGhvZHNcbiAgICBkYXRhID0gY2xlYW5VcERhdGEoZGF0YSlcbiAgICAvLyBpbmhlcml0IHByb3BlcnRpZXMgZnJvbSB0aGUgcGFyZW50XG4gICAgaW5oZXJpdEZyb21QYXJlbnQoKVxuICAgIC8vIG5vcm1hbGl6ZSB0aGUgdGFnIHByb3BlcnRpZXMgaW4gY2FzZSBhbiBpdGVtIG9iamVjdCB3YXMgaW5pdGlhbGx5IHBhc3NlZFxuICAgIGlmIChkYXRhICYmIHR5cGVvZiBpdGVtID09PSBUX09CSkVDVCkge1xuICAgICAgbm9ybWFsaXplRGF0YShkYXRhKVxuICAgICAgaXRlbSA9IGRhdGFcbiAgICB9XG4gICAgZXh0ZW5kKHNlbGYsIGRhdGEpXG4gICAgdXBkYXRlT3B0cygpXG4gICAgc2VsZi50cmlnZ2VyKCd1cGRhdGUnLCBkYXRhKVxuICAgIHVwZGF0ZShleHByZXNzaW9ucywgc2VsZilcbiAgICAvLyB0aGUgdXBkYXRlZCBldmVudCB3aWxsIGJlIHRyaWdnZXJlZFxuICAgIC8vIG9uY2UgdGhlIERPTSB3aWxsIGJlIHJlYWR5IGFuZCBhbGwgdGhlIHJlZmxvd3MgYXJlIGNvbXBsZXRlZFxuICAgIC8vIHRoaXMgaXMgdXNlZnVsIGlmIHlvdSB3YW50IHRvIGdldCB0aGUgXCJyZWFsXCIgcm9vdCBwcm9wZXJ0aWVzXG4gICAgLy8gNCBleDogcm9vdC5vZmZzZXRXaWR0aCAuLi5cbiAgICByQUYoZnVuY3Rpb24oKSB7IHNlbGYudHJpZ2dlcigndXBkYXRlZCcpIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSlcblxuICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbWl4aW4nLCBmdW5jdGlvbigpIHtcbiAgICBlYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24obWl4KSB7XG4gICAgICB2YXIgaW5zdGFuY2VcblxuICAgICAgbWl4ID0gdHlwZW9mIG1peCA9PT0gVF9TVFJJTkcgPyByaW90Lm1peGluKG1peCkgOiBtaXhcblxuICAgICAgLy8gY2hlY2sgaWYgdGhlIG1peGluIGlzIGEgZnVuY3Rpb25cbiAgICAgIGlmIChpc0Z1bmN0aW9uKG1peCkpIHtcbiAgICAgICAgLy8gY3JlYXRlIHRoZSBuZXcgbWl4aW4gaW5zdGFuY2VcbiAgICAgICAgaW5zdGFuY2UgPSBuZXcgbWl4KClcbiAgICAgICAgLy8gc2F2ZSB0aGUgcHJvdG90eXBlIHRvIGxvb3AgaXQgYWZ0ZXJ3YXJkc1xuICAgICAgICBtaXggPSBtaXgucHJvdG90eXBlXG4gICAgICB9IGVsc2UgaW5zdGFuY2UgPSBtaXhcblxuICAgICAgLy8gbG9vcCB0aGUga2V5cyBpbiB0aGUgZnVuY3Rpb24gcHJvdG90eXBlIG9yIHRoZSBhbGwgb2JqZWN0IGtleXNcbiAgICAgIGVhY2goT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobWl4KSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIC8vIGJpbmQgbWV0aG9kcyB0byBzZWxmXG4gICAgICAgIGlmIChrZXkgIT0gJ2luaXQnKVxuICAgICAgICAgIHNlbGZba2V5XSA9IGlzRnVuY3Rpb24oaW5zdGFuY2Vba2V5XSkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vba2V5XS5iaW5kKHNlbGYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW2tleV1cbiAgICAgIH0pXG5cbiAgICAgIC8vIGluaXQgbWV0aG9kIHdpbGwgYmUgY2FsbGVkIGF1dG9tYXRpY2FsbHlcbiAgICAgIGlmIChpbnN0YW5jZS5pbml0KSBpbnN0YW5jZS5pbml0LmJpbmQoc2VsZikoKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfSlcblxuICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbW91bnQnLCBmdW5jdGlvbigpIHtcblxuICAgIHVwZGF0ZU9wdHMoKVxuXG4gICAgLy8gaW5pdGlhbGlhdGlvblxuICAgIGlmIChmbikgZm4uY2FsbChzZWxmLCBvcHRzKVxuXG4gICAgLy8gcGFyc2UgbGF5b3V0IGFmdGVyIGluaXQuIGZuIG1heSBjYWxjdWxhdGUgYXJncyBmb3IgbmVzdGVkIGN1c3RvbSB0YWdzXG4gICAgcGFyc2VFeHByZXNzaW9ucyhkb20sIHNlbGYsIGV4cHJlc3Npb25zKVxuXG4gICAgLy8gbW91bnQgdGhlIGNoaWxkIHRhZ3NcbiAgICB0b2dnbGUodHJ1ZSlcblxuICAgIC8vIHVwZGF0ZSB0aGUgcm9vdCBhZGRpbmcgY3VzdG9tIGF0dHJpYnV0ZXMgY29taW5nIGZyb20gdGhlIGNvbXBpbGVyXG4gICAgLy8gaXQgZml4ZXMgYWxzbyAjMTA4N1xuICAgIGlmIChpbXBsLmF0dHJzIHx8IGhhc0ltcGwpIHtcbiAgICAgIHdhbGtBdHRyaWJ1dGVzKGltcGwuYXR0cnMsIGZ1bmN0aW9uIChrLCB2KSB7IHNldEF0dHIocm9vdCwgaywgdikgfSlcbiAgICAgIHBhcnNlRXhwcmVzc2lvbnMoc2VsZi5yb290LCBzZWxmLCBleHByZXNzaW9ucylcbiAgICB9XG5cbiAgICBpZiAoIXNlbGYucGFyZW50IHx8IGlzTG9vcCkgc2VsZi51cGRhdGUoaXRlbSlcblxuICAgIC8vIGludGVybmFsIHVzZSBvbmx5LCBmaXhlcyAjNDAzXG4gICAgc2VsZi50cmlnZ2VyKCdiZWZvcmUtbW91bnQnKVxuXG4gICAgaWYgKGlzTG9vcCAmJiAhaGFzSW1wbCkge1xuICAgICAgLy8gdXBkYXRlIHRoZSByb290IGF0dHJpYnV0ZSBmb3IgdGhlIGxvb3BlZCBlbGVtZW50c1xuICAgICAgc2VsZi5yb290ID0gcm9vdCA9IGRvbS5maXJzdENoaWxkXG5cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSByb290LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKVxuICAgICAgaWYgKHJvb3Quc3R1Yikgc2VsZi5yb290ID0gcm9vdCA9IHBhcmVudC5yb290XG4gICAgfVxuXG4gICAgLy8gcGFyc2UgdGhlIG5hbWVkIGRvbSBub2RlcyBpbiB0aGUgbG9vcGVkIGNoaWxkXG4gICAgLy8gYWRkaW5nIHRoZW0gdG8gdGhlIHBhcmVudCBhcyB3ZWxsXG4gICAgaWYgKGlzTG9vcClcbiAgICAgIHBhcnNlTmFtZWRFbGVtZW50cyhzZWxmLnJvb3QsIHNlbGYucGFyZW50LCBudWxsLCB0cnVlKVxuXG4gICAgLy8gaWYgaXQncyBub3QgYSBjaGlsZCB0YWcgd2UgY2FuIHRyaWdnZXIgaXRzIG1vdW50IGV2ZW50XG4gICAgaWYgKCFzZWxmLnBhcmVudCB8fCBzZWxmLnBhcmVudC5pc01vdW50ZWQpIHtcbiAgICAgIHNlbGYuaXNNb3VudGVkID0gdHJ1ZVxuICAgICAgc2VsZi50cmlnZ2VyKCdtb3VudCcpXG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSB3ZSBuZWVkIHRvIHdhaXQgdGhhdCB0aGUgcGFyZW50IGV2ZW50IGdldHMgdHJpZ2dlcmVkXG4gICAgZWxzZSBzZWxmLnBhcmVudC5vbmUoJ21vdW50JywgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCB0byB0cmlnZ2VyIHRoZSBgbW91bnRgIGV2ZW50IGZvciB0aGUgdGFnc1xuICAgICAgLy8gbm90IHZpc2libGUgaW5jbHVkZWQgaW4gYW4gaWYgc3RhdGVtZW50XG4gICAgICBpZiAoIWlzSW5TdHViKHNlbGYucm9vdCkpIHtcbiAgICAgICAgc2VsZi5wYXJlbnQuaXNNb3VudGVkID0gc2VsZi5pc01vdW50ZWQgPSB0cnVlXG4gICAgICAgIHNlbGYudHJpZ2dlcignbW91bnQnKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cblxuICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAndW5tb3VudCcsIGZ1bmN0aW9uKGtlZXBSb290VGFnKSB7XG4gICAgdmFyIGVsID0gcm9vdCxcbiAgICAgIHAgPSBlbC5wYXJlbnROb2RlLFxuICAgICAgcHRhZ1xuXG4gICAgc2VsZi50cmlnZ2VyKCdiZWZvcmUtdW5tb3VudCcpXG5cbiAgICAvLyByZW1vdmUgdGhpcyB0YWcgaW5zdGFuY2UgZnJvbSB0aGUgZ2xvYmFsIHZpcnR1YWxEb20gdmFyaWFibGVcbiAgICBfX3ZpcnR1YWxEb20uc3BsaWNlKF9fdmlydHVhbERvbS5pbmRleE9mKHNlbGYpLCAxKVxuXG4gICAgaWYgKHRoaXMuX3ZpcnRzKSB7XG4gICAgICBlYWNoKHRoaXMuX3ZpcnRzLCBmdW5jdGlvbih2KSB7XG4gICAgICAgIHYucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh2KVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAocCkge1xuXG4gICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgIHB0YWcgPSBnZXRJbW1lZGlhdGVDdXN0b21QYXJlbnRUYWcocGFyZW50KVxuICAgICAgICAvLyByZW1vdmUgdGhpcyB0YWcgZnJvbSB0aGUgcGFyZW50IHRhZ3Mgb2JqZWN0XG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBuZXN0ZWQgdGFncyB3aXRoIHNhbWUgbmFtZS4uXG4gICAgICAgIC8vIHJlbW92ZSB0aGlzIGVsZW1lbnQgZm9ybSB0aGUgYXJyYXlcbiAgICAgICAgaWYgKGlzQXJyYXkocHRhZy50YWdzW3RhZ05hbWVdKSlcbiAgICAgICAgICBlYWNoKHB0YWcudGFnc1t0YWdOYW1lXSwgZnVuY3Rpb24odGFnLCBpKSB7XG4gICAgICAgICAgICBpZiAodGFnLl9yaW90X2lkID09IHNlbGYuX3Jpb3RfaWQpXG4gICAgICAgICAgICAgIHB0YWcudGFnc1t0YWdOYW1lXS5zcGxpY2UoaSwgMSlcbiAgICAgICAgICB9KVxuICAgICAgICBlbHNlXG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIGp1c3QgZGVsZXRlIHRoZSB0YWcgaW5zdGFuY2VcbiAgICAgICAgICBwdGFnLnRhZ3NbdGFnTmFtZV0gPSB1bmRlZmluZWRcbiAgICAgIH1cblxuICAgICAgZWxzZVxuICAgICAgICB3aGlsZSAoZWwuZmlyc3RDaGlsZCkgZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZClcblxuICAgICAgaWYgKCFrZWVwUm9vdFRhZylcbiAgICAgICAgcC5yZW1vdmVDaGlsZChlbClcbiAgICAgIGVsc2VcbiAgICAgICAgLy8gdGhlIHJpb3QtdGFnIGF0dHJpYnV0ZSBpc24ndCBuZWVkZWQgYW55bW9yZSwgcmVtb3ZlIGl0XG4gICAgICAgIHJlbUF0dHIocCwgJ3Jpb3QtdGFnJylcbiAgICB9XG5cblxuICAgIHNlbGYudHJpZ2dlcigndW5tb3VudCcpXG4gICAgdG9nZ2xlKClcbiAgICBzZWxmLm9mZignKicpXG4gICAgc2VsZi5pc01vdW50ZWQgPSBmYWxzZVxuICAgIGRlbGV0ZSByb290Ll90YWdcblxuICB9KVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZShpc01vdW50KSB7XG5cbiAgICAvLyBtb3VudC91bm1vdW50IGNoaWxkcmVuXG4gICAgZWFjaChjaGlsZFRhZ3MsIGZ1bmN0aW9uKGNoaWxkKSB7IGNoaWxkW2lzTW91bnQgPyAnbW91bnQnIDogJ3VubW91bnQnXSgpIH0pXG5cbiAgICAvLyBsaXN0ZW4vdW5saXN0ZW4gcGFyZW50IChldmVudHMgZmxvdyBvbmUgd2F5IGZyb20gcGFyZW50IHRvIGNoaWxkcmVuKVxuICAgIGlmICghcGFyZW50KSByZXR1cm5cbiAgICB2YXIgZXZ0ID0gaXNNb3VudCA/ICdvbicgOiAnb2ZmJ1xuXG4gICAgLy8gdGhlIGxvb3AgdGFncyB3aWxsIGJlIGFsd2F5cyBpbiBzeW5jIHdpdGggdGhlIHBhcmVudCBhdXRvbWF0aWNhbGx5XG4gICAgaWYgKGlzTG9vcClcbiAgICAgIHBhcmVudFtldnRdKCd1bm1vdW50Jywgc2VsZi51bm1vdW50KVxuICAgIGVsc2VcbiAgICAgIHBhcmVudFtldnRdKCd1cGRhdGUnLCBzZWxmLnVwZGF0ZSlbZXZ0XSgndW5tb3VudCcsIHNlbGYudW5tb3VudClcbiAgfVxuXG4gIC8vIG5hbWVkIGVsZW1lbnRzIGF2YWlsYWJsZSBmb3IgZm5cbiAgcGFyc2VOYW1lZEVsZW1lbnRzKGRvbSwgdGhpcywgY2hpbGRUYWdzKVxuXG59XG4vKipcbiAqIEF0dGFjaCBhbiBldmVudCB0byBhIERPTSBub2RlXG4gKiBAcGFyYW0geyBTdHJpbmcgfSBuYW1lIC0gZXZlbnQgbmFtZVxuICogQHBhcmFtIHsgRnVuY3Rpb24gfSBoYW5kbGVyIC0gZXZlbnQgY2FsbGJhY2tcbiAqIEBwYXJhbSB7IE9iamVjdCB9IGRvbSAtIGRvbSBub2RlXG4gKiBAcGFyYW0geyBUYWcgfSB0YWcgLSB0YWcgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc2V0RXZlbnRIYW5kbGVyKG5hbWUsIGhhbmRsZXIsIGRvbSwgdGFnKSB7XG5cbiAgZG9tW25hbWVdID0gZnVuY3Rpb24oZSkge1xuXG4gICAgdmFyIHB0YWcgPSB0YWcuX3BhcmVudCxcbiAgICAgIGl0ZW0gPSB0YWcuX2l0ZW0sXG4gICAgICBlbFxuXG4gICAgaWYgKCFpdGVtKVxuICAgICAgd2hpbGUgKHB0YWcgJiYgIWl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IHB0YWcuX2l0ZW1cbiAgICAgICAgcHRhZyA9IHB0YWcuX3BhcmVudFxuICAgICAgfVxuXG4gICAgLy8gY3Jvc3MgYnJvd3NlciBldmVudCBmaXhcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnRcblxuICAgIC8vIG92ZXJyaWRlIHRoZSBldmVudCBwcm9wZXJ0aWVzXG4gICAgaWYgKGlzV3JpdGFibGUoZSwgJ2N1cnJlbnRUYXJnZXQnKSkgZS5jdXJyZW50VGFyZ2V0ID0gZG9tXG4gICAgaWYgKGlzV3JpdGFibGUoZSwgJ3RhcmdldCcpKSBlLnRhcmdldCA9IGUuc3JjRWxlbWVudFxuICAgIGlmIChpc1dyaXRhYmxlKGUsICd3aGljaCcpKSBlLndoaWNoID0gZS5jaGFyQ29kZSB8fCBlLmtleUNvZGVcblxuICAgIGUuaXRlbSA9IGl0ZW1cblxuICAgIC8vIHByZXZlbnQgZGVmYXVsdCBiZWhhdmlvdXIgKGJ5IGRlZmF1bHQpXG4gICAgaWYgKGhhbmRsZXIuY2FsbCh0YWcsIGUpICE9PSB0cnVlICYmICEvcmFkaW98Y2hlY2svLnRlc3QoZG9tLnR5cGUpKSB7XG4gICAgICBpZiAoZS5wcmV2ZW50RGVmYXVsdCkgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnJldHVyblZhbHVlID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIWUucHJldmVudFVwZGF0ZSkge1xuICAgICAgZWwgPSBpdGVtID8gZ2V0SW1tZWRpYXRlQ3VzdG9tUGFyZW50VGFnKHB0YWcpIDogdGFnXG4gICAgICBlbC51cGRhdGUoKVxuICAgIH1cblxuICB9XG5cbn1cblxuXG4vKipcbiAqIEluc2VydCBhIERPTSBub2RlIHJlcGxhY2luZyBhbm90aGVyIG9uZSAodXNlZCBieSBpZi0gYXR0cmlidXRlKVxuICogQHBhcmFtICAgeyBPYmplY3QgfSByb290IC0gcGFyZW50IG5vZGVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gbm9kZSAtIG5vZGUgcmVwbGFjZWRcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gYmVmb3JlIC0gbm9kZSBhZGRlZFxuICovXG5mdW5jdGlvbiBpbnNlcnRUbyhyb290LCBub2RlLCBiZWZvcmUpIHtcbiAgaWYgKCFyb290KSByZXR1cm5cbiAgcm9vdC5pbnNlcnRCZWZvcmUoYmVmb3JlLCBub2RlKVxuICByb290LnJlbW92ZUNoaWxkKG5vZGUpXG59XG5cbi8qKlxuICogVXBkYXRlIHRoZSBleHByZXNzaW9ucyBpbiBhIFRhZyBpbnN0YW5jZVxuICogQHBhcmFtICAgeyBBcnJheSB9IGV4cHJlc3Npb25zIC0gZXhwcmVzc2lvbiB0aGF0IG11c3QgYmUgcmUgZXZhbHVhdGVkXG4gKiBAcGFyYW0gICB7IFRhZyB9IHRhZyAtIHRhZyBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiB1cGRhdGUoZXhwcmVzc2lvbnMsIHRhZykge1xuXG4gIGVhY2goZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKGV4cHIsIGkpIHtcblxuICAgIHZhciBkb20gPSBleHByLmRvbSxcbiAgICAgIGF0dHJOYW1lID0gZXhwci5hdHRyLFxuICAgICAgdmFsdWUgPSB0bXBsKGV4cHIuZXhwciwgdGFnKSxcbiAgICAgIHBhcmVudCA9IGV4cHIuZG9tLnBhcmVudE5vZGVcblxuICAgIGlmIChleHByLmJvb2wpXG4gICAgICB2YWx1ZSA9IHZhbHVlID8gYXR0ck5hbWUgOiBmYWxzZVxuICAgIGVsc2UgaWYgKHZhbHVlID09IG51bGwpXG4gICAgICB2YWx1ZSA9ICcnXG5cbiAgICAvLyBsZWF2ZSBvdXQgcmlvdC0gcHJlZml4ZXMgZnJvbSBzdHJpbmdzIGluc2lkZSB0ZXh0YXJlYVxuICAgIC8vIGZpeCAjODE1OiBhbnkgdmFsdWUgLT4gc3RyaW5nXG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQudGFnTmFtZSA9PSAnVEVYVEFSRUEnKSB7XG4gICAgICB2YWx1ZSA9ICgnJyArIHZhbHVlKS5yZXBsYWNlKC9yaW90LS9nLCAnJylcbiAgICAgIC8vIGNoYW5nZSB0ZXh0YXJlYSdzIHZhbHVlXG4gICAgICBwYXJlbnQudmFsdWUgPSB2YWx1ZVxuICAgIH1cblxuICAgIC8vIG5vIGNoYW5nZVxuICAgIGlmIChleHByLnZhbHVlID09PSB2YWx1ZSkgcmV0dXJuXG4gICAgZXhwci52YWx1ZSA9IHZhbHVlXG5cbiAgICAvLyB0ZXh0IG5vZGVcbiAgICBpZiAoIWF0dHJOYW1lKSB7XG4gICAgICBkb20ubm9kZVZhbHVlID0gJycgKyB2YWx1ZSAgICAvLyAjODE1IHJlbGF0ZWRcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBvcmlnaW5hbCBhdHRyaWJ1dGVcbiAgICByZW1BdHRyKGRvbSwgYXR0ck5hbWUpXG4gICAgLy8gZXZlbnQgaGFuZGxlclxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgc2V0RXZlbnRIYW5kbGVyKGF0dHJOYW1lLCB2YWx1ZSwgZG9tLCB0YWcpXG5cbiAgICAvLyBpZi0gY29uZGl0aW9uYWxcbiAgICB9IGVsc2UgaWYgKGF0dHJOYW1lID09ICdpZicpIHtcbiAgICAgIHZhciBzdHViID0gZXhwci5zdHViLFxuICAgICAgICBhZGQgPSBmdW5jdGlvbigpIHsgaW5zZXJ0VG8oc3R1Yi5wYXJlbnROb2RlLCBzdHViLCBkb20pIH0sXG4gICAgICAgIHJlbW92ZSA9IGZ1bmN0aW9uKCkgeyBpbnNlcnRUbyhkb20ucGFyZW50Tm9kZSwgZG9tLCBzdHViKSB9XG5cbiAgICAgIC8vIGFkZCB0byBET01cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBpZiAoc3R1Yikge1xuICAgICAgICAgIGFkZCgpXG4gICAgICAgICAgZG9tLmluU3R1YiA9IGZhbHNlXG4gICAgICAgICAgLy8gYXZvaWQgdG8gdHJpZ2dlciB0aGUgbW91bnQgZXZlbnQgaWYgdGhlIHRhZ3MgaXMgbm90IHZpc2libGUgeWV0XG4gICAgICAgICAgLy8gbWF5YmUgd2UgY2FuIG9wdGltaXplIHRoaXMgYXZvaWRpbmcgdG8gbW91bnQgdGhlIHRhZyBhdCBhbGxcbiAgICAgICAgICBpZiAoIWlzSW5TdHViKGRvbSkpIHtcbiAgICAgICAgICAgIHdhbGsoZG9tLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICBpZiAoZWwuX3RhZyAmJiAhZWwuX3RhZy5pc01vdW50ZWQpXG4gICAgICAgICAgICAgICAgZWwuX3RhZy5pc01vdW50ZWQgPSAhIWVsLl90YWcudHJpZ2dlcignbW91bnQnKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIC8vIHJlbW92ZSBmcm9tIERPTVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3R1YiA9IGV4cHIuc3R1YiA9IHN0dWIgfHwgZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpXG4gICAgICAgIC8vIGlmIHRoZSBwYXJlbnROb2RlIGlzIGRlZmluZWQgd2UgY2FuIGVhc2lseSByZXBsYWNlIHRoZSB0YWdcbiAgICAgICAgaWYgKGRvbS5wYXJlbnROb2RlKVxuICAgICAgICAgIHJlbW92ZSgpXG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSBuZWVkIHRvIHdhaXQgdGhlIHVwZGF0ZWQgZXZlbnRcbiAgICAgICAgZWxzZSAodGFnLnBhcmVudCB8fCB0YWcpLm9uZSgndXBkYXRlZCcsIHJlbW92ZSlcblxuICAgICAgICBkb20uaW5TdHViID0gdHJ1ZVxuICAgICAgfVxuICAgIC8vIHNob3cgLyBoaWRlXG4gICAgfSBlbHNlIGlmICgvXihzaG93fGhpZGUpJC8udGVzdChhdHRyTmFtZSkpIHtcbiAgICAgIGlmIChhdHRyTmFtZSA9PSAnaGlkZScpIHZhbHVlID0gIXZhbHVlXG4gICAgICBkb20uc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSdcblxuICAgIC8vIGZpZWxkIHZhbHVlXG4gICAgfSBlbHNlIGlmIChhdHRyTmFtZSA9PSAndmFsdWUnKSB7XG4gICAgICBkb20udmFsdWUgPSB2YWx1ZVxuXG4gICAgLy8gPGltZyBzcmM9XCJ7IGV4cHIgfVwiPlxuICAgIH0gZWxzZSBpZiAoc3RhcnRzV2l0aChhdHRyTmFtZSwgUklPVF9QUkVGSVgpICYmIGF0dHJOYW1lICE9IFJJT1RfVEFHKSB7XG4gICAgICBpZiAodmFsdWUpXG4gICAgICAgIHNldEF0dHIoZG9tLCBhdHRyTmFtZS5zbGljZShSSU9UX1BSRUZJWC5sZW5ndGgpLCB2YWx1ZSlcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZXhwci5ib29sKSB7XG4gICAgICAgIGRvbVthdHRyTmFtZV0gPSB2YWx1ZVxuICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlID09PSAwIHx8IHZhbHVlICYmIHR5cGVvZiB2YWx1ZSAhPT0gVF9PQkpFQ1QpXG4gICAgICAgIHNldEF0dHIoZG9tLCBhdHRyTmFtZSwgdmFsdWUpXG5cbiAgICB9XG5cbiAgfSlcblxufVxuLyoqXG4gKiBMb29wcyBhbiBhcnJheVxuICogQHBhcmFtICAgeyBBcnJheSB9IGVscyAtIGNvbGxlY3Rpb24gb2YgaXRlbXNcbiAqIEBwYXJhbSAgIHtGdW5jdGlvbn0gZm4gLSBjYWxsYmFjayBmdW5jdGlvblxuICogQHJldHVybnMgeyBBcnJheSB9IHRoZSBhcnJheSBsb29wZWRcbiAqL1xuZnVuY3Rpb24gZWFjaChlbHMsIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSAoZWxzIHx8IFtdKS5sZW5ndGgsIGVsOyBpIDwgbGVuOyBpKyspIHtcbiAgICBlbCA9IGVsc1tpXVxuICAgIC8vIHJldHVybiBmYWxzZSAtPiByZW1vdmUgY3VycmVudCBpdGVtIGR1cmluZyBsb29wXG4gICAgaWYgKGVsICE9IG51bGwgJiYgZm4oZWwsIGkpID09PSBmYWxzZSkgaS0tXG4gIH1cbiAgcmV0dXJuIGVsc1xufVxuXG4vKipcbiAqIERldGVjdCBpZiB0aGUgYXJndW1lbnQgcGFzc2VkIGlzIGEgZnVuY3Rpb25cbiAqIEBwYXJhbSAgIHsgKiB9IHYgLSB3aGF0ZXZlciB5b3Ugd2FudCB0byBwYXNzIHRvIHRoaXMgZnVuY3Rpb25cbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IC1cbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2KSB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gVF9GVU5DVElPTiB8fCBmYWxzZSAgIC8vIGF2b2lkIElFIHByb2JsZW1zXG59XG5cbi8qKlxuICogUmVtb3ZlIGFueSBET00gYXR0cmlidXRlIGZyb20gYSBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIHdhbnQgdG8gdXBkYXRlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IG5hbWUgLSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB3ZSB3YW50IHRvIHJlbW92ZVxuICovXG5mdW5jdGlvbiByZW1BdHRyKGRvbSwgbmFtZSkge1xuICBkb20ucmVtb3ZlQXR0cmlidXRlKG5hbWUpXG59XG5cbi8qKlxuICogQ29udmVydCBhIHN0cmluZyBjb250YWluaW5nIGRhc2hlcyB0byBjYW1lbCBjYXNlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHN0cmluZyAtIGlucHV0IHN0cmluZ1xuICogQHJldHVybnMgeyBTdHJpbmcgfSBteS1zdHJpbmcgLT4gbXlTdHJpbmdcbiAqL1xuZnVuY3Rpb24gdG9DYW1lbChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8tKFxcdykvZywgZnVuY3Rpb24oXywgYykge1xuICAgIHJldHVybiBjLnRvVXBwZXJDYXNlKClcbiAgfSlcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIG9mIGFueSBET00gYXR0cmlidXRlIG9uIGEgbm9kZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSB3YW50IHRvIHBhcnNlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IG5hbWUgLSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgd2Ugd2FudCB0byBnZXRcbiAqIEByZXR1cm5zIHsgU3RyaW5nIHwgdW5kZWZpbmVkIH0gbmFtZSBvZiB0aGUgbm9kZSBhdHRyaWJ1dGUgd2hldGhlciBpdCBleGlzdHNcbiAqL1xuZnVuY3Rpb24gZ2V0QXR0cihkb20sIG5hbWUpIHtcbiAgcmV0dXJuIGRvbS5nZXRBdHRyaWJ1dGUobmFtZSlcbn1cblxuLyoqXG4gKiBTZXQgYW55IERPTSBhdHRyaWJ1dGVcbiAqIEBwYXJhbSB7IE9iamVjdCB9IGRvbSAtIERPTSBub2RlIHdlIHdhbnQgdG8gdXBkYXRlXG4gKiBAcGFyYW0geyBTdHJpbmcgfSBuYW1lIC0gbmFtZSBvZiB0aGUgcHJvcGVydHkgd2Ugd2FudCB0byBzZXRcbiAqIEBwYXJhbSB7IFN0cmluZyB9IHZhbCAtIHZhbHVlIG9mIHRoZSBwcm9wZXJ0eSB3ZSB3YW50IHRvIHNldFxuICovXG5mdW5jdGlvbiBzZXRBdHRyKGRvbSwgbmFtZSwgdmFsKSB7XG4gIGRvbS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsKVxufVxuXG4vKipcbiAqIERldGVjdCB0aGUgdGFnIGltcGxlbWVudGF0aW9uIGJ5IGEgRE9NIG5vZGVcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gZG9tIC0gRE9NIG5vZGUgd2UgbmVlZCB0byBwYXJzZSB0byBnZXQgaXRzIHRhZyBpbXBsZW1lbnRhdGlvblxuICogQHJldHVybnMgeyBPYmplY3QgfSBpdCByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiBhIGN1c3RvbSB0YWcgKHRlbXBsYXRlIGFuZCBib290IGZ1bmN0aW9uKVxuICovXG5mdW5jdGlvbiBnZXRUYWcoZG9tKSB7XG4gIHJldHVybiBkb20udGFnTmFtZSAmJiBfX3RhZ0ltcGxbZ2V0QXR0cihkb20sIFJJT1RfVEFHKSB8fCBkb20udGFnTmFtZS50b0xvd2VyQ2FzZSgpXVxufVxuLyoqXG4gKiBBZGQgYSBjaGlsZCB0YWcgdG8gaXRzIHBhcmVudCBpbnRvIHRoZSBgdGFnc2Agb2JqZWN0XG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHRhZyAtIGNoaWxkIHRhZyBpbnN0YW5jZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSB0YWdOYW1lIC0ga2V5IHdoZXJlIHRoZSBuZXcgdGFnIHdpbGwgYmUgc3RvcmVkXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHBhcmVudCAtIHRhZyBpbnN0YW5jZSB3aGVyZSB0aGUgbmV3IGNoaWxkIHRhZyB3aWxsIGJlIGluY2x1ZGVkXG4gKi9cbmZ1bmN0aW9uIGFkZENoaWxkVGFnKHRhZywgdGFnTmFtZSwgcGFyZW50KSB7XG4gIHZhciBjYWNoZWRUYWcgPSBwYXJlbnQudGFnc1t0YWdOYW1lXVxuXG4gIC8vIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBjaGlsZHJlbiB0YWdzIGhhdmluZyB0aGUgc2FtZSBuYW1lXG4gIGlmIChjYWNoZWRUYWcpIHtcbiAgICAvLyBpZiB0aGUgcGFyZW50IHRhZ3MgcHJvcGVydHkgaXMgbm90IHlldCBhbiBhcnJheVxuICAgIC8vIGNyZWF0ZSBpdCBhZGRpbmcgdGhlIGZpcnN0IGNhY2hlZCB0YWdcbiAgICBpZiAoIWlzQXJyYXkoY2FjaGVkVGFnKSlcbiAgICAgIC8vIGRvbid0IGFkZCB0aGUgc2FtZSB0YWcgdHdpY2VcbiAgICAgIGlmIChjYWNoZWRUYWcgIT09IHRhZylcbiAgICAgICAgcGFyZW50LnRhZ3NbdGFnTmFtZV0gPSBbY2FjaGVkVGFnXVxuICAgIC8vIGFkZCB0aGUgbmV3IG5lc3RlZCB0YWcgdG8gdGhlIGFycmF5XG4gICAgaWYgKCFjb250YWlucyhwYXJlbnQudGFnc1t0YWdOYW1lXSwgdGFnKSlcbiAgICAgIHBhcmVudC50YWdzW3RhZ05hbWVdLnB1c2godGFnKVxuICB9IGVsc2Uge1xuICAgIHBhcmVudC50YWdzW3RhZ05hbWVdID0gdGFnXG4gIH1cbn1cblxuLyoqXG4gKiBNb3ZlIHRoZSBwb3NpdGlvbiBvZiBhIGN1c3RvbSB0YWcgaW4gaXRzIHBhcmVudCB0YWdcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gdGFnIC0gY2hpbGQgdGFnIGluc3RhbmNlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHRhZ05hbWUgLSBrZXkgd2hlcmUgdGhlIHRhZyB3YXMgc3RvcmVkXG4gKiBAcGFyYW0gICB7IE51bWJlciB9IG5ld1BvcyAtIGluZGV4IHdoZXJlIHRoZSBuZXcgdGFnIHdpbGwgYmUgc3RvcmVkXG4gKi9cbmZ1bmN0aW9uIG1vdmVDaGlsZFRhZyh0YWcsIHRhZ05hbWUsIG5ld1Bvcykge1xuICB2YXIgcGFyZW50ID0gdGFnLnBhcmVudCxcbiAgICB0YWdzXG4gIC8vIG5vIHBhcmVudCBubyBtb3ZlXG4gIGlmICghcGFyZW50KSByZXR1cm5cblxuICB0YWdzID0gcGFyZW50LnRhZ3NbdGFnTmFtZV1cblxuICBpZiAoaXNBcnJheSh0YWdzKSlcbiAgICB0YWdzLnNwbGljZShuZXdQb3MsIDAsIHRhZ3Muc3BsaWNlKHRhZ3MuaW5kZXhPZih0YWcpLCAxKVswXSlcbiAgZWxzZSBhZGRDaGlsZFRhZyh0YWcsIHRhZ05hbWUsIHBhcmVudClcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgY2hpbGQgdGFnIGluY2x1ZGluZyBpdCBjb3JyZWN0bHkgaW50byBpdHMgcGFyZW50XG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGNoaWxkIC0gY2hpbGQgdGFnIGltcGxlbWVudGF0aW9uXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IG9wdHMgLSB0YWcgb3B0aW9ucyBjb250YWluaW5nIHRoZSBET00gbm9kZSB3aGVyZSB0aGUgdGFnIHdpbGwgYmUgbW91bnRlZFxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBpbm5lckhUTUwgLSBpbm5lciBodG1sIG9mIHRoZSBjaGlsZCBub2RlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHBhcmVudCAtIGluc3RhbmNlIG9mIHRoZSBwYXJlbnQgdGFnIGluY2x1ZGluZyB0aGUgY2hpbGQgY3VzdG9tIHRhZ1xuICogQHJldHVybnMgeyBPYmplY3QgfSBpbnN0YW5jZSBvZiB0aGUgbmV3IGNoaWxkIHRhZyBqdXN0IGNyZWF0ZWRcbiAqL1xuZnVuY3Rpb24gaW5pdENoaWxkVGFnKGNoaWxkLCBvcHRzLCBpbm5lckhUTUwsIHBhcmVudCkge1xuICB2YXIgdGFnID0gbmV3IFRhZyhjaGlsZCwgb3B0cywgaW5uZXJIVE1MKSxcbiAgICB0YWdOYW1lID0gZ2V0VGFnTmFtZShvcHRzLnJvb3QpLFxuICAgIHB0YWcgPSBnZXRJbW1lZGlhdGVDdXN0b21QYXJlbnRUYWcocGFyZW50KVxuICAvLyBmaXggZm9yIHRoZSBwYXJlbnQgYXR0cmlidXRlIGluIHRoZSBsb29wZWQgZWxlbWVudHNcbiAgdGFnLnBhcmVudCA9IHB0YWdcbiAgLy8gc3RvcmUgdGhlIHJlYWwgcGFyZW50IHRhZ1xuICAvLyBpbiBzb21lIGNhc2VzIHRoaXMgY291bGQgYmUgZGlmZmVyZW50IGZyb20gdGhlIGN1c3RvbSBwYXJlbnQgdGFnXG4gIC8vIGZvciBleGFtcGxlIGluIG5lc3RlZCBsb29wc1xuICB0YWcuX3BhcmVudCA9IHBhcmVudFxuXG4gIC8vIGFkZCB0aGlzIHRhZyB0byB0aGUgY3VzdG9tIHBhcmVudCB0YWdcbiAgYWRkQ2hpbGRUYWcodGFnLCB0YWdOYW1lLCBwdGFnKVxuICAvLyBhbmQgYWxzbyB0byB0aGUgcmVhbCBwYXJlbnQgdGFnXG4gIGlmIChwdGFnICE9PSBwYXJlbnQpXG4gICAgYWRkQ2hpbGRUYWcodGFnLCB0YWdOYW1lLCBwYXJlbnQpXG4gIC8vIGVtcHR5IHRoZSBjaGlsZCBub2RlIG9uY2Ugd2UgZ290IGl0cyB0ZW1wbGF0ZVxuICAvLyB0byBhdm9pZCB0aGF0IGl0cyBjaGlsZHJlbiBnZXQgY29tcGlsZWQgbXVsdGlwbGUgdGltZXNcbiAgb3B0cy5yb290LmlubmVySFRNTCA9ICcnXG5cbiAgcmV0dXJuIHRhZ1xufVxuXG4vKipcbiAqIExvb3AgYmFja3dhcmQgYWxsIHRoZSBwYXJlbnRzIHRyZWUgdG8gZGV0ZWN0IHRoZSBmaXJzdCBjdXN0b20gcGFyZW50IHRhZ1xuICogQHBhcmFtICAgeyBPYmplY3QgfSB0YWcgLSBhIFRhZyBpbnN0YW5jZVxuICogQHJldHVybnMgeyBPYmplY3QgfSB0aGUgaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IGN1c3RvbSBwYXJlbnQgdGFnIGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGdldEltbWVkaWF0ZUN1c3RvbVBhcmVudFRhZyh0YWcpIHtcbiAgdmFyIHB0YWcgPSB0YWdcbiAgd2hpbGUgKCFnZXRUYWcocHRhZy5yb290KSkge1xuICAgIGlmICghcHRhZy5wYXJlbnQpIGJyZWFrXG4gICAgcHRhZyA9IHB0YWcucGFyZW50XG4gIH1cbiAgcmV0dXJuIHB0YWdcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gc2V0IGFuIGltbXV0YWJsZSBwcm9wZXJ0eVxuICogQHBhcmFtICAgeyBPYmplY3QgfSBlbCAtIG9iamVjdCB3aGVyZSB0aGUgbmV3IHByb3BlcnR5IHdpbGwgYmUgc2V0XG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IGtleSAtIG9iamVjdCBrZXkgd2hlcmUgdGhlIG5ldyBwcm9wZXJ0eSB3aWxsIGJlIHN0b3JlZFxuICogQHBhcmFtICAgeyAqIH0gdmFsdWUgLSB2YWx1ZSBvZiB0aGUgbmV3IHByb3BlcnR5XG4qIEBwYXJhbSAgIHsgT2JqZWN0IH0gb3B0aW9ucyAtIHNldCB0aGUgcHJvcGVyeSBvdmVycmlkaW5nIHRoZSBkZWZhdWx0IG9wdGlvbnNcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gLSB0aGUgaW5pdGlhbCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoZWwsIGtleSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCBrZXksIGV4dGVuZCh7XG4gICAgdmFsdWU6IHZhbHVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gIH0sIG9wdGlvbnMpKVxuICByZXR1cm4gZWxcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHRhZyBuYW1lIG9mIGFueSBET00gbm9kZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSB3YW50IHRvIHBhcnNlXG4gKiBAcmV0dXJucyB7IFN0cmluZyB9IG5hbWUgdG8gaWRlbnRpZnkgdGhpcyBkb20gbm9kZSBpbiByaW90XG4gKi9cbmZ1bmN0aW9uIGdldFRhZ05hbWUoZG9tKSB7XG4gIHZhciBjaGlsZCA9IGdldFRhZyhkb20pLFxuICAgIG5hbWVkVGFnID0gZ2V0QXR0cihkb20sICduYW1lJyksXG4gICAgdGFnTmFtZSA9IG5hbWVkVGFnICYmICF0bXBsLmhhc0V4cHIobmFtZWRUYWcpID9cbiAgICAgICAgICAgICAgICBuYW1lZFRhZyA6XG4gICAgICAgICAgICAgIGNoaWxkID8gY2hpbGQubmFtZSA6IGRvbS50YWdOYW1lLnRvTG93ZXJDYXNlKClcblxuICByZXR1cm4gdGFnTmFtZVxufVxuXG4vKipcbiAqIEV4dGVuZCBhbnkgb2JqZWN0IHdpdGggb3RoZXIgcHJvcGVydGllc1xuICogQHBhcmFtICAgeyBPYmplY3QgfSBzcmMgLSBzb3VyY2Ugb2JqZWN0XG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IHRoZSByZXN1bHRpbmcgZXh0ZW5kZWQgb2JqZWN0XG4gKlxuICogdmFyIG9iaiA9IHsgZm9vOiAnYmF6JyB9XG4gKiBleHRlbmQob2JqLCB7YmFyOiAnYmFyJywgZm9vOiAnYmFyJ30pXG4gKiBjb25zb2xlLmxvZyhvYmopID0+IHtiYXI6ICdiYXInLCBmb286ICdiYXInfVxuICpcbiAqL1xuZnVuY3Rpb24gZXh0ZW5kKHNyYykge1xuICB2YXIgb2JqLCBhcmdzID0gYXJndW1lbnRzXG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgIGlmIChvYmogPSBhcmdzW2ldKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgcHJvcGVydHkgb2YgdGhlIHNvdXJjZSBvYmplY3QgY291bGQgYmUgb3ZlcnJpZGRlblxuICAgICAgICBpZiAoaXNXcml0YWJsZShzcmMsIGtleSkpXG4gICAgICAgICAgc3JjW2tleV0gPSBvYmpba2V5XVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3JjXG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBhcnJheSBjb250YWlucyBhbiBpdGVtXG4gKiBAcGFyYW0gICB7IEFycmF5IH0gYXJyIC0gdGFyZ2V0IGFycmF5XG4gKiBAcGFyYW0gICB7ICogfSBpdGVtIC0gaXRlbSB0byB0ZXN0XG4gKiBAcmV0dXJucyB7IEJvb2xlYW4gfSBEb2VzICdhcnInIGNvbnRhaW4gJ2l0ZW0nP1xuICovXG5mdW5jdGlvbiBjb250YWlucyhhcnIsIGl0ZW0pIHtcbiAgcmV0dXJuIH5hcnIuaW5kZXhPZihpdGVtKVxufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gb2JqZWN0IGlzIGEga2luZCBvZiBhcnJheVxuICogQHBhcmFtICAgeyAqIH0gYSAtIGFueXRoaW5nXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gaXMgJ2EnIGFuIGFycmF5P1xuICovXG5mdW5jdGlvbiBpc0FycmF5KGEpIHsgcmV0dXJuIEFycmF5LmlzQXJyYXkoYSkgfHwgYSBpbnN0YW5jZW9mIEFycmF5IH1cblxuLyoqXG4gKiBEZXRlY3Qgd2hldGhlciBhIHByb3BlcnR5IG9mIGFuIG9iamVjdCBjb3VsZCBiZSBvdmVycmlkZGVuXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9ICBvYmogLSBzb3VyY2Ugb2JqZWN0XG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICBrZXkgLSBvYmplY3QgcHJvcGVydHlcbiAqIEByZXR1cm5zIHsgQm9vbGVhbiB9IGlzIHRoaXMgcHJvcGVydHkgd3JpdGFibGU/XG4gKi9cbmZ1bmN0aW9uIGlzV3JpdGFibGUob2JqLCBrZXkpIHtcbiAgdmFyIHByb3BzID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIGtleSlcbiAgcmV0dXJuIHR5cGVvZiBvYmpba2V5XSA9PT0gVF9VTkRFRiB8fCBwcm9wcyAmJiBwcm9wcy53cml0YWJsZVxufVxuXG5cbi8qKlxuICogV2l0aCB0aGlzIGZ1bmN0aW9uIHdlIGF2b2lkIHRoYXQgdGhlIGludGVybmFsIFRhZyBtZXRob2RzIGdldCBvdmVycmlkZGVuXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IGRhdGEgLSBvcHRpb25zIHdlIHdhbnQgdG8gdXNlIHRvIGV4dGVuZCB0aGUgdGFnIGluc3RhbmNlXG4gKiBAcmV0dXJucyB7IE9iamVjdCB9IGNsZWFuIG9iamVjdCB3aXRob3V0IGNvbnRhaW5pbmcgdGhlIHJpb3QgaW50ZXJuYWwgcmVzZXJ2ZWQgd29yZHNcbiAqL1xuZnVuY3Rpb24gY2xlYW5VcERhdGEoZGF0YSkge1xuICBpZiAoIShkYXRhIGluc3RhbmNlb2YgVGFnKSAmJiAhKGRhdGEgJiYgdHlwZW9mIGRhdGEudHJpZ2dlciA9PSBUX0ZVTkNUSU9OKSlcbiAgICByZXR1cm4gZGF0YVxuXG4gIHZhciBvID0ge31cbiAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICBpZiAoIWNvbnRhaW5zKFJFU0VSVkVEX1dPUkRTX0JMQUNLTElTVCwga2V5KSlcbiAgICAgIG9ba2V5XSA9IGRhdGFba2V5XVxuICB9XG4gIHJldHVybiBvXG59XG5cbi8qKlxuICogV2FsayBkb3duIHJlY3Vyc2l2ZWx5IGFsbCB0aGUgY2hpbGRyZW4gdGFncyBzdGFydGluZyBkb20gbm9kZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSAgIGRvbSAtIHN0YXJ0aW5nIG5vZGUgd2hlcmUgd2Ugd2lsbCBzdGFydCB0aGUgcmVjdXJzaW9uXG4gKiBAcGFyYW0gICB7IEZ1bmN0aW9uIH0gZm4gLSBjYWxsYmFjayB0byB0cmFuc2Zvcm0gdGhlIGNoaWxkIG5vZGUganVzdCBmb3VuZFxuICovXG5mdW5jdGlvbiB3YWxrKGRvbSwgZm4pIHtcbiAgaWYgKGRvbSkge1xuICAgIC8vIHN0b3AgdGhlIHJlY3Vyc2lvblxuICAgIGlmIChmbihkb20pID09PSBmYWxzZSkgcmV0dXJuXG4gICAgZWxzZSB7XG4gICAgICBkb20gPSBkb20uZmlyc3RDaGlsZFxuXG4gICAgICB3aGlsZSAoZG9tKSB7XG4gICAgICAgIHdhbGsoZG9tLCBmbilcbiAgICAgICAgZG9tID0gZG9tLm5leHRTaWJsaW5nXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogTWluaW1pemUgcmlzazogb25seSB6ZXJvIG9yIG9uZSBfc3BhY2VfIGJldHdlZW4gYXR0ciAmIHZhbHVlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgaHRtbCAtIGh0bWwgc3RyaW5nIHdlIHdhbnQgdG8gcGFyc2VcbiAqIEBwYXJhbSAgIHsgRnVuY3Rpb24gfSBmbiAtIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGFwcGx5IG9uIGFueSBhdHRyaWJ1dGUgZm91bmRcbiAqL1xuZnVuY3Rpb24gd2Fsa0F0dHJpYnV0ZXMoaHRtbCwgZm4pIHtcbiAgdmFyIG0sXG4gICAgcmUgPSAvKFstXFx3XSspID89ID8oPzpcIihbXlwiXSopfCcoW14nXSopfCh7W159XSp9KSkvZ1xuXG4gIHdoaWxlIChtID0gcmUuZXhlYyhodG1sKSkge1xuICAgIGZuKG1bMV0udG9Mb3dlckNhc2UoKSwgbVsyXSB8fCBtWzNdIHx8IG1bNF0pXG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgRE9NIG5vZGUgaXMgaW4gc3R1YiBtb2RlLCB1c2VmdWwgZm9yIHRoZSByaW90ICdpZicgZGlyZWN0aXZlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9ICBkb20gLSBET00gbm9kZSB3ZSB3YW50IHRvIHBhcnNlXG4gKiBAcmV0dXJucyB7IEJvb2xlYW4gfSAtXG4gKi9cbmZ1bmN0aW9uIGlzSW5TdHViKGRvbSkge1xuICB3aGlsZSAoZG9tKSB7XG4gICAgaWYgKGRvbS5pblN0dWIpIHJldHVybiB0cnVlXG4gICAgZG9tID0gZG9tLnBhcmVudE5vZGVcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBnZW5lcmljIERPTSBub2RlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IG5hbWUgLSBuYW1lIG9mIHRoZSBET00gbm9kZSB3ZSB3YW50IHRvIGNyZWF0ZVxuICogQHJldHVybnMgeyBPYmplY3QgfSBET00gbm9kZSBqdXN0IGNyZWF0ZWRcbiAqL1xuZnVuY3Rpb24gbWtFbChuYW1lKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpXG59XG5cbi8qKlxuICogU2hvcnRlciBhbmQgZmFzdCB3YXkgdG8gc2VsZWN0IG11bHRpcGxlIG5vZGVzIGluIHRoZSBET01cbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gc2VsZWN0b3IgLSBET00gc2VsZWN0b3JcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY3R4IC0gRE9NIG5vZGUgd2hlcmUgdGhlIHRhcmdldHMgb2Ygb3VyIHNlYXJjaCB3aWxsIGlzIGxvY2F0ZWRcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gZG9tIG5vZGVzIGZvdW5kXG4gKi9cbmZ1bmN0aW9uICQkKHNlbGVjdG9yLCBjdHgpIHtcbiAgcmV0dXJuIChjdHggfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG59XG5cbi8qKlxuICogU2hvcnRlciBhbmQgZmFzdCB3YXkgdG8gc2VsZWN0IGEgc2luZ2xlIG5vZGUgaW4gdGhlIERPTVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBzZWxlY3RvciAtIHVuaXF1ZSBkb20gc2VsZWN0b3JcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gY3R4IC0gRE9NIG5vZGUgd2hlcmUgdGhlIHRhcmdldCBvZiBvdXIgc2VhcmNoIHdpbGwgaXMgbG9jYXRlZFxuICogQHJldHVybnMgeyBPYmplY3QgfSBkb20gbm9kZSBmb3VuZFxuICovXG5mdW5jdGlvbiAkKHNlbGVjdG9yLCBjdHgpIHtcbiAgcmV0dXJuIChjdHggfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG59XG5cbi8qKlxuICogU2ltcGxlIG9iamVjdCBwcm90b3R5cGFsIGluaGVyaXRhbmNlXG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IHBhcmVudCAtIHBhcmVudCBvYmplY3RcbiAqIEByZXR1cm5zIHsgT2JqZWN0IH0gY2hpbGQgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gaW5oZXJpdChwYXJlbnQpIHtcbiAgZnVuY3Rpb24gQ2hpbGQoKSB7fVxuICBDaGlsZC5wcm90b3R5cGUgPSBwYXJlbnRcbiAgcmV0dXJuIG5ldyBDaGlsZCgpXG59XG5cbi8qKlxuICogR2V0IHRoZSBuYW1lIHByb3BlcnR5IG5lZWRlZCB0byBpZGVudGlmeSBhIERPTSBub2RlIGluIHJpb3RcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gZG9tIC0gRE9NIG5vZGUgd2UgbmVlZCB0byBwYXJzZVxuICogQHJldHVybnMgeyBTdHJpbmcgfCB1bmRlZmluZWQgfSBnaXZlIHVzIGJhY2sgYSBzdHJpbmcgdG8gaWRlbnRpZnkgdGhpcyBkb20gbm9kZVxuICovXG5mdW5jdGlvbiBnZXROYW1lZEtleShkb20pIHtcbiAgcmV0dXJuIGdldEF0dHIoZG9tLCAnaWQnKSB8fCBnZXRBdHRyKGRvbSwgJ25hbWUnKVxufVxuXG4vKipcbiAqIFNldCB0aGUgbmFtZWQgcHJvcGVydGllcyBvZiBhIHRhZyBlbGVtZW50XG4gKiBAcGFyYW0geyBPYmplY3QgfSBkb20gLSBET00gbm9kZSB3ZSBuZWVkIHRvIHBhcnNlXG4gKiBAcGFyYW0geyBPYmplY3QgfSBwYXJlbnQgLSB0YWcgaW5zdGFuY2Ugd2hlcmUgdGhlIG5hbWVkIGRvbSBlbGVtZW50IHdpbGwgYmUgZXZlbnR1YWxseSBhZGRlZFxuICogQHBhcmFtIHsgQXJyYXkgfSBrZXlzIC0gbGlzdCBvZiBhbGwgdGhlIHRhZyBpbnN0YW5jZSBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIHNldE5hbWVkKGRvbSwgcGFyZW50LCBrZXlzKSB7XG4gIC8vIGdldCB0aGUga2V5IHZhbHVlIHdlIHdhbnQgdG8gYWRkIHRvIHRoZSB0YWcgaW5zdGFuY2VcbiAgdmFyIGtleSA9IGdldE5hbWVkS2V5KGRvbSksXG4gICAgaXNBcnIsXG4gICAgLy8gYWRkIHRoZSBub2RlIGRldGVjdGVkIHRvIGEgdGFnIGluc3RhbmNlIHVzaW5nIHRoZSBuYW1lZCBwcm9wZXJ0eVxuICAgIGFkZCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAvLyBhdm9pZCB0byBvdmVycmlkZSB0aGUgdGFnIHByb3BlcnRpZXMgYWxyZWFkeSBzZXRcbiAgICAgIGlmIChjb250YWlucyhrZXlzLCBrZXkpKSByZXR1cm5cbiAgICAgIC8vIGNoZWNrIHdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBhbiBhcnJheVxuICAgICAgaXNBcnIgPSBpc0FycmF5KHZhbHVlKVxuICAgICAgLy8gaWYgdGhlIGtleSB3YXMgbmV2ZXIgc2V0XG4gICAgICBpZiAoIXZhbHVlKVxuICAgICAgICAvLyBzZXQgaXQgb25jZSBvbiB0aGUgdGFnIGluc3RhbmNlXG4gICAgICAgIHBhcmVudFtrZXldID0gZG9tXG4gICAgICAvLyBpZiBpdCB3YXMgYW4gYXJyYXkgYW5kIG5vdCB5ZXQgc2V0XG4gICAgICBlbHNlIGlmICghaXNBcnIgfHwgaXNBcnIgJiYgIWNvbnRhaW5zKHZhbHVlLCBkb20pKSB7XG4gICAgICAgIC8vIGFkZCB0aGUgZG9tIG5vZGUgaW50byB0aGUgYXJyYXlcbiAgICAgICAgaWYgKGlzQXJyKVxuICAgICAgICAgIHZhbHVlLnB1c2goZG9tKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgcGFyZW50W2tleV0gPSBbdmFsdWUsIGRvbV1cbiAgICAgIH1cbiAgICB9XG5cbiAgLy8gc2tpcCB0aGUgZWxlbWVudHMgd2l0aCBubyBuYW1lZCBwcm9wZXJ0aWVzXG4gIGlmICgha2V5KSByZXR1cm5cblxuICAvLyBjaGVjayB3aGV0aGVyIHRoaXMga2V5IGhhcyBiZWVuIGFscmVhZHkgZXZhbHVhdGVkXG4gIGlmICh0bXBsLmhhc0V4cHIoa2V5KSlcbiAgICAvLyB3YWl0IHRoZSBmaXJzdCB1cGRhdGVkIGV2ZW50IG9ubHkgb25jZVxuICAgIHBhcmVudC5vbmUoJ21vdW50JywgZnVuY3Rpb24oKSB7XG4gICAgICBrZXkgPSBnZXROYW1lZEtleShkb20pXG4gICAgICBhZGQocGFyZW50W2tleV0pXG4gICAgfSlcbiAgZWxzZVxuICAgIGFkZChwYXJlbnRba2V5XSlcblxufVxuXG4vKipcbiAqIEZhc3RlciBTdHJpbmcgc3RhcnRzV2l0aCBhbHRlcm5hdGl2ZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSBzcmMgLSBzb3VyY2Ugc3RyaW5nXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHN0ciAtIHRlc3Qgc3RyaW5nXG4gKiBAcmV0dXJucyB7IEJvb2xlYW4gfSAtXG4gKi9cbmZ1bmN0aW9uIHN0YXJ0c1dpdGgoc3JjLCBzdHIpIHtcbiAgcmV0dXJuIHNyYy5zbGljZSgwLCBzdHIubGVuZ3RoKSA9PT0gc3RyXG59XG5cbi8qKlxuICogcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGZ1bmN0aW9uXG4gKiBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzE1Nzk2NzEsIGxpY2Vuc2UgTUlUXG4gKi9cbnZhciByQUYgPSAoZnVuY3Rpb24gKHcpIHtcbiAgdmFyIHJhZiA9IHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgIHx8XG4gICAgICAgICAgICB3Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuXG4gIGlmICghcmFmIHx8IC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3Lm5hdmlnYXRvci51c2VyQWdlbnQpKSB7ICAvLyBidWdneSBpT1M2XG4gICAgdmFyIGxhc3RUaW1lID0gMFxuXG4gICAgcmFmID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgICB2YXIgbm93dGltZSA9IERhdGUubm93KCksIHRpbWVvdXQgPSBNYXRoLm1heCgxNiAtIChub3d0aW1lIC0gbGFzdFRpbWUpLCAwKVxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IGNiKGxhc3RUaW1lID0gbm93dGltZSArIHRpbWVvdXQpIH0sIHRpbWVvdXQpXG4gICAgfVxuICB9XG4gIHJldHVybiByYWZcblxufSkod2luZG93IHx8IHt9KVxuXG4vKipcbiAqIE1vdW50IGEgdGFnIGNyZWF0aW5nIG5ldyBUYWcgaW5zdGFuY2VcbiAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gcm9vdCAtIGRvbSBub2RlIHdoZXJlIHRoZSB0YWcgd2lsbCBiZSBtb3VudGVkXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHRhZ05hbWUgLSBuYW1lIG9mIHRoZSByaW90IHRhZyB3ZSB3YW50IHRvIG1vdW50XG4gKiBAcGFyYW0gICB7IE9iamVjdCB9IG9wdHMgLSBvcHRpb25zIHRvIHBhc3MgdG8gdGhlIFRhZyBpbnN0YW5jZVxuICogQHJldHVybnMgeyBUYWcgfSBhIG5ldyBUYWcgaW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gbW91bnRUbyhyb290LCB0YWdOYW1lLCBvcHRzKSB7XG4gIHZhciB0YWcgPSBfX3RhZ0ltcGxbdGFnTmFtZV0sXG4gICAgLy8gY2FjaGUgdGhlIGlubmVyIEhUTUwgdG8gZml4ICM4NTVcbiAgICBpbm5lckhUTUwgPSByb290Ll9pbm5lckhUTUwgPSByb290Ll9pbm5lckhUTUwgfHwgcm9vdC5pbm5lckhUTUxcblxuICAvLyBjbGVhciB0aGUgaW5uZXIgaHRtbFxuICByb290LmlubmVySFRNTCA9ICcnXG5cbiAgaWYgKHRhZyAmJiByb290KSB0YWcgPSBuZXcgVGFnKHRhZywgeyByb290OiByb290LCBvcHRzOiBvcHRzIH0sIGlubmVySFRNTClcblxuICBpZiAodGFnICYmIHRhZy5tb3VudCkge1xuICAgIHRhZy5tb3VudCgpXG4gICAgLy8gYWRkIHRoaXMgdGFnIHRvIHRoZSB2aXJ0dWFsRG9tIHZhcmlhYmxlXG4gICAgaWYgKCFjb250YWlucyhfX3ZpcnR1YWxEb20sIHRhZykpIF9fdmlydHVhbERvbS5wdXNoKHRhZylcbiAgfVxuXG4gIHJldHVybiB0YWdcbn1cbi8qKlxuICogUmlvdCBwdWJsaWMgYXBpXG4gKi9cblxuLy8gc2hhcmUgbWV0aG9kcyBmb3Igb3RoZXIgcmlvdCBwYXJ0cywgZS5nLiBjb21waWxlclxucmlvdC51dGlsID0geyBicmFja2V0czogYnJhY2tldHMsIHRtcGw6IHRtcGwgfVxuXG4vKipcbiAqIENyZWF0ZSBhIG1peGluIHRoYXQgY291bGQgYmUgZ2xvYmFsbHkgc2hhcmVkIGFjcm9zcyBhbGwgdGhlIHRhZ3NcbiAqL1xucmlvdC5taXhpbiA9IChmdW5jdGlvbigpIHtcbiAgdmFyIG1peGlucyA9IHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZS9SZXR1cm4gYSBtaXhpbiBieSBpdHMgbmFtZVxuICAgKiBAcGFyYW0gICB7IFN0cmluZyB9IG5hbWUgLSBtaXhpbiBuYW1lXG4gICAqIEBwYXJhbSAgIHsgT2JqZWN0IH0gbWl4aW4gLSBtaXhpbiBsb2dpY1xuICAgKiBAcmV0dXJucyB7IE9iamVjdCB9IHRoZSBtaXhpbiBsb2dpY1xuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIG1peGluKSB7XG4gICAgaWYgKCFtaXhpbikgcmV0dXJuIG1peGluc1tuYW1lXVxuICAgIG1peGluc1tuYW1lXSA9IG1peGluXG4gIH1cblxufSkoKVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyByaW90IHRhZyBpbXBsZW1lbnRhdGlvblxuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIG5hbWUgLSBuYW1lL2lkIG9mIHRoZSBuZXcgcmlvdCB0YWdcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBodG1sIC0gdGFnIHRlbXBsYXRlXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgY3NzIC0gY3VzdG9tIHRhZyBjc3NcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBhdHRycyAtIHJvb3QgdGFnIGF0dHJpYnV0ZXNcbiAqIEBwYXJhbSAgIHsgRnVuY3Rpb24gfSBmbiAtIHVzZXIgZnVuY3Rpb25cbiAqIEByZXR1cm5zIHsgU3RyaW5nIH0gbmFtZS9pZCBvZiB0aGUgdGFnIGp1c3QgY3JlYXRlZFxuICovXG5yaW90LnRhZyA9IGZ1bmN0aW9uKG5hbWUsIGh0bWwsIGNzcywgYXR0cnMsIGZuKSB7XG4gIGlmIChpc0Z1bmN0aW9uKGF0dHJzKSkge1xuICAgIGZuID0gYXR0cnNcbiAgICBpZiAoL15bXFx3XFwtXStcXHM/PS8udGVzdChjc3MpKSB7XG4gICAgICBhdHRycyA9IGNzc1xuICAgICAgY3NzID0gJydcbiAgICB9IGVsc2UgYXR0cnMgPSAnJ1xuICB9XG4gIGlmIChjc3MpIHtcbiAgICBpZiAoaXNGdW5jdGlvbihjc3MpKSBmbiA9IGNzc1xuICAgIGVsc2Ugc3R5bGVNYW5hZ2VyLmFkZChjc3MpXG4gIH1cbiAgX190YWdJbXBsW25hbWVdID0geyBuYW1lOiBuYW1lLCB0bXBsOiBodG1sLCBhdHRyczogYXR0cnMsIGZuOiBmbiB9XG4gIHJldHVybiBuYW1lXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IHJpb3QgdGFnIGltcGxlbWVudGF0aW9uIChmb3IgdXNlIGJ5IHRoZSBjb21waWxlcilcbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gICBuYW1lIC0gbmFtZS9pZCBvZiB0aGUgbmV3IHJpb3QgdGFnXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgaHRtbCAtIHRhZyB0ZW1wbGF0ZVxuICogQHBhcmFtICAgeyBTdHJpbmcgfSAgIGNzcyAtIGN1c3RvbSB0YWcgY3NzXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9ICAgYXR0cnMgLSByb290IHRhZyBhdHRyaWJ1dGVzXG4gKiBAcGFyYW0gICB7IEZ1bmN0aW9uIH0gZm4gLSB1c2VyIGZ1bmN0aW9uXG4gKiBAcGFyYW0gICB7IHN0cmluZyB9ICBbYnBhaXJdIC0gYnJhY2tldHMgdXNlZCBpbiB0aGUgY29tcGlsYXRpb25cbiAqIEByZXR1cm5zIHsgU3RyaW5nIH0gbmFtZS9pZCBvZiB0aGUgdGFnIGp1c3QgY3JlYXRlZFxuICovXG5yaW90LnRhZzIgPSBmdW5jdGlvbihuYW1lLCBodG1sLCBjc3MsIGF0dHJzLCBmbiwgYnBhaXIpIHtcbiAgaWYgKGNzcykgc3R5bGVNYW5hZ2VyLmFkZChjc3MpXG4gIC8vaWYgKGJwYWlyKSByaW90LnNldHRpbmdzLmJyYWNrZXRzID0gYnBhaXJcbiAgX190YWdJbXBsW25hbWVdID0geyBuYW1lOiBuYW1lLCB0bXBsOiBodG1sLCBhdHRyczogYXR0cnMsIGZuOiBmbiB9XG4gIHJldHVybiBuYW1lXG59XG5cbi8qKlxuICogTW91bnQgYSB0YWcgdXNpbmcgYSBzcGVjaWZpYyB0YWcgaW1wbGVtZW50YXRpb25cbiAqIEBwYXJhbSAgIHsgU3RyaW5nIH0gc2VsZWN0b3IgLSB0YWcgRE9NIHNlbGVjdG9yXG4gKiBAcGFyYW0gICB7IFN0cmluZyB9IHRhZ05hbWUgLSB0YWcgaW1wbGVtZW50YXRpb24gbmFtZVxuICogQHBhcmFtICAgeyBPYmplY3QgfSBvcHRzIC0gdGFnIGxvZ2ljXG4gKiBAcmV0dXJucyB7IEFycmF5IH0gbmV3IHRhZ3MgaW5zdGFuY2VzXG4gKi9cbnJpb3QubW91bnQgPSBmdW5jdGlvbihzZWxlY3RvciwgdGFnTmFtZSwgb3B0cykge1xuXG4gIHZhciBlbHMsXG4gICAgYWxsVGFncyxcbiAgICB0YWdzID0gW11cblxuICAvLyBoZWxwZXIgZnVuY3Rpb25zXG5cbiAgZnVuY3Rpb24gYWRkUmlvdFRhZ3MoYXJyKSB7XG4gICAgdmFyIGxpc3QgPSAnJ1xuICAgIGVhY2goYXJyLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKCEvW14tXFx3XS8udGVzdChlKSlcbiAgICAgICAgbGlzdCArPSAnLCpbJyArIFJJT1RfVEFHICsgJz0nICsgZS50cmltKCkgKyAnXSdcbiAgICB9KVxuICAgIHJldHVybiBsaXN0XG4gIH1cblxuICBmdW5jdGlvbiBzZWxlY3RBbGxUYWdzKCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoX190YWdJbXBsKVxuICAgIHJldHVybiBrZXlzICsgYWRkUmlvdFRhZ3Moa2V5cylcbiAgfVxuXG4gIGZ1bmN0aW9uIHB1c2hUYWdzKHJvb3QpIHtcbiAgICB2YXIgbGFzdFxuXG4gICAgaWYgKHJvb3QudGFnTmFtZSkge1xuICAgICAgaWYgKHRhZ05hbWUgJiYgKCEobGFzdCA9IGdldEF0dHIocm9vdCwgUklPVF9UQUcpKSB8fCBsYXN0ICE9IHRhZ05hbWUpKVxuICAgICAgICBzZXRBdHRyKHJvb3QsIFJJT1RfVEFHLCB0YWdOYW1lKVxuXG4gICAgICB2YXIgdGFnID0gbW91bnRUbyhyb290LCB0YWdOYW1lIHx8IHJvb3QuZ2V0QXR0cmlidXRlKFJJT1RfVEFHKSB8fCByb290LnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgb3B0cylcblxuICAgICAgaWYgKHRhZykgdGFncy5wdXNoKHRhZylcbiAgICB9IGVsc2UgaWYgKHJvb3QubGVuZ3RoKVxuICAgICAgZWFjaChyb290LCBwdXNoVGFncykgICAvLyBhc3N1bWUgbm9kZUxpc3RcblxuICB9XG5cbiAgLy8gLS0tLS0gbW91bnQgY29kZSAtLS0tLVxuXG4gIC8vIGluamVjdCBzdHlsZXMgaW50byBET01cbiAgc3R5bGVNYW5hZ2VyLmluamVjdCgpXG5cbiAgaWYgKHR5cGVvZiB0YWdOYW1lID09PSBUX09CSkVDVCkge1xuICAgIG9wdHMgPSB0YWdOYW1lXG4gICAgdGFnTmFtZSA9IDBcbiAgfVxuXG4gIC8vIGNyYXdsIHRoZSBET00gdG8gZmluZCB0aGUgdGFnXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09IFRfU1RSSU5HKSB7XG4gICAgaWYgKHNlbGVjdG9yID09PSAnKicpXG4gICAgICAvLyBzZWxlY3QgYWxsIHRoZSB0YWdzIHJlZ2lzdGVyZWRcbiAgICAgIC8vIGFuZCBhbHNvIHRoZSB0YWdzIGZvdW5kIHdpdGggdGhlIHJpb3QtdGFnIGF0dHJpYnV0ZSBzZXRcbiAgICAgIHNlbGVjdG9yID0gYWxsVGFncyA9IHNlbGVjdEFsbFRhZ3MoKVxuICAgIGVsc2VcbiAgICAgIC8vIG9yIGp1c3QgdGhlIG9uZXMgbmFtZWQgbGlrZSB0aGUgc2VsZWN0b3JcbiAgICAgIHNlbGVjdG9yICs9IGFkZFJpb3RUYWdzKHNlbGVjdG9yLnNwbGl0KCcsJykpXG5cbiAgICAvLyBtYWtlIHN1cmUgdG8gcGFzcyBhbHdheXMgYSBzZWxlY3RvclxuICAgIC8vIHRvIHRoZSBxdWVyeVNlbGVjdG9yQWxsIGZ1bmN0aW9uXG4gICAgZWxzID0gc2VsZWN0b3IgPyAkJChzZWxlY3RvcikgOiBbXVxuICB9XG4gIGVsc2VcbiAgICAvLyBwcm9iYWJseSB5b3UgaGF2ZSBwYXNzZWQgYWxyZWFkeSBhIHRhZyBvciBhIE5vZGVMaXN0XG4gICAgZWxzID0gc2VsZWN0b3JcblxuICAvLyBzZWxlY3QgYWxsIHRoZSByZWdpc3RlcmVkIGFuZCBtb3VudCB0aGVtIGluc2lkZSB0aGVpciByb290IGVsZW1lbnRzXG4gIGlmICh0YWdOYW1lID09PSAnKicpIHtcbiAgICAvLyBnZXQgYWxsIGN1c3RvbSB0YWdzXG4gICAgdGFnTmFtZSA9IGFsbFRhZ3MgfHwgc2VsZWN0QWxsVGFncygpXG4gICAgLy8gaWYgdGhlIHJvb3QgZWxzIGl0J3MganVzdCBhIHNpbmdsZSB0YWdcbiAgICBpZiAoZWxzLnRhZ05hbWUpXG4gICAgICBlbHMgPSAkJCh0YWdOYW1lLCBlbHMpXG4gICAgZWxzZSB7XG4gICAgICAvLyBzZWxlY3QgYWxsIHRoZSBjaGlsZHJlbiBmb3IgYWxsIHRoZSBkaWZmZXJlbnQgcm9vdCBlbGVtZW50c1xuICAgICAgdmFyIG5vZGVMaXN0ID0gW11cbiAgICAgIGVhY2goZWxzLCBmdW5jdGlvbiAoX2VsKSB7XG4gICAgICAgIG5vZGVMaXN0LnB1c2goJCQodGFnTmFtZSwgX2VsKSlcbiAgICAgIH0pXG4gICAgICBlbHMgPSBub2RlTGlzdFxuICAgIH1cbiAgICAvLyBnZXQgcmlkIG9mIHRoZSB0YWdOYW1lXG4gICAgdGFnTmFtZSA9IDBcbiAgfVxuXG4gIGlmIChlbHMudGFnTmFtZSlcbiAgICBwdXNoVGFncyhlbHMpXG4gIGVsc2VcbiAgICBlYWNoKGVscywgcHVzaFRhZ3MpXG5cbiAgcmV0dXJuIHRhZ3Ncbn1cblxuLyoqXG4gKiBVcGRhdGUgYWxsIHRoZSB0YWdzIGluc3RhbmNlcyBjcmVhdGVkXG4gKiBAcmV0dXJucyB7IEFycmF5IH0gYWxsIHRoZSB0YWdzIGluc3RhbmNlc1xuICovXG5yaW90LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZWFjaChfX3ZpcnR1YWxEb20sIGZ1bmN0aW9uKHRhZykge1xuICAgIHRhZy51cGRhdGUoKVxuICB9KVxufVxuXG4vKipcbiAqIEV4cG9ydCB0aGUgVGFnIGNvbnN0cnVjdG9yXG4gKi9cbnJpb3QuVGFnID0gVGFnXG4gIC8vIHN1cHBvcnQgQ29tbW9uSlMsIEFNRCAmIGJyb3dzZXJcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSBUX09CSkVDVClcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHJpb3RcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gVF9GVU5DVElPTiAmJiB0eXBlb2YgZGVmaW5lLmFtZCAhPT0gVF9VTkRFRilcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiByaW90IH0pXG4gIGVsc2VcbiAgICB3aW5kb3cucmlvdCA9IHJpb3RcblxufSkodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHZvaWQgMCk7XG4iLCIvKipcbiAgUm93amFtXG4gIEEgamF2YXNjcmlwdCBsaWJyYXJ5IHdoaWNoIG1ha2VzIGl0IGVhc2llciB0byBwcm9jZXNzIGRhdGEgZnJvbSBhIGRhdGFiYXNlLlxuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBSb3dqYW07XG5cbnZhciB2YWx1ZSA9IG51bGw7XG5cbmZ1bmN0aW9uIFJvd2phbSh0YWJsZSwgbWFrZUNvcHkpIHtcbiAgdmFyIG5ld01lID0gT2JqZWN0LmNyZWF0ZShSb3dqYW0ucHJvdG90eXBlKTtcbiAgaWYgKG1ha2VDb3B5ID09PSBmYWxzZSkge1xuICAgIG5ld01lLnZhbHVlID0gdGFibGU7ICAgICAgICBcbiAgfSBlbHNlIHtcbiAgICBuZXdNZS52YWx1ZSA9IFJvd2phbS5jb3B5VmFsdWUodGFibGUpO1xuICB9XG4gIHJldHVybiBuZXdNZTtcbn1cblxuXG5Sb3dqYW0ucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG5ld01lID0gT2JqZWN0LmNyZWF0ZShSb3dqYW0ucHJvdG90eXBlKTtcbiAgbmV3TWUudmFsdWUgPSBSb3dqYW0uY29weVZhbHVlKHRoaXMudmFsdWUpO1xuICByZXR1cm4gbmV3TWU7ICAgICAgXG59XG5cblJvd2phbS5wcm90b3R5cGUuc2V0VHlwZXMgPSBmdW5jdGlvbih0eXBlT3B0aW9ucykge1xuICB2YXIgdGFibGUgPSB0aGlzLnZhbHVlO1xuICB2YXIgbiA9IHRhYmxlLmxlbmd0aDtcbiAgdmFyIHR5cGVBcnIgPSBbJ3N0cmluZycsJ251bWJlcicsJ2Jvb2xlYW4nXTtcbiAgdmFyIHR5cGVMb29rdXAgPSB7fVxuICBcbiAgLy8gdG8gYXZvaWQgbG9va3VwcyBsYXRlciBvblxuICBmb3IgKHZhciBjb2x1bW4gaW4gdHlwZU9wdGlvbnMpIHtcbiAgICB2YXIgbmV3VHlwZSA9IHR5cGVPcHRpb25zW2NvbHVtbl07XG4gICAgdHlwZUxvb2t1cFtjb2x1bW5dID0gdHlwZUFyci5pbmRleE9mKG5ld1R5cGUpO1xuICB9XG4gIFxuICAvLyBpdGVyYXRlIG92ZXIgZWFjaCByb3dcbiAgZm9yICh2YXIgaT0wOyBpPG47IGkrKykge1xuICAgIHZhciByb3cgPSB0YWJsZVtpXTtcbiAgICBcbiAgICAvLyBpdGVyYXRlIG92ZXIgZWFjaCBjb2x1bW4gaW4gZWFjaCByb3dcbiAgICBmb3IgKHZhciBjb2x1bW4gaW4gdHlwZU9wdGlvbnMpIHtcbiAgICAgIHZhciBvbGRWYWwgPSByb3dbY29sdW1uXTtcbiAgICAgIFxuICAgICAgc3dpdGNoICh0eXBlTG9va3VwW2NvbHVtbl0pIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgcm93W2NvbHVtbl0gPSBTdHJpbmcob2xkVmFsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIHJvd1tjb2x1bW5dID0gTnVtYmVyKG9sZFZhbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBpZiAob2xkVmFsID09PSBcIjBcIikge1xuICAgICAgICAgIHJvd1tjb2x1bW5dID0gZmFsc2U7IC8vIGZpeCBvYnNjdXJlIGphdmFzY3JpcHQgYmVoYXZpb3JcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByb3dbY29sdW1uXSA9IEJvb2xlYW4ob2xkVmFsKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHRoaXMudmFsdWUgPSB0YWJsZTtcbiAgXG4gIHJldHVybiB0aGlzO1xufVxuXG5Sb3dqYW0ucHJvdG90eXBlLnN1bW1hcml6ZSA9IGZ1bmN0aW9uKGNvbHNUb1N1bSwgY29sc1RvQ29uY2F0LCBkZWxpbSwgcm93Q291bnRDb2x1bW4pIHtcbiAgdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgaWYgKHR5cGVvZihjb2xzVG9TdW0pID09PSAndW5kZWZpbmVkJyB8fCBjb2xzVG9TdW0gPT09IG51bGwpIGNvbHNUb1N1bSA9IFtdO1xuICBpZiAodHlwZW9mKGNvbHNUb0NvbmNhdCkgPT09ICd1bmRlZmluZWQnIHx8IGNvbHNUb0NvbmNhdCA9PT0gbnVsbCkgY29sc1RvQ29uY2F0ID0gW107XG4gIGlmICh0eXBlb2YoZGVsaW0pID09PSAndW5kZWZpbmVkJyB8fCBkZWxpbSA9PT0gbnVsbCkgZGVsaW0gPSBcIlxcblwiO1xuICBpZiAodHlwZW9mKHJvd0NvdW50Q29sdW1uKSA9PT0gJ3VuZGVmaW5lZCcgfHwgcm93Q291bnRDb2x1bW4gPT09IG51bGwpIHJvd0NvdW50Q29sdW1uID0gXCJcIjtcbiAgXG4gIHZhciBzdW1tYXJ5ID0ge307XG4gIFxuICBpZiAocm93Q291bnRDb2x1bW4ubGVuZ3RoID4gMCkge1xuICAgIHN1bW1hcnlbcm93Q291bnRDb2x1bW5dID0gdGFibGUubGVuZ3RoO1xuICB9XG4gIFxuICAvLyBzZXQgbnVtYmVyIGNvbHVtbnMgdG8gMC4wXG4gIGZvciAodmFyIGNvbEluZGV4PTAsIG5Db2xzPWNvbHNUb1N1bS5sZW5ndGg7IGNvbEluZGV4PG5Db2xzOyBjb2xJbmRleCsrKSB7XG4gICAgdmFyIGNvbHVtbiA9IGNvbHNUb1N1bVtjb2xJbmRleF07XG4gICAgc3VtbWFyeVtjb2x1bW5dID0gMC4wO1xuICB9XG4gIFxuICAvLyBzZXQgdGV4dCBjb2x1bW5zIHRvIFwiXCJcbiAgZm9yICh2YXIgY29sSW5kZXg9MCwgbkNvbHM9Y29sc1RvQ29uY2F0Lmxlbmd0aDsgY29sSW5kZXg8bkNvbHM7IGNvbEluZGV4KyspIHtcbiAgICB2YXIgY29sdW1uID0gY29sc1RvQ29uY2F0W2NvbEluZGV4XTtcbiAgICBzdW1tYXJ5W2NvbHVtbl0gPSBcIlwiO1xuICB9XG4gIFxuICBcbiAgZm9yICh2YXIgcm93SW5kZXg9MCwgblJvd3MgPSB0YWJsZS5sZW5ndGg7IHJvd0luZGV4PG5Sb3dzOyByb3dJbmRleCsrKSB7XG4gICAgdmFyIHJvdyA9IHRhYmxlW3Jvd0luZGV4XTtcbiAgICBmb3IgKHZhciBjb2xJbmRleD0wLCBuQ29scz1jb2xzVG9TdW0ubGVuZ3RoOyBjb2xJbmRleDxuQ29sczsgY29sSW5kZXgrKykge1xuICAgICAgdmFyIGNvbHVtbiA9IGNvbHNUb1N1bVtjb2xJbmRleF07XG4gICAgICBzdW1tYXJ5W2NvbHVtbl0gKz0gcm93W2NvbHVtbl07XG4gICAgfVxuICAgIFxuICAgIGZvciAodmFyIGNvbEluZGV4PTAsIG5Db2xzPWNvbHNUb0NvbmNhdC5sZW5ndGg7IGNvbEluZGV4PG5Db2xzOyBjb2xJbmRleCsrKSB7XG4gICAgICB2YXIgY29sdW1uID0gY29sc1RvQ29uY2F0W2NvbEluZGV4XTtcbiAgICAgIGlmIChzdW1tYXJ5W2NvbHVtbl0ubGVuZ3RoID4gMCkge1xuICAgICAgICBzdW1tYXJ5W2NvbHVtbl0gKz0gZGVsaW07XG4gICAgICB9XG4gICAgICBzdW1tYXJ5W2NvbHVtbl0gKz0gcm93W2NvbHVtbl07XG4gICAgfVxuICAgIFxuICB9XG4gIHJldHVybiBzdW1tYXJ5O1xufTtcblxuUm93amFtLnByb3RvdHlwZS5maW5kRmlyc3QgPSBmdW5jdGlvbihjb2x1bW4sIG9wZXJhdG9yLCB2YWx1ZSwgY2FzZVNlbnNpdGl2ZSlcbntcbiAgdmFyIGZvdW5kID0gUm93amFtLm11bHRpcHVycG9zZUZpbHRlcih0aGlzLnZhbHVlLCBjb2x1bW4sIG9wZXJhdG9yLCB2YWx1ZSwgY2FzZVNlbnNpdGl2ZSwgMSk7XG4gIGlmIChmb3VuZC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZvdW5kWzFdWzBdO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5Sb3dqYW0ucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihjb2x1bW4sIG9wZXJhdG9yLCB2YWx1ZSwgY2FzZVNlbnNpdGl2ZSlcbntcbiAgdmFyIGZvdW5kID0gUm93amFtLm11bHRpcHVycG9zZUZpbHRlcih0aGlzLnZhbHVlLCBjb2x1bW4sIG9wZXJhdG9yLCB2YWx1ZSwgY2FzZVNlbnNpdGl2ZSwgMSk7XG4gIHZhciBmb3VuZEluZGV4ID0gZm91bmRbMF07XG4gIHZhciBmb3VuZEFycmF5ID0gZm91bmRbMV07XG4gIFxuICBpZiAoZm91bmRBcnJheS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIGZvdW5kSW5kZXg7XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5Sb3dqYW0ucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbihjb2x1bW4sIG9wZXJhdG9yLCB2YWx1ZSwgY2FzZVNlbnNpdGl2ZSlcbntcbiAgcmV0dXJuIFJvd2phbS5tdWx0aXB1cnBvc2VGaWx0ZXIodGhpcy52YWx1ZSwgY29sdW1uLCBvcGVyYXRvciwgdmFsdWUsIGNhc2VTZW5zaXRpdmUsIDApWzFdO1xufVxuXG5Sb3dqYW0ucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKGNvbHVtbiwgb3BlcmF0b3IsIHZhbHVlLCBjYXNlU2Vuc2l0aXZlKVxue1xuICB2YXIgZm91bmQgPSBSb3dqYW0ubXVsdGlwdXJwb3NlRmlsdGVyKHRoaXMudmFsdWUsIGNvbHVtbiwgb3BlcmF0b3IsIHZhbHVlLCBjYXNlU2Vuc2l0aXZlLCAwKTtcbiAgdGhpcy52YWx1ZSA9IGZvdW5kWzFdO1xuICBcbiAgcmV0dXJuIHRoaXM7XG59XG5cblJvd2phbS5tdWx0aXB1cnBvc2VGaWx0ZXIgPSBmdW5jdGlvbih0YWJsZSwgY29sdW1uLCBvcGVyYXRvciwgdmFsdWUsIGNhc2VTZW5zaXRpdmUsIG1heFRvRmluZClcbntcbiAgdmFyIGZvdW5kID0gW107XG4gIHZhciBudW1Gb3VuZCA9IDA7XG4gIHZhciBtYXRjaENhc2UgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZihjYXNlU2Vuc2l0aXZlKSA9PT0gdW5kZWZpbmVkIHx8IGNhc2VTZW5zaXRpdmUgPT09IG51bGwpIG1hdGNoQ2FzZSA9IHRydWU7XG5cbiAgLy8gdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgdmFyIG9wID0gWyc9PT0nLCAnPScsICc9PScsJzwnLCAnPicsICc8PScsICc+PScsICdlbXB0eScsICdub3RlbXB0eScsICdzdGFydHMnLCAnY29udGFpbnMnXS5pbmRleE9mKG9wZXJhdG9yKTtcbiAgaWYgKHZhbHVlICYmICB0eXBlb2YodmFsdWUpID09PSAnc3RyaW5nJyAmJiBtYXRjaENhc2UpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKCk7XG4gIH1cbiAgXG4gIGZvciAodmFyIGk9MCwgbj10YWJsZS5sZW5ndGg7IGk8bjsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IHRhYmxlW2ldO1xuICAgIHZhciB2YWwgPSByb3dbY29sdW1uXTtcbiAgICBpZiAodmFsICYmIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmIG1hdGNoQ2FzZSkge1xuICAgICAgdmFsID0gdmFsLnRvTG93ZXJDYXNlKHZhbCk7XG4gICAgfVxuICAgIHZhciBrZWVwID0gZmFsc2U7XG4gICAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgMDpcbiAgICBjYXNlIDE6XG4gICAgY2FzZSAyOlxuICAgICAga2VlcCA9IHZhbCA9PT0gdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDM6XG4gICAgICBrZWVwID0gdmFsIDwgdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBrZWVwID0gdmFsID4gdmFsdWU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDU6XG4gICAgICBrZWVwID0gdmFsIDw9IHZhbHVlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSA2OlxuICAgICAga2VlcCA9IHZhbCA+PSB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgNzpcbiAgICAgIGtlZXAgPSBSb3dqYW0uZW1wdHkodmFsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgODpcbiAgICAgIGtlZXAgPSAhUm93amFtLmVtcHR5KHZhbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDk6IFxuICAgICAga2VlcCA9IHZhbC5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMTA6XG4gICAgICBrZWVwID0gdmFsLmluZGV4T2YodmFsdWUpID49IDA7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgXG4gICAgaWYgKGtlZXApIHtcbiAgICAgIG51bUZvdW5kICs9IDE7XG4gICAgICBmb3VuZC5wdXNoKHJvdyk7XG4gICAgICBpZiAobWF4VG9GaW5kID4gMCAmJiBtYXhUb0ZpbmQgPT09IG51bUZvdW5kKSB7XG4gICAgICAgIHJldHVybiBbaSxmb3VuZF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFstMSxmb3VuZF07XG4gIC8vIHRoaXMudmFsdWUgPSBmb3VuZDtcbiAgLy9cbiAgLy8gcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3dqYW0ucHJvdG90eXBlLnRvTG9va3VwID0gZnVuY3Rpb24oa2V5Q29sdW1uKVxue1xuICB2YXIgdGFibGUgPSB0aGlzLnZhbHVlO1xuICBcbiAgdmFyIGxvb2t1cCA9IHt9O1xuICBcbiAgdmFyIG5Sb3dzPXRhYmxlLmxlbmd0aDtcbiAgXG4gIGZvciAodmFyIGk9MDsgaTxuUm93czsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IHRhYmxlW2ldO1xuICAgIHZhciBwcmltYXJ5VmFsdWUgPSByb3dba2V5Q29sdW1uXTtcbiAgICBpZiAobG9va3VwW3ByaW1hcnlWYWx1ZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbG9va3VwW3ByaW1hcnlWYWx1ZV0gPSBbcm93XTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9va3VwW3ByaW1hcnlWYWx1ZV0ucHVzaChyb3cpO1xuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGxvb2t1cDtcbn07XG5cblJvd2phbS5wcm90b3R5cGUuam9pbkFzQXJyYXkgPSBmdW5jdGlvbihzYXZlQ29sdW1uLCBzcmNDb2x1bW4sIGpvaW5UYWJsZSwgam9pbkNvbHVtbilcbntcbiAgdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgdmFyIGxvb2t1cCA9IG5ldyBSb3dqYW0oam9pblRhYmxlKS50b0xvb2t1cChqb2luQ29sdW1uKTtcbiAgXG4gIGZvciAodmFyIGk9MCwgbj10YWJsZS5sZW5ndGg7IGk8bjsgaSsrKSB7XG4gICAgdmFyIHJvdyA9IHRhYmxlW2ldO1xuICAgIHZhciByb3dJZCA9IHJvd1tzcmNDb2x1bW5dO1xuICAgIHZhciBqb2luZWRBcnIgPSBsb29rdXBbcm93SWRdO1xuICAgIGlmIChqb2luZWRBcnIgJiYgam9pbmVkQXJyICE9IHVuZGVmaW5lZCkge1xuICAgICAgcm93W3NhdmVDb2x1bW5dID0gam9pbmVkQXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3dbc2F2ZUNvbHVtbl0gPSBbXTtcbiAgICB9XG4gIH1cbiAgXG4gIHRoaXMudmFsdWUgPSB0YWJsZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5Sb3dqYW0ucHJvdG90eXBlLmpvaW5Bc1N1bW1hcnkgPSBmdW5jdGlvbihzYXZlQ29sdW1uLCBzcmNDb2x1bW4sIGpvaW5UYWJsZSwgam9pbkNvbHVtbiwgY29sc1RvU3VtLCBjb2xzVG9Db25jYXQsIGRlbGltLCByb3dDb3VudENvbHVtbilcbntcbiAgdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgdmFyIGxvb2t1cCA9IG5ldyBSb3dqYW0oam9pblRhYmxlKS50b0xvb2t1cChqb2luQ29sdW1uKTtcbiAgaWYgKGNvbHNUb1N1bSA9PT0gdW5kZWZpbmVkKSB7Y29sc1RvU3VtID0gW119O1xuICBpZiAoY29sc1RvQ29uY2F0ID09PSB1bmRlZmluZWQpIHtjb2xzVG9Db25jYXQgPSBbXX07XG4gIGlmIChkZWxpbSA9PT0gdW5kZWZpbmVkKSB7ZGVsaW0gPSBcIlxcblwifVxuICBcbiAgZm9yICh2YXIgaT0wLCBuPXRhYmxlLmxlbmd0aDsgaTxuOyBpKyspIHtcbiAgICB2YXIgcm93ID0gdGFibGVbaV07XG4gICAgdmFyIHJvd0lkID0gcm93W3NyY0NvbHVtbl07XG4gICAgdmFyIGpvaW5lZEFyciA9IGxvb2t1cFtyb3dJZF07XG4gICAgaWYgKGpvaW5lZEFyciA9PSB1bmRlZmluZWQpIHtcbiAgICAgIGpvaW5lZEFyciA9IFtdO1xuICAgIH1cbiAgIHZhciBzdW1tYXJ5ID0gbmV3IFJvd2phbShqb2luZWRBcnIpLnN1bW1hcml6ZShjb2xzVG9TdW0sIGNvbHNUb0NvbmNhdCwgZGVsaW0sIHJvd0NvdW50Q29sdW1uKTtcbiAgIGlmIChzYXZlQ29sdW1uLmxlbmd0aCA9PT0gMCkge1xuICAgICBSb3dqYW0ubWVyZ2VQcm9wZXJ0aWVzKHJvdywgc3VtbWFyeSk7XG4gICB9IGVsc2Uge1xuICAgICByb3dbc2F2ZUNvbHVtbl0gPSBzdW1tYXJ5O1xuICAgfVxuICB9XG4gIFxuICB0aGlzLnZhbHVlID0gdGFibGU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLypcbiAgdGFrZXMgYW4gYXJyYXkgb2Yga2V5cyBba2V5MSwga2V5Miwga2V5M10gIGFuZCBmbGF0dGVucyBkYXRhIGZyb20gW3trZXkxOnZhbHVlLGtleTI6dmFsdWUsa2V5Mzp2YWx1ZX1dIHRvIFtbdmFsdWUsdmFsdWUsdmFsdWVdLFt2YWx1ZSx2YWx1ZSx2YWx1ZV1dIGluIHRoZSBvcmRlciBvZiBnaXZlbiBrZXlzLlxuKi9cblJvd2phbS5wcm90b3R5cGUuZmxhdHRlbl9yb3dzID0gZnVuY3Rpb24oa2V5cykge1xuICB2YXIgdGFibGUgPSB0aGlzLnZhbHVlO1xuICB2YXIgb3V0QXJyYXkgPSBbXTtcbiAgaWYgKCFrZXlzKSB7XG4gICAgcmV0dXJuIHRoaXMuZmxhdHRlbl9lYWNoX3JvdygpO1xuICB9XG4gIHZhciBuS2V5cyA9IGtleXMubGVuZ3RoO1xuICBmb3IgKHZhciBpPTA7IGk8dGFibGUubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcm93ID0gdGFibGVbaV07XG4gICAgdmFyIGFycmF5Um93ID0gW107ICAgIFxuICAgIGZvciAodmFyIGs9MDsgazxuS2V5czsgaysrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1trXTtcbiAgICAgIGFycmF5Um93LnB1c2gocm93W2tleV0pO1xuICAgIH1cbiAgICBvdXRBcnJheS5wdXNoKGFycmF5Um93KTtcbiAgfVxuICByZXR1cm4gb3V0QXJyYXk7XG59XG5cblJvd2phbS5wcm90b3R5cGUuZmxhdHRlbl9lYWNoX3JvdyA9IGZ1bmN0aW9uKClcbntcbiAgdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgdmFyIG91dEFycmF5ID0gW107XG4gIGZvciAodmFyIGk9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciByb3cgPSB0YWJsZVtpXTtcbiAgICB2YXIgYXJyYXlSb3cgPSBbXTsgICAgXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhyb3cpO1xuICAgIHZhciBuS2V5cyA9IGtleXMubGVuZ3RoO1xuICAgIFxuICAgIGZvciAodmFyIGs9MDsgazxuS2V5czsgaysrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1trXTtcbiAgICAgIGFycmF5Um93LnB1c2gocm93W2tleV0pO1xuICAgIH1cbiAgICBvdXRBcnJheS5wdXNoKGFycmF5Um93KTtcbiAgfVxuICByZXR1cm4gb3V0QXJyYXk7XG59XG5cblxuUm93amFtLmNzdlZhbHVlID0gZnVuY3Rpb24odmFsLCBkZWxpbSkge1xuICBpZiAoIXZhbClcbiAgICByZXR1cm4gJyc7XG4gIHZhbCA9IHZhbC50b1N0cmluZygpO1xuICBpZiAoKHZhbC5pbmRleE9mKGRlbGltKSA9PT0gLTEpICYmIHZhbC5pbmRleE9mKCdcIicpID09PSAtMSlcbiAgICByZXR1cm4gdmFsO1xuICByZXR1cm4gJ1wiJyArIHZhbCArICdcIic7XG59XG5cblJvd2phbS5wcm90b3R5cGUudG9fY3N2ID0gZnVuY3Rpb24oa2V5cywgZGlzcGxheUhlYWRlcnMpIHtcbiAgdmFyIHRhYmxlID0gdGhpcy52YWx1ZTtcbiAgdmFyIGNvbEhlYWRlckFyciA9IFtdO1xuICB2YXIgY3N2QXJyID0gW107XG4gIHZhciB0ZXh0ID0gXCJcIjtcbiAgdmFyIG5LZXlzID0ga2V5cy5sZW5ndGg7XG4gIHZhciBkZWxpbSA9IFwiLFwiO1xuICBcbiAgLy8gc2V0IHVwIGNvbHVtbiBoZWFkZXJzXG4gIGZvciAodmFyIGk9MDsgaTxuS2V5czsgaSsrKSB7XG4gICAgY29sSGVhZGVyQXJyLnB1c2goIFJvd2phbS5jc3ZWYWx1ZShkaXNwbGF5SGVhZGVyc1tpXSkgKTtcbiAgfVxuICBcbiAgLy8gcHJvY2VzcyBkYXRhIGludG8gY3N2QXJyXG4gIGZvciAodmFyIGk9MDsgaTx0YWJsZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciByb3cgPSB0YWJsZVtpXTtcbiAgICB2YXIgYXJyYXlSb3cgPSBbXTtcbiAgICBmb3IgKHZhciBrPTA7IGs8bktleXM7IGsrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNba107XG4gICAgICBhcnJheVJvdy5wdXNoKFJvd2phbS5jc3ZWYWx1ZShyb3dba2V5XSwgZGVsaW0pKTtcbiAgICB9XG4gICAgY3N2QXJyLnB1c2goYXJyYXlSb3cpO1xuICB9XG4gICAgXG4gIC8vIGNyZWF0ZSB0ZXh0IG91dHB1dFxuICB0ZXh0ICs9IFwiZGF0YTp0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04LFwiO1xuICB0ZXh0ICs9IGNvbEhlYWRlckFyci5qb2luKGRlbGltKTtcbiAgdGV4dCArPSBcIlxcblwiO1xuICBmb3IgKHZhciBpPTA7IGk8Y3N2QXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgdGV4dCArPSBjc3ZBcnJbaV0uam9pbihkZWxpbSk7XG4gICAgdGV4dCArPSBcIlxcblwiO1xuICB9XG4gIHRleHQgKz0gXCJcXG5cIjtcbiBcbiAgcmV0dXJuIHRleHQ7XG59XG5cblJvd2phbS5zYXZlQXNDc3YgPSBmdW5jdGlvbiggY3N2RGF0YSwgZmlsZW5hbWUgKSB7XG4gIGRhdGEgPSBlbmNvZGVVUkkoY3N2RGF0YSk7XG4gIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywgZGF0YSk7XG4gIGxpbmsuc2V0QXR0cmlidXRlKCdkb3dubG9hZCcsIGZpbGVuYW1lICk7XG4gIGxpbmsuY2xpY2soKTtcbn1cblxuUm93amFtLnByb3RvdHlwZS50b19qc29uID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnZhbHVlKTtcbn1cblxuUm93amFtLnByb3RvdHlwZS5kdW1wID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHRoaXMudmFsdWUsIG51bGwsIDQpKTtcbiAgXG4gIHJldHVybiB0aGlzO1xufVxuXG5Sb3dqYW0ucHJpbnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDQpKTsgIFxufVxuXG5Sb3dqYW0ucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKGNvbHVtbiwgdW5pcXVlKSB7XG4gIHZhciB0YWJsZSA9IHRoaXMudmFsdWU7XG4gIGlmICh0eXBlb2YodW5pcXVlKSA9PT0gJ3VuZGVmaW5lZCcgfHwgdW5pcXVlID09PSBudWxsKSB1bmlxdWUgPSB0cnVlO1xuICBcbiAgdmFyIGxvb2t1cCA9IG5ldyBTZXQoKTtcbiAgXG4gIHZhciBmb3VuZCA9IFtdO1xuICBcbiAgZm9yICh2YXIgcm93SW5kZXg9MCwgblJvd3MgPSB0YWJsZS5sZW5ndGg7IHJvd0luZGV4PG5Sb3dzOyByb3dJbmRleCsrKSB7XG4gICAgdmFyIHJvdyA9IHRhYmxlW3Jvd0luZGV4XTtcbiAgICB2YXIgdmFsdWUgPSByb3dbY29sdW1uXTtcbiAgICBcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICh1bmlxdWUgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKCFsb29rdXAuaGFzKHZhbHVlKSkge1xuICAgICAgICAgIGZvdW5kLnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGxvb2t1cC5hZGQodmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmQucHVzaCh2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBmb3VuZDtcbn1cblxuXG5Sb3dqYW0ubWVyZ2VQcm9wZXJ0aWVzID0gZnVuY3Rpb24odGFyZ2V0LCBzcmMpIHtcbiAgZm9yICh2YXIgcHJvcCBpbiBzcmMpIHtcbiAgICB0YXJnZXRbcHJvcF0gPSBzcmNbcHJvcF07XG4gIH1cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuUm93amFtLmVtcHR5ID0gZnVuY3Rpb24oZGF0YSlcbntcbiAgaWYodHlwZW9mKGRhdGEpID09ICdudW1iZXInIHx8IHR5cGVvZihkYXRhKSA9PSAnYm9vbGVhbicpXG4gIHsgXG4gICAgcmV0dXJuIGZhbHNlOyBcbiAgfVxuICBpZih0eXBlb2YoZGF0YSkgPT0gJ3VuZGVmaW5lZCcgfHwgZGF0YSA9PT0gbnVsbClcbiAge1xuICAgIHJldHVybiB0cnVlOyBcbiAgfVxuICBpZih0eXBlb2YoZGF0YS5sZW5ndGgpICE9ICd1bmRlZmluZWQnKVxuICB7XG4gICAgcmV0dXJuIGRhdGEubGVuZ3RoID09IDA7XG4gIH1cbiAgZm9yKHZhciBpIGluIGRhdGEpXG4gIHtcbiAgICBpZihkYXRhLmhhc093blByb3BlcnR5KGkpKVxuICAgIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cblJvd2phbS5jb3B5VmFsdWUgPSBmdW5jdGlvbihvbGRPYmopIHtcbiAgICB2YXIgbmV3T2JqID0gb2xkT2JqO1xuICAgIGlmIChvbGRPYmogJiYgdHlwZW9mIG9sZE9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbmV3T2JqID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9sZE9iaikgPT09IFwiW29iamVjdCBBcnJheV1cIiA/IFtdIDoge307XG4gICAgICAgIGZvciAodmFyIGkgaW4gb2xkT2JqKSB7XG4gICAgICAgICAgICBuZXdPYmpbaV0gPSBSb3dqYW0uY29weVZhbHVlKG9sZE9ialtpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ld09iajtcbn1cblxuXG5Sb3dqYW0ucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbihzb3J0T3B0aW9uQXJyYXkpIHtcbiAgdGhpcy52YWx1ZS5zb3J0KGZ1bmN0aW9uKGEsYikge1xuICAgIGZvciAodmFyIGk9MDsgaTwgc29ydE9wdGlvbkFycmF5Lmxlbmd0aDsgaSs9Mikge1xuICAgICAgdmFyIGNvbCA9IHNvcnRPcHRpb25BcnJheVtpXTtcbiAgICAgIHZhciBkaXJlY3Rpb24gPSBzb3J0T3B0aW9uQXJyYXlbaSsxXSA9PT0gJ2Rlc2MnPyAtMSA6IDE7XG4gICAgICByZXN1bHQgPSBhW2NvbF0+Yltjb2xdID8gMSA6IChhW2NvbF08Yltjb2xdPyAtMSA6IDApO1xuICAgICAgaWYgKHJlc3VsdCAhPSAwKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQgKiBkaXJlY3Rpb247XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwO1xuICB9KTtcbiAgXG4gIHJldHVybiB0aGlzO1xufVxuIiwidmFyIHJpb3QgPSByZXF1aXJlKCdyaW90Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJpb3QudGFnMignYWpheC1wYWdlJywgJzxkaXY+IDxwPk1vc3QgZGF0YSBsaXZlcyBvbiB0aGUgc2VydmVyLiBNb3N0IGZyb250LWVuZCBqYXZhc2NyaXB0IGFwcGxpY2F0aW9ucyBoYXZlIHRvIGdvIGdldCB0aGF0IGRhdGEgYW5kIGRpc3BsYXkgaXQgZm9yIHRoZSB1c2VyLjwvcD4gPHA+VGhlcmUgYXJlIGRvemVucyBvZiBsaWJyYXJpZXMgYW5kIG1vZHVsZXMgdG8gaGVscCB5b3UgZG8gdGhlc2Uga2luZHMgb2YgcXVlcmllcy4gVGhpcyBwYWdlIHdpbGwgdXNlIG9uZSBjYWxsZWQgPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9kaW1pdHJpbmljb2xhcy9tYXJtb3R0YWpheFwiPk1hcm1vdHRBamF4PC9hPi4gSXQgaXMgb25lIG9mIG15IGZhdm9yaXRlcyBiZWNhdXNlIGl0IGlzIHRpbnksIGVhc3kgdG8gdXNlLCBhbmQgZW1wbG95cyBhIHByb21pc2Ugc3RydWN0dXJlIHdpdGggaXRzIHN5bnRheC4gSWYgeW91IGRvblxcJ3Qga25vdyB3aGF0IHByb21pc2VzIGFyZSwgPGEgaHJlZj1cImh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2VzNi9wcm9taXNlcy9cIj5yZWFkIGFib3V0IHRoZW0uPC9hPjwvcD4gPHA+SGVyZSBpcyB0aGUgc2ltcGxlIHRhYmxlIGZyb20gdGhlIFwiUmVuZGVyaW5nIFRhYmxlc1wiIHBhZ2UuIEhvd2V2ZXIsIHRoZSBkYXRhIHRoYXQgYnVpbGRzIHRoZSB0YWJsZSBpcyByZXRyaWV2ZWQgYXMgSlNPTiBmcm9tIHRoZSBzZXJ2ZXIsIGluc3RlYWQgb2YgYmVpbmcgZGVjbGFyZWQgaW4gdGhlIHNjcmlwdCBvZiB0aGUgdGFnLjwvcD4gPHRhYmxlIGNsYXNzPVwic2ltcGxlXCI+IDx0cj4gPHRoPkluZGV4PC90aD4gPHRoPkZpcnN0PC90aD4gPHRoPkxhc3Q8L3RoPiA8dGg+UGhvbmU8L3RoPiA8dGg+Q2l0eTwvdGg+IDx0aD5TdGF0ZTwvdGg+IDx0aD5aaXA8L3RoPiA8L3RyPiA8dHIgZWFjaD1cIntyb3csIGluZGV4IGluIHJvd3N9XCI+IDx0ZD57aW5kZXggKyAxfTwvdGQ+IDx0ZD57cm93LkZJUlNUfTwvdGQ+IDx0ZD57cm93LkxBU1R9PC90ZD4gPHRkPntyb3cuUEhPTkV9PC90ZD4gPHRkPntyb3cuQ0lUWX08L3RkPiA8dGQ+e3Jvdy5TVEFURX08L3RkPiA8dGQ+e3Jvdy5aSVB9PC90ZD4gPC90cj4gPC90YWJsZT4gPGJyPiA8cD5IZXJlXFwncyB0aGUgc2NyaXB0IHRoYXQgcmV0cmlldmVzIHRoZSBkYXRhIGZyb20gdGhlIHNlcnZlcjo8L3A+IDxjb2RlLWRpc3BsYXkgZmlsZW5hbWU9XCJleGFtcGxlcy9hamF4LXBhZ2UudGFnXCIgZmlyc3RsaW5lPVwiNTNcIiBsYXN0bGluZT1cIjc0XCIgbGFuZz1cImphdmFzY3JpcHRcIj48L2NvZGUtZGlzcGxheT4gPHA+IFdlIHN0YXJ0IHRoZSBBamF4IHF1ZXJ5IG9uIHRoZSA8Yj5cXCdtb3VudFxcJzwvYj4gZXZlbnQuIE9uY2UgdGhlIG1vdW50IGV2ZW50IGlzIHJlY2VpdmVkLCB3ZSBrbm93IHRoYXQgdGhlIERPTSBoYXMgYmVlbiBsb2FkZWQgaW50byB0aGUgcGFnZS4gVGhpcyByZW1vdmVzIGFueSByYWNlIGNvbmRpdGlvbnMgZnJvbSB0aGUgY29kZS4gKEJhZCBSYWNlIENvbmRpdGlvbjogd2UgZ2V0IHRoZSBkYXRhLCBidXQgdGhlIERPTSBoYXNuXFwndCBiZWVuIGxvYWRlZCwgc28gcmVuZGVyaW5nIHRoZSB0YWJsZSBmYWlscy4pIDwvcD4gPHA+V2UgY3JlYXRlIGEgTWFybW90dEFqYXggcmVxdWVzdCwgd2l0aCB0aGUgdXJsIDxhIGhyZWY9XCIvY29udGFjdC1kYXRhLmpzb25cIj4vY29udGFjdC1kYXRhLmpzb248L2E+LiBPbmNlIHRoZSBkYXRhIGhhcyBiZWVuIGRvd25sb2FkZWQsIHRoZSBmdW5jdGlvbiBpbiB0aGUgPGI+dGhlbjwvYj4gY2FsbGJhY2sgZmlyZXMuPC9wPiA8cD5JbiB0aGUgY2FsbGJhY2ssIHdlIHBhcnNlIHRoZSBKU09OIHRleHR1YWwgZGF0YSBpbnRvIG5vcm1hbCBqYXZhc2NyaXB0IGRhdGEuIFdlIGFsc28gYXNzaWduIHRoaXMgZGF0YSB0byBhIHByb3BlcnR5IG9mIHRoZSBUYWcgaW5zdGFuY2U6PC9wPiA8Y29kZS1lbWJlZCBjb250ZW50PVwidGhpc1RhZy5yb3dzID0gSlNPTi5wYXJzZShqc29uKTtcIiBsYW5nPVwiaHRtbFwiPjwvY29kZS1lbWJlZD4gPHA+VGhpcyBtYWtlcyB0aGUgPGI+cm93czwvYj4gcHJvcGVydHkgYWNjZXNzaWJsZSBmcm9tIHRoZSBtYXJrdXAuIEZpbmFsbHksIHdlIGNhbGwgPGI+dXBkYXRlKCk8L2I+IG9uIHRoZSB0YWcgaW5zdGFuY2UgdG8gdGVsbCBpdCB0byByZWRyYXcgaXRzZWxmLCByZW5kZXJpbmcgdGhlIHRhYmxlIHdpdGggZGF0YS48L3A+IDxjb2RlLWVtYmVkIGNvbnRlbnQ9XCJ0aGlzVGFnLnVwZGF0ZSgpO1wiIGxhbmd1YWdlPVwiamF2YXNjcmlwdFwiPjwvY29kZS1lbWJlZD4gPGJyPiA8cD5UaGUgSFRNTCBtYXJrdXAgaXMgcHJldHR5IG11Y2ggdGhlIHNhbWUgYXMgaXQgd2FzIG9uIHRoZSA8YSBocmVmPVwiLyMvcGFnZXMvcmVuZGVyaW5nLXRhYmxlcy1wYWdlXCI+UmVuZGVyaW5nIFRhYmxlczwvYT4gcGFnZS48L3A+IDxjb2RlLWRpc3BsYXkgZmlsZW5hbWU9XCJleGFtcGxlcy9hamF4LXBhZ2UudGFnXCIgZmlyc3RsaW5lPVwiOFwiIGxhc3RsaW5lPVwiMjhcIj4vY29kZS1kaXNwbGF5PiA8L2Rpdj4nLCAnYWpheC1wYWdlIHRhYmxlLnNpbXBsZSB0ZCxbcmlvdC10YWc9XCJhamF4LXBhZ2VcIl0gdGFibGUuc2ltcGxlIHRkLFtkYXRhLWlzPVwiYWpheC1wYWdlXCJdIHRhYmxlLnNpbXBsZSB0ZCxhamF4LXBhZ2UgdGFibGUgdGgsW3Jpb3QtdGFnPVwiYWpheC1wYWdlXCJdIHRhYmxlIHRoLFtkYXRhLWlzPVwiYWpheC1wYWdlXCJdIHRhYmxlIHRoeyBwYWRkaW5nOjEwcHg7IHRleHQtYWxpZ246IGxlZnQ7IH0gYWpheC1wYWdlIHRhYmxlLnNpbXBsZSB0cjpudGgtY2hpbGQoZXZlbiksW3Jpb3QtdGFnPVwiYWpheC1wYWdlXCJdIHRhYmxlLnNpbXBsZSB0cjpudGgtY2hpbGQoZXZlbiksW2RhdGEtaXM9XCJhamF4LXBhZ2VcIl0gdGFibGUuc2ltcGxlIHRyOm50aC1jaGlsZChldmVuKXsgYmFja2dyb3VuZC1jb2xvcjogI2VlZTsgfScsICcnLCBmdW5jdGlvbihvcHRzKSB7XG5cdFx0dmFyIHRoaXNUYWcgPSB0aGlzO1xuXHRcdHZhciBtYXJtb3R0QWpheCA9IHJlcXVpcmUoJ21hcm1vdHRhamF4Jyk7XG5cblx0XHR0aGlzVGFnLm9uKCdtb3VudCcsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRtYXJtb3R0QWpheCh7dXJsOiAnY29udGFjdC1kYXRhLmpzb24nLCBtZXRob2Q6ICdnZXQnfSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKGpzb24pIHtcblxuXHRcdFx0XHR0aGlzVGFnLnJvd3MgPSBKU09OLnBhcnNlKGpzb24pO1xuXG5cdFx0XHRcdHRoaXNUYWcudXBkYXRlKCk7XG5cdFx0XHR9KVxuXHRcdH0pO1xufSk7IiwidmFyIHJpb3QgPSByZXF1aXJlKCdyaW90Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJpb3QudGFnMignbG9naW4tcGFnZScsICc8ZGl2IGNsYXNzPVwiYWx0Ym9keVwiPiA8aDE+TG9naW4gUGFnZTwvaDE+IDxmb3JtLWVuZ2luZSBpZD1cImZvcm0xXCI+PC9mb3JtLWVuZ2luZT4gPC9kaXY+JywgJycsICcnLCBmdW5jdGlvbihvcHRzKSB7XG5cdFx0dmFyIHRoaXNUYWcgPSB0aGlzXG5cdFx0dmFyIHV0aWxzID0gcmlvdC5taXhpbihcInV0aWxzXCIpXG5cblx0XHR0aGlzVGFnLm9uKCdtb3VudCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0Y29uc29sZS5sb2codGhpc1RhZy5mb3JtRW5naW5lKVxuXHRcdFx0dmFyIGZvcm0gPSB0aGlzVGFnLnRhZ3NbJ2Zvcm0tZW5naW5lJ11cblx0XHRcdGNvbnNvbGUubG9nKFwiZm9ybVwiLCBmb3JtKVxuXHRcdFx0dmFyIGZ0YWcgPSB1dGlscy5nZXRUYWdCeUlkKHRoaXNUYWcsICdmb3JtMScpXG5cdFx0XHRjb25zb2xlLmxvZyhcImZvdW5kIHRhZ1wiLCBmdGFnKVxuXHRcdFx0ZnRhZy5hZGRGaWVsZCgnZmlyc3QnLCd0ZXh0JywnRmlyc3QgTmFtZScsNDApXG5cdFx0XHRmdGFnLmFkZEZpZWxkKCdsYXN0JywndGV4dCcsJ0xhc3QgTmFtZScsNDApXG5cdFx0XHRmdGFnLnN0YXJ0KClcblx0XHR9KVxufSk7IiwidmFyIHJpb3QgPSByZXF1aXJlKCdyaW90Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJpb3QudGFnMignb3ZlcnZpZXctcGFnZScsICc8ZGl2PiBIZWxsbyB0aGlzIGlzIFZpbmVlbC4gPC9kaXY+JywgJycsICcnLCBmdW5jdGlvbihvcHRzKSB7XG59KTtcbiIsInZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ3NpbXBsZS1wYWdlJywgJzxkaXY+IFRoaXMgaXMgYSBzaW1wbGUgUEFHRS4gPC9kaXY+JywgJ3NpbXBsZS1wYWdlIGRpdixbcmlvdC10YWc9XCJzaW1wbGUtcGFnZVwiXSBkaXYsW2RhdGEtaXM9XCJzaW1wbGUtcGFnZVwiXSBkaXZ7IGZvbnQtZmFtaWx5OiBBcmlhbDsgZm9udC1zaXplOiAxMnB4OyB9JywgJycsIGZ1bmN0aW9uKG9wdHMpIHtcbn0pOyIsInZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ3NsaWRlLXBhZ2UnLCAnPGdhbGxlcnk+PC9nYWxsZXJ5PiA8ZGl2IGlkPVwiYm94XCI+IDxkaXYgZWFjaD1cIntmYW1pbHksIGluZGV4IGluIGZhbWlsaWVzfVwiPiA8ZGl2IGNsYXNzPVwiZmFtaWx5X25hbWVcIj57ZmFtaWx5LmRpc3BsYXlfbmFtZX08L2Rpdj4gPGRpdiBjbGFzcz1cImZhbWlseV90aHVtYnNcIj4gPGRpdiBlYWNoPVwie2Fzc2V0IGluIHBhcmVudC5hc3NldHNCeUZhbWlseVtmYW1pbHkuZmFtaWx5X2V4dGlkXX1cIiBjbGFzcz1cInBsYWNlaG9sZGVyXCIgaWQ9XCJ7YXNzZXQuaWR9XCIgb25jbGljaz1cInt0YXBUaHVtYn1cIj4gPGltZyByaW90LXNyYz1cInt3aW5kb3cuTUVESUFfU0VSVkVSX1BSRUZJWCArIOKBl3RodW1icy/igZcgKyBhc3NldC5zaXplMV91cmx9XCI+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+IDwvZGl2PicsICdzbGlkZS1wYWdlICNib3gsW3Jpb3QtdGFnPVwic2xpZGUtcGFnZVwiXSAjYm94LFtkYXRhLWlzPVwic2xpZGUtcGFnZVwiXSAjYm94eyBib3JkZXI6IDJweCBzb2xpZCAjYWEwOyBiYWNrZ3JvdW5kLWNvbG9yOiMwMDA7IGNvbG9yOiNkZGQ7IH0gc2xpZGUtcGFnZSAuZmFtaWx5X25hbWUsW3Jpb3QtdGFnPVwic2xpZGUtcGFnZVwiXSAuZmFtaWx5X25hbWUsW2RhdGEtaXM9XCJzbGlkZS1wYWdlXCJdIC5mYW1pbHlfbmFtZXsgZm9udC1mYW1pbHk6IFwiSGVsdmV0aWNhIE51ZXVlXCIsIFwiQXJpYWxcIjsgZm9udC1zaXplOjE4cHg7IG1hcmdpbi10b3A6MjBweDsgfSBzbGlkZS1wYWdlIC5mYW1pbHlfdGh1bWJzLFtyaW90LXRhZz1cInNsaWRlLXBhZ2VcIl0gLmZhbWlseV90aHVtYnMsW2RhdGEtaXM9XCJzbGlkZS1wYWdlXCJdIC5mYW1pbHlfdGh1bWJzeyBkaXNwbGF5OiBmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6IGxlZnQ7IGZsZXgtZGlyZWN0aW9uOiByb3c7IGZsZXgtd3JhcDogd3JhcDsgfSBzbGlkZS1wYWdlIC5wbGFjZWhvbGRlcixbcmlvdC10YWc9XCJzbGlkZS1wYWdlXCJdIC5wbGFjZWhvbGRlcixbZGF0YS1pcz1cInNsaWRlLXBhZ2VcIl0gLnBsYWNlaG9sZGVyeyB3aWR0aDogMjAwcHg7IGhlaWdodDogMjAwcHg7IGJhY2tncm91bmQtY29sb3I6ICNhYWE7IG1hcmdpbi1yaWdodDogMnB4OyBtYXJnaW4tYm90dG9tOiAycHg7IH0gc2xpZGUtcGFnZSAucGxhY2Vob2xkZXIgaW1nLFtyaW90LXRhZz1cInNsaWRlLXBhZ2VcIl0gLnBsYWNlaG9sZGVyIGltZyxbZGF0YS1pcz1cInNsaWRlLXBhZ2VcIl0gLnBsYWNlaG9sZGVyIGltZ3sgd2lkdGg6IDIwMHB4OyBoZWlnaHQ6IDIwMHB4OyB9JywgJycsIGZ1bmN0aW9uKG9wdHMpIHtcbiAgICB2YXIgdGhpc1RhZyA9IHRoaXNcbiAgICB2YXIgcm93amFtID0gcmVxdWlyZSgncm93amFtJylcbiAgICB2YXIgbm90aWZpY2F0aW9uQ2VudGVyID0gcmlvdC5taXhpbignbm90aWZpY2F0aW9uX2NlbnRlcicpO1xuXG4gICAgdGhpcy50YXBUaHVtYiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidGFwIHRodW1iIVwiLCBlKVxuICAgICAgdmFyIHRhcEFzc2V0SWQgPSBlLml0ZW0uYXNzZXQuYXNzZXRfaWRcbiAgICAgIG5vdGlmaWNhdGlvbkNlbnRlci5zZW5kKCdnb3RfZGF0YScsIHRoaXNUYWcuYXNzZXRzLCB0YXBBc3NldElkKVxuICAgIH0uYmluZCh0aGlzKVxuXG4gICAgdmFyIHByb2Nlc3NEYXRhID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdGhpc1RhZy5kYXRhID0gZGF0YTtcbiAgICAgIHRoaXNUYWcuYXNzZXRzID0gZGF0YS5hc3NldHM7XG4gICAgICB0aGlzVGFnLmFjY291bnQgPSBkYXRhLmFjY291bnQ7XG4gICAgICB0aGlzVGFnLmZhbWlsaWVzID0gZGF0YS5mYW1pbGllcztcblxuICAgICAgdmFyIGphbSA9IHJvd2phbShkYXRhLmFzc2V0cywgdHJ1ZSk7XG4gICAgICB0aGlzVGFnLmFzc2V0c0J5RmFtaWx5ID0gamFtLnRvTG9va3VwKFwiZmFtaWx5X2V4dGlkXCIpXG5cbiAgICAgIHRoaXNUYWcuZmFtaWx5S2V5cyA9IGphbS52YWx1ZXMoJ2ZhbWlseV9leHRpZCcsIHRydWUpO1xuXG4gICAgfVxuXG4gICAgdmFyIGdldFNsaWRlRGF0YSA9IGZ1bmN0aW9uKHNyY0VtYWlsLCBkYXlTdHIpIHtcbiAgICAgICQuZ2V0SlNPTiggd2luZG93LkFQSV9TRVJWRVJfUFJFRklYICsgXCJhcGkucGhwL3NsaWRlc2hvd1wiLFxuICAgICAgICB7XG4gICAgICAgICAgZW1haWw6IHNyY0VtYWlsLFxuICAgICAgICAgIGRheTogZGF5U3RyXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKCBkYXRhICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZGF0YVwiLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cbiAgICAgICAgICBwcm9jZXNzRGF0YShkYXRhKTtcblxuICAgICAgICAgIHRoaXNUYWcudXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG5cbiAgICB0aGlzLm9uKCdtb3VudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgZ2V0U2xpZGVEYXRhKCd2aW5lZWxAdmluZWVsLmNvbScsICcyMDE2LTA1LTExJyk7XG4gICAgfSlcbn0pOyIsInZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ2FwcCcsICc8ZGl2PiA8ZGl2IGlkPVwiY29udGVudFwiPjwvZGl2PiA8L2Rpdj4nLCAnJywgJycsIGZ1bmN0aW9uKG9wdHMpIHtcblxuXHRcdHZhciB0aGlzVGFnID0gdGhpcztcblxuXHRcdHJpb3Qucm91dGUuc3RhcnQodHJ1ZSk7XG5cblx0XHRyaW90LnJvdXRlLmJhc2UoJyMvJylcblxuXHRcdHRoaXNUYWcub24oJ21vdW50JywgZnVuY3Rpb24oKSB7XG5cblx0XHRcdHJpb3Qucm91dGUoJy8nLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmlvdC5yb3V0ZSgnL3BhZ2VzL3NpbXBsZS1wYWdlJyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmlvdC5yb3V0ZSgnL3BhZ2VzLyonLCBmdW5jdGlvbih0YWdOYW1lKSB7XG5cblx0XHRcdFx0cmlvdC5tb3VudCh0aGlzVGFnLmNvbnRlbnQsIHRhZ05hbWUsIG51bGwpO1xuXHRcdFx0fSk7XG5cblx0XHR9KTtcblxuXHRcdHZhciBub3RpZmljYXRpb25DZW50ZXIgPSB7XG5cdFx0ICBub3RpZmljYXRpb25zOiByaW90Lm9ic2VydmFibGUoKSxcblx0XHQgIGxpc3RlblRvOiBmdW5jdGlvbiAoZXZlbnRTdHIsIGV2ZW50Rm4pIHtcblx0XHQgICAgdGhpcy5ub3RpZmljYXRpb25zLm9uKGV2ZW50U3RyLCBldmVudEZuKTtcblx0XHQgIH0sXG5cdFx0ICBzZW5kOiBmdW5jdGlvbihldmVudFN0ciwgcDEsIHAyLCBwMykge1xuXHRcdCAgICB0aGlzLm5vdGlmaWNhdGlvbnMudHJpZ2dlcihldmVudFN0ciwgcDEsIHAyLCBwMyk7XG5cdFx0ICB9XG5cdFx0fTtcblxuXHRcdHJpb3QubWl4aW4oXCJub3RpZmljYXRpb25fY2VudGVyXCIsIG5vdGlmaWNhdGlvbkNlbnRlcik7XG5cblx0XHR2YXIgdXRpbHMgPSB7XG5cdFx0XHRnZXRUYWdCeUlkOiBmdW5jdGlvbihjb250ZXh0LCB0YWdJZCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInRoaXMudGFnc1wiLCBjb250ZXh0LnRhZ3MpXG5cdFx0XHRcdGZvciAodmFyIHRhZ1R5cGUgaW4gY29udGV4dC50YWdzKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ0YWdUeXBlXCIsIHRhZ1R5cGUpXG5cdFx0XHRcdFx0dmFyIHRhZ3NPZlR5cGUgPSBjb250ZXh0LnRhZ3NbdGFnVHlwZV1cblx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0YWdzT2ZUeXBlKSkge1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaT0wOyBpPHRhZ3NPZlR5cGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0dmFyIHQgPSB0YWdzT2ZUeXBlW2ldXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiPyB0Lm9wdHMuaWRcIiwgdC5vcHRzLmlkLCBcIj09PVwiLCB0YWdJZClcblx0XHRcdFx0XHRcdFx0aWYgKHQub3B0cy5pZCA9PT0gdGFnSWQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmICh0YWdzT2ZUeXBlLm9wdHMuaWQgPT09IHRhZ0lkKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0YWdzT2ZUeXBlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cblx0XHR9XG5cdFx0cmlvdC5taXhpbihcInV0aWxzXCIsIHV0aWxzKVxuXG59KTsiLCJ2YXIgcmlvdCA9IHJlcXVpcmUoJ3Jpb3QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmlvdC50YWcyKCdmb3JtLWVuZ2luZScsICc8Zm9ybSBpZD1cImZvcm1cIj4gPHVsPiA8bGkgZWFjaD1cIntmIGluIGZpZWxkc31cIiBpZD1cIntmLm5hbWV9XCI+IDxkaXYgY2xhc3M9XCJsYWJlbFwiPntmLmxhYmVsfTwvZGl2PiA8ZGl2IGNsYXNzPVwiaW5wdXRcIj48aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwie2YubmFtZX1cIiBvbmtleXByZXNzPVwie2NoZWNrS2V5c31cIj48L2Rpdj4gPC9saT4gPGxpIGlkPVwic3VibWlzc2lvblwiPiBQbGVhc2UgV2FpdC4uLiA8L2xpPiA8L3VsPiA8L2Zvcm0+JywgJ2Zvcm0tZW5naW5lIGZvcm0gdWwgbGksW3Jpb3QtdGFnPVwiZm9ybS1lbmdpbmVcIl0gZm9ybSB1bCBsaSxbZGF0YS1pcz1cImZvcm0tZW5naW5lXCJdIGZvcm0gdWwgbGl7IGRpc3BsYXk6IG5vbmU7IH0nLCAnJywgZnVuY3Rpb24ob3B0cykge1xuXHRcdHZhciB0aGlzVGFnID0gdGhpc1xuXHRcdHRoaXNUYWcuZmllbGRzID0gW11cblx0XHR0aGlzVGFnLnZhbHVlcyA9IHt9XG5cdFx0dGhpc1RhZy5jdXJyZW50RmllbGRJbmRleCA9IC0xXG5cblx0XHR0aGlzLmNoZWNrS2V5cyA9IGZ1bmN0aW9uKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiZVwiLGUpXG5cdFx0XHRpZiAoZS5rZXlDb2RlID09IDEzKSB7XG5cdFx0XHRcdHRoaXNUYWcubmV4dEZpZWxkKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH0uYmluZCh0aGlzKVxuXG5cdFx0dGhpc1RhZy5hZGRGaWVsZCA9IGZ1bmN0aW9uIChuYW1lLCB0eXBlLCBsYWJlbCwgbWF4TGVuZ3RoKSB7XG5cdFx0XHR0aGlzVGFnLmZpZWxkcy5wdXNoKHtuYW1lOiBuYW1lLCB0eXBlOiB0eXBlLCBsYWJlbDogbGFiZWwsIG1heDogbWF4TGVuZ3RofSlcblx0XHRcdHRoaXNUYWcudXBkYXRlKClcblx0XHR9XG5cblx0XHR0aGlzVGFnLnJlbmRlckZpZWxkID0gZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHR2YXIgZiA9IHRoaXNUYWcuZmllbGRzW2luZGV4XVxuXHRcdFx0JChcImxpI1wiICsgZi5uYW1lKS5jc3MoXCJkaXNwbGF5XCIsXCJmbGV4XCIpXG5cdFx0XHQkKFwibGkjXCIgKyBmLm5hbWUgKyBcIiA+IGRpdi5pbnB1dCA+IGlucHV0XCIpLmZvY3VzKClcblx0XHR9XG5cblx0XHR0aGlzVGFnLmhpZGVBbGwgPSBmdW5jdGlvbigpIHtcblx0XHRcdCQoJ2xpJykuY3NzKCdkaXNwbGF5Jywnbm9uZScpXG5cdFx0fVxuXG5cdFx0dGhpc1RhZy5uZXh0RmllbGQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICh0aGlzVGFnLmN1cnJlbnRGaWVsZEluZGV4ID09PSB0aGlzVGFnLmZpZWxkcy5sZW5ndGggLTEpIHtcblx0XHRcdFx0dGhpc1RhZy5zdWJtaXNzaW9uKClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXNUYWcuY3VycmVudEZpZWxkSW5kZXggKz0gMVxuXHRcdFx0XHR0aGlzVGFnLmhpZGVBbGwoKVxuXHRcdFx0XHR0aGlzVGFnLnJlbmRlckZpZWxkKHRoaXNUYWcuY3VycmVudEZpZWxkSW5kZXgpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpc1RhZy5zdWJtaXNzaW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzVGFnLmhpZGVBbGwoKVxuXHRcdFx0JChcImxpI3N1Ym1pc3Npb25cIikuY3NzKFwiZGlzcGxheVwiLFwiZmxleFwiKVxuXHRcdH1cblxuXHRcdHRoaXNUYWcuc3RhcnQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXNUYWcuY3VycmVudEZpZWxkSW5kZXggPSAwO1xuXHRcdFx0dGhpc1RhZy5yZW5kZXJGaWVsZCh0aGlzVGFnLmN1cnJlbnRGaWVsZEluZGV4KVxuXHRcdH1cbn0pOyIsInZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ2dhbGxlcnknLCAnPGRpdiBjbGFzcz1cInBzd3BcIiB0YWJpbmRleD1cIi0xXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiA8ZGl2IGNsYXNzPVwicHN3cF9fYmdcIj48L2Rpdj4gPGRpdiBjbGFzcz1cInBzd3BfX3Njcm9sbC13cmFwXCI+IDxkaXYgY2xhc3M9XCJwc3dwX19jb250YWluZXJcIj4gPGRpdiBjbGFzcz1cInBzd3BfX2l0ZW1cIj48L2Rpdj4gPGRpdiBjbGFzcz1cInBzd3BfX2l0ZW1cIj48L2Rpdj4gPGRpdiBjbGFzcz1cInBzd3BfX2l0ZW1cIj48L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJwc3dwX191aSBwc3dwX191aS0taGlkZGVuXCI+IDxkaXYgY2xhc3M9XCJwc3dwX190b3AtYmFyXCI+IDxkaXYgY2xhc3M9XCJwc3dwX19jb3VudGVyXCI+PC9kaXY+IDxidXR0b24gY2xhc3M9XCJwc3dwX19idXR0b24gcHN3cF9fYnV0dG9uLS1jbG9zZVwiIHRpdGxlPVwiQ2xvc2UgKEVzYylcIj48L2J1dHRvbj4gPGJ1dHRvbiBjbGFzcz1cInBzd3BfX2J1dHRvbiBwc3dwX19idXR0b24tLXNoYXJlXCIgdGl0bGU9XCJTaGFyZVwiPjwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPVwicHN3cF9fYnV0dG9uIHBzd3BfX2J1dHRvbi0tZnNcIiB0aXRsZT1cIlRvZ2dsZSBmdWxsc2NyZWVuXCI+PC9idXR0b24+IDxidXR0b24gY2xhc3M9XCJwc3dwX19idXR0b24gcHN3cF9fYnV0dG9uLS16b29tXCIgdGl0bGU9XCJab29tIGluL291dFwiPjwvYnV0dG9uPiA8ZGl2IGNsYXNzPVwicHN3cF9fcHJlbG9hZGVyXCI+IDxkaXYgY2xhc3M9XCJwc3dwX19wcmVsb2FkZXJfX2ljblwiPiA8ZGl2IGNsYXNzPVwicHN3cF9fcHJlbG9hZGVyX19jdXRcIj4gPGRpdiBjbGFzcz1cInBzd3BfX3ByZWxvYWRlcl9fZG9udXRcIj48L2Rpdj4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4gPC9kaXY+IDxkaXYgY2xhc3M9XCJwc3dwX19zaGFyZS1tb2RhbCBwc3dwX19zaGFyZS1tb2RhbC0taGlkZGVuIHBzd3BfX3NpbmdsZS10YXBcIj4gPGRpdiBjbGFzcz1cInBzd3BfX3NoYXJlLXRvb2x0aXBcIj48L2Rpdj4gPC9kaXY+IDxidXR0b24gY2xhc3M9XCJwc3dwX19idXR0b24gcHN3cF9fYnV0dG9uLS1hcnJvdy0tbGVmdFwiIHRpdGxlPVwiUHJldmlvdXMgKGFycm93IGxlZnQpXCI+IDwvYnV0dG9uPiA8YnV0dG9uIGNsYXNzPVwicHN3cF9fYnV0dG9uIHBzd3BfX2J1dHRvbi0tYXJyb3ctLXJpZ2h0XCIgdGl0bGU9XCJOZXh0IChhcnJvdyByaWdodClcIj4gPC9idXR0b24+IDxkaXYgY2xhc3M9XCJwc3dwX19jYXB0aW9uXCI+IDxkaXYgY2xhc3M9XCJwc3dwX19jYXB0aW9uX19jZW50ZXJcIj48L2Rpdj4gPC9kaXY+IDwvZGl2PiA8L2Rpdj4nLCAnZ2FsbGVyeSAjbGlnaHRib3gsW3Jpb3QtdGFnPVwiZ2FsbGVyeVwiXSAjbGlnaHRib3gsW2RhdGEtaXM9XCJnYWxsZXJ5XCJdICNsaWdodGJveHsgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsMjU1LDI1NSwxMjApOyBjb2xvcjogI0YwMDsgfScsICcnLCBmdW5jdGlvbihvcHRzKSB7XG5cdFx0dmFyIHByZWZpeCA9IHdpbmRvdy5NRURJQV9TRVJWRVJfUFJFRklYICsgXCJwaG90b3MvXCJcblx0XHR2YXIgdGhpc1RhZyA9IHRoaXNcblx0XHR2YXIgbm90aWZpY2F0aW9uQ2VudGVyID0gcmlvdC5taXhpbignbm90aWZpY2F0aW9uX2NlbnRlcicpO1xuXHRcdHRoaXNUYWcuYXNzZXRzID0gW11cblx0XHR0aGlzVGFnLml0ZW1zID0gW11cblx0XHR0aGlzVGFnLmdhbGxlcnkgPSBudWxsXG5cblx0XHR0aGlzVGFnLmluZGV4T2ZBc3NldCA9IGZ1bmN0aW9uKGFzc2V0SWRUb0ZpbmQpIHtcblx0XHRcdGZvciAodmFyIGk9MDsgaTx0aGlzVGFnLmFzc2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYXNzZXQgPSB0aGlzVGFnLmFzc2V0c1tpXVxuXHRcdFx0XHRpZiAoYXNzZXQuYXNzZXRfaWQgPT09IGFzc2V0SWRUb0ZpbmQpIHtcblx0XHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fVxuXG5cdFx0bm90aWZpY2F0aW9uQ2VudGVyLmxpc3RlblRvKCdnb3RfZGF0YScsIGZ1bmN0aW9uKGRhdGEsIGFzc2V0SWRUb1Nob3cpIHtcblx0XHRcdHRoaXNUYWcuYXNzZXRzID0gZGF0YVxuXHRcdFx0dGhpc1RhZy5pdGVtcyA9IFtdXG5cdFx0XHRmb3IgKHZhciBpPTA7IGk8ZGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgYXNzZXQgPSBkYXRhW2ldXG5cdFx0XHRcdHZhciBpdGVtID0ge1xuXHRcdFx0XHRcdHNyYzogcHJlZml4ICsgYXNzZXQudXJsLFxuXHRcdFx0XHRcdHc6IGFzc2V0LndpZHRoLFxuXHRcdFx0XHRcdGg6IGFzc2V0LmhlaWdodFxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXNUYWcuaXRlbXMucHVzaChpdGVtKVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZmlyc3RBc3NldCA9IHRoaXNUYWcuaW5kZXhPZkFzc2V0KGFzc2V0SWRUb1Nob3cpXG5cdFx0XHR0aGlzVGFnLnNob3dHYWxsZXJ5KGZpcnN0QXNzZXQpXG5cdFx0fSlcblxuXHRcdHRoaXMuc2hvd0dhbGxlcnkgPSBmdW5jdGlvbihmaXJzdEFzc2V0KSB7XG5cdFx0XHR2YXIgcHN3cEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucHN3cCcpWzBdO1xuXG5cdFx0XHR2YXIgb3B0aW9ucyA9IHtcblx0XHRcdCAgICBpbmRleDogZmlyc3RBc3NldFxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc29sZS5sb2coXCJQaG90b1N3aXBlXCIsIFBob3RvU3dpcGUpXG5cdFx0XHR0aGlzVGFnLmdhbGxlcnkgPSBuZXcgUGhvdG9Td2lwZSggcHN3cEVsZW1lbnQsIFBob3RvU3dpcGVVSV9EZWZhdWx0LCB0aGlzVGFnLml0ZW1zLCBvcHRpb25zKTtcblx0XHRcdHRoaXNUYWcuZ2FsbGVyeS5pbml0KCk7XG5cdFx0fS5iaW5kKHRoaXMpXG59KTsiLCJ2YXIgcmlvdCA9IHJlcXVpcmUoJ3Jpb3QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmlvdC50YWcyKCdyYXcnLCAnPHNwYW4+PC9zcGFuPicsICcnLCAnJywgZnVuY3Rpb24ob3B0cykge1xuICAgIHRoaXMucm9vdC5pbm5lckhUTUwgPSBvcHRzLmNvbnRlbnRcbn0pOyIsInZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpO1xubW9kdWxlLmV4cG9ydHMgPSByaW90LnRhZzIoJ3NpbXBsZScsICc8ZGl2PiBUaGlzIGlzIGEgc2ltcGxlIFRBRy4gPC9kaXY+JywgJ3NpbXBsZSBkaXYsW3Jpb3QtdGFnPVwic2ltcGxlXCJdIGRpdixbZGF0YS1pcz1cInNpbXBsZVwiXSBkaXZ7IGZvbnQtZmFtaWx5OiBBcmlhbDsgZm9udC1zaXplOiAxMnB4OyB9JywgJycsIGZ1bmN0aW9uKG9wdHMpIHtcbn0pOyJdfQ==
