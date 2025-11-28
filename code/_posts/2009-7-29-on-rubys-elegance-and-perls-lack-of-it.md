--- 
layout: post
title: On Ruby's elegance and Perl's lack of it
mt_id: 4
date: 2009-07-29 10:15:47 +02:00
---
I've been programming <a title="Wikipedia on Perl" href="http://en.wikipedia.org/wiki/Perl">Perl</a> for a number of years and I like the language a lot. It's my weapon of choice when tackling some random programming task or just spiking something quickly. One thing that has bothered me over the years and surprised me to an extent is Perl's rather lousy reputation. It's criticized for being just line-noise, hard to read and generally frowned upon by people outside the Perl community. But Perl is a very flexible and powerful language. True you can write incomprehensible Perl, just as you can write gibberish in most any other language, but you can certainly write good, clean OO code. You just have to know what you are doing (or use <a title="Moose CPAN page" href="http://search.cpan.org/~drolsky/Moose-0.88/lib/Moose.pm">Moose</a> which is quite superb at covering up the transgressions of the Perl OO system).

I recently picked up a copy of <a title="Amazon: the ruby programming Language" href="http://www.amazon.co.uk/Ruby-Programming-Language-David-Flanagan/dp/0596516177">The Ruby Programming Language</a> and the more I read the more it dawned on me just how much Ruby has gotten from Perl. This is no secret as the wikipedia page on Ruby spells out quite clearly. Yet Ruby is considered clean, elegant and straight-forward and has a much better reputation than Perl. Why is this? I decided to dig a little deeper. One point is that in Perl your effort, at least when new to Perl, must be on keeping the code from going all over the place and in Ruby you have to really try if you're gonna write sloppy style. Wherein lies the actual differences?<!--more-->
<h2>The regex syntax</h2>
The regular expression syntax is quite similar in Ruby and Perl in that it's expressed directly with <code>//</code> and not requiring you to instantiate an Regex object first like in C# or Java.
Perl:
```perl
print "match" if  $string =~ /\w+?/;
```
{: class="full-bleed font-highlight"}

Ruby:
```ruby
puts "match" if string =~ /\w+?/
```
{: class="full-bleed font-highlight"}

But here's where Ruby fanatical devotion to the Pope, er, objects comes into play. In Perl you can choose to compile the regex once to avoid multiple regex engine compilations in a loop and store it in a variable. But all access to groups is done via $1,  $2 etc. . In Ruby this creates a new object of the <a href="http://ruby-doc.org/core/classes/Regexp.html">Regexp</a> class hich you can either assign to a variable to use it multiple times or pass around or call methods on.
Ruby:
```ruby
regex = /\w+?/
puts "match" if regex.match("foo")

# or:

/\w+?/.match "foo"
```
{: class="full-bleed font-highlight"}

and the match function returns MatchData object(s) which can be used for further digging. An you've got all sorts of cool functions like <code>union</code> which returns a Regexp object which will match all the patterns given as arguments. Doing that in Perl can be very messy. All in all Ruby regexp handling can look like Perl's but goes much further and gives you a lot more flexibility to do what you want in a clean and readable manner.

### Variables and nested data structures
First there are to important distinctions: perl use special symbols on variables to indicate variable type, $ for scalars, @ for arrays and % for hashes. Ruby uses (fewer) symbols for indicating variable scope, namely $ for global variables, @ for instance variables, and @@ for class variables. For local variables you do without a sigil. But the more interesting point here is the syntax for defining nested hash tables and arrays in combination with these.

defining an hash of arrays in Perl:
```perl
my %hash = ( 'key' => [ '5', '3', '1' ] );

#or as a reference directly

my $hash =  { 'key' => [ '5', '3', '1' ] };
```
{: class="full-bleed font-highlight"}

and in Ruby

```ruby
hash =  { 'key' => [ '5', '3', '1'] }

#or with symbols as key

hash = { :key => [ '5', '3', '1'] }
```
{: class="full-bleed font-highlight"}

Quite similar. But when we want to access the inner hash and use that one directly, for instance in a sort, look what happens when we have to de-reference the array ref inside the hash:
Perl:
```perl
my %hash = ( 'key' => [ '5', '3', '1' ] );
@sorted = sort @{ $hash{'key'} };

#or with custom block for sorting reverse

@sorted = sort { $b <=> $a } @{ $hash{'key'} };
```
{: class="full-bleed font-highlight"}

Ruby:
```ruby
hash = { :key => [ '5', '3', '1'] }
sorted = hash[:key].sort

#or with custom block for sorting revers
sorted = hash[:key].sort { |a, b| b <=> a }
```
{: class="full-bleed font-highlight"}

Much less noise in the ruby version and I can certainly see that the Perl version, which wouldn't be regarded as line noise at all to seasoned Perl programmer, could look intimidating to a java programmer. But the ruby way is more elegant. And it's all about perception.

### Block syntax
While we're at it, let's look at block syntax. This is not so much a noise issue as a power issue which also contributes to cleanliness in the code. Ruby's block syntax with parameters as we saw in the previous example can be used for all sorts of cool things. A block is also an object in Ruby, which it isn't in Perl.

```ruby
hash = { :b => "foo", :a => "bar" }

hash.each { | key, value | puts "#{key}: #{value}" }

# or a multiline do..end block

hash.each do | key, value |
  puts "#{key}: #{value}"
end
```
{: class="full-bleed font-highlight"}

Let's take an example comparing <code>map()</code> from Perl and <code>Array.map</code> in Ruby (including quoting array values to clean things up a bit in both Perl and Ruby).

```perl
@array = qw(a b c d e f);

#transform array to ASCII value for the elements
@chars = map { ord } @array;
```
{: class="full-bleed font-highlight"}

```ruby
array = %w{a b c d e f}
chars = array.map { |x| x[0] }
```
{: class="full-bleed font-highlight"}

In this example the Perl version looks cleaner to me, but it will fail spectacularly when you need more than one parameter into the block. Ruby handles any number of block arguments, while Perl only has the one value from the data structure you're mapping. This makes the <code>Hash.each_pair</code> (with a block) very useful in Ruby while you cant really do the same without either using a <code>foreach</code> on the keys or values or using map() on the keys and accessing values in the block. If you need both the key and the value inside the block that is. More code and less elegance.
 ### Closing points


Ruby's do..end syntax generally cleans up the language a bit, since this is in use for modules, classes, methods and blocks. Perl has only {} and this combined with other brackets and special characters can induce noise.

Combination of block or loop syntax with pattern matching can give a noisy appearance.

```perl
@array = ( [1, 2, 3], [4, 5, 6], [7, 8, 9]);
map { push @joined, sort { $b <=> $a } @{ $_ } }  @array;
```
{: class="full-bleed font-highlight"}

and in ruby:
```ruby
array = [ [1, 2, 3], [4, 5, 6], [7, 8, 9] ]
joined = Array.new
array.each { |x| joined.push(x.sort { |y,z| z <=> y }) }
```
{: class="full-bleed font-highlight"}

Still not all that bad to a Perl hacker, but still.

Ruby OO strictness saves you a lot of typing if you're comparing to old school Perl OO. Moose takes much of that away nowadays.

Ruby's policy of optional parenthesis both on most method calls and if-statements removes some line-noise factor but can be less readable to the untrained eye. But you get used to it pretty quickly.

 
