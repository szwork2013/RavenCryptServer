'use strict';

var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var Sequelize = global.Sequelize;

/**
 * Method that the client should call on connection, to get latest message ids
 */
module.exports = function (config, io, socket, constants, db, logger, cluster) {
    //this data will not be stored in the client and should get deleted after it was worked through
    var condition = {
        attributes: ["id"],
        where: {
            user: req.params.user,
            createdAt: {
                gte: req.query.since
            },
            deleted: false
        }
    };

    model.UserMessage
        .findAll(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .then(function (results) {
            var returnResults = [];

            for (var i = 0; i < results.length; i++) {
                returnResults.push(results[i]);
            }

            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).json(returnResults);
        });
};