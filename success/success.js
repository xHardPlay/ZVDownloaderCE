function showTab(tabId, targetElement) {
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

function setupTabListeners() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            showTab(tabId, tab);
        });
    });
}

async function analyzeCurrentPage() {
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
        displayContent(content);

    } catch (error) {
        console.error('Error analyzing page:', error);
        showError('No se pudo analizar el contenido. Verifica que estés en una página web válida.');
    }
}

function extractPageContent() {
    const content = {
        videos: [],
        audios: [],
        images: [],
        logos: [],
        fonts: [],
        texts: []
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
        if (src && !src.startsWith('data:') && src.length > 10) {
            content.images.push({
                src: src,
                title: el.alt || `Imagen ${index + 1}`,
                type: 'image'
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

    return content;
}

function displayContent(content) {
    displayVideos(content?.videos || []);
    displayAudios(content?.audios || []);
    displayImages(content?.images || []);
    displayLogos(content?.logos || []);
    displayFonts(content?.fonts || []);
    displayTexts(content?.texts || []);
}

function displayVideos(videos) {
    const container = document.getElementById('videos-list');
    if (videos.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron videos</div>';
        return;
    }

    container.innerHTML = videos.map((video, index) => `
        <div class="item">
            <video controls style="max-width: 150px; max-height: 100px;">
                <source src="${video.src}" type="video/mp4">
            </video>
            <div class="item-info">
                <div class="item-title">${video.title}</div>
                <div class="item-meta">${video.src}</div>
            </div>
            <button class="download-btn" data-url="${video.src}" data-filename="${video.title}.mp4">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');
            downloadFile(url, filename);
        });
    });
}

function displayAudios(audios) {
    const container = document.getElementById('audios-list');
    if (audios.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron audios</div>';
        return;
    }

    container.innerHTML = audios.map(audio => `
        <div class="item">
            <audio controls style="max-width: 150px;">
                <source src="${audio.src}" type="audio/mpeg">
            </audio>
            <div class="item-info">
                <div class="item-title">${audio.title}</div>
                <div class="item-meta">${audio.src}</div>
            </div>
            <button class="download-btn" data-url="${audio.src}" data-filename="${audio.title}.mp3">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');
            downloadFile(url, filename);
        });
    });
}

function displayImages(images) {
    const container = document.getElementById('images-list');
    if (images.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron imágenes</div>';
        return;
    }

    container.innerHTML = images.map(image => `
        <div class="item">
            <img src="${image.src}" alt="${image.title}">
            <div class="item-info">
                <div class="item-title">${image.title}</div>
                <div class="item-meta">${image.src}</div>
            </div>
            <button class="download-btn" data-url="${image.src}" data-filename="${image.title}.jpg">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');
            downloadFile(url, filename);
        });
    });
}

function displayLogos(logos) {
    const container = document.getElementById('logos-list');
    if (logos.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron logos</div>';
        return;
    }

    container.innerHTML = logos.map(logo => `
        <div class="item">
            <img src="${logo.src}" alt="${logo.title}" style="width: 32px; height: 32px; object-fit: contain;">
            <div class="item-info">
                <div class="item-title">${logo.title}</div>
                <div class="item-meta">${logo.src}</div>
            </div>
            <button class="download-btn" data-url="${logo.src}" data-filename="${logo.title.replace(/\s+/g, '_')}.ico">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');
            downloadFile(url, filename);
        });
    });
}



function displayFonts(fonts) {
    const container = document.getElementById('fonts-list');
    if (fonts.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron fuentes</div>';
        return;
    }

    container.innerHTML = fonts.map(font => `
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">${font.title}</div>
                <div class="item-meta">${font.src}</div>
            </div>
            <button class="download-btn" data-url="${font.src}" data-filename="${font.title.replace(/\s+/g, '_')}.css">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');
            downloadFile(url, filename);
        });
    });
}

function displayTexts(texts) {
    const container = document.getElementById('texts-list');
    if (texts.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron textos importantes</div>';
        return;
    }

    container.innerHTML = texts.map(text => `
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">${text.text.substring(0, 50)}...</div>
                <div class="item-meta">Tag: ${text.tag}</div>
            </div>
            <button class="download-btn" data-text="${encodeURIComponent(text.text)}" data-filename="texto_${text.tag}.txt">Descargar</button>
        </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = decodeURIComponent(btn.getAttribute('data-text'));
            const filename = btn.getAttribute('data-filename');
            downloadText(text, filename);
        });
    });
}

function downloadFile(url, filename) {
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
    });
}

function showError(message) {
    const friendlyMessage = 'No se pudo analizar el contenido. Verifica que estés en una página web válida.';
    ['videos-list', 'audios-list', 'images-list', 'logos-list', 'fonts-list', 'texts-list'].forEach(id => {
        document.getElementById(id).innerHTML = `<div class="empty">${friendlyMessage}</div>`;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabListeners();
    analyzeCurrentPage();
});
