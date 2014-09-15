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

## Setup

The server setup which acts as a background for all this, is a fairly complex one. Amedia runs the digital parts of 79 local, small and large, newspapers in Norway. This means 151 app servers (excluding the cms servers, which are 246 alone) of which 39 are running Varnish instances with differing configurations. Note these are physical or virtual machines running multiple apps,spread across 10 different environments. 

Every piece of data, except app <-> database communication, runs over HTTP and through the varnish caches. There is caching in every step of the architecture and thus arise the need to finely tune the cache times, the cache headers and the tools to invalidate on a course or fine grained level. 

## Cache headers

RFC 7234(LINK) (the revised HTTP/1.1 spec mentions the normal cache headers, which can be useful to know about, event though they are not part of the cache invalidation scheme I will be discussing. 


References:

* http://tools.ietf.org/html/rfc7234
* http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01



