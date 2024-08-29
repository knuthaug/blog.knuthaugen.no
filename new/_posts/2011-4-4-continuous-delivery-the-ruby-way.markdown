---
layout: post
title: "Continuous Delivery I: Pipeline Plugin and a Ruby Project"
mt_id: 38
date: 2011-04-04 17:57:44 +02:00
tags: [Ruby, Continuous Delivery]
---

I have been reading the excellent book [Continuous Delivery](http://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley/dp/0321601912/) by Jez Humble and Dave Farley and been dying to try out some of it in practice. Since work these days is filled with big not-so-easy-to-change java legacy systems, a small greenfield ruby project was the way to go.

This article ran long, so it is split into three parts:

- part I (this part): Jenkins setup and project setup.
- part II: [Ruby Smoketest Implementation](http://blog.knuthaugen.no/2011/04/continuous-delivery-ii-smoketests-in-ruby-and-rails.html)
- part III: Further Build Steps

My aim was to deploy the Ruby on Rails project to [heroku](http://heroku.com/) which is a nice and easy-to-use cloudy service for hosting ruby apps. Elegant and easy on both web interface and command-line tools.

### The Project Setup

The project I just started is a Rails3 app using bundler and running in ruby 1.9.2 using [rvm](http://rvm.beginrescueend.com/). This, it turns out, brings some special considerations to the mix. Just for kicks and because I start to dislike SQL databases more and more, especially for the cases where you don't really need it, I use MongoDB and Mongoid as the ORM. MongoDB is supported by Heroku so all's good there.

One gotcha it is easy to run into with Heroku and a rails app is that you should have your rails app be at the top level of the git repo. It is supported to run with a rails app in a sub directory, as I did, and you can configure it to work via the <code> config.ru</code> file, but bundler does not seem to run well on heroku when you do that. So keep the rails app on the top level if you can.

The projects uses [rspec](https://github.com/rspec/rspec) for unit tests and some rails-specific integration/functional tests, and [cucumber](http://cukes.info/) for end-to-end acceptance style tests. More on that when it comes to the deployment pipeline and jenkins project setup.

### Jenkins Setup

I belong to the school that dictates that the first thing you should do with a project is to deploy it and then setup CI for it and make _that_ deploy for you.
The rake plugin for Jenkins supports rvm so we can use rake tasks directly on the project configuration.

First of all, I needed cucumber and rspec to output junit format test results to make pretty graphs and record status in Jenkins. Cucumber has a handy <code>--format junit</code>, but rspec does not. Luckily the gem <code>ci*reporter</code> does the trick for us. But some customs rake tasks are in order. This is the file \_lib/tasks/jenkins.rake*:

```ruby
namespace :jenkins do
  def cucumber_report_path
    "reports/features/"
  end

  def rspec_report_path
    "reports/rspec/"
  end

  Cucumber::Rake::Task.new({'cucumber'  => ['db:test:prepare']}) do |t|
    t.cucumber_opts = %{--profile default  --format junit --out #{cucumber_report_path}}
  end

  task :cukes_report_setup do
    rm_rf cucumber_report_path
    mkdir_p cucumber_report_path
  end

  task :spec_report_setup do
    rm_rf rspec_report_path
    mkdir_p rspec_report_path
  end


  task :ci => [:report_setup, 'jenkins:setup:rspec', 'rake:spec', 'cucumber']

  task :unit => [:spec_report_setup, "jenkins:setup:rspec", 'rake:spec:lib']

  task :functional => [:cukes_report_setup,
                       :spec_report_setup,
                       "jenkins:setup:rspec",
                       'rake:spec',
                       'cucumber', ]

  namespace :setup do
    task :pre_ci do
      ENV["CI_REPORTS"] = rspec_report_path
      gem 'ci_reporter'
      require 'ci/reporter/rake/rspec'
    end
    task :rspec => [:pre_ci, "ci:setup:rspec"]
  end

end
```
{: class="full-bleed"}

It does some setup of of report output directories, some setup of ci_reporter in the :setup task and makes sure rspec tasks does some setup first. The tasks called from jenkins are jenkins:unit for the first build step and jenkins:functional for the second step. The jenkins:ci task is an all in one if that's your bag. The main point is that the first step runs unit test, hence rake:spec:lib only, and the second step runs all tests and metrics. Ideally if the metric_fu plugin in Jenkins had supported bundler well, I would like to run some metrics in the first step and fail the build if values where below or above a limit. But that does not seem to fly easily.

I used a small shell script to deploy to Heroku and the test server instead of using the git publisher plugin. This is to make the deployment build step fail the build. The git publisher plugin is run as a post build action and this won't fail the build. Likewise, the smoke test script needs to run as a build step since the recording of test results is done post build.

And here's where the ideals of Continuous Delivery (CD) kicks in. The book advocates doing the build in several steps and the central point is fast feedback. The first step is compile, fast-running unit tests, metrics and building of artifacts (if you're on a platform that does that). And if all that passes should you go on to step two using _the same artifacts_ created in step one, possibly aided by a repository manager of some sort to take care of the files in between steps.

If the first step fails you get unit level and metric violations feedback. If the second fails, you get system level functionality feedback. If later steps involving e.g. performance testing and manual testing you get feedback on those. But you don't go to that step with a bad build from step one.

The [build pipeline plugin](http://code.google.com/p/build-pipeline-plugin/) basically gives you a view and a(nother) way of specifying upstream/downstream projects. The view looks like this after it is configured according to [this article](http://www.wakaleo.com/blog/312-build-pipelines-with-jenkinshudson) with the four build steps in place.

<img src="/assets/images/jenkinspipe.png" width="600" height="228" alt="Jenkins pipeline" class="mt-image-none" style="" />

The build pipeline plugin is in version 1.0.0 and has some major drawbacks. The main one being that it doesn't stop the pipeline when one step fails. This is a bug and it has been reported on the issue tracker already. I would guess this is fixed in the next release. Another is that it does not seem to be easy to pass params from one build step to the next. There has been some mention of using the parameterized build plugin for that, but haven't had a chance to test it yet and I don't know how well the two plugins play well together.

### The Build

So in my case, the first step runs unit tests (spec:lib) and the second runs all spec, cucumber features and metric_fu for metrics. The third step deploys to my local test server and runs an automated smoke test. See part II for details on the implementation of that. The output is in junit format, so Jenkins records it and outputs it along with the other tests. If that test brake, the build in step 3 brakes too. I would like to rollback to the previous version on build failure, but I'm not there yet. [This article](http://casperfabricius.com/site/2009/09/20/manage-and-rollback-heroku-deployments-capistrano-style/) on using capistrano looks interesting in that regard

The fourth step deploys to heroku via a script and runs the same smoke test as the step before.

### Benefits and Ending Thoughts

The biggest benefit of using a pipeline is more fine grained feedback on the build process. The compile step is fast and fails almost immediately. The separate steps for integration tests and deployment to test server and heroku gives more accurate feedback on those steps too. I mean, combining deployment to test and production in a single step would be nonsensical. And you can do the deployment to production (or test) a manual one, which the plugin supports. For instance only after manual testing in the test environment. Combined with Jenkins' matrix style security model you can grant access to certain users for running that build step. There are a lot of possibilities and I will be exploring more of them in part three of the series. Part two is implementation of the smoke tests in ruby.


