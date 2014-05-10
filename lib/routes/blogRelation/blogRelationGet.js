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
            res.send(500, constants.systemException);
        })
        .success(function (relation) {
            if(relation) {
                if(relation.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.blogRelationDeleted);
                    res.send(410, constants.blogRelationDeleted);
                } else {
                    delete relation.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, relation.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.blogRelationNotFound);
                res.send(404, constants.blogRelationNotFound);
            }
        });
};