---
layout: post
title: "Container queries: a practical example"
published: true
tags: [web, css, container]
---

I have been planning on writing an article on [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) for quite some time, and here it actually is. And I _was_ originally planning to start with a brief introduction and explain some of the details around support, syntax, caveats and so on, but just as I got around to this, [Josh Comeau](https://www.joshwcomeau.com/css/container-queries-introduction/) wrote a great post on it and as usual he goes into much more detail than I ever could. So if you haven't read it yet, go right ahead. I'll still be here when you return (I hope you return). 

Instead I'll just be talking about the practical use my team at NRK has had for container queries, the problem it solved and how we approached defaults for older browsers that lack support for container queries. 

By the way support is _fairly_ good, although not great if you're forced to target older browsers. There is support for size queries since Chrome 106, edge 106, Opera 94, Safari 16 and Firefox 110. On the mobile browser side we're talking Chrome for Android 130 and Safari 16. As per usual, [caniuse](https://caniuse.com/css-container-queries) has the goods. 

### Example: a video player

I work on the (relatively new) video player for [NRK TV](https://tv.nrk.no/) and the spec for the design for this new player had some requirements that called for some interesting CSS, was it not for container queries. 

The player looks like this in a medium size (600 - 1024px size):

<img src="/assets/images/player-large.png" class="center full-bleed" alt="Large player with control ui"/>

An this is how it looks in a small (< 600px size, zoomed in)

<img src="/assets/images/player-small.png" class="center full-bleed" alt="Small player with control ui"/>

- The margins around the edges, that is between the edge and the controls when visible should change according to size (originally screen size, but we'll get to that in a minute)
- Displacement of the subtitles must change when the size of the player changes

This could of course all be done with media queries but the player is also used in different sizes in different contexts, meaning that we would have to know how big a part of the viewport the player is taking up, which is much harder and not possible in pure CSS (to my knowledge at least)

So container queries comes to the rescue. 

### To name or not to name?

A container (or more specifically a [_containment context_](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment) (there is more to containers than container queries))  can be either nameless or named with the `container-name` property (or a shorthand for both size and name if you prefer). What should you do?

Well, it depends (of course it depends, it always depends). 

My general rule, based on not so broad an experience, but which I still think is valid, is to always name the _containers_ and think very carefully about what will happen if I use that name of the container in the `@container` query or not. That is where stuff can break in interesting ways. Consider this code:

```css

section {
    container-name: section;

    h2 {
        margin: 6px;
    }
}

@container section (min-width: 60rem) {
    h2 {
        margin: 12px;
    }
}

```
{: class="full-bleed"}

The margin of 12px will only be applied if the `h2` is within the container named `section` and that container is wider than 60rem. 

Whereas this code: 

```css

@container (min-width: 60rem) {
    h2 {
        margin: 12px;
    }
}

```
{: class="full-bleed"}

will apply the extra margin to a h2 if the _nearest_ ancestor which is a container in the DOM, named or unnamed, is more than 60rem wide. If you want to adjust for instance multiple article cards according to the container size, and they can be in any number of different containers, use `@container` queries without name, because names would get messy very quickly. But in general I think named containers reads better. And even a named container that isn't directly used in `@container` query doesn't cost you anything more than a few extra characters in the css. And vice versa: if styles should only apply when a specific container changes size, use the name in the query. And when you need to change from using an unnamed container query to a named one, you know all containers have names and can use the name as it is. So make it a good name, eh?

### The Player implementation

So back to the player!

The implementation is not complicated. First we name the container `player` and set type to`inline-size` which means we can query min-width and max-width but not height. We don't need it in this case. (and yes, for those of you who actually read Josh' post I am using `px` as the value here, while he argues in favour of rems for media and container queries. I'm gonna look into that later)

```css

tv-player {
  container-name: player;
  container-type: inline-size;
}
```
{: class="full-bleed"}

The actual player custom element is our container, since the padding should vary based on that containers size. Container queries looks as follows (some other styles omitted for brevity):

```css

/* medium sized player */
@container player (min-width: 600px) and (max-width: 1024px) {
  tv-player-interaction-buttons div {
    margin: var(--size-m);
  }

  #player-controls {
    margin-left: var(--size-m);
    margin-right: var(--size-m);
    margin-bottom: var(--size-m);
  }

  #streaming-buttons {
    margin-right: var(--size-m);
    margin-top: var(--size-m);
  }
}

/* large player */
@container player (min-width: 1024px) {
  tv-player-interaction-buttons div {
    margin: var(--size-l);
  }

  #player-controls {
    margin-left: var(--size-l);
    margin-right: var(--size-l);
    margin-bottom: var(--size-l);
  }

  #streaming-buttons {
    margin-right: var(--size-l);
    margin-top: var(--size-l);
  }
}

```
{: class="full-bleed"}

So we set medium (by a variable) margins on medium sized players and large margins on large players (above 1024px). But wait a minute! There is now container query for smaller players (less than 600px wide). What gives?

We need to support browsers down to Safari 14 and 15 which lack support for container queries. In this case I opted to set the defaults to the smallest values `(--size-s)` and set this outside any container query. Container queries are ignored completely by browsers without support and Safari users on old versions get the smallest margins also in full screen or big screens. Not ideal, but plenty usable and  it degrades nicely. And the user base on Safari 14 and 15 is rapidly shrinking, so it affects a small amount of users. 

The code for the defaults is simply like this. 

```css

tv-player-interaction-buttons div {
  margin: var(--size-s);
}

#player-controls {
  margin-left: var(--size-s);
  margin-right: var(--size-s);
  margin-bottom: var(--size-s);
}

#streaming-buttons {
  margin-right: var(--size-s);
  margin-top: var(--size-s);
}

```
{: class="full-bleed"}

There are some other tweaks that have been added to the container queries after this, such as font size on the poster image of the program (before the player has started), sizing of the play button on the middle of the player and the amount of space that subtitles should be moved when controls are active. None of these are absolute show stoppers if we needed to do it without queries or only with media queries, but it's easier to fine tune and easier to get _really_ good with container queries. 

<img src="/assets/images/player-poster.png" class="center full-bleed" alt="Small player with poster "/>


So give it a go in your code base, container queries are super nice. 