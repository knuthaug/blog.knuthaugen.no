---
layout: post
title: "It's Time to Speculate"
published: true
date: 2024-12-21
tags: []
---

After my colleague Ingvild made me aware of the [Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) I have been quite obsessed with learning more about it, testing it out and see how it feels to use in actual code. The ability to specify rules about how and when to prefetch or even prerender future navigations on a website or in an app is just so powerful. But as always, with [great power comes great responsibility](https://en.wikipedia.org/wiki/With_great_power_comes_great_responsibility). 

<h3><a name="rules">Speculation Rules API</a></h3>

The API is a successor to `rel=prefetch` which is widely available in browsers, but even more a replacement for the chrome-only `rel="prerender"`. The ability to specify rules and conditions for when and how content should be fetched or rendered make it much more usable and powerful, without having to _speculate_ on how you want to use it in your app. 

The API is at the core a set of rules either specified inline in `<script type="speculationrules">` element or in a external file. Bits where introduced as early as Chrome 109 but more usable support was made available in Chrome and Edge 121 (`where rules` for instance). And the support is very much experimental still with no support at all in Safari and Firefox, while Opera has support from 107. But lack of support only means a regular loading experience, so the downside to starting to use it are few. 

The rules can be either `list` rules which is simple list of urls to prerender/prefetch, or `document` rules with more sophisticated conditions (`where` clauses) matching on urls, selectors in the document and more. 

<h3><a name="waste">Waste not Want not</a></h3>

It's easy to get carried away by the sheer possibilities of the API but some bounds on your speculative ventures is advised. `prefetch` urls makes the browser fetch the document body of the page(s) and store them in an in-memory cache _for the document the user is on_. And all prefetches are discarded when navigating away. So all `prefetches` represent a possible waste of resources. But `prefetches` are still much cheaper than `prerenders`. 

Matching `prerender` rules instructs the browser to download the body of the document, all required sub-resources and render the document in invisible tab stored in the same in-memory cache. [Many browser APIs](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API#platform_features_deferred_or_restricted_during_prerender) are delayed when pre-rendering and will not be activated until the page also is activated (see events section below) and stuff like e.g. tracking and metrics should probably not be done at all before activation. Luckily there are events allowing you hook into the speculative load. 

The resource consumption of a prerender is comparable to rendering a document in a iframe, except that if your rules match a lot of documents, _a lot_ of speculation will occur. So everything about the speculation rules spends resources, but prefetches much less than pre-renders. 

Be vary of your users and what kind of browsers and hardware they are on, as always.

<h3><a name="events">Events</a></h3>

<h3><a name="implementation">Implementation Details</a></h3>

To get some numbers to compare, I implemented [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals) on this blog before beginning to speculate about what to preload. Since this blog is statically generated and there is only small amounts of javascript, it's pretty fast from the get-go. Values for largest contentful paint and first contentful paint are normally between 200 and 400 ms and time to first byte is > 50ms. These are low numbers, so I also implemented a test site with some blocking javascript in the pages to simulate a beast of a page with 1500-2000 ms loading/rendering time. These are not uncommon values for framework-heavy sites with a lot of client-side rendering or lots of API calls in the page. I mean, everything below 2.5s is considered good in web vitals speak. I think that number is way too high, but that is a story for another day. 

The speculation rules I implemented for this site is as of now like this:

```html
  <script type="speculationrules">
        {
      "prerender": [{
        "where": {
             "href_matches": "/*/2024/*"
        },
        "eagerness": "moderate"
      }],
      "prefetch": [{
        "where": {
             "href_matches": "/*"
        },
        "eagerness": "moderate"
      }]
    }
  </script>
```

This ruleset will prerender everything matching `2024` in the url (articles written this year) and prefetch everything. Prerendering takes precedence and stuff that is prerendered is not prefetched. One important detail is that a setting of `eagerness: moderate` will only prerender after hovering on the link for more than 200ms, which is slightly conservative and shouldn't prerender too much content that isn't used. Also, page loads on my blog are light, so not a lot of bandwidth is wasted. 

The eagerness settings are as follows

- `immediate`
This is used to speculate as soon as possible, that is, as soon as the speculation rules are observed.
- `eager` This currently behaves identically to the immediate setting, but in future, we are looking to place this somewhere between immediate and moderate.
- `moderate` This performs speculations if you hover over a link for 200 milliseconds (or on the pointerdown event if that is sooner, and on mobile where there is no hover event).
- `conservative` This speculates on pointer or touch down.

`immediate` is the default for `list` rules so if you're not setting a custom value, you'll fairly aggressive rules. `conservative` is the default for `document` rules. 

Alongside this I enabled view transitions for all navigations between pages as well, making the prerendered/prefetched pages smoothly blend into the next. The transition time is kept pretty short to not waste the time I have just saved by prerendering the page. 

This snippet enables view transitions for cross-page navigations. 

```css
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation-duration: var(--mode-animation-duration-hide);
  animation-timing-function: ease-in-out;
}

::view-transition-new(root) {
  animation-duration: var(--mode-animation-duration-show);
  animation-timing-function: ease-in-out;
}
```

And adjusting the animation duration allows for shorter duration for navigation transitions than for the <a href="/web/2024/12/14/bringing-a-little-darkness-into-the-world.html" class="no-prerender">earlier mentioned</a> dark mode transition. 


<h3><a name="debug">Debugging Speculation Rules</a></h3>



Barry Pollard has written a fantastic [blog post](https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules) on the chrome dev blog on debugging speculation rules. Read that for the full lowdown. 