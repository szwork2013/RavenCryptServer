var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var Sequelize = global.Sequelize;

/**
 * Get Message by primary keys
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text", "keyID", "deleted"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserMessage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (msg) {
            if(msg) {
                if(msg.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.userMsgDeleted);
                    res.status(410).send(constants.userMsgDeleted);
                } else {
                    delete msg.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(msg.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.userMsgNotFound);
                res.status(404).send(constants.userMsgNotFound);
            }
       });
};