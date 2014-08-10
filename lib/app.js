var toobusy = require('toobusy-js');

//external libraries
var express = require('express');
var compression = require('compression');
var logger = global.logger;
var constants = global.constants;
var config = global.config;

//setup express as our router
global.app = express();

//gzip compress the whole traffic.. threshold 1 is an extremely pessimistic setting here
//if we could activate this option for each individual route depending on its contents it would be best
//for now its better than no compression, even if it costs us a little cpu time, adjust this IF it becomes a problem
app.use(compression({threshold: 1}));

//only in production environment, because in tests(due to startup an other stuff) and development(debugger!) environments it doesn't matter if the server is overloaded
if (config.environment == 'production') {
    // The absolute first piece of middle-ware we would register, to block requests
    // before we spend any time on them.
    app.use(function(req, res, next) {
        // check if we're toobusy() - note, this call is extremely fast, and returns
        // state that is cached at a fixed interval
        if (toobusy()) res.send(503, "busy");
        else next();
    });
}

//https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS
//accept ajax request from all sites
app.use(function(req, res, next) {
    //Allow CrossDomain Requests, needed for the whole thing to work!
    res.header("Access-Control-Allow-Origin", "*");
    //Allow all rest Methods, not just get!
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    //The headers the client is allowed to send to us!
    res.header("Access-Control-Allow-Headers", "Content-Type, Session, Content-Length");

/*    //The headers we are allowed to send to the client!
    res.header("Access-Control-Expose-Headers", "Content-Type, X-Signature, X-SignKeyID, X-Encryption");*/

    next();
});

//the router needs to be added last in the chain, but before the routes are added
/*app.use(app.router);*/
