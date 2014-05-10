var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;
var constants = global.constants;
var validations = global.validations;

module.exports =
    sequelize.define('UserRegister', {
        name: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        activationCode: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        key: {
            type: DataTypes.STRING(config.validations.pubKey.length),
            allowNull: false,
            validate: {
                checkPGPKey: function(value) {
                    validations.checkPGPKey(value);
                }
            }
        },
        keyID: {
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },
        profile: {
            comment:
                "PGPSignedJSON{" +
                    //important! comKeyID the user wishes to be used.
                    //if this changes unexpectedly there might be a problem.
                    //is the only non-optional value the profile should have,
                    //although it will be enforced to be the only field in here on register!
                    "comKeyID: " +
                "}",
            type: DataTypes.STRING(config.validations.profile.length),
            allowNull: false
        },
        mail: {
            type: DataTypes.STRING(config.validations.mail.len),
            allowNull: false,
            validate: {
                is: config.validations.mail.regExp
            }
        },

        ip: {
            comment: "creation IP. needed in case of spam",
            type: DataTypes.STRING(config.validations.ip.length),
            allowNull: false,
            validate: {
                isIP: true
            }
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
                var keyID = this.keyID;

                validations.checkRCKeyID(key, keyID);
            },
            RCProfile: function () {
                var profile = this.profile;
                var keyID = this.keyID;

                var profileObj = validations.RCProfile(profile, keyID);

                //check that at least initially the comKeyID is the only value and also the same as the keyID
                helper.hasExactProperties(profileObj, ["comKeyID"]);
                if(profileObj.comKeyID != keyID){
                    throw "comKeyID doesn't match keyID";
                }
            }
        },
        instanceMethods: {
            write_encrypted_message: function (message) {
                var publicKeys = openpgp.key.readArmored(this.key);
                return openpgp.encryptMessage(publicKeys.keys, message);
            },
            check_message: function(pgpmsg){
                var publicKeys = openpgp.key.readArmored(this.key);
                var verified = openpgp.verifyClearSignedMessage(publicKeys.keys, pgpmsg);

                if(verified.signatures.length != 1){
                    return false;
                }

                return verified.signatures[0].valid;

                return true;

            }
        }
    });

