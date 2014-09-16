---
layout: post
title: "Cache invalidation: explained"
published: true
tags: [cache varnish amedia headers HTTP]
---
{% include JB/setup %}

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">"There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors"</p>

After seeing a talk on JavaZone 2014 which touched on cache handling in a very unfulfilling way, I thought I'd take a stab at one of these supposedly hard problems. And no, it will not be off-by-one errors. 

There are many ways to do cache invalidation, and all I am going to be talking about is how we do it at Amedia, one of Norways largest online media houses. We use [Varnish](http://www.varnish-cache.org/)[3] for all out caching needs and the implementation is kind of tightly coupled to that. But the _principles should be useful across other technologies. 

## Setup

The server setup which acts as a background for all this, is a fairly complex one. Amedia runs the digital parts of 79 small and large newspapers in Norway. This means 151 app servers (excluding the CMS servers, which are 246 instances alone) of which 39 are running Varnish instances with differing configurations. Note these are physical or virtual machines running multiple apps, spread across 10 different environments and 2 data centers. This system has roughly 6.5M page views daily (that is the pages, not all the individual resources like css/js, images and so on), and the sustained throughput of the front varnishes during the day is about 45 Mbps of traffic (each) and combined bandwith usage is around 800Mb/s in the daytime.. 

Every piece of data, except app <-> database communication, runs over HTTP and through the Varnish caches. There is caching in every step of the architecture and thus arise the need to finely tune the cache times, the cache headers and the tools to invalidate on a course or fine grained level. 

## Cache headers

[RFC 7234](http://tools.ietf.org/html/rfc7234)[2] (the revised HTTP/1.1 spec) mentions the normal cache headers, which can be useful to know about, event though they are not part of the cache invalidation scheme I will be discussing. 

* Age
* Expires
* Cache-Channel

## Extensions to cache-channel

A [draft by Mark Nottingham](http://tools.ietf.org/html/rfc7234)[1] back in 2007 introduced the concept of Cache channels which are specified as an extension to the cache-channel header (See RFC 7234). Extensions are a part of the HTTP/1.1 spec (revised) and nothing new, but the channel and group extensions were introduced in this draft but seem to have been shelved after that. I can't find a mention in any RFC after this. But Varnish can implement this through VCL and this is what we do. And this is very useful for cache invalidation. 

## Varnish Concepts

* Ban
* Softban
* Purge
* Grace

## Headers

## Implementation

We have enforced very strict rules in all our apps regarding cache headers and run them through filtering removing headers we do not want. This is important! Rogue expires headers can wreak havoc on a caching solution such as this. The short version is this:

* We do not use _expires_. Ever. Expires is time in human readable form, while ages are in seconds. Hard to debug to say the least.
* _Cache-control_ is used, along with _Age_. Extension _channel-maxage_ communicates the TTL for _this_ object to varnish. When Varnish receives a request, the age of the object is compared to the channel-maxage, and this determines wether a cached copy is returned, of a new one is fetched. 
Extension max-age is used to set a reasonable default for browsers (Varnish does not use this) to facilitate debugging. 
* _Cache-control groups_ are added for all necessary keywords for invalidating the cache for a multitude of scenarios, see example. 

### Example

The app _foo_ generates complete web pages, meant for the end user browser. The data comes from severals systems. One is the data backend, connected to the CMS for the relevant publication. One other is for ad information and a third for static menu and footer data. These are HTTP requests done in the backend when serving up the page. All these responses have cache-control groups on them, relevant for the app serving them. These are then aggregated up the chain and gets added to the final responseto varnish. Varnish removes them on the way out to the browser, replacing them with "must-revalidate" so the browser always asks Varnish for a fresh copy. But these groups are stored with the object in Varnish and can be used to invalidate the object, on demand. Allow me to illustrate:

{% highlight bash %}
{% endhighlight %}

We see the channel-maxage for this object is set to 24 hours, and that is how long it will live in the cache if no purging occurs before that. 

Here we see the groups for the article data, containing the groups for the publication, the app, the article id and referenced article ids. These will be purged automatically if a journalist edits the article. If we, for some reason want to purge every article, section and front page for that publication, we purge "group=/pub78" and we're done. Or we purge individual articles, which of course is the common case. 

As this applies to all apps, we could just as easily purge all objects using ad data, or menudata. Or in fact almost everything in our caches in on go. Remember: with great power comes great responsibility. 

Here's the VCL code to allow PURGE requests to softban(LINK) objects from the cache. 

{% highlight c %}
sub vcl_recv {
  if (req.request == "PURGE") {
    if (!client.ip ~ purge) {
      error 405 "Not allowed.";
    }
    softban("obj.http.Cache-Control ~ group=" + {"""} + req.url + {"""});
    error 200 "Purged.";
  }
}

{% endhighlight %}

References:

* [http://tools.ietf.org/html/rfc7234](http://tools.ietf.org/html/rfc7234)
* [http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01](http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01)
* [http://www.varnish-cache.org/](http://www.varnish-cache.org/)


