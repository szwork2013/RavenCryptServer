var os = require('os');
var path = require('path');

var enums = {};
enums.environmentModes = {
    test: 'test',
    development: 'development',
    productionTEST: 'productionTEST',
    production: 'production'
};
enums.clusterStores = {
    clusterhub: "clusterhub",
    redis: "redis"
};

var config = function(overrideEnviron){
    //gets filled from package.json
    this.version = null;

    // Run Modes ('development', test', 'production') //set to 'production' for a real world server
    this.environment = enums.environmentModes.development;
    //this.environment = enums.environmentModes.productionTEST;
    //this.environment = enums.environmentModes.production;

    //number of clustered processes to spawn. this should be the number of CPUs you want to handle incoming connections.
    //usually you do not want all of them to work on NodeJS, because you need some of them for the DataBase etc.
    this.numForks = null; //null = automatic detection, half the CPUs of the server by default

    //this indicates how the key/value store is set up.
    //if you run a single server it is recommended to use clusterhub, so all process in NodeJS can communicate directly to each other
    //if you run want to run multiple servers you must use redis.
    this.clusterStore = enums.clusterStores.clusterhub;

    //just out of pure interest, what kind of db people prefer.
    //gets auto filled from config.json, you don't need fill in anything here!
    this.dbType = null;
    //do not complain about never used. this is used ;)
    this.dbType = this.dbType;

    this.development = {};
    this.development.forceSyncModel = false; //works only in development mode

    this.web = {};
    this.log = {};

    this.web.portHTTPS = 1338;

    if(this.web.portHTTPS != 443)
        this.web.serverName = this.web.hostname + ":" + this.web.portHTTPS;
    else
        this.web.serverName = this.web.hostname;

    this.web.TLSMode = "RSA"; // possible: EC/RSA; (EC = Elliptic Curve)


    this.log.enabled = true; //turn of ANY logging.. including startup!
    this.log.file = false; //write log to file
    this.log.errorData = true; //log error data, very useful for developers.
    this.log.inputData = true; //logs input data, very useful for developers.
    this.log.user = true; //logs user, useful for developers.
    this.log.ip = true; //logs ips, useful but less anonymous
    //note on ips: the db also keeps track of ips on certain items, that can be input anonymously, which can not be turned off.
    //RC is intended to leak no metadata, but ips are intended to be a tool in the battle against SPAM, so we can BULK DELETE spam.
    //might be an issue for TOR users, but there is no other particle way.


    //Path for logs
    this.logPath = path.dirname(process.mainModule.filename) + "/logs/";

    //Path for Uploaded files.
    this.filePath = path.dirname(process.mainModule.filename) + "/files/";

    this.session = {};
    this.session.KeyRenewInterval = 32; //Interval is in Days!

    //Interval is in Days!
    this.userMsg = {};
    this.userMsg.cleanupInterval = 30;

    this.upload = {};
    this.upload.maxSize = 1024 * 1024 * 2;

    //this data doesn't need to be exposed, but should be.
    //I would love to know what OS my communication server runs and if its updated or not
    //this MIGHT however cause a danger for people who NEVER update their system..
    //if your one of those i probably don't want to let you host my server anyway. :)
    this.os = {};
    this.os.type = os.type();
    this.os.platform = os.platform();
    this.os.arch = os.arch();
    this.os.release = os.release();

    if(overrideEnviron) {
        this.environment = overrideEnviron;
    }

    this.isTestEnvironment = function() {
        return (
            this.environment == enums.environmentModes.test ||
            this.environment == enums.environmentModes.development ||
            this.environment == enums.environmentModes.productionTEST
        );
    };

    if (this.environment != enums.environmentModes.development &&
        this.environment != enums.environmentModes.productionTEST){
        //if not in development mode, delete the development namespace from config
        delete this.development;
    }

    this.enums = enums;
};

exports.config = config;