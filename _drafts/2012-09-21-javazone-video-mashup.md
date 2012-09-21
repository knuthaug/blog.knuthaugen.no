---
layout: post
title: "JavaZone video mashup
description: "Post on the JavaZone video mashup site I wrote for JavaBin, using Play Framework and MongoDB"
category: 
tags: [JavaZone, Java, Play]
---
{% include JB/setup %}

I just launched (video.javazone.no)[http://video.javazone.no] a mashup site collecting the videos of talks from (JavaZone)[http://www.javazone.no] from 2009 through 2012. As with any project where you don't have the time you want, there are some things I am happy with, and some things, well not so happy. But overall I pretty happy.

### Implementation

The main app is written in (Play Framework)[http://playframework.org] 1.2.5 and using MongoDB TK in the backend. The reason for choosing MongoDB is primarily that it is easy to work with (low developer friction) and has enough querying capabilities for this project. The data model also fit pretty well, with little coupling of different objects at the database level. A simple db reference handles it nicely.

The reason for Play was mainly to test it out and see if it's a good framework or not, and also to get away from some of the friction of using standard java server frameworks like Spring MVC (or indeed any server toolkit doing it the normal java way, which is tedious and needlessly complicated. Play lends itself quite heavily on the convention over configuration approach and removes a lot of clutter when setting up a simple controller that has responsbility over an URL, fetches some data, feeds that into a template and renders it.

It picks up some nasty habits along the way, though. Like under the covers using exceptions for routing control TK and using static methods all over the place. The fact that you default can't run a single test but have to run all tests in a test class is a real PITA too.
