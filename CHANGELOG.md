# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-13

### Added
- Initial release of ZV Downloader extension
- Popup interface for service status checking
- Automatic redirection to success or maintenance pages based on backend availability
- Storage of API response for display
- Branding and credits to ZonaVirtual.Club and Centurion Carlos Ezequiel
- Manifest V3 compatibility
- Content Security Policy compliance with external scripts

### Features
- Checks endpoint: https://zona-virtual-cloud-backend.carlos-mdtz9.workers.dev/api/micro/zvdownloader
- Real-time content analysis of current web page
- Extracts and categorizes: videos, audios, images, icons, fonts, and texts
- Tabbed interface for content organization
- Media previews with download functionality
- Displays response on success page
- Shows maintenance message when service is unavailable
- Opens result pages in popup windows

### Technical
- Chrome Extension Manifest V3
- Permissions: storage, activeTab, windows, host permissions for backend
- Web accessible resources for extension pages
