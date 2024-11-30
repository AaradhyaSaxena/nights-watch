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

async function injectContentScripts(tabId) {
  try {
    console.log("Attempting to inject content scripts into tab:", tabId);
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content/TextAreaManager.js']
    });
    
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content/content.js']
    });
    
    console.log("Content scripts injected successfully");
  } catch (error) {
    console.error("Failed to inject content scripts:", error);
  }
}

function handleTabUpdate(tabId, tab) {
  const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
  
  if (isSupportedSite) {
    debugLog("Detected AI chat tab - Night's Watch is active >>> background.js");
    
    // First inject the content scripts
    injectContentScripts(tabId).then(() => {
      // Then try to send the message
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' })
          .catch(error => {
            console.log('Error sending message to content script:', error);
            retryContentScriptConnection(tabId);
          });
      }, 1000);
    });
  }
}

// Add retry logic
function retryContentScriptConnection(tabId, maxAttempts = 3, attempt = 1) {
  if (attempt > maxAttempts) {
    console.error('Failed to connect to content script after', maxAttempts, 'attempts');
    return;
  }

  setTimeout(() => {
    chrome.tabs.sendMessage(tabId, { action: 'startMonitoring' })
      .catch(error => {
        console.log(`Retry attempt ${attempt} failed:`, error);
        retryContentScriptConnection(tabId, maxAttempts, attempt + 1);
      });
  }, 1000 * attempt); // Increasing delay with each retry
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
  if (message.action === 'textAreaUpdate') {
    console.log("Background Script - Received message:", {
      action: message.action,
      contentPreview: message.content.substring(0, 50) + '...',
      fromTabId: sender.tab?.id
    });
    
    // Send acknowledgment back to content script
    sendResponse({ received: true });
  }
});
