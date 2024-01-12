---
title: Software engineer, team lead, and cyber security enthusiast.
layout: layout.html
---

{% for post in collections.post %}
<h2>{{ post.data.title }}</h2>
{{ post.data.description }}
{% endfor %}