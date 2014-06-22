var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var Sequelize = global.db.Sequelize;

/**
 * inserts/updates a hosted conversation
 */
module.exports = function (req, res) {

    var oldKeyID;

    //var bufferedText = new Buffer(req.body.text);

    model.ConversationManifest
        .findOrCreate({
            user: req.params.user,
            id: req.params.id
        }, {
            text: req.body.text,
            conKeyID: req.body.conKeyID
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.send(500, constants.modelOrDBError);
        })
        .success(function (manifest, created) {
            if(created) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            } else {
                if(manifest.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.manifestDeleted);
                    res.send(410, constants.manifestDeleted);
                } else {
                    oldKeyID = manifest.conKeyID;

                    manifest.text = req.body.text;
                    manifest.conKeyID = req.body.conKeyID;

                    manifest.updatedAt = helper.getUTCTime();

                    manifest
                        .save()
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                            res.send(500, constants.modelOrDBError);
                        })
                        .success(function (manifest) {
                            //delete all messages belonging to the conKeyID when it gets changed by the user.
                            if(oldKeyID != manifest.conKeyID){
                                removeMessages(manifest)
                            } else {
                                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                                res.send(200);
                            }
                        });
                }
            }
        });

    function removeMessages(){
        model.ConversationMessage
            .update({
                //set
                text: null,
                conKeyID: null,
                deleted: true
            },{
                //where
                user: req.params.user,
                conID: req.params.id,
                conKeyID: req.body.conKeyID
            })
            .error(function (err) {
                //this is actually an error, since its not the users fault if we fail to remove the messages.
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.send(500, constants.systemException);
            })
            .success(function () {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            });
    }

};