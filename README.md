# Lark Wiki AutoRead

A Chrome extension that automatically sets wiki pages to reading mode on Lark/Feishu Office platforms.

## Features

- Automatically switches wiki pages to reading mode
- Configurable domain support
- Easy configuration through options page
- Works across page navigation without reloading

## Installation

### From Chrome Web Store
1. Visit [Chrome Web Store](https://chromewebstore.google.com/category/extensions) 
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation
1. Download the latest release ZIP file
2. Extract the ZIP file to a folder
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the extracted folder

## Usage

After installation, the extension will automatically switch wiki pages to reading mode when you visit any of the configured domains.

### Configuring Domains

By default, the extension works on the following domains:
- `https://bytedance.larkoffice.com/wiki/*`
- `https://bytedance.sg.larkoffice.com/wiki/*`

To configure domains:

1. Click on the extension icon in your Chrome toolbar
2. Click "Open Domain Settings"
3. Add, remove, or reset domains as needed

## Development

### Project Structure
```
src/
├── manifest.json      # Extension manifest
├── content.js         # Content script that handles the page modification
├── background.js      # Background script for initialization
├── popup.html         # Popup UI
├── popup.js           # Popup logic
├── options.html       # Options page UI
├── options.js         # Options page logic
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Building
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `node build.js`
4. The built extension will be in the `dist` folder and packaged as a ZIP file

## How It Works

The extension:
1. Detects when you visit a wiki page on configured domains
2. Finds the mode switch control
3. Automatically clicks the "reading mode" option
4. Continues monitoring for URL changes to handle navigation

## Permissions

This extension requires the following permissions:
- `activeTab`: To interact with the current tab
- `storage`: To store domain configurations
- `<all_urls>`: To support custom domain configurations

## Contributions

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Apache License](https://www.apache.org/licenses/LICENSE-2.0)

## Disclaimer

This extension is not affiliated with or endorsed by ByteDance or Lark/Feishu. It is an independent tool created to enhance the user experience when reading wiki pages.
