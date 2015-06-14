'use strict';

//docu:
//https://github.com/nomiddlename/log4js-node

//more detailed, but not node specific:
//http://log4js.berlios.de/docu/users-guide.html

//levels:
//Log4js    Log Levels Log4js.Level	Description
//OFF	    nothing is logged
//FATAL	    fatal errors are logged
//ERROR	    errors are logged
//WARN	    warnings are logged
//INFO	    infos are logged
//DEBUG	    debug infos are logged
//TRACE	    traces are logged

//this is no level in the nodejs version:
//ALL	    everything is logged



//my initial idea was just to activate this and elevate the log level above it, but this sets it to info,
//and to have that spam on info sucks.
//log4js.replaceConsole();

//that's why we do it this way and log the spam to trace:

module.exports = function (config, log4js) {
    let logger = log4js.getLogger('server');

    //everything should go into our log, nothing should land on the console
    console.log = function (text) {
        logger.trace(text);
    };

    if (config.log.file) {
        log4js.loadAppender('file');
        log4js.addAppender(log4js.appenders.file(config.logPath + 'server.log'), 'server');
    }

    //do cluster logging differently (!config.log.enabled || global.cluster.isWorker)
    if (!config.log.enabled) {
        global.logger.setLevel(log4js.levels.OFF);
    }

    Object.defineProperty(Error.prototype, 'toObject', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true
    });

    function formatJSONCSVLine(req, exceptionConstant, errorData) {
        var text = "";

        if (req.method) {
            text += req.method;
        }
        text += ";";
        if (req.url) {
            text += req.url;
        }
        text += ";";

        if (config.log.ip && req.ip) {
            text += req.ip;
        }
        text += ";";

        if (config.log.user && req.session) {
            text += req.session.user;
        }
        text += ";";

        if (exceptionConstant) {
            text += JSON.stringify(exceptionConstant);
        }
        text += ";";

        if (config.log.errorData && errorData) {
            var errorObject;
            if (typeof errorData == Error) {
                errorObject = errorData.toObject();
            } else {
                errorObject = errorData;
            }
            var error = JSON.stringify(errorObject);
            error = error.replace(";", " ");
            error = error.replace(/\n/g, " ");
            text += error;
        }
        text += ";";

        if (config.log.inputData && req.body) {
            var data = JSON.stringify(req.body);
            data = data.replace(";", " ");
            data = data.replace(/\n/g, " ");
            text += data;
        }

        return text;
    }

    var rcLogType = {
        trace: "trace",
        debug: "debug",
        info: "error",
        warn: "warn",
        error: "error",
        fatal: "fatal"
    };
    logger.rcLogType = rcLogType;

    logger.rcLog = function (req, logType, exceptionConstant, errorData) {
        var entry = formatJSONCSVLine(req, exceptionConstant, errorData);
        switch (logType) {
            case rcLogType.debug:
                logger.debug(entry);
                break;
            case rcLogType.info:
                logger.info(entry);
                break;
            case rcLogType.warn:
                logger.warn(entry);
                break;
            case rcLogType.error:
                logger.error(entry);
                break;
            case rcLogType.fatal:
                logger.fatal(entry);
                break;
            case rcLogType.trace:
            default:
                logger.trace(entry);
        }

    };

    return logger;
};
