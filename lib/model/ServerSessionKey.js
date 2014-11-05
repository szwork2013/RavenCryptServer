'use strict';

var crypto = require('crypto');

var DataTypes = global.db.Sequelize;
var sequelize = global.db.sequelize;
var config = global.config;

var openpgp = global.openpgp;

const algorithm = "aes256";

module.exports =
    sequelize.define('ServerSessionKey', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        key: {
            type: DataTypes.STRING(config.validations.hex256Len),
            allowNull: false
        },
        iv: {
            type: DataTypes.STRING(config.validations.hex256Len),
            allowNull: false
        },
        algorithm: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    }, {
        classMethods: {
            getAlgorithm: function () {
                return algorithm;
            },
            generate: function () {
                var rnd = {};

                var key = openpgp.crypto.generateSessionKey(algorithm);
                var iv = openpgp.crypto.generateSessionKey(algorithm);

                rnd.key = openpgp.util.hexstrdump(key);
                rnd.iv = openpgp.util.hexstrdump(iv);

                return rnd;
            }
        },
        instanceMethods: {
            encrypt: function (text) {
                var key = openpgp.util.hex2bin(this.key);
                var iv = openpgp.util.hex2bin(this.iv);

                var encrypted = openpgp.crypto.cfb.normalEncrypt(this.algorithm, key, text, iv);

                encrypted = openpgp.util.hexstrdump(encrypted);

                return encrypted;
            },
            decrypt: function (encrypted) {
                var key = openpgp.util.hex2bin(this.key);
                var iv = openpgp.util.hex2bin(this.iv);

                var encrypted = openpgp.util.hex2bin(encrypted);

                var decrypted = openpgp.crypto.cfb.normalDecrypt(this.algorithm, key, encrypted, iv);

                return decrypted;
            }
        }
    });
