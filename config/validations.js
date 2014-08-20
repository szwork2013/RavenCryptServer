//validation config - do not change if you don't know what you are doing, this might result in an incompatible server to the rest of the "network"
//this is manly here for those that want to enforce stricter rules and regular expressions and might move out of the config folder altogether.

//database field lengths are also based on this
var validations = {};
validations.user = {};
validations.user.minLen = 3;
validations.user.maxLen = 40;
validations.user.regExp =
    /^[a-z0-9_]{3,40}$/;

validations.server = {};
validations.server.maxLen = 260; // 253(domain)+1(:)+6(port) // xxx.xxx.xxx.xxx:123456 | my.domain.sux:123456 | ip06:suxx:fe80:fe80:fe80:fe80:123456

validations.profile = {};
validations.profile.length = 1500;
validations.profile.textLength = 1000; //PGPMessage.text

validations.blog = {};
validations.blog.length = 2000;
validations.blog.textLength = 1000; //PGPMessage.text
validations.blog.responseTo = {};
validations.blog.responseTo.length = 3000;
validations.blog.responseTo.textLength = 2000; //PGPMessage.text
validations.blog.listLimit = 10;

validations.blogResponse = {};
validations.blogResponse.length = 2500;
validations.blogResponse.textLength = 2000; //PGPMessage.text
validations.blogResponse.listLimit = 10;
validations.blogResponse.review = {};
validations.blogResponse.review.length = 1200;
validations.blogResponse.review.textLength = 800;

validations.userStorage = {};
validations.userStorage.length = 15000;

validations.conversationManifest= {};
validations.conversationManifest.length = 5000;

validations.conversationMsg= {};
validations.conversationMsg.length = 2000;

validations.userMsg = {};
validations.userMsg.length = 2000;

validations.pubKey = {};
validations.pubKey.length = 500;

validations.pubKeyID = {};
validations.pubKeyID.length = 100;
//make everything PGP has to offer part of the key id. only v4 is allowed until there is an v5, might not match EC based PGP keys, since they were not tested.
validations.pubKeyID.regExp =
    /^4;[0-9a-f]{16};[0-9a-f]{40};\d{3,4}$/;

validations.hex256RegExpText = "^[0-9a-f]{64}$";
validations.hex256Len = 64;

validations.fileUrl = {};
validations.fileUrl.regExp = ".{10,500}"; //todo https, port etc.. best search the internet for it or make it check rudimentary
validations.fileUrl.length = 500;

validations.uuidV4 = {};
validations.uuidV4.length = 36;
validations.uuidV4.regExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

validations.ip = {};
validations.ip.length = 45;

validations.mail = {};
validations.mail.len = 500;
validations.mail.regExp =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

//this regex should test for correct domain and port format
//it might be too restrictive for subdomains, since its self cooked!
//(?=[\da-z-\.]{3,253}(\:.{1,5})?$)^\+?([\da-z]{1}([\da-z]{1}([\da-z]{1}([\da-z-]{1,59}([\da-z]{1}))?)?)?\.)+([a-z]{2,6})(\:(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))?$
validations.server.regExp =
    /(?=[\da-z-\.]{3,253}(\:.{1,5})?$)^\+?([\da-z]{1}([\da-z]{1}([\da-z]{1}([\da-z-]{1,59}([\da-z]{1}))?)?)?\.)+([a-z]{2,6})(\:(6553[0-5]|655[0-2]\d|65[0-4]\d\d|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}))?$/;


var config = global.config;

if (config.environment == config.enums.environmentModes.development ||
    config.environment == config.enums.environmentModes.productionTEST){
    //disable server regex validations in these modes, so we can work with ips and garbage for system tests
    validations.server.regExp = ".*";
}

module.exports = validations;