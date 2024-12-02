//////////////////////////////////////
//////// initial setup ////////////////
//////////////////////////////////////

import { hashContent, preventPaste, returnMaskedContentRegex, returnMockedMaskingContent } from './utils.js';
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
      error: error 
    });
  }
}

//////////////////////////////////////
////////////    utils    ////////////////
//////////////////////////////////////

/**
 * Generates a hash for the given content to track processed items
 * @param {string} content - The content to hash
 * @return {number} - 32-bit integer hash
 */
export function hashContent(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
* Prevents paste events during content processing
* @param {Event} e - Paste event
* @return {boolean} - Always returns false to prevent default behavior
*/
export function preventPaste(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("Paste prevented - content is being processed");
  return false;
}

/**
* Regex-based PII masking implementation
* @param {string} originalContent - Content to be masked
* @return {string} - Masked content with PII replaced
*/
export async function returnMaskedContentRegex(originalContent) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  let maskedContent = originalContent;
  maskedContent = maskedContent.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 
      'dummyid@example.com'
  );
  maskedContent = maskedContent.replace(
      /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
      'XXX-XXX-XXXX'
  );
  maskedContent = maskedContent.replace(
      /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
      'XXXX-XXXX-XXXX-XXXX'
  );
  maskedContent = maskedContent.replace(
      /\d{3}-?\d{2}-?\d{4}/g,
      'XXX-XX-XXXX'
  );
  const commonNames = ['John', 'Jane', 'Smith', 'Johnson', 'Williams'];
  commonNames.forEach(name => {
      const nameRegex = new RegExp(name, 'gi');
      maskedContent = maskedContent.replace(nameRegex, 'Anonymous');
  });
  maskedContent = maskedContent.replace(
      /\d+\s+[a-zA-Z\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\s*,?\s*[a-zA-Z\s]+,\s*[A-Z]{2}\s*\d{5}/gi,
      'Redacted Address'
  );
  console.log('Masked content:', maskedContent);
  return maskedContent;
}

export async function returnMockedMaskingContent(content) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return "masked content";
}

//////////////////////////////////////
////////////    core    ////////////////
//////////////////////////////////////  



/**
 * Advanced PII masking using AI language model
 * @param {string} originalContent - Content to be masked
 * @return {string} - Masked content or original content if AI processing fails
 */
export async function returnMaskedContentAI(originalContent) {
  try {
      const {available} = await ai.languageModel.capabilities();
      if (available !== "no") {
        const session = await ai.languageModel.create({
            systemPrompt: "You are a helpful assistant specialized in identifying and redacting PII (Personally Identifiable Information) content such as names, phone numbers, email addresses, physical addresses, credit card numbers, and social security numbers."
        });
        
        try {
            const result = await session.prompt(`
                Analyze the following content and redact any Personally Identifiable Information (PII) using one of the following rules:
                - For phone numbers: Replace with "XXX-XXX-XXXX".
                - For email addresses: Replace with "dummyid@example.com" or "XXXXXXX".
                - For names: Replace with "Anonymous" or "XXXXXXX".
                - For physical addresses: Replace with "Redacted Address" or "XXXXXXX".
                - For credit card numbers: Replace with "XXXX-XXXX-XXXX-XXXX".
                - For social security numbers: Replace with "XXX-XX-XXXX".
                Ensure:
                1. The structure and format of the text remain consistent.
                2. Non-PII content is left unaltered.
                3. Only redact the sensitive information.
                4. If there is no PII, return the original content.
                
                Example Input: "My email id is harrystyles@gmail.com"
                Example Output: "My email id is dummyid@example.com" or "My email id is XXXXXXX".
        
                Content:
                ${originalContent}
            `);
            return result;
        
          } catch (promptError) {
              console.error("AI processing error:", promptError);
              return originalContent; // Return original content if AI processing fails
          }
      }
      return originalContent; // Return original content if AI is not available
  } catch (error) {
      console.error("AI capability check error:", error);
      return originalContent; // Return original content if capability check fails
  }
}

