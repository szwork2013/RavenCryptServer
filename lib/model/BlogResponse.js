'use strict';

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;
var validations = global.validations;

/**
 * Responses to Blogposts of our users, that others submitted here.
 */
module.exports =
    sequelize.define('BlogResponse', {
        user: {
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        blogID: {
            comment: "blog post this response belongs to",
            type: DataTypes.UUID,
            primaryKey: true,
            validate: {
                isUUID: 4
            }
        },

        name: {
            comment: "name of the responder",
            type: DataTypes.STRING(config.validations.user.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.user.regExp
            }
        },
        server: {
            comment: "server of the responder",
            type: DataTypes.STRING(config.validations.server.maxLen),
            primaryKey: true,
            validate: {
                is: config.validations.server.regExp
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
            comment: "PGPSigned{{" +
                "id: id" + //the id of this blog post
                "created: date" + //UTC creation date of this message, should not be in the future! (is also updated when this changes changes!)

                "text: text" +
                "files: []" + //urls to pictures objects, with url hash and file metadata

                //optional
                "responseTo: {" +
                "name: name," +
                "server: server" +
                "id: id" +
                "hash: hash," + //hash of the original post to prevent faking
                "}," +

                "}}",
            allowNull: false,
            type: DataTypes.STRING(config.validations.blogResponse.length),
            validate: {
                isPGPMsg: function (value) {
                    validations.readSignedClearTextMessage(value);
                }
            }
        },
        keyID: {
            comment: "key the text was signed with",
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

        review: {
            //signed post metadata to indicate this is a reviewed response
            comment: "PGPSigned({" +
                "responder: ," +
                "server: ," +
                "id: ," +
                "hash: " +
                "created: date" + //UTC creation date of this message, should not be in the future! (is also updated when this changes changes!)
                "})",
            type: DataTypes.STRING(config.validations.blogResponse.review.length),
            allowNull: true,
            validate: {
                isCorrectPGPMsg: function (value) {
                    validations.readSignedClearTextMessage(value);
                }
            }
        },
        reviewKeyID: {
            comment: "key the review was signed with",
            type: DataTypes.STRING(config.validations.pubKeyID.length),
            allowNull: true,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        deleted: {
            comment: "users can not just review responses, they can also delete them",
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

