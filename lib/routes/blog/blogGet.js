var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;
var Sequelize = global.Sequelize;

/**
 * Get a specific BlogPost and 10 of its latest responses.
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["text",  "responseTo", "keyID", "deleted"],
        where: {
            user: req.params.user,
            id: req.params.id
        }
    };

    model.Blog
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (post) {
            if(post) {
                if(post.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.postDeleted);
                    res.send(410, constants.postDeleted);
                } else {
                    delete post.values.deleted;
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.json(200, post.values);
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.postNotFound);
                res.send(404, constants.postNotFound);
            }
        });
};

