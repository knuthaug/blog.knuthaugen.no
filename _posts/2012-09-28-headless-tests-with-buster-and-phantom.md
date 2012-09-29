---
layout: post
title: "Headless Tests with Buster.js and Phantom.js"
published: true
tags: [JavaScript, Testing, Jenkins]
---
{% include JB/setup %}

This setup was pieced together via several gists, tweets and articles so I thought it would be good thing to collect it all in a post. [http://busterjs.org/docs/browser-testing/](http://busterjs.org/docs/browser-testing/) says phantom.js support is "not yet landed in the beta", but that is the config sugar for doing it through the buster.js config file. It works just fine nonetheless.

We have been moving tests for the frontend projects at work to [buster.js](http://busterjs.org)  instead of [JsTestDriver](https://code.google.com/p/js-test-driver/). Mainly because Buster.js is faster and has a richer set of tools built in. JsTestDriver has some annoying bugs too and does not seem to be actively developed these days. 

But, running JavaScript tests in a browser is fairly easy, both with Buster and JsTestDriver by capturing a browser and sending data back and forth. But when running fast unit tests and running tests in a CI server, headless tests are nice. Fast and with no need for setting up multiple browsers on the ci server running on a X display of some kind. Of course, this *can* be done, but it is a hassle. Now if you *need* browser testing in several browsers, I suggest using an external service for that. Anyway, for our tests, most of them are not threading the fine line between browser incompatibilities as we are developing a chrome browser extension. So we can run the tests in phantom.js normally and run them in the target browser periodically.

### Enter Phantom.js

[Phantom.js](http://phantomjs.org/) is a 100% headless (as of version 1.6) headless webkit browser engine. It can be used for all kinds of nifty things like taking screenshots of web pages (the whole page, and not just the viewport), scripting interaction with webpages (there's an example of using Google Maps to find driving directions) and finding the load time of a web page, to name a few cool things. 

### Installing Buster.js and Phantom.js

Install Phantom.js by downloading it and unpacking the tar-file. If you're on a mac you can do:

{% highlight bash %}

brew update && brew install phantomjs

{% endhighlight %}

Buster.js is a node module and can be installed by running the following command in a recent node version:

{% highlight bash %}

npm install -g buster

{% endhighlight %}

or checking out [http://busterjs.org/docs/getting-started/](http://busterjs.org/docs/getting-started/) if you need more handholding. Depending on your platform you may need to adjust your path variable or symlink the buster executables into your $PATH

### Running the Tests

So to run some buster tests in phantom I have made a small project with some tests

{% highlight bash %}

buster.js
bin/
  server.sh
  kill-server.sh
  phantom.js
test/
  math-test.js
lib/
  math.js
 
{% endhighlight %}

The `lib/math.js` file is a small object with a simple function, and `test/math-test.js` is a test case for that. Nothing fancy there, but I list them for completeness. These files should hold your production code and tests.

{% highlight javascript %}

// lib/math.js

myapp = {};

myapp.Math = function() { };

myapp.Math.prototype.square = function(i) {
  return i*i;
};

// test/math-tests.js
buster.spec.expose(); // Make some functions global

describe("A math module", function () {
  this.foo = new myapp.Math();

  it("squares 1", function () {
    expect(this.foo.square(1)).toEqual(1);
  });
         
  it("it raises any number to its power", function () {
    expect(this.foo.square(2)).toEqual(4);
    expect(this.foo.square(3)).toEqual(9);
  });
           
});

{% endhighlight %}

The contents of `buster.js` (buster config file):

{% highlight javascript %}

var config = module.exports;

config["My tests"] = {
    rootPath: "./",
    environment: "browser", // or "node"
    sources: [
        "lib/*.js"
    ],
    tests: [
        "test/*.js"
    ]
}

{% endhighlight %}

`server.sh` is a script for starting the buster server and the phantom.js instance, and run the
phantom.js script on startup:

{% highlight bash %}

#!/bin/bash

buster-server & # fork to a subshell
sleep 2 # takes a while for buster server to start
phantomjs ./bin/phantom.js &

{% endhighlight %}

Then we have the `phantom.js` script for capturing the browser, in phantom. We also redirect any alerts
to console.log() instead, since we won't see them. 

{% highlight bash %}

var system = require('system'),
    captureUrl = 'http://localhost:1111/capture';
if (system.args.length==2) {
    captureUrl = system.args[1];
}

phantom.silent = false;

var page = new WebPage();

page.open(captureUrl, function(status) {
  if(!phantom.silent) {
    //console.log(status);
    if (status !== 'success') {
      console.log('phantomjs failed to connect');
      phantom.exit(1);
    }

    page.onConsoleMessage = function (msg, line, id) {
      var fileName = id.split('/');
      // format the output message with filename, line number and message
      // weird gotcha: phantom only uses the first console.log argument it gets :(
      console.log(fileName[fileName.length-1]+', '+ line +': '+ msg);
    };

    page.onAlert = function(msg) {
      console.log(msg);
    };
  }
});

{% endhighlight %}

The last script, `kill-server.sh` is for running after the tests and shut everything down again.

{% highlight bash %}

#!/bin/bash
# just call with ./kill-server buster-server|phantom

function get_buster_server_pid(){
    echo `ps aux|grep buster-server|grep node|awk '{ print $2 }'`
}

function get_phantom_server_pid(){
    echo `ps aux|grep phantomjs|head -1|awk '{ print $2 }'`
}

case "$1" in
  "buster-server") server_pid=`get_buster_server_pid` ;;
  "phantom") server_pid=`get_phantom_server_pid` ;;
esac


if [ "$server_pid" != "" ] ; then
    kill $server_pid
    echo "$1 killed"
else
    echo "$1 not killed. Found pid was=$server_pid"
fi

{% endhighlight %}


Running all these together, after another, we start up a buster server on localhost:1111, start phantomjs and use that to capture the buster server, run the tests, and the kill the server and phantom afterwards. 

{% highlight bash %}

{nikopol:buster: ->./bin/server.sh 
buster-server running on http://localhost:1111
{nikopol:buster: ->buster-test 
PhantomJS 1.6.1, OS X: ..                                                                               
1 test case, 2 tests, 3 assertions, 0 failures, 0 errors, 0 timeouts
Finished in 0.006s
{nikopol:buster: ->./bin/kill-server buster-server && ./bin/kill-server phantom
buster-server killed
phantom killed
{nikopol:buster: ->

{% endhighlight %}

If you're running the tests locally, you can leave the server and phantom running. But we want to run them in the CI server, so we clean up after tests are run. 

### Running on Jenkins

We run the build of this project in Jenkins and want to display the test results there, along with csslint, jslint and other quality checks. Buster.js has a nifty command line switch for outputting junit compatible xml, which Jenkins reads out of the box. For instance this command, instead of plain buster-test in Jenkins, with config for the violations plugin pointing to the file, will graph the test results nicely.

{% highlight bash %}

buster-test --reporter xml > reports/test-report.xml

{% endhighlight %}

The scripts can also of course be configured to run through npm, if you want. 

That's it, happy phantom.js and buster.js hacking!
