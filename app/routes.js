var log4js = require('log4js');
var logger = log4js.getLogger('app.routes');

var express = require('express');
var fs = require('fs');
var string = require('underscore.string');
var nconf = require('nconf');

//var devicesController = require('./controllers/devicesController');
var tokensController = require('./controllers/tokensController.js');

var authorizeRequest = require('./middlewares/validateRequest.js');
var logRequest = require('./middlewares/logRequest.js');

module.exports = {
    register: function (app, socket) {
        app.use('*', [logRequest]);
        app.use('/api/*', [authorizeRequest]);
        
//        app.use('/api/devices', devicesController);
        app.use('/login', tokensController);
        
        // frontend routes =========================================================
        // route to handle all angular requests
//        app.get('*', function (request, response) {
//            response.render('index', {
//                dynamicVariables : 'window.port = ' + (process.env.PORT || 3000) + ';'
//            }); // load our index.html file
//        });
    }
};