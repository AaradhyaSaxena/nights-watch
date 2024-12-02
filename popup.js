document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = new URL(tab.url).hostname;

    // Load supported sites from sites.json
    const supportedSitesResponse = await fetch('config/sites.json');
    const supportedSites = await supportedSitesResponse.json();

    // Load user-added sites from storage
    //const isPreConfigured = supportedSites.supportedSites.includes(currentUrl);
    const userSettings = await chrome.storage.sync.get({ addedSites: [] });
    const allSupportedSites = [...supportedSites.supportedSites, ...userSettings.addedSites];

    const isPreConfigured = allSupportedSites.includes(currentUrl);

    // Setup "Add Current Site" button
    const addSiteBtn = document.getElementById('addCurrentSite');
    if (isPreConfigured) {
        addSiteBtn.textContent = 'Site Already Added';
        addSiteBtn.disabled = true;
    } else {
        addSiteBtn.textContent = 'Add This Site';
        addSiteBtn.disabled = false;
        addSiteBtn.addEventListener('click', async () => {
            userSettings.addedSites.push(currentUrl);
            await chrome.storage.sync.set({ addedSites: userSettings.addedSites });
            addSiteBtn.textContent = 'Site Already Added';
            addSiteBtn.disabled = true;
        });
    }

    // Setup main toggle
    const enableRedaction = document.getElementById('enableRedaction');
    enableRedaction.checked = isPreConfigured;
    enableRedaction.addEventListener('change', (e) => {
        // Notify content script of the change
        chrome.tabs.sendMessage(tab.id, { 
            action: 'updateRedactionStatus', 
            enabled: e.target.checked 
        });
    });

    // Load saved settings for PII types
    const settings = await chrome.storage.sync.get({
        persona: 'engineer' // default value
    });

    const personas = ['engineer', 'pm', 'consultant', 'analyst'];
    personas.forEach(persona => {
        const button = document.getElementById(persona);
        if (settings.persona === persona) {
            button.classList.add('active');
        }
        button.addEventListener('click', async () => {
            // Remove active class from all buttons
            personas.forEach(p => document.getElementById(p).classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            await chrome.storage.sync.set({ persona: persona });
            // Notify content script of the change
            chrome.tabs.sendMessage(tab.id, {
                action: 'updatePersona',
                persona: persona
            });
        });
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