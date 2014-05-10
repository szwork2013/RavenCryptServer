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
            res.send(500, constants.systemException);
        })
        .success(function (manifest) {
            if(manifest) {
                if(manifest.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.manifestDeleted);
                    res.send(410, manifest.values);
                } else {
                    delete manifest.values.deleted;

                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, manifest.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.manifestNotFound);
                res.send(404, constants.manifestNotFound);
            }
        });
};