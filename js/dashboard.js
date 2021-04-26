/* Global Variables */
let cloud = window.location.hostname.split('.')[0]
let cloudURL = `https://${cloud}.team22.sweispring21.tk`

// General main func once documents finished loading
$(() => {
    // This function checks to see if there is credentials saved. If so just direct them to the dashboard
    fetchLoggedInUser(cloud).then(response => {
        // Success getting user
        if (response.status == 200) {
            $("#usernameLabel").text(response.body.user.username);
        } else {
            console.log("Was unable to get user using cookies.")
            // Failed to get user with token, route them back to login
            window.location.replace(cloudURL + '/login.html')
        }
    }).catch(error => {
        // Error fetching
        console.error("Error fetching: " + error)
        showAlert("There was an error getting information.")
    });

    fetchPlugins();
});

async function fetchPlugins() {
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
            let name = plugin.name.toLowerCase().replace('_', ' ');
            let available = plugin.available;
            let pluginName = name.charAt(0).toUpperCase() + name.slice(1) + " Delivery";
            let buttonText = available ? "Order now!" : "Unavailable";
            let buttonStyle = available ? 'btn-primary' : 'btn-secondary'
            let disableClicking = available ? '' : 'disabled'
            let buttonLink = available ? 'order.html?name=' + plugin.name : ''
            var element =   `<div class="card col p-2 plugin-card">
                                <img src="" class="card-img-top" alt="...">'
                                <div class="card-body">
                                    <h5 class="card-title">${pluginName}</h5>
                                    <a href="${buttonLink}" class="btn ${buttonStyle} w-100" ${disableClicking}>${buttonText}</a>
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