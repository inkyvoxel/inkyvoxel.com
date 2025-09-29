---
title: How to secure Ubuntu Server
description: Learn essential Ubuntu Server security best practices including SSH hardening, firewall configuration, automated updates, and Fail2Ban setup. Step-by-step guide to protect your Linux server from security threats.

tags:
  - self-hosting
  - cybersecurity
  - linux
---

A fresh Ubuntu Server installation is vulnerable to attacks. This guide covers the essential security measures you should implement immediately after deployment to protect your server from common threats.

This guide will help you:

- Enable automated updates
- Create a non-root user
- Configure SSH keys and disable password logins
- Configure a firewall
- Configure Fail2Ban to protect your server from brute-force login attempts

When you are ready to begin, SSH to your server using the `root` account.

## Update the system and enable automatic security patches

Regular updates patch vulnerabilities, so set up automated updates:

```bash
sudo apt update && sudo apt upgrade -y
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
systemctl enable unattended-upgrades
```

This won't reboot your server. You'll need to occasionally SSH on and reboot it to apply the latest kernel updates. I wrote a previous post explaining [how to safely reboot a Linux server](/how-to-reboot-a-linux-server).

## Create a non-root user with sudo privileges

Avoid using the root account for daily tasks. Create a new user with sudo privileges:

```bash
adduser username  # Replace 'username' and follow prompts to set password
usermod -aG sudo username
```

You can test this by running `su - username` then `sudo whoami`.

## Set up SSH key authentication

Now you need to set up SSH key authentication for your new user.

### Using new SSH key

Generate new keys on your local machine:

```bash
ssh-keygen -t ed25519
```

Copy public key:

```bash
ssh-copy-id username@server_ip
```

### Using existing SSH key

If you already have an SSH key pair, copy your public key to the server:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub username@server_ip
```

Replace `id_rsa.pub` with your actual public key filename (e.g., `id_ed25519.pub`).

## Disable password authentication and root login for SSH

Now you have copied over your SSH key, enforce key-only access and block the `root` user.

⚠️ Make sure you test SSH login as the new user before proceeding, as you could lock yourself out of the server!

Edit `/etc/ssh/sshd_config` and set the following:

```bash
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

After making those changes, restart SSH:

```bash
systemctl restart ssh
```

Note: If you're using [Coolify](https://coolify.io/?ref=inkyvoxel.com), you will need to use `PermitRootLogin without-password` instead of `PermitRootLogin no`, as Coolify doesn't currently support non-root users for managing servers.

## Configure a firewall

For most web servers, you only want to allow traffic for HTTP (80), HTTPS (443), and SSH (22). Deny other ports by default.

If your VPS provider has a firewall service (e.g. [Hetzner](https://docs.hetzner.com/cloud/firewalls/getting-started/creating-a-firewall/?ref=inkyvoxel.com)), you can configure it outside your server.

If the provider doesn't have a firewall service, you can also configure one using Uncomplicated Firewall (UFW) on the server itself.

```bash
sudo apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
ufw status verbose
```

You may need to open additional ports for your specific services (e.g., 25 for mail, 3306 for MySQL, 5432 for PostgreSQL). Always follow the principle of least privilege by only opening what you need.

## Install and configure Fail2Ban

Fail2Ban bans IPs after failed login attempts.

```bash
sudo apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

By default, it bans after 5 failures within 10 minutes for 10 minutes. To customise, create `/etc/fail2ban/jail.local` (which overrides `/etc/fail2ban/jail.conf`) and add your settings there.

## Closing thoughts

These steps establish a baseline security posture for Ubuntu Server. It is only a starting point, and not a complete security solution. It should be enough to stop your hobby projects from getting pwned.

Regular security audits, log monitoring, and staying informed about vulnerabilities remain essential for maintaining server security.

If you're looking for a server provider, consider signing up to Hetzner (they're great) via my [referral link](https://hetzner.cloud/?ref=zQMVsmYxZm7B). You'll receive €20 in credit, and I'll get €10 as a referral bonus.
