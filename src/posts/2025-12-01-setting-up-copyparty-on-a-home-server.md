---
title: "Setting up Copyparty on a home server"
description: "A step-by-step guide to setting up Copyparty as a file server on Ubuntu Server, including tips for organising and uploading files."
tags: [self-hosting, linux]
---

Over the past few months, I've been experimenting with turning an old laptop into a home server running Ubuntu Server. This has been a fun project, and I've documented the process in a series of posts.

If you're following along, this post builds on the previous ones, assuming you've already set up your server with things like the `/mnt/data` directory configured.

For reference, here are the earlier posts that led to this point:

1. [Using an old laptop as a home server](/using-an-old-laptop-as-a-home-server): Getting the laptop ready to act as a server.
2. [How to add an SSD to your home server](/how-to-add-an-ssd-to-your-home-server): Adding extra storage space.
3. [How to secure Ubuntu Server](/how-to-secure-ubuntu-server): Hardening the server with a firewall and automatic updates, which also applies to VPS setups.

My main goal was to create a place to store family photos, videos, and documents, replacing a Nextcloud instance I'd been running on a Hetzner VPS. Nextcloud has worked well, but the monthly costs were adding up, to the point where I could have bought a decent home server by now!

To achieve this, I tried various options, including running Nextcloud on the home server, but I settled on a simple setup that feels easy to maintain:

