'use strict';

module.exports = function (openpgp) {
    let helper = {};

    /**
     * Ensures that object has the given properties
     * @param obj Object to Check
     * @param props [Array] properties to check
     * @returns {boolean}
     */
    this.hasOwnProperties = function (obj, props) {
        for (var i = 0; i < props.length; i++) {
            if (!obj.hasOwnProperty(props[i])) {
                return false;
            }
        }
        return true;
    };

    /**
     * Ensures that object has the given properties and only the given properties
     * @param obj Object to Check
     * @param props [Array] properties to check
     * @returns {boolean}
     */
    helper.hasExactPropertiesException = function (obj, props) {
        for (var prop in obj) {
            var index = props.indexOf(prop);
            if (index == -1) {
                throw "unknown property: " + prop;
            }
            props.splice(index, 1);
        }
        if (props.length > 0) {
            throw "missing properties: " + JSON.stringify(props);
        }
        return true;
    };

    helper.hasExactProperties = function (obj, props, cb) {
        for (var prop in obj) {
            var index = props.indexOf(prop);
            if (index == -1) {
                return cb("unknown property: " + prop);
            }
            props.splice(index, 1);
        }
        if (props.length > 0) {
            return cb("missing properties: " + JSON.stringify(props));
        }
        cb();
    };

    /**
     * Encrypts the text with the public Key
     * @param text
     * @param publicKeyArmored
     * @returns {*|String|_openpgp.write_encrypted_message}
     */
    helper.pgpEncrypt = function (text, publicKeyArmored) {
        var publicKeys = openpgp.key.readArmored(publicKeyArmored);
        return openpgp.encryptMessage(publicKeys.keys, text);
    };

    /**
     * Decrypts the text with the public Key
     * @param text
     * @param privateKeyArmored
     * @returns {.pg.text|*|.sqlite.text|.mysql.text|model.UserProfile.text|model.Blog.text}
     */
    helper.pgpDecrypt = function (text, privateKeyArmored) {
        var privateKeys = openpgp.key.readArmored(privateKeyArmored);
        var msg = openpgp.message.readArmored(text);
        var decrypted = openpgp.decryptMessage(privateKeys.keys[0], msg);

        return decrypted;
    };

    helper.getUTCTime = function () {
        var now = new Date();
        return new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
    };

    //Save functions, since they should not overflow
    helper.toArrayBuffer = function (buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    };

    helper.toBuffer = function (ab) {
        var buffer = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    };

    //iam not so sure about this functions.. :)
    helper.toArrayBufferBin = function (buffer) {
        return new Uint8Array(buffer).buffer;
    };

    helper.toBufferBin = function (ab) {
        return new Buffer(new Uint8Array(ab));
    };

    helper.ab2str = function (buf) {
        var stringArr = [];

        var piece = 1000;
        var i = 0;
        while (i < buf.byteLength) {
            var rest = buf.byteLength - i;
            if (rest > piece) rest = piece;
            var slice = buf.slice(i, i + rest);
            var bufView = new Uint8Array(slice);
            var str = String.fromCharCode.apply(null, bufView);
            stringArr.push(str);

            i += piece;
        }

        return stringArr.join("");
    };

    helper.str2ab = function (str) {
        var buf = new ArrayBuffer(str.length);
        var bufView = new Uint8Array(buf);
        for (var i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    };

    return this;
};
