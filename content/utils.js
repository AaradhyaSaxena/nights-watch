/**
 * Generates a hash for the given content to track processed items
 * @param {string} content - The content to hash
 * @return {number} - 32-bit integer hash
 */
export function hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
  
/**
 * Prevents paste events during content processing
 * @param {Event} e - Paste event
 * @return {boolean} - Always returns false to prevent default behavior
 */
export function preventPaste(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Paste prevented - content is being processed");
    return false;
}
 
/**
 * Regex-based PII masking implementation
 * @param {string} originalContent - Content to be masked
 * @return {string} - Masked content with PII replaced
 */
export async function returnMaskedContentRegex(originalContent) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let maskedContent = originalContent;
    maskedContent = maskedContent.replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 
        'dummyid@example.com'
    );
    maskedContent = maskedContent.replace(
        /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
        'XXX-XXX-XXXX'
    );
    maskedContent = maskedContent.replace(
        /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
        'XXXX-XXXX-XXXX-XXXX'
    );
    maskedContent = maskedContent.replace(
        /\d{3}-?\d{2}-?\d{4}/g,
        'XXX-XX-XXXX'
    );
    const commonNames = ['John', 'Jane', 'Smith', 'Johnson', 'Williams'];
    commonNames.forEach(name => {
        const nameRegex = new RegExp(name, 'gi');
        maskedContent = maskedContent.replace(nameRegex, 'Anonymous');
    });
    maskedContent = maskedContent.replace(
        /\d+\s+[a-zA-Z\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\s*,?\s*[a-zA-Z\s]+,\s*[A-Z]{2}\s*\d{5}/gi,
        'Redacted Address'
    );
    console.log('Masked content:', maskedContent);
    return maskedContent;
}