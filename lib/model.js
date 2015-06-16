'use strict';


module.exports = function (Sequelize, sequelize, config, validations) {
    let model = {};

    let modelPath = __dirname + "/model/";

    function importModel(modName) {
        return require(modelPath + modName);
    }

    var model = {};

    model.User = importModel("User.js")(Sequelize, sequelize, config, validations);
    model.UserKey = importModel("UserKey.js")(Sequelize, sequelize, config, validations);
    model.UserMessage = importModel("UserMessage.js")(Sequelize, sequelize, config, validations);
    model.UserStorage = importModel("UserStorage.js")(Sequelize, sequelize, config, validations);
    /*
     //http://sequelizejs.com/docs/latest/models#block-43-line-0
     //http://sequelizejs.com/docs/latest/associations#block-0-line-43
     //sadly that doesn't work yet and we have to wait until the 2.0 release.
     //https://github.com/sequelize/sequelize/wiki/Ro
     model.User
     .hasOne(model.UserKey, {as: 'loginKey', foreignKey : 'loginKeyID'})
     */
    return model;
};