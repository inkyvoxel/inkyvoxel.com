---
title: "I swapped my own Go template for Ruby on Rails"
description: After building Go Spark as my web app starter template, I rebuilt my idle game in Ruby on Rails with Kamal, and I'm not going back just yet.
tags: [software-engineering]
---

Back in June I wrote about [Go Spark](/go-spark-a-go-and-sqlite-web-app-template), my own web app starter template with all the bells and whistles I thought I'd need to build a web app. Auth, two-factor, passkeys, background jobs, Docker deployment. The whole foundation, ready to go.

Then I had an idea for an idle game, and Go Spark was finally getting used for something real. That was the plan, anyway.

## Where it started going wrong

I wasn't enjoying how the code was turning out. Nothing was broken, exactly. It just felt like there was a lot of plumbing to get anywhere, and the shape of the app wasn't emerging as quickly as the idea in my head was.

So I did the thing you're not supposed to do halfway through a side project: I started again, in Ruby on Rails, deploying with [Kamal](https://kamal-deploy.org/).

I am absolutely loving it.

## What Rails gives you for free

The uncomfortable realisation is that Rails just provides so much that it's hard for a little Go template to compete.

Go Spark tried to build a task queue system. Rails has [Solid Queue](https://github.com/rails/solid_queue), which is already there and already works. There's some irony here: Go Spark's SQLite-backed queue was inspired by Solid Queue in the first place, after I heard it ran on SQLite. I kind of copied the idea, and now I'm just using the original.

Speaking of which, Go Spark uses SQLite and so does the game. Rails works great with it, so I'm happy to stick with SQLite for now.

Go Spark had a Docker Compose deployment story of its own. Kamal makes deploying to my VM genuinely easy, in a way I didn't manage on my own.

Go Spark was deliberately frontend agnostic, which sounded principled until I actually needed a reactive UI. I was experimenting with HTMX and hadn't landed on anything I was happy with. Rails has Hotwire and Turbo, and it's just... there.

## Where Rails doesn't win

It's not a clean sweep. Rails has an authentication generator, but it only really gets you a login. I still had to build sign up forms myself.

Go Spark has TOTP two-factor, backup codes, and WebAuthn. I put a lot of thought into the security side of it, and that thought hasn't evaporated just because I've changed frameworks. That's the part I genuinely miss, and the part I'd have to rebuild if the game ever needs it.

## Claude Code has opinions too

Something I didn't expect: Claude Code works really well with Rails. It follows the existing patterns nicely, which makes sense when the framework has such strong conventions to follow in the first place.

It was doing an OK job with Go Spark, to be honest. Just OK.

Building with Claude means I spend far more time reading code than producing it, and I find Ruby easier to read than Go.

## Where I've landed

Ultimately, Rails is helping me build my web app faster than my own Go template was. That's the whole measure that matters for a side project, where the enemy is losing momentum before the idea gets built.

I'll try Go Spark on another project in the future to see how I get on with it. For now, I'm sticking with Rails for the game.

## The game

It's called Embershard. It's an idle game with MMO elements, inspired by Old School Runescape. It's in early stage development and it's playable at [embershard.com](https://embershard.com). Have a poke around and tell me what's broken.
