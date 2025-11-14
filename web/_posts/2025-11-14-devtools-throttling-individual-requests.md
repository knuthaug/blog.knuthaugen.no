---
layout: post
title: "Devtools: Throttling Individual Requests"
published: true
tags: []
desc: Now you can throttle individual requests in chrome devtools
---

This just in! The Chrome team just dropped a very exciting new feature, and that is the ability
throttle individual requests (or individual request domains). The feature is just available in 
Chrome Canary (nightly builds) so far, but should make its way to prime time browsers soon enough. 

I for one cannot wait, but that same impatience has led me to start using Chrome Canary for some testing needs
just to be able to use this feature. For now it's behind a flag, so head over over to <code>chrome://flags#devtools-individual-request-throttling</code>, enable the flag and relaunch the browser. Note that the _flag_ itself is available in standard release chrome (and Brave and probably other chrome clones) but it won't do anything apart from Canary. 

### The How

After the flag is enabled, you simply right-click on a request in the network pane, choose <code>Throttle Requests</code> and choose one of <code>Throttle Request URL</code> or <code>Throttle Request Domain</code>. This pops open a new section below the network pane called "Request conditions" where you can:

- See all throttled URLs or domains
- Choose the amount of throttling to apply (3g, 4g, fast, 4g or blocked)
- Create your own throttling profiles to apply (these are the same as the existing throttling available today)
- Edit the URLs and use wildcards to match a set of URLs on a domain for instance

Your own throttling profiles can set custom values for latency, bandwidth and so on.

#### Selecting URLs

<img class="full-bleed" loading="lazy" src="/assets/images/throttle1.png" width="765" alt="screenshot of menu for selecting single urls to throttle"/>

#### Network Conditions

Here's a screenshot of the network conditions pane where I have set all CSS files (with a wild card) to 3G speed and one particular font to 4G to simulate the effects of slow loading of just the CSS.

<img class="full-bleed" loading="lazy" src="/assets/images/throttle2.png" width="765" alt="screenshot of pane with throttled requests"/>

### The Why

So what is the use case for this? A lot!