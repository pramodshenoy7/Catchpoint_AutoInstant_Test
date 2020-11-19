'use strict';
var qs = require("querystring");
var http = require("https");

function runInstant(b64_token, event, callback) 
{
    var instaID = 0;
    var insta_req_header  = 
    {
            "method": "POST", "hostname": "io.catchpoint.com", "path": "/ui/api/v1/onDemandTest/0",
            "headers":{
                            "Accept": "application/json", "content-type": "application/x-www-form-urlencoded", "Authorization": b64_token
                      }
    };
    
    var get_insta_token = http.request(insta_req_header, function (res) 
    {
              console.log("reached here");
              var chunks = [];
              console.log("Got response: " + res.statusCode);
              res.on("data", function (chunk) {
                chunks.push(chunk);
              });
              res.on("end", function () {
                  var body = Buffer.concat(chunks);
                  var json = JSON.parse(body);
                  var insta_token = Buffer.from(json.id.toString());
                  instaID = insta_token.toString();
                  console.log(instaID);
                  callback(instaID);
              });
              
    });
    get_insta_token.write("{ \"http_method\": { \"name\": \"GET\", \"id\": 0 }, \"nodes\": [ { \"name\": \"Los Angeles - Comcast\", \"id\":"+ event.nodeID +"}, { \"name\": \"Chicago - NTT\", \"id\": 248 },{ \"name\": \"Boston-XO\", \"id\": 412 }  ], \"monitor\": { \"name\": \"monitor\", \"id\":"+event.monitor+" }, \"id\": 0, \"test_type\": { \"name\": \"Web\", \"id\": 0 }, \"test_url\":\""+event.testURL+ "\" }");
    get_insta_token.end();
}
module.exports.runInstant = runInstant;
