var captchapng = require('captchapng');
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var config = global.config;

/**
 * route for new users to register
 */
module.exports = function (req, res) {
    var activationCode;

    //makes this fixed so we can run tests
    if (config.environment == "test") {
        activationCode = 1111;
    } else {
        activationCode = parseInt(Math.random() * 8999 + 1000);
    }

    var condition = {
        where: {
            name: req.params.user
        }
    };

    model.User
        .count(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (count) {
            if (count == 0) {
                registerUser();
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.userExsits);
                res.send(403, constants.userExsits);
            }
        });

    function registerUser() {
        model.UserRegister
            .findOrCreate({
                name: req.params.user
            }, {
                profile: req.body.profile,
                publicKeyText: req.body.publicKeyText,
                privateKeyText: req.body.privateKeyText,
                encryptionMats: req.body.encryptionMats,
                encryptionID: req.body.encryptionID,
                keyID: req.body.keyID,
                activationCode: activationCode,
                mail: req.body.mail,
                ip: req.ip,
                encryptionMats: req.body.encryptionMats
            })
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function (userRegister, created) {
                if (created) {
                    sendCaptcha(userRegister);
                } else {
                    if (userRegister.keyID == req.body.keyID) {
                        sendCaptcha(userRegister);
                    } else {
                        logger.rcLog(req, logger.rcLogType.trace, constants.nameInUse);
                        res.send(403, constants.nameInUse);
                    }
                }
            });
    }

    function sendCaptcha(userRegister){
        var p = new captchapng(240, 90, userRegister.activationCode);
        p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
        p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
        var img = p.getBase64();

        logger.rcLog(req, logger.rcLogType.trace, constants.success);
        res.send(200, img);
    }
};
