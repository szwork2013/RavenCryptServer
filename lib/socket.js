var tooBusy = require('toobusy-js');
var io = require('socket.io').listen(global.server);
var config = global.config;
var constants = global.constants;
var session = global.session;
var logger = global.logger;
var model = global.model;

global.io = io;

//don't set this to true. let just log what we need, by handling the events.
//io.settings.log = false;
//default SOCKET.IO options..  (i hope)
//io.enable('browser client minification'); // send minified client
//io.enable('browser client etag'); // apply etag caching logic based on version number
//io.enable('browser client gzip'); // gzip the file
//io.set('log level', 1); // reduce logging
//io.set('transports', [ // enable all transports (optional if you want flashsocket)
//    'websocket'
//    , 'flashsocket'
//    , 'htmlfile'
//    , 'xhr-polling'
//    , 'jsonp-polling'
//]);


//MIGRATION HELP! DEEPLY APPRECIATED!!!!!!
//http://socket.io/docs/migrating-from-0-9/

/**
 * Authorization and tooBusy.
 */
io.use(function(socket, next) {
    var handshakeData = socket.request;

    //Reject Sockets if our Server can't handle the load..
    if(tooBusy()){
        next(new Error(constants.serverIsBusy));
    } else {

        //TODO: remove before release
        if(config.isTestEnvironment()) {
            //these are ALWAYS strings. keep that in mind!
            if (handshakeData.query.tinychat == "true" &&
                handshakeData.query.chattiny == "true") {

                handshakeData.tinyName = handshakeData.query.tinyName;
            }
        }

        //if this connection supplies identity information check it here and refuse it if invalid
        if(handshakeData.query.sessionKeyID !== undefined && handshakeData.query.encrypted !== undefined) {
            var error;
                var sessionObj = {
                    sessionKeyID: parseInt(handshakeData.query.sessionKeyID),
                    encrypted: handshakeData.query.encrypted
                };
                session.authenticate(sessionObj, function(err, session){
                    if(err){
                        var req = {
                            url: "/socket/connect",
                            ip: handshakeData.address.address
                        };
                        logger.rcLog(req, logger.rcLogType.warn, constants.socketAuthenticationFailed, err);
                        next(constants.socketAuthenticationFailed, false);
                    } else {
                        handshakeData.session = session;
                        next(null, true);
                    }
                });
        } else {
            next(null, true);
        }
    }
});




/**
    In the cluster Scenario we need a redis store to hold our data!
**/
if(global.cluster.isWorker){
    var redis = require('socket.io-redis');
    var redisOptions = require("./config/redis.json");
    io.adapter(redis(redisOptions));
}


//tiny chat, only available in test mode, to check if sockets work.
require("./io/ioTinyChat.js");

var ioRoutes = {};

io.sockets.on('connection', function (socket) {
    var req = {
        url: "/socket/connect",
        ip: socket.handshake.address.address,
        session: socket.session
    };
    logger.rcLog(req, logger.rcLogType.trace, constants.socketConnected);

    /*if(!socket.handshake.tinyName) {
        socket.join('user/' + socket.handshake.session.user);
    }*/

    //if connection was authenticated join proper channel
    if(socket.handshake.session) {
        socket.join('user/' + socket.handshake.session.user);
    }

    socket.on('joinCon', function(user, conversationID){
        //fake request, so we can log this using the standard method
        var req = {
            url: "/socket/joinCon",
            ip: socket.handshake.address.address,
            session: socket.handshake.session
        };

        //close socket down, if user supplies invalid information.
        if(config.validations.uuidV4.length > conversationID.length || !config.validations.uuidV4.regExp.test(conversationID)){
            logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect);
            socket.close();
        } else if(!config.validations.user.regExp.test(user)){
            logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect);
            socket.close();
        } else {
            var condition = {
                attributes: ["deleted"],
                where: {
                    user: user,
                    id: conversationID
                }
            };

            model.ConversationManifest.
                find(condition)
                .error(function(err){
                    logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                })
                .success(function(manifest){
                    if(manifest){
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        if(!manifest.deleted) {
                            socket.join('con/' + user + "/" + conversationID);
                        }
                    } else {
                        logger.rcLog(req, logger.rcLogType.debug, constants.manifestNotFound);
                        socket.close();
                    }
                })
        }

    })

});

module.exports = ioRoutes;

