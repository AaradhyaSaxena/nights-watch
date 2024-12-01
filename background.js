///////////////////////////////////////
//////// initial setup /////////
///////////////////////////////////////

chrome.runtime.onInstalled.addListener(() => {
    console.log("Night's Watch extension installed >>> background.js");
});

// Add error handling for context invalidation
chrome.runtime.onSuspend.addListener(() => {
  console.log("Extension context being suspended");
  // Cleanup code here
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
        console.log('Extension context lost - reloading...');
        chrome.runtime.reload();
      }
    }
  });
}

// Load config and initialize
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
      handleTabUpdate(activeInfo.tabId, tab);
    }
  });
  chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabActivated' });
});





///////////////////////////////////////
/////////// clipboard update ///////////
/////////////////////////////////////// 

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clipboardUpdate') {
    try {
      const content = message.content;
      console.log("content >>> background.js", content);
      // Add check for tab focus
      chrome.tabs.get(sender.tab.id, (tab) => {
        if (!chrome.runtime.lastError && tab.active) {
          // Process clipboard only if tab is active
          handleClipboardOperation(content);
        }
      });
    } catch (error) {
      console.error('Clipboard operation failed:', error);
      // Notify content script of failure
      chrome.tabs.sendMessage(sender.tab.id, { 
        action: 'clipboardError',
        error: error.message 
      });
    }
  }
  return true; // Keep message channel open for async response
});

// Add new helper function
function handleClipboardOperation(content) {
  // Implement retry logic
  const maxRetries = 3;
  let attempts = 0;

  const tryOperation = () => {
    attempts++;
    try {
      // Your clipboard operation here
      return true;
    } catch (error) {
      if (attempts < maxRetries && 
          (error.message.includes('Extension context invalidated') ||
           error.message.includes('Document is not focused'))) {
        setTimeout(tryOperation, 1000); // Retry after 1 second
      } else {
        throw error;
      }
    }
  };

  return tryOperation();
}


///////////////////////////////////////
//////////// core methods /////////////////
///////////////////////////////////////

function handleTabUpdate(tabId, tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
  if (isSupportedSite) {
    debugLog("Detected AI chat tab - Night's Watch is active >>> background.js");
    chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' });
  }
}


///////////////////// utils //////////////////////  

function debugLog(...args) {
  console.log(...args);
}

