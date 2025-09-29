---
title: Protecting your server with Cloudflare
description: A guide to securing your VPS by proxying it through Cloudflare for DDoS protection, SSL, and performance benefits.
tags: [self-hosting, cybersecurity]
---

Running a VPS on the internet leaves your server vulnerable to threats such as DDoS attacks. This guide will explain how Cloudflare can be used to proxy traffic to your server, concealing its IP address and adding a vital layer of security. Best of all, this can be achieved using Cloudflare’s generous free tier.

## Why use Cloudflare?

Cloudflare acts as a reverse proxy between your VPS and the internet, providing several benefits:

- **IP address concealment**: Hides your server's real IP address from the public, making it harder for attackers to launch targeted attacks.
- **DDoS protection**: Mitigates distributed denial-of-service attacks by absorbing and filtering malicious traffic before it reaches your server.
- **SSL/TLS encryption**: Provides free SSL certificates and automatically enforces HTTPS, ensuring secure connections.
- **Caching**: Speeds up your site by caching static content at the edge, reducing load on your VPS.
- **Firewall rules**: Allows you to create custom rules to block malicious traffic based on IP, country, or other criteria.
- **Analytics and insights**: Offers detailed analytics on your traffic, threats, and performance.

## Setting up Cloudflare

1. **Sign up for Cloudflare**: If you don't have an account, create one at [cloudflare.com](https://cloudflare.com/?ref=inkyvoxel.com).

2. **Add your domain**: In the Cloudflare dashboard, under 'Account home', click 'Onboard a domain'. Enter your domain name and follow Cloudflare's instructions.

3. **Update nameservers**: Cloudflare will provide two nameservers. Update your domain registrar's settings to point to these nameservers. This may take up to 24 hours to propagate.

4. **Configure DNS**: Once your domain is active on Cloudflare, go to the DNS settings. Add an `A` record for your domain (e.g. `@` or `www`) pointing to your VPS's IP address. Ensure the 'Proxy status' is set to 'Proxied' (the cloud icon should be orange).

5. **Enable SSL**: Navigate to SSL/TLS > Overview, and set the encryption mode to 'Full (strict)' or 'Full' to ensure end-to-end encryption. Cloudflare will issue a free SSL certificate.

6. **Test your setup**: Visit your domain to ensure it's loading through Cloudflare. Check the headers for `CF-RAY` to confirm traffic is being proxied. `CF-CACHE-STATUS` will indicate the caching status.

For additional protection, consider updating your server's firewall to only allow traffic from [Cloudflare's IP ranges](https://www.cloudflare.com/en-gb/ips/?ref=inkyvoxel.com). These IP addresses change over time, which can become a maintenance burden. You can get an up to date list of IPs from [Cloudflare's API](https://developers.cloudflare.com/api/resources/ips/?ref=inkyvoxel.com) should you wish to automate this process.

## Closing thoughts

By implementing Cloudflare as a proxy for your VPS, you can add a robust layer of protection against common threats while also improving performance.

It's worth exploring Cloudflare's dashboard, as there are lots of additional tools and services available. Please note that while the services mentioned in this article are free, many of the more powerful ones cost money. 💸
