---
title: How to add an SSD to your home server
description: How I added an encrypted SSD to my home server. Step-by-step installation and setup.
tags:
  - self-hosting
  - linux
---

After converting an old laptop into a home server [recently](/using-an-old-laptop-as-a-home-server), there was one major thing that was bothering me. The laptop originally had two drives: a smaller SSD where Ubuntu Server was installed, and an ageing 1TB 2.5" HDD that was not only slow, but it was also incredibly loud. I could hear it scratching away in the background, which was not ideal.

To keep the setup quiet and snappy, I picked up a new 4TB 2.5" SSD to replace the old hard drive. For a home server that will be on 24/7, it felt like a worthwhile investment. The new SSD has more storage space, has less noise, less heat, lower power draw and (I hope) better reliability.

## Steps I followed

First, I removed the old HDD from the laptop and fitted the new 2.5" SSD. I didn't want the old drive to go to waste, so I popped it into a 2.5" USB caddy. That way, I can still plug it in via USB and browse the old files if I ever need to.

Next, I booted up the laptop, connected to it via `ssh`, and checked that the system had detected the new drive:

```bash
sudo fdisk -l
```

In the output, I could see the disk listed as `/dev/sdb`:

```bash
Disk /dev/sdb: 3.64 TiB, 4000787030016 bytes, 7814037168 sectors
Disk model: Samsung SSD 870
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
```

I wanted to encrypt the SSD using LUKS, so I ran the following (using `/dev/sdb`, which matched the label from above):

```bash
sudo cryptsetup luksFormat /dev/sdb
```

This prompted me to enter a passphrase. That passphrase will be required every time the laptop boots, and as far as I know, it can't be entered over ssh.

Since this drive will mostly be used for storing data, I decided to name it `data`. If you're following along, you can swap that out for any name you prefer.

```bash
sudo cryptsetup luksOpen /dev/sdb data
```

Next, I formatted the encrypted volume using ext4 (my go-to for Linux filesystems):

```bash
sudo mkfs.ext4 /dev/mapper/data
```

I created a mount point:

```bash
sudo mkdir /mnt/data
```

And mounted the filesystem:

```bash
sudo mount /dev/mapper/data /mnt/data
```

To make sure the disk mounts automatically on boot, I needed the UUID of the encrypted drive. I found it using:

```bash
sudo cryptsetup luksUUID /dev/sdb
```

Then I opened `/etc/crypttab` to add the UUID:

```bash
sudo nano /etc/crypttab
```

Inside that file, I added this line (replacing `<THE UUID>` with the actual value):

```bash
data UUID=<THE UUID> none luks
```

Then I edited `/etc/fstab`:

```bash
sudo nano /etc/fstab
```

And added this line to ensure the filesystem mounts at boot:

```bash
/dev/mapper/data /mnt/data ext4 defaults 0 2
```

Finally, I rebooted the server to make sure everything started up correctly and the new drive mounted as expected.

## Closing thoughts

I'm really pleased with the new SSD. It's almost four times the size of the old drive and completely silent, which makes a big difference in a quiet room. The upgrade was also easier than I expected. This was a quick win that was well worth it.
