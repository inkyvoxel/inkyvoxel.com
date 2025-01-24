---
title: How to enable monitor mode on your wireless interface
description: If you want to be able to capture all packets within the range of your wireless device, you need to enable 'Monitor' mode. Here's a quick guide on how to do that.
tags:
  - cybersecurity
---

By default, your wireless interfaces are set to "Managed" mode. A wireless interface set to "Managed" mode can only capture packets with a "Destination MAC" set to its own MAC address.

If you want to be able to capture all packets within the range of your wireless device, you need to set the mode of your wireless interface to "Monitor".

However, not all wireless devices support monitor mode, so you will need to check that your device is compatible.

## Quick guide

If you have [Aircrack-ng](https://aircrack-ng.org/) installed, you can run the following commands in your terminal:

1. Run `airmon-ng` to list all your network interfaces.
2. Run `arimon-ng check kill` to stop interfering network processes.
3. Run `airmon-ng start wlan0` to start your network interface in monitor mode, in this case we are using `wlan0`.

If you are not using Aircrack-ng, you can run the following commands in your terminal:

1. Run `iwconfig` to view your wireless interfaces and check their current mode.
2. Run `ifconfig wlan0 down` to disable the network interface you wish to change, in this case it is `wlan0`.
3. Run `iwconfig wlan0 mode monitor` to change the mode of `wlan0` to "monitor".
4. Run `ifconfig wlan0 up` to re-enable your network interface.

You may need to run these commands as `root` or a user with privileges.

Once you have re-enabled your network interface, you can run `iwconfig` to confirm your wireless interface is running with "Monitor" mode:

```sh
wlan0     IEEE 802.11b  ESSID:""  Nickname:"<WIFI@REALTEK>"
            Mode:Monitor  Frequency:2.412 GHz  Access Point: Not-Associated
```
