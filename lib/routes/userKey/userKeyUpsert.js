'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * inserts a key to our collection, do not overwrite once inserted!
 */
module.exports = function (req, res) {

    var keyRevoked = validations.checkRCKeyIDMatchesAndRevoked(req.body.key, req.params.id);

    model.UserKey
        .findOrCreate({
            where: {
                user: req.params.user,
                id: req.params.id
            }, defaults: {
                key: req.body.key,
                revoked: keyRevoked
            }
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.status(500).send(constants.modelOrDBError);
        })
        .spread(function (key, created) {
            if (key) {
                if (created) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).send();
                } else {
                    //do not overwrite unless this is a revocation for an existing key
                    if (keyRevoked) {
                        key.key = req.key;

                        key.revoked = true;
                        key.updatedAt = helper.getUTCTime();
                        key
                            .save()
                            .error(function (err) {
                                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                                res.status(500).send(constants.modelOrDBError);
                            })
                            .then(function () {
                                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                                res.status(200).send();
                            });

                    } else {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.status(200).send(key.updatedAt);
                    }
                }
            }
        });
};
