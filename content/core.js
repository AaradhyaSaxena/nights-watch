

/**
 * Advanced PII masking using AI language model
 * @param {string} originalContent - Content to be masked
 * @return {string} - Masked content or original content if AI processing fails
 */
export async function returnMaskedContentAI(originalContent) {
    try {
        const {available} = await ai.languageModel.capabilities();
        if (available !== "no") {
          const session = await ai.languageModel.create({
              systemPrompt: "You are a helpful assistant specialized in identifying and redacting PII (Personally Identifiable Information) content such as names, phone numbers, email addresses, physical addresses, credit card numbers, and social security numbers."
          });
          
          try {
              const result = await session.prompt(`
                  Analyze the following content and redact any Personally Identifiable Information (PII) using one of the following rules:
                  - For phone numbers: Replace with "XXX-XXX-XXXX".
                  - For email addresses: Replace with "dummyid@example.com" or "XXXXXXX".
                  - For names: Replace with "Anonymous" or "XXXXXXX".
                  - For physical addresses: Replace with "Redacted Address" or "XXXXXXX".
                  - For credit card numbers: Replace with "XXXX-XXXX-XXXX-XXXX".
                  - For social security numbers: Replace with "XXX-XX-XXXX".
                  Ensure:
                  1. The structure and format of the text remain consistent.
                  2. Non-PII content is left unaltered.
                  3. Only redact the sensitive information.
                  4. If there is no PII, return the original content.
                  
                  Example Input: "My email id is harrystyles@gmail.com"
                  Example Output: "My email id is dummyid@example.com" or "My email id is XXXXXXX".
          
                  Content:
                  ${originalContent}
              `);
              return result;
          
            } catch (promptError) {
                console.error("AI processing error:", promptError);
                return originalContent; // Return original content if AI processing fails
            }
        }
        return originalContent; // Return original content if AI is not available
    } catch (error) {
        console.error("AI capability check error:", error);
        return originalContent; // Return original content if capability check fails
    }
}
  
  