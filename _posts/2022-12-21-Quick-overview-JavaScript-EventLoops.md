---
title: Quick Overview of JavaScript Event Loops
categories:
 - javascript
tags:
 - javascript, event loop
---

This post will be mostly about the quick summary on Event Loops in JavaScript. I think it is crucial thing to understand for JavaScript developers. For the details of please refer to the conference video presented by Erin Zimmer.

## Event Loop Intro

Here is the definition from Wikipedia that says "the event loop is a programming construct or design pattern that waits for and dispatches events or messages in a program". But if we are going to put it more simple its just a forever loop that runs and does something. 

```JavaScript
while (true) {
    doSomething();
}
```

In case of javascript it runs the code that lies in the queue.

```javascript
while (true)  {
    task = taskQueue.pop();
    execute(task);
}
```

Since javascript has mostly two platforms right now: Node-code and browser. The main concept for both quite similar while browser's case is more complex. Lets look at how the event loop looks like in terms of browser.

![Abstract Browser](/assets/2022/AbstractedBrowserArchitecture.png)

For this post lets just ignore the WEB API's side and simply lets think of it as an auxiliary functions, that javascript actually delegates to. In that case what we left over is JavaScript engine and Queue (in picture above depicted as Callback-Queue). Things are straightforward, we get the task from the queue execute. While executing we may end up adding new task to the queue and so on. Auxiliary WEB APIs also can generate some tasks and put them into the queue. Most of the time it will be related to external events, like user clicks on something or fetching external api has responded back.

## Zoomed In Event Loop

In reality we have more then a single queue where we store different kinds of tasks. We can categorize them as a Microtasks, Macrotasks, Rendering Pipeline, Animation Frame Callback Queue.


Macrotasks - onclick, fetch and other kind of external events
Microtasks - promises endup in microtasks
Rendering Pipeline - the task when browser actually renders tasks and put things on the screen
Animation Frame Callback Queue - is the queue through which we tell browser that we would like to animate. And we have to request right amount of animation otherwise we may block everything else. [Here](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) is more details about animation frame.

Lets look at the order and conditions of how queues are executed and its best described using following code:

```javascript
while (true) {
    queue = getNextQueue(); // get next macro-task
    task = queue.pop();
    execute(task);

    while (microtaskQueue.hasTasks())  doMicrotask(); // executed all micro-tasks

    if (isRepaintTime()) {
        animationTasks = animationQueue.copyTasks();    // fix the number of animations that are in the queue right now, so we run only those
        for (task in animationTasks) {
            doAnimationTask(task);                      // animate only fixed number of frames
        }

        repaint();  // finally run the render-task
    }
}
```

Figure below can be visual representation of these queues.

![QueuesAndOrders](/assets/2022/QueuesAndOrders.png)

## Summary

Rules mentioned in the Erin's presentation over queues:

- Queues can be executed in any order.
- Tasks in the same queue must be executed in the order they arrived
- Tasks from the same source must go in the same queue.

If above mentioned principles followed then there should not be any big mess with the order of the running events. But each vendor of browser decides how to optimize the orders and rules over which queue should run when and how often. I'm not exactly sure that every browser would exactly follow the steps/algorithm mentioned above, and it may change in the future as well.

## References:
[Further Adventures of the Event Loop (Erin Zimmer | JSConf EU 2018)](https://www.youtube.com/watch?v=u1kqx6AenYw)
[What the heck is the event loop anyway? | Philip Roberts | JSConf EU](https://www.youtube.com/watch?v=8aGhZQkoFbQ)