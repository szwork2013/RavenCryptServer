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

        threadID: {
            comment: "ThreadID",
            type: DataTypes.UUID,
            primaryKey: true,
            validate: {
                isUUID: 4
            }
        },

        //To allow for levels
        responseTo: {
            comment: "ThreadID",
            type: DataTypes.UUID,
            allowNull: true,
            validate: {
                isUUID: 4
            }
        },

        poster: {
            comment: "key the text was signed with",
            type: DataTypes.STRING(config.validations.user.maxLen),
            allowNull: false,
            validate: {
                is: config.validations.pubKeyID.regExp
            }
        },

        posterServer: {
            type: DataTypes.STRING(config.validations.server.length),
            allowNull: false,
            validate: {
                is: config.validations.server.regExp
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

        //this part can be responded to and will also be submitted to the remote server
        text: {
            comment: "PGPSigned{{" +
                "id: id" + //the id of this blog post
                "created: date" + //UTC creation date of this message, should not be in the future! (is also updated when this changes changes!)

                "text: text" +
                "files: []" + //urls to file objects, with url hash and file metadata (picture etc)

                //optional
                "responseTo: {" +
                "id: id" + //, this should match the id of the blog post this is a response to
                "hash: hash," + //hash of the original post, so nobody can fake it
                "name: name," +
                "server: server" +
                "}," +
                "}}",
            allowNull: false,
            type: DataTypes.STRING(config.validations.blog.length),
            validate: {
                isCorrectPGPMsg: function (value) {
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

