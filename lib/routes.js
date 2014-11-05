'use strict';

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

routes.blog = {};
routes.blog.post = route("blog/blogPost.js");
routes.blog.delete = route("blog/blogDelete.js");
routes.blog.get = route("blog/blogGet.js");
routes.blog.list = route("blog/blogList.js");
app.post('/user/:user/blog/:id', reqHandler({
    json: true,
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.blogPost())
}), routes.blog.post);
app.delete('/user/:user/blog/:id', reqHandler({
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.blogGetDelete())
}), routes.blog.delete);
app.get('/user/:user/blog/:id', reqHandler({nextFn: reqValidator(reqValidations.blogGetDelete())}), routes.blog.get);
app.get('/user/:user/blog/', reqHandler({nextFn: reqValidator(reqValidations.blogList())}), routes.blog.list);

routes.blogRelation = {};
routes.blogRelation.upsert = route("blogRelation/blogRelationUpsert.js");
routes.blogRelation.delete = route("blogRelation/blogRelationDelete.js");
routes.blogRelation.list = route("blogRelation/blogRelationList.js");
routes.blogRelation.get = route("blogRelation/blogRelationGet.js");
app.post('/user/:user/relation/:server/:name', reqHandler({
    json: true,
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.blogRelationUpsert())
}), routes.blogRelation.upsert);
app.delete('/user/:user/relation/:server/:name', reqHandler({
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.blogRelationGetDelete())
}), routes.blogRelation.delete);
app.get('/user/:user/relation/:server/:name', reqHandler({next: reqValidator(reqValidations.blogRelationGetDelete())}), routes.blogRelation.get);
app.get('/user/:user/relation', reqHandler({next: reqValidator(reqValidations.blogRelationList())}), routes.blogRelation.list);

routes.blogResponse = {};
routes.blogResponse.post = route("blogResponse/blogResponsePost.js");
routes.blogResponse.review = route("blogResponse/blogResponseReview.js");
routes.blogResponse.delete = route("blogResponse/blogResponseDelete.js");
routes.blogResponse.get = route("blogResponse/blogResponseGet.js");
routes.blogResponse.list = route("blogResponse/blogResponseList.js");
app.post('/user/:user/blog/:blogID/response/:server/:name/:id', reqHandler({
    json: true,
    next: reqValidator(reqValidations.blogResponsePost())
}), routes.blogResponse.post);
app.delete('/user/:user/blog/:blogID/response/:server/:name/:id', reqHandler({next: reqValidator(reqValidations.blogResponseGetDelete())}), routes.blogResponse.delete);
app.post('/user/:user/blog/:blogID/response/:server/:name/:id/review', reqHandler({
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.blogResponseReview())
}), routes.blogResponse.review);
app.get('/user/:user/blog/:blogID/response', reqHandler({
    optionalAuth: true,
    next: reqValidator(reqValidations.blogResponseList())
}), routes.blogResponse.list);
app.get('/user/:user/blog/:blogID/response/:server/:name/:id', reqHandler({next: reqValidator(reqValidations.blogResponseGetDelete())}), routes.blogResponse.get);

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

routes.conversationManifest = {};
routes.conversationManifest.upsert = route("conversationManifest/conversationManifestUpsert.js");
routes.conversationManifest.get = route("conversationManifest/conversationManifestGet.js");
routes.conversationManifest.delete = route("conversationManifest/conversationManifestDelete.js");
app.post('/user/:user/con/:id/manifest', reqHandler({
    json: true,
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.conversationManifestUpsert())
}), routes.conversationManifest.upsert);
app.get('/user/:user/con/:id/manifest', reqHandler({next: reqValidator(reqValidations.conversationManifestGetDelete())}), routes.conversationManifest.get);
app.delete('/user/:user/con/:id/manifest', reqHandler({
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.conversationManifestGetDelete())
}), routes.conversationManifest.delete);

routes.conversationMessage = {};
routes.conversationMessage.receive = route("conversationMessage/conversationMessageReceive.js");
routes.conversationMessage.get = route("conversationMessage/conversationMessageGet.js");
routes.conversationMessage.list = route("conversationMessage/conversationMessageList.js");
app.post('/user/:user/con/:conID/msg/:id', reqHandler({
    json: true,
    next: reqValidator(reqValidations.conMsgReceive())
}), routes.conversationMessage.receive);
app.get('/user/:user/con/:conID/msg/:id', reqHandler({next: reqValidator(reqValidations.conMsgGet())}), routes.conversationMessage.get);
app.get('/user/:user/con/:conID/msg', reqHandler({next: reqValidator(reqValidations.conMsgList())}), routes.conversationMessage.list);

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

routes.userEncryption = {};
routes.user.encryptionGet = route("userEncryption/userEncryptionGet.js");
routes.user.encryptionUpsert = route("userEncryption/userEncryptionUpsert.js");
app.get('/user/:user/encryption/:id', reqHandler({next: reqValidator(reqValidations.userEncryptionGet())}), routes.user.encryptionGet);
app.post('/user/:user/encryption/:id', reqHandler({
    json: true,
    auth: true,
    checkSession: true,
    next: reqValidator(reqValidations.userEncryptionUpdate())
}), routes.user.encryptionUpsert);

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

module.exports = routes;