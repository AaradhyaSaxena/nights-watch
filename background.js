///////////////////////////////////////
//////// initial setup //////////////
///////////////////////////////////////

chrome.runtime.onInstalled.addListener(() => {
  debugLog("Night's Watch extension installed");
});

let supportedSites = []; 

function setupTabListener() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
      if (changeInfo.status === 'complete' && tab.url) {
        handleTabUpdate(tabId, tab);
      }
    } catch (error) {
      if (error.message.includes('Extension context invalidated')) {
        debugLog('Extension context lost - reloading...');
        chrome.runtime.reload();
      }
    }
  });
}

// Load config/protected sites and initialize
fetch(chrome.runtime.getURL('config/sites.json'))
  .then(response => response.json())
  .then(config => {
    supportedSites = config.supportedSites;
    setupTabListener();
  });

///////////////////////////////////////
////////////// tab update /////////////  
/////////////////////////////////////// 

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
    if (isSupportedSite) {
      handleTabUpdate();
    }
  });
});


///////////////////////////////////////
/////////// clipboard update ///////////
/////////////////////////////////////// 

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clipboardUpdate') {
    try {
      // Add check for tab focus
      chrome.tabs.get(sender.tab.id, (tab) => {
        if (!chrome.runtime.lastError && tab.active) {
          const content = message.content;
          debugLog("Clipboard Content: ", content);
        }
      });
    } catch (error) {
      console.error('Clipboard operation failed:', error);
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: 'clipboardError',
        error: error.message 
      });
    }
  }
  return true; // Keep message channel open for async response
});

///////////////////////////////////////
//////////// core methods /////////////////
///////////////////////////////////////

function handleTabUpdate(tabId, tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
  if (isSupportedSite) {
    debugLog("Detected AI chat tab");
    chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' });
  }
}


///////////////////// utils //////////////////////  

function debugLog(...args) {
  console.log(...args, " ::: background.js");
}

