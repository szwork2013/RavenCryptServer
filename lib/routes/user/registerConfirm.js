'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var config = global.config;

function isNormalInteger(str) {
    var n = ~~Number(str);
    return String(n) === str && n >= 0;
}

/**
 * Confirm a registration
 */
module.exports = function (config, io, socket, constants, db, logger, cluster) {
    try {
        var pgpMsg = validations.readSignedClearTextMessage(req.body.activationCode);
        var code = pgpMsg.text;
        isNormalInteger(code);
    } catch (err) {
        logger.rcLog(req, logger.rcLogType.debug, constants.invalidActivationCodePGPMsg, err);
        return res.status(400).send(constants.invalidActivationCodePGPMsg);
    }

    var condition = {
        where: {
            name: req.params.user,
            activationCode: code
        }
    };

    model.UserRegister
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .then(function (register) {
            if (register == null) {
                logger.rcLog(req, logger.rcLogType.debug, constants.noRegistrationFound);
                res.status(404).send(constants.noRegistrationFound);
            } else {

                try {
                    var validSignature = register.check_message(pgpMsg);
                } catch (err) {
                    register.destroy();

                    logger.rcLog(req, logger.rcLogType.debug, constants.msgCanNotBeValidated, err);
                    res.status(400).send(constants.msgCanNotBeValidated);
                }

                if (validSignature) {
                    buildUser(register);
                } else {
                    register.destroy();

                    logger.rcLog(req, logger.rcLogType.debug, constants.noValidSignature);
                    res.status(400).send(constants.noValidSignature);
                }
            }
        });

    function buildUser(register) {
        var user = model.User
            .build({
                name: register.name,
                mail: register.mail,
                loginKeyID: register.keyID,
                profile: register.profile,
                RCoptions: register.RCoptions,
                RCoptionsKeyID: register.keyID,
                profileKeyID: register.keyID,
                encryptionVersion: register.encryptionVersion,
                encryptionTest: register.encryptionTest,
                encryptionID: register.encryptionID,
                ip: req.ip
            });

        var error;
        try {
            user.fillFromProfileAndOptions();
        } catch (err) {

            logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect, err);
            res.status(400).send(constants.syntaxIncorrect);

            //delete the broken up register
            register.destroy();

            error = err;
        }
        if (!error) {
            saveUser(register, user);
        }
    }

    function saveUser(register, user) {
        user
            .save()
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .then(function (user) {
                saveKey(register, user);
            });
    }

    function saveKey(register, user) {
        model.UserKey
            .create({
                user: register.name,
                id: register.keyID,
                publicKeyText: register.publicKeyText,
                privateKeyText: register.privateKeyText
            })
            .error(function (err) {
                user.destroy();

                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .then(function (key) {
                saveEncryption(register, user, key);
            });
    }

    function saveEncryption(register, user, key) {
        model.UserEncryption
            .create({
                user: register.name,
                encryptionVersion: register.encryptionVersion,
                encryptionTest: register.encryptionTest,
                encryptionID: user.values.encryptionID
            })
            .error(function (err) {
                user.destroy();
                key.destroy();

                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .then(function (encryption) {
                removeRegister(register, user, key, encryption);
            });
    }


    function removeRegister(register, user, key, encryption) {
        register.destroy()
            .error(function (err) {
                user.destroy();
                key.destroy();
                encryption.destroy();

                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .then(function () {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            });
    }
};
