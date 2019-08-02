---
layout: post
title: "The Effects of Automation"
published: true
tags: [devops,automation,habits,deployments,CD]
---
{% include JB/setup %}

I want to reflect on the effects that habits can have on your daily life as a developer, after I came to think of the shift I have been through the last couple of years when it comes to deployments and habits surrounding deployments. I dawned on me the other day, that deployments are now completely a non-event for me, and has been so for quite some time. I just don't think about it anymore. How did that happen?

Some context: I work in a team developing and maintaining about 20ish web applications. The team is small and fairly autonomous, at least when it comes to technical matters. My efforts into automating deployments and builds started maybe around 2015-2016 at my previous employer (very similar in team and technical stack) and the outset was a kind of semi-automated deploys but with few safeguards and the feelings involved in deployments where mixed. Deployments were talked about a lot, coordinated with several people and was a medium sized deal. Not huge, but definitely not small either. And the rule was don't deploy on fridays (which is huge culture smell, maybe worth a whole post in itself). 

The end goal was of course to be able to cut down on lead times for putting code into production, with side goals of making it less of a pain to deploy, fewer failed deployments and fewer nervous faces when doing deployments. 

### Steps to safer deployments

There are several steps you can take to make your deployments more automated and safer, depending on the context you are in. Adding more unit and integration tests to the code, considering using feature toggles for new functionality, thinking carefully about the way the team communicates about the code (pair programming, code reviews, mob programming etc), using smoketests and possibly integration tests and performance tests before advancing the deploy from one stage to another and so on. Also, trying to deploy smaller chunks at a time contributes to safer deployments and can give you a spiral effects. Deploying often (as you do with small changesets) is painful when deployment is a manual process. This leads to automation of the deployment process, which makes it easier to deploy, so you do it more often etc. etc. 

In our case we made use of integrated healthchecks in the applications (checked by the orchestration platform) and smoketests built into the deployment pipelines. The effects are that 1) the new version does not start when healthcheck fails (first gate) and if smoketests fail (second gate) deployments halts and is rolled back. If this is enough, depends on the context and the apps. First we automated the build of the apps and not the deployment. The deployment was manual, with only healthchecks when doing deployment. This made deploys much less of a worry, but still very much a topic of conversation. It took quite some time before everybody was comfortable with deploying on fridays (rule now was that you could deploy anytime, but be prepared to clean up afterwards if something went wrong). Gradually, deployments were not talked about anymore, but the decision to deploy was still a conscious one. The habit settled nicely, but I felt that we where missing out on some benefits in terms of automation.

### Going the Distance

This was the case when I switched employers and got the opportunity to start anew with more experience. My goal was to be able to deploy apps (at least some) directly to production on push to master. The apps in question here varied a lot in terms of importance, quality and scope. The discussion now became: "How much, and what, do we need to do in order to make this app deploy directly to production?". That is profoundly different conversation to have, rather than "how often should we deploy". A related question that can crop up in cases like this, is "how do we communicate changelogs to sales/marketing/users/whoever?". This is not a topic you should skip! It's important to get this right, but it's also worth asking some questions about who uses the information in the changelogs and for what? But, automating the changelog is also possible via commits or other means. 
