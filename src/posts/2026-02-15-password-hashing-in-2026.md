---
title: Password Hashing in 2026
description: Exploring the evolution of password hashing from MD5 to bcrypt to Argon2, with best practices for secure modern web applications.
tags: [cybersecurity, software-engineering]
---

Cryptographic failures remain a critical risk in web applications, ranking as #4 in the OWASP Top 10 (2025). In my previous post on the [OWASP Top 10 (2025)](/owasp-top-10-2025), I highlighted how weak encryption and poor key management can lead to data breaches. This post dives deeper into one common pitfall: insecure password hashing.

When was the last time you checked your hashing algorithms? With the rise of AI-assisted coding and rapid development cycles, it's easy to overlook outdated practices. This post traces the evolution of password hashing, from the broken MD5 approach to bcrypt's improvements, and finally to Argon2 as today's best practice.

## Hashing algorithms overview

Password hashing transforms plaintext passwords into hashes for secure storage. Unlike encryption, hashing is one-way. It's designed so that even if the hash is compromised, the original password is computationally infeasible to reverse. However, weak algorithms like MD5 or SHA-256 (without proper salting) can be cracked quickly using rainbow tables (pre-computed databases of password-to-hash mappings) or brute-force attacks (systematically trying every possible password).

Modern hashing algorithms incorporate salting (random data added to each password) and computational cost factors to slow down attacks as computer hardware gets faster.

## MD5: the broken legacy

Here's how developers used to handle passwords in the early days of web applications (and this is pretty much how I was taught at university). Common approaches included storing the hash and salt in separate database columns, or concatenating them together in a single field. Either way, you'd add the salt to the password, hash it with MD5 (or SHA-256, SHA-512, SHA-1 etc.), and compare it to the stored hash. Simple enough, right?

The problem is that MD5 is fundamentally broken for password security. It's incredibly fast to compute. Modern GPUs can calculate billions of MD5 hashes per second. Even with salting, attackers can quickly crack weak passwords through brute-force attacks. Rainbow tables make unsalted MD5 hashes trivial to reverse.

Here's what an MD5 hash looks like:

```
5f4dcc3b5aa765d61d8327deb882cf99
```

That's actually the MD5 hash of the word "password", which is surprisingly (or unsurprisingly) one of the most common passwords ever. Even with proper salting, MD5's speed means weak passwords fall quickly to brute-force attacks.

Notice anything else? There's no metadata. You can't tell what algorithm was used, whether it was salted, or how many iterations were performed. This lack of structure meant developers had to manage salt storage and algorithm versioning separately, leaving plenty of room for mistakes.

This led developers to look for better options.

## bcrypt: a step forward

bcrypt changed things by combining the hash, salt, and algorithm parameters into a single self-describing string. Introduced in 1999, it addressed many of MD5's weaknesses:

- **Self-describing format**: The hash includes all parameters needed for verification.
- **Built-in salt**: No need for a separate database column; the salt is embedded.
- **Future-proofing**: The "cost" parameter (work factor) can be increased over time to counter faster hardware.

However, despite these strengths, bcrypt is not the current best practice. bcrypt uses relatively less memory than modern alternatives, making it more susceptible to attacks compared to algorithms like Argon2 (discussed below). OWASP still considers bcrypt acceptable for existing systems, but recommends Argon2 for new implementations.

Here's what a bcrypt hash looks like:

```
$2b$13$rY.KB8G6G2v6rX8v9z7wluR5Qz3vK8pJ9mQw2fXjH8kL5pN6tR7uV
```

Here's what each part means:

- `$2b$` – Modern bcrypt variant (other variants include 2a, 2x, 2y)
- `13` – Cost factor (2^13 = 8,192 iterations)
- `$rY.KB8G6G2v6rX8v9z7wlu` – 22-character salt (Base64 encoded)
- `R5Qz3vK8pJ9mQw2fXjH8kL5pN6tR7uV` – 31-character password hash

While bcrypt was a major improvement over MD5, its fixed 4 KB memory footprint means that modern hardware can run many bcrypt operations in parallel, making GPU-based cracking more feasible than with "memory-hard" alternatives.

