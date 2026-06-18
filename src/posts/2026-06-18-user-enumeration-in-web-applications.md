---
title: "User Enumeration in Web Applications"
description: A short look at what user enumeration is, why it's worth preventing, and how to make user accounts harder to enumerate.
tags: [software-engineering, cybersecurity]
---

Recently I made a small change to [Go Spark](https://github.com/inkyvoxel/go-spark), my Go and SQLite web app template, to reduce something called user enumeration. It's a fairly subtle thing, and it got me thinking it'd make a good short post: what user enumeration is, why it's worth preventing in any web app, and the practical steps you can take. I'll use the changes I made to Go Spark as a worked example along the way, since that's what prompted me to write this.

## What is user enumeration?

User enumeration is when an attacker can work out whether a particular email address (or username) has an account on your app, without ever logging in.

The usual culprit is the app being too helpful. Imagine a registration form that responds with "that email is already registered" when you try to sign up with an existing address. That's a convenient message for a real user, but it's also a yes/no oracle for anyone with a list of email addresses. Try each one, read the response, and you've quietly built a list of who has an account.

The same thing can leak through password reset forms ("no account found for that email"), login error messages that differ between "wrong password" and "unknown user", and even subtle differences in how the page behaves.

## Why bother preventing it?

On its own, knowing that an email has an account isn't the end of the world. But it's a useful first step for an attacker. Once they know an account exists, they can target it with credential stuffing, password spraying, or phishing. It also leaks information you probably didn't mean to share, for example, knowing that a specific person uses a particular service.

It's the kind of thing that sits under Authentication Failures in the [OWASP Top 10 (2025)](/owasp-top-10-2025): not a dramatic vulnerability by itself, but worth closing off where you reasonably can.

## Making responses neutral

The core fix is the same wherever this comes up: make the app respond the same way whether or not the email exists.

Take **registration**: instead of telling someone an email is already taken, show the same neutral message either way, something along the lines of "if that email isn't already registered, we've sent a verification link". If the address is new, you create the account and send the email; if it already exists, you do nothing behind the scenes, but the response looks identical.

The same idea applies anywhere a flow reveals whether an account exists. **Changing an email address** should give the same success response without emailing an address that already belongs to someone else. **Password resets** shouldn't admit "no account found for that email". And **login** is worth a thought too, since an error that distinguishes "wrong password" from "unknown user" gives the game away just as readily.

This is exactly what I did in Go Spark, and the nice thing was it wasn't really new ground for the project. Password resets already worked this way (an unknown address just silently does nothing), so the change mostly brought registration and email change in line with that.

## Watch out for behaviour that leaks too

Matching the wording is only half of it; the behaviour behind it has to match too. It's easy to plug the obvious leak in the response text while leaving a more subtle one in how the app actually behaves, and an attacker will happily use either.

A common example is automatically logging people in after they register. It's a nice touch for genuine new users, as it's one less step. But it quietly gives the game away. If registering with an existing email *doesn't* log you in (because there's no new account), while registering with a fresh email *does*, then the difference in behaviour tells an attacker exactly what they wanted to know. The matching wording on the surface wouldn't matter.

This was the bit I had to think about in Go Spark, since it used to auto-login on registration. In the end I dropped it. Now everyone who registers is sent to the login page with the same message, regardless of whether an account was actually created. It's a slightly less smooth experience for new users, but I think it's a fair trade for not leaking account existence.

## The harder problem: timing

A determined attacker doesn't only have the response text and page behaviour to go on. They can also time the requests. Creating an account, hashing a password, and queuing an email all take time. Doing nothing is faster. So a registration for a brand-new email might take noticeably longer than one for an existing email, and that difference alone can be enough to enumerate users.

Defending against this properly means doing roughly the same amount of work in both cases, which is hard to get right. For Go Spark, I haven't done anything about it yet. Right now, I think mitigating in the template is overkill. Where you draw that line is a judgement call that depends on your app and your threat model, but it's worth making the call deliberately rather than assuming you've closed the door completely.

## Rate limiting helps too

Neutral responses aren't the only thing working in your favour here. Rate limiting your auth flows (registration, login, password reset, email change) is a genuine part of the defence, and it's something Go Spark already does across all of them.

Enumeration is almost always a bulk activity. An attacker isn't checking one address, they're working through a list. Even if each individual request leaks a little, rate limiting makes grinding through thousands of addresses slow and noisy, which is exactly the kind of behaviour you'd want to spot and block. It also takes some of the sting out of the timing concern above, since timing attacks usually need a lot of samples to separate the signal from the noise.

So it's less about any single trick and more about stacking a few reasonable measures so the easy paths are closed off.

## Closing thoughts

User enumeration is a good example of the kind of issue that's easy to overlook, since none of these flows are obviously "broken". If you've got an app of your own, it's worth taking a few minutes to walk through your registration, login, password reset, and email change flows and asking: does this behave the same way whether or not the account exists? It's often a small, low-risk change to tidy up, and a nice one to close off.

That's exactly why I made the change to [Go Spark](https://github.com/inkyvoxel/go-spark). My goal for Go Spark is for it to be a solid, secure foundation that people can pick up and build their next project on.