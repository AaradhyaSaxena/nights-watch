//////////////////////////////////////
//////// initial setup ////////////////
//////////////////////////////////////
debugLog("Hello World from Night's Watch");

const processedHashes = new Set();
let currentPersona = 'engineer'; // default value

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
    debugLog("startMonitoring");
    setupClipboardMonitoring();
  }
  if (message.action === 'updatePersona') {
    debugLog("Updating persona to:", message.persona);
    currentPersona = message.persona;
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
  debugLog("setupClipboardMonitoring");
  try {
    const content = await navigator.clipboard.readText();
    if (content && content.trim()) {
      debugLog("Clipboard content before paste: ", content);
      //chrome.runtime.sendMessage({ 
      //  action: 'clipboardUpdate', 
      //  content: content 
      //});
      const contentHash = hashContent(content);
      if (processedHashes.has(contentHash)) {
        debugLog("Content already processed, skipping...");
        return;
      }
      
      // Add paste prevention
      document.addEventListener('paste', preventPaste, true);
      window.addEventListener('paste', preventPaste, true);
      
      const maskedContent = await returnMaskedContentMock(content);
      await navigator.clipboard.writeText(maskedContent);
      
      // Remove paste prevention
      document.removeEventListener('paste', preventPaste, true);
      window.removeEventListener('paste', preventPaste, true);

      processedHashes.add(contentHash);
      debugLog("updated clipboard ::: setupClipboardMonitoring ", maskedContent);
    } else {
      debugLog("Clipboard is empty");
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
function hashContent(content) {
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
function preventPaste(e) {
  e.preventDefault();
  e.stopPropagation();
  debugLog("Paste prevented - Data sanitization in progress");
  return false;
}

/**
* Regex-based PII masking implementation
* @param {string} originalContent - Content to be masked
* @return {string} - Masked content with PII replaced
*/
async function returnMaskedContentRegex(originalContent) {
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

//// 3 second delay
async function returnMaskedContentMock(content) {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return "masked content";
}


function debugLog(...args) {
  console.log(...args, " ::: content.js");
}

//////////////////////////////////////
////////////    core    ////////////////
//////////////////////////////////////  



/**
 * Advanced PII masking using AI language model
 * @param {string} originalContent - Content to be masked
 * @return {string} - Masked content or original content if AI processing fails
 */
async function returnMaskedContentAI(originalContent) {
  try {
    const {available} = await ai.languageModel.capabilities();
    if (available !== "no") {
      const basePrompt = "You are a helpful assistant specialized in identifying and redacting PII (Personally Identifiable Information)";
      
      // Persona-specific prompts
      const personaPrompts = {
        engineer: `${basePrompt}. Preserve technical terms, code snippets, API references, and technical documentation while masking personal data.`,
        pm: `${basePrompt}. Preserve product requirements, feature specifications, and business metrics while masking personal data. Keep project names and product terminology intact.`,
        consultant: `${basePrompt}. Preserve business metrics, industry terms, and strategic insights while masking personal data. Keep company names and market terminology intact.`,
        analyst: `${basePrompt}. Preserve financial metrics, market data, and analytical insights while masking personal data. Keep company financials and market indicators intact.`,
        other: basePrompt
      };

      const session = await ai.languageModel.create({
        systemPrompt: personaPrompts[currentPersona] || personaPrompts.other
      });
      
      try {
        const result = await session.prompt(`
          Analyze the following content and redact any Personally Identifiable Information (PII) using these rules:
          - For phone numbers: Replace with "XXX-XXX-XXXX"
          - For email addresses: Replace with "dummyid@example.com"
          - For names: Replace with "Anonymous"
          - For physical addresses: Replace with "Redacted Address"
          - For credit card numbers: Replace with "XXXX-XXXX-XXXX-XXXX"
          - For social security numbers: Replace with "XXX-XX-XXXX"

          ${currentPersona === 'engineer' ? 'Preserve all code blocks, API endpoints, and technical documentation.' : ''}
          ${currentPersona === 'pm' ? 'Preserve all product features, metrics, and project terminology.' : ''}
          ${currentPersona === 'consultant' ? 'Preserve all business metrics and industry-specific terminology.' : ''}
          ${currentPersona === 'analyst' ? 'Preserve all financial metrics and market analysis terminology.' : ''}

          Ensure:
          1. The structure and format of the text remain consistent
          2. Non-PII content is left unaltered
          3. Only redact the sensitive information
          4. If there is no PII, return the original content

          Content:
          ${originalContent}
        `);
        return result;
      
      } catch (promptError) {
        console.error("AI processing error:", promptError);
        return originalContent;
      }
    }
    return originalContent;
  } catch (error) {
    console.error("AI capability check error:", error);
    return originalContent;
  }
}

