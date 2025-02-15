---
layout: post
title: Log4net, Windows Event Log and IIS Applications
mt_id: 36
date: 2010-12-17 07:56:37 +01:00
tags: [c#, iis, log4net]
---

I am doing a C# project at the moment where we are using [log4net](http://logging.apache.org/log4net/index.html) to log to the Windows event log. From the windows service this is straight forward but it turns out when you are trying to do this from an application running in IIS, a WCF service in our case, this is surprisingly hard. So I thought I'd document this one for later reference.

## Those Pesky Permissions

Just duplicating the config for a normal windows application doing perfectly good event logging isn't going to work as you will quickly discover. A good way to debug this is to set up a FileAppender to log to a temporary directory somewhere. Log lines ends up there when the config is read OK, but not in the event log. It's a permission thing. The user running IIS probably has got privileges to <strong>log</strong> to the event log, but not create the event source initially. Nor should it, since running IIS as a privileged user is security disaster waiting to happen. Don't do it.

The config used for logging in this example is this:

```xml
<log4net debug="false">
  <root>
    <priority value="INFO"/>
    <appender-ref ref="EventLogAppender"/>
  </root>
  <appender name="EventLogAppender" type="log4net.Appender.EventLogAppender">
    <applicationName value="My Application"/>
    <layout type="log4net.Layout.PatternLayout">
      <conversionPattern value="%date [%thread] %-5level %logger [%property{NDC}] - %message%newline"/>
    </layout>
  </appender>

</log4net>

```
{: class="full-bleed"}

## The Solution

Step one is to create the event source by hand as a normal user. You can do this via the following code in a C# app.

```c#
EventLog.CreateEventSource(source, "My Application")
```
{: class="full-bleed"}

Or do it from the command line using the <code>eventcreate</code> program

```xml
c:\> eventcreate /ID 1 /L APPLICATION /T INFORMATION /SO "My Application" /D "Dummy log message"
```
{: class="full-bleed"}

This gives you a "dummy log message" in the application log. And you should be good to go. But not so fast. Eventcreate requires an EventID between 1 and 1000. Default logging from log4net for some reason uses event id 0, which will give you an event log error message in the application log. It contains your log message but it looks like a mess. So how to persuade log4net to use event id 1, which we used when creating the event source?

There are two ways of doing this. One is to use the log4net extension log4net.Ext.EventID and configure it there. If that isn't your cup of tea, you can quite easily, although a bit hackish, do it directly in your code before any log messages are sent with this piece of code:

```c#
log4net.ThreadContext.Properties["EventID"] = 1;
```

For instance in a constructor or other suitable initialization code.
