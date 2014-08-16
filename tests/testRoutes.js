/**
 * Totally insane full route test.
 * This basically tests the whole server.
 *
 * This is maybe to much to be a unit tests, but as long as it works.. :-)
 */



var configJs = require("../config/config.js");

global.config = new configJs.config('test');
global.config.validations = require("../config/validations.js");

global.cluster = require('cluster');

//next lets set up our logger so we can see whats going on
require("../lib/logger.js");
//logger.setLevel(log4js.levels.OFF);

//crypto libs
require("../lib/crypto.js");

//message constants
require("../lib/constants.js");

//load the validation
require("../lib/validations.js");

global.db = require("../lib/db.js");
require("../lib/model.js");

//express framework needed for our routes
require("../lib/app.js");

//my little evil helpers.. :-)
require("../lib/helper.js");


var http = require('http');
var httpServer = http.createServer(global.app);
global.server = httpServer;

//sessionKeys
require("../lib/session.js");

//sockets..
require("../lib/socket.js");

var routes = require("../lib/routes.js");

function getRcKeyID(armoredPGPKey){
    var keys = openpgp.key.readArmored(armoredPGPKey);

    var key = keys.keys[0];

    var version = key.primaryKey.version;
    var keyId = key.primaryKey.getKeyId().toHex();
    var fingerprint = key.primaryKey.getFingerprint();
    var bitSize = key.primaryKey.getBitSize();

    return version + ";" + keyId + ";" + fingerprint + ";" + bitSize
}

var activationCode = "1111";

var privateKeyArmored =
    "-----BEGIN PGP PRIVATE KEY BLOCK-----\n" +
    "Version: OpenPGP.js v.1.20130712\n" +
    "Comment: http://openpgpjs.org\n" +
    "\n" +
    "xcA4BFIIGnUBAf95dOXTuWrXc67wp3K3b4BTWjt0wRYWMI0mflBx6vE6rUha\n" +
    "oX7Hj2HfxFo5/YqL1sGzL2saUktOsAszvVROV+ktABEBAAEAAf9jubMXxC/Q\n" +
    "1gC3QpYzvc69IeKdvAjZkWXkTGTbFJCbnxbHfMRG0+j3DbFXtY+eKmQXvrWy\n" +
    "DKjPaYCO39rfkHNBAQDFv7+qwEt9cPYJFTxm98wqHrcrdwNcPDg1Rnu4/xfN\n" +
    "3QEAnTvw59D5FByRB8XuOlzcP8bifkoGUVXyCfYaYhheG5EA/2yULvjqU56y\n" +
    "4vUcAJ36Q1F28EWWfoQqIsqYxcANcMIVU+DNBHVzZXLCXAQQAQgAEAUCUgga\n" +
    "dgkQKxeHwufF0WcAABUqAf93G9R1xKZYTXFXaBOcL16yMG7LUheLQTYgeVdS\n" +
    "VYMhMw/kjw6isASNF9bY1VbRlGE7+ZjaUMAFEsvb3hmlaeDJ\n" +
    "=+nVB\n" +
    "-----END PGP PRIVATE KEY BLOCK-----";

var publicKeyArmored =
    "-----BEGIN PGP PUBLIC KEY BLOCK-----\n" +
    "Version: OpenPGP.js v.1.20130712\n" +
    "Comment: http://openpgpjs.org\n" +
    "\n" +
    "xk0EUggadQEB/3l05dO5atdzrvCncrdvgFNaO3TBFhYwjSZ+UHHq8TqtSFqh\n" +
    "fsePYd/EWjn9iovWwbMvaxpSS06wCzO9VE5X6S0AEQEAAc0EdXNlcsJcBBAB\n" +
    "CAAQBQJSCBp2CRArF4fC58XRZwAAFSoB/3cb1HXEplhNcVdoE5wvXrIwbstS\n" +
    "F4tBNiB5V1JVgyEzD+SPDqKwBI0X1tjVVtGUYTv5mNpQwAUSy9veGaVp4Mk=\n" +
    "=dzX9\n" +
    "-----END PGP PUBLIC KEY BLOCK-----";

var keyID = getRcKeyID(publicKeyArmored);

var profile = {comKeyID: keyID};
var text = JSON.stringify(profile);

var parsedPrivateKeys = global.openpgp.key.readArmored(privateKeyArmored);
var signedProfile = global.openpgp.signClearMessage(parsedPrivateKeys.keys, text);

var encryptionID = "84922bff-ce5a-4e38-b537-c51316a5445b";
var encryptionVersion = 1;
var encryptionTest = "jn3AzMDORq2hk54MrzB5Rl2RIfVj";

var options = {
    storeKeysOnServer: false,
    encryptionID: encryptionID
};
text = JSON.stringify(options);
var signedOptions = global.openpgp.signClearMessage(parsedPrivateKeys.keys, text);


