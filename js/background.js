// Handle opening URLs
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "openShortcut") {
    chrome.tabs.create({ url: request.url });
  }
});