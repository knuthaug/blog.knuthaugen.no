--- 
layout: post
title: Posting to Movable Type From Emacs
mt_id: 21
date: 2009-12-29 16:55:56 +01:00
---

I stumbled across
[weblogger.el](http://www.emacswiki.org/emacs/download/weblogger.el)
which is an xml-rpc interface for posting to several blog engines,
including Movable Type which I use. And I thought: Hey, why use that
somewhate crappy online editor for writing blog posts when one can use a fairly
OK operating system to do the job (aka Emacs).

### Setup
Download weblogger.el from the above link and also the requisite [xml-rpc](http://www.emacswiki.org/emacs/xml-rpc.el) and load them in .emacs in the usual manner. 

Run weblogger-setup-weblog and fill in the correct values for configuring the blogging engine. For Movable Type the URL endpoint is http://your.blog.url/mt/mt-xmlrpc.cgi. The user name is your usual username, but the password is the special API password which can be found and set on the bottom of the user page in the admin interface. After that it's just C-c C-n for a new entry. The setup will fetch all existing entries automatically so you can cycle through and edit too.

### Caveats
It seems the current version of weblogger.el doesn't handle drafts
properly against MT 4. The first version saved as a draft is published instantly :-/. Later saves keep the draft status. Also, the familiar C-c C-s for saving the buffer actually publishes. So you're going live pretty soon.  
