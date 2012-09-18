--- 
layout: post
title: Hacking on munin 1.4
mt_id: 17
date: 2009-11-27 20:17:46 +01:00
tags: [Munin, Monitoring]
---
 I have been doing the ol' open source thing lately and helping out some old colleagues from Redpill-Linpro hacking on the much-awaited 1.4 version of [munin](http://munin-monitoring.org) (out today) which has tons of new features and not to mention tons of new plug-ins for just about all kinds of hardware and software out there. The [changelog](http://munin-monitoring.org/browser/tags/1.4.0/ChangeLog) is longer than most I've seen in a while, and that's definitely a good thing. I've been doing mostly html+css work on 1.4 but I am planning to dig deeper into the core in the future and help out with some much needed re-factoring of the Perl code. And hopefully contribute some tests as well. It's good to write Perl again. 

### Planned plugins
I thought I work on some new plugins as well when I get spare time, namely

- SNMP plugin for Synology NAS
- SNMP plugin for Qnap NAS
- SNMP plugin for IBM Bladecenter H (if it has some good data available)
- SNMP plugin for IBM Storage DS3000 series

And I also going to see if the NetApp at work spits out something more useful not covered in the existing netapp plugins.

If you need monitoring and graphing of key metrics from your servers, network hardware, storage hardware and software servers (jmx plug-ins new in 1.4 too), you should give munin a spin.  
