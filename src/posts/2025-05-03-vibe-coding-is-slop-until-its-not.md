---
title: Vibe coding is slop until it's not
description: AI-assisted coding is a chaotic ride where code feels wrong, until it magically works.
tags:
  - software-engineering
---

There's a strange feeling I get when using an LLM to write code. One moment, I am squinting at my screen because it's churned out a messy pile of slop that doesn't work. The next prompt, it's handed me a perfectly fine function that would have taken me 20 minutes to write myself.

At first, I didn't trust it. To be honest, I still don't 100% trust it, at least not for production code. What LLMs generate is often just about good enough to fool me into thinking it's correct. But dig a little deeper and I often find it's missing something.

Nothing a few more prompts won't fix, right?

That said, LLMs are brilliant for prototyping. I've used them to sketch out ideas that began as half-baked thoughts in my head. They're also really good for churning out one-off SQL queries and shell scripts.

Lately, I've been experimenting with agent-style tools, like what the GitHub Copilot plugin provides in VS Code. I find it exciting watching it make changes to my projects (especially for monotonous tasks), and watching it think out loud. It's not flawless, and I often find myself having to undo changes, but it gives a glimpse of where things are heading.

The other day, just as an experiment, I asked Copilot to refactor a large project built with `create-react-app` (now deprecated) to use Vite and Vitest. This task has been sitting in our backlog for a while, but the team hasn't had time to tackle it. I figured this might be a perfect job for an AI agent.

It took about 30 minutes, with a few follow-up prompts. In the end, the project compiled and mostly seemed to be working, but unfortunately all automated tests were failing, and neither I nor Copilot could figure out why. For something like this, I still think it would be better for an engineer to take the time and do a proper job over a few days, and I wouldn't hold it against them if they used LLMs along the way.

Some engineers I know are still a bit sceptical about LLMs. They're hesitant to trust the tools even for minor changes, or they think using them is cheating. I understand that. No one wants to feel like their expertise is being replaced by an autocomplete robot. But honestly, I think those who aren't experimenting with AI-assisted coding right now are going to fall behind. I don't think LLMs are a passing trend. I think they are a genuine shift in how we write software.

## Closing thoughts

Vibe coding might feel like slop today, but it's improving fast. LLMs already make prototyping easier. This isn't the end of thoughtful engineering. LLMs are just another tool. Embrace the tools and figure out where they shine. The future's arriving whether we like it or not.
