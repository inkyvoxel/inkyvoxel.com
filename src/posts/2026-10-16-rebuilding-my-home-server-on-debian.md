---
title: "Rebuilding my home server on Debian 13"
description: "Rebuilding my old laptop server on Debian 13, moving 45,000 family photos from Copyparty to Immich, and finding 2,156 of them had the wrong date."
tags: [self-hosting, linux]
---

Last year I turned an old Dell Inspiron laptop into a home server, and wrote up each step as I went:

1. [Using an old laptop as a home server](/using-an-old-laptop-as-a-home-server): Getting the laptop ready to act as a server.
2. [How to add an SSD to your home server](/how-to-add-an-ssd-to-your-home-server): Adding an encrypted 4TB SSD for data.
3. [How to secure Ubuntu Server](/how-to-secure-ubuntu-server): Firewall, SSH hardening and automatic updates.
4. [Setting up Copyparty on a home server](/setting-up-copyparty-on-a-home-server): File hosting, and the painful job of organising 20 years of photos.

This summer I rebuilt the whole thing on Debian 13, replaced Copyparty with [Immich](https://immich.app/), and finally sorted out backups and monitoring. It took from August to October, mostly in evenings.

The interesting part wasn't the rebuild. It was discovering that 2,156 of my 45,000 photos had the wrong date, and that my own earlier guides would have destroyed my data if I'd followed them literally.

Everything below is in a public repo if you want the actual configs and scripts: [github.com/inkyvoxel/homelab](https://github.com/inkyvoxel/homelab).

## Why Debian

Nothing was wrong with Ubuntu Server 24.04. I wanted a smaller base, no snaps, and I'd just been [getting Debian working nicely on my Framework laptop](/getting-the-fingerprint-reader-working-on-framework-13-and-debian), so it was fresh in my head.

Almost everything from the three older posts carried over unchanged. These are the bits that didn't.

### The lid switch

My original post told you to edit `/etc/systemd/logind.conf` and set three values to `ignore`. On Debian 13 that's still roughly right, but there's a trap: Debian suspends on lid close **even on mains power**, and editing `logind.conf` directly means the next package update hands you a merge conflict.

Use a drop-in instead:

```bash
sudo mkdir -p /etc/systemd/logind.conf.d
sudo nano /etc/systemd/logind.conf.d/10-server.conf
```

```ini
[Login]
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
```

```bash
sudo systemctl restart systemd-logind
```

### There is no /var/log/auth.log

Debian dropped `rsyslog` from the default install in Debian 12, so the log file every Fail2Ban tutorial tells you to watch simply doesn't exist.

This caught me out for about ten minutes before I realised Debian's `fail2ban` package already reads the systemd journal. It works out of the box with no `logpath` configuration at all, which is genuinely better than what I had on Ubuntu. Check it with:

```bash
sudo fail2ban-client status sshd
```

### SSH drop-ins win

Debian's `sshd_config` has `Include /etc/ssh/sshd_config.d/*.conf` as its **first** line, and `sshd` keeps the first value it sees for any setting. So a drop-in file overrides everything in the main config, which is the opposite of what I assumed.

That's the right place for hardening, and it survives upgrades:

```bash
sudo nano /etc/ssh/sshd_config.d/10-hardening.conf
```

### Smaller things

- Debian's installer has no "import SSH key from GitHub" option. [Use `ssh-copy-id` instead](/how-to-copy-an-ssh-key-to-a-new-linux-machine).
- No Ubuntu Pro, no Livepatch, no `do-release-upgrade`, no snaps. I didn't miss any of them.

## Bringing back the encrypted disk without wiping it

The 4TB SSD still had 396GB of family photos on it. My own SSD post starts like this:

```bash
sudo cryptsetup luksFormat /dev/sdb
sudo mkfs.ext4 /dev/mapper/data
```

That is correct for a blank disk and **unrecoverable on a disk with data**. The person most likely to re-follow that guide after a reinstall is me, which is a slightly uncomfortable thought.

I've since added a warning to the top of that post, so nobody follows it onto a disk that already has data on it.

What I actually did was open it read-only and check the filesystem before trusting anything:

```bash
sudo cryptsetup luksOpen --readonly /dev/sdb data
sudo e2fsck -fn /dev/mapper/data
```

Clean, and the first check since May 2025.

### Never use drive letters

Between two boots, `sda` and `sdb` swapped. Everything kept working, because every reference in `crypttab` and `fstab` was a UUID. Later in the project the letters shuffled again when I plugged in USB drives.

The one place I'd used a letter was my LUKS header backup filenames (`sda3-header.img`), which is exactly the sort of file you grab in a panic at 11pm. I renamed them by drive serial number instead:

```bash
sudo cryptsetup luksHeaderBackup /dev/sdb \
  --header-backup-file /root/luks-S5SXNG0N123456-header.img
```

### A keyfile, not a second passphrase

My old post used `none` in `crypttab`, which means a second passphrase prompt at boot. On a headless machine that's two keyboards you don't have. It also used bare `defaults` in `fstab`, so a failed unlock drops the boot into an emergency shell instead of just carrying on.

The fix is a keyfile stored on the already-encrypted root disk, and `nofail`:

```bash
sudo mkdir -p /etc/luks
sudo dd if=/dev/urandom of=/etc/luks/data.key bs=512 count=8
sudo chmod 400 /etc/luks/data.key
sudo cryptsetup luksAddKey /dev/sdb /etc/luks/data.key
```

`/etc/crypttab`:

```
data UUID=<luks-uuid> /etc/luks/data.key luks,nofail
```

`/etc/fstab`:

```
UUID=<filesystem-uuid> /mnt/data ext4 defaults,nofail 0 2
```

This also fixed something I hadn't noticed for a year: the disk had a **single LUKS keyslot**. One passphrase, no backup. Lose it and the data is gone. Adding the keyfile gave it a second.

One gotcha that nearly bit me. I took a header backup, then added the keyfile. Restoring that backup later would have silently removed the keyslot I'd just created. The rule is simple: **any keyslot change invalidates every header backup you have**. Take a fresh one afterwards.

### Who owns these files?

The files were owned by `996:987`, the system account Copyparty had on the old install. Those IDs sit inside Debian's automatic allocation range for package-created users, so the next `apt install` could quietly take ownership of 400GB of family photos.

I made a dedicated account with an ID well out of that range:

```bash
sudo groupadd -g 3000 datastore
sudo useradd -r -u 3000 -g 3000 -s /usr/sbin/nologin datastore
sudo chown -R datastore:datastore /mnt/data
```

48,077 files in 0.86 seconds, which was faster than I expected.

While I was there, ext4 reserves 5% of the filesystem for root by default. That makes sense on a root disk and no sense at all on a data-only disk:

```bash
sudo tune2fs -m 1 /dev/mapper/data
```

That gave me back 146GiB.

## Making an encrypted laptop work headless

An encrypted disk on a machine with no keyboard is only useful if you can unlock it remotely.

### Remote unlock over SSH

`dropbear-initramfs` puts a tiny SSH server in the initramfs, so you can ssh in during boot and type the passphrase:

```bash
sudo apt install dropbear-initramfs
```

In `/etc/dropbear/initramfs/dropbear.conf`:

```
DROPBEAR_OPTIONS="-p 2222 -s -j -k -I 180"
```

Then put your public key in `/etc/dropbear/initramfs/authorized_keys`, with a forced command so the key can't be used to get a pre-boot shell:

```
command="/usr/bin/cryptroot-unlock" ssh-ed25519 AAAAC3Nza...
```

```bash
sudo update-initramfs -u
```

Now a reboot looks like this:

```bash
ssh -p 2222 root@192.168.1.x
```

It worked first try, which almost never happens. This laptop no longer needs a keyboard.

### TPM auto-unlock, considered and rejected

The obvious next step is binding the key to the TPM so it unlocks itself. The laptop has TPM 2.0 and I'd already decided to do it before I checked the hardware properly.

Two problems. `mokutil` reports that the firmware doesn't support Secure Boot, and the TPM only has SHA-1 PCR banks. Without Secure Boot, anyone with physical access can edit the GRUB line, boot `init=/bin/sh`, and get a root shell on a disk the TPM has already helpfully unlocked. It would have been encryption in name only.

Worth checking before you commit:

```bash
mokutil --sb-state
ls /sys/class/tpm/tpm0/pcr-*
```

### The battery is the UPS

The laptop's battery is at 62% of its design capacity, about 45Wh, which idles for a few hours. That's a UPS I already own.

What was missing was a clean shutdown. A small service watches the battery and powers off at 15%, so a long power cut ends in a tidy shutdown rather than a dirty one. I tested it with simulated battery levels before trusting it with the real thing, which I'd recommend, because getting the comparison backwards means the server powers off while on mains.

### The Secure Boot mystery

I'd had Secure Boot enabled in the BIOS for about five years while Linux insisted it was off. "Reset keys to factory" never did anything.

The firmware's UEFI variable store reports 231KB of its 256KB used. The variables actually visible to the OS total 1,076 bytes:

```bash
sudo cat /sys/firmware/efi/efivars/* 2>/dev/null | wc -c
efibootmgr -v
```

There's no `BootOrder` entry either. The store is full of dead entries that the firmware never reclaims, so every write fails, including the one `fbx64.efi` attempts on each boot and the one the "reset keys" option tries to make. The machine boots via the fallback path at `\EFI\BOOT\BOOTX64.EFI` and has done for years.

I've left it alone, because it works. One warning: you will find advice telling you to `rm` files in `/sys/firmware/efi/efivars/` to free space. Don't. On some firmware that bricks the machine.

## Docker, Caddy and certificates

I installed `docker.io` from Debian's repositories rather than from docker.com. It's an older version, but it's the version `unattended-upgrades` will actually patch, and an unpatched container runtime is worse than an old one.

The thing that surprised me most: **Docker bypasses ufw**. Publishing a port with `-p` writes its own iptables rules, so a container is reachable from the network even when your firewall says it shouldn't be. Your ufw rules look fine and mean nothing.

The fix is to stop publishing ports at all. Only Caddy publishes anything; every app sits on an internal network and is reached by container name:

```yaml
networks:
  edge:
  internal:
    internal: true
```

For certificates, I set up wildcard DNS pointing at the server's private address:

```
*.home.example.com.  A  192.168.1.x
```

Public DNS, private IP. Nothing is exposed, but Let's Encrypt can still issue a certificate via the Cloudflare DNS-01 challenge, so I get real TLS with no browser warnings and no `tls internal` like I used in the Copyparty post. A wildcard also keeps individual app names out of the public [Certificate Transparency](https://certificate.transparency.dev/) logs.

## Moving 45,000 photos to Immich

This is the part that took most of the time.

Copyparty did its job well, but I wanted faces, search, a map, and phone apps that back up automatically. The source was 45,234 files and 396GB in a `yyyy/mm/dd` tree I'd built by hand, exactly as described in the Copyparty post.

### Checksum everything before you touch anything

Immich stores a SHA-1 checksum for every asset it ingests. That's convenient, because it means a manifest made beforehand can be matched exactly against what ended up in the database:

```bash
find /mnt/data/copyparty/memories -type f -print0 \
  | xargs -0 -P4 sha1sum > /root/pre-import-manifest.sha1
```

I'm glad I did, because **the import silently lost files**.

The Immich CLI skips anything the server can't store and doesn't treat it as an error. Reconciling the manifest against the database afterwards found 28 files that never arrived:

- 23 `.m4a` audio recordings (Immich has no concept of an audio-only asset)
- 1 PDF
- 4 hidden Android files (`.trashed-…`, `.pending-…`)

My plan had been "import, verify the count, then `rm -rf` the source". The count would have looked close enough. Those 28 files would have been deleted.

### Counts that look wrong but aren't

A few numbers didn't add up at first and turned out to be fine:

- 45,190 uploaded, 16 rejected as duplicates of each other
- 2,315 extra videos: motion photos Immich extracted out of phone JPEGs
- 814 `.MOV` files from iPhone Live Photos, hidden in the UI behind their stills

### 2,427 photos with the wrong date

With everything imported, I compared each asset's date against the folder it came from. 2,427 disagreed.

My first assumption was "these have no EXIF data", and that was wrong. Immich writes its *fallback* date into the EXIF date column, so the database shows a date for every single file whether one existed or not. The real test is whether that date is suspiciously equal to the file's modification time.

It was, for 2,137 of them. Almost all were dated **November 2020**, the week I'd copied and reorganised those files. I'd even noted in the Copyparty post that mtime was unreliable. Here was the bill.

To work out the real dates, I used the filename as a tiebreaker. Phones are generous here: WhatsApp writes `IMG-20131016-WA0001`, Android writes `IMG_20190303_183620`, burst shots carry their own timestamps. Across the whole set there was **not one case** where a date in the filename disagreed with both the folder and the EXIF date, which gave me enough confidence to use it to arbitrate.

That turned up some things I wasn't expecting:

- **Sometimes the folder was wrong.** 164 photos where the filename and EXIF agreed with each other but my hand-sorted folder was a day out. Timezone drift around midnight, from the original `exiftool` sort. The photos were right and my filing was wrong.
- **Dead camera clocks.** An old Pentax stuck on 2008-01-01, and a batch of files confidently dated 1980-01-01.
- **A bug in my own parser.** It didn't handle `YYYYMMDDHHMMSS` run together with no separators. I only caught it because I spot-checked a sample of the output by hand instead of trusting the summary.

In the end: **2,156 corrected** through the API, with a before/after log so every change could be rolled back. 107 were left alone as genuinely ambiguous, with real EXIF data and nothing to arbitrate against. Adding the 164 where the folder was wrong, that's 271 deliberately untouched.

Then I re-ran the whole comparison from scratch against a fresh export: 44,919 matching, and exactly the 271 I'd chosen to leave. Nothing had drifted.

### Dating 954 photos with no metadata at all

One folder was an offline export from a nursery app, and it had no EXIF data whatsoever. Imported as-is, 954 photos would all have landed on the export date.

871 had usable dates in their filenames. The rest had names that looked like random hex, and it took an embarrassingly long time to notice they were **MongoDB ObjectIds**. The first four bytes of an ObjectId are a Unix timestamp:

```python
from datetime import datetime, timezone
datetime.fromtimestamp(int(object_id[:8], 16), timezone.utc)
```

That felt too clever to trust, so I checked it. The export also contained a `daily_diary.json` mapping each photo to the diary day it was posted on. The ObjectId timestamps agreed with the diary for **82 of 82** files.

One file claiming to be a profile photo turned out to be a PNG with a `.jpg` extension, which is the sort of thing you find when you start checking.

I wrote the recovered dates into the files with `exiftool` **before** uploading, rather than fixing them in Immich afterwards. That way the file on disk is correct too, and any future migration gets it right for free.

## Backups, and only then deleting the source

I had two USB drives, 1TB and 2TB, both LUKS2, that I'd been using for manual backups.

Both turned out to be identical copies of the source as it stood before December 2025, each missing the same **56 newer photos**. Copyparty had renamed some upload collisions with a timestamp suffix, and my rsync-by-hand approach had never picked them up. So for those 56 photos, the server was the only copy. That's not a backup strategy, that's a single point of failure with extra steps.

The new backup covers Immich's original files plus its nightly database dumps, about 418GB. Thumbnails and transcodes are excluded, because they can be regenerated from the originals.

The important part is what I verified against. Not the server's current copy of each file, but **the checksum Immich recorded when the file was uploaded**. Comparing a backup against the thing you just copied it from only proves `cp` works. Comparing it against an independent record from months earlier proves the file hasn't rotted in between.

47,432 of 47,432 files on both drives.

On the first pass, two files came back missing. Both were a live photo that a phone had synced *during* the backup run. Not corruption, just timing, and worth knowing before you panic.

The 2TB drive's USB bridge also reset 13 times during the copy under the UAS driver. The verification proved nothing was damaged, and a `usb-storage` quirk for that device's ID stopped it happening again:

```bash
lsusb  # find the vendor:product ID
# then add usb-storage.quirks=174c:55aa:u to GRUB_CMDLINE_LINUX_DEFAULT
```

I went with a plain mirror rather than versioned backups. If I delete a photo in Immich and it sits in the trash for 30 days before being removed, I meant it. I also dropped my old pre-Immich folder tree from the drives once I noticed that Immich's storage template produces an equivalent browsable `yyyy/mm` tree of byte-identical files. Two copies of the same 400GB in different folder layouts is not two backups.

Only after all of that did I delete the 396GB source.

## Monitoring

The whole thing is useless if it quietly stops working, so everything reports to [Healthchecks.io](https://healthchecks.io/) on the free tier.

The key one is a 5-minute heartbeat, because it catches the single failure the server can never report about itself: sitting at the LUKS passphrase prompt after a power cut, perfectly healthy, doing nothing. Nothing on the machine can alert me to that, because the machine isn't up. Only the absence of a ping can.

On top of that:

- A daily 18-point health check covering disk space, SMART status, container health, backup age and pending reboots.
- Immediate alerts from `smartd` and from the battery service (mains lost, 30%, powering off, power restored).
- A 30-day "you haven't run a backup" reminder, because the backup is manual and I will absolutely forget.

## Mistakes worth admitting

In the spirit of these being honest write-ups rather than tidy ones:

- I set up temporary passwordless sudo for one session and forgot to remove it. It sat there for about seven weeks.
- The server ran 52 days without a reboot, on an old kernel, with a pending OpenSSL fix. `unattended-upgrades` patches packages but nothing reboots the machine, and I'd written that caveat into my own security post. The daily check now alerts after 7 days of a pending reboot.
- Several "it's broken" moments were really just timing: Immich applies date updates asynchronously, so a verification run immediately afterwards shows the old values. A photo arrived mid-backup. A schema warning appeared while geodata was still importing. Wait, then re-check, before you start debugging.
- At one point I confidently reported that 3,779 files needed moving, because I'd compared on-disk paths against the wrong date field.

## Closing thoughts

The rebuild itself was a weekend. The photos took two months, and that was the part that mattered. Nothing in this project found a hardware fault or a security breach. What it found was quiet data loss: files that would have vanished in an import, 2,156 wrong dates, 56 photos that existed in exactly one place, and 28 files that one `rm -rf` would have taken with them.

If you take one thing from this, make it the checksum manifest. It's one command, it costs an hour of CPU time, and it's the only reason I know what did and didn't survive.

All the configs, scripts and the decision log are at [github.com/inkyvoxel/homelab](https://github.com/inkyvoxel/homelab), including the things I tried and abandoned.
