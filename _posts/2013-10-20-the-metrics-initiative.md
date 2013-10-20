---
layout: post
title: "The Metrics Approach"
published: true
tags: [DevOps, Metrics, Java, Node.js, Ruby]
---
{% include JB/setup %}

Recently we started a newinitiative at work, and as per usual in our company, things just start to trickle into production when somebody (usually I) get an idea. This time, it was metrics. I read some articles from Etsy and not to forget Coda Hale from Yammer (at the time, at least) (see [http://pivotallabs.com/139-metrics-metrics-everywhere/](http://pivotallabs.com/139-metrics-metrics-everywhere/))

The itch started with wanting to know more about what our apps are doing, what effekt our deployment has (at least when arrow start to point in the wrong direction) and generally just know more. Our stack is roughly divided in three non-equal parts: java, ruby and node.js and I wanted something that could handle metrics from all 3 easily.

As the metrics backend we chose [graphite](http://graphite.wikidot.com/), written in python, which is fairly easy to set up, stable and performant for a large number of reporting apps. 

### Getting your data into graphite

This is the easy part. You can send pretty much from anything, commandline netcat stuff, java libraries, ruby gems and node modules make sending metrics quite easy. Once they are in graphite, the harder work of figuring out what and how to gra display the information. Metrics noe shown, are pretty much useless.

For java apps, we chose [metrics](http://metrics.codahale.com/) from none other than Coda Hale, which is a well written java library for measuring arbitraty metrics from any app. Easy integration into an already shared lib made it very easy to report from multiple apps in a couple of days. 

For now, we measure:

* Exceptions rates
* HTTP status rates for apps concerned with serving content
* failed/sucessfull logins for user apps
* Load time, render time, request times etc. for the front pages of our newspapers (via [webpagetest.org](http://www.webpagetest.org))
* Production deploys for apps
* Sonar violations and duplications for java apps.

And a key part here is that we graph both e.g. exceptions for an app with deployments for that app. This has already saved our bacon several times, when we see the graph go up just after a deploy, and dive in to fix it straight away. Especially for the front end performance graphs this is very nice (we really don't want to increase our load time any more than necessary). 

