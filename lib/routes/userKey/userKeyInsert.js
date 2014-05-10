var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * inserts a key to our collection, do not overwrite once inserted!
 */
module.exports = function (req, res) {

    var keyRevoked = validations.checkRCKeyIDMatchesAndRevoked(req.body.key, req.params.id);

    model.UserKey
        .findOrCreate({
            user: req.params.user,
            id: req.params.id
        },{
            key: req.body.key,
            revoked: keyRevoked
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.send(500, constants.modelOrDBError);
        })
        .success(function (key, created) {
            if(created){
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            } else {
                //do not overwrite unless this is a revocation for an existing key
                if(keyRevoked){
                    key.key = req.key;

                    key.revoked = true;
                    key.updatedAt = helper.getUTCTime();
                    key
                        .save()
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                            res.send(500, constants.modelOrDBError);
                        })
                        .success(function () {
                            logger.rcLog(req, logger.rcLogType.trace, constants.success);
                            res.send(200);
                        });

                } else {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.send(200);
                }
            }
        });
};
