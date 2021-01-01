---
title: Introduction to Ionic framework
categories:
 - front-end, ionic, framework
tags:
 - front-end, ionic, framework, angular
---

Ionic is another cross-platform framework which allows to use web developers quickly build their mobile apps. Originally Ionic has been used angular-js as a front-end framework. But starting from Ionic-4, two other popular front-end frameworks (react and vue) can be used.

![img](/assets/2020/ionic/)

At the top level the developer's source code is standing, which runs on top of front-end framework. Front-end framework runs on top of Ionic framework (which actually developed using [stencil](https://stenciljs.com/) toolchain). Next comes Capacitor which is a native runtime that makes it easy to build web apps that run on iOS, Android, and on the web as Progressive Web Apps all powered by a single codebase. Capacitor converts our project into a native app by wrapping-up into a web-view based native app. Cordova could be used instead of Capacitor.

Soon in one of the next versions of Capacitor they are promising to solve the CORS problems, which is so far inevitable in Ionic project I guess. [Here](https://ionicframework.com/docs/troubleshooting/cors) is some troubleshooting links about CORS problem.



