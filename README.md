<p align="center"><img src="icons/icon128.png"></p>

<h1 align="center">CrossSession Sandbox</h1>

<p align="center">English | <a href="README.zh_TW.md">繁體中文</a></p>

A powerful Chrome extension that allows you to manage multiple isolated browsing environments ("sandboxes") within the same browser profile. Seamlessly switch between accounts, bypass CORS restrictions, and manage temporary sessions with ease.

## Key Features

- **🌐 Multi-Account Sandboxing**: Create unlimited sandboxes to store separate cookie sessions. Switch between them instantly to swap logged-in accounts on any website without incognito windows.
- **🔄 Smart Domain Switching**: The extension automatically remembers your sandbox preference for each domain. Manually switch once, and it will auto-switch for you next time you visit.
- **🔓 Advanced CORS Bypass**: Enable "CORS Bypass" on specific sandboxes to automatically remove Cross-Origin Resource Sharing restrictions for development and debugging.
- **⏱️ Auto-Destruct**: Set an expiration time for temporary sandboxes. They will automatically delete themselves (and their data) when the time is up.
- **✨ Modern UI**: A clean, premium, and responsive user interface for easy management.

## 🛡️ CORS Bypass Capabilities

When enabled for a specific sandbox, the extension uses a **Split Strategy** to bypass complex CORS restrictions:

### ✅ Solved Scenarios

1.  **Standard CORS**: Injects `Access-Control-Allow-Origin: *` to allow cross-origin AJAX fetches.
2.  **Wildcard & Credentials Conflict**: Removes `Access-Control-Allow-Credentials` from responses when necessary to prevent browser blocking.
3.  **Iframe Embedding**: Removes `X-Frame-Options` and `Content-Security-Policy` (frame-ancestors) to allow embedding strict sites (e.g., Google) in iframes.
4.  **Modern Isolation**: Strips `Cross-Origin-Resource-Policy` (CORP), `COEP`, and `COOP` headers to bypass Specture-mitigation blocks.
5.  **Private Network Access (PNA)**: Enables access to localhost (`127.0.0.1`) from public HTTPS sites by injecting `Access-Control-Allow-Private-Network: true`.
6.  **Basic Anti-Hotlinking**: Anonymizes resource requests (images/scripts) by stripping `Referer` and `Origin` headers.

### ❌ Limitations

1.  **Strict Server Whitelisting**: If a server _requires_ a specific valid `Referer` (e.g., "Must come from example.com"), it will still fail because the extension strips the referer (sends empty).
2.  **Server-Side Logic**: Cannot bypass IP-based blocking, authentication tokens (OAuth) required in headers, or TLS fingerprinting.
3.  **Canvas Tainting**: In rare cases, the browser's internal security model (tainted canvas) might still block image data manipulation despite headers being correct.

### 🔒 Privacy Note

When CORS Bypass is enabled, the extension modifies HTTP headers (`Origin`, `Referer`, `Access-Control-*`) for requests made in that sandbox. capabilities. This is strictly for functionality and no data is collected.

## Installation

1.  Clone or download this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click **"Load unpacked"**.
5.  Select the `chrome-sandbox-extension` folder.

## Usage

### Creating a Sandbox

1.  Click the extension icon to open the popup.
2.  Enter a name for your new sandbox (e.g., "Work", "Personal", "Dev").
3.  (Optional) Set an **Auto-destroy** date/time if you want a temporary session.
4.  (Optional) Check **Enable CORS Bypass** if you need to fetch cross-origin resources in this sandbox.
5.  Click **Create Sandbox**.

### Switching Sandboxes

- **Manual**: Click "Switch" next to any sandbox in the list. The page will reload with the new session.
- **Automatic**: Once you switch to a sandbox on a specific domain (e.g., `github.com`), the extension remembers this. The next time you visit that domain, it will automatically activate that sandbox.

### Managing Sandboxes

- **Rename**: Click "Edit" to change a sandbox's name.
- **Delete**: Click "Del" to remove a sandbox and clear all its stored cookies.
  - _Note: If you delete the currently active sandbox, you will be automatically switched back to the Default one._

## Permissions Explained

- `cookies`: Required to swap session cookies between sandboxes.
- `storage`: Used to save sandbox configurations and rules locally.
- `contextMenus`: Adds a right-click menu for quick switching.
- `alarms`: Powered the auto-destruct timer.
- `declarativeNetRequest`: Used solely for the CORS bypass feature to modify response headers.
- `host_permissions: <all_urls>`: Necessary to manage cookies and CORS rules on any website you visit.

## License

MIT
