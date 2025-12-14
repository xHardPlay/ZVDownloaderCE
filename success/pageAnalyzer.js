// Page analysis functions
export async function analyzeCurrentPage() {
    try {
        // Get stored tab ID
        const { targetTabId } = await chrome.storage.local.get('targetTabId');
        if (!targetTabId) {
            throw new Error('No target tab found');
        }

        // Get tab info
        const tab = await chrome.tabs.get(targetTabId);

        // Update page info
        document.getElementById('page-title').textContent = tab.title || 'Sin título';
        document.getElementById('page-url').textContent = tab.url || '';

        // Inject content script to analyze the page
        const results = await chrome.scripting.executeScript({
            target: { tabId: targetTabId },
            func: extractPageContent
        });

        const content = results[0].result;
        if (!content) {
            throw new Error('No se pudo extraer el contenido de la página');
        }

        // Import displayContent to use it
        const { displayContent } = await import('./displayManager.js');
        await displayContent(content);

        // Fetch and display site information
        const { fetchSiteInfo, displaySiteInfo } = await import('./siteInfo.js');
        const siteInfo = await fetchSiteInfo(tab.url);
        displaySiteInfo(siteInfo);

    } catch (error) {
        console.error('Error analyzing page:', error);
        const { showError } = await import('./utils.js');
        showError('No se pudo analizar el contenido. Verifica que estés en una página web válida.');
    }
}

