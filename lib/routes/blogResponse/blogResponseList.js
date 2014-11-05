'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;
var Sequelize = global.Sequelize;

/**
 * List latest 10 blog responses, but, if the user wishes it, only those that were reviewed by him
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["deleted", "reviewBlogResponses", "createdAt"],
        where: {
            user: req.params.user
        }
    };

    model.User
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                res.status(404).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(410).send(constants.userDeleted);
            } else {
                getResponses(user);
            }
        });

    function getResponses(user) {
        var condition = {
            attributes: ["id", "name", "saver", "review", "reviewKeyID", "createdAt"], //this createdAt is for paging

            //since this is not a cached value, we don't need to list deleted
            where: {
                user: req.params.user,
                blogID: req.params.blogID,
                deleted: false
            },
            limit: config.validations.blogResponse.listLimit,
            order: 'createdAt DESC'
        };

        if (req.query.since) {
            condition.where.createdAt.gte = req.query.since;
        } else if (req.query.before) {
            condition.where.createdAt.lte = req.query.before;
        }

        if (!req.session && !req.session.name) {
            //if the user wishes it only list the responses that were reviewed.
            if (user.reviewBlogResponses) {
                condition.where.review = {
                    ne: null //means not null
                }
            }
        }

        model.BlogResponse
            .findAll(condition)
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .success(function (results) {
                var returnResults = [];

                for (var i = 0; i < results.length; i++) {
                    if (!results[i].values.review) {
                        delete results[i].values.review;
                    }
                    if (!results[i].values.reviewKeyID) {
                        delete results[i].values.reviewKeyID;
                    }

                    returnResults.push(results[i].values);
                }

                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).json(returnResults);
            });
    }
};