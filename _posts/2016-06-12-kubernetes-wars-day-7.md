---
layout: post
title: "The Kubernetes Wars: Day 7"
published: true
tags: [kubernetes,devops,ops,skydns,docker]
---
{% include JB/setup %}

_Operation k8s log, day 7 0800 Zulu_

Along came the day for deploying the first high traffic node app to Kubernetes. And with, our pain started to creep in. I had deployed around 10 apps earlier, and everything worked out smoothly. These were small helper apps doing background requests and not seeing a lot of traffic. 

Confidence was high and I went straight to the template app getting most of the browser traffic for our site, probably 10-20 rather heavy requests a second and running 6 instances in production in the old docker setup. So I deployed with six replicas and switched the backends in varnish. I takes a little while for content to go stale but I checked a url with a cache-buster and it did nothing. A b s o l u t e l y nothing, it just hanged there. WTF? Checked the logs real quick and there where 500s everywhere. Luckily the varnish grace/saint code saved my bacon while I switched back and nobody really noticed. But what the hell?

I was seeing timeouts on requests to almost every other server it was talking to for content, config, ads and what have you. What was this? Seriously overloaded server? It barely used cpu and ram, but somehow was not able to cope with almost _any traffic. Some testing revealed it maxed at about 1 request per second. 

So we started what became the biggest yak shave of the month, looking at every possible angle to find out what these instances was doing to make them go so slow. Was it IO (some static files where read from disk)? Nope, not much IO going on. 
