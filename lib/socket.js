'use strict';

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

//can not use stict mode with socket.io
//https://github.com/Automattic/socket.io/issues/2120

module.exports = function (config, io, constants, db, logger, cluster, tooBusy, model) {
    /**
     In the cluster Scenario we need a redis store to hold our data!
     **/
    if (cluster.isWorker) {
        var redis = require('socket.io-redis');
        var redisOptions = require(__dirname + "/../config/redis.json");
        io.adapter(redis(redisOptions));
    }

    /**
     * Authorization and tooBusy.
     */
    io.use(function (socket, next) {
        //Reject Sockets if our Server can't handle the load..
        if (tooBusy()) {
            next(new Error(constants.serverIsBusy));
        } else {

            //TODO: remove before release
            if (config.isTestEnvironment()) {
                //these are ALWAYS strings. keep that in mind!

                //todo.. query params?
                if (socket.handshake.query.tinychat == "true") {

                    socket.handshake.tinyName = socket.handshake.query.tinyName;
                }
            }

            //if this connection supplies identity information check it here and refuse it if invalid
            if (socket.handshake.query.account !== undefined && socket.handshake.query.authentication !== undefined) {
                //attributes: ["profile", "profileKeyID", "deleted"],
                var condition = {
                    where: {
                        name: socket.handshake.query.account
                    }
                };

                model.User
                    .find(condition)
                    .error(function (err) {
                        logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                        res.status(500).send(constants.systemException);
                    })
                    .then(function (user) {
                        if (!user) {
                            logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                            res.status(404).send(constants.userNotFound);
                        } else if (user.deleted) {
                            logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                            res.status(403).send(constants.userDeleted);
                        } else {
                            if (user.authenticate(socket.handshake.query.authentication)) {
                                var req = {
                                    url: "/socket/connect",
                                    ip: socket.handshake.address.address
                                };
                                logger.rcLog(req, logger.rcLogType.warn, constants.socketAuthenticationFailed, err);
                                next(constants.socketAuthenticationFailed, false);
                            } else {
                                socket.handshake.user = user;
                                next(null, true);
                            }
                            logger.rcLog(req, logger.rcLogType.trace, constants.success);
                            res.status(200).json({profile: user.values.profile, keyID: user.values.profileKeyID});
                        }
                    });
            } else {
                next(null, true);
            }
        }
    });


    //tiny chat, only available in test mode, to check if sockets work.
    require("./io/ioTinyChat.js")(io, constants, db, logger, cluster);

    var remoteSockets = {};

    console.log("setup socket?");
    io.on('connection', function (socket) {
        console.log("connect socket?");
        var req = {
            url: "/socket/connect",
            ip: socket.handshake.address.address,
            session: socket.handshake.session
        };
        logger.rcLog(req, logger.rcLogType.trace, constants.socketConnected);

        /*if(!socket.handshake.tinyName) {
         socket.join('user/' + socket.handshake.session.user);
         }*/

        //if connection was authenticated join proper channel
        if (socket.handshake.session) {
            socket.join('user/' + socket.handshake.session.user);

            socket.on('joinRemoteCon', function (user, sever, conversationID) {
                //fake request, so we can log this using the standard method
                var req = {
                    url: "/socket/RemoteCon",
                    ip: socket.handshake.address.address,
                    session: socket.handshake.session
                };
                logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketOpened);

                if (!config.validations.server.regExp.test(server) || !config.validations.uuidV4.regExp.test(conversationID) || !config.validations.user.regExp.test(user)) {
                    socket.close();
                } else {
                    var mySocket;
                    if (remoteSockets[server]) {
                        mySocket = remoteSockets[server];
                        if (mySocket.connected) {
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

                        remoteSocket.on('connect', function () {
                            var req = {
                                url: "/socket/RemoteCon",
                                ip: socket.handshake.address.address
                            };

                            for (var i = 0; i < mySocket.sockets.length; i++) {
                                var socket = mySocket.sockets[i];
                                socket.emit("remoteSocketConnected", server, user, conversationID);
                            }

                            logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketOpened);

                            remoteSocket.join("joinCon", user, conversationID);

                            remoteSocket.on('conMsg', function (data) {
                                if (typeof data == "object" &&
                                    typeof data.user == "string" &&
                                    typeof data.user == "conversationID") {

                                    //important - client needs to check if message is from a remote server
                                    data.server = server;

                                    var listenerName = user + "/" + conversationID;

                                    remoteSockets[server].listenerSockets[listenerName].forEach(function (socket) {
                                        socket.emit('conMsg', data);
                                    });

                                } else {
                                    socket.close();
                                }
                            });

                            var cleanUpListeningSockets = function (msg) {
                                //clean up, clients will have to manually request reconnection

                                for (var i = 0; i < mySocket.sockets.length; i++) {
                                    var socket = mySocket.sockets[i];
                                    socket.emit(msg, server, user, conversationID);
                                    //clean up the listeners
                                    delete socket.rcListeners[server];
                                }

                                remoteSockets[server] = null;
                                remoteSocket = null
                            };

                            remoteSocket.on('disconnect', function () {
                                //inform connected sockets that remote connection broke up
                                logger.rcLog(req, logger.rcLogType.trace, constants.remoteSocketDisconnected);

                                cleanUpListeningSockets("remoteSocketDisconnected");
                            });

                            remoteSocket.on('error', function (err) {
                                logger.rcLog(req, logger.rcLogType.debug, constants.warn, err);

                                cleanUpListeningSockets("remoteSocketError");
                            });

                        });
                    }
                    var listenerName = user + "/" + conversationID;


                    if (!mySocket.listenerSockets[listenerName]) {
                        mySocket.listenerSockets[listenerName] = [];
                    }
                    if (mySocket.listenerSockets[listenerName].indexOf(socket) != -1) {
                        mySocket.listenerSockets[listenerName].push(socket);
                        //when the socket disconnects we need to remove its listeners

                        if (!socket.rcListeners) {
                            socket.rcListeners = {};
                        }
                        if (!socket.rcListeners[server]) {
                            socket.rcListeners[server] = [];
                        }
                        if (socket.rcListeners[server].indexOf(listenerName) != -1) {
                            socket.rcListeners[server].push(listenerName);
                        }
                    }
                }
            });
        }

        socket.on('disconnect', function () {
            logger.rcLog(req, logger.rcLogType.trace, constants.socketDisconnected);
        });
    });
};
