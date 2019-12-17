---
title: Introduction to Athena
categories:
 - aws, athena, serverless
tags:
 - athena, serverless
---

Amazon Athena is an interactive query service that makes it easy to analyze data in Amazon S3 using standard SQL. Athena is a serverless infrastructure that allows us to run SQL on S3 files. Athena helps to analyze unstructure, semi-structured and structured data stored in Amazon S3 (such as CSV, JSON, columnar data formats, Apache Parquet, Apache ORC). Detail references can be read from official aws [web-page](https://docs.aws.amazon.com/athena/latest/ug/getting-started.html)

## Quick Run

We have to create Athena database and table which is going to do crawling over Amazon S3 bucket rather than a file. Location path of S3 bucket must be given by considering a partition. It means some part of the path can become a partition and be served as a column. 

if the table that is partitioned by Year, then Athena expects to find the data at S3 paths similar to the following

```
s3://mybucket/athena/inputdata/year=2016/data.csv
s3://mybucket/athena/inputdata/year=2015/data.csv
s3://mybucket/athena/inputdata/year=2014/data.csv
```

If the data is located at the S3 paths that Athena expects, then repair the table by running a command similar to the following:

```
CREATE EXTERNAL TABLE Employee (
    Id INT,
    Name STRING,
    Address STRING
) PARTITIONED BY (year INT)
ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
LOCATION 's3://mybucket/athena/inputdata/';
```

After the table is created, load the partition information by using a command similar to the following: 

```
MSCK REPAIR TABLE Employee;
```

Details regarding to partitioning can be found from [here](https://aws.amazon.com/premiumsupport/knowledge-center/athena-empty-results/?nc1=h_ls)

## Naming Issue with Athena (BE CAREFUL !!)

I have spent an hour and couldn't create a athena table from S3. The table I have created stayed empty, and when I run `msck repair table <tableName>` it gave me an error

```
Your query has the following error(s):

FAILED: ParseException line 1:7 missing EOF at '-' near 'database1'

This query ran against the "database1-dev" database, unless qualified by the query. Please post the error message on our forum or contact customer support with Query Id: a39c130a-5935-4569-8834-663001e2919f.
```

after doing some googling, I have [found](https://forums.aws.amazon.com/thread.jspa?messageID=869230) that athena is quite sensitive about naming of databases and tables. Thats because when I have created new database with name database1dev (instead of database1-dev) it has worked without any problem. 