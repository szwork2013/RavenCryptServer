var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Method to insert Metadata for the Users private Encryption
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["encryptionTest", "encryptionID", "encryptionVersion", "createdAt", "deleted"],
        where: {
            user: req.params.user,
            encryptionID: req.params.id
        }
    };

    model.UserEncryption
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                res.status(404).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(403).send(constants.userDeleted);
            } else {
                delete user.values.deleted;
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).json(user.values);
            }
        });
};
