---
layout: default
title: Post archive
---

{% assign startYear = 2025 %}

<div class="hero display-grid">
  <div class="posts">
    <h2>2025</h2>
    <ul>
    {% for post in site.posts %}
        {% assign year = post.date | date: '%Y' | plus: 0 %}
        {% if year < startYear %}
        {% assign startYear = year %}
        </ul>
        <h2>{{startYear}}</h2>
        <ul>
        {% endif %}
      <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
    </ul>

  </div>
</div>
