//todo

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;
var validations = global.validations;

/**
 * Blogposts that our users wrote.
 */
module.exports =
    sequelize.define('BoardPost', {
        id: {
            comment: "client generated uuid to identify this record",
            type: DataTypes.UUID,
            primaryKey: true,
            validate: {
                isUUID: 4
            }
        },

        title: {
            comment: "Cached entry, ready to send. This is a little protection mechanism against huge amounts of async key operations",
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                isPGPMsg: function (value) {
                    validations.readEncryptedMessage(value);
                }
            }
        },

        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });

