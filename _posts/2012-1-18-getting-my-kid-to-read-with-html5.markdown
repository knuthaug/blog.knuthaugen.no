--- 
layout: post
title: Getting My Son to Read With Technology
mt_id: 46
date: 2012-01-18 20:35:46 +01:00
---
I have the exact same challenge as [Kenneth Kvalvik](http://www.webjournalist.no/2011/11/prosjekt-leselyst-del-1/) (article in Norwegian): A 6 year old boy who is starting to read but can't find anything he likes to read. He hates home work assignments (and who can blame him, they're boring). And as the son of the author of the article above, my son also loves Star Wars. He hasn't seen any of the films but plays star wars games quite diligently on his Nintendo DS and plays with Star Wars lego a lot.

So why not give it a go?

The originator bought a star wars book and translated it and added images from the movies. I skipped that step and went straight to the movies. In part because after reading for only a couple of months (and having only covered about half the alphabet in detail) my son needs very simple text.

One tough question is: which order should I present the movies in? Original trilogy first or prequel first? I feel every fiber of my Star Wars fanboy body resisting, but I chose prequel trilogy first. Anything else would probably add to the confusion.

## The Plan
My son also loves using the IPad, so I thought I'd take advantage of that and create an ebook app (or "app") for that platform. I also needed to be able to add more pages quickly (if it was a hit). So I landed on using plain HTML5 and just creating a web page and use the "add to home screen" feature and make it look like an app.

I am using [swipe.js](http://swipejs.com/) which is very lightweight javascript library for just doing swipe gestures on the IPad. I checked out both Sencha Touch and JQTouch (which I have used before) but for this small project they were both overkill.

The layout of the app is a simple directory structure, one folder for a book, with one sub folder for a chapter with images and videos for that chapter. Each chapter is one html file, with divs that swipe.js is showing and hiding as you swipe. Each page has either an image or a video, and from one to three short sentences in uppercase (written in lowercase and text-transformed with css, so I can lowercase it again when he's better at reading).

I went with using movie screen shots for some pages (and the parts where we need some censorship of gory details (not much gore in Star Wars but for a six year old it can be a bit scary)). I also added some small movie clips to some of the pages to keep his interest up and give him a little break in the reading. I researched som HTML5 video players, but found that they all, as per usual, sucked in their own unique way, and went with the safari default video player on the IPad. Which works wonderfully for my use.

Another takeaway is how much you can cut away from those movies (especially the prequel trilogy that, well, isn't all that good) without losing the core of the history. The second movie with all that sticky love stuff between Anakin and PadmÃ¨ will be cut even more. 6yo boys are not that into romance.

## Results
So how did this turn out? I created two chapters of the first book before starting a beta test on my first (and only (non-paying)) customer. He read everything in one sitting and immediately asked for more chapters. And that question was repeated every day over the following weeks where I hadn't had the time to write more chapters. Never had such a pushy user before!

Technically I have some duplication in the code, specifically the chapter menu. The layout isn't all that great either, but I plan to fix that soon. The customer was so demanding that I was forced to take on some technical debt to get the product out into the market :-) I have also planned to add slideshow variant to make images clickable and go full screen. 

Now we're at the end of the first book, and he is asking when the second books becomes available. So I would say in terms of getting a reluctant 6 year old to read, it's a huge success. He want's to read it again too. He comes for the action sequences in the video clips, but there are no protests when I say we should read too. 

(Since these movies are all copyrighted, and in these dire #SOPA times, I can't publish the finished results anywhere, I'm afraid. The text, in Norwegian, is in the code over at Github, but the images and videos are not. And won't be.)
 
