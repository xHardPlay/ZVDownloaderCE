// Utility functions
export function showError(message) {
    const friendlyMessage = 'No se pudo analizar el contenido. Verifica que estés en una página web válida.';
    ['videos-list', 'audios-list', 'images-list', 'logos-list', 'fonts-list', 'texts-list'].forEach(id => {
        document.getElementById(id).innerHTML = `<div class="empty">${friendlyMessage}</div>`;
    });
}
