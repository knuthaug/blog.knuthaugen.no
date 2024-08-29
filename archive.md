---
layout: default
title: All About the code
---

<div class="hero display-grid">
<h2 class="margin-bottom-medium">Post archive</h2>
{% for post in site.posts %}

<div class="display-block"><span>{{ post.date | date: "%Y-%m-%d" }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a></div>
{% endfor %}
</div>
