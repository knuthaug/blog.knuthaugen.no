--- 
layout: post
title: The shunting yard algorithm kata
mt_id: 9
date: 2009-09-15 10:21:26 +02:00
---
 After attending a <a title="Code dojo randori" href="http://dojo.wikidot.com/randori">code dojo randori</a> with the <a title="Oslo XP meetup" href="http://xp.meetup.com/13/">Oslo XP meetup</a> where we worked our way about half-way through the kata for the <a title="Shunting yard algorithm" href="http://en.wikipedia.org/wiki/Shunting_yard_algorithm">Shunting yard algorithm</a>, I decided to have a go at finishing it completely in Java (which I am quite rusty at) and the trying it in Ruby (at which I am a total newbie) and examine the differences. Especially Javas somewhat sketchy regexp support was something that annoyed me, and Ruby excels at that part.

The Shunting yad algorithm is an algorithm for transforming infix notation to reverse polish notation, often used for arithmetic expressions and takes operator precedence and associativity into account. 
