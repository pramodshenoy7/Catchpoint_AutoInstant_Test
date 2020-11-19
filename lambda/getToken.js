'use strict';
var qs = require("querystring");
var http = require("https");

function getToken(callback) 
{
    var token_req_header = 
    {
                "method": "POST", "hostname": "io.catchpoint.com", "path": "/ui/api/token",
                "headers":{
                            "Accept": "application/json", "content-type": "application/x-www-form-urlencoded"
                          }
    };
                
    var get_token = http.request(token_req_header, function (res) 
                    {
                        var chunks = [];
                        console.log("Got response: " + res.statusCode);
                        res.on("data", function (chunk) 
                            {
                                chunks.push(chunk);
                            });
                        res.on("end", function () 
                            {
                                var body = Buffer.concat(chunks);
                                var json = JSON.parse(body);
                                var token = Buffer.from(json.access_token).toString('base64');
                                var b64_token = "Bearer " + token;
                                console.log(b64_token);
                                callback(b64_token);
                             });
                    });
                    
    get_token.write(qs.stringify({ grant_type: 'client_credentials', client_id: process.env.cp_client_key, client_secret: process.env.cp_client_secret }));
    get_token.end();
    
}
module.exports.getToken = getToken;