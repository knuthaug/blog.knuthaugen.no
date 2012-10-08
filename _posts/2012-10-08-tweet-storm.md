---
layout: post
title: "The Tweet Storm"
published: true
tags: [Context, Agile]
---
{% include JB/setup %}

A while back I experienced the full force of Twitter, in a nutshell. I am not a very active twitter user, but I follow som celebrity developers and once in a while I throw out a tweet in reply to one. This normally just leads to (at best) a few tweets back and forth and nothing more. But not this time. I responded to a discussion between [Ted Neward](https://twitter.com/tedneward/) and [Scott Hanselman](https://twitter.com/shanselman) , both with a sizable number of followers. They were talking about some presentation from Microsoft on best practises. I spoke my mind on it:

<p style="width: 75%; margin-left: auto; margin-right: auto;font-size: 150%; font-weight: normal; font-family: times, 'times new roman', serif; font-style: italic; line-height: 130%;">«There are no best practices, there are only practices and their suitability depends on the context.»</p>
 
This lead to a retweet from first Ted Neward and then Scott Hanselman. And then things really took off. In the next 24 hours I got something like 50-60 retweets, just from being retweeted by some celebrities. Granted it's not _that_ many, but so much more than I have ever gotten before. That's simply how Twitter work. Funny thing is that only one (1) spoke out in disagreement of the statement. 

### Context is King
The statement in itself is a post modern stance on applying practises in software development. Some, but not that many, argue that some practises are good regardless of the context you are applying them in. I disagree. In the past I have felt this too, but every single time someone or something has some time later disproved that, and I now try to thing about the context before doing anything regarding process or practises. Universal truths are few and far between, especially in software development.

For instance, I have been, and still am, when the context fits, a strong proponent of some practises:

* Writing tests first, and writing tests in general.
* Don't copy and paste code and keep duplication low.
* Monitoring code quality (test coverage, coupling, cyclomatic complexity etc.)

<p></p>
I have then seen talks from e.g. [Dan North](https://twitter.com/tastapod) about the work at [DRW](http://drw.com) and [Fred George](https://twitter.com/fgeorge52) about the work at [Forward](http://forwardtechnology.co.uk/videos/3244732). For instance at Forward they have a micro service architecture, where a larger system is built of tens or hundreds of really small services or apps. Really, really small. So what happens to your feelings towards unit testing when the entire app is maybe 100-200 lines of code? And the maintainability of the code? Is it more efficient to replace (write a new one) that change it, if the change is more than a small fix? This is actually what they do at Forward: write little to no tests and replace apps rather than change them (for bigger values of "change"). Continuous integration? Don't need it. Refactoring? Nope. Sprints? Nix. User stories? Nope. Developers and Customers talking to each other making the decisions. This is the single responsibility principle applied to the application level, not the class or module level.

Dan North has talked about how his attitude towards classic agile methods when he started at DRW. He has collected some new patterns (of effective software delivery, as he calls them) of how experienced programmers can deliver software much faster than the so-called "hyper productive teams" that Scrum is peddling. And this is done by breaking the rules of classic agile and using other practices instead. is reasoning is that class agile presupposes a lot of things, and when those things aren't true, neither is the practise that it mandates. And so other practises emerge. Like using TDD as an exploration tool, starting with a `private void testBlah()` and just exploring the code with no intent of keeping the test. But _if_ you decide to keep the test, clean it up, change the name and commit it. Likewise with a class. Just start with a class, mess around with it and later on decide if you want to keep it or not. Defer the commitment to the code and write tests for it later, and make it all TDD-shaped and nice. But not before you know you are going to keep it.

These are really interesting thoughts and shows that some practises, that seem very sane in some (or perhaps most) contexts, will disappear completely in another. And both DRW and Forward are hugely successful at what they do, too. Kent Beck has been touching on this in his talks on [The Effects of Acceleration](http://video.javazone.no/talk/28803277) where he talks about the effects of faster delivery has on your practices. Well worth checking out.

References:

* [Dan North on Patterns of Effective Delivery](https://vimeo.com/43659070) and [another incarnation of the same talk](https://vimeo.com/24681032)
* [Fred George on Programmer Anarchy](http://forwardtechnology.co.uk/videos/32447325)


