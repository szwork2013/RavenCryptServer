var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;
var openpgp = global.openpgp;
var validations = global.validations;

/**
 * Blogposts that our users wrote.
 */
module.exports =
    sequelize.define('Blog', {
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
        //this is the content and metadata of the message this was a response to, so it can be displayed and verified on this server.
        //for this to be two parts is important, because otherwise we get gigantic growing blobs of responses like mail!
        responseTo: {
            comment: "PGPSigned{{" +
                //id and hash of this blog post (this.id + this.text.hash)
            "response: {" +
            "id: id," +
            "hash: hash," +
            "}," +

            "original:{" +
            "keyId: " + //key the original entry was signed with
            "text: PGPSigned{" +
                //... as seen in the comment of this.text
                //.. here you should also be able to get the ID and HASH of the blog post this is a response to (which should be checked)
            "}" +
            "}}",
            allowNull: true,
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

