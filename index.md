---
layout: index
title:
tagline:
---
{% include JB/setup %}
<ul class="posts">
  {% for post in site.posts limit:10 %}
    {% if forloop.first %}
     <h2><a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.content }}
      <h2>Other recent posts</h2>
      {% else %}
      <li><span>{{ post.date | date: "%Y-%m-%d" }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
{% endif %}
  {% endfor %}
</ul>


