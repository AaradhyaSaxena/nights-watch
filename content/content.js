console.log("Hello World from Night's Watch >>> content.js");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});

async function returnMaskedContent(originalContent) {
    // chrome.runtime.sendMessage({ 
    //     action: 'geminiCall', 
    //     content: originalContent 
    // });
    // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //     if (message.action === 'geminiResponse') {
    //       console.log("content", message.content);
    //       return message.content;
    //     }
    //   });
    const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
    console.log("available");
    if (available !== "no") {
      const session = await ai.languageModel.create({
        systemPrompt: "You are a helpful assistant specialized in masking PII content like name, phone number, email, address."
      });
      const result = await session.prompt(`
        Analyze the following content and mask it:
        ${originalContent}
      `);
      
      console.log(result);
      return result + originalContent;
    }
    return "NOTHING";
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