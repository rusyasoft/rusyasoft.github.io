---
title: Algorithms, BFS - Breadth First Search
categories:
 - Algorithms
tags:
 - algorithms, graphs, trees, bfs, dfs, cycle, edge, vertex, vertice
---

Breadth-first search systematically explores the edges of G graph to discover every vertex that is reachable from starting node S. The main purpose of BFS is to calculate the distance from S to each reachable vertex. If we are given two arbitrary nodes and asked for the distance between them, then the BFS is the standard solution. The algorithm works for both directed and un-directed graphs.

# Pseudo-code and step-by-step representation from Cormen Book

![BFS_cormen](/assets/images/graphs/BFS_cormen.png)

*G = (V, E)* is represented using adjacency lists. It attaches several additional attributes to each vertex in the graph. Each vertex color is stored at *u.color* and the predcessor of *u* in the attributed *u.p*. If *u* has no predcessor then *u.p = NIL*. The attribute *u.d* holds the distance from the source *s* to vertex *u* computed by the algorithm. FIFO queue *Q* is used to manage the set of gray vertices.

![BFS_cormen_stepbystep_process](/assets/images/graphs/BFS_cormen_stepbystep_process.png)

White color - not visited nodes
Gray color - about to be visited (keeping them in FIFO queue)
Black color - visited nodes

Intitialization with unlimited signature is needed to tell that node is impossible to reach from the starting *s* node. At the end of the BFS if still see some unlimited signs then there is no path from *s* to that node.


