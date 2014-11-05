'use strict';

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
            user: req.query.user,
            blogID: req.query.blogID,
            name: req.query.name,
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
        .success(function (post) {
            if (!post) {
                logger.rcLog(req, logger.rcLogType.debug, constants.responseNotFound);
                res.status(404).send(constants.responseNotFound);
            } else if (post.deleted) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            } else {
                post.review = null;
                post.reviewKeyID = null;

                post.deleted = true;
                post.updatedAt = helper.getUTCTime();
                post
                    .save()
                    .error(function (err) {
                        logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                        res.status(500).send(constants.modelOrDBError);
                    })
                    .success(function () {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.status(200).send();
                    });
            }
        });
};
