'use strict';

let cluster = require('cluster');
let sockio = require("socket.io");
let tls = require('tls');
let log4js = require('log4js');
let Sequelize = require("sequelize");
let fs = require('fs');
var os = require('os');
var path = require('path');

let config = require("./config/config.js")(os, path);
let pjson = require("./package.json");

//let openpgp = require('openpgp');
//require("./lib/pgpoptions.js")(openpgp,config);

config.version = pjson.version;
config.validations = require("./config/validations.js")(config);
let TLSOptions = require("./config/TSLOptions.js")(config, fs); //private key file referenced here

let logger = require("./lib/logger.js")(config, log4js);
//let helper = require("./lib/helper.js")(openpgp);

//-----------------------------------------------------
//------------------Server Startup---------------------
//-----------------------------------------------------

logger.info("Setting up Database Connection..");
let db = require("./lib/db.js")(config, logger, Sequelize);
logger.info("Defining Model.. ");
let model = require("./lib/model.js")(config, db);

//SocketIo
let TLSServer = tls.createServer(TLSOptions);
//let server = tls.createServer(TLSOptions, function (cleartextStream) {
//    /*
//     console.log('server connected',1
//     cleartextStream.authorized ? 'authorized' : 'unauthorized');
//     //cleartextStream.write("welcome!\n");
//     cleartextStream.setEncoding('utf8');*/
//    cleartextStream.pipe(cleartextStream);
//});

let ioHTTP = sockio();
let ioHTTPS = sockio.listen(TLSServer);
let constants = require("./lib/constants.js");

logger.info("Adding Socket Endpoints for HTTP");
require("./lib/socket.js")(ioHTTP, constants, db, logger, cluster);
logger.info("Adding Socket Endpoints for HTTPS");
require("./lib/socket.js")(ioHTTPS, constants, db, logger, cluster);

logger.info("RavenCrypt Server " + config.version + " Starting...");

if (cluster.isMaster) {
    setUpMaster();

} else {
    //worker
    setUpWorker();
}

function getNumForks() {
    if (config.numForks)
        return config.numForks;

    //use half the number of CPUs present
    var numCPUs = require('os').cpus().length;
    var numThreads = parseInt(numCPUs / 2);
    //use at least one CPU, otherwise this makes no sense :)
    if (numThreads == 0) {
        numThreads = 1;
    }
    return numThreads;
}

function setUpMaster() {

    //in case one of our worker dies, we will just restart it. we are NEVER going down. awesome. fuck yeah! -> this is not a challenge
    //we are going down on overload, or if somebody finds a horrible fuckup, you don't need to prove this statement wrong ^^
    cluster.on('exit', function (worker, code, signal) {
        if (worker.suicide)
            return; //worker was killed for a reason, do not restart
        var exitCode = worker.process.exitCode;
        console.log('worker ' + worker.process.pid + ' died (' + exitCode + '). restarting...');
        cluster.fork();
    });

    //make sure, if the main process exits, we kill all workers
    process.on('exit', function () {
        function eachWorker(callback) {
            for (var id in cluster.workers) {
                callback(cluster.workers[id]);
            }
        }

        eachWorker(function (worker) {
            worker.kill();
        });

    });

    setUp(function (err) {
        if (err) {
            //something mus have went horribly wrong!
            process.exit();
        }

        global.logger.info("Triggering Master SessionKey generation, for server start..");
        global.session.updateKeys(function (err) {
            if (err) {
                global.logger.error(err);
                process.exit(-1);
            }

            //next step is either to fork our workers or start our master itself as a worker
            if (config.environment == config.enums.environmentModes.development ||
                config.environment == config.enums.environmentModes.test) {

                //if we are in these test environments the server will also start as a worker so we can debug it
                setUpWorker();

            } else {
                //we are in a production environment, lets start our workers!

                var numForks = getNumForks();

                // Fork workers.
                for (var i = 0; i < numForks; i++) {
                    global.logger.info("worker " + i + " forked")
                    cluster.fork();
                }
            }
        });
    });
}

function setUpWorker() {

    process.on('message', function (msg) {
        if (msg == "updateServerSessionKeys")
            global.logger.info("Master requested SessionKey update, syncing now!");
        global.session.updateKeys(function (err) {
            if (err)
                global.logger.error(err);
        });
    });


    global.logger.info("Triggering Worker SessionKey update, for server start..");
    global.session.updateKeys(function (err) {
        if (err) {
            global.logger.error(err);
            process.exit(-1);
        }
        finishSetup();
    });

    function finishSetup() {
        //enable logger after master initialization is done
        global.logger.setLevel(require('log4js').levels.TRACE);

        // Workers can share any TCP connection
        //means, multiple server instances listening on the same port, sharing the load. :-)
        startServer();
    }
}

function setUp(callback) {
    //DB Sync (will try to run migrations if not in dev mode!)
    //if successful the server will start
    if (config.environment == config.enums.environmentModes.development ||
        config.environment == config.enums.environmentModes.productionTEST) {
        global.logger.info("Trying to syncing underlying Database Schema with Object Model..");
        global.db.sequelize
            .sync({force: config.development.forceSyncModel}).then(function onFulfilment() {
                startJobs();
            },function onError(err) {
                global.logger.log("Could not Sync Model: \n" + err);
                throw err;
            });
    } else {
        //if not in dev mode, we need to migrate our model with sequelize.
        //therefor syncing it would be useless. if we force sync we also loose
        //all the data here, and that shouldn't happen in test/production mode.
        startJobs();
    }

    function startJobs() {
        global.logger.info("Queuing and starting Jobs..!");
        global.masterJobs = require("./lib/masterJobs.js");
        callback(null);
    }
}

//and last but not least open ports for users to connect
function startServer() {

    //global.workerJobs = require("./lib/workerJobs.js");

    try {
        var workerID = "";
        if (cluster.isWorker) {
            workerID = cluster.worker.id + ": ";
        }

        ioHTTP.listen(config.web.portHTTP);
        //server.listen(config.web.portHTTPS, function() {
        //    console.log('server bound');
        //});
        TLSServer.listen(config.web.portHTTPS);

        global.logger.info(workerID + "RavenCrypt Server Server listening on https://127.0.0.1:" + config.web.portHTTPS + " and http://127.0.0.1:" + config.web.portHTTP);

    } catch (err) {
        global.logger.info("Couldn't start Server:" + err);
        throw err;
    }
}
