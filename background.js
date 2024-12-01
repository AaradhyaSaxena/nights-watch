///////////////////////////////////////
//////// initial setup /////////
///////////////////////////////////////

chrome.runtime.onInstalled.addListener(() => {
    console.log("Night's Watch extension installed >>> background.js");
});
let supportedSites = []; 

function setupTabListener() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      handleTabUpdate(tabId, tab);
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
    const content = message.content;
    console.log("content >>> background.js", content);
  }
});


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

