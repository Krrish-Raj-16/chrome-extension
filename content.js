// Currently, there's no specific functionality required for the content script.
// This can be extended in the future to interact with web pages if needed.

// Example: Sending a message to background script
chrome.runtime.sendMessage({ message: "content_script_loaded" }, response => {
    console.log("Background script responded: ", response);
  });
  