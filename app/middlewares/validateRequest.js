var log4js = require('log4js');
var logger = log4js.getLogger('app.middlewares.validateRequest');

//var jwt = require('jwt-simple');
var User = require('../models/user');
var nconf = require('nconf');
var authenticationService = require('../services/authenticationService');
//var channelService = require('../services/channelService');
var httpStatusCodes = require('../constants/httpStatusCodes');

module.exports = function (req, res, next) {
    
    // When performing a cross domain request, you will recieve
    // a preflighted request first. This is to check if our the app
    // is safe.
    
    // We skip the token auth for [OPTIONS] requests.
    //if(req.method == 'OPTIONS') next();
    
    if (req.baseUrl === '/login' 
        || (req.baseUrl.indexOf('/api/codes/') != -1 && req.baseUrl.indexOf('/qr') != -1) 
        || (req.baseUrl.indexOf('/api/notifications') != -1)) {
        next();
    } else {
        // Authorize the user to see if s/he can access our resources
        authenticationService.getActiveUser(req, function (activeUser) {
            if (activeUser.meta.merchantId) {
                // The get will initialize the merchant channel if it does not exist yet.
//                channelService.getMerchantChannel(activeUser.meta.merchantId);   
            }
            if (// always allow if user is admin
                    (activeUser.roles.indexOf('admin') >= 0) 
                    // if user is not admin then allow when updating his own password.
                    || (activeUser.roles.indexOf('admin') < 0 && req.baseUrl.indexOf('/users/' + activeUser.id) >= 0) 
                    // if user is not admin then allow if not accessing users.
                    || (activeUser.roles.indexOf('admin') < 0 && req.baseUrl.indexOf('/users') <= 0)) {
                console.log('active user: ' + activeUser.username);
                next(); // To move to next middleware
            } else {
                res.status(httpStatusCodes.Forbidden);
                res.send("Not Authorized");
            }
        }, function (error) {
            if (error == 'No Token') {
                res.status(httpStatusCodes.Unauthorized);
                res.setHeader('WWW-Authenticate', 'X-Access-Token');
            } else if (error == 'Token Expired' || error == 'Invalid User') {
                res.status(httpStatusCodes.BadRequest);
                res.send(error);
            } else {
                res.status(httpStatusCodes.InternalServerError);
                res.send(error);
            }
        });
    }
};