import {
  getSandboxes,
  getCurrentSandbox,
  setCurrentSandbox,
  getSandboxCookies,
  saveSandboxCookies,
  getSandboxForDomain,
  setSandboxForDomain,
  STORAGE_KEYS,
} from "./storage.js";

// Initialize context menus
chrome.runtime.onInstalled.addListener(async () => {
  await updateContextMenus();
});

let isUpdatingContextMenus = false;
let updateQueue = Promise.resolve();

async function updateContextMenus() {
  // Chain updates to ensure they run sequentially
  updateQueue = updateQueue.then(async () => {
    // Try to remove the root item (which removes all children)
    await new Promise((resolve) => {
      chrome.contextMenus.remove("switch-sandbox-root", () => {
        if (chrome.runtime.lastError) {
          // Ignore error if it didn't exist
        }
        resolve();
      });
    });

    const sandboxes = await getSandboxes();
    const currentId = await getCurrentSandbox();

    // Create Root
    await new Promise((resolve) => {
      chrome.contextMenus.create(
        {
          id: "switch-sandbox-root",
          title: chrome.i18n.getMessage("popupTitle"), // Use extension name or "Switch Sandbox", we have "popupTitle" which is Browser Sandbox. Let's add "Switch Sandbox" key? Or reuse?
          // I didn't add "Switch Sandbox" key specifically for root title in messages.json.
          // I added "createSandboxTitle", "listTitle".
          // Wait, I can just use "Browser Sandbox" (popupTitle) or generic.
          // Actually, "Switch Sandbox" is hardcode in line 41.
          // Let's us "contextSwitchTo" prefix? No.
          // Let's use "extensionName" for now or just "Browser Sandbox" localized?
          // Ah, I missed adding a specific "rootMenuTitle" in messages.json.
          // I will use "extensionName" for the root menu item, which is "Browser Sandbox".
          title: chrome.i18n.getMessage("extensionName"),
          contexts: ["all"],
        },
        () => {
          if (chrome.runtime.lastError)
            console.warn(
              "Menu creation warning:",
              chrome.runtime.lastError.message
            );
          resolve();
        }
      );
    });

    // Create Children
    for (const sandbox of sandboxes) {
      const isCurrent = sandbox.id === currentId;
      // "Default (Active)" or "Default"
      // "✅ Name"
      // I have "contextActiveSuffix" -> " (Active)"
      // And I used emoji checkmark.
      // Let's keep emoji for visual consistency across langs?
      // Or use (Active) suffix localized.
      // previous code: `✅ ${sandbox.name}`
      // Let's stick to emoji, it's universal.
      // But text "Active" usage?
      // If I want to be purely i18n, maybe: `${sandbox.name} ${chrome.i18n.getMessage("contextActiveSuffix")}`
      // instead of checkmark? Or both?
      // The user just said "i18n". Checkmark is i18n friendly.
      // But `Default` name... the name "Default" is stored in DB.
      // If it is "default" ID, we might want to localize its display name?
      // "Default" sandbox is created with name "Default".
      // If we want to localize that, we should check ID.
      let displayName = sandbox.name;
      if (sandbox.id === "default") {
        // We could localize "Default", but if user renamed it...
        // "Default" sandbox name is editable?
        // "Default" is just an ID. The name is mutable?
        // In storage.js: { id: "default", name: "Default", ... }
        // If user hasn't renamed it, it shows "Default".
        // Let's leave user content names alone.
      }

      const title = isCurrent ? `✅ ${displayName}` : displayName;

      await new Promise((resolve) => {
        chrome.contextMenus.create(
          {
            id: `switch-to-${sandbox.id}`,
            parentId: "switch-sandbox-root",
            title: title,
            contexts: ["all"],
          },
          () => {
            if (chrome.runtime.lastError)
              console.warn(
                "Menu child creation warning:",
                chrome.runtime.lastError.message
              );
            resolve();
          }
        );
      });
    }
  });

  await updateQueue;
}

// Handle context menu clicks
// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.startsWith("switch-to-")) {
    const targetId = info.menuItemId.replace("switch-to-", "");

    // Implicit Rule Update: Save this choice for the current domain
    if (tab && tab.url) {
      const domain = getDomain(tab.url);
      if (domain) {
        await setSandboxForDomain(domain, targetId);
      }
    }

    await switchSandbox(targetId);
  }
});

// ... switchSandbox ...

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "UPDATE_CONTEXT_MENUS") {
    await updateContextMenus();
    sendResponse({ success: true });
    return true;
  }
  if (message.type === "SWITCH_SANDBOX") {
    // Implicit Rule Update for popup switch
    // The popup should ideally send the domain, or we query active tab here.
    // Querying active tab is safer.
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      const domain = getDomain(tab.url);
      if (domain) {
        await setSandboxForDomain(domain, message.targetId);
      }
    }

    await switchSandbox(message.targetId);
    sendResponse({ success: true });
    return true;
  }
});

