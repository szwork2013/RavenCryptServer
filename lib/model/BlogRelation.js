'use strict';

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;
var validations = global.validations;

/**
 * Signed relations our users have to people, displayed on their blog
 * These are PUBLIC!
 */
module.exports =
    sequelize.define('BlogRelation', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },

        name: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        server: {
            type: DataTypes.STRING(config.validations.server.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },

        text: {
            comment: "PGPSignedMessage({" +
                "name" +
                "server" +
                //UTC creation date of this message, should not be in the future!
                //is also updated when this verification gets updated by the user!
                //check if this is NEWER than the last one we had in the client,
                //so the server doesn't serve us a rotten egg. :-)
                "created: date" +

                "deleted:" +

                "relation: ...(eg. friend)" +
                ")",
            type: DataTypes.STRING(config.validations.blog.length),
            allowNull: false,
            validate: {
                isPGPMsg: function (value) {
                    validations.readSignedClearTextMessage(value);
                }
            }
        },
        keyID: {
            comment: "key the verification was signed with",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });
