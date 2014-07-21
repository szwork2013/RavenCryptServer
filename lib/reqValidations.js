var helper = global.helper;
var config = global.config;
var constants = global.constants;

function rcCheck(){
    var scope = this;
    this.checks = [];
    this.add = function(check){
        scope.checks.push(check);
    };
    this.run = function(req, cb){

        //todo callback loop ! !!!!
        for(var i = 0; i < scope.checks.length;i++) {
            scope.checks[i](req, cb);
        }
        cb();
    }
}

function reqBodyisType(name, type) {
    return function(req, cb) {
        if (typeof req.body[name] != type) {
            cb(name + " was not of type " + type);
        }
    };
}

function checkQueryDate(param){
    return function(req, cb) {
        if (req.query[param]) {
            if (!isDate(req.body[param])) {
                cb(param + " was no date");
            }
        }
    };
}

var userRegExp = config.validations.user.regExp;
function checkParamsUser(param){
    return function(req, cb) {
        var value = req.params[param];
        if(!userRegExp.test(value)) {
            cb(constants.invalidUserName);
        }
    };
}

var serverRegExp = config.validations.server.regExp;
function checkParamsServer(param){
    return function(req, cb) {
        var value = req.params[param];
        if (!serverRegExp.test(value)) {
            cb(constants.invalidUserName);
        }
    };
}

var UUIDV4RegExp = config.validations.uuidV4.regExp;
function checkParamsUUIDV4(param){
    return function(req, cb) {
        var value = req.params[param];
        if (!UUIDV4RegExp.test(value)) {
            cb(constants.IDIsNoUUID);
        }
    };
}

var KeyIDRegExp = config.validations.pubKeyID.regExp;
function checkParamsKeyID(param){
    return function(req, cb) {
        var value = req.params[param];
        if(!KeyIDRegExp.test(value)){
            cb(constants.malformedRCKeyID);
        }
    };
}

module.exports.conMsgGet = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user", cb));
    check.add(checkParamsUUIDV4("conID", cb));
    check.add(checkParamsUUIDV4("id", cb));
    return rcCheck;
};

module.exports.userMsgGetDelete = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.conMsgList = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("conID"));
    check.add(checkParamsUUIDV4("id"));
    check.add(checkQueryDate("since"));
    return check;
};

//TODO FINISH

module.exports.userMsgList = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.userStorageList = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    check.add(checkQueryDate("since"));
    return check;
};

module.exports.blogGetDelete = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.uploadList = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    return check;
};

module.exports.uploadGet = function(){
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.uploadDelete = function(){
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));
    return check;
};

module.exports.blogPost = function () {
    var check = new rcCheck();
    check.add(checkParamsUser("user"));
    check.add(checkParamsUUIDV4("id"));

    check.add(reqBodyisType("keyID", "string"));
    check.add(reqBodyisType("text", "string"));
    check.add(new function(req, cb) {
        var expectedProps = [
            "keyID",
            "text"
        ];
        if (req.body.responseTo) {
            expectedProps.push("responseTo");
        }
        helper.hasExactProperties(req.body, expectedProps, cb);
    });
    check.add(new function(req, cb) {
        if (req.body.responseTo) {
            reqBodyisType("responseTo", "string")(req, cb);
        }
    });
    return check;
};

module.exports.blogResponsePost = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "keyId", "string");
    helper.hasExactProperties(
        req.body, [
            "text",
            "keyId"
        ]
    );
    return check;
};

module.exports.userStorageUpsert = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, ["text","keyID"]
    );
    return check;
};

module.exports.userRegister = function (req, cb) {
    checkParamsUser(req,  "user");
    reqBodyisType(req.body, "key", "string");
    reqBodyisType(req.body, "keyID", "string");
    reqBodyisType(req.body, "profile", "string");
    reqBodyisType(req.body, "mail", "string");

    var expectedProps = [
        "key",
        "keyID",
        "profile",
        "mail"
    ];
    if(req.body.encryptedPrivateKey) {
        reqBodyisType(req.body, "encryptedPrivateKey", "string");
        reqBodyisType(req.body, "encryptionTest", "string");
        reqBodyisType(req.body, "encryptionVersion", "number");
        reqBodyisType(req.body, "encryptionID", "string");

        expectedProps = expectedProps.concat([
            "encryptedPrivateKey",
            "encryptionTest",
            "encryptionVersion",
            "encryptionID"
        ]);
    }
    helper.hasExactProperties(
        req.body, expectedProps
    );
    return check;
};

module.exports.userRegisterConfirm = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    helper.hasExactProperties(
        req.body, ["activationCode"]
    );
    reqBodyisType(req.body, "activationCode", "string");
    return check;
};

module.exports.userProfileUpdate = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    reqBodyisType(req.body, "profile", "string");
    reqBodyisType(req.body, "profileKeyID", "string");
    helper.hasExactProperties(
        req.body, [
            "profile",
            "profileKeyID"
        ]
    );
    return check;
};

module.exports.userEncryptionGet = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
};

module.exports.userEncryptionUpdate = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    reqBodyisType(req.body, "encryptionTest", "string");
    reqBodyisType(req.body, "encryptionVersion", "number");
    reqBodyisType(req.body, "encryptionID", "string");
    helper.hasExactProperties(
        req.body, [
            "encryptionTest",
            "encryptionVersion",
            "encryptionID"
        ]
    );
};

module.exports.userProfileGet = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
};

module.exports.userExists = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
};

module.exports.blogResponseList = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkQueryDate(req, "since");
    checkQueryDate(req, "before");
};

module.exports.blogList = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    checkQueryDate(req, "since");
    checkQueryDate(req, "before");
};

module.exports.blogResponseGetDelete = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
};

module.exports.blogResponseReview = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "review", "string");
    reqBodyisType(req.body, "reviewKeyID", "string");
    helper.hasExactProperties(
        req.body, ["review","reviewKeyID"]
    )
};

module.exports.conversationManifestGetDelete = function(req, cb){
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.conversationManifestUpsert = function(req, cb){
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "conKeyID", "string");
    helper.hasExactProperties(
        req.body, ["text", "conKeyID"]
    );
};

module.exports.blogRelationList = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkQueryDate(req, "since");
};

module.exports.blogRelationGetDelete = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
};

module.exports.blogRelationUpsert = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, ["text","keyID"]
    );
};

module.exports.userStorageGetDelete = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.conMsgReceive = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "conID");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "conKeyID", "string");

    helper.hasExactProperties(
        req.body, [
            "text",
            "conKeyID"
        ]
    );
};

module.exports.userMsgReceive = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    reqBodyisType(req.body, "text", "string");
    reqBodyisType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, [
            "text",
            "keyID"
        ]
    );
};

module.exports.userKeyGet = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
};

module.exports.userKeyList = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
};

module.exports.userKeyUpsert = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
    reqBodyisType(req.body, "publicKeyText", "string");

    var expectedProps = [
        "publicKeyText"
    ];
    if(req.body.privateKeyText) {
        reqBodyisType(req.body, "privateKeyText", "string");
        reqBodyisType(req.body, "encryptionID", "string");

        expectedProps = expectedProps.concat([
            "privateKeyText",
            "encryptionID"
        ]);
    }
    helper.hasExactProperties(
        req.body, expectedProps
    );

    helper.hasExactProperties(
        req.body, ["publicKeyText"]
    );
};

module.exports.userKeyMakeLogin = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
};


module.exports.userKeyLogin = function (req, cb) {
    var check = new rcCheck();
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");

    if(req.query.onlyWatch){
        reqBodyisType(req.body, "onlyWatch", "boolean");
    }
};