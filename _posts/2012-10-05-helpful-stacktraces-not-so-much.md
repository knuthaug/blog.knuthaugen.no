---
layout: post
title: "Helpful stack traces? Not so Much"
published: false
tags: [Node.js, JavaScript]
---
{% include JB/setup %}

I am dabbling around with Node.js TK at work these days and we are trying out Jake TK as a build script. Jake itself is not so bad and the syntax is pretty neat, with a very small DSL for writing build scripts in JavaScript. But, countless stories of not-so-helpful stack traces, and downright awfully bad ones, from node.js and node packages is just a quick google search away. And sure enough, I got one that was not particulary good. Granted, it can be node.js fault, Jakes fault or both in companion, but helpful? Nope.

<style type="text/css">pre code { font-size: 90% !important; }</style>

{% highlight bash %}

nikopol: $ jake --trace build-extension
jake aborted.
Error: Process exited with error.
    at fail (~/nvm/v0.8.2/lib/node_modules/jake/lib/api.js:221:18)
    at utils.mixin.exec (~/nvm/v0.8.2/lib/node_modules/jake/lib/utils/index.js:64:9)
    at EventEmitter.emit (events.js:91:17)
    at ChildProcess.utils.mixin._run (~/nvm/v0.8.2/lib/node_modules/jake/lib/utils/index.js:186:20)
    at ChildProcess.EventEmitter.emit (events.js:91:17)
    at Process._handle.onexit (child_process.js:674:10)

{% endhighlight %}

Hookay, something is clearly wrong here but what is it? There's some event emitting going on, and some mixins being visited. And an `exec()` there too. Well, if we inspect the build script there is exec'ing of some shell commands for catting some files together. But what is the error being thrown from the shell command? Turns out, the error is actually a missing directory. Jake and Node could really be more helpful by giving some hints of that. No mention of the underlying OS error, no mention of the exit status, nor the command throwing the error (the exec call can take an array of commands to exec) or anything. Score -1 for Node.js and Jake for good error messages. I'll see if I'll try to fork it and submit a patch on the `exec()` method.
