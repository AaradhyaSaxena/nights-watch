class ClipboardManager {
  constructor() {
    this.lastContent = null;
  }

  async readClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      this.lastContent = text;
      return text;
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      return null;
    }
  }

  async writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.lastContent = text;
      return true;
    } catch (err) {
      console.error('Failed to write to clipboard:', err);
      return false;
    }
  }

  hasContentChanged(newContent) {
    return this.lastContent !== newContent;
  }
}

export default ClipboardManager;
