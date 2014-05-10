var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;

/**
 * Get Message by primary keys
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text", "conKeyID", "deleted"],
        where: {
            user: req.params.user,
            conID: req.params.conID,
            id: req.params.id
        }
    };

    model.ConversationMessage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (msg) {
            if(msg) {
                if(msg.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.msgDeleted);
                    res.send(410, msg.values);
                } else {
                    delete msg.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, msg.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.msgNotFound);
                res.send(404, constants.msgNotFound);
            }
       });
};