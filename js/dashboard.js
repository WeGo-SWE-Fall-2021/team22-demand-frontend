/* Global Variables */
let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`

// General main func once documents finished loading
$(() => {
    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser(cloud).then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body["username"]);
            fetchPlugins();
        } else {
            console.log("Was unable to get user using cookies.")
            // Failed to get user with token
            // window.location.replace(cloudURL)
        }
    }).catch(error => {
        // Error fetching
        console.error("Error fetching: " + error)
        showAlert("There was an error getting information.")
    });
});

function fetchPlugins() {
    fetch("https://demand.team22.sweispring21.tk/api/v1/demand/plugins?name=all", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
        return Promise.reject(response)
    }).then(json => {
        for (const plugin of json.plugins) {
            let name = plugin.name.toLowerCase();
            let available = plugin.available;
            let pluginName = name.charAt(0).toUpperCase() + name + " Delivery"
            var element =   `<div class="card col p-2 plugin-card">
                                <img src="" class="card-img-top" alt="...">'
                                <div class="card-body">
                                    <h5 class="card-title">${pluginName}</h5>
                                    <a href="#" class="btn btn-primary w-100">Order now!</a>
                                </div> 
                            </div>`
            $("#pluginsContainer > div").append(element)
        }
    }).catch(error => {
        console.error("Error: error fetching plugins.")
        showAlert("There was an error getting plugins: " + error)
    });
}

function showAlert(text) {
    $("#main").removeClass('nav-height-padding').addClass('alert-height-with-nav-padding');
    $("#mainAlert").removeClass('d-none').text(text);
}

function hideAlert(text) {
    $("#main").addClass('nav-height-padding').removeClass('alert-height-with-nav-padding');
    $("#mainAlert").removeClass('d-none').text(text);
}

// Logout button
$(() => {
    $("#logoutButton").click(() => {
        logoutUser();
    });
});