---
layout: post
title: "Deploy Overlay in Metric Graphs"
published: true
tags: [devops,metrics,graphite,deploy]
---
{% include JB/setup %}

I got a question about this setup on twitter and I thought I'd explain this is in a blog post instead of 140 char twitter messages (which is a pain). 

We do quite a lot of metrics in our apps, which are nice for debugging and seeing what is going on. But one thing we have found very handy is to see when deploys to production happen (and they can happen up to 5-10 times a day in various apps, so without a graph it can be very hard to see which deploy made the response time shoot through the roof, or the rate of 500 errors skyrocket. 

We use graphite to collect the metrics which are most often sent via the [dropwizard metrics framework](https://github.com/dropwizard/metrics) (which is excellent) and [Grafana](http://grafana.org/) to present pretty graph dashboards to the user. 

First step is to record the deploy. Fromt the deploy scripts, each production deploy runs this little command:

{% highlight bash %}
DATE=$(date +%s)
echo -n "deploys.${NAME} 1 ${DATE}" | nc -w 1 -u $graphite-host 2003
{% endhighlight %}

Where NAME is the app name, the value sent is 1 and then the timestamp. 

Second we use the annotations feature in grafana which makes it easy to toggle this on and off to draw vertical lines for all timestamps where the value is 1. In raw graphite, this is the drawAsInfinite() function. The nice thing grafana adds here, is mouseover boxes with more info. The result looks like this:

<img src="../../../images/deploy-overlay.png" width="800" height="404" alt="Deploys overlaid on 4xx responses graph"/>

The mouseover is the killer feature and shows us that the app orwell was deployed ad 2015-09-09 15:36. If this deploy had caused a spike in the grap, it would be immediately visible. This has saved us a lot of digging on more than one occasion not to mention alerted us to the fact that somebody (which shall remain nameless) introduced javascript which double the page rendering time of our front pages :-).

For more info about or metrics appproach, see my earlier [post on the subject](http://blog.knuthaugen.no/2013/10/the-metrics-initiative/). 
