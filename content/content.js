console.log("Hello World from Night's Watch >>> content.js");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});

async function returnMaskedContent(originalContent) {
    await console.log("masking content", originalContent);
    return "masked content";
}


async function setupClipboardMonitoring() {
  console.log("setupClipboardMonitoring >>> content.js");
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
} 