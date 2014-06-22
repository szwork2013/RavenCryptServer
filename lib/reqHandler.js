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
            res.send(500, constants.systemException);
        })
        .success(function (user) {
            if (!user) {
                //this is unlikely to happen
                logger.rcLog(req, logger.rcLogType.error, constants.userNotFound);
                res.send(500, constants.userNotFound);
            } else if (user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.send(403, constants.userDeleted);
            } else if (req.session.keyID != user.loginKeyID) {
                logger.rcLog(req, logger.rcLogType.warn, constants.sessionNotUsingLoginKeyID);
                res.send(403, constants.sessionNotUsingLoginKeyID);
            } else {
                next();
            }
        });
};

/**
 * authenticate a user
 */
var authenticate = function (req, res, options, next) {
    var error;

    try{
        if(typeof req.headers.session !== "string") {
            throw  constants.reqHasNoSession;
        }

        var sessionHeaderJson = req.headers.session;
        try{
            var sessionHeader = JSON.parse(sessionHeaderJson);
        } catch (err) {
            throw constants.sessionIsNoJSON;
        }

        req.session = global.session.authenticate(sessionHeader);

        if(req.params.user != req.session.user){
            throw constants.notYours;
        }

        if(req.session.onlyWatch && !options.allowWatch){
            throw constants.watcherNotAllowedHere;
        }
    } catch(err){
        if(options.optionalAuth) {
            next();
        } else {
            error = err;
            logger.rcLog(req, logger.rcLogType.warn, err);
            res.send(403, err);
        }
    }

    if(!error) {
        if(options.checkSession) {
            checkUserSession(req, res, options, next);
        } else {
            next();
        }
    }
};

/**
 * checks the body against the options
 */
var checkBody = function(req, res, options, next) {
    getRawBody(req, {
        length: req.headers['content-length'],
        limit: options.limit,
        encoding: options.encoding
    }, function (err, string) {
        if (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.reqOutOfBounds, err);
            res.send(400, constants.reqOutOfBounds);
        } else {
            if (options.json) {
                try {
                    req.body = JSON.parse(string);
                } catch (err) {
                    logger.rcLog(req, logger.rcLogType.warn, constants.reqIsNotJson, err);
                    res.send(400, constants.reqIsNotJson);
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
module.exports = function (options){
    if(options.limit === undefined) {
        options.limit = "15kb";
    }
    if(options.encoding === undefined){
        options.encoding = "utf8";
    }
    if(options.json === undefined){
        options.json = false;
    }
    if(options.auth === undefined){
        options.auth = false;
    }
    if(options.optionalAuth === undefined){
        options.optionalAuth = false;
    }
    if(options.allowWatch === undefined){
        options.allowWatch = false;
    }
    if(options.passThrough === undefined){
        options.passThrough = false;
    }
    if(options.checkSession === undefined){
        options.checkSession = false;
    }
    if(options.next === undefined){
        options.next = function (req, res, next) {next();};
    }

    var reqHandler;

    if(options.passThrough){
        reqHandler = function (req, res, next){
            if(options.auth) {
                authenticate(req, res, options, function(){
                    options.next(req, res, next);
                });
            } else {
                options.next(req, res, next);
            }
        };
    } else {
        reqHandler = function (req, res, next) {
            if(options.auth){
                authenticate(req, res, options, function(){
                    checkBody(req, res, options, function(){
                        options.next(req, res, next);
                    });
                });
            } else {
                checkBody(req, res, options, function(){
                    options.next(req, res, next);
                });
            }
        };
    }

    return reqHandler;
};