//string Constants that are used throughout the server.. gather HERE so we don't have to manually change every file later
//and also can build translations for them in the client.

var constants = {};

//common
constants.serverIsBusy = "SERVER_IS_BUSY";
constants.syntaxIncorrect = "SYNTAX_INCORRECT";
constants.userNotFound = "USER_NOT_FOUND";
constants.userDeleted = "USER_DELETED";
constants.modelOrDBError = "MODEL_OR_DB_ERROR";
constants.systemException = "SYSTEM_EXCEPTION";
constants.entryDeleted = "ENTRY_DELETED";
constants.uuidInUse = "UUID_IN_USE";
constants.success = "SUCCESS";
constants.IDIsNoUUID = "ID_IS_NO_UUID";
constants.notYours = "USER_IS_NOT_SESSION_USER";
constants.noPGPMsg = "NO_PGG_MSG";
constants.malformedRCKeyID = "MALFORMED_RC_KEY_ID";

//upload
constants.fileExitsts = "FILE_EXISTS";
constants.fileNotFound = "FILE_NOT_FOUND";
constants.fileToBigOrTruncated = "FILE_TO_BIG_OR_TRUNCATED";
constants.fileIDIsNoUUID = "FILE_ID_IS_NO_UUID";
constants.invalidUserName = "INVALID_USER_NAME";

//conversationManifest
constants.manifestNotFound = "MANIFEST_NOT_FOUND";
constants.manifestDeleted = "MANIFEST_DELETED";
constants.notUsingConKey = "NOT_USING_CON_KEY";

//conversation msg
constants.msgNotFound = "MSG_NOT_FOUND";
constants.msgDeleted = "MSG_DELETED";

//user msg
constants.userMsgNotFound = "USER_MSG_NOT_FOUND";
constants.userMsgDeleted = "USER_MSG_DELETED";
constants.notUsingUserComKey = "NOT_USING_USER_COM_KEY";

//blogRelation
constants.blogRelationNotFound = "BLOG_RELATION_NOT_FOUND";
constants.blogRelationDeleted = "BLOG_RELATION_DELETED";

//Storage
constants.storageNotFound = "STORAGE_NOT_FOUND";
constants.storageDeleted = "STORAGE_DELETED";

//blog
constants.postNotFound = "BLOG_POST_NOT_FOUND";
constants.postDeleted = "BLOG_POST_DELETED";

//blog response
constants.responseNotFound = "RESPONSE_POST_NOT_FOUND";
constants.responseDeleted = "RESPONSE_POST_DELETED";

//userKey
constants.userKeyNotFound = "USER_KEY_NOT_FOUND";
constants.userKeyRevoked = "USER_KEY_REVOKED";
constants.keyIsStillValid = "KEY_IS_STILL_VALID";

//profile
constants.profileNoJson = "PROFILE_IS_NO_JSON";
constants.optionsNoJson = "PROFILE_IS_NO_JSON";

//Session
constants.sessionSyntaxIncorrect = "SESSION_SYNTAX_INCORRECT";
constants.sessionIsNoJSON = "SESSION_SYNTAX_INCORRECT";
constants.sessionBadUpload = "BAD_UPLOAD";
constants.sessionKeyNotFound = "SESSION_KEY_NOT_FOUND";
constants.sessionDecryptionFailed = "SESSION_DECRYPTION_FAILED";
constants.sessionExpired = "SESSION_EXPIRED";
constants.reqHasNoSession = "REQUEST_HAS_NO_SESSION";
constants.reqOutOfBounds = "REQUEST_OUT_OF_BOUNDS";
constants.reqIsNotJson = "REQUEST_IS_NOT_JSON";
constants.watcherNotAllowedHere = "WATCHER_NOT_ALLOWED_HERE";
constants.sessionNotUsingLoginKeyID = "SESSION_NOT_USING_LOGIN_KEY_ID";

//socket
constants.socketConnected = "SOCKET_CONNECTED";
constants.socketAuthenticationFailed = "SOCKET_AUTHENTICATION_FAILED";

//Register
constants.userExsits = "USER_EXISTS";
constants.nameInUse = "NAME_IN_USE";
constants.msgCanNotBeValidated = "MSG_CAN_NOT_VALIDATED";
constants.noValidSignature = "NO_VALID_SIGNATURE";
constants.noRegistrationFound = "NO_REGISTRATION_FOUND";
constants.unreadableKey = "UNREADABLE_KEY";
constants.keyCanNotSign = "KEY_CAN_NOT_SIGN";
constants.keyCanNotEncrypt = "KEY_CAN_NOT_ENCRYPT";
constants.invalidActivationCodePGPMsg = "INVALID_ACTIVATION_CODE_PGP_MSG";
constants.unsupportedAlogrithm = "UNSUPPORTED_ALGORITHM";
constants.invalidKeyLength = "KEY_TO_SHORT";
constants.noPublicKey = "NO_PUBLIC_KEY";
constants.unmatchingKeyID = "UNMATCHING_RC_KEY_ID";
constants.unexpectedNumberOfKeys = "UNEXPECTED_NUMBER_OF_KEYS";

constants.spaceWaster = "SPACE_WASTER";


//login
constants.userOrKeyNotFound = "USER_OR_KEY_NOT_FOUND";
constants.notTheLoginKey = "NO_THE_LOGIN_KEY";

global.constants = constants;
