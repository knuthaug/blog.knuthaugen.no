---
layout: post
title: "Container queries: a practical example"
published: true
tags: [web, css, container]
---

I have been planning on writing an article on [container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) for a long time, and here it actually is. And I _was_ originally planning to start with a brief introduction and explain some of the details around support, syntax, caveats and so on, but just as I got around to this, [Josh Comeau](https://www.joshwcomeau.com/css/container-queries-introduction/) wrote a great post on it and as usual he goes into much more detail than I ever could. So if you haven't read it yet, go right ahead. I'll still be here when you return (I hope you return). 

Instead I'll be talking just about the practical use my team at NRK has had for container queries, the problem it solved and how we approached defaults for browsers that lack support for container queries. 

By the way support is _fairly_ good, although not great if you're forced to target older browsers. There is support for the size query since Chrome 106, edge 106, Opera 94,  Safari 16 and Firefox 110. On the mobile browser side we're talking Chrome for Android 130 and Safari 16. As per usual, [caniuse](https://caniuse.com/css-container-queries) has the goods. 

### Example: a video player

I work on the (relatively new) video player for [NRK TV](https://tv.nrk.no/) and the spec for the design for this new player had some spec that called for some interesting CSS if not for container queries. 

The player looks like this in a medium size

insert image
{: class="full-bleed"}

- The margins around the edges, that is between the edge and the controls when visible should change according to size (originally screen size, but we'll get to that in a minute)
- Displacement of the subtitles must change when the size of the player changes

This could of course all be done with media queries but the player is also used in different sizes in different contexts, meaning that we would have to know how big a part of the viewport the player is taking up, which is much harder and not possible in pure CSS (to my knowledge at least)

So container queries comes to the rescue. 

### To name or not to name?

A container (or more specifically a _containment context_) can be either nameless or named with the `container-name` property (or a shorthand for both size and name if you prefer). What should you do?

Well, it depends (of course it depends, it always depends). 

My general rule, based on not so broad experience, but I still think it's valid is to always name the _containers_ and think very carefully about what will happen if I name the container in the `@container` query or not. That is where stuff can break in interesting ways. Consider this code:

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

will apply the extra margin to a h2 if the _nearest_ ancestor which is a container in the DOM, named or unnamed, and it is more than 60rem wide. If you want to adjust for instance multiple article cards according to the container size, and they can be in any number of different containers, use `@container` queries without name, because names would get messy very quickly. But in general I think named containers reads better. And even a named container that isn't directly used in `@container` query doesn't cost you anything more than a few extra characters in the css. And vice versa: if styles should only apply when a specific container changes size, use the name in the query. And when you need to change from using an unnamed container query to a named one, you know all containers have names and can use the name as it is. So make it a good one, eh?

### The Player implementation
