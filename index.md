---
layout: default
title: All About the code
---

<div class="hero display-grid">
<div class="posts">
  <div>
  {% for post in site.posts offset: 0 limit:1 %}
     {% if post.category == 'labs' %}
     {% continue %}
     {% endif %}
     <article>
     <h2><a href="{{ post.url }}">{{ post.title }} {{post}}</a></h2>
      {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
    </article>
  {% endfor %}
  {% for post in site.posts offset: 1 limit:5 %}
     {% if post.category == 'labs' %}
     {% continue %}
     {% endif %}
     <article>
     <h2><a class="no-prerender" href="{{ post.url }}">{{ post.title }}</a></h2>
      {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
    </article>
  {% endfor %}
  </div>
</div>
<p>There's more in <a href="/archive/">the archive</a>
