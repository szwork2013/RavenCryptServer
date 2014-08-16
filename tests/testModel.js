var configJs = require("../config/config.js");
global.config = new configJs.config('test');
global.config.validations = require("../config/validations.js");

var log4js = require('log4js');
global.logger = log4js.getLogger('server');

//crypto libs
require("../lib/crypto.js");

//message constants
require("../lib/constants.js");

//load the validation
require("../lib/validations.js");

global.db = require("../lib/db.js");
require("../lib/model.js");

//this will fill our memory db with tables, if this has not already happened
var synced = false;
function syncFinished(callback) {
    if(!synced)
        global.db.sequelize.sync().done(function(){
            synced = true;
            //console.log("synced");
            callback();
        });
    else
        callback();
}

function getRcKeyID(armoredPGPKey){
    var keys = openpgp.key.readArmored(armoredPGPKey);

    var key = keys.keys[0];

    var version = key.primaryKey.version;
    var keyId = key.primaryKey.getKeyId().toHex();
    var fingerprint = key.primaryKey.getFingerprint();
    var bitSize = key.primaryKey.getBitSize();

    return version + ";" + keyId + ";" + fingerprint + ";" + bitSize
}

var activationCode = "1234";
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


var keyID = getRcKeyID(publicKeyArmored);


var profile = {comKeyID: keyID};
var text = JSON.stringify(profile);

var parsedPrivateKeys = global.openpgp.key.readArmored(privateKeyArmored);
var signedProfile = openpgp.signClearMessage(parsedPrivateKeys.keys, text);


var encryptionID = "84922bff-ce5a-4e38-b537-c51316a5445b";
var encryptionVersion = 1;
var encryptionTest = "jn3AzMDORq2hk54MrzB5Rl2RIfVj";

var options = {
    storeKeysOnServer: false,
    useLocalEncryption: true
};
text = JSON.stringify(options);
var signedOptions = global.openpgp.signClearMessage(parsedPrivateKeys.keys, text);

exports.testUserRegister = function(test){

    syncFinished(function(){

        global.model.UserRegister
            .build({
                name: "bbbbbbbbbb",
                activationCode: activationCode,
                publicKeyText: publicKeyArmored,
                keyID: keyID,
                profile: signedProfile,
                encryptionID: encryptionID,
                encryptionVersion: encryptionVersion,
                encryptionTest: encryptionTest,
                RCoptions: signedOptions,
                ip: "0.0.0.0",
                mail: "a@b.c"
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function() {
                test.done();
            });


    });
};

exports.testUserKey = function(test){

    syncFinished(function(){

        global.model.UserKey
            .build({
                user: "ccc_ccc",
                publicKeyText: publicKeyArmored,
                id: keyID
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function() {
                test.done();
            });
    });
};


exports.testServerSessionKey = function(test){

    syncFinished(function(){

        var ServerSessionKey = global.model.ServerSessionKey;
        var rnd = ServerSessionKey.generate();
        var algorithm = ServerSessionKey.getAlgorithm();

        ServerSessionKey
            .build({
                key: rnd.key,
                iv: rnd.iv,
                algorithm: algorithm
            })
            .save()
            .error(function(err) {
                test.equal(null, JSON.stringify(err), "should not throw error");
                test.done();
            })
            .success(function(serverKey) {
                var dataJSON = {name: "lol", validUntil: new Date()};
                var testString = JSON.stringify(dataJSON);

                var encrypted = serverKey.encrypt(testString);
                var decrypted = serverKey.decrypt(encrypted);

                test.equal(decrypted, testString, "should be same");

                test.done();
            });


    });
};


