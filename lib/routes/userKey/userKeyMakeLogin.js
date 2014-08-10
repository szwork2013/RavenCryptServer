var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * declares an existing userKey to be the one he logs in with.
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["key", "revoked" ,"createdAt", "updatedAt"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserKey
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (key) {
            if(!key) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userKeyNotFound);
                res.status(404).send(constants.userKeyNotFound);
            } else if(key.revoked) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userKeyRevoked);
                res.status(403).send(constants.userKeyRevoked);
            } else {
                findUser(key)
            }
        });


    function findUser(key){
        var condition = {
            where: {
                user: req.params.user
            }
        };

        model.User
            .find(condition)
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .success(function (user) {
                if(!user){
                    //this is unlikely to happen
                    logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                    res.status(500).send(constants.userNotFound);
                } else {
                    updateUser(user, key);
                }
            });
    }

    function updateUser(user, key) {
        user.loginKeyID = key.id;
        user.updatedAt = helper.getUTCTime();

        user
            .save()
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .success(function () {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            });
    }
};