var mail = "aaa@bbb.ccc";

//function createUserSessionKey(name){
//    var ServerSessionKey = global.session.skeys[global.session.skeyIDs[0]];
//    var valid = new Date();
//    var validUntil = valid.setDate(valid.getDate() + global.config.session.KeyRenewInterval);
//
//    //create a session for our user
//    var session = {name: name, validUntil: validUntil };
//    var sessionJSON = JSON.stringify(session);
//
//    var encryptedSession = ServerSessionKey.encrypt(sessionJSON);
//
//    var session = {
//        sessionKeyID: ServerSessionKey.id,
//        encrypted: encryptedSession
//    }
//}

//this will fill our memory db with tables, if this has not already happened
var synced = false;
function syncFinished(callback) {

    function updateSessionKeys(){
        global.session.updateKeys(function(){
           callback(session);
        });
    }

    if(!synced)
        global.db.sequelize.sync().done(function(){
            synced = true;
            //console.log("synced");
            updateSessionKeys();
        });
    else
        updateSessionKeys();
}

//response tester.. evil little function to test the routes.
//extend when necessary, or build something better :-)
var Response = function(test) {
    var responseScope = this;
    //private:
    function parseArgs(caller, args) {
        //this is crazy. love that this works :-)
        if(args.length > 0){
            caller.userMsg = args[0];
        }
    }
    //public:
    this._status = 0;
    this.status = function(_status){
        responseScope._status = _status;
        return responseScope;
    };
    this.userMsg = null;
    this.isJson = false;

    //overwrite these
    this.ok = function(res){}; //msg is ok
    this.notOk = function(res){}; //the message is not ok
    this.error = function(res){}; //the server responded with an
    this.formatError = function(msg) {
        test.equal(msg, null, "there was a format error");
        return test.done();
    }; //the format, the server responded in, is incorrect


    this.callback = function(res){
        switch(res._status)
        {
            case 200:
                if(this.isJson) {
                    try{
                        res.json = JSON.parse(res.userMsg);
                    } catch(err) {
                        this.formatError("should return json");
                    }
                }
                this.ok(this);

                break;
            case 500:
                // Server side error
                this.notOk(this);
                break;
            case 400:
                //something went wrong, read the text!
                this.notOk(this);
                break;
            case 401:
                //not authenticated
                this.notOk(this);
                break;
            default:
                //everything else
                this.error(this);
        }
    };

    this.json = function(){
        parseArgs(this, arguments);
        this.isJson = true;
        this.userMsg = JSON.stringify(this.userMsg);
        this.callback(this);
    };

    this.send = function(){
        parseArgs(this, arguments);
        this.isJson = false;
        this.callback(this);
    };
    this.end = this.send;

};


exports.testRouteRegister = function(test){
    syncFinished(function(){

        var userName = "testRouteRegister";

        testRegister();

        function testRegister(){

            var req = {};
            req.logEntry = {};

            req.params = {};
            req.params.user = userName.toLowerCase();
            req.body = {};
            req.body.key = publicKeyArmored;
            req.body.keyID = keyID;
            req.body.mail = mail;
            req.body.encryptionVersion = encryptionVersion;
            req.body.encryptionTest = encryptionTest;
            req.body.options = signedOptions;
            req.body.profile = signedProfile;
            req.ip = "0.0.0.0";

            var res = new Response(test);
            res.ok = function (res){
                return test.done();
            };
            res.notOk = function(res){
                test.equal(res.userMsg, null, "should have been ok");
                return test.done();
            };
            res.error = function(res){
                test.equal(res.userMsg, null, "should have no error");
                return test.done();
            };

            try{
                routes.user.register(req, res);
            } catch (err) {
                test.equal(JSON.stringify(err), null, "should throw no error: " + err);
                test.done();
                return;
            }
        }
    });

};


