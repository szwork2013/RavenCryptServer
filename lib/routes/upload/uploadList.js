'use strict';

var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;

var fs = require('fs');
var path = require('path');

/**
 * List all the physical files a user has stored on this server.
 */
module.exports = function (req, res) {
    var filePath = path.join(config.filePath, req.params.user);

    fs.readdir(filePath, function (err, fileNames) {
        if (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.status(500).send(constants.systemException);
        } else {
            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).json(fileNames);
        }
    });
};
