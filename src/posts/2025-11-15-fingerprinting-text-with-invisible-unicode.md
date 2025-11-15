---
title: Fingerprinting text with invisible Unicode characters
description: How invisible Unicode characters can be used to secretly track text, and how AI-generated content could be fingerprinted without users knowing.
tags: [cybersecurity, software-engineering, ai]
---

<style>
.demo {
  padding: 1rem;
  border: 2px solid var(--primary);
  box-shadow: -3px 3px 0 var(--primary);
  border-radius: 10px;
}

.demo h3 {
  color: var(--primary);
}

.demo textarea,
.demo input {
  margin-bottom: 1rem;
  width: 100%;
  border-radius: 4px;
  background-color: var(--light);
  color: var(--dark);
  font-size: 1rem;
  padding: 0.5rem;
  box-sizing: border-box; 
}

.demo button {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--primary);
  color: var(--dark);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: block;
  transition: filter 0.2s ease;
}

.demo button:hover {
  filter: brightness(0.9);
}

.demo label {
  display: block;
  margin-bottom: 1rem;
}

@media (prefers-color-scheme: light) {
  .demo button {
    color: var(--light);
  }
}
</style>

Have you ever wondered if text you copy and paste could be secretly tracked? Or whether AI-generated content could be invisibly watermarked? Well, the answer is yes, and it's easier than you might think.

There's a technique called **'zero-width character fingerprinting'** that uses invisible Unicode characters to embed hidden tracking codes into ordinary text. To the human eye, the text looks completely normal, but hidden within it are invisible markers that can identify where it came from.

## How it works

Unicode includes several 'zero-width' characters that take up no visual space. They're designed for typography and language support, but they can also be used to hide information. Some common examples include (though there are others):

- Zero Width Space (`U+200B`)
- Zero Width Non-Joiner (`U+200C`)
- Zero Width Joiner (`U+200D`)
- Zero Width No-Break Space (`U+FEFF`)
- Word Joiner (`U+2060`)
- Mongolian Vowel Separator (`U+180E`)

By inserting these characters into text in specific patterns, you can encode information. Think of it like binary code: use one character for `0` and another for `1`. String enough of them together and you can represent any number or identifier.

Here's a simple example. Let's say you want to fingerprint AI-generated text with a unique ID number. You could convert the ID to binary, then insert zero-width characters between words to encode it.

## Try it yourself

Below is a working demo. Enter some text and a User ID, and it will create a fingerprinted version. The fingerprinted text will look identical to the original, but it contains hidden characters.

<div class="demo">
  <h3>Fingerprint Generator</h3>
  <label for="original-text">Enter some original text:</label>
  <textarea id="original-text" rows="4">The quick brown fox jumps over the lazy dog.</textarea>
  <label for="user-id">User ID (numbers only) between 0 and 65535 that will be used to fingerprint the text:</label>
  <input type="number" id="user-id" value="1234" min="0" max="65535">
  <button onclick="generateFingerprint()">Generate Fingerprint</button>
  <p id="fingerprint-info"></p>
  <label for="fingerprinted-text">This is the fingerprinted text:</label>
  <textarea id="fingerprinted-text" rows="4" readonly></textarea>
</div>

Now try the detector. Copy and paste the fingerprinted text generated above into the detector below, and it will tell you if it contains hidden characters.

<div class="demo">
  <h3>Fingerprint Detector</h3>
  <label for="detect-text">Enter text to analyse:</label>
  <textarea id="detect-text" rows="4"></textarea>
  <button onclick="detectFingerprint()">Detect Fingerprint</button>
  <p id="detect-result"></p>
</div>

## The code behind it

Here's how the fingerprinting works in JavaScript. This example uses only Zero Width Space (`U+200B`) for `0` and Zero Width Non-Joiner (`U+200C`) for `1`, but other zero-width characters could be used for more complex encoding.

```js
// Use Zero Width Space for 0, Zero Width Non-Joiner for 1
const CHAR_ZERO = "\u200B";
const CHAR_ONE = "\u200C";

function encodeFingerprint(userId) {
  // Convert number to 16-bit binary string
  const binary = userId.toString(2).padStart(16, "0");

  // Convert binary digits to invisible characters
  return binary
    .split("")
    .map((bit) => (bit === "0" ? CHAR_ZERO : CHAR_ONE))
    .join("");
}

function embedFingerprint(text, userId) {
  const fingerprint = encodeFingerprint(userId);
  const words = text.split(" ");

  // Insert fingerprint after first word
  if (words.length > 1) {
    return words[0] + fingerprint + " " + words.slice(1).join(" ");
  }

  return text + fingerprint;
}
```

To extract the fingerprint, you search for zero-width characters and decode them back to binary:

```js
function extractFingerprint(text) {
  // Find all zero-width characters
  const pattern = /[\u200B\u200C]+/g;
  const matches = text.match(pattern);

  if (!matches || matches.length === 0) {
    return null;
  }

  // Convert back to binary then to number
  const binary = matches[0]
    .split("")
    .map((char) => (char === CHAR_ZERO ? "0" : "1"))
    .join("");

  return parseInt(binary, 2);
}
```