exports.testRouteRegisterConfirm = function(test){
    syncFinished(function(){

        var userName = "testRouteRegisterConfirm";

        testRegister();

        function testRegister(){

            var req = {};
            req.logEntry = {};

            req.params = {};
            req.params.user = userName.toLowerCase();
            req.body = {};
            req.body.key = publicKeyArmored;
            req.body.keyID = keyID;
            req.body.mail = mail;
            req.body.encryptionVersion = encryptionVersion;
            req.body.encryptionTest = encryptionTest;
            req.body.options = signedOptions;
            req.body.profile = signedProfile;
            req.ip = "0.0.0.0";

            var res = new Response(test);
            res.ok = function (res){
                test.ok(res.userMsg.length > 4, "should be a base64 captcha png");

                //logger.info(activationCodeCaptcha);
                //well shit getting an activation code from a captcha is impossible if done right :D

                //this is the "test" code if the environment ist "test"
                console.log(activationCode);

                testConfirm(activationCode);
            };
            res.notOk = function(res){
                test.equal(res.json, null, "should have been ok");
                return test.done();
            };
            res.error = function(res){
                test.equal(res.json, null, "should have no error");
                return test.done();
            };

            try{
                routes.user.register(req, res);
            } catch (err) {
                test.equal(JSON.stringify(err), null, "should throw no error: " + err);
                test.done();
                return;
            }
        }

        function testConfirm(activationCode){

            var privateKeys = openpgp.key.readArmored(privateKeyArmored);
            var signed = openpgp.signClearMessage(privateKeys.keys, activationCode);

            var req = {};
            req.logEntry = {};

            req.params = {};
            req.params.user = userName.toLowerCase();
            req.body = {};
            req.body.activationCode = signed;
            req.ip = "0.0.0.0";

            var res = new Response(test);
            res.ok = function (res){
                return test.done();
            }
            res.notOk = function(res){
                test.equal(res.userMsg, null, "should have been ok");
                return test.done();
            }
            res.error = function(res){
                test.equal(res.userMsg, null, "should have no error");
                return test.done();
            }

            try{
                routes.user.registerConfirm(req, res);
            } catch (err) {
                test.equal(JSON.stringify(err), null , "should throw no error: " + err);
                test.done();
                return;
            }
        }
    });
};


exports.testRouteRegisterConfirmLogin = function(test){
    syncFinished(function(){

        var userName = "testRouteRegisterConfirmLogin";

        //important when using login! alternative: build a key and add it to global.session.keys
        global.session.updateKeys(function(err){
            if(err){
                test.ok(false, "no keys cant login!")
                test.done();
            }

            testRegister();

            function testRegister(){

                var req = {};
                req.logEntry = {};

                req.params = {};
                req.params.user = userName.toLowerCase();
                req.body = {};
                req.body.key = publicKeyArmored;
                req.body.keyID = keyID;
                req.body.mail = mail;
                req.body.encryptionVersion = encryptionVersion;
                req.body.encryptionTest = encryptionTest;;
                req.body.options = signedOptions;
                req.body.profile = signedProfile;
                req.ip = "0.0.0.0";

                var res = new Response(test);
                res.ok = function (res){
                    test.ok(res.userMsg.length > 4, "should be a base64 captcha png");

                    //logger.info(activationCodeCaptcha);
                    //well shit getting an activation code from a captcha is impossible if done right :D

                    //this is the "test" code if the environment ist "test"
                    var activationCode = "1111";
                    console.log(activationCode);

                    testConfirm(activationCode);
                }
                res.notOk = function(res){
                    test.equal(null, res.userMsg, "should have been ok");
                    return test.done();
                }
                res.error = function(res){
                    test.equal(null, res.userMsg, "should have no error");
                    return test.done();
                }

                try{
                    routes.user.register(req, res);
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    test.done();
                    return;
                }
            }

            function testConfirm(activationCode){

                var privateKeys = openpgp.key.readArmored(privateKeyArmored);
                var signed = openpgp.signClearMessage(privateKeys.keys, activationCode);

                var req = {};
                req.logEntry = {};

                req.params = {};
                req.params.user = userName.toLowerCase();
                req.body = {};
                req.body.activationCode = signed;
                req.ip = "0.0.0.0";

                var res = new Response(test);
                res.ok = function (res){
                    testLogin();
                };
                res.notOk = function(res){
                    test.equal(null, res.userMsg, "should have been ok");
                    return test.done();
                };
                res.error = function(res){
                    test.equal(null, res.userMsg, "should have no error");
                    return test.done();
                };

                try{
                    routes.user.registerConfirm(req, res);
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    return test.done();
                }
            }

            function testLogin(){

                var req = {};
                req.logEntry = {};

                req.query = {};
                req.params = {};
                req.params.user = userName.toLowerCase();
                req.params.id = keyID;

                var res = new Response(test);
                res.ok = function (res){

                    var msg = global.helper.pgpDecrypt(res.userMsg, privateKeyArmored);
                    var jsonMsg = JSON.parse(msg);

                    global.helper.hasExactPropertiesException(
                        jsonMsg, [
                            "validUntil",
                            "sessionKeyID",
                            "encrypted"
                        ]
                    );

                    return test.done();

                };
                res.notOk = function(res){
                    test.equal(null, res.userMsg, "should have been ok");
                    return test.done();
                };
                res.error = function(res){
                    test.equal(null, res.userMsg, "should have no error");
                    return test.done();
                };

                try{
                    routes.userKey.login(req, res);
                } catch (err) {
                    test.equal(null, JSON.stringify(err), "should throw no error: " + err);
                    return test.done();
                }
            }
        })
    });
};



