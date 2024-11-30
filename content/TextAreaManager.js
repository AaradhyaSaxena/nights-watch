console.log("TextAreaManager.js loading attempt");
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded - TextAreaManager.js");
});

console.log("TextAreaManager.js loaded!");

class TextAreaManager {
  constructor() {
    this.lastContent = null;
    this.textarea = null;
    console.log("TextAreaManager constructor called");
    this.initialize();
  }

  initialize() {
    try {
      console.log("Attempting to find textarea...");
      this.textarea = document.querySelector("textarea");
      
      if (!this.textarea) {
        console.error('Textarea element not found');
        const allTextAreas = document.querySelectorAll('textarea');
        console.log('All textareas found:', allTextAreas);
        return;
      }
      
      console.log("Textarea found:", this.textarea);
      
      // Add input event listener
      this.textarea.addEventListener("input", (event) => {
        console.log("Input event triggered");
        this.handleInput(event);
      });
    } catch (err) {
      console.error('Failed to initialize textarea manager:', err);
    }
  }

  handleInput(event) {
    try {
      const text = event.target.value;
      console.log("handleInput called, text:", text?.substring(0, 50) + "...");
      this.lastContent = text;
      return text;
    } catch (err) {
      console.error('Failed to read textarea:', err);
      return null;
    }
  }

  setText(text) {
    try {
      if (!this.textarea) return false;
      this.textarea.value = text;
      this.lastContent = text;
      return true;
    } catch (err) {
      console.error('Failed to write to textarea:', err);
      return false;
    }
  }

  hasContentChanged(newContent) {
    return this.lastContent !== newContent;
  }
}

export default TextAreaManager;
