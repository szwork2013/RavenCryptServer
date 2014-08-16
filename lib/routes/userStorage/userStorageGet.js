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
        attributes: ["content", "type", "keyID", "deleted"],
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
        .success(function (storage){
            if(storage) {
                if(storage.deleted){
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
