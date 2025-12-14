// Tab management functions
export function showTab(tabId, targetElement) {
    // Hide all tab contents
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    // Remove active from all tabs
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');
    targetElement.classList.add('active');
}

export function setupTabListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            // Only switch if tab is visible
            if (tab.style.display !== 'none') {
                showTab(tabId, tab);
            }
        });
    });
}
