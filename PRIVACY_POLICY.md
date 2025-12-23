# Privacy Policy for CrossSession Sandbox

**Last Updated:** December 23, 2025

**CrossSession Sandbox** ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we handle your data and why we request specific permissions in our Chrome Extension.

## 1. Data Collection and Usage

**WE DO NOT COLLECT OR STORE YOUR DATA.**

**We rely on a strict "Zero Knowledge" policy.** This extension operates entirely locally on your device. We **DO NOT** collect, transmit, store, or sell any of your personal data, browsing history, cookies, or account information to any external servers or third parties.

All settings and sandbox data are stored exclusively in your browser's local storage (`chrome.storage.local`), which you fully control.

## 2. Permissions Justification

We request the minimum permissions necessary to provide the core features of CrossSession Sandbox. Here is a detailed explanation of why each permission is required:

### `cookies` & `host_permissions` (<all_urls>)

- **Why:** The core function of this extension is to create isolated "sandboxes" for your browsing sessions. To do this, we need to read and modify your cookies (swapping them out when you switch sandboxes).
- **Usage:** We only access cookies to save the state of your current session and restore the state of a target sandbox. We do not track your browsing history or collect analytics.

### `storage`

- **Why:** To save your user preferences and sandbox configurations.
- **Usage:** Used to store the names of your sandboxes, the cookies associated with each sandbox, and your domain auto-switching rules locally.

### `contextMenus`

- **Why:** To provide a convenient right-click menu.
- **Usage:** Allows you to quickly switch sandboxes by right-clicking anywhere on a webpage.

### `alarms`

- **Why:** To support the "Auto-destruct" feature.
- **Usage:** Used to schedule a timer that automatically deletes a temporary sandbox and its data when the time expires.

### `tabs`

- **Why:** To enable "Smart Domain Switching".
- **Usage:** We need to know which URL is currently active in your tab to determine if you have a preferred sandbox for that domain and switch to it automatically.

### `declarativeNetRequest`

- **Why:** To enable the "CORS Bypass" feature for developers.
- **Usage:** Used **only** when you explicitly enable "CORS Bypass" on a specific sandbox. It allows the extension to modify network headers (e.g., removing `Referer`/`Origin` from requests, injecting `Access-Control-Allow-*` in responses) to facilitate cross-origin resource sharing for development purposes.

## 3. Data Security

Since all data remains on your local device, its security is tied to the security of your local computer and browser. We do not have access to your data.

## 4. Changes to This Policy

We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## 5. Contact Us

If you have any questions about this Privacy Policy, please contact us via the Chrome Web Store support page.
