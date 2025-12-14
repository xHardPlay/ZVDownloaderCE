// Display management functions
import { downloadFile, downloadText } from './downloader.js';

export async function displayContent(content) {
    const videos = content?.videos || [];
    const audios = content?.audios || [];
    const images = content?.images || [];
    const logos = content?.logos || [];
    const fonts = content?.fonts || [];
    const texts = content?.texts || [];
    const files = content?.files || [];

    displayVideos(videos);
    await displayAudios(audios);
    displayImages(images);
    displayLogos(logos);
    displayFonts(fonts);
    displayTexts(texts);
    displayFiles(files);

    // Hide empty tabs
    updateTabVisibility(videos.length, audios.length, images.length, logos.length, fonts.length, texts.length, files.length);
}

function updateTabVisibility(videosCount, audiosCount, imagesCount, logosCount, fontsCount, textsCount, filesCount) {
    const tabMappings = [
        { tab: 'info', count: 1 }, // Info tab is always available and first
        { tab: 'videos', count: videosCount },
        { tab: 'audios', count: audiosCount },
        { tab: 'images', count: imagesCount },
        { tab: 'logos', count: logosCount },
        { tab: 'fonts', count: fontsCount },
        { tab: 'texts', count: textsCount },
        { tab: 'files', count: filesCount }
    ];

    let firstVisibleTab = null;

    tabMappings.forEach(({ tab, count }) => {
        const tabElement = document.querySelector(`.tab[data-tab="${tab}"]`);
        const tabContent = document.getElementById(tab);

        if (count > 0) {
            tabElement.style.display = 'block';
            if (!firstVisibleTab) {
                firstVisibleTab = tab;
            }
        } else {
            tabElement.style.display = 'none';
            tabContent.classList.remove('active');
            tabElement.classList.remove('active');
        }
    });

    // Activate first visible tab if current active is hidden
    if (firstVisibleTab) {
        const currentActive = document.querySelector('.tab.active');
        if (!currentActive || currentActive.style.display === 'none') {
            const firstTab = document.querySelector(`.tab[data-tab="${firstVisibleTab}"]`);
            const firstContent = document.getElementById(firstVisibleTab);
            if (firstTab && firstContent) {
                firstTab.classList.add('active');
                firstContent.classList.add('active');
            }
        }
    }
}

