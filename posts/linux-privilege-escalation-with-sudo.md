---
title: Linux privilege escalation with 'sudo'
description: Learn how to exploit 'sudo' for privilege escalation on Linux.
date: 2023-01-22
tags:
  - cybersecurity
---

The `sudo` command allows users to run commands with root privileges, without being root.

In some cases, non-root users are given the ability to run certain commands with administrative privileges. For example, a `website` user might be configured on a server to run all commands necessary for hosting and managing a website. Some of these commands might have been given permission to run using `sudo`.

To find out which `sudo` commands the current user has access to, run the following:

```sh
sudo -l
```

If we are lucky, we might get output similar to the following:

```sh
User website may run the following commands on website-hosting-server:
    (ALL) NOPASSWD: /usr/bin/ruby
```

In this example, `ruby` has been configured to run using `sudo` for the `website` user. Now that we have this information, we can find a way to exploit it. [GTFOBins](https://gtfobins.github.io/) is a great resource for finding such exploits.

Searching GTFOBins for `ruby`, and filtering by `sudo`, gives us the following command:

```sh
ruby -e 'exec "/bin/sh"'
```

Running this command as our example `website` user will start a new bash shell with root privileges! 🎉

Of course, `sudo -l` could return a plethora of different commands which run using `sudo`, so you will need research each individual command to find a working `sudo` exploit.

## Closing thoughts

It's not guaranteed that all systems will have the same configuration described in this post, but it's worth checking `sudo -l` and GTFOBins, as it might enable privilege escalation.
