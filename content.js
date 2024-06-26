// Currently, there's no specific functionality required for the content script.
// This can be extended in the future to interact with web pages if needed.

// Example: Sending a message to background script
chrome.runtime.sendMessage({ message: "content_script_loaded" }, response => {
    console.log("Background script responded: ", response);
  });

  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "show_break_reminder") {
        alert("It's time to take a break and do some stretches!");
    }
});


function showBreakReminder() {
    const reminderDiv = document.createElement("div");
    reminderDiv.style.position = "fixed";
    reminderDiv.style.top = "20px";
    reminderDiv.style.right = "20px";
    reminderDiv.style.width = "300px";
    reminderDiv.style.padding = "20px";
    reminderDiv.style.backgroundColor = "white";
    reminderDiv.style.border = "2px solid black";
    reminderDiv.style.zIndex = "10000";
    reminderDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    reminderDiv.innerHTML = `
        <h3>Take a Break!</h3>
        <p>It's time to take a break and do some stretches.</p>
        <button id="showStretchesButton">Show Stretches</button>
    `;

    document.body.appendChild(reminderDiv);

    document.getElementById("showStretchesButton").addEventListener("click", () => {
        window.open(chrome.runtime.getURL('stretches.html'), '_blank', 'width=400,height=600');
    });
}
