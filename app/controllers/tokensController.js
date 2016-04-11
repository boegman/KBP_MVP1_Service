var log4js = require('log4js');
var logger = log4js.getLogger('app.controllers.tokensController');

var express = require('express');
var authenticationService = require('../services/authenticationService');

var router = express.Router();

/*
 * Routes that can be accessed by any one
 */
//router.post('/', authenticationService.login);

module.exports = router;