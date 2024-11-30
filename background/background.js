// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Night's Watch extension installed");
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Log the tab URL for debugging
  console.log("Tab URL:", tab.url);
  
  // Check if the URL contains either chat.openai.com or chatgpt.com
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com')) {
      console.log("Detected ChatGPT tab - Night's Watch is active");
      console.log("Tab ID:", tabId);
      console.log("Change Info:", changeInfo);
    }
  }
});
