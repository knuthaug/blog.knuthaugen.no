---
layout: post
title: "Tracking Web Vitals on the Cheap"
published: true
tags: []
date: 2025-02-15
---

In my post on the [Speculation Rules API](https://blog.knuthaugen.no/web/2024/12/23/its-time-to-speculate.html) I talked briefly about [Web Vitals](https://web.dev/articles/vitals) and I want to dig deeper into the how and why of Web Vitals and give an example of how you can track them over time for your own site. First, a quick introduction to Web Vitals, for some context. 

<h3><a name="how">Web Vitals 101</a></h3>

The article linked above has _a tonne_ of details on web vitals, how they are implemented and lots of relevant tidbits if you want to go deep. I'll give you the highlights. Web Vitals is an inititive started by Google to easily measure what the Chrome team thinks are the most essential measurements for web performance, and is a continuation of the pagespeed system and tools. Its aim is to simplify the very fundamental question of "why is my site slow for users?". Also, Pagespeed and Lighthouse are _lab_ tools measuring page loading speed in an artificial environment, often on a developer machine with endless bandwidth and abundant ram and cpu power. Google themselves strongly recommend measuring vitals in the wild to get values from your actual users. That is the oly way to find out how it _actually_ performs. 


Web Vitals focuses on three main metrics: 

- **Largest Contentful Paint** (LCP, and it's sibling First Contentful Paint (FCP)) which is measuring _loading performance_. Google recommends you aim for a value below 2.5s.
- **Interaction to Next Paint** (INP) which is measuring _interactivity_, i.e. how long does it take from an interaction to the next paint. The recommendation is a value below 200ms.
- **Cumulative Layout Shift** (CLS) measuring _visual stability_ i.e. janky reflows of layout after first render. This value should be below 0.1

In addition you have **Time to First Byte** (TTFB) which measures exactly what is says on the tin and is also a performance metric. Web Vitals can be tracked anonymously by the Chrome User Experience Report, if you opt in,  and you can use that to get a rough overview of your sites performance in comparison to others. But this data will only cover Chrome users, and not for instance mobile safari users, which is a huge user group here in Norway. To be able to diagnose and fix individual pages that are misbehaving, it's better to instrument and report measurements yourself. So that's what we are going to do. Besides, that's much more fun, to flex those technical muscles a bit. 

The easiest way to see Web Vitals in action is on the Lighthouse tab of the chrome devtools. It now use vitals under the hood but also shows them directly. But the performance tab in chrome devtools is even more detailed and gives you so much more. Microsoft Edge, being a chromium based browser has the same performance tab, while firefox has a good, but slightly different one, and not so focused on web vitals, naturally. Safari's Timeline tab also has some good information, but again is built slightly differently. Pick your poison.

<h3><a name="devtools">The Performance Tab</a></h3>

By opening the Performance tab for a Web.dev blog article, we get the following display:

<img class="full-bleed" loading="lazy" src="/assets/images/performance.webp" alt="performance tab with basic vitals measurements"/>

Note: the field data is only possible because the web.dev blog, which I used for this screenshot, tracks data to Chrome User Experience Report and is not something you will see locally without doing the same. You'll get the local values for your site, though, which can reveal a lot of useful information. You can also run the sampling with either CPU or network (or both) throttling to see the effects for user with older and slower devices. 

By clicking the little "reload" button near the top, you will get this incredibly detailed view of the loading characteristics of your page. 

<img class="full-bleed" loading="lazy" src="/assets/images/performance2.webp" alt="performance tab with all the details"/>

It can show you, well, just about everything about your page load, which elements are causing layout shifts, which assets are taking long to load and where in the process they are loaded, screenshots of the page at different stages of rendering, timings, sizes, which part of the rendering process is spending how much time doing its thing and so much more. It's a real treasure trove of performance information and well worth spending some time on. 

<h3><a name="track">Tracking Manually</a></h3>

But let's track vitals ourselves, to see what our users are getting. The easiest way to track web vitals, is to import the library and add callbacks for the measurements you are interested in, some time after the page loads. The `web-vitals` javascript package ensures that the measurements are performed in the same manner as the beforementioned Google tools.

```typescript
import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
...
 onLCP(({ value}) => {
        ...
    });

 onINP(({ value}) => {
        ...
    });

 onCLS(({ value}) => {
        ...
    });
```
{: class="full-bleed font-highlight"}

The web-vitals package can also include attributions, with lots of details about what might be causing your pages to be slow, and this is very cool. The attribution methods adds some KB to your bundle, but can be very helpful. Enable it by changing the import to use `web-vitals/attribution` like this:

```typescript
- import {onLCP, onINP, onCLS} from 'web-vitals';
+ import {onLCP, onINP, onCLS} from 'web-vitals/attribution';
```
{: class="full-bleed font-highlight"}

The attribution objects carry with them information about such things as which element caused the layout shift for CLS, which element is the largest contentful paint for LCP, how much time is spent waiting, loading resources, rendering LCP element. INP anf FCP also have a loadstate property telling you which state the document was in at the time the thing happened. 

The type for LoadState looks like this:

```typescript
type LoadState =
  | 'loading'
  | 'dom-interactive'
  | 'dom-content-loaded'
  | 'complete';
```
{: class="full-bleed font-highlight"}

And to get the attributions, run

```typescript
 onLCP(({ value, attribution }) => {
        ...
    });
```
{: class="full-bleed font-highlight"}

The attributions object for e.g FCP has the following information:

```json
{
   {
    "timeToFirstByte": 49.600000001490116,
    "firstByteToFCP": 126,
    "loadState": "dom-content-loaded",
    "navigationEntry": {
        "name": "http://localhost:4000/web/2024/12/23/its-time-to-speculate.html",
        "entryType": "navigation",
        "startTime": 0,
        "duration": 271.20000000298023,
        "navigationId": "12660db3-e3bc-4ee6-8f2e-ded0e7d5cfb2",
        "initiatorType": "navigation",
        "deliveryType": "",
        "nextHopProtocol": "http/1.1",
        "renderBlockingStatus": "non-blocking",
        "contentType": "text/html",
        "workerStart": 0,
        "redirectStart": 0,
        "redirectEnd": 0,
        "fetchStart": 5.799999997019768,
        "domainLookupStart": 5.799999997019768,
        "domainLookupEnd": 5.799999997019768,
        "connectStart": 5.799999997019768,
        "secureConnectionStart": 0,
        "connectEnd": 5.799999997019768,
        "requestStart": 15.600000001490116,
        "responseStart": 49.600000001490116,
        "firstInterimResponseStart": 0,
        "finalResponseHeadersStart": 49.600000001490116,
        "responseEnd": 50,
        "transferSize": 41879,
        "encodedBodySize": 41579,
        "decodedBodySize": 41579,
        "responseStatus": 200,
        "serverTiming": [],
        "unloadEventStart": 57.29999999701977,
        "unloadEventEnd": 57.29999999701977,
        "domInteractive": 140.39999999850988,
        "domContentLoadedEventStart": 140.39999999850988,
        "domContentLoadedEventEnd": 141.29999999701977,
        "domComplete": 271.1000000014901,
        "loadEventStart": 271.20000000298023,
        "loadEventEnd": 271.20000000298023,
        "type": "navigate",
        "redirectCount": 0,
        "activationStart": 0,
        "criticalCHRestart": 0,
        "notRestoredReasons": null,
        "systemEntropy": "normal",
        "confidence": {
            "randomizedTriggerRate": 0,
            "value": "high"
        }
    },
    "fcpEntry": {
        "name": "first-contentful-paint",
        "entryType": "paint",
        "startTime": 175.60000000149012,
        "duration": 0,
        "navigationId": "12660db3-e3bc-4ee6-8f2e-ded0e7d5cfb2"
    }
}
```
{: class="full-bleed font-highlight"}
Would you look at all that lovely data!? This tells us that the FCP was caused by a `navigation` (`navigationEntry.type`) 
as opposed to for instance a `reload` type, The paint occured at 175ms (`fcpEntry.startTime`) where time to first byte was 49ms and 
time between first byte and fcp was 126ms. The document was in a `dom-content-loaded` state when the FCP occured. 
 You can also see the when during the load the different events took place (`unload` at 57ms, `domInteractive` at 140ms, 
`domContentLoaded` at 140-141ms, `domComplete` at 271ms and `load` at 271ms). The property `delivertype` can tell you wether it was delivered from `cache` or not (`""`),  `nextHopProtocol` which http version was used, as well as timings for network stack work, 
such as domain lookup, request init, response init and so on. And you can see if there was redirects involved, the time they took and the count. So much to learn here!

By the way, you see the attributions objects for this very page in the console.

The `navigationEntry` property is of type [PerformanceNavigationTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming) while
the `fcpEntry` property is of type [PerformancePaintTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformancePaintTiming)

Everything about the different attribution objects is documented well in the [README for the Web Vitals package](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#metric)

The measurements from web-vitals also include the rating value (good, needs improvement (which Sentry.io translates to "meh")or poor) as a property on the callback argument, if you want to use that.

```javascript
 onLCP(({ value, attribution, rating }) => {
        ...
    });
```
{: class="full-bleed font-highlight"}

For all the details, see [the web-vitals documentation](https://github.com/GoogleChrome/web-vitals).

<h3><a name="tracking">Tracking Vitals Over Time</a></h3>

The extra value of vitals is unlocked when you track them over time, from real users in the wild. This enables you to see the change in measurements when new features are added to your app and even more important see, indirectly, what kind of environment they are in be it slow bandwidth, low-powered devices or other things. There are products out there that incorporate this, for instance [Sentry](https://sentry.io), which we use a work. The Sentry client measures vitals and the dashboard displays and track them over time. But it also costs real money, and for a small operation like my blog and one other site that I run, [Norsk enduro](https://norskenduro.no), that kind of spending is out of the question. So I want to track vitals on the cheap and with a custom implementation. 

 If you roll your own vitals tracking using the performance API, which of course you can, you need to verify this yourself. The web-vitals library is [pretty small](https://bundlephobia.com/package/web-vitals@4.2.4) too, so the penalty for loading it should be small.

Collecting measurements is easy and out of the box/documentation it's only this code:

```javascript
import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
const values = {};
...
  const values = {};
  onLCP(
    ({ value }) => {
      values.lcp = `${Math.round(value)}`;
    }
  );

  onFCP(
    ({ value }) => {
      values.fcp = `${Math.round(value)}`;
    }
  );

  onINP(
    ({ value }) => {
      writeINP(Math.round(value));
    }
  );

  onCLS(
    ({ value }) => {
      values.cls = `${value}`;
    }
  );

  onTTFB(
    ({ value }) => {
      values.ttfb = `${Math.round(value)}`;
    }
  );
```
{: class="full-bleed font-highlight"}

For convenience, I collect all the values, except INP which can come much later when navigation happens, and send the values collected to a endpoint storing them. INP has a separate method for sending. I recently got a virtual linux-server for running my projects, so I added some software to store vitals.

- InfluxDB time series database for storing the measurement values over time. 
- Nginx proxy for SSL termination of both influx GUI and API server.
- Small API endpoint receiving the vitals values and storing to influxDB with a smattering of security-by-obscurity to make just a little bit harder to fill my vitals database with junk, if anyone felt the urge to do so. 

Now, this could be anything capable of storing the values, but I felt InfluxDB was good fit. And also open source. 

<h3><a name="dash">Dashboards and Then Some</a></h3>

Time to analyse those data! So how is my vitals over time? I cobbled together a quick dashboard (InfluxDB built-in dashboard) to try to answer that. The Vitals article linked in the start of this post recommends measuring the 75th percentile segmented for mobile and desktop as a start, as individual values can vary a lot due to differences in user hardware and bandwidth. I used the histogram widget in the InfluxDB dashboard, which gives a nice view of how the values for LCP, FCP and TTF are distributed, and I used a gauge for average CLS values. 

<img class="full-bleed" loading="lazy" src="/assets/images/dash1.webp" width=765 alt="Graph widgets with data on aggregated vitals data"/>

I also made a normal line graph displaying the average values per day (this dashboard view using last 7 days as the time period), to see if there are big differences over time. 

<img class="full-bleed" loading="lazy" src="/assets/images/dash2.webp" width=765 alt="Graph widgets with data on aggregated vitals data"/>

I have been experimenting with gauges for the 75th percentile as well (time period 24h for these and the site is norskenduro.no)

<img class="full-bleed" loading="lazy" src="/assets/images/dash3.webp" width=765 alt ="Graph widgets with data on aggregated vitals data"/>

There all sorts of widgets you could make here, such as values for the different measurements per page/url in order to see which pages are the slowest ones, see outlier values to try and pinpoint if there are common causes, different percentiles to see the distribution etc. The ratings values could also be included in the dashboards. Personally I don't think I need that, as my focus will be to just getting the values down. Whether they are good or very good is secondary to me. I also think the general recommendations are very conservative and we should have higher, ehr, lower, goals than 2.5s for LCP. 

Our users definitely deserves better. 