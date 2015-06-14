'use strict';

//validation config - do not change if you don't know what you are doing, this might result in an incompatible server to the rest of the "network"
//this is manly here for those that want to enforce stricter rules and regular expressions and might move out of the config folder altogether.

//database field lengths are also based on this
module.exports = function (config) {
    this.user = {};
    this.user.minLen = 3;
    this.user.maxLen = 40;
    this.user.regExp =
        /^[a-z0-9_]{3,40}$/;

    this.server = {};
    this.server.maxLen = 260; // 253(domain)+1(:)+6(port) // xxx.xxx.xxx.xxx:123456 | my.domain.sux:123456 | ip06:suxx:fe80:fe80:fe80:fe80:123456

    this.profile = {};
    this.profile.length = 1500;
    this.profile.textLength = 1000; //PGPMessage.text

    this.blog = {};
    this.blog.length = 2000;
    this.blog.textLength = 1000; //PGPMessage.text
    this.blog.responseTo = {};
    this.blog.responseTo.length = 3000;
    this.blog.responseTo.textLength = 2000; //PGPMessage.text
    this.blog.listLimit = 10;

    this.blogResponse = {};
    this.blogResponse.length = 2500;
    this.blogResponse.textLength = 2000; //PGPMessage.text
    this.blogResponse.listLimit = 10;
    this.blogResponse.review = {};
    this.blogResponse.review.length = 1200;
    this.blogResponse.review.textLength = 800;

    this.userStorage = {};
    this.userStorage.length = 15000;

    this.conversationManifest = {};
    this.conversationManifest.length = 5000;

    this.conversationMsg = {};
    this.conversationMsg.length = 2000;

    this.userMsg = {};
    this.userMsg.length = 2000;

    this.pubKey = {};
    this.pubKey.length = 500;

    this.pubKeyID = {};
    this.pubKeyID.length = 100;
    //make everything PGP has to offer part of the key id. only v4 is allowed until there is an v5, might not match EC based PGP keys, since they were not tested.
    this.pubKeyID.regExp =
        /^4;[0-9a-f]{16};[0-9a-f]{40};\d{3,4}$/;

    this.hex256RegExpText = "^[0-9a-f]{64}$";
    this.hex256Len = 64;

    this.fileUrl = {};
    this.fileUrl.regExp = ".{10,500}"; //todo https, port etc.. best search the internet for it or make it check rudimentary
    this.fileUrl.length = 500;

    this.uuidV4 = {};
    this.uuidV4.length = 36;
    this.uuidV4.regExp =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    this.ip = {};
    this.ip.length = 45;

    this.mail = {};
    this.mail.len = 500;
    this.mail.regExp =
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

    //this regex should test for correct domain and port format
    //it might be too restrictive for subdomains, since its self cooked!
    //(?=[\da-z-\.]{3,253}(\:.{1,5})?$)^\+?([\da-z]{1}([\da-z]{1}([\da-z]{1}([\da-z-]{1,59}([\da-z]{1}))?)?)?\.)+([a-z]{2,6})(\:(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))?$
    this.server.regExp =
        /(?=[\da-z-\.]{3,253}(\:.{1,5})?$)^\+?([\da-z]{1}([\da-z]{1}([\da-z]{1}([\da-z-]{1,59}([\da-z]{1}))?)?)?\.)+([a-z]{2,6})(\:(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))?$/;


    if (config.environment == config.enums.environmentModes.development ||
        config.environment == config.enums.environmentModes.productionTEST) {
        //disable server regex this in these modes, so we can work with ips and garbage for system tests
        this.server.regExp = ".*";
    }
    return this;
};
