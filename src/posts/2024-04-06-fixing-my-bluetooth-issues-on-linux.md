---
title: Fixing my Bluetooth issues on Linux
description: Do you sometimes have issues turning Bluetooth on with Ubuntu or Fedora? This might help!
tags:
  - linux
---

My laptop often has issues turning Bluetooth on after booting up. I have this issue on both Ubuntu 22.04 and Fedora 39. Rebooting sometimes fixes the issue, but not always.

In my case, running `sudo service bluetooth status` shows that the Bluetooth service is enabled and running, but a few error messages are displayed.

After a few failed attempts at fixing, I came across this combination of commands which fixes my issue:

```bash
sudo rmmod btusb && sudo modprobe btusb
```

The first command removes the Bluetooth module from the Linux kernel, and the second one adds it back.

After I run the commands, Bluetooth turns on, and pairing devices via the desktop environment starts working again.

Please be aware that this is only a temporary fix. I need to run the commands every time the issue occurs (almost every reboot).

## Closing thoughts

I hope this helps. Linux hardware compatibility issues can be complex and frustrating. I realise that this won't work for everyone. If you are that person, thanks for reading my article anyway, and I wish you good luck!