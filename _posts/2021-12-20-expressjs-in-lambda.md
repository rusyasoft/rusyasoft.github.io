---
title: ExpressJS as AWS Lambda (Frugality)
categories:
 - expressjs, nodejs, aws, lambda, frugality
tags:
 - expressjs, nodejs, aws, lambda, frugality
---

Running expressJS in lambda we can actually build very frugal startup project, which can have verymuch unknown and unpredictable outcome. That feeling when you have built something and invested money for infrastructure but no user show up. In order to prevent that kind of frustrating experience we could actually start the project with lambda. Which could save us some cash.

ExpressJS can be quickly started by following [official](https://expressjs.com/en/starter/generator.html) documentation, or refer google for overwhelming information to get started.

## Concept

Before diving into the code lets do some quick analysis. If we follow standard way of developing expressjs application then we endup having following directory structure:

```
.
├── app.js
├── bin
│   └── www
├── package.json
├── public
│   ├── images
│   ├── javascripts
│   └── stylesheets
│       └── style.css
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── index.pug
    └── layout.pug
```

`app.js` is the entry point to our server application. As we know most of the codes are written at `routes` and related sections. Lets try to keep our `app.js` as independent and clean possible from actual business logics.

Another side: it is well known tha aws lambda also has a entry point which is usually handler function in following form:

```
exports.handler = (event, context) => {
    ...
}
```

Now we should have some way to bind these two entry points and make our expressJS work under lambda. [AWS-Serverless-Express](https://www.npmjs.com/package/aws-serverless-express) module is the who allows us to wrap our express app to to serverless use. There are some other libraries also available if you are interested, but I personally decided to use that one. Because I noticed its actively [contirbuted](https://github.com/vendia/serverless-express)

## Wrapping Express into Serverless

Wrapping express into serverless would have following look:

```javascript
'use strict'

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')


const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
```

If you want to serve not only apis but also other other pages from your lambda then mime types must be added. It can be done as follows:

```javascript
'use strict'

const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')

const binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'image/*',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
];

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes)

exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }
```

The code snippet shown above can be stored into `lambda.js` file and put at the same folder as `app.js`. To bring the dependecy add `"aws-serverless-express": "^3.4.0"` (version may change in the future) to the dependencies section of `package.json` file.

## Conclusion

It may be considered as not efficient solution since we have additional overhead operation (loading a framework) everytime when the request comes in. Since this is a nodejs code and it runs much faster than other languages on top of lambda, it is bearable. Indeed this solution is for people who already have their setup on ExpressJS and lazy to re-design architecture for serverless specific. If you are not lazy and ready to take a challenge on serverless then its good to re-design by SPA <--> API(Serverless) architecture.
