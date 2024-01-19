---
title: How to stabilise netcat shells using Python
description: Netcat shells are unstable by default, but they can be improved and stabilised using Python.
tags:
  - cybersecurity
---

Netcat is easy to use and widely available on many systems, making it a perfect tool for remote shells. However, netcat shells are very unstable. You are always one `Ctrl + C` away from accidentally losing the connection to your target.

If the attacking computer and the target computer are both running Linux, you can use the following technique to stabilise your remote shell, giving you a more robust terminal experience.

1. Establish a reverse shell or a bind shell using netcat. I wrote about this in a [previous](/reverse-shells-and-bind-shells/) post.
2. Check if Python is installed. You can do this by running `python --version`. You may need to use `python`, `python2`, or `python3` depending how the system is set up.
3. Inside the remote shell, run `python -c 'import pty;pty.spawn("/bin/bash")'`. This spawns a more feature rich Bash shell.
4. Run `export TERM=xterm` to set the xterm terminal emulator.
5. Press `Ctrl + Z` to 'background' the netcat shell. This will return you to the terminal on the attacking computer.
6. Run `stty raw -echo`. This does two things: `raw` changes how your keyboard input is processed, allowing `Ctrl + C`, cursor key movements, `TAB`, autocomplete, etc. to be passed through to the netcat shell; and `-echo` disables the echo in your terminal as you type, making the netcat shell behave more like a normal terminal.
7. Run `fg` to return the netcat shell to the 'foreground'.

Once you are done with your netcat shell, and you return to the terminal on the attacking computer, you will need to run `reset` to undo the changes we made in step 6 (`stty raw -echo`).