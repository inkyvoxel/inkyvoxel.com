---
title: How to sniff Wi-Fi packets using airodump-ng
description: Learn how to use airodump-ng to sniff all Wi-Fi packets within range of your wireless adapter, even if you are not connected to the target's network.
date: 2022-01-31
tags:
  - cybersecurity
---

Airodump-ng installs as part of the [Aircrack-ng](https://aircrack-ng.org/) suite, which is a collection of tools to assess Wi-Fi network security.

Before you can begin using airodump-ng, you will need to enable "Monitor" mode on your wireless interface. I previously wrote a guide on [how to enable monitor mode on your wireless interface](/posts/how-to-enable-monitor-mode).

Once you have enabled monitor mode, you can run `airodump-ng` with the name of the wireless interface you wish to use, e.g. `airodump-ng wlan0`.

Running `airodump-ng wlan0` will display a table of information about the wireless access points within range of your wireless adapter.

The table contains the following columns of information:

- "BSSID" shows you the MAC address of the access points.
- "PWR" shows the "power" of the network. The higher the number, the better the signal strength.
- "Beacons" shows the number of announcement packets sent by the network. Every network, even if it is hidden, will send announcement packets.
- "#Data" shows the number of captured data packets.
- "#/s" shows the number of data packets captured in the past ten seconds.
- "CH" shows the "Channel" the network runs on.
- "MB" shows the maximum speed supported by the network.
- "ENC" shows the encryption method used by the network.
- "CIPHER" shows the cipher used by the network.
- "AUTH" shows the authentication used by the network.
- "ESSID" shows the name of the network, the same name displayed when you try to connect to the network from your laptop or phone.

Once you are done, you can press "CTRL" and "C" to quit airodump-ng.

## Filtering

Running `airodump-ng` can give an overwhelming amount of information about all of the wireless devices in range. However, you can filter your scans to focus on a specific network or device.

Here are some useful parameters you can use with `airodump-ng` to filter your results:

- `--bssid` to filter on a specific access point's MAC address.
- `--channel` to filter on a specific channel. This prevents airodump-ng hopping over many channels.
- `--band` to filter on a specific Wi-Fi band. I wrote more information about this below.

Using `--manufacturer` can display the device's manufacturer, although not all devices will show this information.

While a scan is in progress, there are some interactive keys you can press to filter what is being displayed:

- Pressing the "A" key will toggle between access points (e.g. routers) and stations (e.g. laptops or phones). This is useful if you want to see which network a device is connecting to.
- You can press "TAB" to select an access point, and then use the arrow keys to select other devices.
- While selecting a device, you can press the "M" key to "mark" it with a colour. Keep pressing "M" to toggle through more colours. This will also highlight the devices connected to the access point using the same colour.

## Wi-Fi bands

By default, airodump-ng only scans for 2.4 GHz networks. However, if your wireless adapter supports 5 GHz, you can specify to scan this band using the `--band` option.

The supported bands are "a", "b" and "g". Here's a quick summary of the bands:

- "a" uses 5 GHz
- "b" uses 2.4 GHz
- "g" uses 2.4 GHz

When using the `--band` option, you can specify a single band, or a combination of bands. For example, to scan all bands, you can run `airodump-ng --band abg wlan0`.

Keep in mind that when you are sniffing multiple bands, airodump-ng is doing a lot more work, and it may run slower than sniffing just one band.

## Saving the results

You can save the results of your scan by using the `--write <prefix>` parameter. This will create a bunch of files using the `prefix` filename.

For example, running `airodump-ng wlan0 --write test` will create the following files in the current directory:

- test-01.cap
- test-01.csv
- test-01.kismet.csv
- test-01.kismet.netxml
- test-01.log.csv

Running `airodump-ng wlan0 --write test` a second time (using the same prefix) will create files prefixed with `test-02`.

The `.cap` file can be opened using [Wireshark](https://www.wireshark.org/), however all the packet data will be encrypted. I plan to write about how to decrypt this data in a future article!

## Closing thoughts

This was a brief introduction to sniffing packets using airodump-ng. The tool can do so much more, so I highly recommend reading the man-pages (running `man airodump-ng` in your terminal), or reading the [online documentation](https://aircrack-ng.org/doku.php?id=airodump-ng).
