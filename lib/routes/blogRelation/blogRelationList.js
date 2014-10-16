var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var Sequelize = global.Sequelize;

/**
 * lists relations
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["name", "server"], //this createdAt is for paging

        //since this is not a cached value, we don't need to list deleted
        where: {
            user: req.params.user,
            deleted: false
        },
        limit: config.validations.blog.listLimit,
        order: 'createdAt DESC'
    };

    if (req.query.since) {
        condition.where.updatedAt = {};
        condition.where.updatedAt.gte = req.query.since;
    }

    model.BlogRelation
        .findAll(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (results) {
            var returnResults = [];

            for (var i = 0; i < results.length; i++) {
                returnResults.push(results[i].values);
            }

            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).json(returnResults);
        });
};




