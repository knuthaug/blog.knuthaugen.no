---
layout: post
title: All Your Detection Belongs to Modernizr
mt_id: 34
date: 2010-09-22 12:19:00 +02:00
tags: [javascript, css, modernizr]
---

I'll hopefully be doing some HTML5 work soon and I came across the
<a href="http://www.modernizr.com/">Modernizr</a> project, which is very cool for doing feature detection as opposed to browser detection. It does all the heavy (well, not so heavy but tedious) lifting when it comes to detecting if the browser visiting your site supports all the fancy schmancy new features from HTML5 and CSS3. Like websockets, CSS 2D and 3D transforms, web workers, canvas, offline storage, browser databases, video and audio elements and much more awesomeness. Check the link for the complete list. And it's really easy to use too. The nice thing about it is that it does not accomplish this through browser detection, which is very unreliable, but rather through checking for the feature directly by trying to call API functions or creating stuff.

<h3>Let's detect!</h3>

Load it like this:

```html
<script src="modernizr-1.5.min.js" type="text/javascript" charset="utf-8"
```
{: class="full-bleed"}

and the next time you need to know it some feature is
supported, check the automagically created Modernizr object and see if that
property is true or false:

```javascript
if (Modernizr.canvas) { var c =
document.createElement('canvas'); }
```
{: class="full-bleed"}

As a nice bonus it assigns css classes
to the <code>html</code> element so you can do different styling based on
whether a feature is available or not.

```css
/* In your CSS: */
.no-audio
#audio {
    display: none; /* Don't show Audio options */
}
.audio #audio button {
  /* Style the Play and Pause buttons nicely */
  }

```
{: class="full-bleed"}
