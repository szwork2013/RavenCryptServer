var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;
var validations = global.validations;

/**
 * Public Keys that belong to our users.
 */
module.exports =
    sequelize.define('UserKey', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        id: {
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            primaryKey: true,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        private: {
            type: DataTypes.BOOLEAN,
            primaryKey: true
        },

        key: {
            type: DataTypes.STRING(config.validations.pubKey.length),
            allowNull: false
        },
        userEncryptionID: {
            type: DataTypes.UUID,
            allowNull: true
        },

        revoked: {
            comment: "keys have to be revoked, not deleted " +
                     "and should still be accessible after they are revoked!",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        validate: {
            RCKeyID: function() {
                var key = this.key;
                var id = this.id;
                validations.checkRCKeyID(key, id);
            }
        },
        instanceMethods: {
            write_encrypted_message: function (message) {
                var publicKeys = openpgp.key.readArmored(this.key);
                return openpgp.encryptMessage(publicKeys.keys, message);
            }
        }
    });
