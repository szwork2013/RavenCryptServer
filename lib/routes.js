'use strict';

module.exports = function (conifg, io, socket) {

    var config = global.config;

    var routePath = __dirname + "/routes/";

    function route(path) {
        return require(routePath + path);
    }

    var reqHandler = require(__dirname + "/reqHandler.js");
    var reqValidator = require(__dirname + "/reqValidator.js");
    var reqValidations = require(__dirname + "/reqValidations.js");

    var routes = {};

    routes.index = route("index.js");
    app.get('/', reqHandler({}), routes.index);

    routes.config = function (req, res) {
        //expose the config of this server, do not remove this please!
        //we do want to know what you configured, since nobody really can trusts each other! :)
        //this does not expose TLS keys.
        return res.json(config);
    };
    app.get('/config', reqHandler({}), routes.config);

    //the basic idea of paging should be close to this
    //https://dev.twitter.com/docs/working-with-timelines
    //although we can not work with IDs, since they are UUIDs.
    //Instead we use the createDate of the posts, which is indexed together with the user name.
    //todo create the index in the initial migration

    routes.userStorage = {};
    routes.userStorage.upsert = route("userStorage/userStorageUpsert.js");
    routes.userStorage.get = route("userStorage/userStorageGet.js");
    routes.userStorage.delete = route("userStorage/userStorageDelete.js");
    routes.userStorage.list = route("userStorage/userStorageList.js");
    app.post('/user/:user/storage/:id', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userStorageUpsert())
    }), routes.userStorage.upsert);
    app.delete('/user/:user/storage/:id', reqHandler({
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userStorageGetDelete())
    }), routes.userStorage.delete);
    app.get('/user/:user/storage/:id', reqHandler({
        auth: true,
        allowWatch: true,
        next: reqValidator(reqValidations.userStorageGetDelete())
    }), routes.userStorage.get);
    app.get('/user/:user/storage', reqHandler({
        auth: true,
        allowWatch: true,
        next: reqValidator(reqValidations.userStorageList())
    }), routes.userStorage.list);

    routes.user = {};
    routes.user.exists = route("user/exists.js");
    routes.user.profileGet = route("user/profileGet.js");
    routes.user.profileUpdate = route("user/profileUpdate.js");
    routes.user.optionsGet = route("user/optionsGet.js");
    routes.user.optionsUpdate = route("user/optionsUpdate.js");
    routes.user.register = route("user/register.js");
    routes.user.registerConfirm = route("user/registerConfirm.js");
    app.get('/user/:user', reqHandler({next: reqValidator(reqValidations.userExists())}), routes.user.exists);
    app.get('/user/:user/profile', reqHandler({next: reqValidator(reqValidations.userProfileGet())}), routes.user.profileGet);
    app.post('/user/:user/profile', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userProfileUpdate())
    }), routes.user.profileUpdate);
    app.get('/user/:user/options', reqHandler({next: reqValidator(reqValidations.userOptionsGet())}), routes.user.profileGet);
    app.post('/user/:user/options', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userOptionsUpdate())
    }), routes.user.profileUpdate);
    app.post('/user/:user', reqHandler({
        json: true,
        next: reqValidator(reqValidations.userRegister())
    }), routes.user.register);
    app.post('/user/:user/confirmation', reqHandler({
        json: true,
        next: reqValidator(reqValidations.userRegisterConfirm())
    }), routes.user.registerConfirm);

    routes.userKey = {};
    routes.userKey.upsert = route("userKey/userKeyUpsert.js");
    routes.userKey.makeLogin = route("userKey/userKeyMakeLogin.js");
    routes.userKey.get = route("userKey/userKeyGet.js");
    routes.userKey.getPrivate = route("userKey/userKeyGetPrivate.js");
    routes.userKey.list = route("userKey/userKeyList.js");
    routes.userKey.login = route("userKey/userKeyLogin.js");
    app.post('/user/:user/key/:id', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userKeyUpsert())
    }), routes.userKey.upsert);
    app.post('/user/:user/key/:id/login', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userKeyMakeLogin())
    }), routes.userKey.makeLogin);
    app.get('/user/:user/key/:id/login', reqHandler({next: reqValidator(reqValidations.userKeyLogin())}), routes.userKey.login);
    app.get('/user/:user/key/:id', reqHandler({next: reqValidator(reqValidations.userKeyGet())}), routes.userKey.get);
    app.get('/user/:user/key/:id/private', reqHandler({next: reqValidator(reqValidations.userKeyGet())}), routes.userKey.getPrivate);
    app.get('/user/:user/key', reqHandler({next: reqValidator(reqValidations.userKeyList())}), routes.userKey.list);

    routes.userMessage = {};
    routes.userMessage.receive = route("userMessage/userMessageReceive.js");
    routes.userMessage.delete = route("userMessage/userMessageDelete.js");
    routes.userMessage.get = route("userMessage/userMessageGet.js");
    routes.userMessage.list = route("userMessage/userMessageList.js");
    app.post('/user/:user/msg/:id', reqHandler({
        json: true,
        next: reqValidator(reqValidations.userMsgReceive())
    }), routes.userMessage.receive);
    app.delete('/user/:user/msg/:id', reqHandler({
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.userMsgGetDelete())
    }), routes.userMessage.delete);
    app.get('/user/:user/msg/get/:id', reqHandler({
        auth: true,
        allowWatch: true,
        next: reqValidator(reqValidations.userMsgGetDelete())
    }), routes.userMessage.get);
    app.get('/user/:user/msg', reqHandler({
        auth: true,
        allowWatch: true,
        next: reqValidator(reqValidations.userMsgList())
    }), routes.userMessage.list);

    //it would be best to outsource the whole upload logic to different servers later.
    //this way it will not slow the communication
    routes.upload = {};
    routes.upload.upload = route("upload/upload.js");
    routes.upload.get = route("upload/uploadGet.js");
    routes.upload.delete = route("upload/uploadDelete.js");
    routes.upload.list = route("upload/uploadList.js");
    app.post('/user/:user/upload/:id', reqHandler({
        json: true,
        auth: true,
        checkSession: true,
        passThrough: true,
        next: reqValidator(reqValidations.uploadGet())
    }), routes.upload.upload);
    app.delete('/user/:user/upload/:id', reqHandler({
        auth: true,
        checkSession: true,
        next: reqValidator(reqValidations.uploadDelete())
    }), routes.upload.delete);
    app.get('/user/:user/upload/:id', reqHandler({next: reqValidator(reqValidations.uploadGet())}), routes.upload.get);
    app.get('/user/:user/upload ', reqHandler({next: reqValidator(reqValidations.uploadList())}), routes.upload.list);


};

