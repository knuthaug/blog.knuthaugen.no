--- 
layout: post
title: Twitter Data and Neo4j-rest in Pure Javascript
mt_id: 33
date: 2010-08-11
tags: [Javascript, Neo4J, REST, Twitter]
---

## The Stage

Some free time prompted me to test out the [REST interface](http://components.neo4j.org/neo4j-rest/) for the most excellent graph database Neo4j. And to gives those rusty javascript skills a refresh, I'd thought I'd to it in pure javascript. To help see what is going on, I visualize the graph using [JIT](http://thejit.org/) and use jQuery under the hood to do the rest calls and the DOM scripting more efficiently.

I start out simple by just fetching and using data accessible in the public twitter API. The model I choose was to query twitter for friends and followers of a particular user, store it in neo4j and plot it as a directed graph on a HTML5 canvas element using JIT. Next time around the graph can be fetched directly from neo4j without going to twitter. Everything is in javascript and the only html involved is a input field for the username to search for and a HTML5 canvas element for drawing the graph using JIT.

## Implementation

Browser-side javascript can be hard to develop and debug. I chose JSpec as my testing framework for the day, which has a nice DSL for writing RSpec-like tests and has support for running in all browser through a command-line tool. It Also has rhino support.

JSpec tests are cool. JSpec comes bundled in a ruby gem which you install and after that you get a command line runner for firing browsers, or rhino, and looking up syntax and doing other neat stuff to your test suite. It looks like a good project with steady releases and progress. Here's an example of how a test looks with the DSL in action:

````javascript
describe 'twitter'

  before
    network = {}
    neo = {}
    stub(neo, 'node_exists').and_return( { status: true,
                                           "data": {self:"http://localhost:9999/node/1"} })

    stub(neo, 'get_node').and_return( {id: 123} )

    $ = { };
    stub($, 'ajax').and_return(true);
  end

  before_each
    stub(network, 'log').and_return( { } )
    twitter = Twitter({"network": network, "neo": neo})
    twitter.get_request = function(url, name, callback){
       callback.call(twitter, [{ id: 1}, { id: 2}]);
    };
    data = { }
  end

  describe 'lookup()'

    it 'should call callback on fetch for valid user'
      stub(neo, 'get_node').and_return( {id: 123} )

      twitter.lookup("knuthaug", function(in_data){
                   data = in_data;
               });
      data.id.should.eql 123
   end
end
```

## Patterns ##

Javascript gives you plenty of ammunition to shoot yourself in the foot, and I decided to follow a pattern from Douglas Crockfords book "Javascript, The Good Parts" and implement my objects with what we can call the "that" pattern. Instead of defining the object like this:
```javascript
```javascript
var Node = function(spec){

  this.foo = function(){
           var status = "";
           that.bar(status);
      }
   };
}


//and call it like this
var myNode = new Node( {id: 1} );

```

we write it like this.
```javascript
```javascript
var Node = function(spec){

   var that = spec;

   that.foo = function(){
           var status = "";
           that.bar(status);
      }
   };

 return that;
}

//and call it like so:

var myNode = Node( {id: 1} );

```

This encapsulates all variables and functions into a variable which is returned to the caller and if we were to implement private functions on the object, something javascript normally doesn't let you do, we define them on "this" instead of "that".  The spec argument to the constructor is just an easy way of passing in default values to the object being created, or giving it a prototype to inherit from. the "new" keyword normally does this for you and with this technique you have to do it yourself to get a prototype chain set up.

The point is that I'm not sure I'm fond of this technique since I find the code to get a bit muddled and the "that" keyword has a strange ring to it. Next time round I'll probably stick to the normal way of setting up objects.

I ended up with and object encapsulating the graph, one for the node, one wrapping the twitter API and lastly one wrapping neo4j-rest for storing and retrieving data. The code, if you're interested can be found on [github](http://github.com/knuthaug/twitter-navigator) (very unpolished and probably won't ever be polished so take it with a grain of salt or two).

## Gephi ##
Gephi is an open source tool for visualizing a graph using Open GL for fast and fancy rendering capabilities. A version released a short time ago ([get it here](http://gephi.org/2010/gsoc-2010-mid-term-adding-support-for-neo4j-in-gephi/)) has support for connecting directly to a (sadly, not running) instance of Neo4J and import the whole graph.

For this little pet project the main focus for using Gephi was to test it out and see how it works, but the potential is huge for graphs with more data in them. Gephi can do all sorts of graph manipulation and analysis and showing the graph according to values stored in the nodes etc. In the twitter graph I stored the number of followers in each of my followers as a number and Gephi could easily be configured to draw the node size relative to that, color edges based on data and much more. And all in nice openGL smooth graphics performance.


All in all a great little adventure. And you should learn proper javascript :-)
````
