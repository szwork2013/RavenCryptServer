var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * inserts/updates a hosted conversation
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.ConversationManifest
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.status(500).send(constants.modelOrDBError);
        })
        .success(function (manifest) {
            if (manifest) {
                if (manifest.deleted) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).send();
                } else {
                    manifest.text = null;
                    manifest.keyID = null;
                    manifest.conKeyID = null;

                    manifest.delted = true;
                    manifest.updatedAt = helper.getUTCTime();

                    manifest
                        .save()
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                            res.status(500).send(constants.modelOrDBError);
                        })
                        .success(function (manifest) {
                            removeMessages(manifest);
                        });
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.manifestNotFound);
                res.status(404).send();
            }

        });

    function removeMessages() {
        model.ConversationMessage
            .update({
                //set
                text: null,
                keyID: null,
                conKeyID: null,
                deleted: true
            }, {
                //where
                user: req.params.user,
                conID: req.params.id
            })
            .error(function (err) {
                //this is actually an error, since its not the users fault if we fail to remove the messages.
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .success(function () {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            });
    }

};