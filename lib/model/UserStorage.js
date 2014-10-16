var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;

/**
 * Universal encrypted Storage for key userContacts, userConversations and userFiles.
 */
module.exports =
    sequelize.define('UserStorage', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },

        id: {
            comment: "client generated uuid to identify this record",
            type: DataTypes.UUID,
            primaryKey: true,
            validate: {
                isUUID: 4
            }
        },

        type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        //users should save only verified(signed) information to the server,
        //so they don't get things put in their list they never added themselfs

        //encrypt this so users can save a contact with a real name.
        //taging people publicly with real names is really not something most private persons want.
        text: {
            comment: "PGPSignedEncryptedMessage({" +
                //signed uuid of this store
            "id: id" +

                //UTC creation date of this message, should not be in the future!
                //is also updated when this verification gets updated by the user!
                //check if this is NEWER than the last one we had in the client,
                //so the server doesn't serve us a rotten egg. :-)
            "created: date" +

                /////////////////////////
                /////////CONTACT/////////
                /////////////////////////
            "type: contact" +
            "contents: {" +
                //name and server of the contact
            "name: name" +
            "server: server" +


                //display name and picture the user typed in/choose for the contact.
                //might be anything like Mum/Dad/Boss and different from the
                //one the contact declared on his own profile
            "displayName: " +
            "picture:" +

                //UTC creation date of this message, should not be in the future!
                //is also updated when this verification gets updated by the user!
                //check if this is NEWER than the last one we had in the client,
                //so the server doesn't serve us a rotten egg. :-)
            "created: date" +

                //important! if this changes unexpectedly then there was something going on!
            "comKeyID: comKeyID" +

            "keyVerifications: {" +
            "keyID1: {" +
            "'2014.09.04 - 17:53:01.000': {type: 'QRCode', comment: 'scanned at hacker con 2014']," +
            "'2014.01.04 - 17:53:01.000', {type: 'KeyServer', comment: 'verified through keyServer rcKeyServer']" +
            "}" +
            "keyID2: {" +
            "'2014.09.05 - 17:54:03.000': {type: 'QRCode', comment: 'scanned at hacker con 2014']," +
            "}" +
            "}, " +
            "}" +

                ////////////////////////
                //////CONVERSATION//////
                ////////////////////////
            "type: conversation" +
            "contents: {" +
            "hoster: " +
            "server: " +

            "removed:" + //user removed himself from this conversation

                //secret information key the list of hosted conversation members is encrypted with at the hoster location
            "secret: {" +
            "algorithm" +
            "key" +
            "iv" +
            ")" +
            "}}" +

                ////////////////////
                ////////FILE////////
                ////////////////////
            "type: file" +
            "contents: {" +
                //UTC creation date of this message, should not be in the future!
                //is also updated when this verification gets updated by the user!
                //check if this is NEWER than the last one we had in the client,
                //so the server doesn't serve us a rotten egg. :-)
            "created: date" +

            "mimeType: " +
            "hash: hash" +

            "secret: {" +
            "algorithm" +
            "key" +
            "iv" +
            "}" +

            "})" +

            ")",
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: [1, config.validations.userStorage.length],
                isPGPMsg: function (value) {
                    validations.readEncryptedMessage(value);
                }
            }
        },
        keyID: {
            comment: "key the content was signed and encrypted with",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: true,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        deleted: {
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
    });
