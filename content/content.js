window.addEventListener('load', () => {
    console.log("Window loaded - content.js");
    document.body.style.border = "5px solid red"; // This will make it very obvious if our script loads
});

console.log("content.js loaded!");

import TextAreaManager from './TextAreaManager.js';
const textAreaManager = new TextAreaManager();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupTextAreaMonitoring();
  }
});

function setupTextAreaMonitoring() {
  // The TextAreaManager already sets up the input listener in its constructor
  // We just need to handle sending the content to the background script
  textAreaManager.textarea?.addEventListener('input', (event) => {
    const content = textAreaManager.handleInput(event);
    if (content && textAreaManager.hasContentChanged(content)) {
      console.log("Content Script - Sending to background.js:", {
        action: 'textAreaUpdate',
        contentPreview: content.substring(0, 50) + '...' // Show first 50 chars for privacy
      });
      
      chrome.runtime.sendMessage({ 
        action: 'textAreaUpdate', 
        content: content 
      }, (response) => {
        // Add callback to check if message was received
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        } else {
          console.log('Message successfully sent to background script');
        }
      });
    }
  });
} 