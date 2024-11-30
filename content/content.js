console.log("Hello World from Night's Watch >>> content.js");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});

function setupClipboardMonitoring() {
  console.log("setupClipboardMonitoring >>> content.js");
  document.addEventListener('paste', async (event) => {
    event.preventDefault(); 
    try {
      const content = await navigator.clipboard.readText();
      if (content && content.trim()) {
        console.log("Clipboard content before paste >>> content.js:", content);
        chrome.runtime.sendMessage({ 
          action: 'clipboardUpdate', 
          content: content 
        });
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          event.target.value += "content masked"; 
          console.log("content masked >>> content.js");
        }
      } else {
        console.log("Clipboard is empty");
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
    }
  });
} 