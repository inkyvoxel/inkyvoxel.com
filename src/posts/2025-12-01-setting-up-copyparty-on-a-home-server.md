---
title: "Setting up Copyparty on a home server"
description: ...
tags: [self-hosting, linux]
---

Over the past few months I've been tinkering with using an old laptop as a home server running Ubuntu Server.

Previous posts that have led up to this point:

1. [Using an old laptop as a home server](/using-an-old-laptop-as-a-home-server): Preparing the laptop to run as a home server
2. [How to add an SSD to your home server](/how-to-add-an-ssd-to-your-home-server): Expanding the space by adding an extra drive
3. [How to secure Ubuntu Server](/how-to-secure-ubuntu-server): Hardening the server, which can also apply to a VPS running on the internet.

These articles describe preparing your laptop to be a home server, adding a bigger SSD, security hardening including a firewall and self updates. If you want to follow along, this article continues from those articles and makes some assumptions such as `/mnt/data` being configured.

It took me a while to decide what software to run on this server, but my main goal was to store images, videos and documents for my household, which would replace an instance of Nextcloud I have had running on a Hetzner VPS for a few years.

Nextcloud on Hetzner VPS has worked fine, but the monthly costs are starting to add up to the point I probably could have bought a premium home server at this point!

I've played around with various systems, including Nextcloud installed on the home server, and tried using Docker, and some other homelab favourites, but I've found my favourite combo:

1. [Caddy](https://caddyserver.com/?ref=inkyvoxel.com) as the reverse proxy
2. [Copyparty](https://github.com/9001/copyparty) for hosting files

Not using docker, just running as a service on Ubuntu. It's simple and so far feels easy to maintain.

I have a Raspberry Pi running [Pi-hole](https://pi-hole.net/?ref=inkyvoxel.com) on my network, that I use to block ads. It came in useful for this server, as I could set up a local DNS record in the settings so I can access Copyparty via `https://copyparty.home` on my network.

## Set up Caddy:

Install from official repo:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
chmod o+r /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Create a new Caddyfile with `sudo nano /etc/caddy/Caddyfile`:

```
copyparty.home {
    tls internal
    reverse_proxy localhost:3923
}
```

Reminder that copyparty.home` was configured in Pi-hole as a local DNS.

Save and exit, then:

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

## Set up Copyparty

Install pre-requisites recommended by Copyparty, including libraries to preview media files:

```bash
sudo apt install -y ffmpeg python3-pil python3-mutagen python3-argon2
```

Install Copyparty (system-wide pattern):

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

I am going to be making two users called `mark` and `renee` so I made directories for these two users.

I am going to enable hashed passwords, so need to generate these passwords in advance. User passwords have to be unique, which is a requirement of Copyparty. I am going to allow users to change their passwords by enabling it in the config.

So first need to generate two different passwords for my two users. I am enabling `usernames` in the config, so we need to provide `username:password` to this command:

```bash
sudo -u copyparty python3 /usr/local/bin/copyparty-sfx.py --ah-alg argon2 --ah-gen username:password
```

The commands output an argon2 password which begins with `+`. You'll need to put this in the Copyparty config.

Create the runtime config file:

```bash
sudo nano /etc/copyparty.conf
```

Paste in config to `/etc/copyparty.conf`:

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

There's some quirky behaviour with the Copyparty config, it needs to have double spaces before each comment (`#`), so don't make that mistake!

Once users log in, they can change their password in the 'control panel'. Password resets require a user SSH on to the server and reconfiguring in `copyparty.conf`.

Create the systemd unit:

```bash
sudo nano /etc/systemd/system/copyparty.service
```

Paste:

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

Whenever you edit the unit file, you need to run: `sudo systemctl daemon-reload && sudo systemctl restart copyparty`.

Visit https://copyparty.home/ to confirm it is working.

## Updating Copyparty

Updating is as simple as downloading the latest version and replacing your current script.

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

Visit https://copyparty.home/ to verify the update. If something goes wrong, restore the backup:

```bash
sudo systemctl stop copyparty
sudo mv /usr/local/bin/copyparty-sfx.py.backup /usr/local/bin/copyparty-sfx.py
sudo systemctl start copyparty
```

Once confirmed working, delete the backup:

```bash
sudo rm /usr/local/bin/copyparty-sfx.py.backup
```

## Uninstalling Copyparty

The great thing about Copyparty is that it doesn't do anything odd with the directories or files. If you're unhappy with it, you can just remove Copyparty scripts, services and users, and the files remain where they are.

## Organising files

Before copying all my files to the home server, I wanted to organise them. I copied all the files I wanted from various devices and USB drives into one directory on my laptop, and used a great tool called [Czkawka](https://github.com/qarmin/czkawka) to detect duplicates and broken files. I removed these and was left with around 47k files.

Then I used a combination of `perl-Image-ExifTool`
and `exiftool` to move the files into a new structure. The below script prioritises `DateTimeOriginal` and other device meta data and moves the files into a directory called `Sorted` with a `yyyy/mm/dd` structure inside.

I added `-exclude 'Sorted/**'` so the script does not try to re-organise my `Sorted` directory.

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

As part of this I found a useful command for deleting all empty folders inside the current directory:

```bash
find . -type d -empty -delete
```

I originally moved by file modify date as well, but quickly realised that was inaccurate, because some files were modified years after they were taken, and I had to start the organising process all over again! The command above sorted around 40k files, leaving 7k for me to find a new method of organising.

I noticed that maybe of the files had dates in the file names, so I wrote a python script to try and extract the dates using regexes and then move the files into my `Sorted/yyyy/mm/dd` directories.

Disclaimer: I used AI to help generate most of this script, but I tested it thoroughly for my own use case.

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

After running this script, I was left with around 500 files that did not have valid meta data, modified dates or dates in the filename, so I had to go through them all manually! Sometimes I was lucky and 50 or so were from the same event, so I could move them easily. But others I needed to hunt down details in the photos, such as which outfit my daughter was wearing, or going through my calendar to figure out what day I met up with old friends and family, to help match the files up to a date. I am not going to lie, it was painful, but at the same time it was nice to look at so many old photos.

This whole process took me about 2 weeks to organise my photos.

## Copying the files over

Once the photos were organised and de-duped, it was time to copy them on to the Copyparty server.

You can use Copyparty's web UI for uploading files. I just dragged and dropped 500GB of files into the UI and watched it upload. It was going around 50 M/s. I just let it do its thing and a few hours later it was finished.

A more reliable, faster and recommended way is to use WebDAV and [rclone](https://github.com/rclone/rclone), but I was feeling lazy so I just used the web UI. I also love the quirky styling in Copyparty web UI. Another reason is I want my wife to start using this to backup her files, and I imagine she would prefer the web UI approach.

## What's next?

- Need a backup strategy. I've currently backed up on two spare USB hard drives. I'm currently backing up manually, but would love to automate it in the future.
- I want to figure out how to backup files directly from iOS to Copyparty. My wife and I currently both use iPhones.
- I want to replace calendar and contacts I currently have on a Nextcloud instance in a VPS. Need to find software to install on my home server to do this.

## Closing thoughts

...