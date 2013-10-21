---
layout: post
title: "The Metrics Approach"
published: true
tags: [DevOps, Metrics, Java, Node.js, Ruby]
---
{% include JB/setup %}

Recently we started a newinitiative at work, and as per usual in our company, things just start to trickle into production when somebody (usually I) get an idea. This time, it was metrics. I read some articles from Etsy and not to forget Coda Hale from Yammer (at the time, at least) (see [http://pivotallabs.com/139-metrics-metrics-everywhere/](http://pivotallabs.com/139-metrics-metrics-everywhere/))

The itch started with wanting to know more about what our apps are doing, what effekt our deployment has (at least when arrow start to point in the wrong direction) and generally just know more. Our stack is roughly divided in three non-equal parts: java, ruby and node.js and I wanted something that could handle metrics from all 3 easily.

As the metrics backend we chose [graphite](http://graphite.wikidot.com/), written in python, which is fairly easy to set up, stable and performant for a large number of reporting apps. It supports sending data over both TCP and/or UDP and uses a simple, debuggable plaintext protocol format. 

## Getting your data into graphite

This is the easy part. You can send pretty much from anything. Command line netcat stuff, java libraries, ruby gems and node modules make sending metrics quite easy. Once they are in graphite, the harder work of figuring out what and how to display the information begins. Metrics not shown, are pretty much useless. Graphites web graphing capabilities are pretty good, but I ended up writing a small in-browser-app wrapping it and making it even easier to navigate graphs, create simple dashboards and set up new graphs when they appear. I still use the native graphite system for testing out new metrics and experimenting. And support for SVG graphs is pretty cool. Fullscreen graphs in a heartbeat. 

For java apps, we chose [metrics](http://metrics.codahale.com/) from none other than Coda Hale, which is a well written java library for reporting arbitraty metrics from any app and storing them in graphite (among other backend). Easy integration into an already shared lib made it very easy to report from multiple apps in a couple of days. 

For now, we measure:

* Exception rates
* HTTP status rates for apps concerned with serving content
* failed/sucessfull logins for user apps
* Load time, render time, request times etc. for the front pages of our newspapers (via a private instance of [webpagetest.org](http://www.webpagetest.org))
* Production deploys for apps
* Sonar violations and duplications for java apps.

And a key part here is that we graph both e.g. exceptions for an app with deployments for that app and relevant collaborating apps. This has already saved our bacon several times, when we see the graph go up just after a deploy, and dive in to fix it straight away. Especially for the front end performance graphs this is very nice (we really don't want to increase our load time any more than necessary). 

Here's an example graph showing deploys (vertical yellow and brown lines) causing a spike in render times for our front page:

<img src="../../../images/render.svg" width="651" height="445" alt="Render time graph, with deploys"/>

## Display

Metrics need to be shown to be understood. We have several big screens around the office showing some of the most interesting graphs and this has led to discovering bad deploys pretty quickly. But we already see that there are too few screens to show everything we should show. 

An interesting project I aim to take a look at is the [Kale stack](http://codeascraft.com/2013/06/11/introducing-kale/) consisting of Skyline and Oculus (cool names!). This is a anomaly detection system (Skyline) and anomaly correlation system (Oculus) written specifically for handling a large number of metrics - large enough that you can't watch them all. Etsy have a lot of cool stuff - and not just the merchandise. 

## Next Steps

We do not, as of yet, report any metrics from ruby or node apps, but we definitely plan to, using the relevant libraries in Ruby and Node. We mostly display technical metrics for the time being and the reasons for this are: We have other system reporting stuff like click-through tracking, user time, sessions behaviour etc. One idea is to incorporate this into the same graphs as, for instance, deployments to see if there is a pattern to user behaviour after deployments of new feature. 

More technical metrics regarding A/B testing is also something we should look at in the near future. 
