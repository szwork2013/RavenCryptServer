'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var helper = global.helper;

/**
 * Get a specific contact from the Server
 */
module.exports = function (config, io, socket, constants, db, logger, cluster) {
    var condition = {
        attributes: ["text", "type", "keyID", "updatedAt", "deleted"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserStorage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .then(function (storage) {
            if (storage) {
                if (storage.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.storageDeleted);
                    res.status(410).send(constants.storageDeleted);
                } else {
                    delete storage.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(storage.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.storageNotFound);
                res.status(404).send(constants.storageNotFound);
            }
        });
};

