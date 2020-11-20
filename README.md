# **Using AWS Lambda as a proxy to run onDemand instant tests on Catchpoint Alerts**

An effective Digital Experience Monitoring (DEM) platform should help users detect, identify and escalate issues quickly which in turn **reduces the overall time to resolution**. As a Solutions Engineer at Catchpoint, I have been teaching customers how Catchpoint helps in achieving faster MTTR thus reducing downtime, SLA violations, poor customer experience and bounce rates.

It has also been a great learning on how customers with years of monitoring experience approach DEM and situations where my role requires me to think out of the box – where standard solution would not meet customer requirements.

Here is one such scenario where a customer had a slightly different approach to reduce the time of detection and identification and at the same time control costs. The required implementation needed Catchpoint to run tests from multiple locations and network in an automated way whenever a drop in their service availability is detected from a single node. This solution would help them achieve following positive outcomes: 
+ Not increase cost of testing by only running simultaneous tests when a downtime is detected
+ Not having to wait for multiple nodes to finish running tests and then have Catchpoint notify them. (further reducing MTTD)
+ Also, helps them prioritize issues immediately based on whether the detected issue is regional, ISP specific or global (aids in reducing MTTE)

In this project, we are using -
+ [Catchpoint Synthetic Monitoring](https://www.catchpoint.com/synthetic-monitoring)
    + scheduled tests that can trigger alerts on downtime
    + alert webhook for sending alert notifications out
    + REST APIs to run onDemand tests
+ [AWS Lambda](https://aws.amazon.com/lambda/)
    + acts a proxy to receive webhooks from Catchpoint and run onDemand instant tests
+ [Slack Webhooks](https://api.slack.com/messaging/webhooks)
    + all the alerts get pushed into Slack via its webhooks

## **Overall flow of the project**

![](https://raw.githubusercontent.com/pramodshenoy7/Catchpoint_AutoInstant_Test/main/other/Flow.png)
1.	Catchpoint pushes alert into AWS via the configured webhook URL – AWS API Gateway
2.	API Gateway forwards the requests to Lambda function for further processing
3.	AWS Lambda then proxies the request payload as is to Slack via Slack webhooks. Thus, making the alert information available over Slack channel as quickly as possible.
4.	AWS Lambda asynchronously calls Catchpoint REST APIs to run instant test on the URL that failed from different locations and retrieves the results.
5.	The result of instant tests will then be pushed into Slack via Slack webhooks.


### **End Result in Slack UI**
**Part 1** – the alert message as is pushed by Catchpoint and proxied by AWS into Slack.\
**Part 2** – instant test results that was auto-triggered.

![](https://github.com/pramodshenoy7/Catchpoint_AutoInstant_Test/blob/main/other/Slack_messages.png?raw=true)


## **Setup**
**Step 1 - Catchpoint Setup part 1 - enable REST API consumer**  
REST API can be enabled in the Catchpoint portal under Settings -> API -> REST API -> Add Consumer
+ the generated **`key`** and **`secret`** will later be used in the AWS Lambda - environment variable setup

**Step 2 - Slack Setup - enable incoming webhook**
Slack documentation for setting up incoming webhooks can be found [here](https://api.slack.com/messaging/webhooks).
The generated webhook URL looks something like this - https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
+ the generated **`Webhook URL`** will be used in AWS Lambda - environment variable setup.

**Step 3 - AWS setup**

**Lambda configuration**
+ Create a new Lambda function from scratch
    + Runtime - Node.js 12.x
    + default lambda execution role
    + upload the code present in [/lambda](https://github.com/pramodshenoy7/Catchpoint_AutoInstant_Test/tree/main/lambda) directory to Function code
    + configure environment variables
        + **`cp_client_key`**: Catchpoint REST API `key` value
         + **`cp_client_secret`**: Catchpoint REST API `secret` value
         + **`slack_webhook_url`**: Slack `Webhook URL` starting with https
+ Configure API Gateway
    + Create new API GAteway - choose REST API type
    + import the swagger file [Webhook_toAWS.json](https://github.com/pramodshenoy7/Catchpoint_AutoInstant_Test/blob/main/api_gateway/Webhook_toAWS.json)
    + associate the API's POST method to the recently created Lambda function. 
    + deploy API. API gateway will now be the trigger to execute Lambda function.
    + the generrated POST URL that looks like this - https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/POST_alert - will be used in the next step.

**Step 4 - Catchpoint Setup part 2 - configure alert webhook**  
Alert Webhook can be enabled in the Catchpoint portal under Settings -> API -> Alert Webhook
Here are the items to configure:
+ Name: can be anything
+ URL: API Gateway POST URL from Step 3
+ Format: Template -> Add New -> Select JSON and add the JSON present in [`catchpoint/alert_webhook.json`](https://github.com/pramodshenoy7/Catchpoint_AutoInstant_Test/blob/main/catchpoint/alert_webhook.json)
+ Save the template
+ add an email address to notify in case webhook POSTing fails
+ Save the alert webhook
+ add the newly created webhook in Alert settings of tests of the type 'Web'

**To test the integration** either
+ create a new Web test in Catchpoint that would fail and trigger the alert webhook
+ try the below JSON as a test event within your Lambda function

> {
  "testID": "253312",
  "testURL": "http://www.google.com/404",
  "nodeID": "762",
  "nodeName": "Dallas, US -AT&T",
  "monitor": "2"
}

## **Future improvement**
+ Currently, this project supports test of the type Catchpoint 'Web' only. Additional enhancements could be done to support other test types.
+ Alert ID can be added to flag the alert information pushed into Slack for easy search.
