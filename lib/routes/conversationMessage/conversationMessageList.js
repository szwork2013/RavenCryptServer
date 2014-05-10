var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;
var Sequelize = global.Sequelize;

/**
 * Method that the client should call on connection, to get latest message ids
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["id", "createdAt"],
        where: {
            user: req.params.user,
            conID: req.params.conID,
            createdAt: {
                gte: req.query.since
            },
            deleted: false
        }
    };

    model.ConversationManifest
        .findAll(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);;
            res.send(500, constants.systemException);
        })
        .success(function (results) {
            var returnResults = [];

            for (var i = 0; i < results.length; i++) {
                returnResults.push(results[i]);
            }

            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.json(200, returnResults);
        });
};