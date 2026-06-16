---
title: "Go Spark: a Go and SQLite web app template"
description: "Introducing Go Spark, an open source Go and SQLite web app starter template with secure authentication, TOTP two-factor auth, passkeys, and Docker deployment."
tags: [software-engineering, cybersecurity]
---

For a while now, I've been curious about what it takes to build a web app in Go. Not with a big framework, but the way the Go community often recommends: the standard library, plain SQL, and server-rendered HTML.

So I built [Go Spark](https://github.com/inkyvoxel/go-spark), an open source starter template for building web apps with Go and SQLite. You click "Use this template" on GitHub, run `make init`, and you get a working web app with authentication, two-factor auth, transactional emails, background jobs, and a Docker deployment setup, ready for you to build your actual product on top.

In this post, I'll explain why I made it and what's inside.

## Why I built it

Partly curiosity. I wanted to understand how all the pieces of a web app fit together when you're not hiding behind a framework: routing, sessions, CSRF protection, password hashing, email verification, migrations, deployment. Building it from scratch in Go turned out to be a brilliant way to learn.

But I also built it for myself. Every time I have an idea for a side project, I lose momentum rebuilding the same foundation: registration, login, password resets, email sending, Docker config. By the time the boring bits are done, the enthusiasm for the actual idea has faded. Go Spark is my answer to that. Next time I want to build something, the foundation is already there.

## What's included

Go Spark is intentionally boring technology, in the best way:

- **Standard library HTTP server** and `html/template` rendering. No web framework.
- **SQLite** with WAL mode and sensible connection defaults. No database server to run.
- **SQL-first data access** using [sqlc](https://sqlc.dev/) for generated, type-safe queries and [goose](https://github.com/pressly/goose) for migrations.
- **Complete email/password auth**: registration, login, logout, email verification, password reset, and email change.
- **Transactional emails** with a durable outbox and retrying background delivery.
- **Background worker** process with periodic cleanup jobs.
- **Structured logging** with `log/slog`, plus health and readiness endpoints.
- **Production deployment** with Docker Compose and Caddy for automatic HTTPS.

The philosophy is explicit code over framework magic. When something goes wrong, you can read the code and see exactly what's happening, because it's all just Go.

## Security as a focus

Security was the part I cared about most, and honestly the part I learnt the most from building.

Passwords are hashed with **Argon2id**, using the OWASP Password Storage Cheat Sheet's recommended minimum parameters as defaults (19 MiB memory, 2 iterations). If you've read my post on [password hashing in 2026](/password-hashing-in-2026), you'll know why I wouldn't settle for anything less in a new project.

On top of that:

- **Two-factor authentication (TOTP)**: users can set up an authenticator app via QR code, with one-time backup codes generated on confirmation.
- **Passkeys (WebAuthn)**: users can register passkeys for passwordless, phishing-resistant sign-in backed by their device's biometrics or security key.
- **Server-side sessions** stored in SQLite, with HTTP-only, SameSite cookies. No JWTs.
- **Session management**: users can see their active sessions and revoke individual sessions, or sign out everywhere else.
- **CSRF protection** on forms.
- **Rate limiting** on auth and account-sensitive endpoints to slow down brute-force attempts.

None of this is revolutionary, but having it all wired up and tested in a template means I (and hopefully you) don't have to get it right from scratch at midnight while excited about a new idea.

## Deploying it

Deployment is a single server running Docker Compose. There are separate `migrate`, `app`, and `worker` services, with Caddy in front as a reverse proxy handling TLS automatically. Because the database is SQLite, there's no separate database server to manage. Backups are essentially copying a file (the docs cover how to do this safely).

It's a deliberately simple deployment story: one cheap VPS, one `docker compose up -d`, and you're live. For side projects, I think that's exactly the right amount of infrastructure.

## A work in progress

I want to be upfront: Go Spark is very much a work in progress. No one is running it in production yet, including me. I built it because I wanted to learn, and because I want a solid starting point for my own future projects. There are almost certainly rough edges, and I wouldn't call it production ready today.

That's also why I'd love contributions. If you try it and something is confusing, broken, or missing, please [open an issue](https://github.com/inkyvoxel/go-spark/issues). If you spot a security problem, even better (there's a security policy in the repo). And if you just want to poke around the code to see how a Go web app fits together without a framework, that's a perfectly good reason to clone it too.

## Try it out

If you fancy giving it a go (pun intended):

1. Head to the [Go Spark repository on GitHub](https://github.com/inkyvoxel/go-spark) and click **Use this template**.
2. Run `make init` to set your project name and module path.
3. Copy the example env file, then run `make migrate-up` and `make start`.

You'll have a running web app with auth, emails, and background jobs in a few minutes. From there, the docs walk you through adding your first feature: a migration, a query, a page, a form.

## Closing thoughts

Building Go Spark taught me more about web apps than years of using frameworks that did the work for me. There's something satisfying about understanding every layer, from the Argon2id parameters to the SQLite pragmas to the Caddyfile.

If you've been curious about building web apps in Go, or you just want a simple, secure foundation for your next side project, give [Go Spark](https://github.com/inkyvoxel/go-spark) a try. Star it, fork it, break it, and tell me what's wrong with it. Contributions are very welcome!
