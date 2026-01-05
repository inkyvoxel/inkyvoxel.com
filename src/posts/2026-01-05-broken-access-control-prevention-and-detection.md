---
title: "Broken Access Control: Prevention and Detection"
description: A short guide to preventing and detecting Broken Access Control, the top risk to web applications in the OWASP Top 10 2025 list.
tags: [cybersecurity]
---

{% include 'disclaimer.liquid' %}

In my previous post on the [OWASP Top 10 2025](/owasp-top-10-2025), I discussed how Broken Access Control remains the number one security risk for web applications. This vulnerability occurs when access controls are poorly enforced, allowing users to act outside their intended permissions. It can lead to unauthorised disclosure, modification, or destruction of data.

This post provides practical tips for software engineers to prevent Broken Access Control. I'll also cover detection techniques for bug hunters, pentesters, and curious engineers who want to test their own applications (you're doing that, right? 🤓).

## What is Broken Access Control?

Broken Access Control happens when an application fails to properly restrict what authenticated users can do. This violates the principle of least privilege, where users should only access resources and perform actions they're authorised for.

Common issues include:
- Insecure Direct Object References (IDOR), where user-supplied input like IDs are not validated
- Privilege escalation through URL manipulation or metadata tampering
- Bypassing front-end restrictions by directly calling the backend APIs
- Misconfigured CORS (Cross-Origin Resource Sharing) allowing unauthorised cross-origin requests

## Prevention tips

Here are some tips to prevent Broken Access Control in your applications. Use this as a checklist to review your own code and configurations.

1. **Implement deny-by-default access controls**: Grant permissions only to specific users, roles, or capabilities. Use role-based access control (RBAC) or attribute-based access control (ABAC).
2. **Enforce server-side checks**: Never rely on front-end controls alone. Always validate access on the server-side.
3. **Validate user inputs**: Sanitise and validate all inputs, especially those controlling access like user IDs or parameters.
4. **Use secure frameworks**: Leverage built-in security features of frameworks that handle authentication and authorisation.
5. **Implement proper session management**: Use short-lived sessions, invalidate them on logout, and avoid storing sensitive data in cookies.
6. **Log access control failures**: Monitor and alert on unauthorised access attempts.
7. **Perform regular security audits**: Review code and configurations for access control flaws. If your product makes money, consider hiring a specialist third-party company to conduct a penetration test.
8. **Model access controls for data ownership**: Ensure users can only access their own data by enforcing record ownership.
9. **Minimise CORS usage**: Cross-Origin Resource Sharing (CORS) allows web pages from different origins to access your API. Minimise its use and configure it securely to prevent unauthorised cross-origin requests.
10. **Include access controls in tests**: Write unit and integration tests to verify access restrictions.

## Detection techniques

If you're testing an application for Broken Access Control vulnerabilities, here are some techniques to try.

1. **Force browsing**: Directly access restricted URLs like admin panels by guessing paths (e.g. `/admin`) or using discovered links.
2. **Parameter tampering**: Modify URL parameters, cookies, or form fields to change user IDs or roles.
3. **HTTP method testing**: Try different HTTP methods (e.g. `GET`, `POST`, `PUT`, `DELETE`) on endpoints to bypass restrictions.
4. **IDOR checks**: Substitute user-supplied identifiers with others to access unauthorised data.
5. **Multi-step process skipping**: Bypass workflow steps by directly submitting to later endpoints.
6. **Referer header manipulation**: The HTTP Referer header indicates the page from which the request originated. Some applications use it to restrict access (e.g. only allowing requests from trusted pages). Forge this header to pretend the request came from an authorised page, potentially bypassing restrictions.
7. **Token tampering**: Modify JWTs or other tokens to escalate privileges.
8. **CORS testing**: Check for misconfigurations allowing unauthorised origins.
9. **Directory exposure**: Web servers may allow directory listing, revealing all files in a folder, or expose sensitive files like backups, configuration files, or source code (e.g. accessing `/backup.zip` or `/.git/config`). Look for these by probing common paths or using tools to scan for exposed resources.
10. **Automated scanning**: Use tools like Burp Suite or OWASP ZAP to scan for access control issues.

## Closing thoughts

Preventing Broken Access Control requires a defence-in-depth approach, combining secure coding practices, proper configuration, and regular testing. By implementing these tips, software engineers can significantly reduce the risk of unauthorised access. For bug hunters and pentesters, these detection techniques can help identify vulnerabilities before attackers do.

Security is an ongoing process. Stay updated with the latest OWASP guidelines and test your applications thoroughly.