// Main initialization file
import { setupTabListeners } from './tabs.js';
import { analyzeCurrentPage } from './pageAnalyzer.js';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabListeners();
    analyzeCurrentPage();

    // Add refresh button listener
    document.getElementById('refresh-btn').addEventListener('click', () => {
        analyzeCurrentPage();
    });
});
