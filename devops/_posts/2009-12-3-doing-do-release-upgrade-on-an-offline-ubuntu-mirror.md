--- 
layout: post
title: Doing do-release-upgrade on an offline ubuntu mirror
mt_id: 19
date: 2009-12-03 13:42:13 +01:00
tags: [ubuntu, software]
---

I have an offline mirror of the ubuntu package repositories for use on a network not connected to the internet. This works like a charm for updating packages on individual machines, but when it comes to doing a 'do-release-upgrade' to the next release, like these days I'm trying to upgrade to 9.10 Karmic Koala, we need some tricks to make this work. Firstly, sync your mirror so all the new packages of the new release are locally available. What you probably find is that the upgrade manager/do-release-upgrade software can't seem to find a new available automagically. So how do we accomplish this?

1.  update-manager and do-release-upgrade reads the file /etc/update-manager/meta-release to find the location of the meta-release file. This points to the internet location changelogs.ubuntu.com normally. And if you just mirror the package repos, the meta-release file isn't included. So we need to fetch it first: 'wget http://changelogs.ubuntu.com/meta-release'.
2.  Store it, for instance on the root of the internal mirror or some other convenient location, and put the url to it in the "URL" value in the /etc/update-manager/meta-release. If you're upgrading to a LTS release, fetch the meta-release-lts file too and repeat the process.
3.  Edit the meta-release file you just downloaded and substitute the external mirror address with the url for the internal mirror so all package locations match up. For me this was replacing 'archive.ubuntu.com' with 'explorer/mirror' since the internal mirror is available at http://explorer/mirror/ubuntu/. Make sure the file is readable via http (or file permissions if using file access to repo).
4.  Run update-manager or do-release-upgrade and the upgrade should work as you were using an internet mirror.
