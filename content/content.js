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

        // Wait for the redacted content
        chrome.runtime.sendMessage(
          { action: 'redactClipboardContent', content },
          (response) => {
            if (response && response.redactedContent) {
              console.log("Redacted content received >>> content.js:", response.redactedContent);
              
              // Get the current cursor position
              const target = event.target;
              if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
                const start = target.selectionStart;
                const end = target.selectionEnd;
                const currentValue = target.value;
                
                // Insert the redacted content at cursor position
                target.value = currentValue.substring(0, start) + 
                              response.redactedContent + 
                              currentValue.substring(end);
                
                // Move cursor to end of inserted text
                target.selectionStart = target.selectionEnd = start + response.redactedContent.length;
                
                console.log("Redacted content pasted >>> content.js");
              }
            } else {
              console.error("No redacted content received >>> content.js");
            }
          }
        );
      } else {
        console.log("Clipboard is empty >>> content.js");
      }
    } catch (error) {
      console.error("Error reading clipboard >>> content.js:", error);
    }
  });
}