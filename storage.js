/**
 * Storage utility for managing sandboxes and cookies.
 */

export const STORAGE_KEYS = {
  SANDBOXES: "sandboxes",
  CURRENT_SANDBOX: "current_sandbox",
};

export async function getSandboxes() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.SANDBOXES]);
  return (
    result[STORAGE_KEYS.SANDBOXES] || [
      { id: "default", name: "Default", expiry: null },
    ]
  );
}

export async function saveSandboxes(sandboxes) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SANDBOXES]: sandboxes });
}

export async function getCurrentSandbox() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.CURRENT_SANDBOX]);
  return result[STORAGE_KEYS.CURRENT_SANDBOX] || "default";
}

export async function setCurrentSandbox(id) {
  await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_SANDBOX]: id });
}

export async function getSandboxCookies(sandboxId) {
  const key = `cookies_${sandboxId}`;
  const result = await chrome.storage.local.get([key]);
  return result[key] || [];
}

export async function saveSandboxCookies(sandboxId, cookies) {
  const key = `cookies_${sandboxId}`;
  await chrome.storage.local.set({ [key]: cookies });
}

export async function deleteSandboxData(sandboxId) {
  const key = `cookies_${sandboxId}`;
  await chrome.storage.local.remove([key]);
}

export async function getDomainRules() {
  const result = await chrome.storage.local.get(["domain_rules"]);
  return result.domain_rules || {};
}

export async function saveDomainRules(rules) {
  await chrome.storage.local.set({ domain_rules: rules });
}

export async function getSandboxForDomain(domain) {
  const rules = await getDomainRules();
  return rules[domain];
}

export async function setSandboxForDomain(domain, sandboxId) {
  const rules = await getDomainRules();
  if (sandboxId) {
    rules[domain] = sandboxId;
  } else {
    delete rules[domain];
  }
  await saveDomainRules(rules);
}
