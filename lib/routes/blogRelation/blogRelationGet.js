var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * returns a relation, identified by UserName and ID
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text","keyID", "deleted"],
        where: {
            user: req.params.user,
            name: req.params.name,
            server: req.params.server
        }
    };

    model.BlogRelation
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (relation) {
            if(relation) {
                if(relation.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.blogRelationDeleted);
                    res.status(410).send(constants.blogRelationDeleted);
                } else {
                    delete relation.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).json(relation.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.blogRelationNotFound);
                res.status(404).send(constants.blogRelationNotFound);
            }
        });
};