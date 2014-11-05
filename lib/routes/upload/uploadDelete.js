'use strict';

var config = global.config;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var helper = global.helper;

var fs = require('fs');
var path = require('path');

/**
 * delete an uploaded file
 */
module.exports = function (req, res) {
    var filePath = path.join(config.filePath, user, req.params.id);

    fs.unlink(filePath, function (err) {
        if (err) {
            logger.rcLog(req, logger.rcLogType.debug, constants.fileNotFound, err);
            res.status(404).send(constants.fileNotFound);
        } else {
            logger.rcLog(req, logger.rcLogType.trace, constants.success);
            res.status(200).send();
        }
    });
};

