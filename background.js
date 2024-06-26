var storage = chrome.storage.local; // the storage where data is saved.
var state, links, time, totalSeconds; // local vars that hold storage values

function blockSite() 
{
    chrome.tabs.update({url: "./html/restrict.html"})
}

/*
 * Function: checkSite()
 * Description: It takes in the current tab and checks if its in the list
 * of blocked websites. If it is not part of the list, then it does nothing
 * and returns. If it is, then we redirect the user to the blockedSite.html.
 */
function checkSite() 
{
    chrome.storage.local.get(["state","links"], function(data) 
    {

        // Gets the data from the local storage
        state = data.state;
        links = data.links ||  [];
        //distractions = data.distractions;
        // If not active productive session, then continue as normal.
        if(!state) return;

        chrome.tabs.query({active:true, lastFocusedWindow: true}, tabs => 
        {
        if (tabs.length == 0) return;
        let url = tabs[0].url;
        if (url.includes("html/restrict.html")) return;
            // checks every entry for a blocked URL.
            for(index=0; index< links.length; index++) 
            {

                // check if there is a URL and if it should be blocked
                if (url && url.includes(links[index])) 
                {
                    // This link shows when wanting to add a link to the blocked list
                    if (url.includes("settings.html?add_link=" + links[index])) return;

                    // This will update the tab to not go to the blocked URL.
                    blockSite();
                        
                    return;
                }
            }
        });
    })
}

chrome.tabs.onActivated.addListener(checkSite);
chrome.tabs.onUpdated.addListener(checkSite);

// Initialize the state and links in storage if not already set
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.local.get(["state", "links"], function(data) {
        if (typeof data.state === "undefined") {
            chrome.storage.local.set({state: false});
        }
        if (typeof data.links === "undefined") {
            chrome.storage.local.set({links: []});
        }
    });
});

// to store all tabs hostname and their usage time

let activeTabId = null;
let activeTabUrl = null;
let startTime = null;
let usageData = {};

// Helper function to extract hostname safely
function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
}

async function updateUsage(url, duration) {
  if (url) {
    if (!usageData[url]) {
      usageData[url] = 0;
    }
    usageData[url] += duration;
    await chrome.storage.local.set({ usageData });
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  if (activeTabId !== null) {
    await updateUsage(activeTabUrl, new Date() - startTime);
  }
  const tab = await chrome.tabs.get(activeInfo.tabId);
  activeTabId = activeInfo.tabId;
  activeTabUrl = getHostname(tab.url);
  if (activeTabUrl) {
    startTime = new Date();
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    await updateUsage(activeTabUrl, new Date() - startTime);
    activeTabUrl = getHostname(changeInfo.url);
    if (activeTabUrl) {
      startTime = new Date();
    }
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (activeTabId !== null) {
      await updateUsage(activeTabUrl, new Date() - startTime);
      activeTabId = null;
      activeTabUrl = null;
      startTime = null;
    }
  } else {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) {
      if (activeTabId !== null) {
        await updateUsage(activeTabUrl, new Date() - startTime);
      }
      activeTabId = tab.id;
      activeTabUrl = getHostname(tab.url);
      if (activeTabUrl) {
        startTime = new Date();
      }
    }
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get('usageData', (data) => {
    usageData = data.usageData || {};
  });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('usageData', (data) => {
    usageData = data.usageData || {};
  });
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (tabId === activeTabId) {
    await updateUsage(activeTabUrl, new Date() - startTime);
    activeTabId = null;
    activeTabUrl = null;
    startTime = null;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    await updateUsage(activeTabUrl, new Date() - startTime);
    activeTabUrl = getHostname(changeInfo.url);
    if (activeTabUrl) {
      startTime = new Date();
    }
  }
});

// for break reminders

function showBreakReminder() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {type: "show_break_reminder"});
      } else {
          console.error("No active tab found.");
      }
  });
}

// Set a timer to call showBreakReminder every hour
setInterval(showBreakReminder, 60 * 60 * 1000);