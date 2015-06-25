'use strict';

/**
 * The Messages our User received.
 */
exports.UserMessage = function UserMessage(Sequelize, sequelize, config) {
    let DataTypes = Sequelize;
    this.prototype = sequelize.define('UserMsgReceived', {
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

        text: {
            //signed with the senders key and encrypted with the users key
            //senders information is INSIDE THIS MESSAGE encryption, so we won't leak metadata!
            comment: "PGPEncryptedSigned(" +
            "id: " + //id of this message
                //UTC creation date of this message, should not be in the future!
            "created: date" + //UTC creation date of the message, client should dismiss messages that were created in the future!

                //first decrypt the message, then check the verify the signature of the sender.
                //maybe we can do this step manually?
            "sender: {" +
            "name:" +
            "server: " +
            "RCKeyID: " +
            "}" +

                //theoretically just one possibility, later here can be elements for WEBRTC request etc.
            "conversation: {" +
                //hosting place metadata, required.
            "id: " +
            "hoster: " +
            "hosterServer: " +

                //optional actions either one of them is valid

                //invite to a new conversation
            "invite: {" + //.. algo, key, iv
            "message: 'yo dawg, join us' " +
            "algorithm: " +
            "key: " +
            "iv: " +
            "keyID: " + //conKeyID, to identify the key used for the symmetric crypto in this conversation
            "}" + //url to RC picture for channel, with metadata

                //optional actions either one of them is valid
            "newKey: {" + //.. algo, key, iv
            "message: 'the dawg lost his private key, needed to create a new conversation key, jo!'" +
            "algorithm: " +
            "key: " +
            "iv: " +
            "keyID: " + //conKeyID, to identify the key used for the symmetric crypto in this conversation
            "}" + //url to RC picture for channel, with metadata
            "})",
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: [1, config.validations.userMsg.length],
                isCorrectPGPMsg: function (value) {
                    validations.readEncryptedSignedMessage(value)
                }
            }
        },

        keyID: {
            comment: "user key id used to encrypt the message",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        ip: {
            comment: "creation IP. needed in case of spam",
            type: DataTypes.STRING(config.validations.ip.length),
            allowNull: false,
            validate: {
                isIPv4: true
            }
        },

        deleted: {
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
}