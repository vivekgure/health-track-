// LifeSync Extension Background Service Worker
let activeTabId = null;
let activeDomain = null;
let startTime = Date.now();
let focusModeActive = false;
let blockedDomains = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "reddit.com",
  "netflix.com",
  "youtube.com"
];

// Initialize settings from chrome.storage
chrome.storage.local.get(["focusModeActive", "blockedDomains", "apiEndpoint", "apiKey"], (result) => {
  if (result.focusModeActive !== undefined) focusModeActive = result.focusModeActive;
  if (result.blockedDomains) blockedDomains = result.blockedDomains;
});

// Listen for tab activation / URL change
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  handleTabSwitch(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    handleTabSwitch(tabId);
  }
});

async function handleTabSwitch(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || !tab.url.startsWith("http")) return;

    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, "");

    // Check focus mode blocking
    if (focusModeActive && isBlocked(domain)) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html?domain=" + encodeURIComponent(domain)) });
      return;
    }

    activeTabId = tabId;
    activeDomain = domain;
    startTime = Date.now();
  } catch (err) {
    console.error("Tab switch error:", err);
  }
}

function isBlocked(domain) {
  return blockedDomains.some((d) => domain === d || domain.endsWith("." + d));
}

// Listen for messages from popup or web app
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFocusMode") {
    focusModeActive = request.enabled;
    chrome.storage.local.set({ focusModeActive });
    sendResponse({ status: "success", focusModeActive });
  } else if (request.action === "getStatus") {
    sendResponse({ focusModeActive, blockedDomains, activeDomain });
  }
  return true;
});

