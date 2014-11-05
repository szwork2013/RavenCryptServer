'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

/**
 * Check if user Exists,
 * 0 = doesn't exists
 * 1 = exists
 * 2 = exists in register (is not a full user YET)
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            name: req.params.user
        }
    };

    model.User
        .count(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        })
        .success(function (count) {
            if (count > 0) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send("1");
            } else {
                checkUserRegister();
            }
        });

    function checkUserRegister() {
        model.UserRegister
            .count(condition)
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .success(function (count) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                if (count > 0) {
                    //user register exists
                    res.status(200).send("2");
                } else {
                    //user does not exist
                    res.status(200).send("0");
                }
            });
    }
};