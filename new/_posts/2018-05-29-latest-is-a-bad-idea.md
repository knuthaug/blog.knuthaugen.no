---
layout: post
title: "Latest is such a bad idea"
published: true
tags: [opinions, caching, versioning]
---

For the second time I have found myself pulling what little hair I have left out because of people falling for the trap that is using "latest" as version number in a dependency, on the web specifically. This is such a bad idea, but people keep falling into the pit of using it. I can understand that, because it is very alluring and simple. "Just use latest, and you're always up-to-date. No need to keep track of releases and just code and be happy." Understandable reasons, but the downsides are huge.

Most of these points refer to using an asset via an url in the markup of your site (maybe developed by another in-house team, or someone else entirely), but they apply to lesser extent to build-time dependencies too.

### Low TTL

Using latest as the version number almost always require low cache times for the asset. After all, if you cache it for a long time, you would not get the benefits of latest and get the newest version. Low cache time hurts your google-fu and pagerank and contributes to making your site slower for users. Don't do that.

### Undetected dependency changes

This is the flipside of the "feature" of "latest" as it updates your dependencies without you knowing. Great feature, right? Yeah, when all goes well it is. When someone botches the build and pushes a bad version you get blindsided with a failing site, with no warning. This happened to us recently. The core team released a botched build and it hit our site 10 minutes before the whole team was leaving for summer party. 1 hour later an everyone would be well into their beers. All because a guy on the team thought using "latest" was the simplest way forward. It was for a time, but it caught up to us.

Don't botch the build, you say? Well, good luck in never having human errors occur.

### Which version are we actually running?

Which version is the latest? Was the last upgrade a patch, a minor or a major? Does the release warrant changes to our site because of non-backward compatible changes? How do you find out, without having some sort of relationship with the version number? Ye gods the trouble that can come from this.

### Reproducible builds

When talking build-time dependencies, the concept of reproducible builds is important in devops, to be able to recreate a build later in time, from a git version. This is hard to get 100%, but simple steps will take you a long way towards it. This absolutely requires having specific version numbers in dependency management systems. Even version ranges, which Node users love, makes this near impossible. What version did "latest" resolve to at build time? How would you even begin to find out what the diff was between the two builds where "latest" resolved to two different versions? Using "latest" in e.g. node dependencies will create bugs for you, it's just a matter of time and how bad the bug will be. This goes even for dev dependencies, even though the repercussions are smaller. Gemfile.lock and package-lock.json does take some steps to avoid falling into this trap, and when you commit those files to version control, you can reproduce the builds back in time. But even so, I would argue that discreet version numbers are easier to manage and above all read and understand. It is right there, without having to check other files.

Using dynamic versions like latest, in the early stages of development is easy and should be fine, but you run the risk of forgetting to fix them later.
