---
layout: post
title: "The Clash of the Classnames"
published: true
tags: [Typescript,Custom elements,Web components,HTML,Web]
---

{% include JB/setup %}

I recently came across a very sneaky bug in one of our projects using custom web components at work and I thought I'd document it for future google searches. The structure of the code is this: We have a shared base class called `ReactiveElement` which is, as the name implies, a class handling reacting to property and attribute changes, via several different callbacks abstracting some of the functionality of custom web components. The project in questions has a lot of components extending this class, specifying which properties and attributes it wants to have callbacks fired for. This is the very core of several projects and it works well.

We also have a class called `VirtualList` that does caching, scrolling and handling large lists of items with some optimizations. We both use this VirtualList stand-alone and we have some specific list classes extending `VirtualList`.

And update in the `ReactiveElement` class broke this but only in a very specific way and only for certain use cases, namely the components extending `VirtualList`. And the update was in `ReactiveElements` method `static get observedAttributes()` which the browser calls on a class when it is registered as a custom element via the `customeElementRegistry.define()` method, to avoid it running twice for the same class, due to some server rendering functionality. But I digress.

Time for some code:

````javascript

class VirtualListElement extends ReactiveElement {
  static get observedAttributes() {
    return {
      ...super.reactiveAttributes,
      listItems,
    }
  }
  ...
}

class SpecificListElement extends VirtualListElement {
    static get observedAttributes() {
    return {
      ...super.reactiveAttributes,
      shared,
    }
  }
}

```

Expected behaviour is that the class SpecificListElement should have both the property `shared`and `listItems` from `VirtualListElement` when it's created. But it only ends up with the property `listItems`. What gives?

Turns out the fix in `ReactiveElement` `static get observedAttributes()` now includes this code

```javascript

static get observedAttributes() {
    if (this._observedAttributes === undefined) {
    ...
    }
}

```

which means that if the method has been called once for a class and its _static_ `this._observedAttributes` has been set, it won't be set again. Remember this is a static method and `this` in this context is the class itself, not an instance. This fact, combined with that `VirtualListElement` was both used standalone _and_ as superclass, creates trouble. Deep in the `VirtualList` code, was this code:

```javascript

customElementRegistry.define('virtual-list', VirtualListElement);

```

So when that code was run first, the `VirtualListElement` `static get observedAttributes()` is called first, that class gets its attributes set first. When `SpecificListElement` comes along, the browser will call its observedAttributes method (in reality on the super class `ReactiveElement`), but as the `_observedAttributes_` property doesn't exists on the class itself, it will look up the inheritance chain, find it on  `VirtualListElement` and then stop. The properties specified in `SpecificListElement` will be ignored.

The fix is quite simple. Instead of

```javascript

customElementRegistry.define('virtual-list', VirtualListElement);

```

We do

```javascript

customElementRegistry.define('virtual-list', class extends VirtualListElement {});

```

to register the element with a anonymous class expression instead of a named class. You can also create any other named class extending the class used both as stand-alone element and superclass if you wish. A simple fix for a very confusing bug.
````
