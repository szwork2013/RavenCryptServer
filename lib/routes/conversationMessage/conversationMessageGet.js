var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

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
            res.status(500).send(constants.systemException);
        })
        .success(function (msg) {
            if(msg) {
                if(msg.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.msgDeleted);
                    res.status(410).send(msg.values);
                } else {
                    delete msg.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(msg.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.msgNotFound);
                res.status(404).send(constants.msgNotFound);
            }
       });
};