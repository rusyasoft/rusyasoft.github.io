---
title: Hello World Application Using HoloLens 2
categories:
 - hololens
tags:
 - hololens, hololens2, mixed-reality, augmented-reality, microsoft
---

Even though its not related to my work directly, I was able to get in touch with Hololens-2. I remember back from my work at KETI (Korea Electronics Technology Institute) when I first time played with Hololens (now its referred as Hololens-1). It was amazing feeling when you can see augmented things with such a great quality and precision just in front of your eye. I would like to admit that Hololens-2 is surely advanced version of previous Hololens. Its much lighter, faster, comfortably sits on your head, can fold screen to your top-head when you stop interacting with mixed-reality. 

When I wrote my first application on Hololens-1 it was kinda easy and steps were straight forward. Its been long time since then, so I don't exactly recall the steps. But overall steps are pretty similar for hololens-2. You setup Unity, then setup plugin for Hololens, then create a Hololens project put 3D stuff you like in it, make a build. Build in Unity will generate Visual Studio project, which you can open separately and compile, and finally deploy on device. 

## MRTK Tooling

As I have mentioned above, steps to build Hololens-2 kinda got complicated, compared to what I have experienced before for Hololens-1 build setup. Because now there is a tooling called [MRTK](https://docs.microsoft.com/en-us/windows/mixed-reality/mrtk-unity/mrtk2/?view=mrtkunity-2022-05) is introduced. Again I don't exactly remember using this tool before, but it was kinda little confusing at the setup time. But eventually it worked, so may be little improvement of documentation could help.

Other than that Steps for build setup are mostly same except Unity project relies on setups/configurations from MRTK tool. May be I don't see the whole advantage of actually having this MRTK tooling because, I was just aiming for "Hello World" application. Because I can see it has very advanced settings/configurations that can affect your build. 


## Tutorial Links For Quick Setup

For people whoever wants to do quick getting started, [this](https://docs.microsoft.com/en-us/learn/paths/beginner-hololens-2-tutorials/) is the official tutorial, so feel free to follow it. You will end-up creating a two boxes in your Mixed-reality application. I did add "Hello World" text by using [textmesh-pro](https://learn.unity.com/tutorial/working-with-textmesh-pro#) and added some non-functioning buttons.


<iframe width="560" height="315" src="https://www.youtube.com/embed/QE4DaXttXic" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
