---
layout: post
title: "Tracking Web Vitals on the Cheap"
published: true
tags: []
date: 2025-02-02
---

In my post on the [Speculation Rules API](https://blog.knuthaugen.no/web/2024/12/23/its-time-to-speculate.html) I talked briefly about [Web Vitals](https://web.dev/articles/vitals) and I want to dig deeper into the how and why of Web Vitals and an example of how you can track them over time for your own site. First, a quick introduction to Web Vitals for context. 

<h3><a name="how">Web Vitals 101</a></h3>

The article linked above has _a tonne_ of details on web vitals, how they are implemented and a huge amount of details. I'll give you the highlights. Web Vitals was started by Google to easily measure what the chrome team thinks are the most essential measurements for web performance, and is a continuation of the pagespeed system and tools. It's aim is to simplify the very basic question of "what should I change on my site to make the performance better for the user?"

Web Vitals focuses on three main metrics: 

- **Largest Contentful Paint** (LCP) (and it's sibling First Contentful Paint (FCP)) which is measuring loading performance. Google recommends you aim for a value below 2.5s
- **Interaction to Next Paint** (INP) which is measuring interactivity. The recommendation is a value below 200ms.
- **Cumulative Layout Shift** (CLS) measuring visual stability i.e. janky reflows of layout after first render. This value should be below 0.1

In addition you have **Time to First Byte** (TTFB) which measures exactly what is says on the tin and is also a performance metric. Web Vitals are nowadays anonymously tracked by the Chrome User Experience Report and you can use that to get a rough overview of your sites performance. But to be able to diagnose and fix individual pages that are misbehaving, it's better to instrument and report yourself. So that's what we are going to do. Besides, that's much more fun. 

The easiest way to see Web Vitals is on the Lighthouse tab of the chrome devtools. It now uses vitals under the hood but also shows them directly. But the performance tab is even more detailed and gives you so much more. 

<h3><a name="devtools">The Performance Tab</a></h3>

By opening the Performance tab for a Web.dev blog article, we get the following display:

<img class="full-bleed" src="/assets/images/performance.png"/>

Note: the field data is only possible because the web.dev blog tracks data to Chrome User Experience Report and is not something you will see locally without doing the same. You'll get the local values for your site, though, which can reveal a lot of useful information. You can also run the sampling with either cpu or network (or both) throttling to see the effects for user with older and slower devices. 

By clicking the little "reload" button near the top, you will get this incredibly detailed view of the loading characteristics of your page. 

<img class="full-bleed" src="/assets/images/performance2.png"/>

It can show you, well, just about everything about your page load, which elements are causing layout shifts, which assets are taking long to load and where in the process they are loaded, screenshots of the page at different stages of rendering, timings, sizes, which part of the rendering process is spending how much time doing its thing and so much more. 

<h3><a name="tracking">Tracking Vitals Over Time</a></h3>

<h3><a name="dash">Dashboards and Then Some</a></h3>