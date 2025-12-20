---
layout: post
title: "The Kubernetes Wars: Day 7"
published: true
tags: [kubernetes, devops, ops, skydns, docker]
excerpt_separator: <!--more-->
---

### Other post in the series

- [Kubernetes Wars Day 0](/devops/2016/06/02/kubernetes-wars-day-0.html)
- [Kubernetes Wars Day 3](/devops/2016/06/04/kubernetes-wars-day-3.html)
- [Kubernetes Wars Day 34](/devops/2016/12/25/the-kubernetes-wars-day-34.html)

_Operation k8s log, day 7 0800 Zulu_

Along came the day for deploying the first high traffic node app to Kubernetes. And with it, our pain started to creep in. I had deployed around 10 apps earlier, and everything worked out smoothly. These were small helper apps doing background requests and not seeing a lot of traffic.
<!--more-->
Confidence was high and I went straight to the template app getting most of the browser traffic for our site, probably 10-20 rather heavy requests a second and running 6 instances in production in the old docker setup. So I deployed with six replicas and switched the backends in varnish. I takes a little while for content to go stale but I checked a url with a cache-buster and it did nothing. A b s o l u t e l y nothing, it just hanged there. WTF? Checked the logs real quick and there where 500s everywhere. Luckily the varnish grace/saint code saved my bacon while I switched back and nobody really noticed. But what the hell?

I was seeing timeouts on requests to almost every other server it was talking to for content, config, ads and what have you. What was this? Seriously overloaded server? It barely used cpu and ram, but somehow was not able to cope with almost _any_ traffic. Some testing revealed it maxed at about 1 request per second.

So we started what became the biggest yak shave of the month, looking at every possible angle to find out what these instances was doing to make them go so slow. Was it IO (some static files where read from disk)? Nope, not much IO going on. Was it slow IO performance in the docker container? Nope, barely reading anything either. We tried increasing the ram and the CPU for the container, just to rule that out to no avail.

I even tried to add two kubernetes instances in addition to the old running ones, and they still crashed soon after start. We scratched our heads again and again.

## DNS mofo

And so one of our ops guys stumbled on the solution. The traffic was generating several thousand dns requests a second, for calling other services and sending metrics. DNS resolution in node is a bit naive, you could say and default it will look up the address in use _every_ time it should be called, with no regard for TTL or caching. And in our kubernetes clusters we are running skydns for some nice features and since we also used an RC template not specifying a dns policy, we got _ClusterFirst_. This meant that the also under-cpu'ed skydns instances were getting hammered with every single one of those several thousand dns resolves every second, peaking on cpu and returning slower and slower responses. This made the node event loop wait increasingly longer for replies and in the end everything slowed to a crawl.

So the fix was to set dns policy to _Default_ which means using the docker dns setup. In our setup that meant dnsmasq running locally on all nodes, which we in hindsight should have been running all along. You learn something every day, eh?

And with that, everything just cleared up and we could serve all the traffic (and some more, but that is a tale for another time) on the same number of instances in kubernetes.

_End log Operation k8s, day 7_
