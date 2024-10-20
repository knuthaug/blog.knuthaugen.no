---
layout: post
title: "How Much is Just Enough?"
published: true
tags: [testing, web]
excerpt_separator: <!--more-->
---

In his great talk at [JavaZone this year](https://2024.javazone.no/program/944da7b7-9c3f-414a-8368-e0d21be9aba3), Christian Johansen gave the following answer to how many tests is enough tests. 

<p class="quote">"How many tests should we have? What tests should we write? What kind of tests should we write? It's impossible to give a quantitative answer to that, but I can answer with a... feeling!<br/><br/>
If you run all your tests and they all pass and go green, we will then automatically deploy to production without a human verifying that it works. <br/><br/>If you're comfortable with that, you have enough tests."</p>
<!--more-->

First things first, the talk is great and you should see it. Now. The rest of the post can wait (in Norwegian though, or possibly auto-translated to you language of choice through your AI service of choice). 

This is extremely well put and hits the nail squarely on the head. I have in the past 7-8 years been trying but also at least sometimes succeeding, to automatically deploy to production whenever all relevant tests pass. I may have been guilty of, along the way of doing this without sufficient test coverage of the important bits, but we all live and learn, don't we? The project I am currently working on, the web and Samsung Smart-tv versions of NRK TV, is doing this and deploying to production many times each day. 

But let's go a little deeper into what Christian is saying. 

### How Many, What and What Kind?

As in the quote, there is no number, percentage or coverage. Test coverage and other related metrics can fool you into believing the number instead of actually knowing that the tests are actually covering the important parts _in the right way_. Test coverage is meaningless without the experience of seeing that tests actually catch the bugs before they go into production. This, in my experience, comes over time, seeing that the tests work by testing what you set out to test, seeing them catch errors in the CD pipeline. Slowly, day by day, you come to trust them more and more until you stop thinking about them, unless they break. 

But should the tests be unit, integration, component, load or end-to-end tests? What percentage should they be? A mix, of course. I reason as follows:

- unit tests covering relevant functions doing important stuff for your application. What is important? That is up to you.
- integration/functional tests covering the relevant bits on how different parts of the system is interacting. Fetching data from an api? The part fetching, and parsing that data is important and should be tested. We have some tests actually making real requests to apis, as mocking the data can lead to maintenance issues and trouble down the line. That might not be your solution. 
- Gui or other types of end-to-end tests testing the entire thing against an environment before deployment to production. Important to bear in mind that some of the tests can verify that the page loads and http status is 200 etc. while others can test that the layout of the front page isn't broken. Not all tests need to test the entire thing.
- When response times and latency is of the utmost importance, load testing might the ticket before the new code hits production. We use [k6](https://k6.io/) for some projects to verify this.  
- If you prefer, after all the other tests have passed, you can also create smoke tests, which traditionally are quite few and only test the absolute minimum of your app during/after deployment. But do you need them, if you have enough of the other? Maybe, to catch that something went wrong _during_ deployment as opposed to a functional bug somewhere. 

When something breaks during this pipeline, you need to abort rollout and if needed roll back to the previous version if you catch something after deployment to production. 

It's also important to target the thing that breakes. Whenever you see a bug sneak past your last line of defense, then re-inforce that part of the wall. How could we have tested to avoid this? Why didn't we think of that? What can we do now to make it not happen again? The whole team should be involved in this work. 

All this to bring us to our goal.

### Deploys as a Non-event

I firmly believe that deploys to production should be treated as a non-event in the organisation. If some parts of the organisation needs (or wants (wrongly most often) which is more often the case) to be informed, automate it! Make a deploy notification sending a message to slack, optionally with a changelog of what has been done since last time. My experience is that when it happens often enough, you stop paying attention. And this is a good thing! This is in no way saying you shouldn't pay attention and followup immediately when things actually _break_, but do not pay attention to the deploy itself. It's the outcome that matters, not the act of deploying. Monitor production and get notified when something isn't right. Then investigate as mentioned above. 

And when moving to deploying more and more frequently, the possibility to, as a human, verify everything after a deploy naturally goes out the window. 

And wether you use pull requests or trunk-based development, every push to remote main branch can and should trigger deployment to production, when enough tests are in place. 

### How Do You Feel?

At first this can be uncertain and downright scary. What will management say if stuff brakes, what will the users do? But you take it step by step. 

1. Add some more tests of a kind you feel you lack.
2. Test and observe and discuss. Are we comfortable with deploying with this? If the answer is no, go back to i). 

The question always remains: are you comfortable with it?





