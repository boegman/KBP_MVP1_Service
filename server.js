// server.js

//logging ==================================================
var log4js = require('log4js');
log4js.configure('log4js.json', { reloadSecs: 60 }); // the reload defaults to a minute. use the second parameter options object to make this more frequent, e.g. log4js.configure('log4js.json', { reloadSecs: 30 });
var logger = log4js.getLogger('server');

// modules =================================================
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
var nconf = require('nconf');
var compression = require('compression');

// configuration / Start-up parameter "NODE_ENV" ===========
nconf.argv().env();
nconf.file({ file: path.join(process.cwd(), '/config/env/', (process.env.NODE_ENV || 'dev') + '/settings.json') });
var enableSsl = nconf.get("enableSsl");
// Creating our server =====================================
var app = express();
var server = !enableSsl ? http.createServer(app) : https.createServer(options, app);

// further module loading===================================
var routeConfig = require('./app/routes');

// more configuration ======================================
var port = process.env.PORT || 3000;
var defaultPage = 'index.html';

app.use(compression());
//app.engine('.hbs', handlebars({ extname: '.hbs' }));
//app.set('view engine', '.hbs');
app.use(cors());

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ defaultCharset: 'ISO-8859-1' }));
app.use(bodyParser.text());

// routes ==================================================
routeConfig.register(app/*, io*/); // configure our routes
// start app ===============================================
// startup our app at http://localhost:1337
logger.debug('Trying to host on port: ' + port);


server.listen(port, function () {
    // shoutout to the user          
    logger.info('Service listening on port ' + port);           
});
