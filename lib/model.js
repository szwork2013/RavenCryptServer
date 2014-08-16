var modelPath = __dirname + "/model/";

function importModel(modName){
    return require(modelPath + modName);
}

var model = {};

model.Blog = importModel("Blog.js");
model.BlogResponse = importModel("BlogResponse.js");
model.BlogRelation = importModel("BlogRelation.js");
model.ConversationManifest = importModel("ConversationManifest.js");
model.ConversationMessage = importModel("ConversationMessage.js");
model.HashTag = importModel("BlogTag.js");
model.ServerSessionKey = importModel("ServerSessionKey.js");
model.User = importModel("User.js");
model.UserEncryption = importModel("UserEncryption.js");
model.UserKey = importModel("UserKey.js");
model.UserLogin = importModel("UserLogin.js");
model.UserMessage = importModel("UserMessage.js");
model.UserRegister = importModel("UserRegister.js");
model.UserStorage = importModel("UserStorage.js");

//http://sequelizejs.com/docs/latest/models#block-43-line-0
//http://sequelizejs.com/docs/latest/associations#block-0-line-43
//sadly that doesn't work yet and we have to wait until the 2.0 release.
//https://github.com/sequelize/sequelize/wiki/Roadmap
/*
model.User
    .hasOne(model.UserKey, {as: 'loginKey', foreignKey : 'loginKeyID'})
*/

global.model = model;