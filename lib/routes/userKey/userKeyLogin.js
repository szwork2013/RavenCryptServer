var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var session = global.session;
var config = global.config;

/**
 * Generates a server only readable encrypted login session, encrypts it with the public key of the user and returns it.
 * Can be given a query parameter so that session will be only allowed to only watch things, not change them.
 */
module.exports = function (req, res) {
    if(!req.query.onlyWatch){
        req.query.onlyWatch = false;
    }

    //get the current session encryption key from our stack
    //a user can have multiple valid sessions created with different serverSessionKeyIDs,
    //however they are only generated on the first login request, once a new server session key has been created by the server.
    //on all other requests the generated session is taken from the cached field in the db
    var ServerSessionKey = session.skeys[session.skeyIDs[0]];

    model.UserLogin
        .findOrCreate({
            user: req.params.user,
            keyID: req.params.id,
            onlyWatch: req.query.onlyWatch,
            sessionKeyID: ServerSessionKey.id
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.status(500).send(constants.modelOrDBError);
        })
        .success(function (userLogin, created) {
            if (!created && (userLogin.cached != null) && (userLogin.validUntil >= new Date())) {

                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                //our user already has a session and its cached, so lets send it to him
                res.status(200).send(userLogin.cached);
            } else {
                createLogin(userLogin);
            }
        });

    function createLogin(userLogin) {
        var condition = {
            attributes: ["deleted", "loginKeyID"],
            where: {
                name: req.params.user
            }
        };

        model.User
            .find(condition)
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                res.status(500).send(constants.systemException);
            })
            .success(function (user) {
                if (!user) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                    res.status(404).send(constants.userNotFound);
                } else if(user.deleted) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                    res.status(410).send(constants.userDeleted);
                } else if(req.params.id != user.loginKeyID) {
                    logger.rcLog(req, logger.rcLogType.debug, constants.notTheLoginKey);
                    res.status(403).send(constants.notTheLoginKey);
                } else {
                    var condition = {
                        where: {
                            user: req.params.user,
                            id: user.loginKeyID
                        }
                    };

                    model.UserKey
                        .find(condition)
                        .error(function (err) {
                            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                            res.status(500).send(constants.systemException);
                        })
                        .success(function (userKey) {
                            if (!userKey) {
                                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                                res.status(404).send(constants.userKeyNotFound);
                            } else {

                                //find out how long it should be valid
                                var now = new Date();
                                userLogin.validUntil = new Date(now.setDate(now.getDate() + config.session.KeyRenewInterval));

                                //create a session for our user
                                var sessionObj = {
                                    user: userLogin.user,
                                    keyID: userLogin.keyID,
                                    validUntil: userLogin.validUntil
                                };

                                if(req.query.onlyWatch){
                                    sessionObj.onlyWatch = true;
                                }

                                var sessionJSON = JSON.stringify(sessionObj);

                                //encrypt it wth our server session key
                                var encryptedSession = ServerSessionKey.encrypt(sessionJSON);

                                //turn our whole construct into a message for the user, also add what key we used so we will know what to
                                //use to decrypt it later and tell the user when it won't be valid anymore
                                var msg = {
                                    validUntil: userLogin.validUntil,
                                    sessionKeyID: userLogin.sessionKeyID,
                                    encrypted: encryptedSession
                                };

                                //encrypt it with the users public key
                                try {
                                    var jsonMsg = JSON.stringify(msg);
                                    var pgpMsg = userKey.write_encrypted_message(jsonMsg);
                                } catch (err) {
                                    //the key should have been validated enough at this point that this never happens, but this is code, you never know.
                                    logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
                                    return res.status(500).send(constants.systemException);
                                }

                                //cache the pgp result in the database
                                userLogin.cached = pgpMsg;

                                userLogin
                                    .save()
                                    .error(function (err) {
                                        logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                                        res.status(500).send(constants.modelOrDBError);
                                    })
                                    .success(function () {
                                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                                        res.status(200).send(pgpMsg);
                                    });
                            }

                        }
                    );
                }
            });
    }
};