## Why this matters for AI content

This technique is particularly relevant now that AI can generate convincing text. Imagine an AI company wanting to track how their generated content spreads online. They could fingerprint every response with a unique ID. If that text shows up elsewhere, they could trace it back to the original request. The AI could invisibly watermark it with your account ID. If you later publish that article, the company could detect their fingerprint and know it came from you.

## Detection and removal

The good news is that zero-width characters are easy to remove if you know they might be there. A simple find-and-replace will strip them out:

```js
function removeFingerprints(text) {
  // Remove all zero-width characters
  return text.replace(/[\u200B\u200C\u200D\uFEFF\u2060\u180E]/g, "");
}
```

You can also inspect text programmatically to check for their presence:

```js
function hasHiddenCharacters(text) {
  const pattern = /[\u200B\u200C\u200D\uFEFF\u2060\u180E]/g;
  return pattern.test(text);
}
```

To search for these characters in text editors that support regex search, use this pattern:

```
[\u200B\u200C\u200D\uFEFF\u2060\u180E]
```

## Real-world applications

This technique isn't just theoretical. It's used in practice for both legitimate and less legitimate purposes:

**Legitimate uses:**

- Tracking document leaks within organisations (when everyone is informed)
- Watermarking copyrighted content

**Less legitimate uses:**

- Tracking users without consent
- Identifying whistleblowers
- Hidden surveillance in communications

## Protecting yourself

If you're concerned about hidden fingerprints in text:

1. **Be mindful when copying content from untrustworthy sources.** It might be tracked!
1. **Paste text into a plain text editor.** Many text editors will show zero-width characters as special symbols, making them easy to spot.
1. **Use a cleaning method.** Use or create a tool to strip out zero-width characters before using text. Use a regex search to find these characters.

## Closing thoughts

Zero-width character fingerprinting is a clever technique that highlights how text can carry invisible information. It's particularly relevant as AI-generated content becomes more common. While there are legitimate uses for tracking text, the technique also raises privacy concerns.

The demos above show how easy it is to implement. The next time you copy and paste text from somewhere, remember that it might not be as clean as it looks.

As a disclaimer, I used AI to help generate the code examples in this article, and I've yet to find any watermarking in them! 🕵️

<script>
// Fingerprinting functions
const CHAR_ZERO = '\u200B';
const CHAR_ONE = '\u200C';

function encodeFingerprint(userId) {
  const binary = userId.toString(2).padStart(16, '0');
  return binary.split('').map(bit => bit === '0' ? CHAR_ZERO : CHAR_ONE).join('');
}

function embedFingerprint(text, userId) {
  const fingerprint = encodeFingerprint(userId);
  const words = text.split(' ');
  
  if (words.length > 1) {
    return words[0] + fingerprint + ' ' + words.slice(1).join(' ');
  }
  
  return text + fingerprint;
}

function extractFingerprint(text) {
  const pattern = /[\u200B\u200C]+/g;
  const matches = text.match(pattern);
  
  if (!matches || matches.length === 0) {
    return null;
  }
  
  const binary = matches[0]
    .split('')
    .map(char => char === CHAR_ZERO ? '0' : '1')
    .join('');
  
  return parseInt(binary, 2);
}

function generateFingerprint() {
  const originalText = document.getElementById('original-text').value;
  const userId = parseInt(document.getElementById('user-id').value);
  
  if (!originalText) {
    alert('Please enter some text');
    return;
  }
  
  if (isNaN(userId) || userId < 0 || userId > 65535) {
    alert('Please enter a valid User ID (0-65535)');
    return;
  }
  
  const fingerprinted = embedFingerprint(originalText, userId);
  document.getElementById('fingerprinted-text').value = fingerprinted;
  
  const charCount = fingerprinted.length - originalText.length;
  document.getElementById('fingerprint-info').innerHTML = 
    `<p>💡 Fingerprinted with ${charCount} invisible characters.</p><p>Contains hidden User ID: <strong>${userId}</strong></p>`;
}

function detectFingerprint() {
  const text = document.getElementById('detect-text').value;
  
  if (!text) {
    alert('Please enter some text to analyse');
    return;
  }
  
  const pattern = /[\u200B\u200C\u200D\uFEFF\u2060\u180E]/g;
  const matches = text.match(pattern);
  const resultEl = document.getElementById('detect-result');
  
  if (!matches || matches.length === 0) {
    resultEl.innerHTML = `<p>✅ <strong>No hidden characters detected!</strong><br>This text appears clean.</p>`;
    return;
  }
  
  const extractedId = extractFingerprint(text);
  
  if (extractedId !== null) {
    resultEl.innerHTML = `<p>⚠️ <strong>Hidden fingerprint detected!</strong></p><p>Found ${matches.length} zero-width characters hiding User ID: <strong>${extractedId}</strong></p>`;
  } else {
    resultEl.innerHTML = `<p>⚠️ <strong>Hidden characters detected!</strong></p><p>Found ${matches.length} zero-width characters, but could not decode a valid User ID. Try using the fingerprint generator above.</p>`;
  }
}
</script>
