# Night's Watch 

## Overview
Night's Watch is a Chrome extension that monitors and masks sensitive information (PII) in clipboard content on supported AI chat websites.

As both corporations and individuals increasingly adopt Gen-AI tools like ChatGPT, Gemini, and Claude, a critical challenge emerges: preventing accidental exposure of sensitive data through clipboard operations. Employees may inadvertently paste confidential information, PII, or trade secrets into these AI platforms, creating significant compliance and security risks for organisations. Similarly, in personal usage, users may unknowingly share private information—such as financial details, health records, or personal messages—while interacting with these tools. This raises serious concerns around privacy, data security, and misuse of personal information, highlighting the need for robust safeguards to ensure sensitive data remains protected in all contexts.

## Core Components

### Background Script (background.js)
1. **Initialization**
   - Loads on extension installation
   - Fetches supported sites from `config/sites.json`
   - Sets up tab listeners

2. **Tab Management**
   - Monitors tab updates and activations
   - When a supported site is detected, triggers monitoring in the content script

### Content Script (content.js)
1. **Clipboard Monitoring**
   - Activates when:
     - Tab becomes visible
     - Window gains focus
     - Receives "startMonitoring" message from background script

2. **Processing Flow**
   ```mermaid
   graph TD
   A[Detect Clipboard Content] --> B{Content Empty?}
   B -->|No| C[Generate Content Hash]
   B -->|Yes| D[End Process]
   C --> E{Already Processed?}
   E -->|No| F[Prevent Paste Events]
   E -->|Yes| D
   F --> G[Mask Content]
   G --> H[Update Clipboard]
   H --> I[Remove Paste Prevention]
   I --> J[Store Content Hash]
   ```

3. **PII Protection**
   - Implements multiple masking strategies:
     - Regex-based masking for common PII patterns
     - AI-powered masking (when available)
   - Masks sensitive data like:
     - Email addresses
     - Phone numbers
     - Credit card numbers
     - Social security numbers
     - Physical addresses
     - Common names

## Security Features
- Prevents paste events during content processing
- Tracks processed content using hash system to avoid redundant processing
- Fallback mechanisms when AI processing is unavailable
- Error handling for clipboard access issues

## Communication Flow
1. Background script detects supported websites
2. Triggers content script monitoring
3. Content script processes clipboard content
4. Masked content replaces original clipboard data
5. Error reporting back to background script if issues occur

This extension effectively creates a security layer between the user's clipboard and AI chat interfaces, ensuring sensitive information is automatically masked before being pasted into supported chat platforms.
