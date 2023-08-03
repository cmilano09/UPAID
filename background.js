// Generate a random alphanumeric ID
function generateID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters.charAt(randomIndex);
    }
    return id;
  }
  
  // Handle messages from the content script and popup
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'getGeneratedID') {
      chrome.storage.local.get('generatedID', function (data) {
        const id = data.generatedID || generateID();
        sendResponse({ id: id });
        chrome.storage.local.set({ 'generatedID': id });
      });
      return true; // Enable asynchronous response
    } else if (request.type === 'resetGeneratedID') {
      chrome.storage.local.remove('generatedID');
      sendResponse({ success: true });
    } else if (request.type === 'saveAdPreferences') {
      chrome.storage.local.set({ 'adPreferences': request.data }, function() {
        sendResponse({ success: true });
      });
      return true; // Enable asynchronous response
    } else if (request.type === 'getAdPreferences') {
      chrome.storage.local.get('adPreferences', function (data) {
        sendResponse({ data: data.adPreferences });
      });
      return true; // Enable asynchronous response
    }
  });
  
  // Send a message to the content script to retrieve the generated ID
  function sendGetGeneratedIDMessage(tabId) {
    chrome.tabs.sendMessage(tabId, { type: 'getGeneratedID' }, function (response) {
      if (response && response.id) {
        chrome.browserAction.setBadgeText({ text: response.id });
      } else {
        chrome.browserAction.setBadgeText({ text: '' });
      }
    });
  }
  
  // Listen for tab updates to send messages to the content script
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
      sendGetGeneratedIDMessage(tabId);
    }
  });
  
  // Listen for tab switches to send messages to the content script
  chrome.tabs.onActivated.addListener(function (activeInfo) {
    sendGetGeneratedIDMessage(activeInfo.tabId);
  });
  