---
layout: post
title: "Helpful stack traces? Not so Much"
published: true
tags: [Node.js, JavaScript]
---
{% include JB/setup %}

I am dabbling around with Node.js TK at work these days and we are trying out Jake TK as a build script. Jake itself is not so bad and the syntax is pretty neat, with a very small DSL for writing build scripts in JavaScript. But, countless stories of not-so-helpful stack traces, and downright awfully bad ones, from node.js and node packages is just a quick google search away. And sure enough, I got one that wasn't particulary good. Granted, it can be node.js' fault, Jakes fault or both in companion, but helpful? Nope.

{highlight bash %}

{nikopol: $> jake --trace build-extension
jake aborted.
Error: Process exited with error.
    at fail (/home/knuthaug/nvm/v0.8.2/lib/node_modules/jake/lib/api.js:221:18)
    at utils.mixin.exec (/home/knuthaug/nvm/v0.8.2/lib/node_modules/jake/lib/utils/index.js:64:9)
    at EventEmitter.emit (events.js:91:17)
    at ChildProcess.utils.mixin._run (/home/knuthaug/nvm/v0.8.2/lib/node_modules/jake/lib/utils/index.js:186:20)
    at ChildProcess.EventEmitter.emit (events.js:91:17)
    at Process._handle.onexit (child_process.js:674:10)

{% endhighlight %}

Hookay, something is clearly wrong here but what is it? There's some event emitting going on, and some mixins being visited. And an exec() there too. Well, if we inspect the build script there is exec'ing of some shell commands for catting some files together. And the error is actually a missing directory. No mention of the underlying os error, no mention of the exit status or anything. How is this helpful in finding out what is wrong? It's not.
