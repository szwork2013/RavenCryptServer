'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;

/**
 * Other users can respond to a Blog Post here
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            id: req.params.blogID
        }
    };

    model.Blog
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (post) {
            if (post) {
                if (post.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.postDeleted);
                    res.status(410).send(constants.postDeleted);
                } else {
                    postResponse();
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.postNotFound);
                res.status(404).send(constants.postNotFound);
            }
        });

    function postResponse() {
        model.BlogResponse
            .findOrCreate({
                where: {
                    user: req.params.user,
                    blogID: req.params.blogID,
                    name: req.params.name,
                    server: req.params.server,
                    id: req.params.id
                }, defauts: {
                    text: req.body.text,
                    keyID: req.body.keyID,
                    ip: req.ip
                }
            })
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.status(500).send(constants.modelOrDBError);
            })
            .success(function (response, created) {
                if (created) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).send();
                } else {
                    if (response.text != req.body.text || response.keyID != req.body.keyID) {
                        logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                        res.status(202).send(constants.uuidInUse);
                    } else {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.status(200).send();
                    }
                }
            });
    }

};


