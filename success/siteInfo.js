// Site information functions
export async function fetchSiteInfo(url) {
    const siteInfo = {
        url: url,
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        domain: '',
        ip: 'Cargando...',
        location: 'Cargando...'
    };

    try {
        const urlObj = new URL(url);
        siteInfo.protocol = urlObj.protocol.replace(':', '');
        siteInfo.hostname = urlObj.hostname;
        siteInfo.port = urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80');
        siteInfo.pathname = urlObj.pathname;

        // Extract domain (remove www. if present)
        siteInfo.domain = urlObj.hostname.replace(/^www\./, '');

        // Try to fetch IP address
        try {
            const ipResponse = await fetch(`https://dns.google/resolve?name=${siteInfo.hostname}&type=A`);
            const ipData = await ipResponse.json();
            if (ipData.Answer && ipData.Answer.length > 0) {
                siteInfo.ip = ipData.Answer[0].data;
            } else {
                siteInfo.ip = 'No disponible';
            }
        } catch (ipError) {
            console.warn('Could not fetch IP:', ipError);
            siteInfo.ip = 'No disponible';
        }

        // Try to fetch location based on IP
        if (siteInfo.ip !== 'No disponible') {
            try {
                const locationResponse = await fetch(`https://ipapi.co/${siteInfo.ip}/json/`);
                const locationData = await locationResponse.json();
                if (locationData.city && locationData.country_name) {
                    siteInfo.location = `${locationData.city}, ${locationData.country_name}`;
                } else {
                    siteInfo.location = 'No disponible';
                }
            } catch (locationError) {
                console.warn('Could not fetch location:', locationError);
                siteInfo.location = 'No disponible';
            }
        } else {
            siteInfo.location = 'No disponible';
        }

    } catch (error) {
        console.error('Error parsing URL:', error);
        siteInfo.error = 'Error al analizar la URL';
    }

    return siteInfo;
}

export function displaySiteInfo(siteInfo) {
    const container = document.getElementById('info-list');

    if (siteInfo.error) {
        container.innerHTML = `<div class="empty">${siteInfo.error}</div>`;
        return;
    }

    container.innerHTML = `
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">URL Completa</div>
                <div class="item-meta">${siteInfo.url}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Protocolo</div>
                <div class="item-meta">${siteInfo.protocol}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Hostname</div>
                <div class="item-meta">${siteInfo.hostname}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Puerto</div>
                <div class="item-meta">${siteInfo.port}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Ruta</div>
                <div class="item-meta">${siteInfo.pathname || '/'}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Dominio</div>
                <div class="item-meta">${siteInfo.domain}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Dirección IP</div>
                <div class="item-meta">${siteInfo.ip}</div>
            </div>
        </div>
        <div class="item">
            <div class="item-info" style="margin-right: 0;">
                <div class="item-title">Ubicación del Servidor</div>
                <div class="item-meta">${siteInfo.location}</div>
            </div>
        </div>
    `;
}
