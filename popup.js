import {
  getSandboxes,
  saveSandboxes,
  getCurrentSandbox,
  deleteSandboxData,
  getSandboxForDomain,
  setSandboxForDomain,
} from "./storage.js";

const listElement = document.getElementById("sandbox-list");
const nameInput = document.getElementById("name");
const expiryInput = document.getElementById("expiry");
const corsInput = document.getElementById("cors-enabled");
const addBtn = document.getElementById("add-btn");

// Domain Rule Elements
const domainRuleCard = document.getElementById("domain-rule-card");
const currentDomainEl = document.getElementById("current-domain");
const domainRuleCheckbox = document.getElementById("domain-rule-checkbox");
const ruleSandboxNameEl = document.getElementById("rule-sandbox-name");

async function init() {
  localizeHtml();
  await renderDomainRule();
  await renderList();
}

function localizeHtml() {
  // Replace text content
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      element.textContent = msg;
    }
  });

  // Replace placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      element.placeholder = msg;
    }
  });
}

async function renderDomainRule() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !tab.url.startsWith("http")) {
    domainRuleCard.style.display = "none";
    return;
  }

  let domain;
  try {
    domain = new URL(tab.url).hostname;
  } catch (e) {
    domainRuleCard.style.display = "none";
    return;
  }

  domainRuleCard.style.display = "block";
  currentDomainEl.textContent = domain;

  const currentId = await getCurrentSandbox();
  const sandboxes = await getSandboxes();
  const currentSandbox = sandboxes.find((s) => s.id === currentId);
  const currentName = currentSandbox
    ? currentSandbox.name
    : chrome.i18n.getMessage("extensionName"); // Using ext name or just "-" if unknown

  ruleSandboxNameEl.textContent = currentName;

  // Implicit mode: Just show what's active.
  // We can show if a rule exists for debugging/clarity, but user wants simplicity.
  // Let's just state: "Domain: [domain]" and "Active Sandbox: [name]"
}

