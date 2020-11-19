var http = require("https");

function passThrough(webhook) {
    var slack_url = process.env.slack_webhook_url;
    const slack_host = slack_url.split('/')[2]
    const slack_path = slack_url.split(slack_host)[1]
    var options =   {
                        "method": "POST",
                        "hostname": slack_host,
                        "path": slack_path,
                        "headers": {"content-type": "application/json"}
                    };
    var req = http.request(options, function (res) {console.log(res.statusCode)});
    var text = "{\"text\":\"*Alert Information*\n>Go to test settings: https://portal.catchpoint.com/ui/Content/Tests/TestDetail.aspx?id="+webhook.testID+"\n>testURL: "+webhook.testURL+"\n>nodeID: "+webhook.nodeID+"\n>nodeName: "+webhook.nodeName+"\"}";
    req.write(text);
    req.end();
}
module.exports.passThrough = passThrough;
