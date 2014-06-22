var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Method to get a user Profile
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["encryptionTest", "encryptionID", "encryptionVersion", "deleted"],
        where: {
            name: req.params.user
        }
    };

    model.User
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                res.send(404, constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.send(403, constants.userDeleted);
            } else {
                delete user.values.deleted;
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.json(200, user.values);
            }
        });
};

