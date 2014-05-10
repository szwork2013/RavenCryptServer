var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;
var helper = global.helper;

/**
 * Mark a Blog post as deleted.
 */
module.exports = function (req, res) {
    var condition = {
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
            if(!post) {
                logger.rcLog(req, logger.rcLogType.debug, constants.postNotFound);
                res.send(404, constants.postNotFound);
            } else if(post.deleted) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            } else {
                //do not overwrite metadata here.

                post.deleted = true;
                post.updatedAt = helper.getUTCTime();

                post
                    .save()
                    .error(function (err) {
                        logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                        res.send(500, constants.modelOrDBError);
                    })
                    .success(function () {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.send(200);
                    });
            }
        });
};