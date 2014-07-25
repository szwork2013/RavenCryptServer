var helper = global.helper;
var config = global.config;
var constants = global.constants;

function RCCheck(){
    var scope = this;
    this.checks = [];
    this.run = function(req, cb){
        var checked = 0;
        var internalCB = function(err){
            if(err){
                cb(err);
            } else if (checked < scope.checks.length) {
                var check = scope.checks[checked];
                checked++;
                check(req, internalCB);
            } else {
                cb();
            }
        };
        internalCB();
    };
    this.add = function(check){
        scope.checks.push(check);
    };
}

function reqBodyisType(name, type) {
    return function(req, cb) {
        if (typeof req.body[name] != type) {
            cb(name + " was not of type " + type);
        } else {
            cb();
        }
    };
}

//these dates are only have to be date when they exist
function checkQueryDate(param){
    return function(req, cb) {
        if (req.query[param]) {
            if (!isDate(req.body[param])) {
                cb(param + " was no date");
            } else {
                cb();
            }
        } else {
            cb();
        }
    };
}

var userRegExp = config.validations.user.regExp;
function checkParamsUser(param){
    return function(req, cb) {
        var value = req.params[param];
        if(!userRegExp.test(value)) {
            cb(constants.invalidUserName);
        } else {
            cb();
        }
    };
}

var serverRegExp = config.validations.server.regExp;
function checkParamsServer(param){
    return function(req, cb) {
        var value = req.params[param];
        if (!serverRegExp.test(value)) {
            cb(constants.invalidUserName);
        } else {
            cb();
        }
    };
}

var UUIDV4RegExp = config.validations.uuidV4.regExp;
function checkParamsUUIDV4(param){
    return function(req, cb) {
        var value = req.params[param];
        if (!UUIDV4RegExp.test(value)) {
            cb(constants.IDIsNoUUID);
        } else {
            cb();
        }
    };
}

var KeyIDRegExp = config.validations.pubKeyID.regExp;
function checkParamsKeyID(param){
    return function(req, cb) {
        var value = req.params[param];
        if(!KeyIDRegExp.test(value)){
            cb(constants.malformedRCKeyID);
        } else {
            cb();
        }
    };
}

module.exports.conMsgGet = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("conID"));
    check.add(checkParamsUUIDV4("id"));
    return RCCheck;
};

module.exports.userMsgGetDelete = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.conMsgList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("conID"));
    check.add(checkParamsUUIDV4("id"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.userMsgList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.userStorageList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.blogGetDelete = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.uploadList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.uploadGet = function(){
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.uploadDelete = function(){
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.blogPost = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("keyID", "string"));
    check.add(reqBodyisType("text", "string"));
    check.add(function(req, cb) {
        var expectedProps = [
            "keyID",
            "text"
        ];
        if (req.body.responseTo) {
            expectedProps.push("responseTo");
        }
        helper.hasExactProperties(req.body, expectedProps, cb);
    });
    check.add(function(req, cb) {
        if (req.body.responseTo) {
            reqBodyisType("responseTo", "string")(req, cb);
        } else {
            cb();
        }
    });
    return check;
};

module.exports.blogResponsePost = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("blogID"));
    check.add(checkParamsUser("name"));
    check.add(checkParamsServer("server"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("keyId", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body,
            ["text", "keyId"],
            cb
        );
    });
    return check;
};

module.exports.userStorageUpsert = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("keyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body,
            ["text","keyID"],
            cb
        );
    });
    return check;
};

module.exports.userRegister = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(reqBodyisType("key", "string"));
    check.add(reqBodyisType("keyID", "string"));
    check.add(reqBodyisType("profile", "string"));
    check.add(reqBodyisType("mail", "string"));
    check.add(function(req, cb) {
        var expectedProps = [
            "key",
            "keyID",
            "profile",
            "mail"
        ];
        if(req.body.encryptedPrivateKey) {
            expectedProps = expectedProps.concat([
                "encryptedPrivateKey",
                "encryptionTest",
                "encryptionVersion",
                "encryptionID"
            ]);
        }
        helper.hasExactProperties(
            req.body, expectedProps, cb
        );
    });
    check.add(function(req, cb) {
        if(req.body.encryptedPrivateKey) {
            var innerChecks = [];
            innerChecks.push(
                reqBodyisType("encryptedPrivateKey", "string"),
                reqBodyisType("encryptionTest", "string"),
                reqBodyisType("encryptionVersion", "number"),
                reqBodyisType("encryptionID", "string")
            );

            var checked = 0;
            var localCB = function(err){
                if(err){
                    cb(err);
                } else if (checked < innerChecks.length) {
                    var check = innerChecks[checked];
                    checked++;
                    check(req, localCB);
                } else {
                    cb();
                }
            };
            localCB();
        } else {
            cb();
        }
    });
    return check;
};

