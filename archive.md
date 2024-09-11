---
layout: default
title: All About the code
---

<div class="hero display-grid">
 {% for post in site.posts %}
     <article>
     <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <div class="date">{{post.date | date: "%B %e, %Y" }}</div> {{ post.excerpt }}
       &raquo; <a href="{{ post.url }}"> Read the article</a>
    </article>
  {% endfor %}
</div>
