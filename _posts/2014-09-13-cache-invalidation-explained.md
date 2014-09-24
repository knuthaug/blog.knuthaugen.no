---
layout: post
title: "Cache invalidation: explained"
published: true
tags: [cache varnish amedia headers HTTP]
---
{% include JB/setup %}

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">"There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors"</p>

After seeing a talk on JavaZone 2014 which touched on cache handling in a very unfulfilling way, I thought I'd take a stab at one of these supposedly hard problems. And no, it will not be off-by-one errors. 

There are many ways to do cache invalidation, and I am going to be talking about how we do it at Amedia, one of Norways largest online media houses. We use [Varnish](http://www.varnish-cache.org/)[3] for all our caching needs and the implementation is kind of tightly coupled to that. But the _principles_ should be useful across other technologies. The central point is providing enough information in your cache objects, to be able to flush what you need when you need it.

## Setup

The server setup which acts as a background for all this, is a fairly complex one. Amedia runs the digital parts of 79 small and large newspapers in Norway. This means 151 app servers (excluding the CMS servers, which are 246 instances alone) of which 39 are running Varnish instances with differing configurations. Note these are physical or virtual machines running multiple apps, spread across 10 different environments and 3 data centers. This system has roughly 6.5M page views daily and the sustained throughput of the front varnishes during the day is about 45 Mbps of traffic (each) and combined bandwith usage is around 800Mb/s in the daytime.. 

Every piece of data, except app <-> database communication, runs over HTTP and through the Varnish caches. There is caching in every step of the architecture and in the wake of that follows the need to finely tune the cache times, the cache headers and the tools to invalidate on a course or fine grained level. 

## Cache headers

[RFC 7234](http://tools.ietf.org/html/rfc7234)[2] (the revised HTTP/1.1 spec, cache portion) mentions the normal cache headers, which can be useful to know about, even though all of them are not part of the cache invalidation scheme I will be discussing. 

* _Age_ is often set by a cache to describe how old an object is. Apps can also set it, if needed.
* _Expires_ sets a human readable timestamp that specifies at which time in the future (hopefully) this object is to be considered no longer fresh and fetched again. In practise it is not needed in our setup as _Age_ together with _max-age_ and _channel-maxage_ specifies what we need. 
* _Max-age_ is how long, in seconds, should this object be cached by a browser/end user.
* _Channel-maxage_ is how long should a cache cache this object, in seconds. 
* _Cache-Channel_ is the collecting header where you can specify multiple caching values in one header. 

See RFC 7234 for the whole truth. When one app uses several other apps under the hood, the lowest channel-maxage and max-age header from all the backends is used for the response. So a compound response is never older than the youngest "member" object. Likewise, the age header of the oldest object is used as the age header for a compound response. 

An example:

{% highlight bash %}


{% endhighlight %}

## Extensions to cache-channel

A [draft by Mark Nottingham](http://tools.ietf.org/html/rfc7234)[1] back in 2007 introduced the concept of _Cache channels_ which are specified as an extension to the cache-channel header (See RFC 7234). Extensions are a part of the HTTP/1.1 spec (revised) and nothing new, but the channel and group extensions were introduced in this draft but seem to have been shelved after that. I can't find a mention in any RFC after this. But Varnish can implement this easily through VCL and this is what we do. And it is very useful for cache invalidation. 

## Varnish Concepts

Some key varnish concepts you should be familiar with: 

* _Purge_: A purge removed an object (and its variants) from object memory immediately.
* _Ban_: A ban will add the object to a list and that list will filter objects in the cache. On the ban list means not served, and thus fetched again from the backend. The ban list is also used by the ban lurker process walking the object space and evicting objects.
* _Softban_: A soft ban will ban the object but put in a state of _grace_. This means it will only be evicted if it can be fetched again. If not, the old one will be served. 
* _Grace mode_: Enables grace time for objects softbanned. Grace time is of course configurable.
* _Saint mode_: This mode lets you configure varnish to not ask a backend for an object for a period of time, in case of errors or other unwanted replies. If all backends fails and saint kicks in, the existing object will be served according to grace config. 

## Headers

## Implementation

We have enforced very strict rules in all our apps regarding cache headers and run them through filtering removing headers we do not want. This is important! Rogue expires headers can wreak havoc on a caching solution such as this. The short version is this:

* We do not use _expires_. Ever. Expires is time in human readable form, while ages are in seconds. The combination can be hard to debug to say the least.
* _Cache-control_ is used, along with _Age_. Extension _channel-maxage_ communicates the TTL for _this_ object to varnish. When Varnish receives a request, the age of the object is compared to the channel-maxage, and this determines wether a cached copy is returned, of a new one is fetched. 
Max-age is used to set a reasonable default for browsers (Varnish does not use this) to facilitate debugging. 
* _Cache-control groups_ are added for all necessary keywords for invalidating the cache for a multitude of scenarios, see example. 

### Example

The app _foo_ generates complete web pages, meant for the end user browser. The data comes from severals systems. One is the data backend, connected to the CMS for the relevant publication. One other is for ad information and a third for static menu and footer data, a fourth is the template app stitching all this together. These are HTTP requests done in the backend when serving up the page. All these responses have cache-control groups on them, relevant for the app serving them. These are then aggregated up the chain and gets added to the final response to varnish. Varnish removes them on the way out to the browser, replacing them with "must-revalidate" so the browser always asks Varnish for a fresh copy. But these groups are stored with the object in Varnish and can be used to invalidate the object, on demand. Allow me to illustrate:

{% highlight bash %}
{% endhighlight %}

We see the channel-maxage for this object is set to 24 hours, and that is how long it will live in the cache if no purging occurs before that. 

Here we see the _groups_ for the article data, containing the groups for the publication, the app, the article id and referenced article ids. These will be purged automatically if a journalist edits the article. If we, for some reason want to purge every article, section and front page for that publication, we purge "group=/pub78" and we're done. Or we purge individual articles or sections, which of course is the common case, for CMS data.

One thing to be mindful of with this model is that if the _Cache-Control_ exceeds 2048 chars in length, you will run into all sorts of funky error statuses (like 413) from the server apps involved. These can be confusing and hard to debug. So we have code in place to cut groups from the headers, if the header is too long. 

As this applies to all apps, we could just as easily purge all objects using ad data, or using menu data. Or in fact almost everything in our caches in on go. Remember: with great power comes great responsibility. 

Here's the Varnish VCL code to allow PURGE requests to softban(LINK) objects from the cache. 

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

This is in essence the varnish-cc daemon doing curl on the varnish servers with the HTTP method set to PURGE with the url of the group we want to purge in the path. 

Thoe whole chain from backend system registering that someone is editing an object, to the varnish cache being invalidated look like this:

<img src="../../../images/arch_exp.001_s.jpg" width="800" height="384" alt="Cache invalidation architecture"/>

The app itself will send a HTTP message to atomizer saying that a certain cache-control group should be invalidated. Atomizer (open sourced BTW) persists this in a MongoDB database. The atom feed that Atomizer produces is a 30 second rolling window of cache invalidation events, which atomizer-cc (a perl script, of all things) reads and sends PURGE requests to varnish instances. One varnish cc for each varnish instance is required in this setup. Varnish CC also holds some state internally to make sure that we don't purge objects that just have been purged, via timestamps but it is quite simple (if you can call anything written in Perl simple, that is).

References:

* [http://tools.ietf.org/html/rfc7234](http://tools.ietf.org/html/rfc7234)
* [http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01](http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01)
* [http://www.varnish-cache.org/](http://www.varnish-cache.org/)
* [http://www.smashingmagazine.com/2014/04/23/cache-invalidation-strategies-with-varnish-cache/](http://www.smashingmagazine.com/2014/04/23/cache-invalidation-strategies-with-varnish-cache/)

