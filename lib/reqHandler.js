'use strict';

var getRawBody = require('raw-body');
var logger = global.logger;
var model = global.model;

/**
 * checks the user session to be created with the login key
 * this is meant to prevent data manipulation in case the loginKey changed.
 * its also the only way to ensure that if private key was stolen and the
 * admin had to reset the account to a different key, the attacker wont be able
 * to manipulate the data after a new public login key has been assigned
 */
var checkUserSession = function (req, res, options, next) {
    var condition = {
        attributes: ["deleted", "loginKeyID"],
        where: {
            name: req.session.user
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
                //this is unlikely to happen
                logger.rcLog(req, logger.rcLogType.error, constants.userNotFound);
                res.status(500).send(constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.status(403).send(constants.userDeleted);
            } else if (req.session.keyID != user.loginKeyID) {
                logger.rcLog(req, logger.rcLogType.warn, constants.sessionNotUsingLoginKeyID);
                res.status(403).send(constants.sessionNotUsingLoginKeyID);
            } else {
                next();
            }
        });
};

/**
 * authenticate a user
 */
var authenticate = function (req, res, options, next) {

    var authStatus = function (err, session) {
        if (err) {
            if (options.optionalAuth) {
                next();
            } else {
                logger.rcLog(req, logger.rcLogType.warn, err);
                res.status(403).send(err);
            }
        } else {
            req.session = session;
            if (options.checkSession) {
                checkUserSession(req, res, options, next);
            } else {
                next();
            }
        }
    };

    var checkSession = function (sessionHeader) {
        global.session.authenticate(sessionHeader, function (err, sessionObj) {
            if (err) {
                authStatus(err);
            } else {
                if (sessionObj.user != req.params.user) {
                    authStatus(constants.notYours)
                } else {
                    if (sessionObj.onlyWatch && !options.allowWatch) {
                        authStatus(constants.watcherNotAllowedHere)
                    } else {
                        authStatus(null, sessionObj);
                    }
                }
            }
        });
    };

    if (typeof req.headers.session !== "string") {
        authStatus(constants.reqHasNoSession);
    } else {
        var sessionErr;
        var sessionHeader;
        try {
            sessionHeader = JSON.parse(req.headers.session);
        } catch (err) {
            sessionErr = err;
        }
        if (sessionErr) {
            authStatus(constants.sessionIsNoJSON);
        } else {
            checkSession(sessionHeader);
        }
    }

};

/**
 * checks the body against the options
 */
var checkBody = function (req, res, options, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: options.limit,
        encoding: options.encoding
    }, function (err, string) {
        if (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.reqOutOfBounds, err);
            res.status(400).send(constants.reqOutOfBounds);
        } else {
            if (options.json) {
                try {
                    req.body = JSON.parse(string);
                } catch (err) {
                    logger.rcLog(req, logger.rcLogType.warn, constants.reqIsNotJson, err);
                    res.status(400).send(constants.reqIsNotJson);
                }
            } else {
                req.body = string;
            }
            next();
        }
    });
};

/**
 * little factory to build requests handlers
 */
module.exports = function (options) {
    if (options.limit === undefined) {
        options.limit = "15kb";
    }
    if (options.encoding === undefined) {
        options.encoding = "utf8";
    }
    if (options.json === undefined) {
        options.json = false;
    }
    if (options.auth === undefined) {
        options.auth = false;
    }
    if (options.optionalAuth === undefined) {
        options.optionalAuth = false;
    }
    if (options.allowWatch === undefined) {
        options.allowWatch = false;
    }
    if (options.passThrough === undefined) {
        options.passThrough = false;
    }
    if (options.checkSession === undefined) {
        options.checkSession = false;
    }
    if (options.next === undefined) {
        options.next = function (req, res, next) {
            next();
        };
    }

    var reqHandler;

    if (options.passThrough) {
        reqHandler = function (req, res, next) {
            if (options.auth) {
                authenticate(req, res, options, function () {
                    options.next(req, res, next);
                });
            } else {
                options.next(req, res, next);
            }
        };
    } else {
        reqHandler = function (req, res, next) {
            if (options.auth) {
                authenticate(req, res, options, function () {
                    checkBody(req, res, options, function () {
                        options.next(req, res, next);
                    });
                });
            } else {
                checkBody(req, res, options, function () {
                    options.next(req, res, next);
                });
            }
        };
    }

    return reqHandler;
};