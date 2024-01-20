---
title: What is a MAC Address?
description: You've probably heard the term 'MAC address' used a lot, but what is it, and what is it used for?
tags:
  - cybersecurity
---

A MAC address is a twelve digit hexadecimal number that is most commonly displayed with a colon separating every two digits, e.g. `44:87:ab:91:11:ba`.

MAC stands for "Media Access Control". A MAC address is a physical identifier assigned to a network interface by the device's manufacturer.

All network cards, wired or wireless, come with a specific physical MAC address that is unique to that device. This means that no two network interfaces in the world will have the same physical MAC address.

Physical MAC addresses are permanently assigned. If you disconnected your network card and gave it to your friend to use in their computer, the physical MAC address will stay the same.

## What are MAC addresses used for?

MAC addresses are used within networks to identify different devices. When devices are communicating over the network, they send packets containing a "Source MAC" and a "Destination MAC".

Network administrators can use MAC addresses to filter devices connecting to their network, by either allowing or blocking specific MAC addresses.

## How to find your MAC address

On Linux, you can find your MAC address using `ifconfig` in your terminal.

Running `ifconfig` will print out information about your network interfaces. We are most interested in the lines starting with `ether`, which is the most common "hardware class" of the network interfaces. This is where we can find our MAC address.

```sh
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 33:44:15:14:ab:f6  txqueuelen 1000  (Ethernet)

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 2312
        ether 44:87:ab:91:11:ba  txqueuelen 1000  (Ethernet)
```

In the above example, the MAC address of `eth0` (the Ethernet interface) is `33:44:15:14:ab:f6`, and the MAC address of `wlan0` (the wireless interface) is `44:87:ab:91:11:ba`.

## MAC addresses and privacy

As mentioned above, the physical MAC address of a network interface is permanently set by the device's manufacturer. This can compromise your privacy when you connect to different networks (e.g. at home, work, school, a coffee shop), as network administrators can use MAC addresses to identify devices.

However, if you want to improve your anonymity, you can change your MAC address using software.

## How to change your MAC address on Linux

On Linux, you can change your MAC address by using `ifconfig` in your terminal.

### Quick guide

1. `ifconfig` to get a list of network interfaces.
2. `ifconfig wlan0 down` to disable the network interface.
3. `ifconfig wlan0 hw ether 00:12:34:56:78:90` to change the MAC address to `00:12:34:56:78:90`.
4. `ifconfig wlan0 up` to re-enable the network interface.
5. `ifconfig` to confirm changes have been made.

Be warned that the MAC address will revert back to the physical MAC address once you reboot your computer.

### Detailed guide

Run `ifconfig` to get a list of network interfaces and their current MAC addresses:

```sh
eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 33:44:15:14:ab:f6  txqueuelen 1000  (Ethernet)

wlan0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 2312
        ether 44:87:ab:91:11:ba  txqueuelen 1000  (Ethernet)
```

You need to temporarily disable the interface before you can edit it. If you wanted to change `wlan0`, run `ifconfig wlan0 down`.

If you wanted to change `wlan0` to use `00:12:34:56:78:90` MAC address, you would run `ifconfig wlan0 hw ether 00:12:34:56:78:90`.

Let's break this command down:

- `ifconfig wlan0` to target `wlan0`.
- `hw` option to edit the "hardware" configuration of the network interface.
- `ether` to specify the "hardware class" of `wlan0` (you can get the "hardware class of all your network interfaces by running `ifconfig`).
- `00:12:34:56:78:90` to set the desired MAC address.

Finally, you need to re-enable your network interface. You can do this by running `ifconfig wlan0 up`.

Confirm the change has been made by running `ifconfig` once more.

It is important to note that once you reboot your computer, the MAC address will revert back to the physical MAC address.