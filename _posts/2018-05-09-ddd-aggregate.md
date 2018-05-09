---
title: DDD, Aggregate
categories:
 - DDD
tags:
 - Domain-Driven-Design
---


## What is Aggregate ?
An Aggregate is a cluster of associated object that we treat as a single unit. Considering every object of the Design separately may and will cause big complication. In order to avoid the complexity the aggregates are used. 

### Simple Tips about Aggregates
- Aggregates are not always the answer to the problem
- Aggregates can connect only between root aggregates
- Use FK (Foreign Key) to access children of the associated aggregates is possible
- "Aggregate of One": Single object can be a root aggregate (without any childs)
- Rule of Cascading Deletes. If the root-aggregate is deleted, then associations should be deleted too
- **Invariant:** A condition that should always be true for the system to be in a consistent state
- **Persistent Ignorant Class:** Classes that have no knowledge about how they are persistent




> An **aggregate** is a cluster of associated objects that we treat as a unit for the purpose of data changes.
>
> -- <cite>Eric Evans (Domain-Driven Design)</cite>

