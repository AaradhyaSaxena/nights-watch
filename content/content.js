console.log("Hello World from Night's Watch >>> content.js");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});

async function returnMaskedContent(originalContent) {
    try {
        const {available} = await ai.languageModel.capabilities();
        if (available !== "no") {
            const session = await ai.languageModel.create({
                systemPrompt: "You are a helpful assistant specialized in masking PII content like name, phone number, email, address."
            });
            try {
                const result = await session.prompt(`
                    Analyze the following content and mask it:
                    - If the content is a phone number, mask it with X's.
                    - If the content is an email, mask it with X's.
                    - If the content is a name, mask it with X's.
                    - If the content is an address, mask it with X's.
                    - If the content is a credit card number, mask it with X's.
                    - If the content is a social security number, mask it with X's.
                    Only mask the content, do not add any other text and keep the same format.
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


async function setupClipboardMonitoring() {
  console.log("setupClipboardMonitoring >>> content.js");
  try {
    const content = await navigator.clipboard.readText();
    if (content && content.trim()) {
      console.log("Clipboard content before paste >>> content.js:", content);
      chrome.runtime.sendMessage({ 
        action: 'clipboardUpdate', 
        content: content 
      });
      const maskedContent = await returnMaskedContent(content);
      await navigator.clipboard.writeText(maskedContent);
      console.log("updated clipboard >>> setupClipboardMonitoring", maskedContent);
    } else {
      console.log("Clipboard is empty");
    }
  } catch (error) {
    console.error("Clipboard access error:", error);
    // Optionally notify the user that they need to focus the page
    chrome.runtime.sendMessage({ 
      action: 'clipboardError', 
      error: 'Please click on the page to enable clipboard access' 
    });
  }
}

document.addEventListener('click', () => {
  setupClipboardMonitoring();
});