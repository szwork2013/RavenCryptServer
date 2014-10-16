var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * returns a conversation
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text", "deleted"], //do not make the conKeyID public, or else anyone can spam the channel!
                                         //kicked user will get their own message
                                         //and can also see this when posting new messages with the invalid ey
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.ConversationManifest
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (manifest) {
            if (manifest) {
                if (manifest.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.manifestDeleted);
                    res.status(410).send(manifest.values);
                } else {
                    delete manifest.values.deleted;

                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(manifest.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.manifestNotFound);
                res.status(404).send(constants.manifestNotFound);
            }
        });
};