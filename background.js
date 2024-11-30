import ClipboardManager from '../utils/ClipboardManager.js';

chrome.runtime.onInstalled.addListener(() => {
    console.log("Night's Watch extension installed");
});

let supportedSites = []; 
const clipboardManager = new ClipboardManager();


// Function to set up the tab listener
function setupTabListener() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      handleTabUpdate(tab);
    }
  });
}

function handleTabUpdate(tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
  
  if (isSupportedSite) {
    debugLog("Detected AI chat tab - Night's Watch is active");
    setupClipboardMonitoring();
  }
}

function setupClipboardMonitoring() {
  document.addEventListener('copy', async () => {
    const content = await clipboardManager.readClipboard();
    if (clipboardManager.hasContentChanged(content)) {
      debugLog('New clipboard content:', content);
    }
  });
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
