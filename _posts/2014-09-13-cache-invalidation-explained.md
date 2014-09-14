---
layout: post
title: "Cache invalidation: explained"
published: true
tags: [cache varnish amedia headers HTTP]
---
{% include JB/setup %}

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">"There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors"</p>

After seeing a talk on JavaZone 2014 which touched on cache handling in a very unfulfilling way, I thought I'd take a stab at one of these supposedly hard problems. And no, it will not be off-by-one errors. 

There are many ways to do cache invalidation, and all I am going to be talking about how we do it at Amedia, one of Norways largest online media houses. We use Varnish(LINK) for all out caching needs and the implementation is kind of tightly coupled to that. But the _principles should be useful across other technologies. 

## Cache headers

RFC 7234(LINK) (the revised HTTP/1.1 spec mentions the normal cache headers, which can be useful to know about, event though they are not part of the cache invalidation scheme I will be discussing. 


References:

* http://tools.ietf.org/html/rfc7234
* http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01



