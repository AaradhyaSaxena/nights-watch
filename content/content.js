console.log("Hello World from Night's Watch >>> content.js");


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    setupClipboardMonitoring();
  }
});


///// masks after paste
async function setupClipboardMonitoring() {
  console.log("setupClipboardMonitoring >>> content.js");
  const content = await navigator.clipboard.readText();
  if (content && content.trim()) {
    console.log("Clipboard content before paste >>> content.js:", content);
    chrome.runtime.sendMessage({ 
      action: 'clipboardUpdate', 
      content: content 
    });
    await navigator.clipboard.writeText("masked content");
    console.log("Event target type >>> 1st if content.js:", content);
  } else {
    console.log("Clipboard is empty");
  }
  document.addEventListener('paste', async (event) => {
    event.preventDefault();  // not working
    try {
      const content = await navigator.clipboard.readText();
      if (content && content.trim()) {
        console.log("Clipboard content before paste >>> content.js:", content);
        chrome.runtime.sendMessage({ 
          action: 'clipboardUpdate', 
          content: content 
        });
        console.log("Event target type >>> content.js:", event.target.value);
      } else {
        console.log("Clipboard is empty");
      }
    } catch (error) {
      console.error("Error reading clipboard:", error);
    }
  });
} 