function displayVideos(videos) {
    const container = document.getElementById('videos-list');
    if (videos.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron videos</div>';
        return;
    }

    container.innerHTML = videos.map((video, index) => {
        // Check if this is an embedded video from a platform
        if (video.platform) {
            // Generate thumbnail URL for the platform
            let thumbnailUrl = '';
            if (video.platform === 'YouTube' && video.videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/default.jpg`;
            } else if (video.platform === 'Vimeo' && video.videoId) {
                // Vimeo thumbnails require API, so we'll use a placeholder for now
                thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNSA0NUwxNSA2MEw3MCA0NUwxNSA0NVoiIGZpbGw9IiM5Q0E0QUYiLz4KPHRleHQgeD0iNjAiIHk9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkE5IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPkJJTUVPKzwvdGV4dD4KPC9zdmc+';
            } else {
                // Generic video icon for other platforms
                thumbnailUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiB2aWV3Qm94PSIwIDAgMTIwIDkwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNSA0NUwxNSA2MEw3MCA0NUwxNSA0NVoiIGZpbGw9IiM5Q0E0QUYiLz4KPHRleHQgeD0iNjAiIHk9IjMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkE5IiBmb250LXNpemU9IjEyIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiPiZWideoPC90ZXh0Pgo8L3N2Zz4K';
            }

            return `
                <div class="item">
                    <img src="${thumbnailUrl}" alt="${video.platform} video" style="max-width: 120px; max-height: 90px; object-fit: cover; border-radius: 4px;">
                    <div class="item-info">
                        <div class="item-title">${video.title}</div>
                        <div class="item-meta">Plataforma: ${video.platform}</div>
                        <div class="item-meta" style="font-size: 0.8em; opacity: 0.7;">${video.src}</div>
                    </div>
                    <button class="download-btn" data-url="${video.src}" data-filename="${video.title}.html">Ver Video</button>
                </div>
            `;
        } else {
            // Regular video file
            return `
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
            `;
        }
    }).join('');

    // Add event listeners
    container.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const url = btn.getAttribute('data-url');
            const filename = btn.getAttribute('data-filename');

            // For embedded videos, open in new tab instead of downloading
            if (filename.endsWith('.html')) {
                chrome.tabs.create({ url: url });
            } else {
                downloadFile(url, filename);
            }
        });
    });
}

async function displayAudios(audios) {
    const container = document.getElementById('audios-list');
    if (audios.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron audios</div>';
        return;
    }

    // Process audios to determine correct formats
    const processedAudios = await Promise.all(audios.map(async (audio) => {
        const format = await detectAudioFormat(audio.src);
        return {
            ...audio,
            format: format
        };
    }));

    container.innerHTML = processedAudios.map(audio => `
        <div class="item">
            <audio controls style="max-width: 150px;">
                <source src="${audio.src}" type="${getMimeType(audio.format)}">
            </audio>
            <div class="item-info">
                <div class="item-title">${audio.title}</div>
                <div class="item-meta">${audio.src}</div>
                <div class="item-meta" style="font-size: 0.8em; opacity: 0.7;">Formato: ${audio.format.toUpperCase()}</div>
            </div>
            <button class="download-btn" data-url="${audio.src}" data-filename="${audio.title}.${audio.format}">Descargar</button>
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

async function detectAudioFormat(url) {
    try {
        // First, try to get format from URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();

        // Check for common extensions
        if (pathname.includes('.mp3')) return 'mp3';
        if (pathname.includes('.wav')) return 'wav';
        if (pathname.includes('.ogg')) return 'ogg';
        if (pathname.includes('.m4a') || pathname.includes('.aac')) return 'm4a';
        if (pathname.includes('.opus')) return 'opus';
        if (pathname.includes('.webm')) return 'webm';
        if (pathname.includes('.flac')) return 'flac';

        // If no extension in URL, try to fetch content-type header
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');

        if (contentType) {
            if (contentType.includes('mpeg') || contentType.includes('mp3')) return 'mp3';
            if (contentType.includes('wav')) return 'wav';
            if (contentType.includes('ogg')) return 'ogg';
            if (contentType.includes('aac') || contentType.includes('mp4')) return 'm4a';
            if (contentType.includes('opus')) return 'opus';
            if (contentType.includes('webm')) return 'webm';
            if (contentType.includes('flac')) return 'flac';
        }

        // Default fallback
        return 'mp3';
    } catch (error) {
        console.warn('Error detecting audio format:', error);
        return 'mp3'; // Default fallback
    }
}

function getMimeType(format) {
    const mimeTypes = {
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4',
        'aac': 'audio/aac',
        'opus': 'audio/opus',
        'webm': 'audio/webm',
        'flac': 'audio/flac'
    };
    return mimeTypes[format] || 'audio/mpeg';
}

function displayImages(images) {
    const container = document.getElementById('images-list');
    if (images.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron imágenes</div>';
        return;
    }

    container.innerHTML = images.map((image, index) => {
        let filename = `${image.title}.jpg`;
        let displayUrl = image.src;

        // Handle Base64 images
        if (image.isBase64) {
            // Extract MIME type from Base64 data URL
            const mimeMatch = image.src.match(/data:([^;]+)/);
            const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

            // Set appropriate file extension based on MIME type
            if (mimeType.includes('png')) filename = `${image.title}.png`;
            else if (mimeType.includes('gif')) filename = `${image.title}.gif`;
            else if (mimeType.includes('webp')) filename = `${image.title}.webp`;
            else if (mimeType.includes('svg')) filename = `${image.title}.svg`;
            else filename = `${image.title}.jpg`;

            // Show truncated version of data URL for display
            displayUrl = `${image.src.substring(0, 50)}...`;
        }

        return `
            <div class="item">
                <img src="${image.src}" alt="${image.title}" style="max-width: 120px; max-height: 90px; object-fit: cover;">
                <div class="item-info">
                    <div class="item-title">${image.title}${image.isBase64 ? ' (Base64)' : ''}</div>
                    <div class="item-meta">${displayUrl}</div>
                    ${image.isBase64 ? '<div class="item-meta" style="font-size: 0.8em; opacity: 0.7;">Imagen embebida en la página</div>' : ''}
                </div>
                <button class="download-btn" data-url="${image.src}" data-filename="${filename}">Descargar</button>
            </div>
        `;
    }).join('');

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

function displayFiles(files) {
    const container = document.getElementById('files-list');
    if (files.length === 0) {
        container.innerHTML = '<div class="empty">No se encontraron archivos descargables</div>';
        return;
    }

    container.innerHTML = files.map(file => `
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">${file.title}</div>
                <div class="item-meta">${file.src}</div>
                <div class="item-meta" style="font-size: 0.8em; opacity: 0.7;">Tipo: ${file.extension.toUpperCase()}</div>
            </div>
            <button class="download-btn" data-url="${file.src}" data-filename="${file.title}.${file.extension}">Descargar</button>
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
