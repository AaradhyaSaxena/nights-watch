document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = new URL(tab.url).hostname;

    // Load supported sites from storage
    const supportedSites = await chrome.storage.sync.get({ addedSites: [] });

    const isPreConfigured = await supportedSites.addedSites.includes(currentUrl);

    // Setup main toggle
    const enableRedaction = document.getElementById('enableRedaction');
    enableRedaction.checked = isPreConfigured;
    enableRedaction.addEventListener('change', async (e) => {
        if (e.target.checked) {
            // Add site to user's added sites if not already present
            if (!supportedSites.addedSites.includes(currentUrl)) {
                supportedSites.addedSites.push(currentUrl);
                await chrome.storage.sync.set({ addedSites: supportedSites.addedSites });
            }
        } else {
            // Remove site from user's added sites
            supportedSites.addedSites = supportedSites.addedSites.filter(site => site !== currentUrl);
            await chrome.storage.sync.set({ addedSites: supportedSites.addedSites });
        }
    });

    // Load saved settings for PII types
    const settings = await chrome.storage.sync.get({
        persona: 'analyst' // default value
    });

    const personas = ['engineer', 'pm', 'consultant', 'analyst', 'other'];
    let selectedPersona = settings.persona;

    personas.forEach(persona => {
        const button = document.getElementById(persona);
        if (selectedPersona === persona) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            personas.forEach(p => document.getElementById(p).classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Only show input field if "Other" is clicked
            if (persona === 'other') {
                document.getElementById('otherPersonaInput').style.display = 'block';
            } else {
                document.getElementById('otherPersonaInput').style.display = 'none';
            }
        });
    });

    // Setup the submit button for custom persona
    document.getElementById('submitCustomPersona').addEventListener('click', async () => {
        const customPersona = document.getElementById('customPersona').value;
        if (customPersona.trim()) {
            await chrome.storage.sync.set({ persona: customPersona });
            chrome.tabs.sendMessage(tab.id, {
                action: 'updatePersona',
                persona: customPersona
            });
            console.log("Custom persona set to: ", customPersona);
            document.getElementById('otherPersonaInput').style.display = 'none';
        }
    });

    // Setup footer links
    document.getElementById('review').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://aaradhyasaxena.github.io/nightswatch-web' });
    });

    document.getElementById('feature').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://docs.google.com/forms/d/1Q4NZt-b9wsBuw6OGPEZyBmVf6hHO2NJ0ZrVy_OnxYik/prefill' });
    });

    document.getElementById('contact').addEventListener('click', () => {
        chrome.tabs.create({ url: 'mailto:yum3.ai@gmail.com' });
    });
}); 