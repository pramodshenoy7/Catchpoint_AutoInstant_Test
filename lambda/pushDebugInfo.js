var http = require("https");

function pushDebugInfo(json, instaID) {
    var nodeName=[], webResp=[], statusCode=[], desc=[];
    var count = json.items.length;
    var data = "";
    var slack_url = process.env.slack_webhook_url;
    const slack_host = slack_url.split('/')[2];
    const slack_path = slack_url.split(slack_host)[1];
    for(var i=0;i<count;i++)
    {
            nodeName[i] = Buffer.from(json.items[i].node.name).toString();
            webResp[i] = Buffer.from(json.items[i].web.summary.items[0].metrics[0].toString()).toString();
            statusCode[i] = Buffer.from(json.items[i].web.detail.items[0].metrics[11].toString()).toString();
            if('test_failure' in json.items[i].web){
                desc[i] = Buffer.from(json.items[i].web.test_failure.description).toString();
            } else {
                desc[i] = "Everything up!";
            }
            console.log(nodeName[i]);
            console.log(webResp[i]);
            console.log(statusCode[i]);
            console.log(desc[i]);
            console.log(i);
            data = data + "•Node: "+nodeName[i]+" |Test Time: "+webResp[i]+"ms |HTTP Status: `"+statusCode[i]+"` |Message: _"+desc[i]+"_";
            data = data + "\n";
    }
    if(count==0){
        console.log("Debug info not found");
        data = "Debug info not found";
    }
    console.log(data);


var options =   {
                        "method": "POST",
                        "hostname": slack_host,
                        "path": slack_path,
                        "headers": {"content-type": "application/json"}
                    };
    var req = http.request(options, function (res) {console.log(res.statusCode)});
    //var text = "{\"text\":\"testID: "+webhook.testID+"\ntestURL: "+webhook.testURL+"\nnodeID: "+webhook.nodeID+"\"}";
    var text = "{\"text\":\"*Instant Test*\n*Link* - https://portal.catchpoint.com/ui/Content/Charts/InstantTestDetail.aspx?id="+instaID+"\n*Summary*\n"+ data+"\"}";
    req.write(text);
    req.end();
}
module.exports.pushDebugInfo = pushDebugInfo;
