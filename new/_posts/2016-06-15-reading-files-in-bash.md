---
layout: post
title: "Reading Files in Bash"
published: true
tags: [bash, files, unix]
---

I came across a small but interesting difference in ways of reading files in bash, and specifically processing a file line by line.

I had a small function to read property files and splitting each line in a key and a value and suddenly a bug cropped up. This worked fine when reading existing property files. But when introducing a space right of the =, it failed. It made two "lines" out of "foo=bar zoot", while one line out of "foo=bar".

{% highlight bash %}
for line in $(< ${file}); do
echo ${line}
done
{% endhighlight %}

It's our old friend IFS (internal field separator) at work here, with its default value of "<space><tab><newline>" in bash. So we unset it and bob's our uncle.

{% highlight bash %}
prev_ifs=${IFS}
IFS=''

for line in $(< ${file}); do
echo ${line}
done

IFS=${prev_ifs}
{% endhighlight %}

(It's nice to preserve the value of IFS and reset it after you're done. If you'r in a function you can of course local it instead)

This code works fine without any IFS twiddling, though:

{%highlight bash%}

while read -r line; do
echo ${line}
done < "$file"

{% endhighlight %}

There are manny more ways to read files in bash of course. The lesson is of course that I should have tested this better when I first wrote it :-)
