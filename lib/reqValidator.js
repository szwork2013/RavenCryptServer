var logger = global.logger;

module.exports = function (validationFn){
    return function (req, res, next) {
        validationFn(req, function(err){
            if(err){
                logger.rcLog(req, logger.rcLogType.debug, constants.syntaxIncorrect, err);
                res.send(400, constants.syntaxIncorrect);
            } else {
                next();
            }
        });
    };
};