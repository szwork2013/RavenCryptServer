'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var Sequelize = global.Sequelize;
var helper = global.helper;

/**
 * Method that the client should call on connection, to get latest Contacts
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["id", "updatedAt"],
        where: {
            user: req.params.user
        }
    };

    //list deleted data only if doing a  full sync
    if (req.query.since) {
        condition.where.updatedAt = {};
        condition.where.updatedAt.gte = req.query.since;
    } else {
        condition.where.deleted = false;
    }

    model.UserStorage
        .findAll(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (results) {
            var returnResults = [];

            for (var i = 0; i < results.length; i++) {
                var values = results[i].values;
                if (values.deleted == false) {
                    delete values.deleted;
                }
                returnResults.push(values);
            }

            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).json(returnResults);
        });
};