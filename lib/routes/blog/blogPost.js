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
            res.status(500).send(constants.modelOrDBError);
        })
        .success(function (post, created) {
            if (created) {
                logger.rcLog(req, logger.rcLogType.trace, constants.success);
                res.status(200).send();
            } else {
                if(post.text != req.body.text || post.keyID != req.body.keyID){
                    logger.rcLog(req, logger.rcLogType.trace, constants.uuidInUse);
                    res.status(202).send(constants.uuidInUse);
                } else {
                    logger.rcLog(req, logger.rcLogType.trace, constants.success);
                    res.status(200).send();
                }
            }
        });
};
