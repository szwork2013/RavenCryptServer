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
            res.status(500).send(constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.error, constants.userNotFound);
                res.status(500).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(410).send(constants.userDeleted);
            } else if (req.session.keyID != user.loginKeyID) {
                logger.rcLog(req, logger.rcLogType.debug, constants.sessionNotUsingLoginKeyID);
                res.status(403).send(constants.sessionNotUsingLoginKeyID);
            } else {
                user.RCoptions = req.body.RCoptions;
                user.RCoptionsKeyID = req.body.optionsKeyID;

                var error;

                try {
                    user.fillFromProfileAndOptions();
                } catch(err) {
                    logger.rcLog(req, logger.rcLogType.warn, constants.syntaxIncorrect, err);
                    res.status(400).send(constants.syntaxIncorrect);

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
                res.status(500).send(constants.modelOrDBError);
            })
            .success(function () {
                sockets
                    .in('user/' + req.params.user)
                    .emit('options', {
                        options: user.values.RCoptions,
                        optionsKeyID: user.values.RCoptionsKeyID
                    });

                res.status(200).send();
            });
    }
};
