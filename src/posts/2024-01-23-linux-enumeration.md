---
title: Linux enumeration
description: A cheat sheet of Linux commands used for gathering information about a system, its processes, user privileges, and network configuration.
tags:
  - cybersecurity
---

Enumeration is the process of gathering information about a computer system, network, or application. It helps gain valuable insights into the target system.

Here are some commands for Linux enumeration:

- `hostname` prints the computer's name.
- `uname -a` prints information about the kernel.
- `cat /proc/version` prints additional information about the kernel, and sometimes compiler information.
- `cat /etc/issue` can be used to identify some operating systems.
- `ps` shows running processes.
- `env` prints environment variables.
- `sudo -l` prints commands the current user can run with `sudo`.
- `ls -la` shows all files and folders in current directory, including hidden files.
- `id` prints an overview of current user's privileges and groups.
- `cat /etc/passwd` prints information about all accounts configured on the system.
- `ifconfig` prints information about the network adapters. However this has been deprecated in newer Linux distributions in favour of the `ip` command below.
- `ip` prints information about the network adapters.
- `cat /etc/exports` prints information about Network File Sharing (NFS).
- `echo $PATH` prints a list of directories used to search for binaries when commands are typed in the terminal.
- `whoami` prints the current user.
- `which python3` prints the location of an executable, in this example `python3`.

Please note that this is not an exhaustive list!

## Closing thoughts

The effectiveness of these commands can vary depending on the specific Linux distribution, and the permissions of the user executing them.