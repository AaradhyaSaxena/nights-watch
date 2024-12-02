class ClipboardMonitor {
    constructor() {
        this.clipboardManager = new ClipboardManager();
        this.contentMasker = new ContentMasker();
        this.isMonitoring = false;
    }

    async start() {
        console.log("setupClipboardMonitoring >>> content.js");
        this.isMonitoring = true;
        await this.processClipboard();
    }

    stop() {
        this.isMonitoring = false;
    }

    async processClipboard() {
        try {
            const content = await this.clipboardManager.readClipboard();
            if (!content || this.clipboardManager.isContentProcessed(content)) return;

            // Add paste prevention
            document.addEventListener('paste', preventPaste, true);
            window.addEventListener('paste', preventPaste, true);

            const maskedContent = await this.contentMasker.maskContent(content);
            await this.clipboardManager.writeClipboard(maskedContent);

            // Remove paste prevention
            document.removeEventListener('paste', preventPaste, true);
            window.removeEventListener('paste', preventPaste, true);

            this.clipboardManager.markContentAsProcessed(content);
        } catch (error) {
            console.error("Clipboard processing error:", error);
        }
    }
} 