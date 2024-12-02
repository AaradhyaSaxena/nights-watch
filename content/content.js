console.log("Hello World from Night's Watch >>> content.js");

const clipboardMonitor = new ClipboardMonitor();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startMonitoring') {
    console.log("startMonitoring >>> content.js");
    clipboardMonitor.start();
  }
});

// Keep the global preventPaste function as it's used as an event listener
function preventPaste(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("Paste prevented - content is being processed");
  return false;
}

// Keep visibility and focus monitoring at the document level
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    clipboardMonitor.processClipboard();
  }
});

window.addEventListener('focus', () => {
  clipboardMonitor.processClipboard();
});
