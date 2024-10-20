---
layout: post
title: Naming Classes and Interfaces
mt_id: 29
date: 2010-04-16 08:45:58 +02:00
tags: [java, c#, naming]
---

<p> The naming of interfaces and corresponding implementation classes in languages that use them (of which Java and C# is the most used I guess) is a subject of sometimes heated debate. A growing distaste of the "best practice" (at least on Microsofts part) of using a capital "I" on interfaces prompted this rundown and a round of pro et contra. My ultimate goal is readability of code but a slight predicament emerges when considering a team: if the majority of team members are used to one particular convention is that, in that particular context, more readable <em>for that team</em> than another approach, all other things being equal? Even though the name of the interface reads more like natural English? The jury's still out on this one. 
</p>

The different patterns I've found:

- Interfaces are prefixed with a capital I, where `IReportGenerator` is the interface and e.g. `ReportGenerator` is the implementation. Some argue for making the interface name read "I generate reports" and keep the I prefix, thus: `IGenerateReports` instead.
- Ditching the capital I and appending "imp" or "impl" to the implementation. Like so: `UserManager` and `UserManagerImpl`. Some use uppercase or lowercase "c" as prefix for concrete classes too but I find that horribly ugly, to be frank.
- Naming an interface for it's role and naming the implementing class(es) for what distinguishes it from (possibly) other implementations. E.g. `UserManager` for the interface and `DatabaseUserManager` or `LDAPUserManager` for the concrete implementations.
- Naming abstract class with the word "Abstract" as a prefix to make a distinction for abstract and concrete classes. Possibly combined with other conventions for interfaces as well. I would argue the context often reveals an abstract class to the reader.

### C# vs Java

In C# the extension of an abstract base class <em>and</em> the implementation of an interface uses the same syntax and which one it is isn't always easy to discern. A naming convention makes this a bit easier:

```c#
public class DatabaseUserManager : UserManager {

}

//versus

public class DatabaseUserManager : IUserManager {

}

```
{: class="full-bleed"}

javas different:

```java

public class LDAPUserManager implements UserManager {

}

//versus

public class LDAPUserManager extends UserManager {

}

```
{: class="full-bleed"}

<p>
The need for a prefix for readability is less needed in Java, compared to C#.
</p>

### Good names trumps conventions?

<p><a href="http://www.amazon.co.uk/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882">Clean Code</a> by Robert C. Martin argues for good names: good names for variables, good names for methods and good names for interfaces and classes. The name should reveal intention. <i>Choosing good names takes time but saves more than it takes</i>. (Clean Code, page 18). The book also mentions not using the "I" prefix and prefers to encode the implementation, if at all.  </p>
<p>The question is: if the names are as good as they can be, do we need a prefix or suffix or other kinds of encoding to indicate the type? In my mind we don't. I find that the I hurts readability and the "impl" certainly doesn't look good to me. So how to choose good names?</p>

- Classes should have noun names or noun phrases, e.g. `Customer`, `Policy` or `StreetAddress`.
- Use name from the problem domain. E.g. If you're dealing with a customer or client object. In a medical system, should it be called `Patient`? Or if it's dealing with social benefits maybe `BenefitsReceiver` is a better name? The domain influences the choice of names. In stock-broking perhaps the name `FuturesHolder` is name candidate for a special kind of customer? (note: I'm not very familiar with either of these domains so the examples may be somewhat off. You get the point: know your domain and find good names from it.).

- Use names from the solution domain. If you use e.g. the <a href="http://en.wikipedia.org/wiki/Visitor_pattern">Visitor pattern</a>, make it a part of the name(s) so other programmers see it
  `InsuranceCustomerVisitor` is better than `CustomerTraverser`

<p>So unless some team coding standard absolutely makes me (and that is, I'm afraid, likely) I will not in the future prefix my interfaces with I and not adorn my implementations with c, impl or any other stuff. Just meaningful, names from the domain. Easier to write and easier to read. </p>

<p> Lastly, I posted this question on twitter and
<a href="http://twitter.com/borud">@borud</a> made the comment: "the only useful information conveyed by an I-prefix to interface types is information about the author of the code." That's a suitable end note I think :-)
</p>
