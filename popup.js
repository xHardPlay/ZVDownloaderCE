const endpoint = 'https://zona-virtual-cloud-backend.carlos-mdtz9.workers.dev/api/micro/zvdownloader';

(async () => {
    try {
        // Get current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.storage.local.set({ targetTabId: tab.id });

        const response = await fetch(endpoint);
        console.log('Response status:', response.status);
        if (response.ok) {
            const data = await response.text();
            console.log('Response data:', data);
            chrome.storage.local.set({ response: data }, () => {
                chrome.windows.create({
                    url: chrome.runtime.getURL('success/index.html'),
                    type: 'popup',
                    width: 600,
                    height: 800
                });
                window.close();
            });
        } else {
            throw new Error('Service unavailable');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // For now, if API fails, still show content viewer
        chrome.windows.create({
            url: chrome.runtime.getURL('success/index.html'),
            type: 'popup',
            width: 600,
            height: 800
        });
        window.close();
    }
})();
