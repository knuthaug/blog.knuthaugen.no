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
# run puppet-sync on the relevant servers, reading data from subversion.
# Restart varnish caches for the environment in question. 

Time spent: around 10 minutes, not counting the varnish warm-up on the first request. And most of the time, you were only deploying one or maybe two apps, but everything was done nevertheless. This was needed every time you wanted to deploy an app for someone else to see, product owner for instance. The reason this had become so slow, was, as is the case in many organizations, that it is written for a simpler time, but then at one point, it stopped evolving. The number of apps to support grows, the puppet-syncing from subversion gets slower, the varnish refresh takes longer etc. It all adds up. And puppet isn't very fast, and syncing large binary files is something it is particularly bad at. 

What was worse, was that when deploying to stage, test and prod, there was no shared script. There were a few lying around, but nothing solid. And you had to do parts of it manually. Run shell commands for tagging, finding the right servers (they change) and puppet-syncing. And for instance for production, you can't do all 6 servers at once. You take one or two, and wait for the varnish ping to find them, let it warm up, and do the next - all manually and watching as servers came up and down. Manual procedures are a pain, and many developers were vary of this. Lots of help seeking and asking of questions. And mind you, this procedure is not done by sysadmins, but by the developers. This is a good thing, but the threshold for doing it, and doing it well had to be lowered.

The rest of the blog post is about what we did to improve this. 

Goals were:

# Scripted one-click for all environments
# Not do more than was required
# Ditch puppet for syncing large binaries, use it for server config
# speed things up in general.

### The New Way

As a backdrop to this, we moved from subversion to git as version control. That presented some nice oppurtunities too.

The main job here was to create a script that was to be run on the app servers themselves which would do:

# Get a app name and a version on the command line
# fetch that app from a Nexus repo, other repo or git repo
# optionally restart. 

There are several benefits to this. One is that it is easy to script, another that it is very flexible and you can choose to run it via puppet, manually or via a script.

So we then made some changes. All apps got snapshot builds (via maven) deployed to nexus, alongside release builds. Snapshots are pushed from jenkins CI or manually if you wish. But we also added the option of building an app from source if you need to e.g. push a branch to a server for someone to test. The deploy scripts looks like this on the command line:

{% highlight bash %}

update-dev -s dev0 appname
# will update appname to the latest snapshot release on environment dev0

update-dev -r dev0 appname
# will update appname to the latest release version on environment dev0

update-dev -a -r dev0 
# will update all apps to the latest snapshot release on environment dev0

# if you want a specifi version, do
update-dev dev0 appname:1.45

# if you want to custom-build either do

update-dev dev0 appname:branch-foo:21451a
# to clone repo for appname, and build revision 21451a of branch branch-name
# this is then copied to git repo, and deployment script fetches it from there.
# if revision is ommitted, you get HEAD.

{% endhighlight %}

In addition to this, the script lookups which server is the current one for the enc

git
puppet new style
new script
 - server lookup
 - nexus
 - manual builds
times
prod too
