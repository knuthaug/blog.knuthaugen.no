---
layout: default
title: All About the code
---

<div class="hero display-grid">
<div class="posts display-grid">
  {% for post in site.posts limit:10 %}
    {% if forloop.first %}
     <article>
     <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
      </article>
      <section>
      <h3>Other recent posts</h3>
      <ul>
      {% else %}
      <li><span>{{ post.date | date: "%Y-%m-%d" }}</span> <a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endif %}
  {% endfor %}
  </ul>
  </section>
</div>
