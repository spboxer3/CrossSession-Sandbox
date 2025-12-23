# 跨域沙箱 (CrossSession Sandbox)

這是一個強大的 Chrome 擴充功能，允許您在同一個瀏覽器設定檔中管理多個隔離的瀏覽環境（稱為「沙箱」）。您可以無縫切換不同帳號、繞過 CORS 限制，並輕鬆管理臨時的工作階段。

## 主要功能

- **🌐 多帳號沙箱隔離 (Multi-Account Sandboxing)**：建立無限數量的沙箱來儲存獨立的 Cookie 工作階段。無需使用無痕視窗，即可在任何網站上瞬間切換已登入的帳號。
- **🔄 智慧網域切換 (Smart Domain Switching)**：擴充功能會自動記住您在每個網域偏好的沙箱。手動切換一次後，下次造訪該網站時系統將自動為您切換。
- **🔓 繞過 CORS 限制 (CORS Bypass)**：可在特定沙箱上啟用「繞過 CORS」，自動移除開發和除錯時遇到的跨來源資源共享 (CORS) 限制。
- **⏱️ 自動銷毀 (Auto-Destruct)**：為臨時沙箱設定過期時間。時間一到，沙箱及其所有資料將自動刪除。
- **✨ 現代化介面 (Modern UI)**：乾淨、優質且反應靈敏的使用者介面，讓管理變得更簡單。

## 安裝說明

1.  複製或下載此 repository。
2.  開啟 Chrome 並前往 `chrome://extensions/`。
3.  在右上角啟用 **"開發人員模式" (Developer mode)**。
4.  點擊 **"載入未封裝項目" (Load unpacked)**。
5.  選擇 `chrome-sandbox-extension` 資料夾。

## 使用指南

### 建立沙箱 (Creating a Sandbox)

1.  點擊擴充功能圖示開啟彈出視窗。
2.  輸入新沙箱的名稱 (例如："公司", "個人", "開發")。
3.  (選擇性) 如果您需要臨時工作階段，可設定 **自動銷毀 (Auto-destroy)** 的日期/時間。
4.  (選擇性) 如果您需要在此沙箱中讀取跨網域資源，請勾選 **啟用 CORS 繞過 (Enable CORS Bypass)**。
5.  點擊 **建立沙箱 (Create Sandbox)**。

### 切換沙箱 (Switching Sandboxes)

- **手動切換**：點擊清單中任何沙箱旁的 "Switch" 按鈕。頁面將重新載入並套用新的工作階段。
- **自動切換**：當您在特定網域 (例如 `github.com`) 切換到某個沙箱後，擴充功能會記住此設定。下次您造訪該網域時，它將自動啟用該沙箱。

### 管理沙箱 (Managing Sandboxes)

- **重新命名 (Rename)**：點擊 "Edit" 修改沙箱名稱。
- **刪除 (Delete)**：點擊 "Del" 移除沙箱並清除其中儲存的所有 Cookie。
  - _注意：如果您刪除當前正在使用的沙箱，系統會自動將您切換回預設 (Default) 沙箱。_

## 權限說明 (Permissions Explained)

- `cookies`：需要此權限才能在沙箱之間交換工作階段 Cookie。
- `storage`：用於在本地儲存沙箱設定和規則。
- `contextMenus`：新增右鍵選單以進行快速切換。
- `alarms`：用於驅動自動銷毀計時器。
- `declarativeNetRequest`：僅用於 CORS 繞過功能，以修改回應標頭 (Response Headers)。
- `host_permissions: <all_urls>`：必須擁有此權限才能在您造訪的任何網站上管理 Cookie 和 CORS 規則。

## 授權 (License)

MIT
