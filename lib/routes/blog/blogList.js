'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;
var Sequelize = global.Sequelize;

/**
 * Lists 10 Blog posts created  "since"(lt). lists latest 10 if no since is given. can also list newer "since"(gt)
 */
module.exports = function (req, res) {
    var data = req.body;

    var condition = {
        attributes: ["id", "createdAt"], //this createdAt is for paging

        //since this is not a cached value, we don't need to list deleted
        where: {
            user: data.user,
            deleted: false
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
                res.status(403).send(constants.userDeleted);
            } else {
                getPosts();
            }
        });

    function getPosts() {
        var condition = {
            attributes: ["user", "id", "createdAt"], //this createdAt is for paging

            //since this is not a cached value, we don't need to list deleted
            where: {
                user: data.user,
                deleted: false
            },
            limit: config.validations.blog.listLimit,
            order: 'createdAt DESC'
        };

        if (req.query.since) {
            condition.where.createdAt.gte = req.query.since;
        } else if (req.query.before) {
            condition.where.createdAt.lte = req.query.before;
        }

        model.Blog
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
    }
};