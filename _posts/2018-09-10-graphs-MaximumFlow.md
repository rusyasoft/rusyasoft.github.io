---
title: Maximum Flow
categories:
 - Algorithms, Graphs
tags:
 - algorithms, cormen, graphs
---


## Problem
Given a graph which represents a flow network where every edge has a capacity. Also given two vertices source *S* and sink *T* in the graph. Find out the maximum possible flow from *S*  to *T* with following constraints
a) Flow on an edge doesn't exceed the given capacity of the edge
b) In-flow is equal to Out-flow for every vertex except *s* and *t*

## Ford-Fulkerson Algorithm
The following is a simple idea of the algorithm
1) Start with a initial maxFlow as 0
2) While there is an augmenting path from source to sink Add this path flow to maxFlow
3) Return maxFlow

![NoImage](/assets/2018-09-10-maxflow/MaximumFlowExampleFigure1.jpg)

## Terminologies
- **Residual Graph**: It's a graph which indicates additional possible flow. If there is such path from source to sink then there is a possibility to add flow
- **Residual Capacity**: It's original capacity of the edge minus flow
- **Minimal Cut**: Also known as bottleneck capacity, which decides maximum possible flow from source to sink through an augmented path
- **Augmenting path**: Augmenting path can be done in two ways:
1) Non-full forward edges
2) Non-empty backward edges

**Not so clear, especially the 2nd one "Non-empty backward edges" :(, but we will get into it later in our example.

### What Happens If Naive Algorithm is Applied
Lets assume we have simple graph with four vertices and five edges:

![SimpleRombGraph](SimpleRombGraph.png)

When the Naive Greedy Algorithm (GA) approach is applied the maximum flow may be not produced. It is well known from the definition of the greedy algorithm that every step it tries to grab maximum value. Which is not always brings to the collective maxmum solution. 
1) From the source GA chooses 3 because it has highest value
2) From vertex 1 the GA would choose edge with value 5
3) Finally from vertex 2 the GA chooses only left edge which is 3

![SimpleRombGraph1](SimpleRombGraph1.png)
![SimpleRombGraph2](SimpleRombGraph2.png)
![SimpleRombGraph3](SimpleRombGraph3.png)
The GA ends the with the maximum flow 3, but actually the maximum flow 5 could be reached.

### Residual Graphs
The main novelty idea behind the Residual Graph is that algorithm allows "undo" operations. When we flow back on the edge (means go agains the direction of the arrow) then we add the flow number to the edge value. Main constraints here is that adding up number should not be bigger than original flow value of the edge.

## Step By Step Run
We are given the following graph:
![MaximumFlowEx1Pg1](MaximumFlowEx1Pg1.jpg)

Here, S is source and T is the sink which is target destination. Our goal is to calculate the maximum flow for this graph

Lets, just consider a path S -> A -> D -> T
![MaximumFlowEx1Pg2](MaximumFlowEx1Pg2.jpg)

The chosen path is called augmentation path, and each edge has different capacity. For example S -> A has capacity 10, A -> D has capacity 8, D -> T has capacity 10. The edge A->D with capacity 8 is the smallest among other edges. That is why it is called *minimal cut*, more traditionally we call it a bottleneck. Now every edge subtracts the bottleneck (in this case 8) from its capacity. That is why we can write the subtracted 8 on the right side of the slash. As a result for S->A we have "8/10", which means now this edge has capacity 2. Maximum Flow is the summation of the all "minimum cuts" at every step. We will get back to maximum flow later again.

Lets, continue in a same fashion, this time we go by lower edge S->C edge
![MaximumFlowEx1Pg3](MaximumFlowEx1Pg3.jpg)

Now we chose the path S->C->D and when we reach D there is no direct way to the target, because the edge D->T is already full and has 0 capacity remained. The maximum flow definition has mentioned above "Non-empty backward edges", which allow us to flow backward against the arrow. That is why D->A path can be used, as shown here:

![MaximumFlowEx1Pg4](MaximumFlowEx1Pg4.jpg)

Let's dive into details, and analyse whats happened here. The edge A->D already been full 8/8 (means 0 capacity left). But when we flow backward D->A we take away used flow that is why it becomes 4/8. In another word, we are adding the capacity to the edge. Yeah it sounds little confusing, but stay tuned. When we flow back and the minimum cut (bottleneck) for this step has been selected as 4 (because of A->B bottleneck), that is why now the edge A->D has capacity 4. It is kind of cancels out previous usage of the A->D capacity. Even though it sounds strange, mathematically it is absolutely correct and I think this is the key point of the whole *Maximum Flow* algorithm. 

**Important to remember that it is possible to flow back on the edge only if it has been flewed forward before. The value for flowing back cannot be bigger than the already used capacity. Which means if the A->D has not been used in previous steps and still had full capacity then we could not flow back from D->A

Now, we can continue the algorithm

![MaximumFlowEx1Pg5](MaximumFlowEx1Pg5.jpg)

and finally:

![MaximumFlowEx1Pg6](MaximumFlowEx1Pg6.jpg)

Now there is now way for flowing from S->T by augmenting any path. That is why we the algorithm stops here. Now we can list out all the augmented paths and bottleneck capacities on that step:

![MaximumFlowEx1Bottleneck](MaximumFlowEx1Bottleneck.jpg)

Summation of the bottleneck capacities for each step gives us the maximum flow result for this graph and it is 19.


## Implementation

There are different implementations of the Ford Fulkerson Algorithm. The Edmonds-Karp Algorithm is the implementation of the Ford Fulkerson algorithm where the BFS is used for traversing through Graph. When the BFS is used the complexity can be reduced to O(VE^2)



## Application Fields
- Data mining
- Open-pit mining
- Bipartite matching
- Network reliability
- Baseball elimination
- Image segmentation
- Network connectivity
- Distributed computing
- Egalitarian stable matching
- Security of statistical data
- Multi-camera scene reconstruction
- Sensor placement for homeland security

### Bipartite Matching 
There are dozens of real world problems that can be formed as Bipartite Matching. One of the popularly used one is Applicants and Jobs (mentioned by Robert Sedgewick in his Coursera MOOC):

![courseraRobertClass](courseraRobertClass.jpg)

Alice has been accepted by Adobe, Amazon and Google. Bob has been accepted by Adobe and Amazon, and so on. Each of these jobs only receives one person. How should we perform matching that each of these applicants gets the job. This problem can be converted into maximum flow problem, and it has following solution:

![courseraRobertClassSolution](courseraRobertClassSolution.jpg)

Lets design it in the graph, using VisualAlgo web site, which I found really good tool for quick check:

![MaxFlowCourseraExampleTriedAtVisualgo](MaxFlowCourseraExampleTriedAtVisualgo.jpg)

After designing the graph using VisualAlgo we can quick-run the algorithm for the result or check the solution step-by-step where each path augmentations are illustrated. Here the final solution and it perfectly matches with Robert Sedgwicks solution.

![MaxFlowCourseraExampleTriedAtVisualgoWithPath](MaxFlowCourseraExampleTriedAtVisualgoWithPath.jpg)

### Try to Apply to Web Services




## References
- Good Visual site for checking how the max-flow works: https://visualgo.net/en/maxflow
- Another good maximum flow calculator made by some German student
https://www-m9.ma.tum.de/graph-algorithms/flow-ford-fulkerson/index_en.html


