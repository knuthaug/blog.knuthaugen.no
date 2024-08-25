--- 
layout: post
title: "Continuous Delivery II: Smoketests in Ruby and Rails"
mt_id: 40
date: 2011-04-04 19:33:03 +02:00
tags: [Ruby, Continuous Delivery, Jenkins]
---

This is part II in a blog mini series on building a build pipeline with Jenkins. The other parts, [part I](http://blog.knuthaugen.no/2011/04/continuous-delivery-the-ruby-way.html) and part III could be worth a read too.

This part is about a implementing built-in smoke tests in a rails application. This Is by no means new, but I added a little something at the end which I thought was quite nifty.

### Class definition

I created a small class to hold the actual smoke tests (pardon my ruby, I'm learning):

````ruby

class Smoketest
  attr_accessor :description, :status, :message

  def initialize(descr)
    self.description = descr
  end

  def run
    yield
  end

  def self.OK
    "OK"
  end

  def self.FAIL
    "FAIL"
  end

end
```

These are called from the SmoketestController. I chose to just put all (well all two) smoke tests in the controller, but they could easily be distributed and put wherever you want. The controller methods looks like this:

```ruby
require 'smoketest'

class SmoketestController < ApplicationController

  def index
    @tests = Array.new

    mongodb_smoke_test
    test_test

    respond_to do |format|
      format.html
      format.xml { render :action => 'index.xml.haml',
                          :layout => false }
    end
  end


  def test_test
    test2 = Smoketest.new("Test")
    test2.run {
      test2.status = Smoketest.OK
    }

    @tests &lt;&lt; test2
  end


  def mongodb_smoke_test
    test = Smoketest.new("MongoDB test connection")

    test.run {
      begin
        User.first
        test.status = Smoketest.OK
      rescue Exception => e
        test.status = Smoketest.FAIL
        test.message = e.message
      end
    }

    @tests &lt;&lt; test
  end

end

```

The "test" one is just for making it more than one, and the mongoDB test tries to do a query and gives it and ok status if that works,  and a fail with stack trace if somethings amiss. In a bigger application with more external systems, the number of smoke tests would go up. Running this, gives this nice web page for visual inspection:

<a href="http://blog.knuthaugen.no/assets_c/2011/04/smokes-26.html" onclick="window.open('http://blog.knuthaugen.no/assets_c/2011/04/smokes-26.html','popup','width=822,height=203,scrollbars=no,resizable=no,toolbar=no,directories=no,location=no,menubar=no,status=no,left=0,top=0'); return false"><img src="http://blog.knuthaugen.no/assets_c/2011/04/smokes-thumb-600x148-26.png" width="600" height="148" alt="smokes.png" class="mt-image-none" style="" /></a>

(The layout is a bit wide since I wrapped in the standard layout for the app.)

### The Junit output
I wanted the jenkins build job to track these smoke tests, which are being run as a build step after deployment. The easiest way to do this I figured was to make it spit out Junit XML format and let Jenkins chew on that. So a created an XML template like so:

```ruby

%testsuite{:name => "smoketests", :failures => @tests.select { |x| x.status == "FAIL" }.count, :tests => @tests.count, :skipped => 0}
  - @tests.each do |test|
    %testcase{:name => test.description}
      - if test.status != "OK"
        %failure{:message => test.message}

```


And when fetching the url http://server/smoketest.xml you get the following output:

```xml

<testsuite failures="0" name="smoketests" skipped="0" tests="2">
<testcase name="MongoDB test connection"></testcase>
<testcase name="Test"></testcase>
</testsuite>
```

(It handles failures too).

The following small shell script is used to check the status:

```bash

#!/bin/bash

if [ -z "$1" ]
then
    echo "usage: smoketest.sh &lt;URL&gt;"
    exit 1
fi

status=`curl --silent --head $1 | head -1 | cut -f 2 -d' '`

if [ $status != "200" ]
then
    echo "status was other than 200: was $status"
    exit 1
fi

if [ ! -e "reports" ]
then
  mkdir "reports"
fi

#put the xml version of the page into a file
curl --silent $1 &gt; reports/smoke.xml
```

The shell scripts stores the file which is then read by Jenkins. Works like a charm!

<img src="/images/jenkins-smoke.png" width="600" height="256" alt="jenkins-smoke.png" class="mt-image-none" style="" />

Stay tuned for the third article on build pipelines where I explore some future possibilities when using a build pipeline.

````
