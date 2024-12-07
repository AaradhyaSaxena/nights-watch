///////////////////////////////////////
//////// initial setup //////////////
///////////////////////////////////////

chrome.runtime.onInstalled.addListener(async () => {
  debugLog("Night's Watch extension installed");
  
  try {
    // Load initial sites from config file
    const response = await fetch(chrome.runtime.getURL('config/sites.json'));
    const config = await response.json();
    
    // Initialize storage with default sites as addedSites
    await chrome.storage.sync.set({ 
      addedSites: config.supportedSites
    });
    
  } catch (error) {
    console.error('Error initializing extension:', error);
  }
});

let supportedSites = chrome.storage.sync.get({ addedSites: [] }).then(result => result.addedSites);
setupTabListener();

function setupTabListener() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
      if (changeInfo.status === 'loading' && tab.url) {
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

///////////////////////////////////////
////////////// tab update /////////////  
/////////////////////////////////////// 

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    handleTabUpdate(activeInfo.tabId, tab);
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

