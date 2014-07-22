var validations = {};
var openpgp = global.openpgp;
var constants = global.constants;
var config = global.config;

/**
 * shared validations for types and messages
 */
validations.readSignedClearTextMessage = function (pgpMessage) {
    var msg;
    try {
        msg = openpgp.cleartext.readArmored(pgpMessage);
    } catch (err) {
        throw global.constants.noPGPMsg;
    }
    return msg;
};

validations.readEncryptedMessage = function (pgpMessage) {
    var msg;
    try {
        msg = openpgp.message.readArmored(pgpMessage);
    } catch (err) {
        throw global.constants.noPGPMsg;
    }
    return msg;
};

validations.readEncryptedSignedMessage = function (pgpMessage) {
    var msg;
    try {
        msg = openpgp.message.readArmored(pgpMessage);
    } catch (err) {
        throw global.constants.noPGPMsg;
    }
    return msg;
};

validations.checkRCKeyIDMatchesAndRevoked = function(pgpKeyArmored, rcKeyID){
    var result = false;
    try{
        var pubKey = openpgp.key.readArmored(pgpKeyArmored);
        if(pubKey.keys.length != 1){
            throw "";
        }

        var pgpKey = keys[0];
        validations.checkRCKeyIDMatching(pgpKey, rcKeyID);

        if(pgpKey.verifyPrimaryKey() == openpgp.keyStatus.valid) {
            result = true;
        }
    } finally {
        return result;
    }
};

validations.checkRCKeyIDMatching = function (pgpKey, rcKeyID){
    var pgpKeyID = validations.getRCKeyID(pgpKey);

    if (pgpKeyID != rcKeyID) {
        throw constants.unmatchingKeyID;
    }
};

validations.getRCKeyID = function (pgpKey) {
    return pgpKey.primaryKey.version + ";" +
           pgpKey.primaryKey.getKeyId().toHex() + ";" +
           pgpKey.primaryKey.getFingerprint() + ";" +
           pgpKey.primaryKey.getBitSize();

};

validations.checkRCKeyID = function (pgpKeyArmored, rcKeyID) {
    try {
        var keys = openpgp.key.readArmored(pgpKeyArmored);
    } catch (err) {
        throw constants.unreadableKey;
    }

    if (keys.keys.length != 1) {
        throw constants.unexpectedNumberOfKeys
    }

    var pgpKey = keys.keys[0];

    validations.checkRCKeyIDMatching(pgpKey, rcKeyID);

};

validations.RCProfile = function (pgpMessage) {
    var msg = validations.readSignedClearTextMessage(pgpMessage);
    try {
        var msgContent = JSON.parse(msg.text);
    } catch(err) {
        throw constants.constants.profileNoJson;
    }
    helper.hasExactPropertiesException(msgContent, ["comKeyID"]);
    if(typeof msgContent.comKeyID !== "string") {
        throw "comKeyID is no string"; //
    }
    return msgContent;
};

validations.checkPGPKey = function (value) {
    try {
        var keys = openpgp.key.readArmored(value);
    } catch (err) {
        throw constants.unreadableKey;
    }

    //this should only contain one public key

    if (keys.keys.length != 1) {
        throw constants.unexpectedNumberOfKeys
    }

    var key = keys.keys[0];

    var isPublic = key.isPublic();
    var algorithm = key.primaryKey.algorithm;
    var bitSize = key.primaryKey.getBitSize();

    if (!isPublic) {
        throw constants.noPublicKey;
    }

    //todo allow elliptic curve algorithms.
    //http://tools.ietf.org/html/rfc4880#section-9.1
    //http://tools.ietf.org/html/rfc6637#section-9.1
    switch (algorithm) {
        case "rsa_encrypt_sign":
            if (!config.isTestEnvironment()) {
                if (bitSize != 2048 && bitSize != 3072 && bitSize != 4096) {
                    //This limit is here for performance, faulty implementation and more secure KeyID reasons.
                    //OpenPGP.js can handle longer Key lengths though

                    //however even some C implementations overflow in ranges over 4096 so its better that that's the limit.

                    //use EC Keys if you need more security, although we should then check if its a good curve.

                    throw constants.invalidKeyLength;
                }
            }
            break;
        default:
            throw constants.unsupportedAlogrithm;
    }
};

global.validations = validations;
