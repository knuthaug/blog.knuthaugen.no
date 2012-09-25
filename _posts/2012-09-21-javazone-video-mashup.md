---
layout: post
title: "JavaZone video mashup"
published: true
tags: [JavaZone, Java, Play]
---
{% include JB/setup %}

I just launched [video.javazone.no](http://video.javazone.no) a mashup site collecting the videos of talks from [JavaZone](http://www.javazone.no) from 2009 through 2012. As with any project where you don't have the time you want, there are some things I am happy with, and some things i am, well not so happy about. But overall I am pretty happy.

### Implementation

The main app is written in [Play Framework](http://playframework.org) 1.2.5 and using [MongoDB](http://www.mongodb.org/) in the backend. The reason for choosing MongoDB is primarily that it is easy to work with (low developer friction) and has enough querying capabilities for this project. The data model also fits pretty well, with little coupling of different objects at the database level. A simple db reference handles it nicely. MongoDB has some, how should I put it, _interesting_ views on data integrity and there are situations where you can lose data running on a single node. The data set for this app is all generated and updated while running, but can be recreated at any time. So losing data isn't a big deal, and it doesn't happen *that* often. 

The reason for Play was mainly to test it out and see if it's a good framework or not, and also to get away from some of the friction of using standard java server frameworks like Spring MVC (or indeed any server toolkit doing it the normal java way, which is tedious and needlessly complicated). Play lends itself quite heavily on the convention over configuration approach and removes a lot of clutter when setting up a simple controller that has responsbility over an URL, fetches some data, feeds that into a template and renders it. The fact that you default can't run a single test but have to run all tests in a test class is a real PITA. Play has some other mild annoyances too, but generally I am pretty happy with it.

All in all, these things have been involved in the site:

* Play Framework
* MongoDB
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/) for templating/design
* [FontAwesome](http://fortawesome.github.com/Font-Awesome/) for nice icons
* [SASS](http://sass-lang.com/ ) for better stylesheet authoring
* [Rake](http://rake.rubyforge.org/) and git for vcs, packaging and deployment
* [Heroku](http://heroku.com/) and [MongoHQ](https://www.mongohq.com/) cloud providers for running test sites.

Here's a little screenshot for you:

![Video site screenshot](/images/videosite-screenshot.png)

I collaborated with [bjartek](https://twitter.com/bjartek) on it for a while and as he is a scala/functional programming buff, we tried out a few different techniques. Some using [Google Guava](http://code.google.com/p/guava-libraries/) and some using [Functional Java](http://functionaljava.org/). This made the codebase a little messy in some parts and also the fact that the java syntax doesn't really support it well. Will try to clean up that soon. Anyway, if you try the site, I'd love some feedback on it. Juts bear in mind that I am no designer. Give a shout either on [twitter](http://twitter.com/knuthaug) or in the comments (if and when they arrive). 
