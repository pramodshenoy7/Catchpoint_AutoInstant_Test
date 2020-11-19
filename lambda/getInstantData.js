'use strict';
var qs = require("querystring");
var http = require("https");
var pdi = require("./pushDebugInfo.js");

function getInstantData(b64_token, instaID){

setTimeout(function() {
  var insta_result_header  = {
                        "method": "GET", "hostname": "io.catchpoint.com", "path": "/ui/api/v1/onDemandTest/" + instaID,
                        "headers":{
                                    "Accept": "application/json", "content-type": "application/x-www-form-urlencoded", "Authorization": b64_token
                                  }
                              };
  
  var  get_insta_data = http.request(insta_result_header, function (res) {
                          var chunks = [];
                          console.log("Got response: " + res.statusCode);
                          res.on("data", function (chunk) {
                            chunks.push(chunk);
                          });
                          res.on("end", function () {
                              var body = Buffer.concat(chunks);
                              var json = JSON.parse(body);
                              console.log(json);
                              pdi.pushDebugInfo(json, instaID);
                          });
  });
  get_insta_data.end();
                  

}, 6000);

}

module.exports.getInstantData = getInstantData;
