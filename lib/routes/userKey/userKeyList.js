var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * Get a list of Keys for a user
 */
module.exports = function routeUserKeyList(req, res) {
    var condition = {
        attributes: ["id"],
        where: {
            user: req.params.user,
            revoked: false
        }
    };

    model.UserKey
        .findAll(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (keys) {
            var userKeys = [];
            for (var i = 0; i < keys.length; i++) {
                userKeys.push(keys[i].values.id);
            }
            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.json(200, userKeys);
        });
};
