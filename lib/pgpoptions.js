'use strict';

module.exports = function (openpgp, config) {
    openpgp.config.compression = 0;
    openpgp.config.show_version = false;
    openpgp.config.show_comment = false;
};
