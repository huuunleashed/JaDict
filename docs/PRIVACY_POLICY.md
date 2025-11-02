# 🔒 Privacy Policy for JaDict

**Last Updated:** October 30, 2025  
**Effective Date:** October 30, 2025  
**Version:** 1.0

---

## Overview

JaDict is a browser extension that provides instant dictionary lookup and AI-powered word definitions. We are committed to protecting your privacy and ensuring transparency about our data practices.

**Key Principle:** JaDict does NOT collect, store, transmit, or share any personal user data with external servers or third parties.

---

## 🔍 What Information We Access

### 1. Selected Text on Webpages
- **What:** Only the text you manually select/highlight on webpages
- **Why:** To provide dictionary lookup and definition services
- **Scope:** Limited to user-initiated text selection only
- **Storage:** Not stored permanently; processed in real-time and discarded after display
- **Transmission:** Only sent to Google Gemini API if you choose to use AI features (using YOUR API key)

### 2. Google Gemini API Key
- **What:** Your personal Google Gemini API key (if you choose to use AI features)
- **Why:** To authenticate requests to Google's Gemini AI service
- **Storage:** Stored locally in your browser using `chrome.storage.local` (encrypted by browser)
- **Transmission:** Only sent to Google's servers as part of API authentication (standard OAuth flow)
- **Control:** You can remove or change your API key at any time through the extension settings

---

## 💾 What We Store Locally

All data is stored locally on your device using browser storage APIs. We store:

### User Preferences
- **Theme preference:** Light mode or dark mode
- **Dictionary language:** English-English, English-Vietnamese, or Vietnamese-English
- **AI model selection:** Gemini Flash Lite, Flash, or Pro
- **Blacklisted websites:** URLs where you've chosen to disable the extension
- **Font size and display preferences**

### Offline Dictionary Database
- **Size:** Approximately 5MB
- **Content:** Pre-downloaded dictionary definitions for offline use
- **Purpose:** Enables dictionary lookup without internet connectivity
- **Storage:** Bundled with the extension, stored in `chrome.storage.local` or as a local file

### Cached AI Responses (Optional)
- **What:** Previous AI-generated definitions (if caching is enabled)
- **Why:** To reduce API calls and improve performance
- **Retention:** Cleared when you clear browser data or uninstall the extension

---

## 🌐 Third-Party Services

