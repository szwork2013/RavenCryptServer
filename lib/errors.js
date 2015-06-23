'use strict';

exports.Errors = function Errors(constants) {
    this.SystemError = function SystemError() {
        this.prototype = Error;
        return this.prototype(constants.systemException);
    }
};
