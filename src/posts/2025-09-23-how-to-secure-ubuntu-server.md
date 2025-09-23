---
title: How to secure Ubuntu Server
description: Learn essential Ubuntu Server security best practices including SSH hardening, firewall configuration, automated updates, and Fail2Ban setup. Step-by-step guide to protect your Linux server from security threats.

tags:
  - linux
  - cybersecurity
---

A fresh Ubuntu Server installation is vulnerable to attacks. This guide covers the essential security measures you should implement immediately after deployment to protect your server from common threats.

## Update the system and enable automatic security patches

Regular updates patch vulnerabilities, so set up automated updates:

```bash
apt update && apt upgrade -y
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
systemctl enable unattended-upgrades
```

This won't reboot your server. You'll need to occasionally SSH on and reboot it to apply the latest kernel updates.

## Create a non-root user with sudo privileges

Avoid using the root account for daily tasks.

```bash
adduser username  # Replace 'username' and follow prompts to set password
usermod -aG sudo username
```

You can test this by running `su - username` then `sudo whoami`.

## Set up SSH key authentication

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

Enforce key-only access and block `root` user.

Edit `/etc/ssh/sshd_config`:

```bash
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

Restart SSH: `systemctl restart ssh`.

Test key login as new user before closing root session!

## Configure a firewall

For most web servers, you only want to allow traffic for HTTP (80), HTTPS (443), and SSH (22). Deny other ports by default.

If your VPS provider has a firewall service (e.g. [Hetzner](https://docs.hetzner.com/cloud/firewalls/getting-started/creating-a-firewall/)), you can configure it outside your server.

You can also configure using Uncomplicated Firewall (UFW) on the server itself.

```bash
apt install ufw -y
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw enable
ufw status verbose
```

You may need to open additional ports for your specific services (e.g., 25 for mail, 3306 for MySQL, 5432 for PostgreSQL). Always follow the principle of least privilege—only open what you need.

## Install and configure Fail2Ban

Fail2Ban bans IPs after failed login attempts.

```bash
apt install fail2ban -y
systemctl enable fail2ban
systemctl start fail2ban
```

By default it bans after 5 failures in 10 min for 10 min. Edit `/etc/fail2ban/jail.local` to customise this.

## Closing thoughts

These steps establish a baseline security posture for Ubuntu Server. It is only a starting point, and not a complete security solution. It should be enough to stop your hobby projects from getting pwned.

Regular security audits, log monitoring, and staying informed about vulnerabilities remain essential for maintaining server security.
