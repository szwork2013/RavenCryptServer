var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * review or hide a relation
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            blogID: req.params.blogID,
            name: req.params.name,
            server: req.params.server,
            id: req.params.id
        }
    };

    model.BlogResponse
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (post) {
            if(!post){
                logger.rcLog(req, logger.rcLogType.debug, constants.responseNotFound);
                res.send(404, constants.responseNotFound);
            } else if(post.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.responseDeleted);
                res.send(410, constants.responseDeleted);
            } else {
                post.review = req.body.review;
                post.reviewKeyID = req.body.reviewKeyID;

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
