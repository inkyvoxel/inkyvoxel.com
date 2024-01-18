---
title:  Software engineer, team lead, and cybersecurity enthusiast.
description: I write about software engineering, leadership, and cybersecurity.
layout: page.html
---

{% for post in collections.post reversed %}
<h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>

{{ post.date }}

{{ post.data.description }}
<hr>
{% endfor %}