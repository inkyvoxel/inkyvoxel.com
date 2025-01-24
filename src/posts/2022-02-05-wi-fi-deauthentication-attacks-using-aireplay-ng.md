---
title: Wi-Fi deauthentication attacks using aireplay-ng
description: Deauthentication attacks allow you to disconnect any device from any network, even if you are not connected to the network.
tags:
  - cybersecurity
---

Wi-Fi deauthentication attacks allow you to disconnect any device from any network, even if you are not connected to the network. You don't even need to know the network's password.

Let's start by describing how to accomplish a Wi-Fi deauthentication attack:

1. Find the MAC address of the target network's access point.
2. Find the MAC address of the target client you wish to disconnect.
3. Change the MAC address of your wireless interface to match the target client's MAC address.
4. Send a request to the target network's access point, requesting to disconnect from the network.
5. Change the MAC address of your wireless interface to match the target network's access point.
6. Send a request to target client, requesting them to disconnect from the network.

This process is very cumbersome, but fortunately it can be automated using aireplay-ng, which is part of the [Aircrack-ng](https://aircrack-ng.org/) suite.

## Quick guide

Firstly, you need to put your wireless interface into monitor mode. I wrote how to do that [here](/how-to-enable-monitor-mode/).

Secondly, you need to find the MAC address of the client you wish to deauthenticate, and the MAC address of the wireless access point it is connected to. You can achieve this using airodump-ng, which I wrote about [here](/how-to-sniff-wi-fi-packets-using-airodump-ng/).

Next, you need to run `aireplay-ng` in your terminal. Here is an example:

```sh
aireplay-ng --deauth 1000 -a 00:11:22:33:44:55 -c 00:AA:BB:CC:DD:EE wlan0
```

Let's break down the parameters:

1. `--deauth` to specify you wish to run a deauthenticate attack.
2. `1000` is the number of requests you wish to send. You can send one or multiple. In this example we are sending 1000. The larger the number, the longer the attack will last.
3. `-a 00:11:22:33:44:55` is the MAC address of the target access point.
4. `-c 00:AA:BB:CC:DD:EE` is the MAC address of the target client.
5. `wlan0` is the wireless interface you are running in monitor mode.

You may need to run the command with `sudo` depending on your user privileges.

The target client will be disconnected from the target access point until your command has finished running.

## Closing thoughts

This is a denial of service type attack, so please only do this against networks you own, or have explicit permission to attack! 🙏
