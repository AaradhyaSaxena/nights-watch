class ContentMasker {
    constructor() {
        this.systemPrompt = "You are a helpful assistant specialized in identifying and redacting PII (Personally Identifiable Information) content such as names, phone numbers, email addresses, physical addresses, credit card numbers, and social security numbers.";
    }

    async maskContent(originalContent) {
        try {
            const {available} = await ai.languageModel.capabilities();
            if (available !== "no") {
                return await this.processWithAI(originalContent);
            }
            return await this.processWithRegex(originalContent);
        } catch (error) {
            console.error("Content masking error:", error);
            return originalContent;
        }
    }

    async processWithAI(originalContent) {
        try {
            const session = await ai.languageModel.create({
                systemPrompt: this.systemPrompt
            });
            
            const result = await session.prompt(`
                Analyze the following content and redact any Personally Identifiable Information (PII) using one of the following rules:
                - For phone numbers: Replace with "XXX-XXX-XXXX".
                - For email addresses: Replace with "dummyid@example.com" or "XXXXXXX".
                - For names: Replace with "Anonymous" or "XXXXXXX".
                - For physical addresses: Replace with "Redacted Address" or "XXXXXXX".
                - For credit card numbers: Replace with "XXXX-XXXX-XXXX-XXXX".
                - For social security numbers: Replace with "XXX-XX-XXXX".
                Content:
                ${originalContent}
            `);
            return result;
        } catch (error) {
            console.error("AI processing error:", error);
            return this.processWithRegex(originalContent);
        }
    }

    async processWithRegex(originalContent) {
        let maskedContent = originalContent;
        
        // Email addresses
        maskedContent = maskedContent.replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 
            'dummyid@example.com'
        );
        
        // Phone numbers
        maskedContent = maskedContent.replace(
            /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
            'XXX-XXX-XXXX'
        );
        
        // Credit card numbers
        maskedContent = maskedContent.replace(
            /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
            'XXXX-XXXX-XXXX-XXXX'
        );
        
        // Social security numbers
        maskedContent = maskedContent.replace(
            /\d{3}-?\d{2}-?\d{4}/g,
            'XXX-XX-XXXX'
        );
        
        // Common names
        const commonNames = ['John', 'Jane', 'Smith', 'Johnson', 'Williams'];
        commonNames.forEach(name => {
            const nameRegex = new RegExp(name, 'gi');
            maskedContent = maskedContent.replace(nameRegex, 'Anonymous');
        });

        // Addresses
        maskedContent = maskedContent.replace(
            /\d+\s+[a-zA-Z\s,]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\s*,?\s*[a-zA-Z\s]+,\s*[A-Z]{2}\s*\d{5}/gi,
            'Redacted Address'
        );

        console.log('Masked content:', maskedContent);
        return maskedContent;
    }
} 