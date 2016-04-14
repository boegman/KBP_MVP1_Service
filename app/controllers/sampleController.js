﻿var log4js = require('log4js');
var logger = log4js.getLogger('app.controllers.orderCloudOrders');

var express = require('express');
var nconf = require('nconf');
var mongoose = require('mongoose');
var orderCloudOrders = require('../models/orderCloudOrders');
var authenticationService = require('../services/authenticationService');
var httpStatusCode = require('../constants/httpStatusCodes');

var request = require('request');
var httpMethods = require('./../constants/httpMethods');
var mimeTypes = require('./../constants/mimeTypes');

var router = express.Router();

router.get('', function(req, res, next) {
  logger.debug("Request: method:%s, url=%s, body=%s", req.method, req.originalUrl, JSON.stringify(req.body));
  orderCloudOrders.find({}, function(err, users) {
    if (err) {
      res.status(httpStatusCodes.InternalServerError).send(err);
    }
    res.json(users);
  });
});

//  {"items":[{"id":2096,"price":79,"quantity":1},{"id":2099,"price":89,"quantity":1}],"organisationId":131,"userId":21801,"amount":168}

router.post('', function(req, res) {
  logger.debug("Request: method:%s, url=%s, body=%s", req.method, req.originalUrl, JSON.stringify(req.body));
  var newOrder = req.body;
  authenticationService.getActiveUser(req, function(activeUser) {
    logger.debug('active user: ' + activeUser.username);

    // ==== Validate Request data
    if (!newOrder.items.length === 0 || newOrder.organisationId === 0 || newOrder.userId === 0 || newOrder.amount === 0 || !activeUser.meta.merchantId) {
      logger.error('order not valid or user has no merchantId.');
      res.status(httpStatusCode.BadRequest).send();
    }

    var entity = new orderCloudOrders();
    entity.reqOrder = req.body;
    entity.amount = newOrder.amount;
    entity.merchantId = activeUser.meta.merchantId;

    entity.save(function(err) {
      if (err) {
        logger.error(err);
        res.status(httpStatusCode.InternalServerError).send(err);
      }
    });

    // ==== Check that the Order's organisationId matches that of the users' merchant

    // ==== Request Code form MasterP
    // Re-pack data for MP
    var mpRequest = {
      "amount" : entity.amount,
      "merchantReference" : 1234,
      "useOnce" : true,
      "shortDescription" : "Test via new OrderCloud service"
    };

    // Call MP to get a code for this total
    codeFromMP(authenticationService.getToken(req), mpRequest, function(data) {
      entity.mpCode = data.code;

      // ==== Update the order with the code
      // orderCloudOrders.findByIdAndUpdate(entity.Id, entity, function(err) {
      // if (err) {
      // res.status(httpStatusCode.InternalServerError).send(err);
      // }
      entity.save(function(err) {
        if (err) {
          logger.error(err);
          res.status(httpStatusCode.InternalServerError).send(err);
        }
      });

      res.json(data);
    });
  }, function(error) {
    logger.error('Error from MP' + error);

    res.status(httpStatusCode.InternalServerError).send(error);
  });
});
// });

/// Details that will head to MP to request a code
//{
//    "amount": 10.5, // optional
//    "merchantReference": "t0002",
//    "expiryDate": 1375293705696, // optional
//    "useOnce": true, // optional
//    "shortDescription": "Samsung Galaxy S4", // optional
//    "productUrl": "http://www.samsung.com/global/microsite/galaxys4/" // optional
//}
function codeFromMP(userToken, mpRequest, callback, errorCallback) {
  var cloudService = nconf.get('codesService:url');

  var options = {
    url : cloudService,
    headers : {
      'x-access-token' : userToken
    },
    json : mpRequest
  };

  logger.info('Requesting code from MP service: ' + options.url);
  request.post(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (callback) {
        callback(body);
      }
      return;
    }
    if (!errorCallback) {
      return;
    }
    if (error) {
      errorCallback(error);
      return;
    }
    errorCallback("statusCode: " + response.statusCode + " message: " + body);
  });
}

router.delete('/:deviceToken', function(req, res) {
  logger.debug("Request: method:%s, url=%s, body=%s", req.method, req.originalUrl, JSON.stringify(req.body));
  var deviceToken = req.params.deviceToken;
  orderCloudOrders.find({
    deviceToken : deviceToken
  }, function(err) {
    if (err) {
      res.status(httpStatusCodes.InternalServerError).send(err);
    }
    res.send();
  });
});

module.exports = router;