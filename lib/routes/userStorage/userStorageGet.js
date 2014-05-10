var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;
var helper = global.helper;

/**
 * Get a specific contact from the Server
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["content", "keyID", "deleted"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserStorage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (storage){
            if(storage) {
                if(storage.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.storageDeleted);
                    res.send(410, constants.storageDeleted);
                } else {
                    delete storage.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, storage.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.storageNotFound);
                res.send(404, constants.storageNotFound);
            }
        });
};
