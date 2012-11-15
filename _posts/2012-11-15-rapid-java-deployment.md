---
layout: post
title: "Rapid Java Deployment"
published: true
tags: [Java, Continuous Delivery, Jenkins, Puppet, Jetty]
---
{% include JB/setup %}

At work, Norway's now largest online (and paper) media company, I have been doing some
work to cut down on deployment and delivery times for our java applications, as well as simplifying the procdures involved. Continuous Delivery is a hot buzzword nowadays, along with DevOps and I think we are quite good at the latter, but we needed improvement on the former. Besides, continuous delivery is about continuous improvements to the pipeline too. 

### Background and setup

We have 4 different environments to which we deploy our software, snapshot, stage, test and production, and snapshot has 4 versions so each team can use one for their stuff, without being overwritten by other teams. Local developer setups exists also, but are not covered here. These are proper, rather beefy servers with quite a lot of apps running. 

The old script for deploying one app to, say, snapshot1, was a shell script that did the following:

# Run a script on the ci server (CruiseControl) and copy all latest artifacts for all relevant apps (8-10 java/jetty apps of varying size)
# Commit these in a subversion repository
# Do some magic tagging in subversion 
# run puppet-sync on the relevant servers, with data from subversion.
# Restart varnish caches for the environment in question. 

Time spent: around 10 minutes, not counting the varnish warm-up wait on the first request. And most of the time, you were only deploying one or maybe two apps, but everything was done nevertheless. This was needed every time you wanted to deploy an app for someone else to see, product owner for instance. The reason this had become so slow, was, as is the case in many organizations, that it is written for a simpler time, but then at one point, it stopped evolving. The number of apps to support grows, the puppet-syncing from subversion gets slower, the varnish refresh takes longer etc. It all adds up. And puppet isn't very fast, and syncing large binary files is something it is particularly bad at. 

What was worse, was that when deploying to stage, test and prod, there was no shared script. There were a few lying aorund, but nothing solid. And you had to do parts of it manually. Run shell commands for tagging, finding the right servers (they change) and puppet-syncing. And for instance, for production, you can't do all 6 servers at once. You take one or two, and wait for the varnish ping to find them, let it warm, and do the next - all manually and watching as servers came up and down. Manual procedures are a pain, and many developers were vary of this. Lots of help seeking and asking of questions. And mind you, this procedure is not done by sysadmins, but by the developers. This is a good thing, but the threshold for doing it, and doing it well had to be lowered.

The rest of the blog post is about what we did to improve this. 

### The New Way

git
puppet new style
new script
 - server lookup
 - nexus
 - manual builds
times
prod too
