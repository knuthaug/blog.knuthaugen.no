---
layout: post
title: "Rapid Java Deployment"
published: true
tags: [Java, Continuous Delivery, Jenkins, Puppet, Jetty]
---

At my job, Norway's now second largest online (and paper) newspaper company, I have been doing some work to cut down on deployment and delivery times for our java applications, as well as simplifying the procedures involved. Continuous Delivery is a hot buzzword nowadays, along with DevOps and I think we are quite good at the latter, but we needed improvement on the former. Besides, continuous delivery is about continuous improvements to the pipeline too. And we had some stales processes and tools in place.

### Background and setup

We have 4 different environments to which we deploy our software, snapshot, stage, test and production, and snapshot has 4 versions so each team can use one for their stuff, without being overwritten by other teams. Local developer setups exists also, but are not covered here. These are proper, rather beefy servers with quite a lot of apps running, plus two varnish instances.

We use puppet to ensure how the servers are set up, and to distribute changes to config and setup. Puppet is mainly the concern of the ops team.

The old script for deploying one app to, say, snapshot1, was a shell script that did the following:

- Run a script on the ci server (CruiseControl) and copy all latest artifacts for all relevant apps (8-10 java/jetty apps of varying size)
- Commit these in a subversion repository
- Do some magic tagging in subversion
- Run puppet-sync on the relevant servers, reading binary data from subversion.
- Restart varnish caches for the environment in question.

Time spent: around 10 minutes, not counting the varnish warm-up on the first request. Also you _had_ to wait for CruiseControl to build the app before it could be pushed. There could be a queue.

And most of the time, you were only deploying one or maybe two apps, but everything was done nevertheless. This was needed every time you wanted to deploy an app for someone else to see, a product owner for instance. The reason this had become so slow, was, as is the case in many organizations, that it is written for a simpler time, but then at one point, it stopped evolving along with the organisation and the app ecosystem. This is a grave mistake.. The number of apps to support grows, the puppet-syncing from subversion gets slower, the varnish refresh takes longer etc. It all adds up. And puppet isn't very fast, and syncing large binary files is something it is particularly bad at.

CruiseControl was also slow at building several apps at once, and you often got some coffee time there too.

What was worse, was that when deploying to stage, test and prod, there was no shared script. There were a few lying around, but nothing solid. And you had to do parts of it manually. Run shell commands for tagging, finding the right servers (they change) and puppet-syncing. And for instance for production, you can't do all 6 servers at once. You take one or two, and wait for the varnish ping to find them, let it warm up, and do the next - all manually and watching as servers came up and down. Manual procedures are a pain, and many developers were vary of this. Lots of help seeking and asking of questions. And mind you, this procedure is not done by sysadmins, but by the developers. This is a good thing, but the threshold for doing it, and doing it well, had to be lowered. Our goal is that all developers should be able to push to production, safely, fast and with confidence.

The rest of the blog post is about what we did to improve this.

### The New Way

Goals were:

- Faster CI pushing artifacts to repo manager.
- Scripted one-click for all environments
- Not do more than was required, i.e. only deploy and restart the apps specified.
- Ditch puppet for syncing large binaries, use it for server config only.
- Speed things up in general.

As a backdrop, we migrated to Jenkins with four build nodes for speeding up build times when there is a lot going on. Simultaneously, we migrated from subversion to git, and started using Java7 and maven3 (yes, I know, we're slow on the uptake).

The main job here was to create a script that was to be run on the app servers themselves which would do:

- Get a app name and a version on the command line
- Fetch that app from a Nexus repo, other file repo or git repo
- Optionally restart.

There are several benefits to this. One is that it is easy to script, another that it is very flexible and you can choose to run it via puppet, manually or via a script.

So we then made some big changes. All apps got snapshot builds (by maven) deployed to nexus, alongside release builds. Snapshots are pushed from jenkins CI, or manually. But we also added the option of building an app from source if you need to e.g. push a branch to a server for someone to test. The old deployment routine only pushed war files for the webapp project to the server, while now we build a zip file bundling the war file and the dependencies needed for jetty startup too. This will make future jetty upgrades much easier too.

The deploy scripts looks like this on the command line:

```bash

update-dev -s dev0 appname

# will update appname to the latest snapshot release on environment dev0

update-dev -r dev0 appname

# will update appname to the latest release version on environment dev0

update-dev -a -r dev0

# will update all apps to the latest release version on environment dev0

# if you want a specific version, either release or snapshot, do

update-dev dev0 appname:1.45

# if you want to custom-build either do

update-dev dev0 appname:branch-foo:21451a

# to clone repo for appname, and build revision 21451a of branch

# branch-name. This is then copied to git repo, and deployment

# script fetches it from there. if revision is omitted, you get HEAD (no pun intended).

```
{: class="full-bleed"}

The main points here are:

- Only update the apps you specify via the script running on the server.
- Optionally update server config, via puppet.
- Ban URLs in Varnish, don't restart.

In addition to this, the script asks puppet which server is the current one for the environment, instead of hard coding this in the script. This means less maintenance burden when servers change. A central point is also to only restart apps you specify (instead of all apps) and flushing/banning Cache-Control groups in Varnish instead of restarting.

The work is distributed between the two scripts thusly:

- Script run on dev machine checks for valid version
- Does custom build if needed
- Finds servers
- Other misc. stuff like command line parsing
- Calls the right script on the right server

Script on server will then

- Fetch version
- Unzip app bundle, move stuff into place
- Tell puppet which version is now current for the environment in question
- Optionally restart

And then dev script again takes over and flushes caches.

Updating one app to latest snapshot or release and banning app URLs in Varnish is now down to 10-12 seconds not counting savings in cache fill time for the first request. Several of these seconds are spent querying puppet for metadata. This will be a bit faster in production.

### Further Work

Next up is using the same deployment strategy for all environments, but with a custom rollback feature for production and a wait strategy between servers. We thinking about extending this to not wait a certain amount of time, but rather monitor Varnish and move on once the backend is reported as up, and answering requests. Also, a wrapper script to be called from Jenkins for deploying to stage, run smoke tests, await result and deploy to prod if all is well is planned. And of course, no varnish flushing in production.

All in all, shaving of ~10 minutes of deploy time (this amounts to hours of wait/ineffective time on a busy day) is pretty significant. But the main win is less manual procedures in production, more power to the developers and faster delivery, when we need to.

