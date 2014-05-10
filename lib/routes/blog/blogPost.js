var model = global.model;
var logger = global.logger;
var validations = global.validations;
var constants = global.constants;
var openpgp = global.openpgp;
var helper = global.helper;

/**
 * save a blog post to the server
 */
module.exports = function (req, res) {
    model.Blog
        .findOrCreate({
            user: req.params.user,
            id: req.params.user
        }, {
            text: req.body.text,
            keyID: req.body.keyID
        })
        .error(function (err) {
            logger.rcLog(req, logger.rcLogType.warn, constants.modelOrDBError, err);
            res.send(500, constants.modelOrDBError);
        })
        .success(function (post, created) {
            if (created) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.send(200);
            } else {
                if(post.text != data.text || post.keyID != data.keyID){
                    logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                    res.send(202, constants.uuidInUse);
                } else {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.send(200);
                }
            }
        });
};
