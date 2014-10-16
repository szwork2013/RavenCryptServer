var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var validations = global.validations;
var Sequelize = global.Sequelize;

/**
 * Conversation that our user hosts.
 */
module.exports =
    sequelize.define('ConversationManifest', {
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
            comment: "SymmetricEncrypted:(" + //this also has to be encrypted, so we don't leak metadata to outsiders
            "PGPSigned{{" +
                //signed id of this manifest
            "id" +
                //UTC creation date of this message, should not be in the future!
                //is also updated when this verification gets updated by the user!
                //check if this is NEWER than the last one we had in the client,
                //so the server doesn't serve us a rotten egg. :-)
            "created: date" +

            "tile: tile" +
            "picture: {}" +

            "conversationMembers: {" +
            "server1: [" +
            "member1," +
            "member2" +
            "]" +
            "server2: [" +
            "member3," +
            "member4" +
            "]" +
            "}" +

                //important:
                //owners should send a notification to update the hosting,
                //when he changes the title, picture or adds a new member.
                //this should also also be displayed in the conversation.

                //also if a user wishes to leave a conversation he should supply the owner with this wish,
                //the owner should then accept/decline to remove him and send the notification to the rest of the members

                //other users should also be able to suggest new conversation members to the owner of the conversation.

            "}}" +
            ")",
            allowNull: true,
            type: DataTypes.TEXT,
            validate: {
                len: [1, config.validations.conversationManifest.length]
                //this is bat country.
                //there is no way to validate the correctness of this, its just a blob of symmetric crypto.
            }
        },

        conKeyID: {
            comment: "conversation key that the user used to encrypt the text",
            type: DataTypes.UUID,
            allowNull: true,
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

