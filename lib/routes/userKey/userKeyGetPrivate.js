'use strict';

/**
 * Get a specific key for a user
 */
module.exports = function (config, io, socket, constants, db, logger, cluster) {
    //you should still be able to get deleted keys!
    var condition = {
        attributes: ["publicKeyText", "privateKeyText", "encryptionID", "revoked"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserKey
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .then(function (key) {
            if (key) {
                if (key.revoked) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.userKeyRevoked);
                    //in this case send back the actual key so the user can validate this result
                    res.status(410).send(key.key);
                } else {
                    delete key.values.revoked;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(key.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.userKeyNotFound);
                res.status(404).send(constants.userKeyNotFound);
            }
        });
};
