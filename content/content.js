//////////////////////////////////////
//////// initial setup ////////////////
//////////////////////////////////////

import { hashContent, preventPaste, returnMaskedContentRegex } from './utils.js';
import { returnMaskedContentAI } from './core.js';

console.log("Hello World from Night's Watch >>> content.js");

const processedHashes = new Set();

//////////////////////////////////////
//////// Event Listeners /////////////
//////////////////////////////////////

// Monitor visibility changes and window focus
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setupClipboardMonitoring();
  }
});

window.addEventListener('focus', () => {
  setupClipboardMonitoring();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});


//////////////////////////////////////
// Clipboard Monitoring Functions
//////////////////////////////////////

/**
 * Sets up clipboard monitoring and content masking
 * Prevents paste events while processing
 */
async function setupClipboardMonitoring() {
  console.log("setupClipboardMonitoring >>> content.js");
  try {
    const content = await navigator.clipboard.readText();
    if (content && content.trim()) {
      console.log("Clipboard content before paste >>> content.js:", content);
      //chrome.runtime.sendMessage({ 
      //  action: 'clipboardUpdate', 
      //  content: content 
      //});
      const contentHash = hashContent(content);
      if (processedHashes.has(contentHash)) {
        console.log("Content already processed, skipping...");
        return;
      }
      
      // Add paste prevention
      document.addEventListener('paste', preventPaste, true);
      window.addEventListener('paste', preventPaste, true);
      
      const maskedContent = await returnMaskedContentRegex(content);
      await navigator.clipboard.writeText(maskedContent);
      
      // Remove paste prevention
      document.removeEventListener('paste', preventPaste, true);
      window.removeEventListener('paste', preventPaste, true);

      processedHashes.add(contentHash);
      console.log("updated clipboard >>> setupClipboardMonitoring", maskedContent);
    } else {
      console.log("Clipboard is empty");
    }
  } catch (error) {
    console.error("Clipboard access error:", error);    
    chrome.runtime.sendMessage({ 
      action: 'clipboardError', 
      error: errorMessage 
    });
  }
}

