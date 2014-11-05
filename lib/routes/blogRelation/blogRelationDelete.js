'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * inserts/update a relation
 */
module.exports = function (req, res) {
    model.BlogRelation
        .destroy({
            user: req.params.user,
            name: req.body.name,
            server: req.body.server
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function () {
            //doesn't matter if a row was affected or not, since this is a hard delete.
            //if this gets run a second time by the client it should still return success, even if it did nothing
            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).send();
        });
};