'use strict';

module.exports = function (config, db) {
    let model = {};
    let sequelize = db.sequelize;
    let Sequelize = db.Sequelize;

    let modelPath = __dirname + "/model/";

    function importModel(modName) {
        return require(modelPath + modName);
    }

    model.User = importModel("User.js")(Sequelize, sequelize, config);
    model.UserKey = importModel("UserKey.js")(Sequelize, sequelize, config);
    model.UserMessage = importModel("UserMessage.js")(Sequelize, sequelize, config);
    model.UserStorage = importModel("UserStorage.js")(Sequelize, sequelize, config);

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