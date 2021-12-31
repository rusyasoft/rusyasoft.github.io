---
title: Serving aws lambda frugally via ALB(Application Load Balancer)
categories:
 - expressjs, nodejs, aws, lambda, frugality, alb
tags:
 - expressjs, nodejs, aws, lambda, frugality, alb
---

If we have a goal to build a service using lambda we can serve it using [API-Gateway](https://aws.amazon.com/api-gateway/) which is fully managed service from aws that makes it easy for developers to create, publish, maintain, monitor and secure of API at any scale. We can find many good examples over there for this kind of stack, but in this post I would like to talk about serving lambda via ALB. Which could endup being cheaper or even free (if you use free 12 month tier aws account). I don't want to dive into the discussion of what is better API-Gateway where you pay per request count or ALB which is payed by running hours. One thing that challenged me was to setup web-app that would be served as an ALB --> Lambda combined stack.

## ALB to Lambda setup via console

In order to make it work we should know that ALB should be backed up by Target Group. Target Group is aws resource that decides where the actual calls are forwarded. Forwarding can be done to IP based, instance based or lambda based resources as an entities of the target group.

![ALB Listener](/assets/2021/12/alb-images/alb-listener.png)

ALB listener has a rule where port 80 is listened for http incoming requests and forwarded to target-group (named `Hamma-LBHTT-52KRLLFSW2ON`). It is also possible to setup https end-point by attaching SSL certificates to ALB listener. In above example we don't have any specific rules regarding of forwarding incoming packages, but if it is required ALB has a quite good [rule engine](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-update-rules.html).

### VPC based Lambda

The citation from aws official site says:
```
By default, Lambda runs your functions in a secure VPC with access to AWS services and the internet. Lambda owns this VPC, which isn't connected to your account's default VPC. When you connect a function to a VPC in your account, the function can't access the internet unless your VPC provides access.
```

The wording may sound little confsing, but lets try to put it in a more plain English. By default lambda is not attached to our account's VPC, so if we want to interact with in VPC resources (Redis, RDS, EC2 etc) then we have to put lambda into our VPC. Also since lambda by default is not attached to our VPC it has no access to global internet. In summary, you get lambda which has no connection to internet and can only receive incoming requests from ALB. For any application that does something useful in most cases we need at least internet connection. 

![VPC-settings-of-lambda](/assets/2021/12/alb-images/vpc-settings-of-lambda.png)

VPC for lambda can be set at "lambda -> Configuration -> VPC". Another important thing to note is that lambda should be put under private subnet of the VPC, puting it under public subnet is not gonna work. Obviously if you want to allow the flow from ALB to port 80 then Security-group of the lambda should have port 80 in allow list of inboud rules.

## ALB to Lambda setup via CDK (IaC)

All above setting can be also done using CDK, following code snippets can be served as a good example for starters:

```typescript
// Create a VPC in two AZ
const vpc = new ec2.Vpc(this, "VPC", {
  natGateways: 1,
  maxAzs: 2
});

// Lambda function declaration
const lambdaFunction = new lambda.Function(this, 'lambda-function', {
  runtime: lambda.Runtime.NODEJS_14_X,
  memorySize: 1024,
  timeout: cdk.Duration.seconds(60),
  handler: 'lambda.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, '/path/to/the/asset/folder/')),
  environment: {
    REGION: cdk.Stack.of(this).region,
    AVAILABILITY_ZONES: JSON.stringify(
      cdk.Stack.of(this).availabilityZones,
    ),
  },
});

// Create an internet-facing Application Load Balancer using the VPC
const lb = new elbv2.ApplicationLoadBalancer(this, "LB", {
  vpc,
  internetFacing: true,
});

// Add a listener on port 443 for and use the certificate for HTTPS
const listenerHTTP = lb.addListener("HTTPSListener", {
  port: 80,
});

// Add a target with the AWS Lambda function to the listener
listenerHTTP.addTargets("HTTPSListenerTargets", {
  targets: [new targets.LambdaTarget(lambdaFunction)],
  healthCheck: {
    enabled: true,
  },
});

// Printing out ALB Entry point
new cdk.CfnOutput(this, 'ALB Entry point', {
      value: lb.loadBalancerDnsName
});
```

The code above is self descriptive, only thing to mention here is we need to have NAT resource connected to our private subnet. Otherwise private and public subnetworks would have no connection and private subnet would have no internet connection. There are two kinds of NAT solutions are avaialbe in [aws](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-comparison.html): NAT-Gateway service and NAT-Instances.

Following is the example of creating VPC with either of NAT kind based on switch flag:

```typescript
export enum NatType {
    GATEWAY = "NatGateway",
    INSTANCE = "NatInstance"
}

private createVPC(natType: NatType) {

  const vpcProps = (natType == NatType.INSTANCE)? 
    {
      maxAzs: 2,
      natGatewayProvider: new ec2.NatInstanceProvider({
        instanceType: new ec2.InstanceType('t2.nano'),
      })
    }
    : 
    {
      natGateways: 1,
      maxAzs: 2,
    }    
  return new ec2.Vpc(this, "VPC", vpcProps);
}
```

## Lambda Quota Limits

If you are going for a production with this setup then don't forget to request quota extension of for concurrency limit. By default it is 1000 which is quite a big enough. But if you are considering big load it is something you should look into this. Requesting limit increase doesn't require any additional charges from you. So called soft limit 1000 can be easily extended to 10'000 (tried for Frankfurt region). But if you need even more than that, then you may need to explain details of your application and load pattern to the AWS Customer Service. No worries, if you need it they will provide it (at the end you pay for what you use anyway)

## What NoSQL to use ?

Since lambda is the serverless compute it would be more proper to use serverless DB accordingly (dynamodb). But in most cases when we migrate to AWS we want to reuse the DB which we already have expertise on. MongoDB worked well for the beginning, but during stress-test it was the bottleneck. Our application start failing because MongoDB couldn't handle many number of connections. Even declaring the connection globally and reusing existing connection is still wasn't enough. The reason is we don't control which lambda contain instances lives and which one whipes out. When the container whiped out, we start having zombie mongoDB connections. In my stress test we try to run mongoDB on premise and ec2 the results were same. Next step was adding a redish cache layer which did allow us to increase number of incoming concurrent request towards the lambda.
