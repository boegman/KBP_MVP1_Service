var expect = require('chai').expect;
var masterPassService = require('../app/services/masterPassService.js');
var nconf = require('nconf');

describe("servicesTests", function () {
    
    before('Add test constants', function () {
        nconf.defaults({
            "masterPass": {
                "url"		   : "https://ragstest.oltio.co.za/pluto/",
                "userName"     : "psp-{merchant id}",
                "password"     : "E6D9DACA81DC040C8AC7BA60F35B0A21",
                "encryptionKey": "44B943D802850F2480EDE9BCF9F1DC3A"
            }
        });
    });

    describe("masterPassService", function () {
        describe("createCode", function () {

            it("returns a code", function (done) {
                var date = new Date();
                date.setMinutes(date.getMinutes() + 1);
                var postData = {
                    "amount": 10.5, // optional
                    "merchantReference": "t0002", 
                    "expiryDate": date.getTime(), // optional
                    "useOnce": true, // optional
                    "shortDescription": "Samsung Galaxy S4", // optional
                    "productUrl": "http://www.samsung.com/global/microsite/galaxys4/" // optional
                }
                
                var result = masterPassService.createCode(81, postData, function (data) {
                    expect(data.code).to.exist;
                    done();
                }, function (error) {
                    console.log(error);
                    expect.fail();
                    done();
                });
            });
        });
        
        describe("queryCode", function () {
            
        });
        
        describe("getQrForCode", function () {

        });
    });
});