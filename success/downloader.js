// Download functions
export function downloadFile(url, filename) {
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}

export function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}
