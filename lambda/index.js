'use strict';
var gT = require("./getToken.js");
var ri = require("./runInstant.js");
var gid = require("./getInstantData.js");
var pt = require("./passThrough.js");

exports.handler = (event, context, callback) => {
    
    pt.passThrough(event);
  
    gT.getToken(function (b64_token)
        { 
            var insta_id = ri.runInstant(b64_token, event, function(callback)
            {
                var insta_data = gid.getInstantData(b64_token, callback);
            });
            
        });
   
};
