--- 
layout: post
title: Creating Craftsmen And a Craftsmanship company
mt_id: 15
date: 2009-10-25 18:04:28 +01:00
tags: [craftsmanship, agile]
---

How does one go about creating software craftsmen in a company and more how does one create/transform a company to make this possible? These are the questions and thoughts I found myself with after attending an open space session at <a href="http://smidig2009.no/">Smidig 2009</a> (the Norwegian Agile conf).

Perhaps the most known craftsmanship consulting firms are Obtiva and 8th Light, both located in Illinois USA (one on Chicago and the other in Round Lake). They are, as far as I know, created specifically to a have a master and apprentice model and takes this to extremes. Their <a href="http://obtiva.com/news/2009/06/15/06-09-obtiva-and-8th-light-swap/">craftsman exchange</a> is a fine example of this, where senior consultants got to piggyback the other firm's people on real world projects for a week, just to learn from them on how they build software and how they run their company. They also hire programmers with the title of apprentice and one account of being an apprentice at 8th Light is found in this blog. Not bad to commit JRuby code while formally being and apprentice. I especially noticed the part about being specific (coding) challenges and the getting feedback from not just one but all masters in the firm. I suspect the amount of condensed learning is formidable. But does this approach work when you trying to transform a "normal" consultancy firm into something more craftsmanship friendly?

Let's examine some other tools to use, more tuned in to (Norwegian) consulting firms and companies that do not have this in place now, but rather have their hands full with competing and hanging on to clients. What should one do?

### Organic interest groups

Mike Cohn explained in Oslo XP meetup talk recently Google's model of special groups within the company forming horizontally across projects. <a href="http://softwareapprenticeship.wordpress.com/">A talk</a> on the same subject at JavaZone 2009 in Oslo discussed the same idea employed in <a href="http://www.knowit.no/">KnowIT ObjectNet</a>, a consulting firm in Oslo, Norway. They even have a cooperation with the Simula Research center on finding out what actually works best.The important bits are:

- Voluntary membership based on interest (Google, KnowIt)
- Each person can join many groups (KnowIt)
- Organic growth bottom-up is preferred, but it should be allowed to transform into more formal groups over time. (Cohn)
- Given a mandate to change practices (google, KnowIt)
- Communicate the results

This is a key issue. People need to have a forum to evolve their skills outside of the current customer project, which in many cases isn't well suited for that, deadlines and all. Learning a new language, which in my mind brings with it a lot of benefits especially when learning one from another paradigm than one is used to, is best done outside the creation of enterprise code under time pressure. Besides, one needs room to experiment and fail. Demanding some kind of output from the work is important to keep it in check and make the group prioritize and work toward a goal, not to mention to disseminate the knowledge gained to non-members and even the development community at large.

Reports, internal or external talks or patterns &amp; practises changes are some types of outputs. In the concrete case of KnowIt, the groups were allowed to bring in outsiders which in one case created a cooperation with the Norwegian Scala user group ScalaBin. A good example of an activity that is of value to the entire community, not just the company itself. And I would argue that a good software development community is an important factor in creating good companies and good developers.

This should work well for consultancies in my opinion. People need some time off the project to keep in touch with the company and what better way than to spend it doing research on a hot topic that may bring in future clients? KnowIt also found that you need some hot topics to keep the juices flowing in the developers, but the company could put more regular topics to good use to. And it all depends on the people you have on board.

### Coaching

A new programmer fresh out of college, needs guidance to avoid stepping into balls of mud and re-inventing the wrong wheels. How do we accomplish this? Several thoughts emerged on the open space at smidig 2009. Pair programming is an excellent way of transfering knowledge from one head to another. There are a number of factors that <a href="http://blog.obiefernandez.com/content/2009/09/10-reasons-pair-programming-is-not-for-the-masses.html">need to be in place</a> for it to function properly, but done right can produce great results. For a consultancy it requires that a customer allows junior programmers to be put on the project team and the (at least perceived overhead) of mentoring them.

Concrete feedback and guidance while working on real-world problems was mentioned by several people and the rationale was that learning isn't as rapid or valuable in constructed problems. You need wet feet to really appreciate the boots you're getting. Code reviews can also be used to make novice programmers see the errors of their ways <i>and</i> seeing how it should have been done.

### Quality

Never compromise on quality. If a customer ask you to deliver the same features, only a little bit faster, say no. Plain old no. If you're doing it faster, you're cutting corners. You may not think you are, but you are. This requires backbone from both developers in the trenches and managers negotiating contracts.

Don't do overtime (at least not as a rule). You need sustainable pace. Burned-out developers make poor craftsmen and they need a life outside work. Besides, who has the energy to learn Clojure or contribute on open source projects if they spend all their time and energy on work? You need time off. Use it.

### Learning and teaching

At the core of it all is learning. Becoming a craftsman requires lifelong learning.The principle of Kaizen (from Lean) embodies what I think is the right path: small incremental learning each and every day, improving a small part of the workplace, your skills or your team. Big steps are much harder to do and get right.

Some other points regarding learning: some for the developer and some are for the company.

- Realise how little you know and be open to learn from everyone you meet.
- Always challenge your beliefs.</li><li>Always buy the books you want (and read them)
- Keep up with the trends
- Seek new challenges

### For the company:

- Allow consultants the time to develop
- Nurture a culture of learning and improve the company in small increments, not just the people. Kaizen all the way.
- Allow for mistakes and but ensure learning from them, both individually and as a group.

And remember: you can't expect to change other people, you can only change yourself. A craftsman shares his knowledge with others and tries to make the community around him grow with him. Give talks at conferences, user groups or inside you company. As a company, encourage developers to give talks, give them time and resources to do so. Follow up on it. Spread the word. Nothing forces you to know your stuff quite like giving a talk on it to an audience. Scary but rewarding.

### Tools

A craftsman needs to know the tools of the trade and to use the right tool for the right job. This is mainly a skill one gets through experience. But the right kind of experience - a varied one. This is the consultants world and consultants are in better shape than most in-house developers when it comes to this. But learning a new paradigm or language will take you far in my opinion. Just the act of learning a totally different language, even though you just use if for toy projects, refreshes your perspectives on your "day-job" language. Especially if your job language is C# or java and you learn a dynamic language or a functional one. The perspective you attack problems with in your job language will change and change for the better. <br /><br />Knowing your IDE or other developer tools is essential, as is knowing and tweaking you platform. This means also that companies must let developers have full control over their development machine. The opposite actually still occurs. And not to mention: the developers need the sexiest hardware money can buy and plenty of screen real-estate.

### People skills

A craftsman need people skills. She needs to understand the customer and make the customer understand her. She needs to be a team player and know when to shut up and when to speak up. She must be responsible, honest and brave. How to achieve all this? Can introvert geeks manage these things? Well, some people will have to work more on it than others, but I feel the environment we operate in and the feedback we get, can develop many of the skills. Keywords are giving developers responsibility to make technical decisions, to work independently, embrace, encourage and reward team efforts, not individual efforts. Challenge their fears and push the limits of their comfort zone a bit, within reason. Careful not to push to hard :-)

And besides: The primary output of a software project is people, not customer value and software (paraphrasing Ward Cunningham). You are the sum of the work laid down. As an ending note: the book <a href="http://oreilly.com/catalog/9780596518387/">Apprenticeship Patterns - Guidance for the Aspiring Software Craftsman</a> by Dave Hoover</a> and Adewale Oshineye</a> is out on O'Reilly now and discuss a lot of this in depth (although I haven't read it yet).
