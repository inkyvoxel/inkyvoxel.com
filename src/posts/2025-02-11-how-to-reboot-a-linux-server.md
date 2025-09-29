---
title: How to reboot a Linux server
description: A quick guide on how to safely reboot your Linux server.
tags: [linux]
---

To safely reboot your Linux server, run the following command:

```bash
sudo sync && sudo systemctl reboot
```

This command does two things:

1. `sync` writes all data in memory to disk, preventing data loss.
2. `systemctl reboot` reboots the server using systemd.

## Closing thoughts

Rebooting will disconnect all users and stop active connections. Plan accordingly for production servers!
