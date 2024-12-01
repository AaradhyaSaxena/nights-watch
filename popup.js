document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = new URL(tab.url).hostname;

    // Load saved settings
    const settings = await chrome.storage.sync.get({
        enabledSites: [],
        piiTypes: {
            emails: true,
            phones: true,
            names: true,
            addresses: true,
            creditCards: true,
            ssn: true
        }
    });

    // Setup main toggle
    const enableRedaction = document.getElementById('enableRedaction');
    enableRedaction.checked = settings.enabledSites.includes(currentUrl);
    enableRedaction.addEventListener('change', async (e) => {
        const enabledSites = settings.enabledSites;
        if (e.target.checked) {
            if (!enabledSites.includes(currentUrl)) {
                enabledSites.push(currentUrl);
            }
        } else {
            const index = enabledSites.indexOf(currentUrl);
            if (index > -1) {
                enabledSites.splice(index, 1);
            }
        }
        await chrome.storage.sync.set({ enabledSites });
        // Notify content script of the change
        chrome.tabs.sendMessage(tab.id, { 
            action: 'updateRedactionStatus', 
            enabled: e.target.checked 
        });
    });

    // Setup "Add Current Site" button
    const addSiteBtn = document.getElementById('addCurrentSite');
    addSiteBtn.textContent = settings.enabledSites.includes(currentUrl) 
        ? 'Site Already Added' 
        : 'Add This Site';
    addSiteBtn.disabled = settings.enabledSites.includes(currentUrl);
    addSiteBtn.addEventListener('click', async () => {
        if (!settings.enabledSites.includes(currentUrl)) {
            settings.enabledSites.push(currentUrl);
            await chrome.storage.sync.set({ enabledSites: settings.enabledSites });
            addSiteBtn.textContent = 'Site Already Added';
            addSiteBtn.disabled = true;
            enableRedaction.checked = true;
        }
    });

    // Setup PII type checkboxes
    const piiTypes = ['emails', 'phones', 'names', 'addresses', 'creditCards', 'ssn'];
    piiTypes.forEach(type => {
        const checkbox = document.getElementById(type);
        checkbox.checked = settings.piiTypes[type];
        checkbox.addEventListener('change', async (e) => {
            settings.piiTypes[type] = e.target.checked;
            await chrome.storage.sync.set({ piiTypes: settings.piiTypes });
            // Notify content script of the change
            chrome.tabs.sendMessage(tab.id, {
                action: 'updatePiiTypes',
                piiTypes: settings.piiTypes
            });
        });
    });

    // Setup footer links
    document.getElementById('review').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/[your-extension-id]' });
    });

    document.getElementById('feature').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/[your-repo]/issues' });
    });

    document.getElementById('contact').addEventListener('click', () => {
        chrome.tabs.create({ url: 'mailto:your-email@example.com' });
    });
}); 