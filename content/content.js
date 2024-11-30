console.log("Hello World from Night's Watch! >> content.js");

import ClipboardManager from './ClipboardManager.js';
const clipboardManager = new ClipboardManager();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});

function setupClipboardMonitoring() {
  document.addEventListener('copy', async () => {
    const content = await clipboardManager.readClipboard();
    if (content && clipboardManager.hasContentChanged(content)) {
      // Send the content back to background script if needed
      console.log("clipboardUpdate >>> content.js");
      chrome.runtime.sendMessage({ 
        action: 'clipboardUpdate', 
        content: content 
      });
    }
  });
} 