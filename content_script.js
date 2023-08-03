// Handle messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'getGeneratedID') {
    const generatedIDElement = document.getElementById('generated-id');
    if (generatedIDElement) {
      sendResponse({ id: generatedIDElement.textContent });
    }
  }
});

// Inject the ID into the web page
function injectID(id) {
  const generatedIDElement = document.getElementById('generated-id');
  if (generatedIDElement) {
    generatedIDElement.textContent = id;
  } else {
    const element = document.createElement('div');
    element.setAttribute('id', 'generated-id');
    element.style.display = 'none';
    element.textContent = id;
    document.body.appendChild(element);
  }
}

// Send a message to the background script to retrieve the generated ID
chrome.runtime.sendMessage({ type: 'getGeneratedID' }, function (response) {
  if (response && response.id) {
    injectID(response.id);
  }
});

// Listen for messages from the background script to update the ID
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'setGeneratedID') {
    injectID(request.id);
  }
});
