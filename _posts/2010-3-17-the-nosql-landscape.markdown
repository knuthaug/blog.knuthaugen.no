--- 
layout: post
title: Analysis  of the NoSQL Landscape
mt_id: 28
date: 2010-03-17 08:01:47 +01:00
tags: [NoSQL]
---

This is an overview of the current state of the NoSQL landscape. It's getting large and somewhat unwieldy and there may be projects which have landed in the wrong category here. I have included object databases in the mix too. Seriously folks, some of you need to pick more google friendly project names. Here are the types and the players in each category. Background data is available in [this Google docs spreadsheet](https://spreadsheets.google.com/ccc?key=0AivRtF1K3Ma7dHFpWjllNVBnNlhyT0Y2WkpDMGdiU2c&hl=en).

## Key-value stores
* __key/value in-memory:__ [memcached](http://memcached.org/), [Repcached](http://repcached.lab.klab.org/), [Oracle Coherence](http://www.oracle.com/technology/products/coherence/index.html), [Infinispan](http://www.jboss.org/infinispan), [Websphere eXtreme scale](http://www-01.ibm.com/software/webservers/appserv/extremescale/), [JBoss cache](http://www.jboss.org/jbosscache), [Velocity](http://blogs.msdn.com/velocity/default.aspx), [Terracotta Ehcache](http://www.terracotta.org/)

* __Regular key/value stores:__ [Keyspace](http://scalien.com/keyspace/), [Amazon SimpleDB](http://aws.amazon.com/simpledb/), [Flare](http://labs.gree.jp/Top/OpenSource/Flare-en.html), [Schema-free](http://code.google.com/p/schemafree/),  [RAMCloud](http://fiz.stanford.edu:8081/display/ramcloud/Home), [Twisted Storage (TSnoSQL)](http://twistedstorage.sourceforge.net/), [Redis](http://code.google.com/p/redis/), [Tokyo Cabinet](http://1978th.net/tokyocabinet/), [Lightcloud](http://opensource.plurk.com/LightCloud/), [NMDB](http://blitiri.com.ar/p/nmdb/), [Lux IO](http://luxio.sourceforge.net/), [Memcachedb](http://memcachedb.org/), [Actord](http://code.google.com/p/actord/), [BerkeleyDB](http://www.oracle.com/technology/products/berkeley-db/index.html), [Scalaris](http://code.google.com/p/scalaris/), [GT.M](http://fisglobal.com/Products/TechnologyPlatforms/GTM/index.htm), [Mnesia](http://www.erlang.org/doc/apps/mnesia/index.html), [HamsterDB](http://hamsterdb.com/), [Chordless](http://sourceforge.net/projects/chordless/)

* __Eventually Consistent key/value stores:__ [Amazon Dynamo](http://en.wikipedia.org/wiki/Dynamo_%28storage_system%29), [Voldemort](http://project-voldemort.com/), [Dynomite](http://wiki.github.com/cliffmoon/dynomite/), [SubRecord](http://subrecord.org/), Mo8onDb, [Dovetaildb](http://millstonecw.com/dovetaildb/), [KAI](http://sourceforge.net/projects/kai/)

## Column-oriented stores
[Google BigTable](http://labs.google.com/papers/bigtable.html), [HBase](http://hadoop.apache.org/hbase/), [Cassandra](http://cassandra.apache.org/), [HyperTable](http://hypertable.org/), [OpenNeptune](http://code.google.com/p/openneptune/), KDI, QBase

## Document Databases
[CouchDB](http://couchdb.apache.org/), [MongoDB](http://www.mongodb.org/display/DOCS/Home), [Apache JackRabbit](http://jackrabbit.apache.org/), [ThruDB](http://code.google.com/p/thrudb/), [CloudKit](http://getcloudkit.com/), [Perservere](http://www.persvr.org/), [Lotus Domino](http://www-01.ibm.com/software/lotus/products/domino/), [Riak](http://riak.basho.com/), [Terrastore](http://code.google.com/p/terrastore/)

## Object Databases
[ZODB](http://zodb.org/), [db40](http://db4o.com/), [Versant](http://www.versant.com/), [Gemstone/s](http://www.gemstone.com/), [Progress Objectstore](http://web.progress.com/en/index.html)

## Graph Databases
[Neo4j](http://neo4j.org/), [VertexDB](http://www.dekorte.com/projects/opensource/vertexdb/), [Infogrid](http://infogrid.org/), [Sones](http://www.sones.com/home), [Filament](http://sourceforge.net/projects/filament/), [Allegrograph](http://www.franz.com
/agraph/allegrograph/), [HyperGraphDB](http://www.kobrix.com/hgdb.jsp)  

## Projects by Type

If we graph all the projects by type we get this view:

<img alt="projects_by_type(2).png" src="../../../images/projects_by_type%282%29.png" width="597" height="438" class="mt-image-center" style="text-align: center; display: block; margin: 0 auto 20px;" />

There are more key-value stores than the other types combined. Why is this? Are key-value stores that much easier to implement? I would at least guess that the first area where we see projects being abandoned and convergence of projects is this one. The important thing is the features users want, not the project themselves. There __must__ be a lot of overlap here and a lot of projects that are slightly different and almost identical. On the other hand a lot of knowledge of these kinds of system is spread around and there is a good chance of innovation. The combination of the best technical features and API features will hopefully bubble to top and stay on. 

## License Breakdown

If we graph the projects in the list above by license chosen we get the following:

<img alt="projects_by_license(2).png" src="../../../images/projects_by_license%282%29.png" width="651" height="452" class="mt-image-center" style="text-align: center; display: block; margin: 0 auto 20px;" />

This shows a clear dominance for open source licenses over commercial ones. Some product have chosen a dual licensing model (neo4j and BerkelyDB). Quite a few are unknown which really means they are unable to communicate their license in a understandable manner or the project wasn't really found on the web at all (see point about google friendly names). 

## Language Breakdown

Graphing the projects by implementation language we get the following:

<img alt="projects_by_language(4).png" src="../../../images/projects_by_language%284%29.png" width="594" height="445" class="mt-image-center" style="text-align: center; display: block; margin: 0 auto 20px;" />

Java takes the lead by with C and C++ following close behind. But is the prevalence of Java a result of the amount of Java knowledge spread around and the big Java usage in Open source, or is Java more suited than other languages to implement these kinds of systems? Interesting to note the number of Erlang implementations and also the fact that quite a few of the projects have implementations in more than one language. The ones with more than one implementation are mostly commercial ones. 

Some ending questions:  
* Have we reach the maximum of projects that are sustainable now or will the ecosystem continue to grow even more? 
* Will more of them go commerical? Or will more choose the model with support as the income, like 10Gen has with MongoDB?
* How does one choose the right one to use for a given project? This is an increasingly hard problem, at least for key-value stores.

### References:

* [NoSQL presentation by Steve Yen](http://dl.getdropbox.com/u/2075876/nosql-steve-yen.pdf)
* [http://nosql-database.org/](http://nosql-database.org/)
* [http://nosql.mypopescu.com/](http://nosql.mypopescu.com/)
* [http://www.dbms2.com/2010/03/14/nosql-taxonomy/](http://www.dbms2.com/2010/03/14/nosql-taxonomy/)
* [http://blog.nahurst.com/visual-guide-to-nosql-systems](http://blog.nahurst.com/visual-guide-to-nosql-systems)
* All the various project pages and product websites. 
