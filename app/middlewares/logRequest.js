var log4js = require('log4js');
var logger = log4js.getLogger('app.middlewares.logRequest');

var httpStatusCodes = require('../constants/httpStatusCodes');

module.exports = function (req, res, next) {
    if (logger.isLevelEnabled('info')) {
        logger.info(req.method + " " + req.originalUrl);
    }
    if (logger.isLevelEnabled('debug')) {
        logger.debug("headers: " + JSON.stringify(req.headers));
    }
    try {
        next();
    } catch (err) {
        if (logger.isLevelEnabled('error')) {
            logger.error('An error occurred. ' + JSON.stringify(err));
        }
        res.status(httpStatusCodes.InternalServerError).send(error);
    }
};