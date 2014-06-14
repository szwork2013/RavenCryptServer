var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * Get a specific key for a user
 */
module.exports = function (req, res) {
    //you should still be able to get deleted keys!
    var condition = {
        attributes: ["publicKeyText","privateKeyText","encryptionID","revoked"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.UserKey
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (key) {
            if(key) {
                if(key.revoked){
                    logger.rcLog(req, logger.rcLogType.trace, constants.userKeyRevoked);
                    //in this case send back the actual key so the user can validate this result
                    res.send(410, key.key);
                } else {
                    delete key.values.revoked;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, key.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.userKeyNotFound);
                res.send(404, constants.userKeyNotFound);
            }
        });
};
