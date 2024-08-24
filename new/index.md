---
layout: default
title: All About the code
---

# All about the code

<ul class="posts">
  {% for post in site.posts limit:10 %}
    {% if forloop.first %}
     <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
      <h2>Other recent posts</h2>
      {% else %}
      <li><span>{{ post.date | date: "%Y-%m-%d" }}</span> &raquo; <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
