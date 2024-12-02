///////////////////////////////////////
//////// initial setup /////////
///////////////////////////////////////

chrome.runtime.onInstalled.addListener(() => {
    console.log("Night's Watch extension installed >>> background.js");
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
  // chrome.tabs.sendMessage(activeInfo.tabId, { action: 'tabActivated' });
});





///////////////////////////////////////
/////////// clipboard update ///////////
/////////////////////////////////////// 

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === 'clipboardUpdate') {
//     try {
//       const content = message.content;
//       console.log("content >>> background.js", content);
//       // Add check for tab focus
//       chrome.tabs.get(sender.tab.id, (tab) => {
//         if (!chrome.runtime.lastError && tab.active) {
//           // Process clipboard only if tab is active
//           handleClipboardOperation(content);
//         }
//       });
//     } catch (error) {
//       console.error('Clipboard operation failed:', error);
//       // Notify content script of failure
//       chrome.tabs.sendMessage(sender.tab.id, { 
//         action: 'clipboardError',
//         error: error.message 
//       });
//     }
//   }
//   return true; // Keep message channel open for async response
// });
//commented this code to deal with this
// error Clipboard access error: NotAllowedError: Failed to execute 'readText' 

///////////////////////////////////////
//////////// core methods /////////////////
///////////////////////////////////////

function handleTabUpdate(tabId, tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
  if (isSupportedSite) {
    debugLog("Detected AI chat tab - Night's Watch is active >>> background.js");
    // Send message to content script and handle potential errors
    chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error starting monitoring:', chrome.runtime.lastError);
        // Attempt to reload the content scripts if they failed to load
        chrome.scripting.executeScript({
          target: { tabId },
          files: [
            'content/ClipboardManager.js',
            'content/ContentMasker.js',
            'content/ClipboardMonitor.js',
            'content/content.js'
          ]
        }).then(() => {
          // Retry sending the message after reloading scripts
          chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' });
        }).catch(err => {
          console.error('Failed to reload content scripts:', err);
        });
      }
    });
  }
}

// Add error handling for content script communication
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'clipboardError') {
    console.error('Clipboard error from content script:', message.error);
    // You could implement retry logic or user notification here
  }
  return true;
});

///////////////////// utils //////////////////////  

function debugLog(...args) {
  console.log(...args);
}

