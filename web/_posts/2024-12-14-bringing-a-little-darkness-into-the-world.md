---
layout: post
title: "Bringing a Little Darkness Into the World"
published: true
tags: []
excerpt_separator: <!--more-->
desc: "Let's implement dark mode and view transitions on this blog, and explore css selectors for detecting theme preference from the OS"
---

In the year 2024, very nearly 2025, what use is a website without dark mode? I can't really recall how long it's been since I started using a dark theme in my programming editor of choice. I _think_ it was as early as university, where the painfully bright white look of the Microsoft Visual Basic developer tool made me see the, eh, darkness. It was my first programming language in uni, after a brief stint of actual basic on a Casio calculator during a summer holiday a few years earlier. Ahh, the not so good old days. 

Luckily, I've since moved on to darker pastures.

This post is not really meant to reminisce too much about the old days, but rather about implementing dark mode on this very blog and along the way, some tidbits about [view transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) and the `prefers-color-scheme` ([read more](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)) css feature for bringing the users OS preference, where it's supported, into play. 
<!--more-->

<h3><a name="darkmode">Dark Mode</a></h3>

There are several options available when implementing dark mode. I started out with a light design where most of the colours in use where defined in css custom properties on the `:root` selector for no specific reason other than convenience. So I chose the model of re-defining all variables for a dark mode and tweaking them for looks and then switching with a css class on `<html>`. I moved all variables to the `<html>` selector instead, and they where then re-defined on `html.dark` for dark mode. Variables for paddings, margins and the like, the same for both modes stayed on `:root`. 

```css
:root {
  --page-margin: 24px;
  --border-radius-default: 4px;
  --dropdown-width: 240px;

  --link-transition: all 0.2s ease-in-out;
  --header-transition: all 0.2s ease-in-out;
  --icon-hover-animation: all 0.2s ease-in-out;

  --in-animation-duration: 0.4s;
  --out-animation-duration: 0.2s;
  --body-letter-spacing: 0.02rem;
}

html {
  --primary-color: hsl(213, 62%, 41%);
  --secondary-color: hsl(213, 29%, 51%);
  --background-color: rgb(247, 247, 247);
  --text-color: rgb(68, 68, 68);
 ...
}

html.dark {
  --primary-color: rgb(169, 218, 251);
  --secondary-color: hsl(213, 47%, 63%);
  --background-color: rgb(22, 22, 22);
  --text-color: rgb(199, 199, 199);
  ...
}
```
{: class="full-bleed"}

The default is dark mode, so the page is rendered with `class="dark"` on page load and then the logic for selecting the appropriate mode kicks in in a `DOMContentLoaded` callback. If you have a page that is clients-side rendered you can delay the rendering until the decision on which mode to use is clear, but since this blog is statically rendered, the default needs to be sane and the code to switch modes needs to be loaded early to avoid flickering when the selected theme is applied.

<h3><a name="prefers">Enter prefers-color-scheme</a></h3>

For operating systems supporting it (MacOS and Windows at least) the system setting of preferring a dark theme will make the browsers also return true when using `prefers-color-schema` in a media query in css or using `window.matchMedia("(prefers-color-scheme: dark)")` in javascript. This feature is widely available in browsers since **chrome@76 \| Edge@79 \| Firefox@67 \| Safari@12.1**

So first step is checking if the user has a preference. Since I opted to make the dark mode the default, I'll check for a light mode preference. 

```javascript
   if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      setMode("light");
    } else {
      setMode("dark");
    }
```
{: class="full-bleed"}

`setMode` in this case sets a class on `<html>`, "light" or "dark" accordingly. To support that the user might have a preference on _this_ site that is different than the OS preference, we store it in localStorage too, and read that first. 


```javascript
function darkMode() {
  const mode = localStorage.getItem(modeLocalStorageKey);

  if (mode) {
    setMode(mode);
  } else {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      setMode("light");
    } else {
      setMode("dark");
    }
  }
}
```
{: class="full-bleed"}

The `setMode` function also stores the preference in localStorage so it is remembered for the next page load/visit. 

There is also a possibility of reacting to a change in the OS preference with an event handler, which is nifty feature. This little snippet accomplishes that. Other things to do in this function is to make labels and icons switch according to the current mode so the menu looks nice and is accessible (omitted in the example for brevity).

```javascript
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      setMode(event.matches ? "dark" : "light");
    });
```
{: class="full-bleed"}

<h3><a name="viewtrans">Adding a Transition</a></h3>

The [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) is not yet widely supported (**Chrome@111 \| Edge@111 \| Safari@18 \| Firefox@n/a**) so use only user with fairly recent browser will get the benefit of using them. But as the fallback is just no animations, it degrades fairly well. And it's very little code required to use it for an in-page transition such as this. The API gives us a lot of possibilities of creating smooth transitions between page views or any kind of DOM changes. For an SPA the use case is pretty much given, to mimic a native app when navigating between screens. For in-page transitions, such as this, it will smooth the changing of all colours between light and dark mode. 

Styling and tweaking the animation is done via a css block. 

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 400ms;
  animation-timing-function: ease-in-out;
}
```
{: class="full-bleed"}

`view-transition-old` is a screenshot of the old state, and `view-transition-new` is a live snapshot of the new state. The default animation is for the old snapshot to animate from opacity 1 to 0 and the new animates from opacity 0 to 1, creating a cross-fade. This works well in my case, so I kept it.

The actual transition is triggered in javascript with a fallback if the `startViewTransition` function is unavailable in the browser. `startViewTransition` takes a callback to be called when the transition snapshot is made and which should change the DOM for the new state. 

```javascript
if(something) {
 if (!document.startViewTransition) {
      setMode("light");
    } else {
      document.startViewTransition(() => setMode("light"));
    }
  } else {
    if (!document.startViewTransition) {
      setMode("dark");
    } else {
      document.startViewTransition(() => setMode("dark"));
    }
  }

```
{: class="full-bleed"}

It looks like this

<video class="full-bleed" src="/assets/media/darkness.mov" autoplay loop muted></video>

I'm gonna be exploring the View Transition API more in a future post, with a look at cross-page transitions in combination with the very promising [Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API), so stay tuned. 

<h3><a name="caveat">Pitfalls and parting thoughts</a></h3>

I encountered a couple of snags along the way, that might come in handy for the next one to come along. 

* At first I didn't specify a class on `<html>` as a default. This creates a very unwanted flash on loading, before the class is set. Always specify a default class for the initial colours. 

* I learned the hard way that if you use svgs in an `<img>` element, you will get the default stroke colour on the svg, and it will not (at least not easily) be styled by a colour variable. By using the svgs directly with an `<svg>` tag, they can be styles easily with variables when switching modes. 

Dark mode/light mode can be achieved with little code both in css and javascript and does not need to complicate your webapp or code. Hopefully you found it useful. 