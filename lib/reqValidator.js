var logger = global.logger;

module.exports = function (validationFn){
    return function (req, res, next) {
        validationFn.run(req, function(err){
            if(err){
                logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect, err);
                res.status(400).send();
            } else {
                next();
            }
        });
    };
};