---
title: OSI Model
description: What is the OSI Model? What are the seven layers of networking?
date: 2022-02-07
tags:
  - cybersecurity
---

When reading about networking, you may see references to "layers". These layers are defined in the OSI Model.

The Open Systems Interconnection (OSI) model defines seven layers used by computer systems to communicate over a network in a standardised way.

The layers span between the physical computer hardware, and the applications that users are interacting with. Each layer is responsible for a specific job.

## The Seven layers of the OSI Model

### 1. Physical Layer

The physical layer is the physical hardware used to transfer data over a network. This includes data cables, network interface cards and network switches.

### 2. Data-link layer

The data-link layer is responsible for transferring data between devices on the same network. At this layer, the physical addresses are added to the data being transferred. This includes the source and destination MAC addresses.

### 3. Network layer

The network layer is responsible for transferring data between different networks. This includes the use of source and destination IP addresses.

### 4. Transport layer

The transport layer is responsible for the communication between devices, handling the protocols and port numbers used to transfer data. Example protocols include TCP and UDP.

### 5. Session layer

The session layer is responsible for opening and closing connections between devices.

### 6. Presentation layer

The presentation layer is responsible for formatting data so that it is ready to be used by the application layer. This includes encryption, decryption, and compressing the data.

### 7. Application layer

The application layer is where the user interacts with the data. This includes application protocols such as HTTPS and SSH.

## Data flow

When data flows through the OSI Model, it will start at the application layer (layer 7), and then descend through the layers until is reaches the physical layer (layer 1).

The physical layer will transfer the data as a bit stream (i.e. `1` and `0`), until it reaches the physical layer of the target system.

Then, the data will ascend through the layers until it reaches the application layer, where the data will be shown to the target user.

## Closing thoughts

If I was to ask you to come up with an example of many computer systems communicating over a network, you may think of the Internet. However, the Internet does not use the OSI Model. It uses the Internet protocol suite (TCP/IP). The concepts of the OSI Model are similar to the Internet protocol suite, but the layers are slightly different.

Despite the Internet not using OSI Model, it is still important to learn. The model is often used when describing network operations, or when trouble shooting problems with a network. For example, when you are trouble shooting connection issues, it can be helpful to start at the physical layer, and work your way up through the layers until you reach the application layer.
