var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Hard delete Messages.
 * Useful if a Message is completely unreadable, has been processed or has has outlived its usefulness.
 *
 * Should help in the Battle against spam.
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserMessage
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (msg) {
            if(!msg){
                logger.rcLog(req, logger.rcLogType.debug, constants.userMsgNotFound);
                res.send(404, constants.userMsgNotFound);
            } else if(msg.deleted) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            } else {
                msg.text = null;
                msg.keyID = null;

                msg.deleted = true;
                msg.updatedAt = helper.getUTCTime();

                msg
                    .save()
                    .error(function (err) {
                        logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                        res.send(500, constants.modelOrDBError);
                    })
                    .success(function () {
                        informUser();
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.send(200);
                    });
            }
        });

    function informUser(msg){
        sockets
            .in('user/' + msg.user)
            .emit('userMsg', {
                id: msg.id,
                deleted: true
            });
    }
};