async function switchSandbox(targetId) {
  const currentId = await getCurrentSandbox();
  if (currentId === targetId) return;

  // 1. Save current cookies
  const allCookies = await chrome.cookies.getAll({});
  await saveSandboxCookies(currentId, allCookies);

  // 2. Clear current cookies
  const removePromises = allCookies.map((cookie) => {
    const protocol = cookie.secure ? "https:" : "http:";
    const url = `${protocol}//${cookie.domain}${cookie.path}`;
    return chrome.cookies.remove({
      url,
      name: cookie.name,
      storeId: cookie.storeId,
    });
  });
  await Promise.all(removePromises);

  // 3. Load target cookies
  const targetCookies = await getSandboxCookies(targetId);
  const setPromises = targetCookies.map(async (cookieData) => {
    const { hostOnly, session, storeId, ...cleanCookie } = cookieData;

    const protocol = cleanCookie.secure ? "https:" : "http:";
    const domain = cleanCookie.domain.startsWith(".")
      ? cleanCookie.domain.substring(1)
      : cleanCookie.domain;
    cleanCookie.url = `${protocol}//${domain}${cleanCookie.path}`;

    // Remove properties that cause errors in set()
    if (hostOnly) {
      delete cleanCookie.domain;
    }

    // Strict rules for __Host- cookies
    if (cleanCookie.name.startsWith("__Host-")) {
      cleanCookie.secure = true;
      delete cleanCookie.domain;
    }

    try {
      await chrome.cookies.set(cleanCookie);
    } catch (e) {
      // Ignore specific harmless errors or log them
      console.error(`Error setting cookie ${cleanCookie.name}:`, e);
    }
  });
  await Promise.all(setPromises);

  // 4. Update state
  await setCurrentSandbox(targetId);
  await updateContextMenus();

  // 5. Apply/Remove CORS Rules (declarativeNetRequest)
  // We need to check if the target sandbox has CORS enabled.
  // getSandboxes has the list.
  const sandboxes = await getSandboxes();
  const targetSandbox = sandboxes.find((s) => s.id === targetId);

  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        responseHeaders: [
          {
            header: "Access-Control-Allow-Origin",
            operation: "set",
            value: "*",
          },
          {
            header: "Access-Control-Allow-Methods",
            operation: "set",
            value:
              "GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK",
          },
          {
            header: "Access-Control-Allow-Headers",
            operation: "set",
            value: "*",
          },
        ],
      },
      condition: {
        urlFilter: "*",
        resourceTypes: [
          "main_frame",
          "sub_frame",
          "stylesheet",
          "script",
          "image",
          "font",
          "object",
          "xmlhttprequest",
          "ping",
          "csp_report",
          "media",
          "websocket",
          "other",
        ],
      },
    },
  ];

  if (targetSandbox && targetSandbox.corsEnabled) {
    console.log("Enabling CORS Bypass for sandbox:", targetSandbox.name);
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1], // clear old first just in case
      addRules: rules,
    });
  } else {
    console.log("Disabling CORS Bypass");
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
    });
  }

  // 6. Reload active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.reload(tab.id);
  }
}

// Handle alarms for auto-destruction
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name.startsWith("expire-")) {
    const sandboxId = alarm.name.replace("expire-", "");
    let sandboxes = await getSandboxes();
    const sandboxIndex = sandboxes.findIndex((s) => s.id === sandboxId);

    if (sandboxIndex !== -1) {
      sandboxes.splice(sandboxIndex, 1);
      await chrome.storage.local.set({ [STORAGE_KEYS.SANDBOXES]: sandboxes });

      const currentId = await getCurrentSandbox();
      if (currentId === sandboxId) {
        await switchSandbox("default");
      }

      await updateContextMenus();
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_CONTEXT_MENUS") {
    updateContextMenus().then(() => sendResponse({ success: true }));
    return true;
  }
  if (message.type === "SWITCH_SANDBOX") {
    switchSandbox(message.targetId).then(() => sendResponse({ success: true }));
    return true;
  }
});

// --- Domain-Based Auto-Switching ---

function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname;
  } catch (e) {
    return null;
  }
}

async function checkAndApplyDomainRule(tab) {
  if (!tab || !tab.url) return;

  const domain = getDomain(tab.url);
  if (!domain) return;

  const targetSandboxId = await getSandboxForDomain(domain);
  if (targetSandboxId) {
    const currentId = await getCurrentSandbox();
    if (currentId !== targetSandboxId) {
      console.log(
        `[Auto-Switch] Domain ${domain} requires sandbox ${targetSandboxId}. Switching...`
      );
      await switchSandbox(targetSandboxId);
    }
  }
}

// 1. When switching tabs (Swap-on-Focus)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  await checkAndApplyDomainRule(tab);
});

// 2. When navigating to a new URL
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // URL changed, check rule
    await checkAndApplyDomainRule(tab);
  }
});
