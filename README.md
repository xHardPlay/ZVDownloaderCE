# ZV Downloader - Extensión de Chrome

## Descripción

ZV Downloader es una extensión de Google Chrome diseñada para verificar el estado de un servicio backend y mostrar la respuesta correspondiente. Esta herramienta ha sido creada por [ZonaVirtual.Club](https://ZonaVirtual.Club) y desarrollada por Centurion Carlos Ezequiel.

## Características

- **Verificación de Servicio**: Comprueba automáticamente el estado del endpoint backend
- **Análisis de Contenido en Tiempo Real**: Extrae videos, audios, imágenes, íconos, fuentes y textos de la página actual
- **Interfaz con Pestañas**: Organiza el contenido en categorías intuitivas
- **Vista Previa de Medios**: Muestra miniaturas y controles para todos los elementos multimedia
- **Descargas Directas**: Permite descargar cualquier contenido encontrado con un clic
- **Páginas de Resultado**: Muestra la respuesta del servicio o un mensaje de mantenimiento
- **Navegación Automática**: Abre las páginas de resultado en popups separados
- **Almacenamiento Seguro**: Utiliza Chrome Storage API para manejar datos

## Instalación

1. Descarga o clona este repositorio
2. Abre Google Chrome y navega a `chrome://extensions/`
3. Activa el "Modo de desarrollador" en la esquina superior derecha
4. Haz clic en "Cargar desempaquetada"
5. Selecciona la carpeta del proyecto `ZVDownloaderCE`

## Uso

1. Haz clic en el ícono de la extensión en la barra de herramientas de Chrome
2. Se abrirá un popup que verificará automáticamente el estado del servicio
3. Si el servicio está disponible, se abrirá un popup con la respuesta
4. Si el servicio no está disponible, se abrirá un popup con el mensaje de mantenimiento

## Endpoint

La extensión verifica el siguiente endpoint:
```
https://zona-virtual-cloud-backend.carlos-mdtz9.workers.dev/api/micro/zvdownloader
```

## Arquitectura

### Archivos Principales

- `manifest.json`: Configuración de la extensión
- `popup.html`: Interfaz del popup inicial
- `popup.js`: Lógica para verificar el servicio y navegar
- `success/index.html`: Página que muestra la respuesta exitosa
- `success.js`: Script para cargar y mostrar la respuesta almacenada
- `maintenance/index.html`: Página de mensaje de mantenimiento

### Permisos Requeridos

- `storage`: Para almacenar la respuesta del servicio
- `activeTab`: Para interactuar con las pestañas activas
- `windows`: Para crear ventanas popup
- `host_permissions`: Acceso al dominio del backend

## Compatibilidad

- Google Chrome (Manifest V3)
- Compatible con las políticas de seguridad de contenido (CSP)

## Desarrollo

### Estructura del Proyecto

```
ZVDownloaderCE/
├── manifest.json
├── popup.html
├── popup.js
├── success/
│   ├── index.html
│   └── ../success.js
├── maintenance/
│   └── index.html
├── CHANGELOG.md
└── README.md
```

### Scripts

Los scripts están separados en archivos externos para cumplir con las políticas de CSP de Chrome.

## Licencia

Este proyecto está desarrollado por ZonaVirtual.Club y Centurion Carlos Ezequiel.

## Soporte

Para soporte técnico, contacta a través de [ZonaVirtual.Club](https://ZonaVirtual.Club).

## Versiones

Consulta el [CHANGELOG.md](CHANGELOG.md) para ver las versiones y cambios.
