---
title: How to copy an SSH key to a new Linux machine
description: A quick guide to restoring an existing SSH key pair from a password manager onto a new Linux install, with the right file permissions.
tags: [linux, cybersecurity]
---

If you keep your SSH key pair in a password manager rather than backing up the files directly, you need to manually recreate the key files whenever you set up a new Linux machine. I do this often enough after reformats that I decided to write it down for future me.

## 1. Create the .ssh directory

```bash
# Create the directory
mkdir -p ~/.ssh

# Set the correct permissions
chmod 700 ~/.ssh
```

## 2. Create the key files and paste in the keys

Create the private and public keys, pasting in the matching key content from your password manager. Make sure there's no extra blank line or trailing whitespace, then save and exit in nano.

(Swap `id_ed25519` for `id_rsa` etc. if you use a different key type.)

```bash
# Create the private key
nano ~/.ssh/id_ed25519

# Create the public key
nano ~/.ssh/id_ed25519.pub
```

## 3. Set the correct permissions

Set the correct permissions for each key:

```bash
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

Verify with:

```bash
ls -la ~/.ssh
```

You should see:

```
drwx------  ...  .
-rw-------  ...  id_ed25519
-rw-r--r--  ...  id_ed25519.pub
```

SSH will refuse to use the key if these permissions aren't set correctly, usually with an "UNPROTECTED PRIVATE KEY FILE" error.

## 4. Test the key

```bash
ssh-add ~/.ssh/id_ed25519
```

If this succeeds, the key is loaded and ready to use with GitHub or any server that already trusts it.

## Closing thoughts

This is the whole process. No need to regenerate a new key pair and update it everywhere just because you reformatted a machine. Keep the key pair in your password manager, and these four steps are all you need on the next fresh install.
