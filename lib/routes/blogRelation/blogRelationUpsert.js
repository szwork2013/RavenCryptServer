var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * inserts/update a relation
 */
module.exports = function (req, res) {
    model.BlogRelation
        .findOrCreate({
            user: req.params.user,
            name: req.params.name,
            server: req.params.server
        }, {
            text: req.body.text,
            keyID: req.body.keyID
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.status(500).send(constants.modelOrDBError);
        })
        .success(function (relation, created) {
            if(!created) {
                relation.text = req.body.text;
                relation.textKeyID = req.body.keyID;

                relation.updatedAt = helper.getUTCTime();
                relation
                    .save()
                    .error(function (err) {
                        logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                        res.status(500).send(constants.modelOrDBError);
                    })
                    .success(function () {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.status(200).send();
                    });
            } else {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            }
        });
};