---
layout: default
title: All About the code
---

<div class="hero display-grid">
<div class="posts">
  <div>
  {% for post in site.posts limit:6 %}
     <article>
     <h2><a class="no-prerender" href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
    </article>
  {% endfor %}
  </div>
</div>
