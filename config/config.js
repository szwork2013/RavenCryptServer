'use strict';

let enums = {
    environmentModes: {
        test: 'test',
        development: 'development',
        productionTEST: 'productionTEST',
        production: 'production'
    },
    clusterStores:{
        'default:': "default",
        redis: "redis"
    }
};

module.exports = function (os, path, overrideEnviron) {
    var config = {};

    //gets filled from package.json
    config.version = null;

    // Run Modes ('development', test', 'production')
    config.environment = enums.environmentModes.development;

    //set to 'production' for a real world server
    //these are CLUSTERED modes. you need to set up redis for config
    //config.environment = enums.environmentModes.productionTEST;
    //config.environment = enums.environmentModes.production;

    //IMPORTANT:
    //If you do clustering you need to setup redis!!
    //If you do clustering you need to setup redis!!
    //If you do clustering you need to setup redis!!
    //If you do clustering you need to setup redis!!
    //see redis.json

    //number of clustered processes to spawn. config should be the number of CPUs you want to handle incoming connections.
    //usually you do not want all of them to work on NodeJS, because you need some of them for the DataBase etc.
    config.numForks = null; //null = automatic detection, half the CPUs of the server by default

    config.dbType = null;

    config.development = {};
    config.development.forceSyncModel = false; //works only in development mode

    config.web = {};
    config.log = {};

    config.web.portHTTPS = 1338;
    config.web.portHTTP = 13380;

    if (config.web.portHTTPS != 443)
        config.web.serverName = config.web.hostname + ":" + config.web.portHTTPS;
    else
        config.web.serverName = config.web.hostname;

    config.web.TLSMode = "RSA"; // possible: EC/RSA; (EC = Elliptic Curve)


    config.log.enabled = true; //turn of ANY logging.. including startup!
    config.log.DBenabled = false; //turns of db logging
    config.log.file = false; //write log to file
    config.log.errorData = true; //log error data, very useful for developers.
    config.log.inputData = true; //logs input data, very useful for developers.
    config.log.user = true; //logs user, useful for developers.
    config.log.ip = true; //logs ips, useful but less anonymous
    //note on ips: the db also keeps track of ips on certain items, that can be input anonymously, which can not be turned off.
    //RC is intended to leak no metadata, but ips are intended to be a tool in the battle against SPAM, so we can BULK DELETE spam.
    //might be an issue for TOR users, but there is no other particle way.


    //Path for logs
    config.logPath = path.dirname(process.mainModule.filename) + "/logs/";

    //Path for Uploaded files.
    config.filePath = path.dirname(process.mainModule.filename) + "/files/";

    config.session = {};
    config.session.KeyRenewInterval = 32; //Interval is in Days!

    //Interval is in Days!
    config.userMsg = {};
    config.userMsg.cleanupInterval = 30;

    config.upload = {};
    config.upload.maxSize = 1024 * 1024 * 2;

    //config data doesn't need to be exposed, but should be.
    //I would love to know what OS my communication server runs and if its updated or not
    //config MIGHT however cause a danger for people who NEVER update their system..
    //if your one of those i probably don't want to let you host my server anyway. :)
    config.os = {};
    config.os.type = os.type();
    config.os.platform = os.platform();
    config.os.arch = os.arch();
    config.os.release = os.release();

    if (overrideEnviron) {
        config.environment = overrideEnviron;
    }

    config.isTestEnvironment = function () {
        return (
            config.environment == enums.environmentModes.test ||
            config.environment == enums.environmentModes.development ||
            config.environment == enums.environmentModes.productionTEST
            );
    };

    if (config.environment != enums.environmentModes.development &&
        config.environment != enums.environmentModes.productionTEST) {
        //if not in development mode, delete the development namespace from config
        delete config.development;
    }

    config.enums = enums;

    return config;
};
