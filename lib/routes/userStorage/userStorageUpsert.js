'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;
var helper = global.helper;

/**
 * inserts/update a storage
 */
module.exports = function (req, res) {
    model.UserStorage
        .findOrCreate({
            where: {
                user: req.params.user,
                id: req.params.id
            }, defaults: {
                text: req.body.text,
                keyID: req.body.keyID,
                type: req.body.type
            }
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.status(500).send(constants.modelOrDBError);
        })
        .spread(function (storage, created) {
            if (storage) {
                if (created) {
                    storageUpserted(storage);
                } else {
                    storage.text = req.body.text;
                    storage.keyID = req.body.keyID;
                    storage.type = req.body.type;

                    storage.updatedAt = helper.getUTCTime();
                    storage
                        .save()
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                            res.status(500).send(constants.modelOrDBError);
                        })
                        .then(function (storage) {
                            storageUpserted(storage);
                        });
                }
            }
        });

    function storageUpserted(storage) {
        logger.rcLog(req, logger.rcLogType.trace, constants.success);
        res.status(200).json(storage.updatedAt);

        sockets
            .in('user/' + storage.user)
            .emit('storage', {
                id: storage.id,
                type: req.body.type,
                text: storage.text,
                keyID: storage.keyID,
                updatedAt: storage.updatedAt
            });
    }
};
