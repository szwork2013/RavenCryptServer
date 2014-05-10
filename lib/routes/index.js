var logger = global.logger;

const apiVersion = "1.0";

/**
 * Return AppName, ApiVersion and ServerVersion
 */
module.exports = function (req, res) {
    var appData = {
        appName: "RavenCrypt",
        serverVersion: config.version,
        apiVersion: apiVersion
    };

    logger.rcLog(req, logger.rcLogType.trace, constants.success);
    res.json(200, appData);
};