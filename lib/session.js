global.session = {};

//our session should be able to completely fail and still not cause any problems to or user :-)

global.session.authenticate = function(sessionInput, cb){
    var sessionJson;
    var session;
    var checkSession = function(){
        if(Date(session.validUntil) < new Date()) {
            cb(global.constants.sessionExpired); //Session has expired
        } else {
            cb(null, session);
        }
    };
    var parseSession = function(){
        var parseErr;
        try {
            session = JSON.parse(sessionJson);
        } catch(err) {
            parseErr = err;
        }
        if(parseErr || session == null || sessionJson == "") {
            cb(global.constants.sessionIsNoJSON);
        } else {
            checkSession();
        }
    };
    var decryptSession = function(){
        var decryptErr;
        try {
            sessionJson = sessionKey.decrypt(sessionInput.encrypted);
        } catch(err) {
            decryptErr = err;
        }
        if(decryptErr || sessionJson == null || sessionJson == "") {
            cb(global.constants.sessionDecryptionFailed);
        } else {
            parseSession();
        }
    };

    if(sessionInput.sessionKeyID === undefined || sessionInput.encrypted === undefined){
        cb(global.constants.sessionSyntaxIncorrect); //Session syntax incorrect
    } else {
        var sessionKey = global.session.skeys[sessionInput.sessionKeyID];
        if(!sessionKey) {
            cb(global.constants.sessionKeyNotFound); //No Session Key Found for the sessionKeyID
        } else {
            decryptSession();
        }
    }
};

global.session.newKey = function(callback){

    var ServerSessionKey = global.model.ServerSessionKey;
    var rnd = ServerSessionKey.generate();
    var algorithm = ServerSessionKey.getAlgorithm();

    global.model.ServerSessionKey
        .build({
            key: rnd.key,
            iv: rnd.iv,
            algorithm: algorithm
        })
        .save()
        .success(function(key){
            //add a new key to the beginning of our key array.
            global.session.skeyIDs.unshift(key.id);
            global.session.skeys[key.id] = key;

            global.logger.info("New Session Key: " + key.id);

            if(global.session.skeyIDs.length > 3){
                //remove the 4th key, it should be invalidated now!
                var keyID = global.session.skeyIDs.splice(3,1);
                delete global.session.skeys[keyID];
            }

            callback();
        })
        .error(function(err){
            callback(err);
        });
};

global.session.updateKeys = function(callback){
    global.model.ServerSessionKey
        .findAll({
            order: 'id DESC',
            limit: 3
        })
        .success(function(ServerSessionKeys) {

            var keyMaxAge = new Date() - global.config.session.KeyRenewInterval * 24 * 60 * 60 * 1000; /* ms */

            if(ServerSessionKeys.length > 0 && ServerSessionKeys[0].createdAt > keyMaxAge) {
                global.session.skeys = {};
                global.session.skeyIDs = [];

                for(var i=0;i<ServerSessionKeys.length;i++){
                    var key = ServerSessionKeys[i];
                    global.session.skeyIDs.unshift(key.id);
                    global.session.skeys[key.id] = key;
                }
                global.logger.info("SessionKeyFound, all good!");
                callback();
            } else {
                global.session.skeys = {};
                global.session.skeyIDs = [];
                global.session.newKey(callback);
            }
        });
};
