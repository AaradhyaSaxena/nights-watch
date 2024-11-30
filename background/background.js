// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Night's Watch extension installed");
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('chatgpt.com')) {
    console.log("Detected ChatGPT tab - Night's Watch is active");
  }
});
