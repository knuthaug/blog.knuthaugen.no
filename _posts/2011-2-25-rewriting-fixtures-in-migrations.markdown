--- 
layout: post
title: Rewriting Fixtures in Migrations?
mt_id: 39
date: 2011-02-25 13:29:31 +01:00
tags: [Ruby, Migrations]
---
I had an idea in a twitter discussion with [@olecr](http://twitter.com/#!/olecr) about automating different aspects of the development process, coupled with and in-house discussion at work on maintaining database test data for integration tests, which can be a real pain. How about hooking into migrations to rewrite/update fixture data when migrating database schema?

In ruby one approach to test data, is to use fixtures, often written in yaml, to define test data sets, which gets inserted into the test database before running tests. But you still have to evolve the fixtures when the schema evolves. And the more often it changes, the more of a maintenance nightmare you got on your hands. Other approaches can be to have object factories that create data in the database, or SQL script that gen run (which is what yaml fixtures are, only in a more sane and not-so-verbose format). But the maintenance is there no matter what the approach. 

And then the idea struck me: if you use fixtures for inserting test data into the database before running tests (or between tests) and migrations to modify the schema of the database as you develop the application, couldn't you create a clever hack that modifies the fixtures to match the migrations? All in one operation? And you can minimize the manual maintenance to the stuff that is really hard to automate and to sanity check to results.

Yaml is machine-readable format, so one approach could be to read the migrations, find the diff for the migration in question, read the yaml fixtures, modify them and write them out again. In ruby/rake this could be some custom rake tasks that squeezes in with the migrations or something to that effect. 

I would think this could work for things like deleting columns from a table (delete that key in the yaml file), adding new columns (add columns in fixture with dummy value according to data type) and column and table renaming. Some user edits would be necessary nonetheless.

What do you think? Viable idea or just plain stupid?

The logical next step of rewriting the test code using these fixtures to match the new schema, well I leave that as an exercise to the reader... :-)

 
