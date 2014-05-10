var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;

/**
 * Other users can respond to a Blog Post here
 */
module.exports = function (req, res) {
    var condition = {
        where: {
            user: req.params.user,
            id: req.params.blogID
        }
    };

    model.Blog
        .find(condition)
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.error, constants.systemException, err);
            res.send(500, constants.systemException);
        })
        .success(function (post) {
            if(post) {
                if(post.deleted){
                    logger.rcLog(req, logger.rcLogType.debug, constants.postDeleted);
                    res.send(410, constants.postDeleted);
                } else {
                    postResponse();
                }
            } else {
                logger.rcLog(req, logger.rcLogType.debug, constants.postNotFound);
                res.send(404, constants.postNotFound);
            }
        });

    function postResponse(){
        model.BlogResponse
            .findOrCreate({
                user: req.params.user,
                blogID: req.params.blogID,
                name: req.params.name,
                server: req.params.server,
                id: req.params.id
            },{
                text: req.body.text,
                keyID: req.body.keyID,
                ip: req.ip
            })
            .error(function (err) {
                logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
                res.send(500, constants.modelOrDBError);
            })
            .success(function (response, created) {
                if (created) {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.send(200);
                } else {
                    if(response.text != req.body.text || response.keyID != req.body.keyID){
                        logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                        res.send(202, constants.uuidInUse);
                    } else {
                        logger.rcLog(req, logger.rcLogType.trace, constants.success);
                        res.send(200);
                    }
                }
            });
    }

};


