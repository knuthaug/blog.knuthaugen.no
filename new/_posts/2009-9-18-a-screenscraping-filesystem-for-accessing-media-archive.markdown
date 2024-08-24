--- 
layout: post
title: A screenscraping filesystem for accessing media archive
mt_id: 11
date: 2009-09-18 10:48:07 +02:00
---
This is probably directly interesting to Norwegians since the content in question is in Norwegian, but the concept is so very cool. In Norway we have [NRK](http://www.nrk.no/) the state broadcast corporation which has a very contemporary view on sharing its on content to the public. It is after all paid for by the people through taxes. And they have a rich library of media streams available on the net of mostly all television productions they created themselves. 

I came across [this little blogpost](http://blog.averlend.com/2009/05/23/nrk-som-filsystem/) (in Norwegian) about Erlend Klakegg Bergheim's effort to write [a fuse filesystem](http://fuse.sourceforge.net/) which scrapes the archive web pages and creates a file system which you can mount as a regular file system on linux. Then just point your asx-capable media player (like vlc, mplayer, totem or kaffeine) to the "file" and play away. It is simply genius and ingeniously simple and makes browsing the content a breeze. 

It's written in python and chimes in at a 250 lines of code in total. The source is available at [github:klakegg/nrkfs](http://github.com/klakegg/nrkfs) 