### Google Gemini AI API
- **Service Provider:** Google LLC
- **Usage:** Only when you explicitly enable AI features and provide your own API key
- **Data Sent:** Selected text for definition generation
- **Data Flow:** Your browser → Google's servers (using YOUR API key)
- **Privacy Policy:** [Google AI Privacy Policy](https://policies.google.com/privacy)

**Important Notes:**
- We do NOT act as an intermediary server
- We do NOT intercept, log, or store API requests/responses
- You control your API key and can revoke it anytime via [Google AI Studio](https://aistudio.google.com/apikey)

---

## 🚫 What We Do NOT Collect

JaDict does NOT collect, access, store, or transmit:

- ❌ **Personally Identifiable Information (PII):** Names, addresses, phone numbers, email addresses
- ❌ **Authentication Information:** Passwords, credentials, security questions
- ❌ **Financial Information:** Credit card numbers, bank account details, payment history
- ❌ **Health Information:** Medical records, health data
- ❌ **Location Data:** GPS coordinates, IP addresses, geolocation
- ❌ **Browsing History:** Websites visited, page titles, URLs (except for blacklist feature)
- ❌ **User Activity Tracking:** Mouse movements, clicks, scroll behavior, keystroke logging
- ❌ **Website Content:** Full page content, images, videos (only selected text is processed)
- ❌ **Personal Communications:** Emails, text messages, chat logs

---

## 🔐 Data Security

### Local Storage Security
- All data is stored using browser-provided storage APIs (`chrome.storage.local`)
- Browser automatically encrypts storage on disk (OS-level encryption)
- Data is sandboxed per extension (other extensions cannot access JaDict's data)

### API Key Security
- API keys are stored in encrypted browser storage
- Never transmitted to any server except Google's Gemini API (when you use AI features)
- Not accessible to websites or other extensions

### Content Security
- All HTML content from AI responses is sanitized using **DOMPurify** to prevent XSS attacks
- Content Security Policy (CSP) prevents execution of inline scripts

---

## 📊 Data Retention

### During Extension Use
- User preferences: Stored indefinitely until you change them
- API key: Stored until you remove it or uninstall the extension
- Cached responses: Stored until cache limit is reached or you clear browser data

### Upon Uninstallation
- All locally stored data is automatically deleted when you uninstall the extension
- No residual data remains on external servers (because we don't use any)

---

## 🛡️ Your Privacy Rights

You have full control over your data:

### Access
- View all stored preferences via the extension's Settings page
- Export settings (feature may be added in future versions)

### Modification
- Change any preference at any time through Settings
- Update or remove your API key instantly

### Deletion
- Clear cached data via browser settings
- Remove blacklisted websites individually
- Uninstall the extension to delete all local data

### Portability
- Settings are stored locally; you can manually back them up via browser sync (if enabled)

---

## 🌍 Permissions Explanation

JaDict requests the following browser permissions:

### `clipboardWrite`
- **Purpose:** Allow users to copy definitions to clipboard via "Copy" button
- **User Action Required:** Yes (user must click "Copy" button)
- **Data Flow:** Clipboard data stays on your device

### `storage` and `unlimitedStorage`
- **Purpose:** Store user preferences and offline dictionary database (~5MB)
- **Scope:** Local device only
- **Access:** Only JaDict extension can access this storage

### `tabs`
- **Purpose:** 
  - Inject content scripts to detect text selection
  - Check if current tab URL is blacklisted
  - Position popup overlay correctly
- **Data Access:** Only current tab URL (for blacklist checking)
- **No Tracking:** We do not log or store tab URLs (except user-defined blacklist)

### `<all_urls>` (Host Permissions)
- **Purpose:** Enable dictionary popup on any website
- **Scope:** Only reads selected text; does not access full page content
- **User Control:** Can be disabled per-site via blacklist feature

---

## 👶 Children's Privacy

JaDict does not knowingly collect information from children under 13 years of age. The extension is designed as a general-purpose dictionary tool and does not target children specifically.

---

## 🔄 Changes to This Privacy Policy

We may update this Privacy Policy to reflect:
- Changes in browser APIs or extension features
- Legal or regulatory requirements
- User feedback and best practices

**Notification Method:**
- Update the "Last Updated" date at the top of this document
- Major changes will be announced via GitHub release notes

**Your Responsibility:**
- Review this policy periodically at: https://github.com/huuunleashed/JaDict/blob/main/PRIVACY_POLICY.md

---

## 📧 Contact & Data Requests

### General Inquiries
- **Email:** huynhquochuu.huynh@gmail.com
- **GitHub Issues:** https://github.com/huuunleashed/JaDict/issues
- **GitHub Discussions:** https://github.com/huuunleashed/JaDict/discussions

### Data Subject Requests
Since JaDict does not collect or store user data on external servers, most data requests can be fulfilled by:
1. Viewing your local extension settings
2. Clearing browser data
3. Uninstalling the extension

For specific concerns, contact: huynhquochuu.huynh@gmail.com

---

## 🌐 Compliance

### GDPR (General Data Protection Regulation)
- **Applicability:** EU users
- **Compliance:** JaDict does not collect personal data, thus GDPR obligations are minimal
- **Legal Basis:** Legitimate interest (providing dictionary services)
- **Data Controller:** Huỳnh Quốc Hữu (independent developer)

### CCPA (California Consumer Privacy Act)
- **Applicability:** California residents
- **Compliance:** No personal information is "sold" or "shared" as defined by CCPA
- **Opt-Out:** Not applicable (no data sale occurs)

### Chrome Web Store Developer Program Policies
- **Full Compliance:** JaDict adheres to all Chrome Web Store policies
- **Limited Use Disclosure:** API data is used solely for dictionary lookup functionality
- **User Data Policy:** No user data is collected, transmitted, or sold

---

## 📜 Legal Information

### Developer Information
- **Developer Name:** Huỳnh Quốc Hữu
- **Contact:** huynhquochuu.huynh@gmail.com
- **Country:** Vietnam

### License
- **Open Source:** Available on GitHub under [LICENSE](https://github.com/huuunleashed/JaDict/blob/main/LICENSE)
- **Code Transparency:** All source code is publicly auditable

### Disclaimer
JaDict is provided "as is" without warranties. The developer is not responsible for:
- Accuracy of dictionary definitions or AI-generated content
- Third-party API availability (Google Gemini)
- Data loss due to browser issues or user error

---

## 🔗 Additional Resources

- **GitHub Repository:** https://github.com/huuunleashed/JaDict
- **README:** https://github.com/huuunleashed/JaDict/blob/main/README.md
- **Changelog:** https://github.com/huuunleashed/JaDict/blob/main/CHANGELOG.md
- **Release Notes:** https://github.com/huuunleashed/JaDict/releases

---

## ✅ Privacy Commitment Summary

| Question | Answer |
|----------|--------|
| Do you collect personal data? | ❌ No |
| Do you store data on external servers? | ❌ No |
| Do you sell user data? | ❌ No |
| Do you share data with third parties? | ❌ No (except Google Gemini API via user's own key) |
| Can users delete their data? | ✅ Yes (uninstall extension) |
| Is the source code auditable? | ✅ Yes (open source on GitHub) |
| Do you track browsing history? | ❌ No |

---

**By using JaDict, you acknowledge that you have read and understood this Privacy Policy.**

If you have questions or concerns, please contact: **huynhquochuu.huynh@gmail.com**

---

*This Privacy Policy was last reviewed and approved on October 30, 2025.*
