var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Method to get a user Profile
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            name: req.params.user
        }
    };

    model.User
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.error, constants.userNotFound);
                res.send(500, constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.send(410, constants.userDeleted);
            } else if (req.session.keyID != user.loginKeyID) {
                logger.rcLog(req, logger.rcLogType.debug, constants.sessionNotUsingLoginKeyID);
                res.send(403, constants.sessionNotUsingLoginKeyID);
            } else {
                user.encryptionMats = req.body.encryptionMats;
                user.encryptionID = req.body.encryptionID;

                var error;

                try {
                    user.fillFromProfile();
                } catch(err) {
                    logger.rcLog(req, logger.rcLogType.warn, constants.syntaxIncorrect, err);
                    res.send(400,constants.syntaxIncorrect);

                    error = err;
                }

                if(!error){
                    update(user);
                }
            }
        });

    function update(user){
        user.updatedAt = helper.getUTCTime();

        user
            .save()
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function () {
                res.send(200);
            });
    }
};