## Argon2: the current best practice

As of 2026, Argon2 is OWASP's recommended algorithm for password hashing. It comes in three variants:
- **Argon2d**: Uses data-dependent memory access (each memory lookup location depends on data from previous computations), making it very resistant to GPU attacks but vulnerable to timing attacks that can reveal memory access patterns.
- **Argon2i**: Uses data-independent memory access (predictable patterns), eliminating timing vulnerabilities but slightly easier to optimise for specialised hardware.
- **Argon2id**: Hybrid approach combining both approaches: data-independent in early passes (side-channel resistant) and data-dependent in later passes (GPU-resistant).

I don't fully understand these variants, but Argon2id is generally preferred for most applications!

Key advantages of Argon2:
- **Memory-hard**: Requires significant memory, making it resistant to both CPU and GPU attacks.
- **Configurable parameters**: Memory size (m), iterations (t), and parallelism (p) allow fine-tuning for security vs. performance.
- **Future-proof**: Can be adjusted as hardware evolves.

Here's what an Argon2 hash looks like:

```
$argon2id$v=19$m=19456,t=2,p=1$S2FsdFN0cmluZw$dGhpc2lzYXZlcnlsb25naGFzaHZhbHVlZm9yeW91
```

Here's the breakdown:

- `$argon2id$` – Algorithm variant (id = hybrid, d = data-dependent, i = data-independent)
- `v=19` – Version number
- `m=19456` – Memory usage in kibibytes (19 MiB in this example)
- `t=2` – Time cost (number of iterations)
- `p=1` – Parallelism factor (number of threads/lanes)
- `S2FsdFN0cmluZw` – Base64-encoded salt
- `dGhpc2lzYXZlcnlsb25naGFzaHZhbHVlZm9yeW91` – Base64-encoded hash (the "tag" or digest)

OWASP provides several alternative parameter configurations that offer equivalent security with different CPU/memory trade-offs. The configuration above (19 MiB, 2 iterations, 1 thread) represents their minimum recommended baseline.

## Key takeaways

To avoid cryptographic failures:
- **If you're still using MD5**: Migrate immediately. Rehash passwords with Argon2 on the user's next successful login. **Never migrate hashes directly**! You need the plaintext password to create a proper Argon2 hash. During transition, store both old and new hashes temporarily and verify against the old MD5 hash if no Argon2 hash exists yet, then create the new hash. This prevents locking out users who haven't logged in since the migration started.
- **For new applications**: Use Argon2id with OWASP's recommended minimum configuration: 19 MiB memory (m=19456), 2 iterations (t=2), and 1 degree of parallelism (p=1). OWASP provides alternative configurations if you need to optimise for different CPU/memory constraints.
- **For existing bcrypt systems**: Migrate gradually by rehashing on login, or continue with bcrypt if resources are limited. OWASP recommends a work factor of 10 or more for bcrypt.
- **Regularly audit cost parameters**: Increase bcrypt rounds or Argon2 parameters as hardware improves. What's adequate today may be insufficient in a year or two.
- **Enforce HTTPS**: Protect data in transit to prevent passwords being intercepted before hashing.

For more details, see the [OWASP Top 10: Cryptographic Failures](https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/) and the [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).

## Closing thoughts

Modern password hashing is a critical defence against credential stuffing (using stolen passwords from one breach to attack other sites) and brute-force attacks, but it's not a silver bullet. Argon2 represents the current best practice for new applications, offering better resistance to hardware advancements than bcrypt. However, the strongest hashing algorithm becomes weak if poorly implemented or if cost parameters aren't regularly updated.

Remember that password hashing is just one layer of defence. Combine it with account lockouts, rate limiting, multi-factor authentication, and secure password policies for comprehensive protection. As OWASP emphasises, cryptographic failures remain a top security risk. Stay vigilant and keep your hashing practices current.

The landscape of password security continues to evolve. What works today might not suffice tomorrow. Expect continued pressure to increase memory parameters as specialised hardware becomes more accessible. Regular security audits and staying informed about emerging threats remain essential for protecting user data.