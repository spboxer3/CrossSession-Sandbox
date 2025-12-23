# CrossSession Sandbox

A powerful Chrome extension that allows you to manage multiple isolated browsing environments ("sandboxes") within the same browser profile. Seamlessly switch between accounts, bypass CORS restrictions, and manage temporary sessions with ease.

## Key Features

- **🌐 Multi-Account Sandboxing**: Create unlimited sandboxes to store separate cookie sessions. Switch between them instantly to swap logged-in accounts on any website without incognito windows.
- **🔄 Smart Domain Switching**: The extension automatically remembers your sandbox preference for each domain. Manually switch once, and it will auto-switch for you next time you visit.
- **🔓 CORS Bypass**: Enable "CORS Bypass" on specific sandboxes to automatically remove Cross-Origin Resource Sharing restrictions for development and debugging.
- **⏱️ Auto-Destruct**: Set an expiration time for temporary sandboxes. They will automatically delete themselves (and their data) when the time is up.
- **✨ Modern UI**: A clean, premium, and responsive user interface for easy management.

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
