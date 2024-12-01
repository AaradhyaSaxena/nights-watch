document.addEventListener('DOMContentLoaded', async () => {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentUrl = new URL(tab.url).hostname;

    // Load saved settings and supported sites
    const [settings, config] = await Promise.all([
        chrome.storage.sync.get({
            enabledSites: [],
            piiTypes: {
                emails: true,
                phones: true,
                names: true,
                addresses: true,
                creditCards: true,
                ssn: true
            }
        }),
        // Load supported sites from config
        fetch(chrome.runtime.getURL('config/sites.json'))
            .then(response => response.json())
    ]);

    // Check if current site is in supported sites
    const isSupportedSite = config.supportedSites.some(site => currentUrl.includes(site));

    // Setup main toggle
    const enableRedaction = document.getElementById('enableRedaction');
    
    // If it's a supported site and not explicitly disabled, enable it
    if (isSupportedSite) {
        // Only check enabledSites for explicitly disabled sites
        enableRedaction.checked = !settings.enabledSites.includes(`disabled:${currentUrl}`);
    } else {
        enableRedaction.checked = settings.enabledSites.includes(currentUrl);
    }

    enableRedaction.addEventListener('change', async (e) => {
        let enabledSites = settings.enabledSites;
        
        if (isSupportedSite) {
            // For supported sites, we store disabled state with a prefix
            if (!e.target.checked) {
                if (!enabledSites.includes(`disabled:${currentUrl}`)) {
                    enabledSites.push(`disabled:${currentUrl}`);
                }
            } else {
                const index = enabledSites.indexOf(`disabled:${currentUrl}`);
                if (index > -1) {
                    enabledSites.splice(index, 1);
                }
            }
        } else {
            // For non-supported sites, we store enabled state normally
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
        }

        await chrome.storage.sync.set({ enabledSites });
        
        // Notify content script of the change
        chrome.tabs.sendMessage(tab.id, { 
            action: 'toggleRedaction', 
            enabled: e.target.checked 
        });
    });

    // Update the "Add Current Site" button state
    const addSiteBtn = document.getElementById('addCurrentSite');
    if (isSupportedSite) {
        addSiteBtn.textContent = 'Site Already Supported';
        addSiteBtn.disabled = true;
    } else {
        addSiteBtn.textContent = settings.enabledSites.includes(currentUrl) 
            ? 'Site Already Added' 
            : 'Add This Site';
        addSiteBtn.disabled = settings.enabledSites.includes(currentUrl);
    }

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