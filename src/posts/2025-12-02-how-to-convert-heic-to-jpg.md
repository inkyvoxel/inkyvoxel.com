---
title: How to Convert HEIC to JPG
description: A step-by-step guide on converting HEIC images to JPG format using command-line tools on Linux.
tags: [linux]
---

This guide will walk you through converting HEIC images to JPG using command-line tools on Linux.

I recently moved almost 20 years of family photos and videos to a home server. In more recent years, my wife and I have been taking photos on iPhones, and many of the files were stored in a `.heic` format. While [setting up my home server](/setting-up-copyparty-on-a-home-server) I noticed that I couldn't open them on Linux without installing additional codecs or converting the files. I decided to convert the files for best compatibility across all my devices.

## Prerequisites

To convert HEIC files, you'll need the `libheif` library and its tools installed.

On Fedora, install them with:

```bash
sudo dnf install libheif-freeworld libheif-tools
```

For other distributions, check your package manager or build from source as described in the [libheif repository](https://github.com/strukturag/libheif).

## Converting HEIC files to JPG

Once the `libheif` library is installed, you can use the `heif-convert` command to convert individual files to JPG:

```bash
heif-convert filename.heic
```

To convert **all** HEIC files in the current directory to JPG:

```bash
find . -type f -iname "*.heic" | while read -r file; do
    echo "Converting $file"
    heif-convert "$file"
done
```

This script finds all HEIC files in the current directory, loops through them, and uses `heif-convert` to create JPG versions. The output files will have the same name as the original but with a `.jpg` extension, placed in the same directory.

`heif-convert` preserves image quality as much as possible when converting. I personally couldn't tell the difference in quality.

If you don't want to keep the original HEIC files, you can permanently delete them all with:

```bash
find . -type f -iname "*.heic" -delete
```

## Closing thoughts

HEIC seems to be a pain for non-Apple devices. While codecs can be installed to view them, I preferred to convert them to JPG for the best compatibility.

After converting all my photos, I found the iOS camera app has a setting to create files in 'most compatible' format (JPG) instead of 'high efficiency' (HEIC), which I've now enabled to reduce the need for future conversions.
