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
module.exports = function (req, res) {
     try {
        var pgpMsg = validations.readSignedClearTextMessage(req.body.activationCode);
        var code = pgpMsg.text;
        isNormalInteger(code);
    } catch (err) {
        logger.rcLog(req, logger.rcLogType.debug, constants.invalidActivationCodePGPMsg, err);
        return res.send(400, constants.invalidActivationCodePGPMsg);
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
            res.send(500, constants.systemException);
        })
        .success(function (register) {
            if (register == null) {
                logger.rcLog(req, logger.rcLogType.debug, constants.noRegistrationFound);
                res.send(404, constants.noRegistrationFound);
            } else {

                try {
                    var validSignature = register.check_message(pgpMsg);
                } catch (err) {
                    register.destroy();

                    logger.rcLog(req, logger.rcLogType.debug, constants.msgCanNotBeValidated, err);
                    res.send(400, constants.msgCanNotBeValidated);
                }

                if (validSignature) {
                    buildUser(register);
                } else {
                    register.destroy();

                    logger.rcLog(req, logger.rcLogType.debug, constants.noValidSignature);
                    res.send(400, constants.noValidSignature);
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
                profileKeyID:  register.keyID,
                encryptionVersion: register.encryptionVersion,
                encryptionTest: register.encryptionTest,
                encryptionID: register.encryptionID,
                ip: req.ip
            });

        var error;
        try {
            user.fillFromProfile();
        } catch(err) {

            logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect, err);
            res.send(400,constants.syntaxIncorrect);

            //delete the broken up register
            register.destroy();

            error = err;
        }
        if(!error){
            saveUser(register, user);
        }
    }

    function saveUser(register, user){
        user
            .save()
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function (user) {
                saveKey(register, user);
            });
    }

    function saveKey(register, user) {
        model.UserKey
            .create({
                user: register.name,
                id: register.keyID,
                publicKeyText: register.publicKeyText,
                privateKeyText: register.privateKeyText,
                encryptionID: req.body.encryptionID
            })
            .error(function (err) {
                user.destroy();

                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function (key) {
                removeRegister(register, user, key);
            });
    }

    function removeRegister(register, user, key) {
        register.destroy()
            .error(function (err) {
                user.destroy();
                key.destroy();

                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.send(500, constants.systemException);
            })
            .success(function () {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            });
    }
};