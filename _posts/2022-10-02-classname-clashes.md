---
layout: post
title: "The Clash of the Classnames"
published: true
tags: [typescript,custom elements,web components,html,web]
---
{% include JB/setup %}

I recently came across a very sneaky bug in one of our projects using custom web components at work and I thought I'd document it for future google searches. The structure of the code is this: We have a shared base class called `ReactiveElement` which is, as the name implies, a class handling reacting to property and attribute changes, via several different callbacks. The project in questions has a lot of components extending this class, specifying which properties and attributes it wants to have callbacks fired for. This is the very core of the project and it works well. 

We also have a class called `VirtualList` that does caching and handling large lists with some optimizations. We both use this VirtualList stand-alone And we have some specific list classes extending ``VirtualList``. 

And update in the `ReactiveElement` class broke this but only in a very specific way and only for certain use cases. And the update was in `ReactiveElements` method `static get observedAttributes()` which the browser calls on a class when it is registered as a custom element via the `customeElementRegistry.define()` method, to avoid it running twice for the same class, due to some server rendering functionality. But I digress. 

Time for some code:

{% highlight javascript %}

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

{% endhighlight %}

Expected behaviour is that the class SpecificListElement should have both the property `shared`and `listItems` from `VirtualListElement` when it's created. But it only ends up with the property `listItens`. What gives?

Turns out the fix in `ReactiveElement` `static get observedAttributes()` now includes this code

{% highlight javascript %}

static get observedAttributes() {
    if (this._observedAttributes === undefined) {
    ...
    }
}

{% endhighlight %}

which means that if the method has been called once for a class and its `this._obersvedAttributes` has been set, it won't be set again. Remember this is a static method and `this` in this context is the class, not an instance. This fact, combined with that `VirtualListElement` was both used standalone _and_ as superclass, creates trouble. Deep in the `VirtualList` code, was this code:

{% highlight javascript %}

customElementRegistry.define('virtual-list', VirtualListElement);

{% endhighlight %}
 to be able to use it as a stand-alone `<virtual-list>` element in addition to extending the class, to make it more usable. 
So when that code was run first, the `VirtualListElement` observedAttributes is called first, that class gets its attributes set first. When `SpecificListElement` comes along, the browser will call its observedAttributes method which will call it on `VirtualListElement` as it is the superclass of it. This has already been called, and the properties specified in `SpecificListElement` will be ignored. 

The fix is quite simple. Instead of 

{% highlight javascript %}

customElementRegistry.define('virtual-list', VirtualListElement);

{% endhighlight %}

We do

{% highlight javascript %}

customElementRegistry.define('virtual-list', class extends VirtualListElement {});

{% endhighlight %}

You can also create any other named class extending `VirtualListElement` if you wish. Simple fix for a very confusing bug. 
