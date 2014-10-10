var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Method to get a user Encryption
 */
module.exports = function (req, res) {
    var scope = this;

    scope.upsertEncryption = function () {
        model.UserEncryption.
            findOrCreate({
                where: {
                    user: req.params.user,
                    encryptionID: req.params.id
                }, defaults: {
                    encryptionTest: req.body.encryptionTest,
                    encryptionVersion: req.body.encryptionVersion
                }
            })
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .success(function (encryption, created) {
                if (created) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).send();
                } else {
                    if (post.encryptionTest != req.body.encryptionTest || encryption.encryptionVersion != req.body.encryptionVersion) {
                        logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                        res.status(202).send(constants.uuidInUse);
                    } else {
                        res.status(200).send();
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);

                        sockets
                            .in('user/' + req.params.user)
                            .emit('encryption', {
                                encryptionID: encryption.encryptionID,
                                encryptionTest: encryption.encryptionTest,
                                encryptionVersion: encryption.encryptionVersion
                            });
                    }
                }
            });
    };

    var condition = {
        where: {
            name: req.params.user
        }
    };

    model.User
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.error, constants.userNotFound);
                res.status(500).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(410).send(constants.userDeleted);
            } else if (req.session.keyID != user.loginKeyID) {
                logger.rcLog(req, logger.rcLogType.debug, constants.sessionNotUsingLoginKeyID);
                res.status(403).send(constants.sessionNotUsingLoginKeyID);
            } else {
                user.encryptionID = req.body.encryptionID;

                scope.upsertEncryption();
            }
        });
};
