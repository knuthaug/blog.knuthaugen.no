---
layout: post
title: "The Kubernetes Wars: Day 34"
published: true
tags: [Kubernetes, Docker, DevOps]
---

#### Other post in the series

- [Kubernetes Wars Day 0](/2016/06/kubernetes-wars-day-0.html)
- [Kubernetes Wars Day 3](/2016/06/kubernetes-wars-day-3.html)
- [Kubernetes Wars Day 7](/2016/06/kubernetes-wars-day-7.html)

_Operation k8s log, day 34 1100 Zulu_

We got used to this kind of fighting after a while, you ease into it and accept it as the new standard operating
procedure. More and more apps where moved to the kubernetes stack and things where running smoothly. But, when you think to yourself «hmm, I haven't gotten any surprises lately?» that's when they hit you in the face.

## Memory? Who needs it?

As more java apps where being moved whe started out by duplicating the memory settings for the old app, e.g. -Xmx 1024mb on the command line for the JVM. And then setting the memory limit for the container to 2-300 MB more than that. This works fine. Sometimes. For a while.

But then someone notices a weird high restart count on one of the apps. Not so much that the alarms go off, but maybe a couple of times a day or a handful a week. So someone slaps some more memory on it, but then stops to think «This container eats 300 megs _more_ than the Xmx setting of the JVM in the container?» That's a little strange isn't it? What is actually going on here?

If you ask linux what memory the process is using, it will answer in (usually) RSS (Resident Set Size), which for java roughly translates to Heap Size + Metaspace + offheap size. Here, Offheap size consists of thread stacks, direct buffers and mapped files (libraries and jars), plus the jvm code itself. MetaSpace contains class instances in the code that runs. This all adds up.

The big eater in the family is the threads which as a default has 1M stack size. Some of our apps has a lot to do and can get between 500-1000 threads per instance in peak traffic. That's a gig of memory right there.

And the mapped libraries and jvm eats some more. So the answer is: measure it properly to find out just how much memory your app needs in a docker container to stay alive and thrive. It's more than you think. A nice guide tomeasuring and understanding memory in java is [http://trustmeiamadeveloper.com/2016/03/18/where-is-my-memory-java/](http://trustmeiamadeveloper.com/2016/03/18/where-is-my-memory-java/).

## CPU? Who needs it?

And then CPU came along. Based on the rough estimates of CPU requirements each app got a handlful and made do. This usually works. But now and then, somebody working on java apps said that their apps would just get killed a short while after startup, with no apparent reason. What's happening here? After some digging, it turns out that the app was being killed by kubernetes itself, roughly 30s after starting, not by OOM but by not replying OK on liveness and readyness probes. The app in question is a low traffic app with a 2 CPU core limit. Shouldn't that be enough when normal traffic barely uses half a core?

Well, these apps where running spring boot, spring frameworks less (but only a little) ugly cousin. Less ugly because it's a modern framework, but still ugly because, well, it's spring (YMMV). Turns out that all the housekeeping spring wants to do on startup takes a lot of time when all you give it is two cpu cores. The outcome is that it won't start in time for the readyness/liveness probes complete in time and kubernetes determines this app is dead and finish it off. So there's two fixes, increase the initialWait for the liveness/readyness checks or boost the cpu limit way higher. I like speedy deploys, so we use the latter strategy.

## Measurements

We measure cpu and memory utilization (with the requirement and limit in the graph) per app via heapster/influxdb and display them in grafana alongside our other graphs. This is a great way to see how your app is doing and tuning the limits to suit the app. This is really hard without visualisation in my experience.

_End log Operation k8s, day 34_
