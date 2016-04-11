var log4js = require('log4js');
var logger = log4js.getLogger('app.services.authenticationService');

var User = require('../models/user');
var nconf = require('nconf');

var activeUserCache = {};

function decodeToken(token) {
    return jwt.decode(token, nconf.get('users:secret'));
}

function removeAllExpiredTokensFromCache() {
    Object.keys(activeUserCache).forEach(function (token) {
        var decodedToken = decodeToken(token);
        if (decodedToken.exp <= Date.now()) {
            delete activeUserCache[token];
        }
    });
}

function getToken(req) {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    return token;
}

function getActiveUser(req, callbackFunc, errorCallbackFunc) {
    var token = getToken(req);
    if (!token) {
        errorCallbackFunc('No Token');
    }
    
    var decoded = decodeToken(token);
    
    if (decoded.exp <= Date.now()) {
        if (activeUserCache[token]) {
            delete activeUserCache[token];
        }
        errorCallbackFunc('Token Expired');
        removeAllExpiredTokensFromCache();
        return;
    }
    
    if (activeUserCache[token]) {
        callbackFunc(activeUserCache[token]);
    } else {
        User.find({ username: decoded.user }, function (err, dbUsers) {
            if (err) {
                errorCallbackFunc(err);
                return;
            }
            
            if (dbUsers.length <= 0) {
                errorCallbackFunc('Invalid User');
                return;
            }
            
            activeUserCache[token] = dbUsers[0];
            callbackFunc(dbUsers[0]);
        });
    }
}

module.exports = {
    getActiveUser: getActiveUser
};