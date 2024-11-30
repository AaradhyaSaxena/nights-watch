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
    // Instead of directly setting up monitoring, inject content script
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
