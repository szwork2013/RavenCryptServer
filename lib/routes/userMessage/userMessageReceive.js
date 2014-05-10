var config = global.config;
var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var sockets = global.io.sockets;

/**
 * Receive Messages for one user.
 *
 * Don't even try to receive Message for multiple Users in one request, it causes ENDLESS problems.
 * Even if it results in a little more traffic, the amount of PROBLEMS avoided by receiving
 * each message individually is ENORMOUS, so don't even try to optimize it!
 *
 * Yes PGP can encrypt a text for multiple public keys,
 * but if we want to limit the SIZE of that text and the request in general, we get a massive problem on our hands.
 * The more receivers you get, the less text you can write, and also every receiving client gets a massive
 * blob to parse, where he needs to find his key.
 *
 * Also error handling for multiple users is a nightmare, where you have to work with arrays and huge error codes.
 * Avoid it entirely please.
 */
module.exports = function (req, res) {
    var condition = {
        attributes: ["name", "deleted", "comKeyID"],
        where: {
            name: req.params.user
        }
    };

    model.User
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (user) {
            if(!user) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userNotFound);
                res.send(404, constants.userNotFound)
            } else if(user.deleted) {
                logger.rcLog(req, logger.rcLogType.debug, constants.userDeleted);
                res.send(410, constants.userDeleted)
            } else if(user.comKeyID != req.body.keyID) {
                logger.rcLog(req, logger.rcLogType.debug, constants.notUsingUserComKey);
                res.send(403, constants.notUsingUserComKey);
            } else {
                saveMessage();
            }
        });

    function saveMessage(){
        model.UserMessage
            .findOrCreate({
                user: req.params.user,
                id: req.params.id,
                keyID: req.body.keyID
            },{
                text: req.body.text,
                ip: req.ip
            })
            .error(function(err){
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function(msg, created){
                if(created) {
                    informUser(msg);

                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.send(200);
                } else {
                    if(msg.text != req.body.text){
                        logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                        res.send(202, constants.uuidInUse);
                    } else {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.send(200);
                    }
                }
            });
    }

    function informUser(msg){
        sockets
            .in('user/' + msg.user)
            .emit('userMsg', {
                id: msg.id,
                text: msg.text,
                keyID: msg.keyID
            });
    }

};