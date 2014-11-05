'use strict';

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;

/**
 * Login Sessions for our Users
 */
module.exports =
    sequelize.define('UserLogin', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true
        },
        keyID: {
            comment: "loginKeyID of the user",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            primaryKey: true,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },
        sessionKeyID: {
            comment: "server session key this login can be decrypted with",
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        onlyWatch: {
            comment: "indicates that the user wishes this login object to be only for watching, " +
                "so he can have it lying around unencrypted to do background synchronization",
            type: DataTypes.BOOLEAN,
            primaryKey: true,
            defaultValue: false

        },

        cached: {
            comment: "Cached entry, ready to send. This is a little protection mechanism against huge amounts of async key operations",
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isPGPMsg: function (value) {
                    validations.readEncryptedMessage(value);
                }
            }
        },

        validUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });
