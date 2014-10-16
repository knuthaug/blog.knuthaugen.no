--- 
layout: post
title: A Brief History of NoSQL
mt_id: 27
date: 2010-03-16 14:45:16 +01:00
tags: [NoSQL]
---
[NoSQL](http://en.wikipedia.org/wiki/NoSQL) is getting a lot of traction and hype these days but in reality it's not that new of a thing. I thought I'd trace the roots of NoSQL and see what I'd find. The name "NoSQL" was in fact first used by Carlo Strozzi in 1998 as the name of file-based [database he was developing](http://www.strozzi.it/cgi-bin/CSA/tw7/I/en_US/nosql/Home%20Page). Ironically it's relational database just one without a SQL interface. As such it is not actually a part of the whole NoSQL movement we see today. The term re-surfaced in 2009 when Eric Evans used it to name the current surge in non-relational databases. It seems like the name has stuck for better or for worse. Note that not all projects are included in this post. See the [post on analyzing the NoSQL landscape](http://blog.knuthaugen.no/2010/03/the-nosql-landscape.html) for a more complete listing.

### 1960s

* [MultiValue](http://en.wikipedia.org/wiki/MultiValue) (aka PICK) databases are developed at TRW in 1965.
* According to comment from Scott Jones [M[umps]](http://en.wikipedia.org/wiki/MUMPS) is developed at Mass General Hospital in 1966. It is a programming language that incorporates a hierarchical database with B+ tree storage.
* IBM [IMS](http://en.wikipedia.org/wiki/IBM_Information_Management_System), a hierarchical database, is developed with Rockwell and Caterpillar for the Apollo space program in 1966.

##1970s

* InterSystems develops the ISM product family succeeded by the Open M product, all M[umps] implementations. See comment from Scott Jones below.
* M[umps] is approved as a ANSI standard language in 1977.
* in 1979 Ken Thompson creates [DBM](http://en.wikipedia.org/wiki/Dbm) which is released by AT&T. At it's core it is a file-based hash. 


## 1980's

Several successors to DBM spring into life.
 
* [TDBM](http://tdbm.dss.ca/) supporting atomic transactions
* NDBM was the Berkeley version of DBM supporting having multiple databases open at the same time.
* SDBM - another clone of DBM mainly for licensing reasons.
* [GT.M](http://en.wikipedia.org/wiki/GT.M) is the first version of a key-value store with focus on high performance transaction processing. It is open sourced in 2000.
* [BerkeleyDB](http://en.wikipedia.org/wiki/Berkeley_DB) is created at Berkeley in the transition from 4.3BSD to 4.4BSD. Sleepycat software is started as a company in 1996 when Netscape needed new features for BerkeleyDB. Later acquired by Oracle which still sell and maintain BerkeleyDB. 
* [Lotus Notes](http://www-01.ibm.com/software/lotus/) or rather the server part, Lotus Domino, which really is a document database has it's initial release in 1989, now sold by IBM. It has evolved a lot from the early versions and is now a full office and collaboration suite. 

## 1990's

* [GDBM](http://www.vivtek.com/gdbm/) is the Gnu project clone of DBM
* [Mnesia](http://en.wikipedia.org/wiki/Mnesia) is developed by Ericsson as a soft real-time database to be used in telecom. It is relational in nature but does not use SQL as query language but rather Erlang itself.  
* [InterSystems Cache](http://www.intersystems.com/) launched in 1997  and is a hybrid so-called post-relational database. It has object interfaces, SQL, PICK/MultiValue and direct manipulation of data structures. It is a M[umps] implementation. See Scott Jones comment below for more on the history of InterSystems
* [Metakit](http://en.wikipedia.org/wiki/Metakit) is started in 1997 and is probably the first document oriented database. Supports smaller datasets than the ones in vogue nowadays.

## 2000-2005

This is were the NoSQL train really picks up some momentum and a lot is starting to happen. 

* Graph database [Neo4j](http://neo4j.org/) is started in 2000.
* [db4o](http://www.db4o.com/) an object database for java and .net is started in 2000
* [QDBM](http://qdbm.sourceforge.net/) is a re-implementation of DBM with better performance by Mikio Hirabayashi.
* [Memcached](http://memcached.org/) is started in 2003 by Danga to power Livejournal. Memcached isn't really a database since it's memory-only but there is soon a version with file storage called [memcachedb](http://memcachedb.org/).
* [Infogrid](http://infogrid.org) graph database is started as closed source in 2005, open sourced in 2008
* [CouchDB](http://couchdb.apache.org/) is started in 2005 and provides a document database inspired by Lotus Notes. The project moves to the Apache Foundation in 2008.
* Google [BigTable](http://en.wikipedia.org/wiki/BigTable) is started in 2004 and the research paper is released in 2006.

##2006-2010

*  [JackRabbit](http://jackrabbit.apache.org/) is started in 2006 as an implementation of JSR 170 and 283.
* [Tokyo Cabinet](http://1978th.net/tokyocabinet/) is a successor to QDBM by (Mikio Hirabayashi) started in 2006
* The research paper on [Amazon Dynamo](http://www.allthingsdistributed.com/2007/10/amazons_dynamo.html)  is released in 2007. 
* The document database [MongoDB](http://www.mongodb.org/display/DOCS/Home) is started in 2007 as a part of a open source cloud computing stack and first standalone release in 2009.
* Facebooks open sources the [Cassandra project](http://cassandra.apache.org/) in 2008
* [Project Voldemort](http://project-voldemort.com/) is a replicated database with no single point-of-failure. Started in 2008.
* [Dynomite](http://github.com/cliffmoon/dynomite) is a Dynamo clone written in Erlang.
* [Terrastore](http://code.google.com/p/terrastore/) is a scalable elastic document store started in 2009
* [Redis](http://code.google.com/p/redis/) is persistent key-value store started in 2009
* [Riak](http://riak.basho.com/) Another dynamo-inspired database started in 2009.
* [HBase](http://wiki.apache.org/hadoop/Hbase) is a BigTable clone for the Hadoop project while [Hypertable](http://hypertable.org/) is another BigTable type database also from 2009.
* [Vertexdb](http://github.com/stevedekorte/vertexdb) another graph database is started in 2009
* Eric Evans of Rackspace, a committer on the Cassandra project, introduces the term "NoSQL" often used in the sense of "Not only SQL" to describe the surge of new projects and products. 

(Some of these dates need to be taken with a small pinch of salt as finding out exactly when the projects started can be a bit difficult. Also not all projects started in last few years have been included)

In 2009 and 2010 we also saw the coming of NoSQL conferences like [NoSQL live](http://www.10gen.com/events) in Boston in 2010, the upcoming [NoSQL eu](http://nosqleu.com/) in London in April 2010. Last year we also saw the [NoSQL east](https://nosqleast.com/2009/#location) conference in Atlanta. 
