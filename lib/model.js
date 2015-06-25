'use strict';

exports.Model = function Model(config, db) {
    let model = {};
    let sequelize = db.sequelize;
    let Sequelize = db.Sequelize;

    this.User = new (require("./model/User.js")).User(Sequelize, sequelize, config);
    this.UserKey = new (require("./model/UserKey.js")).UserKey(Sequelize, sequelize, config);
    this.UserMessage = new (require("./model/UserMessage.js")).UserMessage(Sequelize, sequelize, config);
    this.UserStorage = new (require("./model/UserStorage.js")).UserStorage(Sequelize, sequelize, config);

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