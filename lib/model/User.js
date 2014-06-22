var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;


/**
 * Our users and their profile data
 */
module.exports =
    sequelize.define('User', {
        name: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },

        loginKeyID: {
            comment: "key the user wishes to login with. this can be a different key then the one he uses for communication",

            //explanation:
            //this key was once thought to be an unencrypted key, the user uses for the login, so he can get messages
            //and stay in touch with the server and have a second one that actually is encrypted
            //so he can read and create messages, called the comKey.

            //however since this idea an alternative way of dealing with this has been found:
            //a special version of the session object can be stored unencrypted to allow for background synchronization
            //this session object can't do anything but get values and is special made for this purpose.

            //as soon as a user decrypts his private key he can then upgrade the session and gain full access to do more!

            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        profile: {
            comment:
                "PGPSignedJSON{" +
                    "name" + //name of this user
                    //UTC creation date of this message, should not be in the future!
                    //is also updated when this verification gets updated by the user!
                    //check if this is NEWER than the last one we had in the client,
                    //so the server doesn't serve us a rotten egg. :-)
                    "created: date" + //UTC creation date of the message, client should dismiss messages that were created in the future!

                    "comKeyID: ," + //important! comKeyID the user wishes to be used. If this changes unexpectedly there might be a problem.
                    "displayName: ," + //display name the user provided
                    "text: ," + //some information the user put here
                    "reviewBlogResponses: ," + //allow only reviewed blog responses
                    "picture: {" + //a picture the user wishes to be displayed for his account
                        "utl: ," +
                        "picFileSize: ," + //the pictures fileSize
                        "picMimeType: ," + //the pictures mimeType
                        "hash: ," + //hash of either the image
                    "}" +
                 "}",
            type: DataTypes.STRING(config.validations.profile.length),
            allowNull: false,
            validate: {
                isCorrectPGPMsg: function (value) {
                    var msg = validations.readSignedClearTextMessage(value);
                }
            }
        },
        profileKeyID: {
            comment: "key the profile was signed with",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        reviewBlogResponses: {
            comment: "If this is turned on only reviewed response will be shown in the users blog",
            type: DataTypes.BOOLEAN,
            allowNull: true
        },

        encryptionTest: {
            comment: "Encrypted JSON String, to test successful description",
            type: DataTypes.STRING,
            allowNull: true
        },
        encryptionID: {
            comment: "ID to identify this encryption",
            type: DataTypes.UUID,
            allowNull: true
        },
        encryptionVersion: {
            comment: "encryption version, specifically the key derivation version",
            type: DataTypes.INTEGER,
            allowNull: true
        },


        comKeyID: {
            comment: "key the user uses for communication. gets auto filled on validation out of the profile!",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
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
        deleted: {
            comment: "deleted / banned from server",
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
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
    }, {
        instanceMethods: {
            fillFromProfile: function () {
                var profile = this.profile;
                var msg = openpgp.cleartext.readArmored(profile);
                var msgContent = JSON.parse(msg.text);

                this.comKeyID = msgContent.comKeyID;
                this.reviewBlogResponses = msgContent.reviewBlogResponses;
            }
        },
        validate: {
            RCProfile: function () {
                var profile = this.profile;
                var keyID = this.keyID;

                var rcProfile = validations.RCProfile(profile, keyID);
            }
        }
    });