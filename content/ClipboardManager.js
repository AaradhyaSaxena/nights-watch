class ClipboardManager {
    constructor() {
        this.processedHashes = new Set();
    }

    async readClipboard() {
        try {
            const content = await navigator.clipboard.readText();
            if (content && content.trim()) {
                console.log("Clipboard content before paste >>> content.js:", content);
                return content;
            }
            console.log("Clipboard is empty");
            return null;
        } catch (error) {
            console.error("Clipboard access error:", error);
            chrome.runtime.sendMessage({ 
                action: 'clipboardError', 
                error: error.message 
            });
            throw error;
        }
    }

    async writeClipboard(content) {
        try {
            await navigator.clipboard.writeText(content);
            console.log("updated clipboard >>> setupClipboardMonitoring", content);
        } catch (error) {
            console.error("Clipboard write error:", error);
            throw error;
        }
    }

    hashContent(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return hash;
    }

    isContentProcessed(content) {
        const hash = this.hashContent(content);
        if (this.processedHashes.has(hash)) {
            console.log("Content already processed, skipping...");
            return true;
        }
        return false;
    }

    markContentAsProcessed(content) {
        const hash = this.hashContent(content);
        this.processedHashes.add(hash);
    }
}

export default ClipboardManager;
