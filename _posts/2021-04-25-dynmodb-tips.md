---
title: DynamodDB Tips
categories:
 - aws, database
tags:
 - database, dynamodb, nosql
---


## Query Steps

It is very important to know the steps that are happening while we are running our query towards DynamoDB

1. Read items from table  -->  2. If FilterExpression, remove items that doesn't match   -->   3. Return Items




## DynamoDB Data Access in BigO notation

| Operation                             | Data Structure  | Notes                                                                                                              |
|---------------------------------------|-----------------|--------------------------------------------------------------------------------------------------------------------|
|Find node for partition                | Hash Table      | Time Complexity of O(1)                                                                                            |
|Find starting value for sort key       | B-Tree          | Time Complexity of O(log n), where n is the size of the item collection that fells under the pointed partition key |
|Read values until end of sort key match| Iterate         | Sequential read with 1MB limit, pagination should be implemented                                                   |


# Expressions

## Key Condition expressions

It works only with query operation only and operates only on primary key elements (partition key and sort key).

```python
import boto3

client = boto3.client('dynamodb')

resp = client.query(
    TableName = 'MovieRoles',
    KeyConditionExpression = "Actor = :actorVal",
    ExpressionAttributeValues = {
        ':actorVal': { 'S': 'Jackie Chan' }
    }
)

```


## Filter Expressions

Filtering can be applied to non primary key attributes. If the filter expression used wrong it doesn't save us from many read operations. Because before filtering the read operation performed based on key condition expressions and to that result the Filter expression is applied. But important to remember that read operation based on primary key cannot be more that 1MB. It means if we are leveraging on filter-expression without careful thought then we might endup with full scan. Ex: we have 1GB data under primary key, then we start filtering based on non-pk attributes, thatis equal to scan of 1GB data with 1MB pagination.

Sometimes we may need to do full-scan of all table, at that time Filter Expressions could be very useful to reduce network bandwidth. It means we will pay for reads anyway but at least we can win by reducing network latency. The logic is "If we are going to do filtering on application side after getting results, why don't we just do filtering on dynamoDB side". 

Additionally it is also used for TTL validation. Even though dynamoDB promices to delete TTL expired items, that promise might be faulty, since eventual consistency.

## Projection Expressions

Projection expression is used to let the query know what fields of the item we would like to receive. Becaus by default item is returned as a whole.

Note: Important to remember that projection expression is applied after read items happened from the DynamoDB. Which means if our item sizes are big, no matter how we apply projection expression we will be charged for the whole size of the returned item. So don't store the file in dynamodb, otherwise you will cry at the end of the month when you see your bill!

## Condition Expressions

Condition Expression is applied for write operations (put, update, delete), and it is evaluated before the write is applied. if it evaluates to "false", the write operation is not applied.

Functions:
- attribute_not_exists() - prevent overwrites
- attribute_exists()
- contains() - check for membership
- size() - ensure limits

Example-1: 

```python
import boto3
client = boto3.client('dynamodb')
resp = client.put_item(
    TableName = 'MovieRoles',
    Item = {
        'Actor': {'S', 'Tom Hanks'},
        'Movie': {'S', 'Toy Story'},
        'Role': {'S', 'Woody'},
        'Year': {'N', '1995'},
        'Genre': {'S': "Children's"}
    },
    ConditionExpression = "attributes_not_exists(#actor)",
    ExpressionAttributeNames={
        "#actor": "Actor"
    }
)
```

Example-2:

```python
import boto3
client = boto3.client('dynamodb')
resp = client.update_item(
    TableName = 'BankAccount',
    Key={
        "AccountId": {'S', '65456'}
    },
    ConditionExpression = "#balance >= :payment",
    UpdateExpression = "SET #balance = #balance - :payment",
    ExpressionAttributeNames = {
        '#balance': 'Balance'
    },
    ExpressionAttributeValues = {
        ':payment': {'N': '12.05'}
    }
)
```

## Update Expressions

Is used only for Update operations only with following four verb operations

|Verb   | Attribute Types   | Effect                                   |
|-------|-------------------|------------------------------------------|
|SET    |Any                | Add or overwrite existing attribute      |
|       |Number             | Increment or decrement existing value    |
|REMOVE |Any                | Delete attribute from item               |
|ADD    |Number             | Increment or decrement existing value    |
|       |Set                | Insert element into set                  |
|DELETE |Set                | Remove element from set                  |










