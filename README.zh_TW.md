# 跨域沙箱 (CrossSession Sandbox)

這是一個強大的 Chrome 擴充功能，允許您在同一個瀏覽器設定檔中管理多個隔離的瀏覽環境（稱為「沙箱」）。您可以無縫切換不同帳號、繞過 CORS 限制，並輕鬆管理臨時的工作階段。

## 主要功能

- **🌐 多帳號沙箱隔離 (Multi-Account Sandboxing)**：建立無限數量的沙箱來儲存獨立的 Cookie 工作階段。無需使用無痕視窗，即可在任何網站上瞬間切換已登入的帳號。
- **🔄 智慧網域切換 (Smart Domain Switching)**：擴充功能會自動記住您在每個網域偏好的沙箱。手動切換一次後，下次造訪該網站時系統將自動為您切換。
- **🔓 進階 CORS 跨域繞過 (Advanced CORS Bypass)**：可在特定沙箱上啟用「繞過 CORS」，自動移除開發和除錯時遇到的跨來源資源共享 (CORS) 限制。
- **⏱️ 自動銷毀 (Auto-Destruct)**：為臨時沙箱設定過期時間。時間一到，沙箱及其所有資料將自動刪除。
- **✨ 現代化介面 (Modern UI)**：乾淨、優質且反應靈敏的使用者介面，讓管理變得更簡單。

## 🛡️ CORS 跨域繞過能力 (CORS Capabilities)

當您在特定沙盒開啟 CORS 功能時，擴充功能會採用 **分流策略 (Split Strategy)** 來解決各種瀏覽器限制：

### ✅ 已解決的限制 (Solved)

1.  **標準 CORS 限制**：自動注入 `Access-Control-Allow-Origin: *`，允許 AJAX/Fetch 跨域請求。
2.  **萬用字元與憑證衝突**：當使用萬用字元 (`*`) 時，自動移除 `Access-Control-Allow-Credentials` 避免瀏覽器報錯。
3.  **Iframe 嵌入限制**：移除 `X-Frame-Options` 與 `Content-Security-Policy` (frame-ancestors)，允許將嚴格網站 (如 Google) 嵌入 Iframe。
4.  **現代隔離政策**：移除 `Cross-Origin-Resource-Policy` (CORP)、`COEP` 與 `COOP` 標頭，繞過現代瀏覽器的安全隔離。
5.  **私有網路存取 (PNA)**：允許公網 HTTPS 網站存取 Localhost (`127.0.0.1`) 資源，注入 `Access-Control-Allow-Private-Network: true`。
6.  **基本防盜連 (Anti-Hotlinking)**：針對資源請求 (圖片/腳本)，移除 `Referer` 與 `Origin` 標頭以進行匿名化存取。

### ❌ 無法解決的限制 (Limitations)

1.  **嚴格伺服器白名單**：若伺服器強制要求 **特定且有效** 的 Referer (例如：「必須來自 example.com」)，因為我們移除 Referer 變為空值，仍會導致失敗。
2.  **伺服器端驗證**：無法繞過 IP 封鎖、Header 中的 OAuth Token 驗證，或特殊的 TLS 指紋檢查。
3.  **Canvas 污染 (Canvas Tainting)**：極少數情況下，即使 Header 正確，瀏覽器內部安全機制仍可能標記圖片為污染狀態，導致無法讀取像素數據。

### 🔒 隱私權聲明 (Privacy Note)

當開啟 CORS 繞過功能時，Extension 會修改該沙盒內的 HTTP 請求與回應標頭 (如 `Origin`, `Referer`, `Access-Control-*`) 以實現跨域存取。這些修改僅用於繞過瀏覽器限制，我們不會收集任何數據。

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
