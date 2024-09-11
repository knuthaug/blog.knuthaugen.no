--- 
layout: post
title: Luke - the Lucene index viewer
mt_id: 8
date: 2009-08-17 10:20:25 +02:00
---
I'm working on a web application at the moment which uses Lucene as a search engine and the <a href="http://framework.zend.com/manual/en/zend.search.lucene.html">Zend Lucene PHP port</a>. And when debugging the indexing of documents I came across <a href="http://www.getopt.org/luke/">Luke</a> a browser for the Lucene index file format. It's a nifty tool and really the swiss army chainsaw you need when you can't really search for what you thought you added or thought you added something that isn't really searchable at all. It is written in Java and uses the java Lucene libraries but reads the Zend Lucene index file without problems (They're compatible after all). It lets you view fields in the index and all sorts of information about them and browse all documents stored in the index and of course search it to actually see what you get. A very cool tool when it comes to debugging Lucene.  
