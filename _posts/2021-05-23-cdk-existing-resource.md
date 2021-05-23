---
title: Import Existing AWS Resources into CDK
categories:
 - aws, cdk
tags:
 - aws, cdk, cloud, infrastructure, devops
---

Till now there is no official way of complete import of existing aws resource into a CDK Stack. AWS CDK docs have little bit confusing messages about this fact. For example [dynamodb](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-dynamodb-readme.html#importing-existing-tables) docs has a title which says "Importing existing tables", but deep-dive can reveal that it has limitations. We can only create [ITable](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-dynamodb.ITable.html) kind of resources which quite a big differences with original [Table](https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-dynamodb.Table.html) class. To my knowledge, CDK does not allow appropriate way of importing existing tables. I have discovered some walk-round by using CloudFormation feature.

## CloudFormation Import Existing Resource

At some point Cloudformation started allowing import of existing resources into a CloudFormation Stack. There  is a good [blog](https://aws.amazon.com/blogs/aws/new-import-existing-resources-into-a-cloudformation-stack/) that walks through how to use that feature. It can be done from aws console by selecting an existing cloud formation stack and clicking *Stack actions -> Import Resources into stack*. Then we can upload CloudFormation template json file which contains list of resources we are intended to bind with CloudFormation.

## Way-round for CDK

After building CDK we get CloudFormation stack template file, we can perform the same operations on that file.

Overal Steps:
- create a basic CDK stack, with some dummy resource inside (Lets call the dummy resource as D-resource). It can be any kind of resource (ex: SNS Topics are could candidate, created really fast). Make sure you are working on the same region where you want to perform import of existing resource (Lets call existing resource as E-resource).

- build and deploy CDK stack with D-resource

- modify the code of CDK stack by adding a E-resource. It means just declare the same kind resource with the same name.
- build the CDK stack, but DO NOT DEPLOY!
- when build is done, open project folder and find the CloudFormation template file (should be under build/cdk.out/stack-name.template.json). Lets refer to this CloudFormation template as `N-cf-template.json`
- open aws-console and go to CloudFormation, to find the previously deployed stack. Previously means the stack we deployed at previous step, the one that contains our D-resource. Then choose *Stack actions -> Import Resources into stack* and upload the `N-cf-template.json` file. Further steps are similar to steps described in the CloudFormation [blog](https://aws.amazon.com/blogs/aws/new-import-existing-resources-into-a-cloudformation-stack/)
- when the import is done, we can perform deployment of CDK stack (which we built but not deployed previously)
- [optional] we can remove the D-resource from CDK Stack

Te be safe it is advised to set DeletionPolicy to Retain for all new resources. That way even if something goes wrong with our import, we can make sure our existing resource stays. 

## Philosophy of Walk-Round

1) CDK -> CloudFormation -> Create Resources
2) CloudFormation -> Import Existing Resource. Binds existing resources with CloudFormation stack resource references.
3) CDK -> deploy-to -> CloudFormation. When we try to deploy CDK the CloudFormation syncs up, with already containing resources.

