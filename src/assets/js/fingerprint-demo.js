const CHAR_ZERO = "\u200B";
const CHAR_ONE = "\u200C";

function encodeFingerprint(userId) {
    const binary = userId.toString(2).padStart(16, "0");
    return binary
        .split("")
        .map((bit) => (bit === "0" ? CHAR_ZERO : CHAR_ONE))
        .join("");
}

function embedFingerprint(text, userId) {
    const fingerprint = encodeFingerprint(userId);
    const words = text.split(" ");

    if (words.length > 1) {
        return `${words[0]}${fingerprint} ${words.slice(1).join(" ")}`;
    }

    return `${text}${fingerprint}`;
}

function extractFingerprint(text) {
    const pattern = /[\u200B\u200C]+/g;
    const matches = text.match(pattern);

    if (!matches || matches.length === 0) {
        return null;
    }

    const binary = matches[0]
        .split("")
        .map((char) => (char === CHAR_ZERO ? "0" : "1"))
        .join("");

    return Number.parseInt(binary, 2);
}

function generateFingerprint() {
    const originalTextEl = document.getElementById("original-text");
    const hiddenIdEl = document.getElementById("hidden-id");
    const fingerprintedTextEl = document.getElementById("fingerprinted-text");
    const fingerprintInfoEl = document.getElementById("fingerprint-info");

    if (!originalTextEl || !hiddenIdEl || !fingerprintedTextEl || !fingerprintInfoEl) {
        return;
    }

    const originalText = originalTextEl.value;
    const userId = Number.parseInt(hiddenIdEl.value, 10);

    if (!originalText) {
        window.alert("Please enter some text");
        return;
    }

    if (Number.isNaN(userId) || userId < 0 || userId > 65535) {
        window.alert("Please enter a valid User ID (0-65535)");
        return;
    }

    const fingerprinted = embedFingerprint(originalText, userId);
    fingerprintedTextEl.value = fingerprinted;

    const charCount = fingerprinted.length - originalText.length;
    fingerprintInfoEl.innerHTML = `<p>💡 Fingerprinted with ${charCount} invisible characters.</p><p>Contains hidden User ID: <strong>${userId}</strong></p>`;
}

function detectFingerprint() {
    const detectTextEl = document.getElementById("detect-text");
    const resultEl = document.getElementById("detect-result");

    if (!detectTextEl || !resultEl) {
        return;
    }

    const text = detectTextEl.value;

    if (!text) {
        window.alert("Please enter some text to analyse");
        return;
    }

    const pattern = /[\u200B\u200C\u200D\uFEFF\u2060\u180E]/g;
    const matches = text.match(pattern);

    if (!matches || matches.length === 0) {
        resultEl.innerHTML = "<p>✅ <strong>No hidden characters detected!</strong><br>This text appears clean.</p>";
        return;
    }

    const extractedId = extractFingerprint(text);

    if (extractedId !== null) {
        resultEl.innerHTML = `<p>⚠️ <strong>Hidden fingerprint detected!</strong></p><p>Found ${matches.length} zero-width characters hiding User ID: <strong>${extractedId}</strong></p>`;
        return;
    }

    resultEl.innerHTML = `<p>⚠️ <strong>Hidden characters detected!</strong></p><p>Found ${matches.length} zero-width characters, but could not decode a valid User ID. Try using the fingerprint generator above.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generate-fingerprint");
    const detectButton = document.getElementById("detect-fingerprint");

    if (generateButton) {
        generateButton.addEventListener("click", generateFingerprint);
    }

    if (detectButton) {
        detectButton.addEventListener("click", detectFingerprint);
    }
});
