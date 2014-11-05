'use strict';

var config = global.config;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var helper = global.helper;

var fs = require('fs');
var path = require('path');

//TODO outsource to external server for high traffic

/**
 * returns a file
 */
module.exports = function (req, res) {
    var filePath = path.join(config.filePath, req.params.user, req.params.id);

    fs.exists(filePath, function (exists) {
        if (!exists) {
            logger.rcLog(req, logger.rcLogType.debug, constants.fileNotFound, exists);
            res.status(404).send(constants.fileNotFound);
        } else {
            //the client already knows the header data either from the message or because its his file,
            //so no need to set it here

            logger.rcLog(req, logger.rcLogType.trace, constants.success);

            var fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        }
    });
};
