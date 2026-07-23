---
title: Getting the fingerprint reader working on Framework 13 and Debian
description: How to get the fingerprint reader working on a Framework Laptop 13 running Debian 13.
tags: [linux]
---

I've been using Fedora on my Framework Laptop 13 (AMD 7040U) for a couple of years now, partly because it's one of Framework's officially supported distros. The hardware has worked flawlessly in this time.

However, I recently felt the urge to do some distro-hopping and chose Debian. Framework does not list Debian as an officially supported distro for any of their laptops, but now that my laptop's hardware is a little older, it looked like it was going work with Debian 13.

Most things worked fine out of the box, but the fingerprint reader needed a few extra steps.

The fingerprint sensor on this laptop is a Goodix "Match-On-Chip" sensor. It's supported by libfprint's native open-source driver, so no third-party or proprietary driver package is needed.

## 1. Check the reader is detected

```bash
lsusb | grep -i goodix
```

## 2. Install the packages

```bash
sudo apt update
sudo apt install fprintd libpam-fprintd fwupd
```

- `fprintd` is a D-Bus daemon that arbitrates access to the reader
- `libpam-fprintd` is a PAM module that lets login/sudo/GNOME lock screen accept a fingerprint as an alternative to a password
- `fwupd` is the firmware update daemon, needed for the next step

## 3. Update the sensor firmware

```bash
sudo fwupdmgr refresh
sudo fwupdmgr get-devices
sudo fwupdmgr update
```

Reboot after any firmware update.

## 4. Enroll a fingerprint

Enrollment is handled by whichever desktop environment you use, since it's all talking to the same underlying `fprintd` + `libpam-fprintd` + D-Bus stack. This should work the same way on GNOME, KDE Plasma, or any other desktop with fingerprint support built in.

I'm using GNOME (this time), so for me this was:

**Settings → Users → (unlock with password) → Fingerprint Login → Enroll**

On KDE Plasma, the equivalent should be:

**System Settings → Users**.

## 5. Enable fingerprint auth for login/sudo

```bash
sudo pam-auth-update
```

Tick "Fingerprint authentication" in the text UI.

## Closing thoughts

With the packages configured, and firmware updated, the fingerprint reader works just as well on Debian as it did on Fedora.
