---
title: Common Modeling Pitfalls in GraphDB
categories:
 - database
tags:
 - graphdb, neo4j, graphs
---

In order to avoid pitfalls we have to check the design for queryability
- Describe the client or end-user goals that motivate our model
- Rewrite these goals as questions to ask of our domain
- Identify the entities and the relationship that appear in these questions
- Translate these entities and relationships into Cypher path expressions
- Express the questions we want to ask of our domain as graph patterns using path expressions similar to the ones we used to model the domain

