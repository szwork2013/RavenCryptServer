'use strict';

module.exports = function (config, logger, Sequelize) {
    let dbConfigJSON = require("./../config/config.json");
    let dbConfig = dbConfigJSON[config.environment];

    if (!dbConfig) {
        let msg = "Could not load database config fitting your environment!";
        logger.error(msg);
        throw new Error(msg);
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
            return new Sequelize(
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
            return new Sequelize(
                dbConfig.database,
                dbConfig.username,
                dbConfig.password,
                dbConfig
            );
            break;
        case "mysql":
        case null:
            config.dbType = "mysql";
            return new Sequelize(
                dbConfig.database,
                dbConfig.username,
                dbConfig.password,
                dbConfig
            );
            break;
        default:
            return {};
    }
};

