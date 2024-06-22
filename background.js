var storage = chrome.storage.local; // the storage where data is saved.
var state, links, time, totalSeconds; // local vars that hold storage values

function blockSite() 
{
    chrome.tabs.update({url: "../html/restrict.html"})
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
        links = data.links;
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













// // Initialize storage for tracking time
// chrome.runtime.onInstalled.addListener(() => {
//     chrome.storage.local.set({ sites: {}, totalMinutes: 0, dailyUsage: {} });
//     // Set an alarm to trigger every minute
//     chrome.alarms.create('trackTime', { periodInMinutes: 1 });
//     // Set an alarm to remind user every hour
//     chrome.alarms.create('hourlyReminder', { periodInMinutes: 60 });
//   });
  
//   // Listener for alarm events
//   chrome.alarms.onAlarm.addListener((alarm) => {
//     if (alarm.name === 'trackTime') {
//       trackTime();
//     } else if (alarm.name === 'hourlyReminder') {
//       sendReminder();
//     }
//   });
  
//   // Function to track time on current tab
//   function trackTime() {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs.length === 0) return;
//       const url = new URL(tabs[0].url);
//       const domain = url.hostname;
      
//       chrome.storage.local.get(['sites', 'totalMinutes', 'dailyUsage'], (data) => {
//         const sites = data.sites || {};
//         const totalMinutes = data.totalMinutes || 0;
//         const dailyUsage = data.dailyUsage || {};
  
//         // Increment time for the current site
//         sites[domain] = (sites[domain] || 0) + 1;
//         dailyUsage[new Date().toLocaleDateString()] = (dailyUsage[new Date().toLocaleDateString()] || 0) + 1;
  
//         chrome.storage.local.set({ 
//           sites: sites, 
//           totalMinutes: totalMinutes + 1, 
//           dailyUsage: dailyUsage 
//         });
//       });
//     });
//   }
  
//   // Function to send hourly reminder
//   function sendReminder() {
//     chrome.notifications.create({
//       type: 'basic',
//       iconUrl: 'icons/icon128.png',
//       title: 'Time for a break!',
//       message: 'Take a glass of water and do some stretches.'
//     });
//   }
  