export function extractPageContent() {
    const content = {
        videos: [],
        audios: [],
        images: [],
        logos: [],
        fonts: [],
        texts: [],
        files: []
    };

    // Extract videos
    const videoElements = document.querySelectorAll('video, source[type*="video"]');
    videoElements.forEach((el, index) => {
        const src = el.src || el.getAttribute('src');
        if (src) {
            content.videos.push({
                src: src,
                title: `Video ${index + 1}`,
                type: 'video'
            });
        }
    });

    // Extract embedded videos from iframes (YouTube, Vimeo, etc.)
    const videoPlatforms = [
        { pattern: /youtube\.com\/embed\//, name: 'YouTube' },
        { pattern: /youtu\.be\//, name: 'YouTube' },
        { pattern: /youtube\.com\/watch/, name: 'YouTube' },
        { pattern: /player\.vimeo\.com\/video\//, name: 'Vimeo' },
        { pattern: /vimeo\.com\//, name: 'Vimeo' },
        { pattern: /dailymotion\.com\/embed\//, name: 'Dailymotion' },
        { pattern: /twitch\.tv\/embed/, name: 'Twitch' },
        { pattern: /facebook\.com\/plugins\/video\.php/, name: 'Facebook' },
        { pattern: /instagram\.com\/p\//, name: 'Instagram' }
    ];

    const iframeElements = document.querySelectorAll('iframe[src]');
    iframeElements.forEach((iframe, index) => {
        const src = iframe.src;
        if (src) {
            const platform = videoPlatforms.find(p => p.pattern.test(src));
            if (platform) {
                // Extract video ID if possible
                let videoId = '';
                if (platform.name === 'YouTube') {
                    const match = src.match(/[?&]v=([^&#]*)/) || src.match(/embed\/([^/?]+)/) || src.match(/youtu\.be\/([^/?]+)/);
                    videoId = match ? match[1] : '';
                } else if (platform.name === 'Vimeo') {
                    const match = src.match(/video\/(\d+)/);
                    videoId = match ? match[1] : '';
                }

                const title = iframe.title || iframe.getAttribute('title') || `${platform.name} Video ${videoId || index + 1}`;

                content.videos.push({
                    src: src,
                    title: title,
                    platform: platform.name,
                    videoId: videoId,
                    type: 'video'
                });
            }
        }
    });

    // Extract audios
    const audioElements = document.querySelectorAll('audio, source[type*="audio"]');
    audioElements.forEach((el, index) => {
        const src = el.src || el.getAttribute('src');
        if (src) {
            content.audios.push({
                src: src,
                title: `Audio ${index + 1}`,
                type: 'audio'
            });
        }
    });

    // Extract images
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach((el, index) => {
        const src = el.src;
        if (src && src.length > 10) {
            // Include both regular URLs and Base64 data URLs
            const isBase64 = src.startsWith('data:');
            content.images.push({
                src: src,
                title: el.alt || `Imagen ${index + 1}`,
                type: 'image',
                isBase64: isBase64
            });
        }
    });

    // Extract logos (favicons, etc.)
    const logoElements = document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch"]');
    logoElements.forEach((el, index) => {
        const href = el.href;
        if (href) {
            const rel = el.rel || 'icon';
            content.logos.push({
                src: href,
                title: `Logo ${rel} ${index + 1}`,
                type: 'logo'
            });
        }
    });


    // Extract fonts (Google Fonts and font files)
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
    fontLinks.forEach((el, index) => {
        const href = el.href;
        if (href) {
            content.fonts.push({
                src: href,
                title: `Fuente Google ${index + 1}`,
                type: 'font'
            });
        }
    });

    // Also look for font files in stylesheets
    const styleSheets = document.styleSheets;
    for (let sheet of styleSheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.type === CSSRule.FONT_FACE_RULE) {
                    const src = rule.style.getPropertyValue('src');
                    if (src) {
                        // Extract URL from src (may contain multiple formats)
                        const urlMatch = src.match(/url\(['"]?([^'")\s]+)['"]?\)/);
                        if (urlMatch) {
                            content.fonts.push({
                                src: urlMatch[1],
                                title: `Fuente ${rule.style.getPropertyValue('font-family') || 'personalizada'}`,
                                type: 'font'
                            });
                        }
                    }
                }
            }
        } catch (e) {
            // Ignore CORS errors on stylesheets
        }
    }

    // Extract important texts
    const textElements = document.querySelectorAll('h1, h2, h3, p');
    const texts = [];
    textElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 20 && text.length < 500) {
            texts.push({
                text: text,
                tag: el.tagName.toLowerCase(),
                type: 'text'
            });
        }
    });
    // Take first 10 important texts
    content.texts = texts.slice(0, 10);

    // Extract downloadable files (zip, rar, pdf, docs, torrents, etc.)
    const fileExtensions = ['.zip', '.rar', '.7z', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.torrent', '.exe', '.msi', '.dmg', '.iso'];

    // Check current page URL first
    const currentUrl = window.location.href;
    if (currentUrl) {
        const url = currentUrl.toLowerCase();
        const hasFileExtension = fileExtensions.some(ext => url.includes(ext));

        if (hasFileExtension && !url.startsWith('javascript:') && !url.startsWith('#')) {
            const extension = fileExtensions.find(ext => url.includes(ext)) || '.unknown';
            const fileName = document.title || url.split('/').pop() || 'Archivo de página';

            content.files.push({
                src: currentUrl,
                title: fileName,
                extension: extension.substring(1), // Remove the dot
                type: 'file'
            });
        }
    }

    // Check all link elements
    const linkElements = document.querySelectorAll('a[href]');
    linkElements.forEach((el, index) => {
        const href = el.href;
        if (href) {
            const url = href.toLowerCase();
            const hasFileExtension = fileExtensions.some(ext => url.includes(ext));

            if (hasFileExtension && !url.startsWith('javascript:') && !url.startsWith('#')) {
                // Get file extension
                const extension = fileExtensions.find(ext => url.includes(ext)) || '.unknown';
                const fileName = el.textContent.trim() || href.split('/').pop() || `Archivo ${index + 1}`;

                // Avoid duplicates
                const exists = content.files.some(file => file.src === href);
                if (!exists) {
                    content.files.push({
                        src: href,
                        title: fileName,
                        extension: extension.substring(1), // Remove the dot
                        type: 'file'
                    });
                }
            }
        }
    });

    // Also check for embedded objects and iframes that might contain files
    const embedElements = document.querySelectorAll('iframe[src], embed[src], object[data]');
    embedElements.forEach((el, index) => {
        const src = el.src || el.data;
        if (src) {
            const url = src.toLowerCase();
            const hasFileExtension = fileExtensions.some(ext => url.includes(ext));

            if (hasFileExtension && !url.startsWith('javascript:') && !url.startsWith('#')) {
                const extension = fileExtensions.find(ext => url.includes(ext)) || '.unknown';
                const fileName = el.title || `Archivo embebido ${index + 1}`;

                // Avoid duplicates
                const exists = content.files.some(file => file.src === src);
                if (!exists) {
                    content.files.push({
                        src: src,
                        title: fileName,
                        extension: extension.substring(1), // Remove the dot
                        type: 'file'
                    });
                }
            }
        }
    });

    return content;
}
