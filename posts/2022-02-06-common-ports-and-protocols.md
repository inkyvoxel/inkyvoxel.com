---
title: Common ports and protocols
description: Here are a list of common ports and protocols you will see when scanning networks.
date: 2022-02-06
tags:
  - cybersecurity
---

When you are scanning networks, there are some common ports and protocols that you will see again and again. Here is a list of common TCP and UDP ports, with short descriptions of what each one is used for.

## TCP

Common TCP ports:

- Port 21 is FTP - File Transfer Protocol (FTP) is used to transfer files to and from a remote location.
- Port 22 is SSH - Secure Shell (SSH) allows you to send remote commands to a server. Traffic over SSH is encrypted.
- Port 23 is Telnet - Telnet allows you to send remote commands to the server. Traffic over telnet is not encrypted.
- Port 25 is SMTP - Simple Mail Transfer Protocol (SMTP) is an e-mail protocol.
- Port 53 is DNS - Domain Name Server (DNS) is used to resolve domain names to IP addresses.
- Port 80 is HTTP - Hypertext Transfer Protocol (HTTP) is an insecure and unencrypted protocol used for communicating between a client and a server. It is commonly used for web servers.
- Port 110 is POP3 - Post Office Protocol version 3 (POP3) is an e-mail protocol.
- Port 139 is SMB - Samba (SMB) is a file share protocol. This port is typically used on older versions of Windows.
- Port 143 is IMAP - Internet Message Access Protocol (IMAP) is an e-mail protocol.
- Port 443 is HTTPS - Hypertext Transfer Protocol Secure (HTTPS) is the secure and encrypted version of HTTP, a protocol used for communicating between a client and a server. It is commonly used for web servers.
- Port 445 is SMB - Samba (SMB) is a file share protocol. This port is typically used on newer versions of Windows.

## UDP

Common UDP ports:

- Port 53 is DNS - Domain Name Server (DNS) is used to resolve domain names to IP addresses.
- Port 67 and 68 are DHCP - Dynamic Host Configuration Protocol (DHCP) is used for managing IP addresses within a network.
- Port 69 is TFTP - Trivial File Transfer Protocol (TFTP) is similar to FTP, but uses UDP instead of TCP.
- Port 161 is SNMP - Single Network Management Protocol (SNMP) provides a framework for asking devices about their performance and configuration over the network. The protocol is used by many different network management tools.
