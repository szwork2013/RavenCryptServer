var tooBusy = require('toobusy-js');
var io = require('socket.io').listen(global.server);
var ioClient = require('socket.io-client');

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



//TODO
//SOCKET PROXY
//allow users to send a message, on what the server will atempt to open/reuse a socket connection
//to the remote server and listen on it for new messages, so our user has to only keep one socket open


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

var remoteSockets = {};


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

        socket.on('joinRemoteCon', function(user, sever, conversationID) {
            //fake request, so we can log this using the standard method
            var req = {
                url: "/socket/RemoteCon",
                ip: socket.handshake.address.address,
                session: socket.handshake.session
            };
            logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketOpened);

            //todo
            //validate server/user/conversationID

            var mySocket;
            if(remoteSockets[server]){
                mySocket = remoteSockets[server];
                if(mySocket.connected){
                    socket.emit("remoteSocketConnected", user, conversationID);
                }
            } else {
                var remoteSocket = ioClient('https://' + server, {reconnection: false});
                mySocket = {
                    listenerSockets: {},
                    sockets: [],
                    socket: remoteSocket
                };
                remoteSockets[server] = mySocket;

                remoteSocket.on('connect', function(){
                    var req = {
                        url: "/socket/RemoteCon",
                        ip: socket.handshake.address.address
                    };

                    for(var i=0;i<mySocket.sockets.length;i++){
                        var socket = mySocket.sockets[i];
                        socket.emit("remoteSocketConnected", user, conversationID);
                    }

                    logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketOpened);

                    remoteSocket.join("joinCon", user, conversationID);

                    remoteSocket.on('conMsg', function(data){
                        if(typeof data == "object" &&
                           typeof data.user == "string" &&
                           typeof data.server == "string"){

                            var listenerName = user + "/" + conversationID;

                            remoteSockets[server].listenerSockets[listenerName].forEach(function(socket){
                                socket.emit('conMsg', data);
                            });

                        } else {
                            socket.close();
                        }
                    });

                    var cleanUpListeningSockets = function(msg){
                        //clean up, clients will have to manually request reconnection

                        for(var i=0;i<mySocket.sockets.length;i++){
                            var socket = mySocket.sockets[i];
                            socket.emit(msg, user, conversationID);
                            //clean up the listeners
                            delete socket.rcListeners[server];
                        }

                        remoteSockets[server] = null;
                        remoteSocket = null
                    };

                    remoteSocket.on('disconnect', function(){
                        //inform connected sockets that remote connection broke up
                        logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketDisconnected);

                        cleanUpListeningSockets("remoteSocketDisconnected");
                    });

                    remoteSocket.on('error', function(err){
                        logger.rcLog(req, logger.rcLogType.debug, constants.warn, err);

                        cleanUpListeningSockets("remoteSocketError");
                    });

                });
            }
            var listenerName = user + "/" + conversationID;


            if(!mySocket.listenerSockets[listenerName]){
                mySocket.listenerSockets[listenerName] = [];
            }
            if(mySocket.listenerSockets[listenerName].indexOf(socket) != -1){
                mySocket.listenerSockets[listenerName].push(socket);
                //when the socket disconnects we need to remove its listeners

                if(!socket.rcListeners){
                    socket.rcListeners = {};
                }
                if(!socket.rcListeners[server]){
                    socket.rcListeners[server] = [];
                }
                if(socket.rcListeners[server].indexOf(listenerName) != -1){
                    socket.rcListeners[server].push(listenerName);
                }
            }
        });
    }

    socket.on('disconnect', function () {
        if(socket.rcListeners){
            for(var serverName in socket.rcListeners){
                for(var i=0;i<socket[serverName].rcListeners.length;i++){
                    var listenerName = socket[serverName].rcListeners[i];
                    var idx = remoteSockets[server].listenerSockets.indexOf(listenerName);
                    if(idx > 0){
                        remoteSockets[server].listenerSockets.splice(idx, 1);
                    }
                    if(remoteSockets[server].listenerSockets.length = 0){
                        remoteSockets[server].socket.close(); //or disconnect? should be close
                        delete remoteSockets[server];
                        break;
                    }
                }
            }
        }

        //todo: log the disconnect

    });


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




// more intelligent socket proxy method
// saved for maybe later.. intelligent, but not failure save in any way
// if a worker process dies we get major problems that are not easy to fix.
/*
socket.joinedRooms = [];

socket.on('joinRemoteCon', function(user, sever, conversationID) {
    //fake request, so we can log this using the standard method
    var req = {
        url: "/socket/RemoteCon",
        ip: socket.handshake.address.address,
        session: socket.handshake.session
    };

    //todo
    //validate server/user/conversationID

    var roomName = '/socketRemoteCon/' + user + "/" + server + "/" + conversationID;

    if(socket.joinedRooms.indexOf(roomName) != -1){
        //user already joined this room
        return;
    }

    var room = io.sockets.in(roomName);
    var count = io.of(roomName).sockets.length;

    if(count == 0){
        room.on('join', function() {

        });
        room.on('leave', function() {

        });
        room.on('closeSockets', function () {

        });

        var remoteSocket = require('socket.io-client')('http://' + server + "/user/" + user + "/conversation/" + conversationID);
        remoteSocket.on('connect', function(){
            //todo catch other conversation events
            remoteSocket.on('event', function(data){
                socket.emit(data)
            });
            remoteSocket.on('disconnect', function(){
                var count = io.of(roomName).sockets.length;
                if(count != 0) {
                    reconnect()
                }
            });
        });
    }

    socket.join(roomName);
    socket.broadcast.to(roomName).emit('join');*/
