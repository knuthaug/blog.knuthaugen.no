--- 
layout: post
title: Systems Thinking applied to software development
mt_id: 23
date: 2010-01-05 22:29:50 +01:00
---
 I have watched [some](http://www.vimeo.com/4670102) [talks](http://www.infoq.com/presentations/rethinking-lean-service) by John Seddon on Systems Thinking and where he feels Lean has failed. Seddon's focus is service organizations in public and private sector like health-care and customer support and sales for various products. But how would systems thinking apply to software development? Have we got it all wrong? I'm going to try and map some of the ideas of Systems Thinking over to existing software development methodologies and practices and see where we end up.

### Systems Thinking in a nutshell
Systems Thinking is about seeing the organization as a system and studying it as a system from the view of the customer. Some core ideas summarized:

1. The only plan for changing an organization is to get knowledge
2. Study demand going into the system
3. Differ between failure demand (bug reports, wrong feature and other sources of rework) and value demand (new features/contracts/projects). 
4.  Study the variability and predictability of the failure demand. Only what is predictable is preventable. Take steps to prevent failure demand
5.  Peoples behavior is a product of the system in which they work. If you want to change the people, change the system
6. Train people to handle the incoming requests and let them pull help on the things they don't know how to solve. 
7. Don't standardize the work
8. Give the workers the means to control the work and the power to change it. 
9. Measure the actual value delivered to customers. 
10. The best way to learn counter-intuitive truths is to see and experience them for yourself

The goals are of course to deliver maximum value (the right features at the right time to solve the right problems) to customers in the shortest time frame possible. Sounds familiar? Read on for more in-depth discussion on each of the items in the list.
 
### Get Knowledge

This very much applies when you're going to change a team or an organization, but how about the isolated act of writing software? To achieve a successful software project we have to *know what the customer wants and needs* and more importantly *deliver that*. So *study* the clients needs and the client's process and find out what they actually need. For, as many has experienced, what they say they need and what they actually need isn't necessarily the same thing. And maybe Seddon's idea of following the work is applicable to us as well? Actually manually following the work process one is trying the improve or eliminate with a software system. I don't think we as an industry do this well enough.  And we must be prepared for the possibility that the answer might be "we don't need the software system after all". Scary for consultants I know, but what is more important: solving the problems of the client/company/society/world or making money?

This also applies when trying to improve a software development process. Seddon advocates actually seeing and experiencing the flow of work in a process instead of merely performing a [value stream mapping](http://en.wikipedia.org/wiki/Value_stream_mapping) as kanban/lean advocates sometimes mention. Actually walk with the work item as it passes through the various stages of development and into production. And better yet, if the managers involved need some hard lessons - bring him/her along to see for themselves where the pain points lie. How can we change a development process if we don't know how it actually works? So 1) start with studying the process you're trying to change, follow the flow of work and then see what tools can solve the problems. 

### Study Demand

I see failure demand as more or less all the stuff developers hate and frustrates them: bug reports, wrong features (not what I *really* wanted etc. ), bad performance, instability etc. All sources of [re-work](http://www.thefreedictionary.com/rework). To avoid re-work makes programmers happier and more productive as well as improve the steady flow of new features through the process. Value demand on the other hand are all forms of new work: feature requests, new contracts and other forms of new work. What is more fun: fixing your colleagues bugs ore creating new features? We all know the answer to that one, don't we? 

And most important of all: identify the preventable forms of failure demand (is some classes of bug reports preventable by using a different testing strategy or development methodology? How can we change the architecture to avoid instability etc). Choose the right tools to prevent as much as possible of preventable failure demand and the value demand will increase by itself. Seddon's point is that it is futile to try to maximize the value demand without dealing with the failure demand. You're merely sub-optimizing. I'm not aware of any methodology that has a focus on this but I would like to hear from you if know. 

### Change The System

In Deming's words, if you work on the people you work on the 10%, and if you work on the system, you work on the 90% as people's behavior is a product of the system. In my mind this shows how important the right development methodology is for the productivity of the team and the people in it. But the methodology must suit the software your are developing, the risks involved and to a certain degree the people involved. Because programmers can be a tricky bunch :-) Systems Thinking also advocates putting the workers in charge of changing the work. This maps directly to the idea of self-organizing teams discussed in most agile methodologies like Scrum, XP and Kanban. I think this is an important idea and strict top-down management of development teams should be a thing of the past. And whatever methodology you pick as a _starting point_ for a project, never stop adapting it and improving it. Borrow and steal ideas, cheat or whatever improves the value you deliver. 

### Training the Worker

Seddon's arguments come from the front-office workers in service organizations, but it maps well to software development teams in my view. You need developers trained to handle the kind of work that the projects deals with, but not everyone needs to handle all aspects of it. This closely relates to the idea of cross-functional teams, collective ownership of the code and mentoring. Encourage developers to take on work items they don't necessarily have the knowledge to solve, but institute a system of asking for, and getting help on it. The best way to learn is to work together with someone who knows how to solve the problem. Pair-programming is great in this regard and I would say the fastest way to spread knowledge in a team and educate newcomers. Collective ownership of the code is a bonus. 

Important in this regard is also the culture on the team. This is not something one can simply declare. This is culture that has to be created and nurtured from the ground up.

The idea of software craftsmanship also comes to mind here, with established master-apprentice models in place for training new developers. I lighter version of this is a mentor/coach model working in the team with the new member and bringing that person up to speed. This transfers not only raw skill in the technology at hand but also the team culture and their way of doing things. A culture of learning is vital to a successful team in the long run and especially a team where people are replaced with some frequency. 

Another point is that programmer fresh out of college or university learns much faster by working with a mentor on a real-world project that working on made-up pet projects in the safe confines of a company. Because they learn the technical skills but also (and more importantly) the soft skills required when working as a programmer like talking to customers, discussing software design, formulating requirements (hey, sometimes clients can't do this) and just behaving around a lot of different kind of people.  

The concept of kaizen (continuous improvement) is also a part of this. Create a culture where people and process is constantly scrutinized and improved. As managers in Toyota  ([TPS](http://en.wikipedia.org/wiki/Toyota_Production_System)) have experienced: if a process isn't improving, it is degrading. And this in my view is true for technical skills and soft skills in people too. 

### Don't Standardize the Work

The closest analogy that comes to mind is coding standards, testing standards and the like and this is a tricky one. I don't readily think this should be done with without good reasons. Some have argued that the need for coding standards, both for syntax and design, is greater when using dynamic languages like Ruby, Perl or Python, than with statically typed languages like C# or Java. This is primarily because the tools enforce much less and the need for discipline is greater. The need also increase with the size of the team. 

I'm not ready to agree fully with this, but I can see a valid point. It also is a factor of the skill of the team members and what they perceive as beautiful/clean code and what is dirty. One developer's diamond can be another's turd - simple as that. Another point is this: a team left to self-organize and dictate their own work and *not* doing a good job at maintaining a clean code-base that supports re-factoring and addition of new features *need to be shown the path* by someone who knows how. And notice the "shown the path" part, not "showed forward on the path". 

I also think some fairly loose rules regarding "how we do it here" is worth having regardless of the technology involved. But the rules should come from the team, not from above. Company-wide standards can be very counter-productive especially when different technologies are involved in the projects.  

### Measure the Value Delivered

Kai and Tom Gilb have in particular [argued that agile methodologies aren't focused on delivering value](http://gilb.com/blogpost112-7-truths-about-Agile-and-Scrum-that-people-don-t-want-to-hear-Part-1-of-7-Wrong-Focus-) and measuring that value and I agree. Their [Evo](http://gilb.com/Project-Management) method for measuring business valyue address this. How can you know if you are actually delivering value to the customer when you're not measuring it? Evo has a lot of tools for this and I think it can be useful in many situations. A real-world case presented by Kai Gilb at a recent Oslo XP meetup meeting concluded with more focused development efforts and more precise features delivered for the same amount of money compared to the clients earlier experience. 

The concrete task of measuring the quantifiable value you are delivering is a good idea and it's the only metric actually being concerned about. Another important point from Seddon from service organizations is that you get the behavior you measure i.e. if you measure code coverage of the test suite, people will cheat to get a high coverage. And this does not mean good tests. This goes for all historical metrics that have been tried and failed in software development: lines-of-code produces, number of (unit) tests, work items etc. 

And as long as we're on the topic: what is the actual value of estimation? There are some values in experiencing how long a task takes and you often can get a head-start on designing and seeing potential future problems when talking and thinking about a feature. But this a product of talking and thinking about a feature, not estimating it! In many organizations management want estimates. But aren't they really after a commitment on what will be done at what time? Kanban practitioners often see this and use empirical evidence to determine how long something will take rather than predict it up front. A technique like a [cumulative flow diagram](http://open.bekk.no/2009/11/03/cumulative-flow-diagrams-with-google-spreadsheets/)  show you the time a work item take to clear the work process and if you have a fairly low variation in the size of the work items (you can control this) you use this to predict future deliveries. 

### Summary

I think the current software methodologies have something the benefit from the ideas of Systems thinking, but as Seddon himself argues against Lean we can't just take the ideas and run with them as they are primarily for a different domain (Lean for production and Systems thinking for public sector service organizations) but the we must adapt them to our field. As Seddon also advices when considering a tool:

1. Who invented the tool?
2. What problem was he trying to solve?
3. Do I have that problem?

Great advice in all walks of life. 
