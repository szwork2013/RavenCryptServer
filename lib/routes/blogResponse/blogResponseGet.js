var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;

/**
 * Get a specific blog response, regardless if its hidden reviewed or not
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text", "keyID", "review", "reviewKeyID", "deleted"],
        where: {
            user: req.query.user,
            blogID: req.query.blogID,
            responder: req.query.name,
            server: req.query.server,
            id: req.query.id
        }
    };

    model.BlogResponse
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (response) {
            if (response) {
                if (response.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.responseDeleted, err);
                    res.status(410).send(constants.responseDeleted);
                } else {
                    delete response.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(response.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.responseNotFound, err);
                res.status(404).send(constants.responseNotFound);
            }
        });
};

