var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;
var helper = global.helper;

/**
 * inserts/update a contact
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserStorage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.send(500, constants.modelOrDBError);
        })
        .success(function (storage) {
            if(storage){
                if(storage.deleted) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.send(200);
                } else {
                    storage.text = null;
                    storage.keyID = null;

                    storage.deleted = true;
                    storage.updatedAt = helper.getUTCTime();
                    storage
                        .save()
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                            res.send(500, constants.modelOrDBError);
                        })
                        .success(function (storage) {
                            storageUpserted(storage);
                        });
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.storageNotFound);
                res.send(404, constants.storageNotFound);
            }
        });

    function storageUpserted(storage){

        sockets
            .in('user/' + user)
            .emit('storage', {
                id: storage.id,
                deleted: true
            });

        logger.rcLog(req, logger.rcLogType.trace, constants.success);
        res.send(200);
    }
};
