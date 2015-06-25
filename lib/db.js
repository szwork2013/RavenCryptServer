'use strict';

exports.DB = function DB(config, logger, Sequelize) {
    let dbConfigJSON = require("./../config/config.json");
    let dbConfig = dbConfigJSON[config.environment];
    let sequelize = null;

    if (!dbConfig) {
        let msg = "Could not load database config fitting your environment!";
        logger.error(msg);
        throw new Error(msg)
    }
    if (!dbConfig.define) {
        let msg = "Your database config has no 'define' element!";
        logger.error(msg);
        throw new Error(msg)
    }

    //timestamps shouldn't be added by default in Sequelize in my opinion,
    //but since you can stop it that's fine with me
    //this should always be in the config.json file!
    if (dbConfig.define.timestamps) {
        let msg = "Your database config has timestamps enabled, disable them this instant!\n" +
            "(If you had this enabled when you did your first migration, delete all tables!) \n" +
            "-> This option is not for you to play with, dough!";
        logger.error(msg);
        throw new Error(msg)
    }

    if (config.log.enabled && config.log.DBenabled) {
        dbConfig.logging = function (text) {
            logger.trace(text);
        }
    } else {
        dbConfig.logging = false;
    }

    //null = mysql
    switch (dbConfig.dialect) {
        case "sqlite":
            config.dbType = dbConfig.dialect;
            sequelize = new Sequelize(
                '',
                '',
                '',
                dbConfig
            );
            break;
        case "postgres":
            config.dbType = dbConfig.dialect;
            break;
        case "mariadb":
            config.dbType = "mariadb";
            sequelize = new Sequelize(
                dbConfig.database,
                dbConfig.username,
                dbConfig.password,
                dbConfig
            );
            break;
        case "mysql":
        case null:
            config.dbType = "mysql";
            sequelize = new Sequelize(
                dbConfig.database,
                dbConfig.username,
                dbConfig.password,
                dbConfig
            );
            break;
    }

    this.Sequelize = Sequelize;
    this.sequelize = sequelize;
};

