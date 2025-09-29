---
title: Using an old laptop as a home server
description: Turning an old laptop into a home server and preventing it from becoming e-waste.
tags: [self-hosting, linux]
---

I used a relatively cheap Dell Inspiron 15 laptop for nearly eight years as my personal computer. It served me well, aside from the occasional driver issues in Linux. Last year I replaced it with a Framework 13 AMD laptop, which was a huge upgrade in every way. Since then, the Dell had been tucked away in a cupboard collecting dust. This weekend I decided to give it a new purpose, by turning it into a home server.

## Installing Ubuntu Server

I went with Ubuntu Server 24.04 LTS, as I knew the desktop version of Ubuntu worked fine on this laptop.

During installation, I chose to include OpenSSH, which lets me manage the server remotely. I was pleasantly surprised to see Ubuntu Server had an option to import an SSH key directly from a GitHub account. All I needed to do was provide my GitHub username, and then I could just `ssh` in to the server using the key I already use for development.

When asked about installing proprietary drivers, I decided to skip them. Mainly because I didn't want the system using the discrete NVIDIA graphics card. I've no plans to run anything that needs it, and I'm hoping this will save on power and reduce heat over time.

## Tuning the laptop for server use

There were a couple of tweaks I made after installing the OS to make the laptop behave more like a server.

### Stop the laptop sleeping when the lid is closed

By default, the laptop was going to sleep when I closed the lid. This wasn't ideal, as I didn't want the laptop taking up too much space.

I disabled the sleep behaviour by doing the following:

Opening the `logind.conf` config file:

```bash
sudo nano /etc/systemd/logind.conf
```

Editing these three lines, ensuring they are uncommented and set to `ignore`:

```bash
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
```

Restart `logind` to apply changes:

```bash
sudo systemctl restart systemd-logind
```

Now I can close the lid without worrying about the server going to sleep. I read closing the lid may effect the cooling efficiency, so I may need to change this in the future.

### Turn the screen off after a delay

I noticed that by default, the laptop screen was never turning off, even when the lid was closed.

To stop the screen from staying on constantly, I set it to blank after 60 seconds by doing the following:

Open the GRUB config:

```bash
sudo nano /etc/default/grub
```

Edit the `GRUB_CMDLINE_LINUX_DEFAULT` line and add `consoleblank=60` like so:

```bash
GRUB_CMDLINE_LINUX_DEFAULT="consoleblank=60"
```

Save the file, then update GRUB:

```bash
sudo update-grub
```

Now the screen turns off automatically after 60 seconds of inactivity.

## Battery settings

While researching setting up a laptop as a server, I saw a few comments online saying that running the laptop on charge 24/7 will be bad for battery health. I didn't care too much about this, as this laptop is very old anyway. However, another comment caught my eye, as they were claiming the battery could actually set on fire.

Reading into this more, it seems rare, but it is a real possibility with lithium batteries. I read the safest option is to remove the battery entirely. Another option I saw was to cap the battery charge limit to around 60% in UEFI. As a disclaimer, I don't know if capping the charge limit prevents the fire risk, or if this is just simply better for overall battery health. I personally decided to leave the battery in, so I guess I will soon find out.

I dug into the Dell UEFI, and under the 'battery' settings, I saw the options for capping the charge limit. However, before I configured anything, I saw another setting along the lines of 'always plugged in AC'. There was limited documentation on what this setting did, but it sounded exactly what I wanted. I decided to enable this instead of capping the charge limit.

## Closing thoughts

Turning my old laptop into a home server was a fun little weekend project. With a few tweaks, it is running nice and quietly next to my router. It isn't doing very much right now, but when I get some more time, I plan to configure this laptop to replace a Nextcloud instance I have running in a VPS, which is currently backing up my family's photos, and syncing our contacts and calendars.

Update: It wasn't running as quietly as I liked, but I solved that by replacing one of the hard drives with an SSD. You can read about that [here](/how-to-add-an-ssd-to-your-home-server).
