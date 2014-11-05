'use strict';

var config = global.config;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var helper = global.helper;

var fs = require('fs');
var Busboy = require('busboy');
var path = require('path');
var uuid = require('node-uuid');

//TODO outsource to external server for high traffic

/**
 * upload a file to the server
 */
module.exports = function (req, res) {
    //TODO:
    //If we want to save bigger files, we should probably
    //change this to progressively save them to disk to save memory
    //we should also check if the file exists and close the stream before receiving everything to save bandwidth.

    var busboyOptions = {
        headers: req.headers,
        limits: {
            fields: 0,
            files: 1,
            fieldNameSize: 100,
            fieldSize: 0,
            fileSize: config.upload.maxSize
        }
    };

    //https://github.com/mscdex/busboy
    var busboy = new Busboy(busboyOptions);
    var busboyCanceled = false;

    var files = [];

    busboy.on('file', function (fieldName, fileStream, fileName, encoding, mimeType) {
        var thisFile = {
            encoding: encoding,
            mimeType: mimeType,
            fileName: fileName,
            data: null
        };

        fileStream.on('data', function (data) {
            if (!busboyCanceled) {
                if (thisFile.data == null) {
                    thisFile.data = data;
                } else {
                    thisFile.data = Buffer.concat([thisFile.data, data]);
                }

                if (fileStream.truncated || thisFile.data.length >= busboyOptions.limits.fileSize) {
                    busboyCanceled = true;
                    busboy.end();
                    req.destroy();
                    logger.rcLog(req, logger.rcLogType.debug, constants.fileToBigOrTruncated);
                    res.status(400).send(constants.fileToBigOrTruncated);
                }
            }
        });
        fileStream.on('end', function () {
            files.push(thisFile);
        });
    });
    busboy.on('finish', function () {
        if (!busboyCanceled) {
            var userFolder = path.join(config.filePath, req.params.user);

            if (files.length != 1) {
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            } else {

                //could also be done on register, but then we might get a lot of empty folders.
                fs.mkdir(userFolder, null, function (err) {

                    // 47 = folder exists
                    if (err && err.errno != 47) {
                        logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                        res.status(500).send(constants.systemException);
                    } else {
                        var fileName = req.params.id;
                        var filePath = path.join(userFolder, fileName);

                        fs.exists(filePath, function (exists) {
                            if (exists) {
                                //very unlikely but if it so, we should fail!
                                logger.rcLog(req, logger.rcLogType.trace, constants.fileExists);
                                res.status(202).send(constants.fileExitsts);
                            } else {
                                fs.writeFile(filePath, files[0].data, {encoding: 'utf8'}, function (err) {
                                    if (err) {
                                        logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                                        res.status(500).send(constants.systemException);
                                    } else {
                                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                                        res.status(200).send();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });

    req.pipe(busboy);
};
