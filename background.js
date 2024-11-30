chrome.runtime.onInstalled.addListener(() => {
  console.log("Night's Watch extension installed >>> background.js");
});

let supportedSites = [];

// Function to set up the tab listener
function setupTabListener() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      handleTabUpdate(tabId, tab);
    }
  });
}

function handleTabUpdate(tabId, tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));

  if (isSupportedSite) {
    debugLog("Detected AI chat tab - Night's Watch is active >>> background.js");
    chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' });
  }
}

function debugLog(...args) {
  console.log(...args);
}

// Load config and initialize
fetch(chrome.runtime.getURL('config/sites.json'))
  .then(response => response.json())
  .then(config => {
    supportedSites = config.supportedSites;
    setupTabListener();
  });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("message looks like", message);
  if (message.action === 'redactClipboardContent') {
    const content = message.content;
    console.log("Original clipboard content >>> background.js:", content);

    try {
      const redactedContent = redactPII(content);
      console.log("Redacted clipboard content >>> background.js:", redactedContent);
      sendResponse({ redactedContent: redactedContent });
    } catch (error) {
      console.error("Error during redaction >>> background.js:", error);
      sendResponse({ error: "Failed to process content" });
    }
    return true;
  }
});

function redactPII(text) {
  console.log("Starting redaction for:", text);
  const result = text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    .replace(/\b\d{4}[-. ]?\d{4}[-. ]?\d{4}[-. ]?\d{4}\b/g, '[CREDIT_CARD]');
  console.log("Redaction result:", result);
  return result;
}