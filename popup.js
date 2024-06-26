var stringOff = "Start";
var stringOn = "Stop";

// document.getElementById('setReminder').addEventListener('click', () => {
//   chrome.alarms.create("breakReminder", { periodInMinutes: 60 });
//   alert('Break reminder set for every hour.');
// });

document.addEventListener('DOMContentLoaded', function() {
  var buttonState = document.getElementById("start");
  
  if (!buttonState) {
    console.error('Button element not found');
    return;
  }

  buttonState.addEventListener("click", clickState);

  var storage = chrome.storage.local;

  storage.get("state", function(x) {
    if (x.state == true) {
      buttonState.innerText = stringOn;
    } else {
      buttonState.innerText = stringOff;
    }
  });

  function clickState() {
    storage.get(["state", "time"], function(x) {
      var newState;
  
      // if the state is off, then turn it on (and vice versa).
      if (x.state == false || x.state == undefined) {
        newState = true;
        buttonState.innerText = stringOn;
      } else {
        newState = false;
        buttonState.innerText = stringOff;
      }

      storage.set({"state": newState});
    });
  }
});


//to display current/active site name and its usage

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentUrl = new URL(tab.url).hostname;
  document.getElementById('current-site').innerText = `Current Site: ${currentUrl}`;

  chrome.storage.local.get('usageData', (data) => {
    const usageData = data.usageData || {};
    const totalTime = usageData[currentUrl] || 0;
    document.getElementById('usage').innerText = `Total Usage Today: ${formatTime(totalTime)}`;
  });
});

function formatTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}













// document.addEventListener('DOMContentLoaded', () => {
//     updateSiteUsage();
//     document.getElementById('stretchingExercises').addEventListener('click', showStretchingExercises);
  
//     // Calculate and show average time of usage
//     chrome.storage.local.get('dailyUsage', (data) => {
//       const dailyUsage = data.dailyUsage || {};
//       const totalDays = Object.keys(dailyUsage).length;
//       const totalTime = Object.values(dailyUsage).reduce((a, b) => a + b, 0);
//       const averageTime = totalDays ? (totalTime / totalDays).toFixed(2) : 0;
//       document.getElementById('dailyAverage').textContent = `Average Daily Usage: ${averageTime} minutes`;
//     });
//   });
  
//   function updateSiteUsage() {
//     chrome.storage.local.get('sites', (data) => {
//       const sites = data.sites || {};
//       const sortedSites = Object.entries(sites).sort((a, b) => b[1] - a[1]).slice(0, 5);
//       const siteUsageDiv = document.getElementById('siteUsage');
//       siteUsageDiv.innerHTML = '<h2>Top 5 Sites</h2>';
//       sortedSites.forEach(([site, minutes]) => {
//         siteUsageDiv.innerHTML += `<p>${site}: ${minutes} minutes</p>`;
//       });
//     });
//   }
  
//   function showStretchingExercises() {
//     document.getElementById('thumbnails').style.display = 'block';
//   }
  