module.exports.userRegisterConfirm = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, ["activationCode"], cb
        );
    });
    check.add(reqBodyisType("activationCode", "string"));
    return check;
};

module.exports.userProfileUpdate = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(reqBodyisType("profile", "string"));
    check.add(reqBodyisType("profileKeyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, ["profile","profileKeyID"], cb
        );
    });
    return check;
};

module.exports.userEncryptionGet = function (){
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.userEncryptionUpdate = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(reqBodyisType("encryptionTest", "string"));
    check.add(reqBodyisType("encryptionVersion", "number"));
    check.add(reqBodyisType("encryptionID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, [
                "encryptionTest",
                "encryptionVersion",
                "encryptionID"
            ], cb
        );
    });
    return check;
};

module.exports.userProfileGet = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.userExists = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.blogResponseList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("blogID"));
    check.add(checkQueryDate("since"));
    check.add(checkQueryDate("before"));
    return check;
};

module.exports.blogList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(checkQueryDate("since"));
    check.add(checkQueryDate("before"));
    return check;
};

module.exports.blogResponseGetDelete = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("blogID"));
    check.add(checkParamsUser("name"));
    check.add(checkParamsServer("server"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.blogResponseReview = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("blogID"));
    check.add(checkParamsUser("name"));
    check.add(checkParamsServer("server"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("review", "string"));
    check.add(reqBodyisType("reviewKeyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, ["review", "reviewKeyID"], cb
        );
    });
    return check;
};

module.exports.conversationManifestGetDelete = function(){
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.conversationManifestUpsert = function(){
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("conKeyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, ["text", "conKeyID"], cb
        );
    });
    return check;
};

module.exports.blogRelationList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.blogRelationGetDelete = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUser("name"));
    check.add(checkParamsServer("server"));
    return check;
};

module.exports.blogRelationUpsert = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUser("name"));
    check.add(checkParamsServer("server"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("keyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, ["text", "keyID"], cb
        );
    });
    return check;
};

module.exports.userStorageGetDelete = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.conMsgReceive = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("conID"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("conKeyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, [
                "text",
                "conKeyID"
            ], cb
        );
    });
    return check;
};

module.exports.userMsgReceive = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(reqBodyisType("text", "string"));
    check.add(reqBodyisType("keyID", "string"));
    check.add(function(req, cb) {
        helper.hasExactProperties(
            req.body, [
                "text",
                "keyID"
            ], cb
        );
    });
    return check;
};

module.exports.userKeyGet = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsKeyID("id"));
    return check;
};

module.exports.userKeyList = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.userKeyUpsert = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsKeyID("id"));
    check.add(reqBodyisType("publicKeyText", "string"));

    check.add(function(req, cb) {
        var expectedProps = [
            "publicKeyText"
        ];
        if (req.body.privateKeyText) {
            expectedProps = expectedProps.concat([
                "privateKeyText",
                "encryptionID"
            ]);
        }
        helper.hasExactProperties(
            req.body, expectedProps, cb
        );
    });

    check.add(function(req, cb) {
        if(req.body.privateKeyText) {
            var innerChecks = [];
            innerChecks.push(
                reqBodyisType("privateKeyText", "string"),
                reqBodyisType("encryptionID", "string")
            );
            var checked = 0;
            var localCB = function(err){
                if(err){
                    cb(err);
                } else if (checked < innerChecks.length) {
                    var check = innerChecks[checked];
                    checked++;
                    check(req, localCB);
                } else {
                    cb();
                }
            };
            localCB();
        } else {
            cb();
        }
    });
    return check;
};

module.exports.userKeyMakeLogin = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsKeyID("id"));
    return check;
};


module.exports.userKeyLogin = function () {
    var check = new RCCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsKeyID("id"));
    check.add(function (req, cb) {
        if(req.query.onlyWatch){
            reqBodyisType("onlyWatch", "boolean")(req, cb);
        } else {
            cb();
        }
    });
    return check;
};