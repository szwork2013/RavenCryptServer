var helper = global.helper;
var config = global.config;
var constants = global.constants;

function isType(obj, name, type) {
    if (typeof obj[name] != type) {
        throw name + " was not of type " + type;
    }
}

function checkQueryDate(req, param){
    if (req.query[param]) {
        if (!isDate(req.body[param])) {
            throw param +" was no date";
        }
    }
}

var userRegExp = config.validations.user.regExp;
function checkParamsUser(req, param){
    var value = req.params[param];
    if(!userRegExp.test(value)) {
        throw constants.invalidUserName;
    }
}

var serverRegExp = config.validations.server.regExp;
function checkParamsServer(req, param){
    var value = req.params[param];
    if(!serverRegExp.test(value)) {
        throw constants.invalidUserName;
    }
}

var UUIDV4RegExp = config.validations.uuidV4.regExp;
function checkParamsUUIDV4(req, param){
    var value = req.params[param];
    if(!UUIDV4RegExp.test(value)){
        throw constants.IDIsNoUUID;
    }
}

var KeyIDRegExp = config.validations.pubKeyID.regExp;
function checkParamsKeyID(req, param){
    var value = req.params[param];
    if(!KeyIDRegExp.test(value)){
        throw constants.malformedRCKeyID ;
    }
}

module.exports.conMsgGet = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "conID");
    checkParamsUUIDV4(req, "id");
};

module.exports.userMsgGetDelete = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.conMsgList = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "conID");
    checkParamsUUIDV4(req, "id");
    checkQueryDate(req, "since");
};

module.exports.userMsgList = function (req, cb) {
    checkParamsUser(req, "user");
    checkQueryDate(req, "since");
};

module.exports.userStorageList = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    checkQueryDate(req, "since");
};

module.exports.blogGetDelete = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.uploadList = function (req, cb) {
    checkParamsUser(req, "user");
};

module.exports.uploadGet = function(req, cb){
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.uploadDelete = function(req, cb){
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.blogPost = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");

    var expectedProps = [
        "keyID",
        "text"
    ];
    isType(req.body, "keyID", "string");
    isType(req.body, "text", "string");
    if (req.body.responseTo) {
        isType(req.body, "responseTo", "string");
        expectedProps.push("responseTo");
    }
    helper.hasExactProperties(
        req.body, expectedProps
    );
};

module.exports.blogResponsePost = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "text", "string");
    isType(req.body, "keyId", "string");
    helper.hasExactProperties(
        req.body, [
            "text",
            "keyId"
        ]
    );
};

module.exports.userStorageUpsert = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "text", "string");
    isType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, ["text","keyID"]
    );
};

module.exports.userRegister = function (req, cb) {
    checkParamsUser(req,  "user");
    isType(req.body, "key", "string");
    isType(req.body, "keyID", "string");
    isType(req.body, "profile", "string");
    isType(req.body, "mail", "string");

    var expectedProps = [
        "key",
        "keyID",
        "profile",
        "mail"
    ];
    if(req.body.encryptedPrivateKey) {
        isType(req.body, "encryptedPrivateKey", "string");
        isType(req.body, "encryptionTest", "string");
        isType(req.body, "encryptionVersion", "number");
        isType(req.body, "encryptionID", "string");

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
};

module.exports.userRegisterConfirm = function (req, cb) {
    checkParamsUser(req, "user");
    helper.hasExactProperties(
        req.body, ["activationCode"]
    );
    isType(req.body, "activationCode", "string");
};

module.exports.userProfileUpdate = function (req, cb) {
    checkParamsUser(req, "user");
    isType(req.body, "profile", "string");
    isType(req.body, "profileKeyID", "string");
    helper.hasExactProperties(
        req.body, [
            "profile",
            "profileKeyID"
        ]
    );
};

module.exports.userEncryptionGet = function (req, cb) {
    checkParamsUser(req, "user");
};

module.exports.userEncryptionUpdate = function (req, cb) {
    checkParamsUser(req, "user");
    isType(req.body, "encryptionTest", "string");
    isType(req.body, "encryptionVersion", "number");
    isType(req.body, "encryptionID", "string");
    helper.hasExactProperties(
        req.body, [
            "encryptionTest",
            "encryptionVersion",
            "encryptionID"
        ]
    );
};

module.exports.userProfileGet = function (req, cb) {
    checkParamsUser(req, "user");
};

module.exports.userExists = function (req, cb) {
    checkParamsUser(req, "user");
};

module.exports.blogResponseList = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkQueryDate(req, "since");
    checkQueryDate(req, "before");
};

module.exports.blogList = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    checkQueryDate(req, "since");
    checkQueryDate(req, "before");
};

module.exports.blogResponseGetDelete = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
};

module.exports.blogResponseReview = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "blogID");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "review", "string");
    isType(req.body, "reviewKeyID", "string");
    helper.hasExactProperties(
        req.body, ["review","reviewKeyID"]
    )
};

module.exports.conversationManifestGetDelete = function(req, cb){
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.conversationManifestUpsert = function(req, cb){
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "text", "string");
    isType(req.body, "conKeyID", "string");
    helper.hasExactProperties(
        req.body, ["text", "conKeyID"]
    );
};

module.exports.blogRelationList = function (req, cb) {
    checkParamsUser(req, "user");
    checkQueryDate(req, "since");
};

module.exports.blogRelationGetDelete = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
};

module.exports.blogRelationUpsert = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUser(req, "name");
    checkParamsServer(req, "server");
    isType(req.body, "text", "string");
    isType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, ["text","keyID"]
    );
};

module.exports.userStorageGetDelete = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
};

module.exports.conMsgReceive = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "conID");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "text", "string");
    isType(req.body, "conKeyID", "string");

    helper.hasExactProperties(
        req.body, [
            "text",
            "conKeyID"
        ]
    );
};

module.exports.userMsgReceive = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsUUIDV4(req, "id");
    isType(req.body, "text", "string");
    isType(req.body, "keyID", "string");
    helper.hasExactProperties(
        req.body, [
            "text",
            "keyID"
        ]
    );
};

module.exports.userKeyGet = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
};

module.exports.userKeyList = function (req, cb) {
    checkParamsUser(req, "user");
};

module.exports.userKeyUpsert = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
    isType(req.body, "publicKeyText", "string");

    var expectedProps = [
        "publicKeyText"
    ];
    if(req.body.privateKeyText) {
        isType(req.body, "privateKeyText", "string");
        isType(req.body, "encryptionID", "string");

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
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");
};


module.exports.userKeyLogin = function (req, cb) {
    checkParamsUser(req, "user");
    checkParamsKeyID(req, "id");

    if(req.query.onlyWatch){
        isType(req.body, "onlyWatch", "boolean");
    }
};