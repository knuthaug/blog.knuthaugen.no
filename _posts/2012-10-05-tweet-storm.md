---
layout: post
title: "The Tweet Storm"
published: true
tags: [Context, Agile]
---
{% include JB/setup %}

A while back I experienced the full force of Twitter, in a nutshell. I am not a very active twitter user, but I follow som celebrity developers and once in a while I throw out a tweet in reply to one. This normally just leads to (at best) a few tweets back and forth and nothing more. But not this time. I responded to a discussion between Ted Neward TK and Scott Hanselman TK, both with a sizable number of followers. They were talking about some presentation from Microsoft on best practises. I spoke my mind on it:

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">«There are no best practices, there are only practices and their suitability depends on the context.»</p>
 
This lead to a retweet from first Ted Neward and then Scott Hanselman. And then things really took off. In the next 24 hours I got something like 50-60 retweets, just from being retweeted by some celebrities. Granted it's not _that_ many, but so much more than I have ever gotten before. That's simply how Twitter work. Funny thing is that only one (1) spoke out in disagreement of the statement. 

### Context is King
The statement in itself is a post modern stance on applying practises in software development. Some, but not that many, argue that some practises are good regardless of the context you are applying them in. I disagree. In the past I have felt this too, but every single time someone or something has some time later disproved that, and I now try to thing about the context before doing anything regarding process or practises. Universal truths are few and fa between, especially in software development.

For instance, I have been, and still am, when the context fits, a strong proponent of some practises:

* Writing tests first, and writing tests in general.
* Don't copy and paste code and keep duplication low.
* Monitoring code quality (test coverage, coupling, cyclomatic complexity etc.)

<p></p>
I have then seen talks from e.g. Dan North TK about the work at DRW TK and Fred George TK about the work at Forward TK. For instance at Forward they use a micro service architecture, where a larger system is built of tens or hundreds of really small services or apps. Really, really small. So what happens to your feelings towards unit testing when the entire app is maybe 100-200 lines of code? And the maintainability of the code? Is it more efficient to replace (write a new one) that change it, if the change is more than a small fix? This is actually what they do at Forward: write little to no tests and replace apps rather than change them (for bigger values of "change"). 

Dan North has talked about how his attitude towards classic agile methods when he started at DRW. Copy/paste was an accepted method of starting a new module/class/app when you didn't know how big it was going to grow and how fast (which is often the case). But when the duplication and copy/paste got past a certain level, or the app seemed like it was going to grow and need to be maintained, it was cleaned up. But not before. And if the app is so small that it can be replaced in a day or so, why worry about clean code and duplication. Just write a new one. And there is a limit to how much mess you can create in 150 lines of code. And deploying it is super fast.

These are really interesting thoughts and shows that some practises, that seem very sane in some (or perhaps most) contexts, will disappear completely in another. And both DRW and Forward are hugely successful at what they do, too.

References:

* TK (Dan North on DRW method
* TK Fred George on programmer Anarchy


