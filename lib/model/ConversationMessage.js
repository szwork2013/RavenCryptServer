var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;

/**
 * Conversation that our user hosts.
 */
module.exports =
    sequelize.define('ConversationMessage', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },

        conID: {
            comment: "conversation this message belongs to",
            type: DataTypes.UUID,
            primaryKey: true,
            validate: {
                isUUID: 4
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
            comment: "SymmetricEncrypted:(" + //the outer encryption is send to the user via a pgp message

                "user@@@host" + //first line is always the user writing the conversation
                "RCKeyID" + //second line is the RCKeyID of the key the user used

                "PGPSigned{{" +

                //location of the conversation this message belongs to, so this can not be taken elsewhere
                "conversation: {" +
                    "id" + //conversation id of this message
                    "hoster" +
                    "server" +
                "}" +

                //UTC creation date of this message, should not be in the future!
                "created: date" +

                //Possible Values.. should only have one of these properties
                "content:{" +

                    //somebody in the conversation invited a new member to the conversation
                    "invitedMember:" + //.. [ user, host ]

                    //a new member announces that he joined the conversation
                    "memberJoined" + //

                    //user wishes to be removed from the conversation manifest by the host
                    //he can still access the conversation though, since he still has the key!
                    "memberLeft" + //removeMe

                    //hoster wishes that users refreshes data from hosting place, to update title/member list.
                    //*make this a manual action, that needs to be clicked/touched in the conversation*
                    "refreshManifest" +

                    //text of the message
                    "text: " +

                    //one RC file item.
                    "file: {" +
                        "url" +
                        "mimeType" +
                        "length" +
                    "}" +
                "}" +


                ")",
            allowNull: false,
            type: DataTypes.TEXT,
            validate: {
                len: [1,config.validations.conversationMsg.length]
                //this is bat country.
                //there is no way to validate the correctness of this, its just a blob of symmetric crypto.
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

        conKeyID: {
            comment: "conversation key that the sender used to encrypt the text",
            type: DataTypes.UUID,
            allowNull: false,
            validate: {
                isUUID: 4
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

