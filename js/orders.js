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
        } else {
            // Failed to get user with token
            // window.location.replace(cloudURL)
        }
    }).catch(error => {
        // Error fetching
        $("#mainAlert").text("There was an error getting information.")
        console.error("Error fetching: " + error)
    })
})

// Logout button
$(() => {
    $("#logoutButton").click(() => {
        logoutUser();
    });
});