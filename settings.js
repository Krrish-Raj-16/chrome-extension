var storage = chrome.storage.local;

// Variables that hold the elements from settings.html
var blockedSitesOutput = document.getElementById("blockedSites");
var userInput = document.getElementById("inputLink");
var userEnter = document.getElementById("inputEnter");
var userInputDelete = document.getElementById("inputDeleteLink");
var userEnterDelete = document.getElementById("inputDeleteEnter");

// Event listeners
userEnter.addEventListener("click", addLink);
userEnterDelete.addEventListener("click", deleteLink);

updateOutput();

/*
 * Function: addLink();
 * Description: It will add a link into the blocked list and save it into the
 * local data.
 */
function addLink() {
    var inputValue = userInput.value;
    console.log("<Attempting to add '" + inputValue + "'>");

    // in the case that a user tries to add undefined value.
    if (!inputValue) {
        alert("This is empty!");
        return;
    }

    storage.get("links", function(result) {
        var links = result.links || []; // Initialize as empty array if undefined

        // checks if it's already in the list.
        if (links.includes(inputValue)) {
            alert("It is already in the list!");
            return;
        }

        // if not, push it into the list
        links.push(inputValue);

        // save it into the local storage.
        storage.set({ "links": links }, function() {
            console.log("<Successfully added '" + inputValue + "'>");
            updateOutput();
        });
    });
}

/*
 * Function: deleteLink();
 * Description: It will delete a link from the blocked list and save it into
 * the local data.
 */
function deleteLink() {
    var deleteValue = userInputDelete.value;
    console.log("<Attempting to delete '" + deleteValue + "'>");

    // if input was empty,
    if (!deleteValue) {
        alert("This is empty!");
        return;
    }

    storage.get("links", function(result) {
        var links = result.links || []; // Initialize as empty array if undefined

        // find index of the link to delete
        var index = links.indexOf(deleteValue);
        if (index !== -1) {
            // delete it from the list
            links.splice(index, 1);
            console.log("<Successfully deleted '" + deleteValue + "'>");

            // save it into the local storage.
            storage.set({ "links": links }, function() {
                console.log(links);
                updateOutput();
            });
        } else {
            alert("Link not found in the list!");
        }
    });
}

/*
 * Function: updateOutput();
 * Description: The function changes the data that displays the blocked 
 * URLs to the user.
 */
function updateOutput() {
    storage.get("links", function(data) {
        // create a new list
        var list = document.createElement('ul');

        // takes list from local data and save it to the new list.
        var links = data.links || []; // Initialize as empty array if undefined
        for (var index in links) {
            var listItem = document.createElement('li');
            listItem.appendChild(document.createTextNode(links[index]));
            list.appendChild(listItem);
        }

        // set the inner HTML to the new list.
        blockedSitesOutput.innerHTML = list.innerHTML;
    });
}
