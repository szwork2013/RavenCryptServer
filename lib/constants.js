'use strict';

//string Constants that are used throughout the server.. gather HERE so we don't have to manually change every file later
//and also can build translations for them in the client.

exports.Constants = function Constants() {

    //common
    this.serverIsBusy = "SERVER_IS_BUSY";
    this.syntaxIncorrect = "SYNTAX_INCORRECT";
    this.userNotFound = "USER_NOT_FOUND";
    this.userDeleted = "USER_DELETED";
    this.modelOrDBError = "MODEL_OR_DB_ERROR";
    this.systemException = "SYSTEM_EXCEPTION";
    this.entryDeleted = "ENTRY_DELETED";
    this.uuidInUse = "UUID_IN_USE";
    this.success = "SUCCESS";
    this.IDIsNoUUID = "ID_IS_NO_UUID";
    this.notYours = "USER_IS_NOT_SESSION_USER";
    this.noPGPMsg = "NO_PGG_MSG";
    this.malformedRCKeyID = "MALFORMED_RC_KEY_ID";

    //upload
    this.fileExitsts = "FILE_EXISTS";
    this.fileNotFound = "FILE_NOT_FOUND";
    this.fileToBigOrTruncated = "FILE_TO_BIG_OR_TRUNCATED";
    this.fileIDIsNoUUID = "FILE_ID_IS_NO_UUID";
    this.invalidUserName = "INVALID_USER_NAME";

    //conversationManifest
    this.manifestNotFound = "MANIFEST_NOT_FOUND";
    this.manifestDeleted = "MANIFEST_DELETED";
    this.notUsingConKey = "NOT_USING_CON_KEY";

    //conversation msg
    this.msgNotFound = "MSG_NOT_FOUND";
    this.msgDeleted = "MSG_DELETED";

    //user msg
    this.userMsgNotFound = "USER_MSG_NOT_FOUND";
    this.userMsgDeleted = "USER_MSG_DELETED";
    this.notUsingUserComKey = "NOT_USING_USER_COM_KEY";

    //blogRelation
    this.blogRelationNotFound = "BLOG_RELATION_NOT_FOUND";
    this.blogRelationDeleted = "BLOG_RELATION_DELETED";

    //Storage
    this.storageNotFound = "STORAGE_NOT_FOUND";
    this.storageDeleted = "STORAGE_DELETED";

    //blog
    this.postNotFound = "BLOG_POST_NOT_FOUND";
    this.postDeleted = "BLOG_POST_DELETED";

    //blog response
    this.responseNotFound = "RESPONSE_POST_NOT_FOUND";
    this.responseDeleted = "RESPONSE_POST_DELETED";

    //userKey
    this.userKeyNotFound = "USER_KEY_NOT_FOUND";
    this.userKeyRevoked = "USER_KEY_REVOKED";
    this.keyIsStillValid = "KEY_IS_STILL_VALID";

    //profile
    this.profileNoJson = "PROFILE_IS_NO_JSON";
    this.optionsNoJson = "PROFILE_IS_NO_JSON";

    //Session
    this.sessionSyntaxIncorrect = "SESSION_SYNTAX_INCORRECT";
    this.sessionIsNoJSON = "SESSION_SYNTAX_INCORRECT";
    this.sessionBadUpload = "BAD_UPLOAD";
    this.sessionKeyNotFound = "SESSION_KEY_NOT_FOUND";
    this.sessionDecryptionFailed = "SESSION_DECRYPTION_FAILED";
    this.sessionExpired = "SESSION_EXPIRED";
    this.reqHasNoSession = "REQUEST_HAS_NO_SESSION";
    this.reqOutOfBounds = "REQUEST_OUT_OF_BOUNDS";
    this.reqIsNotJson = "REQUEST_IS_NOT_JSON";
    this.watcherNotAllowedHere = "WATCHER_NOT_ALLOWED_HERE";
    this.sessionNotUsingLoginKeyID = "SESSION_NOT_USING_LOGIN_KEY_ID";

    //socket
    this.remoteSocketOpened = "REMOTE_SOCKET_OPENED";
    this.remoteSocketConnected = "REMOTE_SOCKET_CONNECTED";
    this.socketConnected = "SOCKET_CONNECTED";
    this.socketAuthenticationFailed = "SOCKET_AUTHENTICATION_FAILED";
    this.remoteSocketError = "REMOTE_SOCKET_ERROR";
    this.remoteSocketDisconnected = "REMOTE_SOCKET_DISCONNECTED";
    this.remoteSocketDisconnected = "SOCKET_DISCONNECTED";

    //Register
    this.userExsits = "USER_EXISTS";
    this.nameInUse = "NAME_IN_USE";
    this.msgCanNotBeValidated = "MSG_CAN_NOT_VALIDATED";
    this.noValidSignature = "NO_VALID_SIGNATURE";
    this.noRegistrationFound = "NO_REGISTRATION_FOUND";
    this.unreadableKey = "UNREADABLE_KEY";
    this.keyCanNotSign = "KEY_CAN_NOT_SIGN";
    this.keyCanNotEncrypt = "KEY_CAN_NOT_ENCRYPT";
    this.invalidActivationCodePGPMsg = "INVALID_ACTIVATION_CODE_PGP_MSG";
    this.unsupportedAlogrithm = "UNSUPPORTED_ALGORITHM";
    this.invalidKeyLength = "KEY_TO_SHORT";
    this.noPublicKey = "NO_PUBLIC_KEY";
    this.unmatchingKeyID = "UNMATCHING_RC_KEY_ID";
    this.unexpectedNumberOfKeys = "UNEXPECTED_NUMBER_OF_KEYS";

    this.spaceWaster = "SPACE_WASTER";


    //login
    this.userOrKeyNotFound = "USER_OR_KEY_NOT_FOUND";
    this.notTheLoginKey = "NO_THE_LOGIN_KEY";

};