1. [Caddy](https://caddyserver.com/?ref=inkyvoxel.com) as the reverse proxy.
2. [Copyparty](https://github.com/9001/copyparty) for file hosting.

No Docker involved. I just wanted to run everything as services on Ubuntu. It's straightforward and has been reliable so far.

Below are the steps I took to set up Copyparty on my home server. 

## Setting up Caddy

First, I set up Caddy as a reverse proxy to handle requests and SSL certificates.

Install Caddy from the official repository:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Now, create a new Caddyfile at `/etc/caddy/Caddyfile`:

```
copyparty.home {
    tls internal
    reverse_proxy localhost:3923
}
```

I already had a Raspberry Pi running [Pi-hole](https://pi-hole.net/?ref=inkyvoxel.com) for ad blocking on my network. This came in handy for setting up a local DNS record, so I can access Copyparty at `https://copyparty.home` from within my home network.

In the Caddyfile, `copyparty.home` is the local DNS record I set up in Pi-hole, and `localhost:3923` is the address and port Copyparty runs on.

Save the file and restart Caddy:

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

## Setting up Copyparty

Next, install the prerequisites that Copyparty recommends, including libraries for media previews:

```bash
sudo apt install -y ffmpeg python3-pil python3-mutagen python3-argon2
```

Install Copyparty using the system-wide approach:

```bash
# Download self-extracting script to /usr/local/bin
sudo wget -O /usr/local/bin/copyparty-sfx.py \
    https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py
sudo chmod +x /usr/local/bin/copyparty-sfx.py

# Create dedicated system user (no login shell) and home directory
sudo useradd -r -s /usr/sbin/nologin -m -d /var/lib/copyparty copyparty

# Prepare data directory for volume mapping
sudo mkdir -p /mnt/data/copyparty/{mark,renee}
sudo chown -R root:copyparty /mnt/data/copyparty
sudo chmod -R 2775 /mnt/data/copyparty    # leading 2 = setgid bit
```

In the steps above, I created directories for two users: `mark` (me) and `renee` (my wife).

Since I wanted hashed passwords, I needed to generate them in advance. Run this command for each user (replace `username:password` with actual values) to generate the hashed passwords:

```bash
sudo -u copyparty python3 /usr/local/bin/copyparty-sfx.py --ah-alg argon2 --ah-gen username:password
```

This outputs an argon2 hash starting with `+`, which you'll need to paste in the config file.

Create the config file at `/etc/copyparty.conf`:

```bash
sudo nano /etc/copyparty.conf
```

Add this configuration:

```
[global]
  p: 3923  # listen port (note: two spaces before #)
  rproxy: 1  # reverse-proxy awareness behind Caddy
  e2dsa  # enable file indexing and filesystem scanning
  e2ts  # enable multimedia indexing
  usernames  # enable usernames
  ah-alg: argon2  # enable password hashing with argon2
  chpw  # allow users to change their password

# create users:
[accounts]
  mark: +uT0MzEz6kjumJxiPx7eHkCNpmQs315Dy
  renee: +cyFq6XZvHAHHU_o1uM83_U2xmfVCpPfP

# create volumes:
[/]  # create a volume at "/" (the webroot), which will
  /mnt/data/copyparty
  accs:
    A: mark,renee  # mark and renee have all permissions
    r: *  # everyone else gets read access

[/mark]
  /mnt/data/copyparty/mark
  accs:
    A: mark

[/renee]
  /mnt/data/copyparty/renee
  accs:
    A: renee
```

This config allows anyone on my network to view files, but `mark` and `renee` can log in for special admin privileges. The config also sets up private directories for each user.

Note that comments in this config file need two spaces before the `#`. I had some confusing errors related to this, so don't make the same mistake!

Adding `chpw` to the config means that once logged in, users can change their passwords via the control panel. For password resets, you'll need to SSH on to the server and update the config manually.

Now, create a systemd service file at `/etc/systemd/system/copyparty.service`:

```bash
sudo nano /etc/systemd/system/copyparty.service
```

Paste this content:

```
[Unit]
Description=copyparty file server
After=network.target

[Service]
Type=notify
SyslogIdentifier=copyparty
User=copyparty
Group=copyparty
WorkingDirectory=/var/lib/copyparty
Environment=XDG_CONFIG_HOME=/var/lib/copyparty/.config
ExecReload=/bin/kill -s USR1 $MAINPID
PermissionsStartOnly=true
AmbientCapabilities=CAP_NET_BIND_SERVICE
MemoryMax=50%
MemorySwapMax=50%
ProtectClock=true
ProtectControlGroups=true
ProtectHostname=true
ProtectKernelLogs=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectProc=invisible
RemoveIPC=true
RestrictNamespaces=true
RestrictRealtime=true
RestrictSUIDSGID=true
LogsDirectory=copyparty
ExecStart=/usr/bin/python3 /usr/local/bin/copyparty-sfx.py -c /etc/copyparty.conf

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now copyparty
sudo systemctl status copyparty
```

If you edit the service file later, remember to run `sudo systemctl daemon-reload && sudo systemctl restart copyparty`.

For me, I could now visit `https://copyparty.home` to verify it was all working.

## Updating Copyparty

Updates seem straightforward. You just download the latest version of the script and replace the old one.

```bash
# Stop the service
sudo systemctl stop copyparty

# Backup current version
sudo cp /usr/local/bin/copyparty-sfx.py /usr/local/bin/copyparty-sfx.py.backup

# Download latest version directly
sudo wget -O /usr/local/bin/copyparty-sfx.py \
    https://github.com/9001/copyparty/releases/latest/download/copyparty-sfx.py
sudo chmod +x /usr/local/bin/copyparty-sfx.py

# Start the service
sudo systemctl start copyparty
sudo systemctl status copyparty
```

Test at `https://copyparty.home`. If anything goes wrong, restore the backup:

```bash
sudo systemctl stop copyparty
sudo mv /usr/local/bin/copyparty-sfx.py.backup /usr/local/bin/copyparty-sfx.py
sudo systemctl start copyparty
```

Once it's working, clean up the old script:

```bash
sudo rm /usr/local/bin/copyparty-sfx.py.backup
```

## Uninstalling Copyparty

One nice thing about Copyparty is that it doesn't mess with your files or directories. If you decide to remove it, just delete the scripts, services, and system user. The data stays intact.

## Organising files

Before uploading everything to the server, I spent time organising my files. I gathered photos and videos from various devices and USB drives into one folder on my laptop, then used and amazing tool called [Czkawka](https://github.com/qarmin/czkawka) to find and remove duplicates and broken files. This left me with about 47,000 files.

Along the way, I found this handy command to remove empty directories:

```bash
find . -type d -empty -delete
```

Next, I used [exiftool](https://exiftool.org/) (also amazing) to move files by dates in the metadata into a `Sorted` directory with a `yyyy/mm/dd` structure inside. The command prioritised sorting by the original dates set by the devices.

```bash
exiftool -r -P -progress \
  -d '%Y/%m/%d' \
  '-Directory<Sorted/${DateTimeOriginal}' \
  '-Directory<Sorted/${CreateDate}' \
  '-Directory<Sorted/${MediaCreateDate}' \
  '-Directory<Sorted/${DateCreated}' \
  -exclude 'Sorted/**' \
  .
```

I initially sorted by modified date as well, but that was unreliable since some files had been edited years after they were created. I had to restart the process a few times due to various goofs like this! Thankfully I had backups before I started moving files around.

The `exiftool` command moved about 40,000 files, leaving 7,000 that needed another approach.

Many of these had dates in their filenames in a mix of formats, so I wrote a Python script to detect them using regexes and moved the files accordingly.

Disclaimer: I used AI to help write most of this script. I tested it thoroughly with my own files, but I highly recommend testing it yourself on a subset of your files first.

```python
# Move files from `./Unsorted` into `./Sorted/yyyy/mm/dd` if valid
# dates are found in the file name.

import os
import re
import shutil
from datetime import datetime
from pathlib import Path

def extract_date_from_filename(filename):
    """
    Extract date from common filename patterns.
    Returns (year, month, day) tuple or None if no valid date found.
    """
    patterns = [
        (r'(\d{4})(\d{2})(\d{2})', 'YMD'),  # YYYYMMDD
        (r'(\d{4})-(\d{2})-(\d{2})', 'YMD'),  # YYYY-MM-DD
        (r'(\d{4})_(\d{2})_(\d{2})', 'YMD'),  # YYYY_MM_DD
        (r'(\d{2})-(\d{2})-(\d{4})', 'DMY'),  # DD-MM-YYYY
        (r'(\d{2})_(\d{2})_(\d{4})', 'DMY'),  # DD_MM_YYYY
    ]
    
    for pattern, order in patterns:
        match = re.search(pattern, filename)
        if match:
            if order == 'YMD':
                year, month, day = match.groups()
            else:  # DMY
                day, month, year = match.groups()
            
            try:
                # Validate the date
                date_obj = datetime(int(year), int(month), int(day))
                # Sanity check: date should be between 1990 and now
                if 1990 <= date_obj.year <= datetime.now().year:
                    return (year, month, day)
            except ValueError:
                continue
    
    return None

def move_file_safely(source_path, dest_dir):
    """
    Move file to destination, preserving all metadata including timestamps.
    Uses copy-verify-delete approach for maximum safety.
    Returns (success, message).
    """
    try:
        # Create destination directory if it doesn't exist
        dest_dir.mkdir(parents=True, exist_ok=True)
        
        dest_path = dest_dir / source_path.name
        
        # Check if destination file already exists
        if dest_path.exists():
            # Compare file sizes
            if source_path.stat().st_size == dest_path.stat().st_size:
                return (False, f"File already exists with same size: {dest_path}")
            else:
                # Add suffix to avoid overwriting
                base = dest_path.stem
                ext = dest_path.suffix
                counter = 1
                while dest_path.exists():
                    dest_path = dest_dir / f"{base}_{counter}{ext}"
                    counter += 1
        
        # Get original file stats before copying
        original_stat = source_path.stat()
        original_size = original_stat.st_size
        
        # Copy file with metadata preservation (mtime, atime)
        shutil.copy2(str(source_path), str(dest_path))
        
        # Verify the copy succeeded
        if not dest_path.exists():
            return (False, f"Copy verification failed: destination file not found")
        
        copied_stat = dest_path.stat()
        if copied_stat.st_size != original_size:
            # Delete bad copy
            dest_path.unlink()
            return (False, f"Copy verification failed: size mismatch ({original_size} != {copied_stat.st_size})")
        
        # Copy succeeded and verified - now safe to delete original
        source_path.unlink()
        
        return (True, f"Moved: {source_path} -> {dest_path}")
    
    except Exception as e:
        return (False, f"Error moving {source_path}: {str(e)}")

def main():
    # Configuration
    source_dir = Path("Unsorted")
    sorted_base = Path("Sorted")
    
    if not source_dir.exists():
        print(f"Error: Source directory '{source_dir}' not found")
        return
    
    # Collect files to move
    files_to_move = []
    
    print("Scanning for files with dates in filenames...\n")
    
    for root, dirs, files in os.walk(source_dir):
        for filename in files:
            date_parts = extract_date_from_filename(filename)
            if date_parts:
                year, month, day = date_parts
                source_path = Path(root) / filename
                dest_dir = sorted_base / year / month / day
                files_to_move.append((source_path, dest_dir, f"{year}-{month}-{day}"))
    
    if not files_to_move:
        print("No files found with recognizable date patterns in filenames.")
        return
    
    # Show summary
    print(f"Found {len(files_to_move)} files with dates in filenames.\n")
    print("First 10 files to be moved:")
    for i, (src, dest, date_str) in enumerate(files_to_move[:10]):
        print(f"  {src.name} -> {dest} ({date_str})")
    
    if len(files_to_move) > 10:
        print(f"  ... and {len(files_to_move) - 10} more files")
    
    # Ask for confirmation
    print("\n" + "="*60)
    response = input("Proceed with moving these files? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("Operation cancelled.")
        return
    
    # Move files
    print("\nMoving files...\n")
    success_count = 0
    skip_count = 0
    error_count = 0
    
    for source_path, dest_dir, date_str in files_to_move:
        success, message = move_file_safely(source_path, dest_dir)
        if success:
            success_count += 1
            print(f"✓ {message}")
        else:
            if "already exists" in message:
                skip_count += 1
            else:
                error_count += 1
            print(f"⊘ {message}")
    
    # Summary
    print("\n" + "="*60)
    print(f"Summary:")
    print(f"  Successfully moved: {success_count}")
    print(f"  Skipped (duplicates): {skip_count}")
    print(f"  Errors: {error_count}")

if __name__ == "__main__":
    main()
```

After running the script, I had about 500 files left without reliable dates in the metadata or filenames. I decided to sort them manually, which was incredibly tedious. However, it felt worth the effort in the end!

## Copying files to the server

With files organised and duplicates removed, it was time to upload them to Copyparty.

The simplest way is through the web UI. I dragged and dropped the `yyyy` folders, which was about 420GB of files, and it uploaded without errors at 45 MB/s.

According to Copyparty's documentation, a faster and more reliable method is using WebDAV and [rclone](https://github.com/rclone/rclone). I was lazy this time, so I didn't use this approach, but I would have looked into this if the browser upload method failed.

## View files in the browser

Copyparty has a fun and quirky UI (in my opinion) that allows you to browse images and videos in a gallery. It's not the best I've ever used, but I quite like it!

I can now go to `https://copyparty.home` on my laptop or phone and browse almost 20 years of memories.

## What's next?

Here are a few items on my to-do list:

- **Backup strategy**: I've done manual backups to two USB drives, but automating this would be ideal.
- **iOS backups**: I need to figure out how to do direct uploads to Copyparty from iPhones for my wife and me.
- **Automatically organise new files**: I put a lot of effort into organising files. It would be great to automatically organise new files into this structure. I've been wondering if this is something I could set up on the server itself (feels risky), or if it is best done on my laptop first. 🤔
- **Replace other Nextcloud features**: I would like to move calendars and contacts from my Nextcloud instance to the home server, then I can stop paying for the VPS.

## Closing thoughts

Setting up Copyparty has been a great addition to my home server. It's simple and handles file sharing well. The organisation process was a chore but worthwhile.

If you're setting up something similar, I hope this guide helps!