async function renderList() {
  const sandboxes = await getSandboxes();
  const currentId = await getCurrentSandbox();

  listElement.innerHTML = "";
  sandboxes.forEach((sandbox) => {
    const li = document.createElement("li");
    li.className = "sandbox-item";

    const info = document.createElement("div");
    // Info just holds the name/expiry vertical stack
    info.style.display = "flex";
    info.style.flexDirection = "column";
    info.style.width = "100%";

    const nameRow = document.createElement("div");
    nameRow.style.display = "flex";
    nameRow.style.justifyContent = "space-between";
    nameRow.style.alignItems = "center";
    nameRow.style.width = "100%";

    const nameSpan = document.createElement("span");
    nameSpan.className = "sandbox-name";
    nameSpan.textContent = sandbox.name;

    if (sandbox.id === currentId) {
      const badge = document.createElement("span");
      badge.className = "current-badge";
      badge.textContent = chrome.i18n.getMessage("activeBadge");
      nameSpan.appendChild(badge);
    }

    if (sandbox.corsEnabled) {
      const corsBadge = document.createElement("span");
      corsBadge.textContent = "🔓 CORS"; // Universal symbol, maybe keep or localize? Keeping symbol is fine.
      corsBadge.style.fontSize = "0.7rem";
      corsBadge.style.backgroundColor = "#fee2e2";
      corsBadge.style.color = "#991b1b";
      corsBadge.style.padding = "2px 6px";
      corsBadge.style.borderRadius = "999px";
      corsBadge.style.fontWeight = "600";
      corsBadge.style.marginLeft = "8px";
      nameSpan.appendChild(corsBadge);
    }

    nameRow.appendChild(nameSpan);
    info.appendChild(nameRow);

    const expirySpan = document.createElement("div");
    expirySpan.className = "sandbox-expiry";
    expirySpan.textContent = sandbox.expiry
      ? `${chrome.i18n.getMessage("expiresPrefix")}${new Date(
          sandbox.expiry
        ).toLocaleString()}`
      : ""; // Hide if no expiry for cleaner look

    if (sandbox.expiry) info.appendChild(expirySpan);

    li.appendChild(info);

    const actions = document.createElement("div");
    actions.className = "sandbox-actions"; // Use new class for styling

    if (sandbox.id !== currentId) {
      const switchBtn = document.createElement("button");
      switchBtn.className = "switch-btn";
      switchBtn.textContent = chrome.i18n.getMessage("switchBtn");
      switchBtn.onclick = async () => {
        await chrome.runtime.sendMessage({
          type: "SWITCH_SANDBOX",
          targetId: sandbox.id,
        });
        window.close(); // Close popup after switching
      };
      actions.appendChild(switchBtn);
    }

    if (sandbox.id !== "default") {
      // Rename Button
      const renameBtn = document.createElement("button");
      renameBtn.className = "rename-btn";
      renameBtn.textContent = chrome.i18n.getMessage("editBtn"); // "Edit" is shorter/cleaner

      renameBtn.onclick = () => {
        // UI for rename - let's keep it simple inline
        const input = document.createElement("input");
        input.type = "text";
        input.value = sandbox.name;
        input.style.width = "100%"; // Fill
        input.style.marginTop = "4px";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = chrome.i18n.getMessage("saveBtn");
        saveBtn.className = "switch-btn"; // reuse green style
        saveBtn.style.marginTop = "4px";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = chrome.i18n.getMessage("cancelBtn");
        cancelBtn.style.marginTop = "4px";
        cancelBtn.style.marginLeft = "4px";
        cancelBtn.style.background = "#e5e7eb";
        cancelBtn.style.color = "black";
        cancelBtn.onclick = () => renderList(); // Reset

        saveBtn.onclick = async (e) => {
          e.stopPropagation();
          const newName = input.value.trim();
          if (newName && newName !== sandbox.name) {
            await updateSandboxName(sandbox.id, newName);
          }
          await renderList();
        };

        // Clear content and show edit mode
        info.innerHTML = "";
        info.appendChild(input);

        const btnRow = document.createElement("div");
        btnRow.style.display = "flex";
        btnRow.appendChild(saveBtn);
        btnRow.appendChild(cancelBtn);
        info.appendChild(btnRow);

        actions.style.display = "none"; // Hide actions while editing
        input.focus();
      };
      actions.appendChild(renameBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "delete-btn";
      delBtn.textContent = chrome.i18n.getMessage("deleteBtn"); // Shorter
      delBtn.onclick = () => deleteSandbox(sandbox.id);
      actions.appendChild(delBtn);
    }

    li.appendChild(actions);

    listElement.appendChild(li);
  });
}

async function addSandbox() {
  const name = nameInput.value.trim();
  if (!name) return;

  const sandboxes = await getSandboxes();
  const id = "sb_" + Date.now();
  const expiry = expiryInput.value
    ? new Date(expiryInput.value).getTime()
    : null;
  const corsEnabled = corsInput.checked;

  sandboxes.push({ id, name, expiry, corsEnabled });
  await saveSandboxes(sandboxes);

  if (expiry) {
    chrome.alarms.create(`expire-${id}`, { when: expiry });
  }

  // Notify background to update context menus
  chrome.runtime.sendMessage({ type: "UPDATE_CONTEXT_MENUS" });

  nameInput.value = "";
  expiryInput.value = "";
  await renderList();
}

async function deleteSandbox(id) {
  const currentId = await getCurrentSandbox();

  // If deleting the active sandbox, switch to default FIRST
  if (currentId === id) {
    console.log("Deleting active sandbox, switching to default first...");
    await chrome.runtime.sendMessage({
      type: "SWITCH_SANDBOX",
      targetId: "default",
    });
    // After switch, currentId should be default.
    // Note: switchSandbox saves state.
  }

  // Proceed with deletion logic
  let sandboxes = await getSandboxes();
  sandboxes = sandboxes.filter((s) => s.id !== id);
  await saveSandboxes(sandboxes);
  await deleteSandboxData(id);

  chrome.alarms.clear(`expire-${id}`);

  // Update menu if we didn't switch (switching updates menu)
  // But since we might have switched, and that handles updates, we should check?
  // Actually, switchSandbox updates menus. If we didn't switch, we need to update.
  if (currentId !== id) {
    chrome.runtime.sendMessage({ type: "UPDATE_CONTEXT_MENUS" });
  } else {
    // If we did switch, wait a tiny bit or trust that switch updated it?
    // switchSandbox awaits updateContextMenus.
    // However, we just modified sandboxes list *after* the switch.
    // So the menu update in switchSandbox used the OLD list (still containing the deleted one)!
    // We MUST update menus again to remove the deleted item.
    chrome.runtime.sendMessage({ type: "UPDATE_CONTEXT_MENUS" });
  }

  await renderList();
}

addBtn.onclick = addSandbox;
init();

async function updateSandboxName(id, newName) {
  const sandboxes = await getSandboxes();
  const index = sandboxes.findIndex((s) => s.id === id);
  if (index !== -1) {
    sandboxes[index].name = newName;
    await saveSandboxes(sandboxes);
    chrome.runtime.sendMessage({ type: "UPDATE_CONTEXT_MENUS" });
  }
}

async function updateSandboxCors(id, enabled) {
  // Helper if we want to toggle later. For now just added to creation.
  // But good to have if we enhance UI.
}
