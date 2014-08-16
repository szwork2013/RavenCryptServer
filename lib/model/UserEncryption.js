var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;


/**
 * Our users and their profile data
 */
module.exports =
    sequelize.define('UserEncryption', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        encryptionID: {
            comment: "ID to identify this encryption",
            type: DataTypes.UUID,
            primaryKey: true
        },

        encryptionTest: {
            comment: "Encrypted JSON String, to test successful decryption",
            type: DataTypes.STRING,
            allowNull: true
        },
        encryptionVersion: {
            comment: "encryption version, specifically the key derivation version the client used",
            type: DataTypes.INTEGER,
            allowNull: true
        },

        deleted: {
            comment: "record was deleted",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });
