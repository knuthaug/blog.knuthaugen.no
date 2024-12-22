---
layout: post
title: "It's Time to Speculate"
published: true
date: 2024-12-21
tags: []
---

**Content Warning**: This post contains a high number of puns. Partake at your own discretion. 

After my colleague Ingvild made me aware of the [Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) I have been quite obsessed with testing it out and see how it feels to use in actual code. The ability to specify rules about how and when to prefetch or even prerender future navigations on a website or in an app is just so powerful. But as always, with [great power comes great responsibility](https://en.wikipedia.org/wiki/With_great_power_comes_great_responsibility). 

<h3><a name="rules">Speculation Rules API</a></h3>

The API is a successor to `rel=prefetch` which is widely available in browsers, but even more a replacement for the chrome-only `rel="prerender"`. The ability to specify rules and conditions for when and how content should be fetched or rendered make it much more usable and powerful, without having to _speculate_ on how you want to use it in your app. 

<h3><a name="waste">Waste not Want not</a></h3>

It's easy to get carried away by the sheer possibilities of the API but some bounds on your speculative ventures is advised. `prefetch` urls makes the browser fetch the document body of the page(s) and store them in an in-memory cache _for the document the user is on_. And all prefetches are discarded when navigating away. So all `prefetches` represent a possible waste of resources. But `prefetches` are still much cheaper than `prerenders`. 

Matching `prerender` rules instructs the browser to download the body of the document, all required subresources and render the document in invisible tab stored in the same in-memory cache. [Many browser APIs](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API#platform_features_deferred_or_restricted_during_prerender) are delayed when pre-rendering and will not be activated until the page also is activated (see events section below) and stuff like e.g. tracking and metrics should probably not be done at all before activation. Luckily there are events allowing you hook into the speculative load. 

The resource consumption of a prerender is comparable to rendering a document in a iframe, except that if your rules match a lot of documents, _a lot_ of speculation will occur. 

<h3><a name="events">Events</a></h3>

<h3><a name="implementation">Implementation Details</a></h3>

<h3><a name="debug">Debugging Speculation Rules</a></h3>