---
title: Software engineer, team lead, and cybersecurity enthusiast.
layout: layout.html
---

{% for post in collections.post reversed %}
<h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>

{{ post.data.date }}

{{ post.data.description }}
<hr>
{% endfor %}