---
layout: post
title: "Cache invalidation: explained"
published: true
tags: [cache varnish amedia headers HTTP]
---
{% include JB/setup %}

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">"There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors"</p>

After seeing a talk on JavaZone 2014 which touched on cache handling in a very unfulfilling way, I thought I'd take a stab at one of these supposedly hard problems. And no, it will not be off-by-one errors. 



