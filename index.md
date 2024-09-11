---
layout: default
title: All About the code
---

<div class="hero display-grid">
<div class="posts">
  <div style="grid-area: posts">
  {% for post in site.posts limit:6 %}
     <article>
     <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
    </article>
  {% endfor %}
  </div>
  <div id="category-sidebar" style="grid-area: cats"><h3>Categories</h3>
  {% for cat in site.categories %}
  <a class="cat-button" href="/{{cat[0]}}/">{{cat[0]}}</a>
  {% endfor %}</div>
</div>
