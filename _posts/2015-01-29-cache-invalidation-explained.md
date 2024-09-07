---
layout: post
title: "Cache invalidation: explained"
published: true
tags: [caching, varnish, headers, http]
---

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">"There are two hard things in computer science: cache invalidation, naming things, and off-by-one errors"</p>

After seeing a talk on JavaZone 2014 which touched on cache handling in a very unfulfilling way, I thought I'd take a stab at one of these supposedly hard problems. And no, it will not be off-by-one errors.

There are many ways to do cache invalidation, and I am going to be talking about how we do it at Amedia, one of Norways largest online media houses. We use [Varnish](http://www.varnish-cache.org/) [[3]](#3) for all our caching needs and the implementation is kind of tightly coupled to that. But the _principles_ should be useful across other technologies. The central point is providing enough information in your cache objects, to be able to flush what you need, when you need it.

### Setup

The server setup which acts as a background for all this, is a fairly complex one. Amedia runs the digital parts of 79 (give or take) small and large newspapers in Norway. This means 151 app servers (excluding the CMS servers, which are 246 instances alone) of which 39 are running Varnish instances with differing configurations. These are physical or virtual machines running multiple apps, spread across 10 different environments and 3 data centers. This system has roughly 6.5M page views daily (in prod) and the sustained throughput of the front varnishes during the day is about 45 Mbps of traffic (each) and combined bandwith usage is around 800Mb/s in the daytime.

Every piece of data, except app <-> database communication, runs over HTTP and through Varnish caches. There is caching in every step of the architecture and it follows that we need to finely tune the cache times, the cache headers and the tools to invalidate on a coarse or fine grained level.

Also, the main use of cache invalidation is journalist writing and updating articles (and other content created by internal users in a similar way) and we, devopsers and developers flushing cache more or less manually by deploying apps, fixing bugs and generally sorting through all the weirdness we can experience in our stack.

### Cache headers in general

[RFC 7234](http://tools.ietf.org/html/rfc7234) [[1]](#1) (the revised HTTP/1.1 spec, cache portion) mentions the normal cache headers, which can be useful to know about, even though all of them are not part of the cache invalidation scheme I will be discussing.

- _Age_ is often set by a cache to describe how old an object is. Apps can also set it, if needed.
- _Expires_ sets a human readable timestamp that specifies at which time in the future (hopefully) this object is to be considered no longer fresh and fetched again. In practise it is not needed in our setup as _Age_ together with _max-age_ and _channel-maxage_ specifies what we need.
- _Max-age_ is how long, in seconds, should this object be cached by a browser/end user.
- _Channel-maxage_ is how long should a cache caches this object, in seconds (not in the RFC).
- _Cache-Control_ is the collecting header where you can specify multiple caching values in one header, and groups as we shall see.

See RFC 7234 for the whole truth on these headers. When one app uses several other apps under the hood, the lowest channel-maxage and max-age header from all the backends is used for the response. So a compound response is never older than the youngest "member" object.

### Extensions to cache-channel

A [draft by Mark Nottingham](http://tools.ietf.org/html/rfc7234) [[2]](#2) back in 2007 introduced the concept of _Cache channels_ which are specified as an extension to the cache-channel header (See RFC 7234). Extensions are a part of the HTTP/1.1 spec (revised) and nothing new, but the channel, channel-maxage and group extensions were introduced in this draft but seem to have been shelved after that. I can't find a mention in any RFC after this. But Varnish can implement this easily through VCL and this is what we do. And it is very useful for cache invalidation.

### Varnish Concepts

Some key varnish concepts you should be familiar with:

- _Purge_: A purge removed an object (and its variants) from object memory immediately.
- _Ban_: A ban will add the object to a list and that list will filter objects in the cache. On the ban list means not served, and thus fetched again from the backend. The ban list is also used by the ban lurker process walking the object space and evicting objects.
- _Softban_: A soft ban will ban the object but put in a state of _grace_. This means it will only be evicted if it can be fetched again. If not, the old one will be served.
- _Grace mode_: Enables grace time for objects softbanned. Grace time is of course configurable.
- _Saint mode_: This mode lets you configure Varnish to not ask a backend for an object for a period of time, in case of errors or other unwanted replies. If all backends fails and saint kicks in, the existing object will be served according to grace config.

### Headers

Under this regime HTTP headers becomes all important and not something you just throw around for good measure. They make or break the performance of the whole stack, and need to be kept a watchful eye on. The first thing to be checked when a new app approaches production, is that the cache headers make sense and follow protocol.

### Implementation

We have enforced very strict rules in all our apps regarding cache headers and run them through filtering or a library removing headers we do not want. This is important! Rogue expires headers can wreak havoc on a caching solution such as this. The short version is this:

- We do not use _expires_. Ever. Expires is time in human readable form, while ages are in seconds. The combination can be hard to debug to say the least.
- _Cache-control_ is used, exclusively. _Channel-maxage_ communicates the TTL for _this_ object to varnish. When Varnish receives a request, the age of the object is compared to the channel-maxage, and this determines wether a cached copy is returned, of a new one is fetched.
  Max-age is used to set a reasonable default for browsers (Varnish does not use this) to facilitate debugging.
- _Cache-control groups_ are added for all necessary keywords for invalidating the cache for a multitude of scenarios, see example below.

Varnish does not out of the box use channel-maxage so this is our implementation in VCL. If channel-maxage is specified, that overrides age/expires that may or may not be present in the object.

```c

# handle channel-maxage in cache-channels, override ttl

sub vcl_fetch {
if (beresp.http.cache-control ~ "channel-maxage=[0-9]") {

      set beresp.http.x-channel-maxage = regsub(beresp.http.cache-control,
      ".*channel-maxage=([0-9]+).*", "\1");

      set beresp.ttl = std.duration(beresp.http.x-channel-maxage + "s", 3666s);

      # subtract age if it exists
      set req.http.x-beresp.ttl = beresp.ttl;
      set beresp.ttl = beresp.ttl - std.duration(beresp.http.age + "s" , 0s);

      # debug
      std.log("CC:beresp.ttl before: " + req.http.x-beresp.ttl +
      " beresp.http.age: " + beresp.http.age + " beresp.ttl after: " + beresp.ttl);
      std.log("CC:channel-maxage found in " + beresp.http.cache-control +
      ", duration: " + std.duration(beresp.http.x-channel-maxage + "s", 3666s) +
      "Age: " + beresp.http.age + ", beresp.ttl: " + beresp.ttl );

    }

}

```

{: class="full-bleed"}

### Example

The app _pollux_ generates complete web pages meant for the end user browser. The data comes from severals systems. One is the data backend, connected to the CMS for the relevant publication. One other is for ad information and a third is a component app, producing parts of the page (served through ESI) again calling other systems further down. These are HTTP requests done in the backend when serving up the page. All these responses have cache-control groups on them, relevant for the app serving them. These are then aggregated up the chain and gets added to the final response to Varnish. Varnish removes them on the way out to the browser, replacing them with "must-revalidate" so the browser always asks Varnish for a fresh copy. But these groups are stored with the object in Varnish and can be used to invalidate the object, on demand if the object should need to be before it expires. Allow me to illustrate:

```bash

HTTP/1.1 200 OK
Date: Sun, 05 Oct 2014 16:18:54 GMT
Cache-Control: must-revalidate, channel-maxage=216, group="/pub41",
group="/relax-isdans", group="/ece_frontpage", group="/sec71",
group="/dashboard", group="/sec25292", group="/art7620213",
group="/art7619956", group="/art7620986", group="/art7498595",
group="/art7620735", group="/art7619069", group="/art7619936",
group="/art7620157", group="/art7619542", group="/art7618923",
group="/art7617985", group="/art7617623", group="/art7617283",
group="/art7617256", group="/art7617019", group="/art7613958",
group="/art7612903", group="/art7615510", group="/art7615883",
group="/art7615813", group="/art5520206", group="/art7622276",
group="/art7622263", group="/art7622226", group="/art7622224",
group="/art7622201", group="/art7622165", group="/art7622067",
group="/art7621945", group="/art7621937", group="/art7621892",
group="/art7621926", group="/art7621706", group="/art7621476",
group="/art7618522", group="/art7621204", group="/art5520202",
group="/art7621332", group="/art7621874", group="/art7620605",
group="/art7619046", group="/art7620962", group="/art7620562",
group="/art7620557", group="/art7620036", group="/art7620014",
group="/art7436640", group="/art7621809", group="/art7619526",
group="/art7622215", group="/art7622347", group="/art7367496",
group="/art7621708", group="/art6456542", group="/art7621547",
group="/art7621542", group="/art7619791", group="/art7617979",
group="/art7621393", group="/art7619986", group="/art7620883",
group="/art7622414", group="/art7621772", group="/art7619994",
group="/art7619234", group="/art5520191", group="/art7617945",
group="/art7618720", group="/art7621635", group="/art7617936",
group="/art7618688", group="/art7620739", group="/art7620879",
group="/art7620237", group="/art7620872"
X-Cache-Status: [ normal ; ]
X-Trace-App: [ pollux ; $host ; Sun, 05 Oct 2014 16:18:54 GMT ] [ acpcomposer ; $host ; Sun, 05 Oct 2014 12:10:14 GMT ] [ acpece4 ; $host ; Sun, 05 Oct 2014 12:10:14 GMT ] [ relax ; $host ; Sun Oct 05 14:10:12 CEST 2014 ]
Surrogate-Control: ESI/1.0
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked

```

{: class="full-bleed"}

We see the channel-maxage for this object is calculated by Varnish to be 216 seconds, and that is how long it will live in the cache if no purging occurs before that. We also include the _must-revalidate_ keyword for responses meant for browsers, so they will ask varnish on each request. Response headers meant for other apps do not include this.

Here we see the _groups_ for the article data, containing the groups for the publication, the app, the article id and referenced article ids. These will ensure that this page is purged automatically if a journalist edits one of these articles. If we, for some reason want to purge every article, section and front page for that publication, we purge "group=/pub41" and we're done. Or we purge individual articles or sections, which of course is the common case, for CMS data.

One thing to be mindful of with this model is that if the _Cache-Control_ header exceeds 2048 chars in length, you will run into all sorts of funky error statuses (like 413) from the (jetty) server apps involved, and possibly Varnish too. These can be confusing and hard to debug. So we have code in place to cut groups from the header, if the header grows too long. Different server stacks can use different, more or less arbitrary limits here.

As this applies to all apps, we could just as easily purge all objects using ad data, or using menu data. Or in fact almost everything in our caches in one go. Remember: with great power comes great responsibility.

Here's the Varnish VCL code to allow PURGE requests to softban[[5]](#5) objects from the cache.

```c

sub vcl_recv {
  if (req.request == "PURGE") {
    if (!client.ip ~ purge) {
      error 405 "Not allowed.";
    }
    softban("obj.http.Cache-Control ~ group=" + {"""} + req.url + {"""});
    error 200 "Purged.";
  }
}

```

{: class="full-bleed"}

The implementation and use of this feature is in essence the varnish-cc daemon doing curl on the varnish servers with the HTTP method set to PURGE with the name of the group we want to purge in the path.

The whole chain from backend system registering that someone is editing an object, to the varnish cache being invalidated look like this:

<img src="/assets/images/arch_exp.001_s.jpg" width="800" height="384" alt="Cache invalidation architecture"/>

The app itself will send a HTTP message to Atomizer [[6]](#6) saying that a certain cache-control group should be invalidated. Atomizer (open sourced by us, under the Apache license) persists this in a MongoDB database. The atom feed that Atomizer produces is a 30 second rolling window of cache invalidation events, which atomizer-cc (a perl script, of all things) reads and sends PURGE requests to varnish instances. One varnish cc for each varnish instance is required in this setup. Varnish CC also holds some state internally to make sure that we don't purge objects that just have been purged, via timestamps but it is quite simple (if you can call anything written in Perl simple, that is).

### Some stats

On a normal day, there are about 1500 journalists writing and updating articles, and classified ads being created feeding this system with cache invalidation requests. Normally during the day we see about 50-150 invalidation requests per minute, with an average around 60 or so.

References:

1. <a name="1"></a>[http://tools.ietf.org/html/rfc7234](http://tools.ietf.org/html/rfc7234)
2. <a name="2"></a>[http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01](http://tools.ietf.org/html/draft-nottingham-http-cache-channels-01)
3. <a name="3"></a>[http://www.varnish-cache.org/](http://www.varnish-cache.org/)
4. <a name="4"></a>[http://www.smashingmagazine.com/2014/04/23/cache-invalidation-strategies-with-varnish-cache/](http://www.smashingmagazine.com/2014/04/23/cache-invalidation-strategies-with-varnish-cache/)
5. <a name="5"></a>[https://www.varnish-cache.org/docs/3.0/tutorial/purging.html](https://www.varnish-cache.org/docs/3.0/tutorial/purging.html)
6. <a name="6"></a>[https://github.com/amedia/atomizer](https://github.com/amedia/atomizer)

```

```
