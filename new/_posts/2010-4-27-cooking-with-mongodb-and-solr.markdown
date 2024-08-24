--- 
layout: post
title: Cooking with Mongodb and Solr
mt_id: 30
date: 2010-04-27 13:46:28 +02:00
tags: [NoSQL, MongoDB, Solr, Java]
---
 I've recently changed storage backend and search backend for a small web project and it has been a real blast.  What follows is an overview of the reasons for the change, what the change actually was and the relative amount of joy involved. 

### The Old System

System was built using PHP/Apache2 and MySQL and it covers a _very_ simple domain with only a single object (Person, sort of) and simple data records for several years. 

* No writing through the web interface, only search and lookup.
* Batch updates with between 4 and 5 million records in each update, 4-5 years history, so total 16-20 million records
* "Search" through very simple text indexes on the relevant columns in MySQL. 
* InnoDB backend
* File is transformed to [LOAD DATA INFILE](http://dev.mysql.com/doc/refman/5.1/en/load-data.html) format and fed into MySQL with manual delete of the set for that year beforehand. 

### The Pain Points

* Batch update with 4 million rows averages (on prod machine: dual core 3GHz 4GB Ram, roughly 1GB set aside for MySQL) taking 4-5 hours hours with index updates being the main culprit. This could be done as a check-the-record-and-update-if-changed but that would also require a lot of queries and updates to the database.
* Queries with wildcards are dead slow when hitting outside the query cache. 
* Not really advanced search as such.

### The Plan

* Replacing MySQL with [MongoDB](http://www.mongodb.org/) as there is no actual relations needed and everything fits in one collection of documents
* Replacing MySQL indexes with [Apache Solr](http://lucene.apache.org/solr/) for consolidating search across several other systems. And speed.
* Use the PECL extensions for both [MongoDB](http://pecl.php.net/package/mongo) and [Solr](http://pecl.php.net/package/solr). 

MongoDB is a document database storing documents in binary json form, written in C++.

Solr is built on top of the java version of Lucene and does indexing over HTTP and runs happily in tomcat, jetty or most other servlet engines. 

### The Implementation

Names of domain objects are changed to protect the guilty - and the domain. 

Both Solr and MongoDB are _fast and easy_ to work with. There is very little in your way when it comes to just doing what you want and solving the problems in a straight-forward manner. Some examples:

* The MongoDB "upsert" feature saves you some round-trips to the database. Normally if you want to update an existing record if it's there or inserting it if it's not you need to query first and then insert a new one when not found. If you just want to update/add data to part of the object, it complicates the matter further. With mongodb you can call update with a special parameter in the data array and the rest is handled server-side. 
* Solr has the default behavior of updating instead of complaining when you send a document with a primary key field that already exists in the index. 
* Solr does everything over HTTP and you get easy-to-read xml message back as responses. This is also handy when you need to debug what data is sent over the wire.

I created a very thin layer between mongodb and the domain, with an `insert()` method (which as we will see, also handles updates) that take a `DataRecord` (read from the file) as an argument. 

{% highlight php %}

public function insert(DataRecord $record) {
       $this->collection->update(array('id' => $record->id() ), 
           array('$set' => array(
               'list.' . $record->year() => $record->getDetails()->toArray())), 
           array('upsert' => true));
}

{% endhighlight %}

This will insert a document in the collection if it's not there. When it is there, it will add an element to the (nested) 'list' element with the value of `$record->year()` as key. The value will be the value of `$record->getDetails()`. The `toArray()` call is there because the mongo driver expects arrays to store. The super cool part is that if the key exists, it will just be updated with the data from the details object. Read more on the details of the [MongoDB update options](http://www.mongodb.org/display/DOCS/Updating). 
 
For indexing the document in Solr, I added a similarly thin wrapper for the SolrClient object with an `index()` method. This method takes a `SolrInputDocument` as an argument. I chose to delegate to the domain object to decide what should be indexed and thus create the index document object but the responsibilities could easily have switched around. The finer point is that when indexing you have to read the complete object from the database in order to get all data. The DataRecord that was read from file and stored with upsert may just have been part of the picture. Reading back the updated object incurs a performance penalty that wasn't present in the old system. It was also a consequence of structuring the data as a collection of person objects in Mongodb, rather than a long list of records in the old version. This maps better to the domain. 

{% highlight php %}

public function index(SolrInputDocument $document) {
        $response = $this->solr->addDocument($document);

        if($this->pendingDocuments++ == $this->commitInterval) {
            $this->commit();
            $this->pendingDocuments = 0;
        }

        return $response->getResponse();

    }

{% endhighlight %}

Commit on every Solr document makes indexing very slow. Small tests indicated 3 minutes for indexing 5000 documents with commit on every submit and 15 seconds with one commit every 2000 document (and at the end of course). The code above commits every `$commitInterval`(10000 default) to speed things up a bit. Note also that the `commit()` and `optimize()` calls for Solr may time out as they can take a long time to finish. Solr does not time out but rather the java application server you're running times out. When this happens an exception is thrown in the php driver which has to be caught.

### The Results
Platform is Ubuntu 9.10 server edition 64 bit and all timings from the shell are done with `time` on linux. MySQL times are the times reported from MySQL itself.

### Time for batch insert/update

* Commit interval for solr: 10000
* update-logging for Solr turned off (default is very verbose)
* nssize=1024 for Mongodb

<table class="blogtable" width="100%">
 <thead>
<tr>
  <th>System</th>
  <th>Operation</th>
<th>Time</th>
</tr>
</thead>
<tbody>
  <tr>
  <td>MySQL</td>
<td>initial import</td>
<td>16m 5.7s</td>
  </tr>

  <tr>
  <td>MySQL</td>
<td>update (delete+insert)</td>
<td>3h 24m 56s (delete) + 40m 56s insert</td>
  </tr>

  <tr>
  <td>Mongodb (no indexing)</td>
<td>initial import</td>
<td>12m 16s real, 10m 41s user</td>
  </tr>

  <tr>
  <td>Mongodb+solr</td>
<td>initial import</td>
<td>78m 39s real, 25m 28s user.</td>
  </tr>

<tr>
  <td>Mongodb (no indexing)</td>
<td>update </td>
<td>13m 22s real, 11m 8s user.</td>
  </tr>

  <tr>
  <td>Mongo+solr</td>
<td>update</td>
<td>69m 8s real, 19m 25 user</td>
  </tr>

</tbody>
</table>

<br/>

### Space usage

No pre-allocation was done for MongoDB so it created the data files as needed. This means that the last was created at 2GB and very well may be almost empty. Mongo creates files in a doubling fashion from 64 MB to 2G like this: 64, 128, 256, 512, 1GB, 2GB.  

<table class="blogtable" width="100%">
 <thead>
<tr>
  <th>System</th>
  <th>Index</th>
<th>Data</th>
</tr>
</thead>
<tbody>
  <tr>
  <td>MySQL initial import</td>
<td>717 MB</td>
<td>516 MB</td>
  </tr>

 <tr>
  <td>MySQL initial import + 1 additional dataset</td>
<td>1.4 GB</td>
<td>1 GB</td>
  </tr>

  <tr>
  <td>Mongo+Solr initial import</td>
<td>744 MB</td>
<td>1294 MB (3GB of datafiles)</td>
  </tr>

  <tr>
  <td>Mongo+Solr initial + 1 additional dataset.</td>
<td>1538 MB</td>
<td>4348 MB</td>
  </tr>


 </tbody>
</table>

<br/>

### CPU usage

When importing to MySQL it more or less maxes on CPU for the entire import. When doing the import with a php script feeding data to mongodb and solr, the component using the most cpu is the php script splitting the file, creating objects and calling the mongodb and solr APIs.This takes up 35-40% CPU and around 10 MB of ram.  Mongodb is using around 10% cpu (with 1.1GB of ram) and solr (tomcat, that is) is spending 30% and around 300MB of ram. Disks on these machines are virtualized, through Vmware, 15K SAS disks on an IBM S3200 storage array with dedicated GB LAN between blade center and storage. Disk IO seems to be the bottleneck here. 

### Space usage

Solr and mongodb seem to be a bit more sloppy with their space usage than MySQL but I guess this is the price to pay for some of the other benefits you get. See [mongo faq on data files](http://www.mongodb.org/display/DOCS/Developer+FAQ#DeveloperFAQ-Whyaremydatafilessolarge?) for info on how to see real space usage for databases and not just file sizes. In return for more storage space spent, you get _much_ better search capabilities (and faster) and faster (although small improvement) query times against database. 
 
