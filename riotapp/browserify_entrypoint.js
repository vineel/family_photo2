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
