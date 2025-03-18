chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "initStorage") {
    chrome.storage.sync.get('domains', (data) => {
      if (!data.domains) {
        chrome.storage.sync.set({
          domains: [
            "https://bytedance.larkoffice.com/wiki/*",
            "https://bytedance.sg.larkoffice.com/wiki/*"
          ]
        });
      }
    });
  }
});
