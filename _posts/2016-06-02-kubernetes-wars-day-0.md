---
layout: post
title: "The Kubernetes Wars: Day 0"
published: true
tags: [kubernetes,devops,ops,skydns,docker]
---
{% include JB/setup %}

_Operation k8s log, day 0 1100 Zulu_

So, we are sent out on a mission to deploy Kubernetes in our data centers, Google wrote it, management want it and the ops guys are gagging for it. And we have no choice but to follow orders and start using the damn thing. 

So what is this beast we are about to tackle? Anything like running 15-node elasticsearch clusters with bad sharding policies and crappy index patterns? Or as bad as trying to make sense of a cassandra cluster without knowing much about native american tribes? Well, we are about to find out. 

We have been running docker containers in production for a while now, and ops complained about lack of control on resources and limits and developers complained about lack of orchestration and scheduling. After a small firefight with the sales department and docker.com, who tried their probably-best-but-not-so-very-good to sell us some enterprisey stuff, along came kubernetes as the most likeley bogey we had to face. 

So What is Kubernetes?
-----------------------

[Kubernetes](http://kubernetes.io) is container orchestration, deployment, management and scaling, simply put. and boy can it do a lot for you. Take the kubectl cli, with its 48 commands and a grand total of 22 shared command line options and about 10-12 options _per command_ it's a whopper of a system. So what to do?

Bash, of course. 

Write bash (or any other scripting language to abstract away the forest of options you need for _every_ command, like cluster (one per data center, more on that later) and namespace (more on that too), object name to operate on and so on. You will need abstraction. I also wanted to fit k8s deployment and management into existing scripts dealing with both straight docker and old school native servers so a separate set of k8s scripts was born. I opted for one per command instead of the k8s style with one big ass one with a million options, because that's how I roll. 

Namespaces, Clusters and stuff
-------------------------------

Kubernetes docs says to vary about multi location clusters so we opted for one cluster per data center three in total. This gives a bit of overhead when it comes to deployment (we can't deploy in one big batch, but need three deploys to update all pods) but at the same time we can take a whole data center offline and upgrade the cluster without affecting the other two, which is nice. 

Another thing we discovered was that kubernetes by default make configuration and variables available to all containers in a namespace and everyone could see everything when all apps were deployed in the default namespace. So we namespace all apps into a separate namespace named after the app. As longs as all commands are namespaced (hence wrapper scripts) there is not much hassle. For snapshot and test environments, we use one cluster and not three to keep things simpler. 

