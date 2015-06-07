'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * Method to get a user Profile
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["RCoptions", "RCoptionsKeyID", "deleted"],
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
        .then(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                res.status(404).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(403).send(constants.userDeleted);
            } else {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).json({options: user.values.RCoptions, keyID: user.values.RCoptionsKeyID});
            }
        });
};

